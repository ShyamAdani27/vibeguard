import { Vulnerability } from '../types/index.js';

export function calculateSecurityScore(
  vulnerabilities: { severity: string; status?: string }[]
): { score: number; counts: { critical: number; high: number; medium: number; low: number; fixed: number } } {
  const openVulns = vulnerabilities.filter(v => v.status !== 'FIXED');
  const fixedVulns = vulnerabilities.filter(v => v.status === 'FIXED');

  const critical = openVulns.filter(v => v.severity === 'CRITICAL').length;
  const high = openVulns.filter(v => v.severity === 'HIGH').length;
  const medium = openVulns.filter(v => v.severity === 'MEDIUM').length;
  const low = openVulns.filter(v => v.severity === 'LOW').length;
  const fixed = fixedVulns.length;

  let score = 100 - (critical * 20 + high * 10 + medium * 5 + low * 2);

  // Bonus for fixed issues
  const fixBonus = Math.min(25, fixed * 6);
  score = Math.min(100, Math.max(10, score + fixBonus));

  return {
    score,
    counts: { critical, high, medium, low, fixed }
  };
}
