export interface DetectedSecret {
  file: string;
  line: number;
  type: string;
  snippet: string;
}

export function detectSecrets(file: string, content: string): DetectedSecret[] {
  const secrets: DetectedSecret[] = [];
  const lines = content.split('\n');

  const secretPatterns = [
    { type: 'AWS Access Key', regex: /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/ },
    { type: 'Stripe API Key', regex: /sk_live_[0-9a-zA-Z]{24}/ },
    { type: 'Private Key', regex: /-----BEGIN (RSA|EC|OPENSSH|PGP) PRIVATE KEY-----/ },
    { type: 'GitHub Token', regex: /ghp_[0-9a-zA-Z]{36}/ },
    { type: 'Generic API Token', regex: /(api_key|apikey|secret_key|auth_token)\s*[:=]\s*['"][a-zA-Z0-9_\-]{20,}['"]/i },
    { type: 'Database Password URI', regex: /postgres(ql)?:\/\/[a-zA-Z0-9]+:[^@]+@[a-zA-Z0-9\-.]+/i },
  ];

  lines.forEach((line, idx) => {
    // Ignore .env.example or clear dummy templates
    if (file.includes('.example') || line.includes('your-') || line.includes('dummy')) return;

    for (const pattern of secretPatterns) {
      if (pattern.regex.test(line)) {
        secrets.push({
          file,
          line: idx + 1,
          type: pattern.type,
          snippet: line.trim()
        });
        break;
      }
    }
  });

  return secrets;
}
