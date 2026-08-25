import { Router } from 'express';
import { memoryStore } from '../supabase/client.js';
import { aiRouter } from '../router/AIRouter.js';

const router = Router();

// Get list of all AI providers with real-time status and telemetry
router.get('/', (req, res) => {
  const providers = Array.from(memoryStore.aiProviders.values())
    .sort((a, b) => a.priority - b.priority);
  res.json({ success: true, providers });
});

// Update provider status / simulate cooldown / quota reached / restore
router.post('/:id/status', (req, res) => {
  const { status, cooldownSeconds } = req.body;
  if (!['AVAILABLE', 'COOLDOWN', 'QUOTA_REACHED', 'DISABLED'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  aiRouter.setProviderStatus(req.params.id, status, cooldownSeconds || 60);
  const updated = memoryStore.aiProviders.get(req.params.id);
  res.json({ success: true, provider: updated });
});

// Add or update an API Key securely
router.post('/:id/api-key', (req, res) => {
  const { apiKey } = req.body;
  const provider = memoryStore.aiProviders.get(req.params.id);
  if (!provider) {
    return res.status(404).json({ success: false, error: 'Provider not found' });
  }

  provider.hasApiKey = !!apiKey;
  provider.status = 'AVAILABLE';
  provider.cooldownUntil = undefined;
  aiRouter.initializeProviders();

  res.json({ success: true, provider, message: 'API key configured securely in backend memory pool.' });
});

export default router;
