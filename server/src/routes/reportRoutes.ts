import { Router } from 'express';
import { reportService } from '../services/reportService.js';

const router = Router();

// Generate security report for a project
router.get('/:projectId', (req, res) => {
  try {
    const report = reportService.generateReport(req.params.projectId);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

export default router;
