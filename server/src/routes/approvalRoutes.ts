import { Router } from 'express';
import { approvalService } from '../services/approvalService.js';

const router = Router();

// List all approvals / filter by project
router.get('/', (req, res) => {
  const projectId = req.query.projectId as string;
  const approvals = approvalService.getAllApprovals(projectId);
  res.json({ success: true, approvals });
});

// List only pending approvals
router.get('/pending', (req, res) => {
  const pending = approvalService.getPendingApprovals();
  res.json({ success: true, pending });
});

// Create manual approval request (e.g. for database migrations, npm install, config changes)
router.post('/request', (req, res) => {
  const { projectId, actionType, targetFile, riskLevel, title, reason, beforeCode, afterCode } = req.body;
  if (!projectId || !actionType || !targetFile || !title) {
    return res.status(400).json({ success: false, error: 'Missing required approval request fields' });
  }

  const approval = approvalService.createApprovalRequest({
    projectId,
    actionType,
    targetFile,
    riskLevel: riskLevel || 'HIGH',
    title,
    reason: reason || 'Sensitive security operation requires confirmation',
    beforeCode,
    afterCode
  });

  res.status(201).json({ success: true, approval });
});

// Decide Approval: Approve or Reject
router.post('/:id/decide', async (req, res) => {
  const { decision, userId, userName } = req.body;
  if (decision !== 'APPROVED' && decision !== 'REJECTED') {
    return res.status(400).json({ success: false, error: 'Decision must be APPROVED or REJECTED' });
  }

  try {
    const result = await approvalService.decideApproval(
      req.params.id,
      decision,
      userId || 'usr_shyam',
      userName || 'Shyam Sundar'
    );
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
