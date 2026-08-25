export interface IaCFinding {
  id: string;
  file: string;
  line: number;
  resource: string;
  category: 'CONTAINER_SECURITY' | 'EXPOSED_PORTS' | 'SECRET_IN_CONFIG' | 'CI_CD_WORKFLOW' | 'PRIVILEGE_ESCALATION';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  impact: string;
  remediation: string;
  codeSnippet: string;
  standard: string;
}

export interface IaCScanResult {
  filesAudited: number;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  postureScore: number;
  findings: IaCFinding[];
}

export function scanInfrastructureAsCode(files: { path: string; content: string }[]): IaCScanResult {
  const findings: IaCFinding[] = [];
  let filesAudited = 0;

  for (const file of files) {
    const filename = file.path.split('/').pop() || file.path;
    const lowerPath = file.path.toLowerCase();

    // 1. Dockerfile / Containerfile Audit
    if (filename.toLowerCase().includes('dockerfile') || filename.toLowerCase().endsWith('.dockerfile')) {
      filesAudited++;
      const lines = file.content.split('\n');
      let hasUserInstruction = false;

      lines.forEach((line, idx) => {
        const lineNum = idx + 1;
        const trimmed = line.trim();

        if (/^USER\s+/i.test(trimmed) && !/USER\s+root/i.test(trimmed)) {
          hasUserInstruction = true;
        }

        // Hardcoded ENV Secret
        if (/^ENV\s+.*(secret|password|api_key|token|auth_key)\s*=/i.test(trimmed) && !trimmed.includes('YOUR_')) {
          findings.push({
            id: `iac_${Date.now()}_${findings.length}`,
            file: file.path,
            line: lineNum,
            resource: 'Dockerfile ENV Instruction',
            category: 'SECRET_IN_CONFIG',
            severity: 'CRITICAL',
            title: 'Hardcoded Secret in Docker Container Layer',
            description: 'Sensitive credential or secret key embedded directly in Docker image layers.',
            impact: 'Anyone with access to the Docker image or registry can inspect and extract the plaintext secret.',
            remediation: 'Pass secrets at runtime using Docker BuildKit secrets (`--secret`) or environment variables.',
            codeSnippet: trimmed,
            standard: 'CIS Docker Benchmark 1.1'
          });
        }

        // Dangerous Port Exposure
        if (/^EXPOSE\s+.*(22|5432|3306|27017|6379)/i.test(trimmed)) {
          findings.push({
            id: `iac_${Date.now()}_${findings.length}`,
            file: file.path,
            line: lineNum,
            resource: 'Dockerfile Port Config',
            category: 'EXPOSED_PORTS',
            severity: 'HIGH',
            title: 'Sensitive Database / Management Port Exposed',
            description: 'Direct container exposure of internal management ports (SSH, Postgres, MySQL, Redis).',
            impact: 'Exposes internal services to public network scans and automated credential brute-forcing.',
            remediation: 'Do not expose database ports publicly; communicate over internal Docker bridge networks.',
            codeSnippet: trimmed,
            standard: 'CIS Docker Benchmark 4.5'
          });
        }

        // Unpinned Base Image
        if (/^FROM\s+.*:latest/i.test(trimmed)) {
          findings.push({
            id: `iac_${Date.now()}_${findings.length}`,
            file: file.path,
            line: lineNum,
            resource: 'Dockerfile Base Image',
            category: 'CONTAINER_SECURITY',
            severity: 'MEDIUM',
            title: 'Unpinned Base Image Tag (`:latest`)',
            description: 'Container uses mutable `:latest` tag instead of deterministic digest or version pin.',
            impact: 'Non-reproducible builds and automatic ingestion of upstream breaking changes or vulnerabilities.',
            remediation: 'Pin the image tag with specific semantic versions or SHA256 hashes (e.g. `node:20.11.0-alpine`).',
            codeSnippet: trimmed,
            standard: 'NIST SP 800-190'
          });
        }
      });

      if (!hasUserInstruction) {
        findings.push({
          id: `iac_${Date.now()}_${findings.length}`,
          file: file.path,
          line: 1,
          resource: 'Dockerfile User Configuration',
          category: 'PRIVILEGE_ESCALATION',
          severity: 'HIGH',
          title: 'Container Runs as Root User (Missing Non-Root USER)',
          description: 'No non-root `USER` instruction found; container default process runs with root UID 0 privileges.',
          impact: 'A container escape vulnerability allows an attacker to gain root control over the host OS.',
          remediation: 'Add `RUN adduser -D appuser && USER appuser` before starting the application.',
          codeSnippet: 'Missing: USER node / appuser',
          standard: 'CIS Docker Benchmark 4.1'
        });
      }
    }

    // 2. Docker Compose Audit
    if (filename.includes('docker-compose') && (filename.endsWith('.yml') || filename.endsWith('.yaml'))) {
      filesAudited++;
      const lines = file.content.split('\n');
      lines.forEach((line, idx) => {
        const lineNum = idx + 1;
        const trimmed = line.trim();

        if (/privileged\s*:\s*true/i.test(trimmed)) {
          findings.push({
            id: `iac_${Date.now()}_${findings.length}`,
            file: file.path,
            line: lineNum,
            resource: 'Docker Compose Capability',
            category: 'PRIVILEGE_ESCALATION',
            severity: 'CRITICAL',
            title: 'Privileged Container Mode Enabled',
            description: 'Container given full kernel capabilities and access to host devices.',
            impact: 'Trivial container breakout giving the attacker direct host root execution.',
            remediation: 'Remove `privileged: true` and specify only required granular Linux capabilities (`cap_add`).',
            codeSnippet: trimmed,
            standard: 'CIS Docker Benchmark 5.2'
          });
        }

        if (/["']?0\.0\.0\.0:(5432|3306|27017|6379):/i.test(trimmed)) {
          findings.push({
            id: `iac_${Date.now()}_${findings.length}`,
            file: file.path,
            line: lineNum,
            resource: 'Docker Compose Port Binding',
            category: 'EXPOSED_PORTS',
            severity: 'HIGH',
            title: 'Database Bound to All Host Interfaces (0.0.0.0)',
            description: 'Database port bound globally to 0.0.0.0 instead of localhost (127.0.0.1).',
            impact: 'Database reachable from outside the VPS/host machine.',
            remediation: 'Bind to localhost only: `127.0.0.1:5432:5432`.',
            codeSnippet: trimmed,
            standard: 'CIS Docker Benchmark 5.7'
          });
        }
      });
    }

    // 3. GitHub Actions CI/CD Audit
    if (lowerPath.includes('.github/workflows/') && (filename.endsWith('.yml') || filename.endsWith('.yaml'))) {
      filesAudited++;
      const lines = file.content.split('\n');
      lines.forEach((line, idx) => {
        const lineNum = idx + 1;
        const trimmed = line.trim();

        if (/pull_request_target/i.test(trimmed)) {
          findings.push({
            id: `iac_${Date.now()}_${findings.length}`,
            file: file.path,
            line: lineNum,
            resource: 'GitHub Action Trigger',
            category: 'CI_CD_WORKFLOW',
            severity: 'CRITICAL',
            title: 'Dangerous `pull_request_target` Trigger in GitHub Actions',
            description: '`pull_request_target` runs in the context of the base repository with write permissions and secret access.',
            impact: 'Untrusted pull requests can execute malicious code with access to production deployment secrets.',
            remediation: 'Use `pull_request` trigger instead or avoid checking out PR head code in target workflows.',
            codeSnippet: trimmed,
            standard: 'OpenSSF Scorecard Benchmark'
          });
        }
      });
    }
  }

  const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = findings.filter(f => f.severity === 'HIGH').length;
  const mediumCount = findings.filter(f => f.severity === 'MEDIUM').length;
  const lowCount = findings.filter(f => f.severity === 'LOW').length;

  let postureScore = 100 - (criticalCount * 25 + highCount * 12 + mediumCount * 5 + lowCount * 2);
  postureScore = Math.max(10, Math.min(100, postureScore));

  return {
    filesAudited,
    totalFindings: findings.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    postureScore,
    findings
  };
}
