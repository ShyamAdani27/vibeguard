export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type VulnerabilityType =
  | 'SQL_INJECTION'
  | 'COMMAND_INJECTION'
  | 'HARDCODED_CREDENTIALS'
  | 'AUTH_BYPASS'
  | 'XSS'
  | 'WEAK_AUTHENTICATION'
  | 'INSECURE_AUTHORIZATION'
  | 'SENSITIVE_DATA_EXPOSURE'
  | 'MISSING_INPUT_VALIDATION'
  | 'WEAK_PASSWORD_POLICY'
  | 'INSECURE_CONFIG'
  | 'UNSAFE_EVAL'
  | 'CODE_QUALITY';

export type ProviderHealthStatus = 'AVAILABLE' | 'COOLDOWN' | 'QUOTA_REACHED' | 'DISABLED';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ApprovalActionType =
  | 'MODIFY_SOURCE_FILE'
  | 'DATABASE_MIGRATION'
  | 'INSTALL_PACKAGE'
  | 'READ_SECRETS'
  | 'CHANGE_AUTHENTICATION'
  | 'SECURITY_CONFIG'
  | 'PRODUCTION_DEPLOYMENT';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  language: string;
  githubUrl?: string;
  githubBranch?: string;
  fileCount: number;
  totalLines: number;
  lastScannedAt?: string;
  securityScore: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  path: string;
  name: string;
  content: string;
  size: number;
  isSensitive: boolean;
  language: string;
  updated_at: string;
}

export interface Vulnerability {
  id: string;
  scanId: string;
  projectId: string;
  file: string;
  line: number;
  severity: Severity;
  type: VulnerabilityType;
  title: string;
  description: string;
  why: string;
  risk: string;
  recommendation: string;
  codeSnippet?: string;
  detectedBy: string; // e.g. "Gemini AI", "RuleEngine", "Semgrep Adapter"
  status: 'OPEN' | 'FIXED' | 'IGNORED';
  fixId?: string;
  created_at: string;
}

export interface Scan {
  id: string;
  projectId: string;
  status: 'QUEUED' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  filesScanned: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  securityScore: number;
  previousScore?: number;
  providerUsed: string;
  modelUsed: string;
  vulnerabilities: Vulnerability[];
}

export interface AIFix {
  id: string;
  vulnerabilityId: string;
  projectId: string;
  file: string;
  lineStart: number;
  lineEnd: number;
  originalCode: string;
  proposedCode: string;
  diff: string;
  explanation: string;
  whyThisFix: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'APPLIED';
  provider: string;
  created_at: string;
  applied_at?: string;
}

export interface ApprovalRequest {
  id: string;
  projectId: string;
  projectName: string;
  fixId?: string;
  actionType: ApprovalActionType;
  targetFile: string;
  riskLevel: Severity;
  title: string;
  reason: string;
  beforeCode?: string;
  afterCode?: string;
  status: ApprovalStatus;
  requestedBy: string;
  decidedBy?: string;
  decidedAt?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  projectId?: string;
  projectName?: string;
  file?: string;
  risk: Severity;
  decision: 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'SCAN_COMPLETED' | 'PROMPT_CHECKED';
  provider?: string;
  details?: string;
  timestamp: string;
}

export interface AIProviderConfig {
  id: string;
  name: string;
  displayName: string;
  model: string;
  status: ProviderHealthStatus;
  priority: number;
  requestCount: number;
  errorCount: number;
  lastUsed?: string;
  cooldownUntil?: string;
  hasApiKey: boolean;
}

export interface AIUsageRecord {
  id: string;
  providerId: string;
  promptTokens?: number;
  completionTokens?: number;
  costEstimate?: number;
  durationMs: number;
  status: 'SUCCESS' | 'ERROR';
  timestamp: string;
}

export interface PreCodeScanResult {
  prompt: string;
  riskScore: number; // 0 - 100
  riskLevel: Severity;
  detectedCategories: {
    category: string;
    severity: Severity;
    description: string;
    guidance: string;
  }[];
  mitigationPrompt: string;
  providerUsed: string;
}

export interface SecurityReport {
  projectId: string;
  projectName: string;
  generatedAt: string;
  scanDate: string;
  scanDurationSeconds: number;
  filesScanned: number;
  securityScoreBefore: number;
  securityScoreAfter: number;
  issuesBefore: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  issuesAfter: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  issuesFixed: number;
  issuesOpen: number;
  aiProvidersUsed: string[];
  securityToolsUsed: string[];
  appliedFixes: {
    id: string;
    file: string;
    vulnerability: string;
    appliedAt: string;
  }[];
  approvalsHistory: ApprovalRequest[];
}
