import { Router } from 'express';

const router = Router();

const mcpTools = [
  {
    id: 'semgrep-mcp',
    name: 'Semgrep Static Security Analysis',
    status: 'CONNECTED',
    type: 'SAST Engine',
    description: 'Fast, lightweight static analysis for matching security anti-patterns and OWASP Top 10 vulnerabilities.',
    connectedAt: new Date().toISOString(),
    capabilities: ['Taint Analysis', 'Pattern Matching', 'Rule Enforcement']
  },
  {
    id: 'snyk-mcp',
    name: 'Snyk Vulnerability Database',
    status: 'CONNECTED',
    type: 'SCA & CVE Lookup',
    description: 'Real-time CVE scanning for vulnerable open-source dependencies in package.json and lockfiles.',
    connectedAt: new Date().toISOString(),
    capabilities: ['Dependency Auditing', 'CVE Lookup', 'License Compliance']
  },
  {
    id: 'github-mcp',
    name: 'GitHub Security Advisories MCP',
    status: 'CONNECTED',
    type: 'VCS Integration',
    description: 'Native Git repo context, branch analysis, and automated PR security checks.',
    connectedAt: new Date().toISOString(),
    capabilities: ['PR Gatekeeper', 'Commit Scanning', 'Branch Protection']
  }
];

// Get MCP tools status
router.get('/tools', (req, res) => {
  res.json({ success: true, tools: mcpTools });
});

// Toggle MCP tool connection
router.post('/tools/:id/toggle', (req, res) => {
  const tool = mcpTools.find(t => t.id === req.params.id);
  if (!tool) {
    return res.status(404).json({ success: false, error: 'MCP Tool not found' });
  }

  tool.status = tool.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
  res.json({ success: true, tool });
});

export default router;
