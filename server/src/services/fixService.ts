import { v4 as uuidv4 } from 'uuid';
import { aiRouter } from '../router/AIRouter.js';
import { memoryStore } from '../supabase/client.js';
import { AIFix, Vulnerability } from '../types/index.js';

export class FixService {
  public async generateFix(vulnerabilityId: string): Promise<AIFix> {
    const vuln = memoryStore.vulnerabilities.get(vulnerabilityId);
    if (!vuln) {
      throw new Error(`Vulnerability ${vulnerabilityId} not found`);
    }

    const files = memoryStore.files.get(vuln.projectId) || [];
    const fileObj = files.find(f => f.path === vuln.file);
    const fileContent = fileObj?.content || '';

    const fixResult = await aiRouter.routeFixGeneration({
      file: vuln.file,
      vulnerability: vuln,
      fileContent
    });

    const fixId = uuidv4();
    const aiFix: AIFix = {
      id: fixId,
      vulnerabilityId: vuln.id,
      projectId: vuln.projectId,
      file: vuln.file,
      lineStart: fixResult.lineStart || vuln.line,
      lineEnd: fixResult.lineEnd || vuln.line,
      originalCode: fixResult.originalCode || vuln.codeSnippet || '',
      proposedCode: fixResult.proposedCode,
      diff: fixResult.diff,
      explanation: fixResult.explanation,
      whyThisFix: fixResult.whyThisFix,
      status: 'PENDING',
      provider: fixResult.provider,
      created_at: new Date().toISOString()
    };

    memoryStore.fixes.set(fixId, aiFix);
    vuln.fixId = fixId;

    return aiFix;
  }

  public getFix(fixId: string): AIFix | undefined {
    return memoryStore.fixes.get(fixId);
  }
}

export const fixService = new FixService();
