import {
  Project,
  ProjectFile,
  Scan,
  Vulnerability,
  AIFix,
  ApprovalRequest,
  AuditLog,
  AIProviderConfig,
  PreCodeScanResult,
  SecurityReport,
  MCPTool,
  UserProfile
} from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(text.startsWith('<!') ? 'API route not available on static host' : text || `HTTP error ${res.status}`);
  }

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  getMe: () => fetchJson<{ success: boolean; user: UserProfile }>('/auth/me'),
  login: (email: string, password?: string) =>
    fetchJson<{ success: boolean; user: UserProfile; token?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  signup: (email: string, name: string, password?: string) =>
    fetchJson<{ success: boolean; user: UserProfile; token?: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, name, password })
    }),

  // Projects
  getProjects: (userId?: string) =>
    fetchJson<{ success: boolean; projects: Project[] }>(
      userId ? `/projects?userId=${encodeURIComponent(userId)}` : '/projects',
      { headers: userId ? { 'x-user-id': userId } : {} }
    ),
  getProject: (id: string) => fetchJson<{ success: boolean; project: Project }>(`/projects/${id}`),
  createProject: (name: string, description: string, language: string) =>
    fetchJson<{ success: boolean; project: Project }>('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description, language })
    }),
  loadSampleProject: () =>
    fetchJson<{ success: boolean; project: Project; files: ProjectFile[] }>('/projects/load-sample', {
      method: 'POST'
    }),
  importGitHubRepo: (params: { repoUrl: string; token?: string; projectName?: string; branch?: string; autoScan?: boolean }) =>
    fetchJson<{ success: boolean; project: Project; fileCount: number; scan?: Scan }>('/projects/import-github', {
      method: 'POST',
      body: JSON.stringify(params)
    }),
  getProjectFiles: (projectId: string) =>
    fetchJson<{ success: boolean; files: ProjectFile[] }>(`/projects/${projectId}/files`),
  getFileContent: (projectId: string, path: string) =>
    fetchJson<{ success: boolean; file: ProjectFile }>(`/projects/${projectId}/file?path=${encodeURIComponent(path)}`),
  updateFileContent: (projectId: string, path: string, content: string) =>
    fetchJson<{ success: boolean; file: ProjectFile }>(`/projects/${projectId}/file`, {
      method: 'PUT',
      body: JSON.stringify({ path, content })
    }),
  uploadZip: async (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/projects/${projectId}/upload-zip`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },
  importFolder: (projectId: string, files: { path: string; content: string }[]) =>
    fetchJson<{ success: boolean; fileCount: number; files: ProjectFile[] }>(`/projects/${projectId}/import-folder`, {
      method: 'POST',
      body: JSON.stringify({ files })
    }),

  // Scanner & Findings
  scanProject: (projectId: string) =>
    fetchJson<{ success: boolean; scan: Scan }>(`/scan/project/${projectId}`, {
      method: 'POST'
    }),
  getProjectScans: (projectId: string) =>
    fetchJson<{ success: boolean; scans: Scan[] }>(`/scan/project/${projectId}/scans`),
  getVulnerabilities: (projectId?: string) =>
    fetchJson<{ success: boolean; vulnerabilities: Vulnerability[] }>(
      projectId ? `/scan/vulnerabilities?projectId=${projectId}` : '/scan/vulnerabilities'
    ),
  getVulnerability: (id: string) =>
    fetchJson<{ success: boolean; vulnerability: Vulnerability }>(`/scan/vulnerabilities/${id}`),

  // Fixes
  generateFix: (vulnerabilityId: string) =>
    fetchJson<{ success: boolean; fix: AIFix; approval: ApprovalRequest }>(`/fixes/generate/${vulnerabilityId}`, {
      method: 'POST'
    }),
  getFix: (id: string) => fetchJson<{ success: boolean; fix: AIFix }>(`/fixes/${id}`),

  // Approvals (Security Gateway)
  getApprovals: (projectId?: string) =>
    fetchJson<{ success: boolean; approvals: ApprovalRequest[] }>(
      projectId ? `/approvals?projectId=${projectId}` : '/approvals'
    ),
  getPendingApprovals: () =>
    fetchJson<{ success: boolean; pending: ApprovalRequest[] }>('/approvals/pending'),
  decideApproval: (id: string, decision: 'APPROVED' | 'REJECTED') =>
    fetchJson<{ success: boolean; approval: ApprovalRequest; newScan?: Scan }>(`/approvals/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision })
    }),

  // Pre-Code Scanner
  scanPrompt: (prompt: string) =>
    fetchJson<PreCodeScanResult & { success: boolean }>('/prompt/scan', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    }),

  // AI Providers
  getAIProviders: () =>
    fetchJson<{ success: boolean; providers: AIProviderConfig[] }>('/ai-providers'),
  updateProviderStatus: (id: string, status: string, cooldownSeconds?: number) =>
    fetchJson<{ success: boolean; provider: AIProviderConfig }>(`/ai-providers/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, cooldownSeconds })
    }),
  saveProviderApiKey: (id: string, apiKey: string) =>
    fetchJson<{ success: boolean; provider: AIProviderConfig; message: string }>(`/ai-providers/${id}/api-key`, {
      method: 'POST',
      body: JSON.stringify({ apiKey })
    }),

  // MCP Tools
  getMCPTools: () => fetchJson<{ success: boolean; tools: MCPTool[] }>('/mcp/tools'),
  toggleMCPTool: (id: string) =>
    fetchJson<{ success: boolean; tool: MCPTool }>(`/mcp/tools/${id}/toggle`, {
      method: 'POST'
    }),

  // Advanced Deep Scanners
  scanDependencies: (projectId: string) =>
    fetchJson<{
      success: boolean;
      totalDependencies: number;
      vulnerableCount: number;
      criticalCount: number;
      highCount: number;
      mediumCount: number;
      lowCount: number;
      findings: any[];
    }>(`/scan/sca/${projectId}`, { method: 'POST' }),

  scanIaC: (projectId: string) =>
    fetchJson<{
      success: boolean;
      filesAudited: number;
      totalFindings: number;
      criticalCount: number;
      highCount: number;
      mediumCount: number;
      lowCount: number;
      postureScore: number;
      findings: any[];
    }>(`/scan/iac/${projectId}`, { method: 'POST' }),

  getTaintGraphs: (projectId: string) =>
    fetchJson<{ success: boolean; graphs: any[] }>(`/scan/taint-graphs/${projectId}`),

  scanPromptSecurity: (prompt: string, tier?: string) =>
    fetchJson<{
      success: boolean;
      prompt: string;
      safetyScore: number;
      threatLevel: string;
      vulnerabilities: any[];
      mitigatedPrompt: string;
      analyzerTier: string;
    }>('/scan/prompt-security', {
      method: 'POST',
      body: JSON.stringify({ prompt, tier })
    }),

  // Audit Logs
  getAuditLogs: (projectId?: string) =>
    fetchJson<{ success: boolean; logs: AuditLog[] }>(
      projectId ? `/audit-logs?projectId=${projectId}` : '/audit-logs'
    ),

  // Reports
  getSecurityReport: (projectId: string) =>
    fetchJson<{ success: boolean; report: SecurityReport }>(`/reports/${projectId}`),
  exportReportPDF: (projectId: string) =>
    fetchJson<{ success: boolean; message: string; reportUrl?: string }>(`/reports/${projectId}/export-pdf`, {
      method: 'POST'
    })
};
