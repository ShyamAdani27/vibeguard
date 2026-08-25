import { Router } from 'express';
import { fixService } from '../services/fixService.js';
import { approvalService } from '../services/approvalService.js';
import { memoryStore } from '../supabase/client.js';

const router = Router();

// Generate AI Fix for a vulnerability
router.post('/generate/:vulnerabilityId', async (req, res) => {
  try {
    const vuln = memoryStore.vulnerabilities.get(req.params.vulnerabilityId);
    if (!vuln) {
      return res.status(404).json({ success: false, error: 'Vulnerability not found' });
    }

    const fix = await fixService.generateFix(req.params.vulnerabilityId);

    // Also automatically register a pending Security Gateway Approval Request
    const approval = approvalService.createApprovalRequest({
      projectId: fix.projectId,
      fixId: fix.id,
      actionType: 'MODIFY_SOURCE_FILE',
      targetFile: fix.file,
      riskLevel: vuln.severity,
      title: `Apply AI Secure Fix for ${vuln.title}`,
      reason: `Fixes ${vuln.type} on line ${vuln.line}: ${fix.explanation}`,
      beforeCode: fix.originalCode,
      afterCode: fix.proposedCode
    });

    res.json({ success: true, fix, approval });
  } catch (err: any) {
    console.error('[Fix Route Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get AI Fix by ID
router.get('/:id', (req, res) => {
  const fix = fixService.getFix(req.params.id);
  if (!fix) {
    return res.status(404).json({ success: false, error: 'Fix not found' });
  }
  res.json({ success: true, fix });
});

export default router;
