import { ProjectFile, Vulnerability, Scan } from '../types';

const GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

// 1. Static AST & Heuristic Rules Engine
function runClientStaticRules(
  files: ProjectFile[]
): Omit<Vulnerability, 'id' | 'scanId' | 'projectId' | 'created_at'>[] {
  const findings: Omit<Vulnerability, 'id' | 'scanId' | 'projectId' | 'created_at'>[] = [];

  for (const file of files) {
    const lines = file.content.split('\n');

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();

      // Skip comments
      if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) return;

      // 1. SQL Injection via String Concatenation / Template Literals (Rule SEC-OWASP-01)
      if (
        ((/(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)\s+.*(\+|\$\{)/i.test(line) ||
          /\b(query|execute|rawQuery)\s*\(\s*['"`].*\$\{/i.test(line) ||
          /\b(query|execute)\s*\(\s*['"`].*['"`]\s*\+/i.test(line)) &&
          !line.includes('?') && !line.includes('$1'))
      ) {
        findings.push({
          file: file.path,
          line: lineNum,
          severity: 'CRITICAL',
          type: 'SQL_INJECTION',
          title: 'Direct SQL String Concatenation Vulnerability',
          description: 'Unescaped user input interpolated directly into a SQL query string.',
          why: 'Allows malicious users to manipulate database query logic, bypass authentication, or extract entire database tables.',
          risk: 'Full database compromise and data breach.',
          recommendation: 'Use parameterized queries, prepared statements, or an ORM like Prisma/TypeORM.',
          codeSnippet: trimmed,
          detectedBy: 'VibeGuard Static Analyzer',
          status: 'OPEN'
        });
      }

      // 2. Arbitrary Code Execution (eval / new Function) (Rule SEC-OWASP-05)
      if (/\beval\(|new\s+Function\(/.test(line)) {
        findings.push({
          file: file.path,
          line: lineNum,
          severity: 'CRITICAL',
          type: 'UNSAFE_EVAL',
          title: 'Arbitrary Code Execution via eval()',
          description: 'Usage of dynamic code evaluation (`eval` or `Function`) with potentially untrusted strings.',
          why: 'Allows arbitrary JavaScript execution in the runtime environment, leading to remote code execution.',
          risk: 'Complete host takeover and process hijacking.',
          recommendation: 'Refactor to use safe JSON parsing (`JSON.parse`) or structured dispatch tables.',
          codeSnippet: trimmed,
          detectedBy: 'VibeGuard Static Analyzer',
          status: 'OPEN'
        });
      }

      // 3. Command Injection (Rule SEC-OWASP-05)
      if (/child_process\.(exec|execSync)\(/.test(line) || /os\.system\(|subprocess\.Popen\(/.test(line)) {
        findings.push({
          file: file.path,
          line: lineNum,
          severity: 'CRITICAL',
          type: 'COMMAND_INJECTION',
          title: 'OS Command Injection Vulnerability',
          description: 'Spawning shell processes with unescaped command arguments.',
          why: 'Command arguments containing metacharacters (`;`, `&&`, `|`) will be interpreted by the system shell.',
          risk: 'Unauthorized server shell commands execution.',
          recommendation: 'Use `execFile` or `spawn` with an array of arguments, avoiding shell interpolation.',
          codeSnippet: trimmed,
          detectedBy: 'VibeGuard Static Analyzer',
          status: 'OPEN'
        });
      }

      // 4. Cross-Site Scripting (XSS) via innerHTML / dangerouslySetInnerHTML (Rule SEC-OWASP-03)
      if (/dangerouslySetInnerHTML|innerHTML\s*=|document\.write\(/i.test(line)) {
        findings.push({
          file: file.path,
          line: lineNum,
          severity: 'HIGH',
          type: 'XSS',
          title: 'DOM-based Cross-Site Scripting (XSS)',
          description: 'Direct insertion of unescaped HTML content into the DOM.',
          why: 'Allows attackers to inject malicious JavaScript into victim browsers, stealing session cookies or tokens.',
          risk: 'Account hijacking and unauthorized client-side actions.',
          recommendation: 'Use safe text insertion (`textContent`) or sanitize HTML with DOMPurify.',
          codeSnippet: trimmed,
          detectedBy: 'VibeGuard Static Analyzer',
          status: 'OPEN'
        });
      }

      // 5. Insecure CORS Wildcard
      if (/cors\(\s*\{\s*origin\s*:\s*['"]\*['"]\s*,\s*credentials\s*:\s*true/i.test(line) || /header\(['"]Access-Control-Allow-Origin['"],\s*['"]\*['"]\)/i.test(line)) {
        findings.push({
          file: file.path,
          line: lineNum,
          severity: 'HIGH',
          type: 'INSECURE_CONFIG',
          title: 'Overly Permissive CORS Configuration',
          description: 'Wildcard CORS origin configured together with credentials/cookies allowance.',
          why: 'Allows malicious third-party origins to make authenticated cross-origin requests and read sensitive responses.',
          risk: 'Cross-site data theft and session exploitation.',
          recommendation: 'Restrict `Access-Control-Allow-Origin` to an explicit whitelist of trusted domains.',
          codeSnippet: trimmed,
          detectedBy: 'VibeGuard Static Analyzer',
          status: 'OPEN'
        });
      }

      // 6. Weak Password Hashing (MD5 / SHA1)
      if (/crypto\.createHash\(['"](md5|sha1)['"]\)/i.test(line) || /\b(md5|sha1)\(/i.test(line)) {
        findings.push({
          file: file.path,
          line: lineNum,
          severity: 'HIGH',
          type: 'WEAK_AUTHENTICATION',
          title: 'Weak Cryptographic Hash Algorithm (MD5/SHA1)',
          description: 'Use of deprecated hashing algorithms known to be vulnerable to collision attacks.',
          why: 'MD5 and SHA1 can be cracked rapidly using precomputed rainbow tables or GPU hash collisions.',
          risk: 'Credential cracking and password disclosure.',
          recommendation: 'Use Argon2id, bcrypt, or PBKDF2 with appropriate work factors for hashing passwords.',
          codeSnippet: trimmed,
          detectedBy: 'VibeGuard Static Analyzer',
          status: 'OPEN'
        });
      }
    });
  }

  return findings;
}

// 2. Secret & Credential Detector (Rule SEC-SECRETS-02)
function detectClientSecrets(
  files: ProjectFile[]
): Omit<Vulnerability, 'id' | 'scanId' | 'projectId' | 'created_at'>[] {
  const findings: Omit<Vulnerability, 'id' | 'scanId' | 'projectId' | 'created_at'>[] = [];

  const secretPatterns = [
    { type: 'AWS Access Key', regex: /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/, severity: 'CRITICAL' as const },
    { type: 'Stripe API Key', regex: /sk_live_[0-9a-zA-Z]{24}/, severity: 'CRITICAL' as const },
    { type: 'Private Key Block', regex: /-----BEGIN (RSA|EC|OPENSSH|PGP) PRIVATE KEY-----/, severity: 'CRITICAL' as const },
    { type: 'GitHub Personal Token', regex: /gh[pousr]_[0-9a-zA-Z]{36}/, severity: 'CRITICAL' as const },
    { type: 'Database Password URI', regex: /postgres(ql)?:\/\/[a-zA-Z0-9]+:[^@\s"']+@[a-zA-Z0-9\-.]+/i, severity: 'CRITICAL' as const },
    { type: 'Hardcoded API Token', regex: /(api_key|apikey|secret_key|auth_token|jwt_secret)\s*[:=]\s*['"][a-zA-Z0-9_\-\.]{16,}['"]/i, severity: 'HIGH' as const },
  ];

  for (const file of files) {
    const lines = file.content.split('\n');

    lines.forEach((line, idx) => {
      if (file.path.includes('.example') || line.includes('your-') || line.includes('dummy_key')) return;

      for (const pattern of secretPatterns) {
        if (pattern.regex.test(line)) {
          findings.push({
            file: file.path,
            line: idx + 1,
            severity: pattern.severity,
            type: 'HARDCODED_CREDENTIALS',
            title: `Exposed ${pattern.type} Leak`,
            description: `Potential hardcoded ${pattern.type} credential detected in plaintext source file.`,
            why: 'Credentials committed to repositories can be extracted by threat actors or crawled within seconds.',
            risk: 'Unauthorized access to cloud infrastructure, databases, and billing APIs.',
            recommendation: 'Extract credential into environment variables (`.env`) and add to `.gitignore`.',
            codeSnippet: line.trim(),
            detectedBy: 'VibeGuard Secret Scanner',
            status: 'OPEN'
          });
          break;
        }
      }
    });
  }

  return findings;
}

// 3. Combined Hybrid AI & Static Scanner
export async function scanCodeWithGemini(
  projectId: string,
  files: ProjectFile[]
): Promise<{ scan: Scan; vulnerabilities: Vulnerability[] }> {
  const startTime = Date.now();
  const scannableFiles = files.filter(f => f.content && f.content.trim().length > 0);

  // 1. Run Static Rules + Secret Detection
  const staticFindings = runClientStaticRules(scannableFiles);
  const secretFindings = detectClientSecrets(scannableFiles);

  const rawFindings: Omit<Vulnerability, 'id' | 'scanId' | 'projectId' | 'created_at'>[] = [
    ...staticFindings,
    ...secretFindings
  ];

  // 2. Run Google AI Studio Gemini API if Key is provided
  if (GEMINI_API_KEY && scannableFiles.length > 0) {
    try {
      const systemPrompt = `You are VibeGuard AI, an elite security auditor for vibe-coded full-stack applications.
Analyze the provided code files for security vulnerabilities, including SQL Injection, Secrets, Auth Bypasses, and XSS.
Return STRICT JSON: { "findings": [{ "file": string, "line": number, "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW", "type": string, "title": string, "description": string, "why": string, "risk": string, "recommendation": string, "codeSnippet": string }] }`;

      const filesContent = scannableFiles
        .slice(0, 15)
        .map(f => `--- FILE: ${f.path} ---\n${f.content.slice(0, 4000)}\n--- END FILE ---`)
        .join('\n\n');

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const body = {
        contents: [{ parts: [{ text: `Analyze these project files for security vulnerabilities:\n\n${filesContent}` }] }],
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
        systemInstruction: { parts: [{ text: systemPrompt }] }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const data = await res.json();
        const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const parsed = JSON.parse(rawJson);
        if (Array.isArray(parsed.findings)) {
          parsed.findings.forEach((f: any) => {
            rawFindings.push({
              file: f.file || scannableFiles[0]?.path || 'src/index.js',
              line: Number(f.line) || 1,
              severity: f.severity || 'HIGH',
              type: f.type || 'VULNERABILITY',
              title: f.title || 'Security Vulnerability Detected',
              description: f.description || 'Vulnerability identified by AI.',
              why: f.why || 'Insecure code implementation.',
              risk: f.risk || 'System vulnerability.',
              recommendation: f.recommendation || 'Apply secure coding best practices.',
              codeSnippet: f.codeSnippet || '',
              detectedBy: 'Google AI Studio (Gemini 1.5 Flash)',
              status: 'OPEN'
            });
          });
        }
      }
    } catch (aiErr) {
      console.warn('[Gemini Client Scanner] AI inference notice:', aiErr);
    }
  }

  // 3. Deduplicate Findings by File + Line + Type
  const seenKeys = new Set<string>();
  const deduplicated: Vulnerability[] = [];
  const scanId = `scan_${Date.now()}`;

  for (const raw of rawFindings) {
    const key = `${raw.file}:${raw.line}:${raw.type}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      deduplicated.push({
        ...raw,
        id: `vuln_${Date.now()}_${deduplicated.length}`,
        scanId,
        projectId,
        created_at: new Date().toISOString()
      });
    }
  }

  // 4. Calculate Scores
  const criticalCount = deduplicated.filter(v => v.severity === 'CRITICAL').length;
  const highCount = deduplicated.filter(v => v.severity === 'HIGH').length;
  const mediumCount = deduplicated.filter(v => v.severity === 'MEDIUM').length;
  const lowCount = deduplicated.filter(v => v.severity === 'LOW').length;

  let calculatedScore = 100 - (criticalCount * 20 + highCount * 10 + mediumCount * 5 + lowCount * 2);
  calculatedScore = Math.max(5, Math.min(100, calculatedScore));

  const scan: Scan = {
    id: scanId,
    projectId,
    status: 'COMPLETED',
    startedAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    filesScanned: scannableFiles.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    securityScore: calculatedScore,
    providerUsed: GEMINI_API_KEY ? 'Google AI Studio (Gemini 1.5 Flash)' : 'VibeGuard Hybrid Security Engine',
    modelUsed: GEMINI_API_KEY ? 'gemini-1.5-flash' : 'static-rules-v1',
    vulnerabilities: deduplicated
  };

  return { scan, vulnerabilities: deduplicated };
}
