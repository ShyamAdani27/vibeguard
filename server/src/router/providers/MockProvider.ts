import { BaseProvider, CodeAnalysisInput, FixGenerationInput } from './BaseProvider.js';
import { Vulnerability, PreCodeScanResult } from '../../types/index.js';

export class MockProvider extends BaseProvider {
  id: string = 'gemini-1-sim';
  name: string = 'Gemini AI Engine (VibeGuard Core)';
  model: string = 'gemini-1.5-pro';

  async analyzeCode(input: CodeAnalysisInput): Promise<{
    riskScore: number;
    riskLevel: string;
    findings: Omit<Vulnerability, 'id' | 'scanId' | 'projectId' | 'created_at'>[];
  }> {
    const findings: Omit<Vulnerability, 'id' | 'scanId' | 'projectId' | 'created_at'>[] = [];

    for (const file of input.files) {
      const lines = file.content.split('\n');

      lines.forEach((line, idx) => {
        const lineNum = idx + 1;

        // SQL Injection detection
        if (/SELECT\s+.*\s+FROM\s+.*\s*(\+|concat)/i.test(line) || /WHERE\s+.*=\s*['"]\s*\+/i.test(line) || /db\.query\(.*(\+|`.*\${)/i.test(line)) {
          findings.push({
            file: file.path,
            line: lineNum,
            severity: 'CRITICAL',
            type: 'SQL_INJECTION',
            title: 'SQL Injection via Unsanitized Input Concatenation',
            description: 'User input is directly concatenated into a raw SQL query string without parameterization.',
            why: 'The query structure can be manipulated by malicious inputs (e.g. `\' OR 1=1 --`), allowing attackers to bypass authentication, dump sensitive database tables, or execute unauthorized transactions.',
            risk: 'Total database compromise, data exfiltration, unauthorized administrative access.',
            recommendation: 'Use parameterized database queries (prepared statements) or ORM query builders with automatic sanitization.',
            codeSnippet: line.trim(),
            detectedBy: 'Gemini AI (AI Router)',
            status: 'OPEN'
          });
        }

        // Hardcoded secrets
        if (/(jwt_secret|secret_key|api_key|password|bearer|auth_token)\s*[:=]\s*['"][a-zA-Z0-9_\-]{6,}['"]/i.test(line) && !line.includes('process.env')) {
          findings.push({
            file: file.path,
            line: lineNum,
            severity: 'CRITICAL',
            type: 'HARDCODED_CREDENTIALS',
            title: 'Hardcoded Secret / Authentication Key',
            description: 'Hardcoded cryptographic secret key or authentication token embedded directly into source code.',
            why: 'Hardcoded credentials in code repositories can be exposed through public commits, logs, or unauthorized access to build artifacts.',
            risk: 'Token forgery, unauthorized identity impersonation, persistent API access.',
            recommendation: 'Extract secrets to backend environment variables (e.g., `process.env.JWT_SECRET`) and load them through secure secret managers.',
            codeSnippet: line.trim(),
            detectedBy: 'Gemini AI (AI Router)',
            status: 'OPEN'
          });
        }

        // Weak Authentication / Insecure Password Hashing
        if (/md5\(|sha1\(|crypto\.createHash\(['"]md5['"]\)/i.test(line) || /password\s*===?\s*user\.password/i.test(line)) {
          findings.push({
            file: file.path,
            line: lineNum,
            severity: 'HIGH',
            type: 'WEAK_AUTHENTICATION',
            title: 'Weak Password Hashing or Plaintext Comparison',
            description: 'Passwords are being compared in plaintext or hashed using broken algorithms (MD5/SHA-1).',
            why: 'MD5 and SHA-1 are computationally vulnerable to collision and pre-computed rainbow table attacks.',
            risk: 'Compromised user accounts, credential stuffing vulnerabilities.',
            recommendation: 'Use salted key derivation functions such as bcrypt (minimum cost factor 12) or Argon2id.',
            codeSnippet: line.trim(),
            detectedBy: 'Gemini AI (AI Router)',
            status: 'OPEN'
          });
        }

        // XSS Vulnerability
        if (/res\.send\(.*req\.(body|query|params)/i.test(line) || /dangerouslySetInnerHTML/i.test(line) || /innerHTML\s*=/i.test(line)) {
          findings.push({
            file: file.path,
            line: lineNum,
            severity: 'HIGH',
            type: 'XSS',
            title: 'Reflected Cross-Site Scripting (XSS)',
            description: 'Unescaped user input is rendered directly into the HTML response stream.',
            why: 'Attackers can inject malicious script tags that execute within victim user browsers, stealing session cookies and auth tokens.',
            risk: 'Account takeover, session hijacking, phishing injection.',
            recommendation: 'HTML-encode all user-supplied data or use secure templating engines with automatic context-aware escaping.',
            codeSnippet: line.trim(),
            detectedBy: 'Gemini AI (AI Router)',
            status: 'OPEN'
          });
        }

        // Missing Input Validation
        if (/app\.(post|put|patch)\(/.test(line) && !file.content.includes('zod') && !file.content.includes('joi') && !file.content.includes('express-validator')) {
          if (lineNum === 1 || lineNum % 20 === 0) {
            findings.push({
              file: file.path,
              line: lineNum,
              severity: 'MEDIUM',
              type: 'MISSING_INPUT_VALIDATION',
              title: 'Unvalidated Request Payload Structure',
              description: 'Endpoint accepts client payload without strict schema validation or size limits.',
              why: 'Unchecked payloads can cause unhandled exceptions, prototype pollution, or memory denial of service.',
              risk: 'Service disruption, unexpected type casting vulnerabilities.',
              recommendation: 'Enforce strict schema validation using Zod, Joi, or JSON Schema validators on all request bodies.',
              codeSnippet: line.trim(),
              detectedBy: 'Gemini AI (AI Router)',
              status: 'OPEN'
            });
          }
        }
      });
    }

    // Calculate score
    const critical = findings.filter(f => f.severity === 'CRITICAL').length;
    const high = findings.filter(f => f.severity === 'HIGH').length;
    const medium = findings.filter(f => f.severity === 'MEDIUM').length;
    const low = findings.filter(f => f.severity === 'LOW').length;

    let score = 100 - (critical * 20 + high * 10 + medium * 5 + low * 2);
    score = Math.max(10, Math.min(100, score));

    return {
      riskScore: score,
      riskLevel: critical > 0 ? 'CRITICAL' : high > 0 ? 'HIGH' : medium > 0 ? 'MEDIUM' : 'LOW',
      findings
    };
  }

  async scanPrompt(prompt: string): Promise<PreCodeScanResult> {
    const promptLower = prompt.toLowerCase();
    const categories: PreCodeScanResult['detectedCategories'] = [];
    let riskScore = 15;

    if (promptLower.includes('auth') || promptLower.includes('login') || promptLower.includes('signup') || promptLower.includes('token') || promptLower.includes('jwt')) {
      riskScore += 30;
      categories.push({
        category: 'Authentication',
        severity: 'CRITICAL',
        description: 'Prompt involves identity verification, session tokens, or credential authentication.',
        guidance: 'Ensure bcrypt/Argon2 password hashing, secure HTTP-only cookies, JWT expiration validation, and rate limiting against brute force.'
      });
    }

    if (promptLower.includes('password') || promptLower.includes('secret') || promptLower.includes('key')) {
      riskScore += 20;
      categories.push({
        category: 'Password Storage & Secret Management',
        severity: 'HIGH',
        description: 'Prompt involves credential persistence or cryptographic keys.',
        guidance: 'Never store plaintext passwords. Enforce strong password complexity and store keys exclusively in environment variables.'
      });
    }

    if (promptLower.includes('session') || promptLower.includes('cookie') || promptLower.includes('state')) {
      riskScore += 15;
      categories.push({
        category: 'Session Management',
        severity: 'HIGH',
        description: 'Prompt handles user sessions or cookies.',
        guidance: 'Mark cookies with SameSite=Strict, HttpOnly, and Secure flags to prevent CSRF and session theft.'
      });
    }

    if (promptLower.includes('input') || promptLower.includes('form') || promptLower.includes('api') || promptLower.includes('query') || promptLower.includes('search')) {
      riskScore += 15;
      categories.push({
        category: 'Input Validation',
        severity: 'MEDIUM',
        description: 'Prompt accepts external client inputs or query parameters.',
        guidance: 'Sanitize and validate all incoming inputs using strong schema definitions before processing or database operations.'
      });
    }

    riskScore = Math.min(95, Math.max(10, riskScore));

    const severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' =
      riskScore >= 75 ? 'CRITICAL' : riskScore >= 50 ? 'HIGH' : riskScore >= 25 ? 'MEDIUM' : 'LOW';

    const mitigationPrompt = `[SECURE DIRECTIVE]\nImplement "${prompt}" with the following security guardrails:\n` +
      categories.map(c => `- ${c.category}: ${c.guidance}`).join('\n') +
      `\n- Ensure all database queries use parameterized placeholders.\n- Prevent XSS by contextual encoding.\n- Never log sensitive user credentials.`;

    return {
      prompt,
      riskScore,
      riskLevel: severity,
      detectedCategories: categories,
      mitigationPrompt,
      providerUsed: 'Gemini-1 (Primary AI Router)'
    };
  }

  async generateFix(input: FixGenerationInput) {
    const v = input.vulnerability;
    let proposedCode = '';
    let explanation = '';
    let whyThisFix = '';

    if (v.type === 'SQL_INJECTION') {
      proposedCode = `const query = "SELECT * FROM users WHERE name = ?";\nconst [rows] = await db.execute(query, [username]);`;
      explanation = 'Replaced string concatenation with a parameterized prepared query where user inputs are isolated in a bound parameters array.';
      whyThisFix = 'The database engine treats the input strictly as data rather than executable SQL syntax, rendering injection payloads harmless.';
    } else if (v.type === 'HARDCODED_CREDENTIALS') {
      proposedCode = `const jwtSecret = process.env.JWT_SECRET || (() => { throw new Error("JWT_SECRET environment variable is missing!"); })();`;
      explanation = 'Migrated hardcoded credential to process.env with runtime guard check.';
      whyThisFix = 'Prevents credential leaks in git histories and facilitates secure rotation across environments.';
    } else if (v.type === 'WEAK_AUTHENTICATION') {
      proposedCode = `const isMatch = await bcrypt.compare(password, user.passwordHash);`;
      explanation = 'Replaced vulnerable comparison with cryptographic constant-time bcrypt verification.';
      whyThisFix = 'Mitigates timing attacks and enforces proper one-way hashing with salt protection.';
    } else if (v.type === 'XSS') {
      proposedCode = `res.json({ message: "Success", user: sanitizeHtml(req.body.username) });`;
      explanation = 'Added HTML entity encoding and sanitization for client output.';
      whyThisFix = 'Neutralizes any embedded JavaScript payloads before transmission to the browser.';
    } else {
      proposedCode = `// Validated & sanitized operation\nconst sanitizedInput = validator.escape(String(input || ''));`;
      explanation = 'Added input sanitization and boundary check.';
      whyThisFix = 'Eliminates unexpected type mutations and malformed payload injection.';
    }

    const diff = `--- ${v.file} (Line ${v.line})\n+++ ${v.file} (Fixed)\n- ${v.codeSnippet || 'vulnerable_code'}\n+ ${proposedCode.split('\n')[0]}`;

    return {
      lineStart: v.line,
      lineEnd: v.line,
      originalCode: v.codeSnippet || '',
      proposedCode,
      diff,
      explanation,
      whyThisFix,
    };
  }
}
