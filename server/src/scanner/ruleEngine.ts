import { Vulnerability } from '../types/index.js';

export interface StaticRuleResult {
  vulnerabilities: Omit<Vulnerability, 'id' | 'scanId' | 'projectId' | 'created_at'>[];
}

export function runStaticRules(files: { path: string; content: string }[]): StaticRuleResult {
  const list: Omit<Vulnerability, 'id' | 'scanId' | 'projectId' | 'created_at'>[] = [];

  for (const file of files) {
    const lines = file.content.split('\n');

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;

      // 1. Unsafe Eval / Function Constructor
      if (/\beval\(|new\s+Function\(/.test(line)) {
        list.push({
          file: file.path,
          line: lineNum,
          severity: 'CRITICAL',
          type: 'UNSAFE_EVAL',
          title: 'Arbitrary Code Execution via eval()',
          description: 'Usage of dynamic code evaluation (`eval` or `Function`) with potentially untrusted strings.',
          why: 'Allows arbitrary JavaScript execution in the runtime environment, leading to remote code execution.',
          risk: 'Complete host takeover and process hijacking.',
          recommendation: 'Refactor to use safe JSON parsing (`JSON.parse`) or structured dispatch tables.',
          codeSnippet: line.trim(),
          detectedBy: 'VibeGuard Static Analyzer',
          status: 'OPEN'
        });
      }

      // 2. Command Injection via child_process
      if (/child_process\.(exec|execSync)\(/.test(line) && !line.includes('execFile')) {
        list.push({
          file: file.path,
          line: lineNum,
          severity: 'CRITICAL',
          type: 'COMMAND_INJECTION',
          title: 'OS Command Injection Vulnerability',
          description: 'Spawning shell processes with unescaped command arguments.',
          why: 'Command arguments containing metacharacters (`;`, `&&`, `|`) will be interpreted by the system shell.',
          risk: 'Unauthorized server shell commands execution.',
          recommendation: 'Use `execFile` or `spawn` with an array of arguments, avoiding shell interpolation.',
          codeSnippet: line.trim(),
          detectedBy: 'VibeGuard Static Analyzer',
          status: 'OPEN'
        });
      }

      // 3. Insecure CORS Wildcard
      if (/cors\(\s*\{\s*origin\s*:\s*['"]\*['"]\s*,\s*credentials\s*:\s*true/i.test(line) || /header\(['"]Access-Control-Allow-Origin['"],\s*['"]\*['"]\)/i.test(line)) {
        list.push({
          file: file.path,
          line: lineNum,
          severity: 'HIGH',
          type: 'INSECURE_CONFIG',
          title: 'Overly Permissive CORS Configuration',
          description: 'Wildcard CORS origin configured together with credentials/cookies allowance.',
          why: 'Allows malicious third-party origins to make authenticated cross-origin requests and read sensitive responses.',
          risk: 'Cross-site data theft and session exploitation.',
          recommendation: 'Restrict `Access-Control-Allow-Origin` to an explicit whitelist of trusted domains.',
          codeSnippet: line.trim(),
          detectedBy: 'VibeGuard Static Analyzer',
          status: 'OPEN'
        });
      }
    });
  }

  return { vulnerabilities: list };
}
