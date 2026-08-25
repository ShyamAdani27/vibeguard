import { Router } from 'express';
import { securityScanner } from '../scanner/SecurityScanner.js';
import { memoryStore } from '../supabase/client.js';

const router = Router();

// Scan Project
router.post('/project/:id', async (req, res) => {
  try {
    const scan = await securityScanner.scanProject(req.params.id);
    res.json({ success: true, scan });
  } catch (err: any) {
    console.error('[Scan Route Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get latest scan / history for a project
router.get('/project/:id/scans', (req, res) => {
  const scans = memoryStore.scans.get(req.params.id) || [];
  res.json({ success: true, scans });
});

// Get all vulnerabilities (global or filtered by project)
router.get('/vulnerabilities', (req, res) => {
  const projectId = req.query.projectId as string;
  let vulns = Array.from(memoryStore.vulnerabilities.values());

  if (projectId) {
    vulns = vulns.filter(v => v.projectId === projectId);
  }

  res.json({ success: true, vulnerabilities: vulns });
});

// Get single vulnerability
router.get('/vulnerabilities/:id', (req, res) => {
  const vuln = memoryStore.vulnerabilities.get(req.params.id);
  if (!vuln) {
    return res.status(404).json({ success: false, error: 'Vulnerability not found' });
  }
  res.json({ success: true, vulnerability: vuln });
});

export default router;
