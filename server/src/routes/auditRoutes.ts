import { Router } from 'express';
import { memoryStore } from '../supabase/client.js';

const router = Router();

// Get audit logs
router.get('/', (req, res) => {
  const projectId = req.query.projectId as string;
  let logs = memoryStore.auditLogs;

  if (projectId) {
    logs = logs.filter(l => l.projectId === projectId);
  }

  res.json({ success: true, logs });
});

export default router;
