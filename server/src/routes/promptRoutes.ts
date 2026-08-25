import { Router } from 'express';
import { promptScanService } from '../services/promptScanService.js';

const router = Router();

// Scan prompt before code generation
router.post('/scan', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ success: false, error: 'Prompt text is required' });
  }

  try {
    const result = await promptScanService.scanPrompt(prompt);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
