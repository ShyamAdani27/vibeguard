import { v4 as uuidv4 } from 'uuid';
import AdmZip from 'adm-zip';
import path from 'path';
import { memoryStore } from '../supabase/client.js';
import { Project, ProjectFile } from '../types/index.js';

export class ProjectService {
  private detectLanguage(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
      case '.js':
      case '.jsx':
        return 'javascript';
      case '.ts':
      case '.tsx':
        return 'typescript';
      case '.py':
        return 'python';
      case '.json':
        return 'json';
      case '.sql':
        return 'sql';
      case '.html':
        return 'html';
      case '.css':
        return 'css';
      case '.env':
      case '.example':
        return 'plaintext';
      default:
        return 'plaintext';
    }
  }

  public createProject(
    name: string,
    description: string,
    language: string = 'JavaScript',
    userId: string = 'usr_shyam',
    githubUrl?: string,
    githubBranch?: string
  ): Project {
    const projectId = uuidv4();
    const newProject: Project = {
      id: projectId,
      userId,
      name,
      description,
      language,
      githubUrl,
      githubBranch,
      fileCount: 0,
      totalLines: 0,
      securityScore: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    memoryStore.projects.set(projectId, newProject);
    memoryStore.files.set(projectId, []);

    // Audit log
    memoryStore.auditLogs.unshift({
      id: uuidv4(),
      userId,
      userName: 'Shyam Sundar',
      action: `Created Project "${name}"`,
      projectId,
      projectName: name,
      risk: 'LOW',
      decision: 'EXECUTED',
      details: githubUrl ? `GitHub Link: ${githubUrl} (Branch: ${githubBranch || 'main'})` : `Language: ${language}`,
      timestamp: new Date().toISOString()
    });

    // Sync project metadata to Supabase (files remain strictly in local memory)
    memoryStore.syncProjectToSupabase(newProject);

    return newProject;
  }

  public getProject(projectId: string): Project | undefined {
    return memoryStore.projects.get(projectId);
  }

  public listProjects(userId?: string): Project[] {
    let list = Array.from(memoryStore.projects.values());
    if (userId) {
      list = list.filter(p => p.userId === userId);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getFiles(projectId: string): ProjectFile[] {
    return memoryStore.files.get(projectId) || [];
  }

  public getFileContent(projectId: string, filePath: string): ProjectFile | undefined {
    const files = memoryStore.files.get(projectId) || [];
    return files.find(f => f.path === filePath);
  }

  public updateFileContent(projectId: string, filePath: string, newContent: string): ProjectFile {
    const files = memoryStore.files.get(projectId) || [];
    const file = files.find(f => f.path === filePath);
    if (!file) {
      throw new Error(`File ${filePath} not found in project ${projectId}`);
    }

    file.content = newContent;
    file.size = Buffer.byteLength(newContent, 'utf8');
    file.updated_at = new Date().toISOString();

    const project = memoryStore.projects.get(projectId);
    if (project) {
      project.updated_at = new Date().toISOString();
    }

    return file;
  }

  public async importZip(projectId: string, zipBuffer: Buffer): Promise<{ fileCount: number; files: ProjectFile[] }> {
    const project = memoryStore.projects.get(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();
    const parsedFiles: ProjectFile[] = [];

    let totalLines = 0;

    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;

      let normalizedPath = entry.entryName.replace(/\\/g, '/');
      // Strip common root folder if entire zip is wrapped in a top folder
      if (normalizedPath.startsWith('./')) normalizedPath = normalizedPath.substring(2);

      // Path traversal security check
      if (normalizedPath.includes('..')) continue;

      // Ignore unnecessary and binary folders
      if (
        normalizedPath.includes('node_modules/') ||
        normalizedPath.includes('.git/') ||
        normalizedPath.includes('dist/') ||
        normalizedPath.includes('build/') ||
        normalizedPath.includes('.cache/') ||
        normalizedPath.includes('__MACOSX')
      ) {
        continue;
      }

      const content = entry.getData().toString('utf8');
      const lines = content.split('\n').length;
      totalLines += lines;

      const isSensitive = normalizedPath.includes('.env') || normalizedPath.includes('credentials') || normalizedPath.includes('id_rsa');

      parsedFiles.push({
        id: uuidv4(),
        projectId,
        path: normalizedPath,
        name: path.basename(normalizedPath),
        content,
        size: entry.header.size,
        isSensitive,
        language: this.detectLanguage(normalizedPath),
        updated_at: new Date().toISOString()
      });
    }

    memoryStore.files.set(projectId, parsedFiles);

    project.fileCount = parsedFiles.length;
    project.totalLines = totalLines;
    project.updated_at = new Date().toISOString();

    return { fileCount: parsedFiles.length, files: parsedFiles };
  }

  public importFolderFiles(
    projectId: string,
    rawFiles: { path: string; content: string }[]
  ): { fileCount: number; files: ProjectFile[] } {
    const project = memoryStore.projects.get(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const parsedFiles: ProjectFile[] = [];
    let totalLines = 0;

    for (const raw of rawFiles) {
      let normalizedPath = raw.path.replace(/\\/g, '/');
      if (
        normalizedPath.includes('node_modules/') ||
        normalizedPath.includes('.git/') ||
        normalizedPath.includes('dist/') ||
        normalizedPath.includes('build/')
      ) {
        continue;
      }

      const lines = raw.content.split('\n').length;
      totalLines += lines;
      const isSensitive = normalizedPath.includes('.env') || normalizedPath.includes('credentials');

      parsedFiles.push({
        id: uuidv4(),
        projectId,
        path: normalizedPath,
        name: path.basename(normalizedPath),
        content: raw.content,
        size: Buffer.byteLength(raw.content, 'utf8'),
        isSensitive,
        language: this.detectLanguage(normalizedPath),
        updated_at: new Date().toISOString()
      });
    }

    memoryStore.files.set(projectId, parsedFiles);
    project.fileCount = parsedFiles.length;
    project.totalLines = totalLines;
    project.updated_at = new Date().toISOString();

    return { fileCount: parsedFiles.length, files: parsedFiles };
  }

  public loadSampleCollegeEcommerce(userId: string = 'usr_shyam'): Project {
    const existing = Array.from(memoryStore.projects.values()).find(p => p.name === 'College E-Commerce');
    if (existing) {
      return existing;
    }

    const projectId = 'proj_college_ecommerce';
    const project: Project = {
      id: projectId,
      userId,
      name: 'College E-Commerce',
      description: 'Campus marketplace & student merchandise platform built with Node.js and Express.',
      language: 'JavaScript',
      fileCount: 5,
      totalLines: 320,
      securityScore: 42,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const files: ProjectFile[] = [
      {
        id: uuidv4(),
        projectId,
        path: 'src/database.js',
        name: 'database.js',
        language: 'javascript',
        isSensitive: false,
        size: 1420,
        updated_at: new Date().toISOString(),
        content: `// Database connection & query helper
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'college_store'
});

// Search users by name (Vulnerable to SQL Injection)
async function findUserByName(username) {
  // Line 27: Direct concatenation of unsanitized user input into SQL query
  const query = "SELECT * FROM users WHERE name='" + username + "'";
  const [rows] = await pool.query(query);
  return rows;
}

// Get order details
async function getOrder(orderId) {
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
  return rows[0];
}

module.exports = { pool, findUserByName, getOrder };`
      },
      {
        id: uuidv4(),
        projectId,
        path: 'src/auth.js',
        name: 'auth.js',
        language: 'javascript',
        isSensitive: false,
        size: 1850,
        updated_at: new Date().toISOString(),
        content: `// Authentication & token verification middleware
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('./database');

// Hardcoded cryptographic secret key
const JWT_SECRET = "super_secret_master_key_9988_vibeguard";

async function login(req, res) {
  const { username, password } = req.body;
  const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  const user = users[0];

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Weak authentication: Insecure MD5 hashing comparison
  const hash = crypto.createHash('md5').update(password).digest('hex');
  if (hash !== user.password_hash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  return res.json({ token, user: { id: user.id, username: user.username } });
}

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { login, requireAuth, JWT_SECRET };`
      },
      {
        id: uuidv4(),
        projectId,
        path: 'src/routes/api.js',
        name: 'api.js',
        language: 'javascript',
        isSensitive: false,
        size: 1650,
        updated_at: new Date().toISOString(),
        content: `// Main API router
const express = require('express');
const router = express.Router();
const { findUserByName } = require('../database');
const { requireAuth } = require('../auth');

// Reflected XSS vulnerability in search response
router.get('/search', async (req, res) => {
  const { q } = req.query;
  const results = await findUserByName(q);
  // Unsanitized reflection
  res.send("<h1>Search Results for: " + q + "</h1><pre>" + JSON.stringify(results) + "</pre>");
});

// Missing input validation on merchandise order creation
router.post('/orders', requireAuth, async (req, res) => {
  const { productId, quantity, totalAmount } = req.body;
  // Payload processed without schema validation or boundary checks
  res.status(201).json({ status: 'Order created', orderId: Date.now() });
});

module.exports = router;`
      },
      {
        id: uuidv4(),
        projectId,
        path: 'package.json',
        name: 'package.json',
        language: 'json',
        isSensitive: false,
        size: 420,
        updated_at: new Date().toISOString(),
        content: `{
  "name": "college-ecommerce",
  "version": "1.0.0",
  "description": "Campus student merchandise platform",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "mysql2": "^3.2.0"
  }
}`
      },
      {
        id: uuidv4(),
        projectId,
        path: '.env.example',
        name: '.env.example',
        language: 'plaintext',
        isSensitive: true,
        size: 180,
        updated_at: new Date().toISOString(),
        content: `PORT=3000
DB_HOST=localhost
DB_USER=store_user
DB_PASSWORD=your_secure_db_password
JWT_SECRET=your_production_secret_key_here`
      }
    ];

    memoryStore.projects.set(projectId, project);
    memoryStore.files.set(projectId, files);

    return project;
  }
}

export const projectService = new ProjectService();
