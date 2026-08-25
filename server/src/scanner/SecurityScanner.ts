import { v4 as uuidv4 } from 'uuid';
import { aiRouter } from '../router/AIRouter.js';
import { runStaticRules } from './ruleEngine.js';
import { detectSecrets } from './secretDetector.js';
import { calculateSecurityScore } from './scoreCalculator.js';
import { memoryStore } from '../supabase/client.js';
import { ProjectFile, Scan, Vulnerability } from '../types/index.js';

export class SecurityScanner {
  // Ignored patterns
  private ignoredPatterns = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.cache',
    'coverage',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '.DS_Store'
  ];

  public filterScannableFiles(files: ProjectFile[]): ProjectFile[] {
    return files.filter(f => {
      const p = f.path.replace(/\\/g, '/');
      const isIgnored = this.ignoredPatterns.some(pattern => p.includes(pattern));
      const isBinary = /\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|pdf|zip|tar|gz)$/i.test(p);
      return !isIgnored && !isBinary;
    });
  }

  public async scanProject(projectId: string): Promise<Scan> {
    const project = memoryStore.projects.get(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const allFiles = memoryStore.files.get(projectId) || [];
    const scannableFiles = this.filterScannableFiles(allFiles);

    const scanId = uuidv4();
    const startTime = Date.now();

    console.log(`[Security Scanner] Starting scan for project "${project.name}" (${scannableFiles.length} files)...`);

    // 1. Secret Detection
    const secretFindings: Omit<Vulnerability, 'id' | 'scanId' | 'projectId' | 'created_at'>[] = [];
    for (const file of scannableFiles) {
      const secrets = detectSecrets(file.path, file.content);
      secrets.forEach(sec => {
        secretFindings.push({
          file: sec.file,
          line: sec.line,
          severity: 'CRITICAL',
          type: 'HARDCODED_CREDENTIALS',
          title: `Exposed ${sec.type}`,
          description: `Detected plaintext credential matching ${sec.type} pattern in source file.`,
          why: 'Exposed secrets can be harvested by automated threat actors scraping repositories or build logs.',
          risk: 'Direct unauthorized access to third-party services and private infrastructure.',
          recommendation: 'Revoke this credential immediately and load it strictly from secure environment variables.',
          codeSnippet: sec.snippet,
          detectedBy: 'VibeGuard Secret Scanner',
          status: 'OPEN'
        });
      });
    }

    // 2. Static Security Rules
    const staticResults = runStaticRules(scannableFiles);

    // 3. AI Security Analysis via AI Router
    const aiAnalysis = await aiRouter.routeCodeAnalysis({
      projectId,
      files: scannableFiles.map(f => ({
        path: f.path,
        content: f.content,
        language: f.language
      }))
    });

    // 4. Merge & Deduplicate Findings
    const allRawFindings = [
      ...secretFindings,
      ...staticResults.vulnerabilities,
      ...aiAnalysis.findings
    ];

    const deduplicatedFindings: Vulnerability[] = [];
    const seenKeys = new Set<string>();

    for (const raw of allRawFindings) {
      const key = `${raw.file}:${raw.line}:${raw.type}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        const vuln: Vulnerability = {
          ...raw,
          id: uuidv4(),
          scanId,
          projectId,
          created_at: new Date().toISOString()
        };
        deduplicatedFindings.push(vuln);
        memoryStore.vulnerabilities.set(vuln.id, vuln);
      }
    }

    // 5. Score Calculation
    const { score, counts } = calculateSecurityScore(deduplicatedFindings);
    const durationMs = Date.now() - startTime;

    const previousScore = project.securityScore;
    project.securityScore = score;
    project.lastScannedAt = new Date().toISOString();
    project.updated_at = new Date().toISOString();

    const scanRecord: Scan = {
      id: scanId,
      projectId,
      status: 'COMPLETED',
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs,
      filesScanned: scannableFiles.length,
      criticalCount: counts.critical,
      highCount: counts.high,
      mediumCount: counts.medium,
      lowCount: counts.low,
      securityScore: score,
      previousScore,
      providerUsed: aiAnalysis.providerUsed,
      modelUsed: aiAnalysis.modelUsed,
      vulnerabilities: deduplicatedFindings
    };

    // Store scan record
    const existingScans = memoryStore.scans.get(projectId) || [];
    existingScans.unshift(scanRecord);
    memoryStore.scans.set(projectId, existingScans);

    // Sync metadata & findings to Supabase (Zero-Code-Retention: files remain local)
    memoryStore.syncProjectToSupabase(project);
    memoryStore.syncScanToSupabase(scanRecord, deduplicatedFindings);

    // Audit Log
    memoryStore.auditLogs.unshift({
      id: uuidv4(),
      userId: 'usr_shyam',
      userName: 'Shyam Sundar',
      action: `Scanned Project "${project.name}"`,
      projectId,
      projectName: project.name,
      risk: counts.critical > 0 ? 'CRITICAL' : counts.high > 0 ? 'HIGH' : 'LOW',
      decision: 'SCAN_COMPLETED',
      provider: aiAnalysis.providerUsed,
      details: `Found ${deduplicatedFindings.length} issues (Score: ${score}/100)`,
      timestamp: new Date().toISOString()
    });

    console.log(`[Security Scanner] Scan completed for "${project.name}". Score: ${score}/100, Issues: ${deduplicatedFindings.length}`);
    return scanRecord;
  }
}

export const securityScanner = new SecurityScanner();
