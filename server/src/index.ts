import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { projectService } from './services/projectService.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import fixRoutes from './routes/fixRoutes.js';
import approvalRoutes from './routes/approvalRoutes.js';
import promptRoutes from './routes/promptRoutes.js';
import aiProviderRoutes from './routes/aiProviderRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request Logger
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'VibeGuard',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/fixes', fixRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/prompt', promptRoutes);
app.use('/api/ai-providers', aiProviderRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/reports', reportRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Seed default "College E-Commerce" demo project on startup
try {
  projectService.loadSampleCollegeEcommerce();
  console.log('[Bootstrap] Initialized "College E-Commerce" sample project.');
} catch (e) {
  console.error('[Bootstrap] Failed to seed sample project:', e);
}

// Start Server
app.listen(config.port, () => {
  console.log(`
🛡️  ======================================================
🛡️   VibeGuard Backend Server Running on http://localhost:${config.port}
🛡️   Mode: ${config.nodeEnv} | Multi-AI Router: Active
🛡️  ======================================================
  `);
});
