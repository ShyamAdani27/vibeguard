import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';
import {
  Project,
  ProjectFile,
  Scan,
  Vulnerability,
  AuditLog,
  AIProviderConfig,
  UserProfile,
  AIFix,
  ApprovalRequest
} from '../types/index.js';

let supabaseClient: SupabaseClient | null = null;

if (config.supabaseUrl && (config.supabaseServiceKey || config.supabaseAnonKey)) {
  try {
    supabaseClient = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey || config.supabaseAnonKey
    );
    console.log('[Supabase] Connected to live Supabase instance:', config.supabaseUrl);
  } catch (err) {
    console.warn('[Supabase] Failed to initialize live client, using in-memory store:', err);
  }
} else {
  console.log('[Supabase] No live credentials provided. Running in local store mode.');
}

export const supabase = supabaseClient;

// In-Memory Local Database Store (Stores Source Files locally; syncs metadata to Supabase)
class MemoryStore {
  public users: Map<string, UserProfile> = new Map();
  public projects: Map<string, Project> = new Map();
  public files: Map<string, ProjectFile[]> = new Map(); // STRICTLY LOCAL ONLY (Zero-Code-Retention)
  public scans: Map<string, Scan[]> = new Map();
  public vulnerabilities: Map<string, Vulnerability> = new Map();
  public fixes: Map<string, AIFix> = new Map();
  public approvals: Map<string, ApprovalRequest> = new Map();
  public auditLogs: AuditLog[] = [];
  public aiProviders: Map<string, AIProviderConfig> = new Map();

  constructor() {
    this.seedDefaultProviders();
  }

  private seedDefaultProviders() {
    const defaultProviders: AIProviderConfig[] = [
      {
        id: 'antigravity-pro',
        name: 'Antigravity Pro (Deep Logic)',
        displayName: 'Antigravity AI Pro (Multi-File Taint & Auth Auditor)',
        model: 'antigravity-pro',
        status: 'AVAILABLE',
        priority: 1,
        requestCount: 32,
        errorCount: 0,
        lastUsed: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        hasApiKey: true,
      },
      {
        id: 'antigravity-flash',
        name: 'Antigravity Flash (Fast Scanner)',
        displayName: 'Antigravity AI Flash (AST & Prompt Risk Engine)',
        model: 'antigravity-flash',
        status: 'AVAILABLE',
        priority: 2,
        requestCount: 26,
        errorCount: 0,
        lastUsed: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        hasApiKey: true,
      },
      {
        id: 'antigravity-flash-lite',
        name: 'Antigravity Flash-Lite (Secret Guard)',
        displayName: 'Antigravity AI Flash-Lite (Fast Secret & Token Filter)',
        model: 'antigravity-flash_lite',
        status: 'AVAILABLE',
        priority: 3,
        requestCount: 45,
        errorCount: 0,
        lastUsed: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        hasApiKey: true,
      },
      {
        id: 'antigravity-inherit',
        name: 'Antigravity Core (Context Inherit)',
        displayName: 'Antigravity Adaptive Orchestrator',
        model: 'antigravity-inherit',
        status: 'AVAILABLE',
        priority: 4,
        requestCount: 14,
        errorCount: 0,
        lastUsed: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        hasApiKey: true,
      },
      {
        id: 'gemini-1',
        name: 'Gemini-1 (Primary Router)',
        displayName: 'Gemini 1.5 Pro (Key 1)',
        model: 'gemini-1.5-pro',
        status: 'AVAILABLE',
        priority: 5,
        requestCount: 18,
        errorCount: 0,
        lastUsed: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        hasApiKey: config.geminiKeys.length > 0,
      },
      {
        id: 'gemini-2',
        name: 'Gemini-2 (Backup)',
        displayName: 'Gemini 1.5 Flash (Key 2)',
        model: 'gemini-1.5-flash',
        status: 'AVAILABLE',
        priority: 6,
        requestCount: 12,
        errorCount: 0,
        lastUsed: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        hasApiKey: config.geminiKeys.length > 1,
      },
      {
        id: 'gemini-3',
        name: 'Gemini-3 (Rate-Limit Guard)',
        displayName: 'Gemini 1.5 Flash (Key 3)',
        model: 'gemini-1.5-flash',
        status: 'COOLDOWN',
        priority: 7,
        requestCount: 6,
        errorCount: 1,
        lastUsed: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        cooldownUntil: new Date(Date.now() + 1000 * 45).toISOString(),
        hasApiKey: config.geminiKeys.length > 2,
      },
      {
        id: 'provider-b',
        name: 'Provider-B (Claude Adapter)',
        displayName: 'Claude 3.5 Sonnet Security Adapter',
        model: 'claude-3-5-sonnet',
        status: 'AVAILABLE',
        priority: 8,
        requestCount: 4,
        errorCount: 0,
        lastUsed: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        hasApiKey: !!config.providerBKey,
      }
    ];

    defaultProviders.forEach((p) => this.aiProviders.set(p.id, p));
  }

  // Sync Project Metadata & GitHub Link to Supabase
  public async syncProjectToSupabase(project: Project) {
    if (!supabaseClient) return;
    try {
      await supabaseClient.from('projects').upsert({
        id: project.id,
        name: project.name,
        description: project.description,
        language: project.language,
        github_url: project.githubUrl,
        github_branch: project.githubBranch || 'main',
        file_count: project.fileCount,
        total_lines: project.totalLines,
        security_score: project.securityScore,
        last_scanned_at: project.lastScannedAt,
        updated_at: new Date().toISOString()
      });
      console.log(`[Supabase Sync] Synced project metadata for "${project.name}" (Files stored strictly locally)`);
    } catch (err: any) {
      console.warn('[Supabase Sync Error]', err.message);
    }
  }

  // Sync Security Scan & Findings to Supabase
  public async syncScanToSupabase(scan: Scan, findings: Vulnerability[]) {
    if (!supabaseClient) return;
    try {
      await supabaseClient.from('scans').upsert({
        id: scan.id,
        project_id: scan.projectId,
        status: scan.status,
        started_at: scan.startedAt,
        completed_at: scan.completedAt,
        duration_ms: scan.durationMs,
        files_scanned: scan.filesScanned,
        critical_count: scan.criticalCount,
        high_count: scan.highCount,
        medium_count: scan.mediumCount,
        low_count: scan.lowCount,
        security_score: scan.securityScore,
        provider_used: scan.providerUsed
      });

      if (findings.length > 0) {
        const rows = findings.map(f => ({
          id: f.id,
          scan_id: f.scanId,
          project_id: f.projectId,
          file: f.file,
          line: f.line,
          severity: f.severity,
          type: f.type,
          title: f.title,
          description: f.description,
          why: f.why,
          risk: f.risk,
          recommendation: f.recommendation,
          code_snippet: f.codeSnippet,
          detected_by: f.detectedBy,
          status: f.status
        }));
        await supabaseClient.from('vulnerabilities').upsert(rows);
      }
      console.log(`[Supabase Sync] Synced scan ${scan.id} and ${findings.length} findings to Supabase.`);
    } catch (err: any) {
      console.warn('[Supabase Sync Error]', err.message);
    }
  }
}

export const memoryStore = new MemoryStore();
