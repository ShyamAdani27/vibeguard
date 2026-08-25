import { Router } from 'express';
import multer from 'multer';
import { projectService } from '../services/projectService.js';
import { gitHubService } from '../services/githubService.js';

const router = Router();
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

// List projects
router.get('/', (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
  const projects = projectService.listProjects(userId);
  res.json({ success: true, projects });
});

// Import GitHub Repository & Optional Auto-Scan
router.post('/import-github', async (req, res) => {
  const { repoUrl, token, projectName, branch, autoScan } = req.body;
  if (!repoUrl) {
    return res.status(400).json({ success: false, error: 'GitHub repository URL is required' });
  }

  try {
    const result = await gitHubService.importFromGitHub({
      repoUrl,
      token,
      projectName,
      branch,
      autoScan: autoScan !== false
    });
    res.status(201).json({ success: true, ...result });
  } catch (err: any) {
    console.error('[GitHub Import Route Error]', err);
    res.status(400).json({ success: false, error: err.message || 'Failed to import GitHub repository' });
  }
});

// Load / Seed College E-Commerce Sample Project
router.post('/load-sample', (req, res) => {
  const project = projectService.loadSampleCollegeEcommerce();
  const files = projectService.getFiles(project.id);
  res.json({ success: true, project, files });
});

// Create project
router.post('/', (req, res) => {
  const { name, description, language } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: 'Project name is required' });
  }

  const project = projectService.createProject(name, description || '', language || 'JavaScript');
  res.status(201).json({ success: true, project });
});

// Get project by ID
router.get('/:id', (req, res) => {
  const project = projectService.getProject(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }
  res.json({ success: true, project });
});

// Get project files
router.get('/:id/files', (req, res) => {
  const files = projectService.getFiles(req.params.id);
  res.json({ success: true, files });
});

// Get single file content
router.get('/:id/file', (req, res) => {
  const filePath = req.query.path as string;
  if (!filePath) {
    return res.status(400).json({ success: false, error: 'File path query is required' });
  }

  const file = projectService.getFileContent(req.params.id, filePath);
  if (!file) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }

  res.json({ success: true, file });
});

// Update single file content
router.put('/:id/file', (req, res) => {
  const { path: filePath, content } = req.body;
  if (!filePath || content === undefined) {
    return res.status(400).json({ success: false, error: 'File path and content required' });
  }

  try {
    const updated = projectService.updateFileContent(req.params.id, filePath, content);
    res.json({ success: true, file: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Upload ZIP file
router.post('/:id/upload-zip', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No zip file provided' });
  }

  const projectId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    const result = await projectService.importZip(projectId, req.file.buffer);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Import folder files
router.post('/:id/import-folder', (req, res) => {
  const { files } = req.body;
  if (!Array.isArray(files)) {
    return res.status(400).json({ success: false, error: 'Files array required' });
  }

  const projectId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    const result = projectService.importFolderFiles(projectId, files);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
