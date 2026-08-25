import { v4 as uuidv4 } from 'uuid';
import { aiRouter } from '../router/AIRouter.js';
import { memoryStore } from '../supabase/client.js';
import { PreCodeScanResult } from '../types/index.js';

export class PromptScanService {
  public async scanPrompt(prompt: string, userId: string = 'usr_shyam', userName: string = 'Shyam Sundar'): Promise<PreCodeScanResult> {
    const result = await aiRouter.routePromptScan(prompt);

    // Audit Log
    memoryStore.auditLogs.unshift({
      id: uuidv4(),
      userId,
      userName,
      action: 'Pre-Code Prompt Security Analysis',
      risk: result.riskLevel,
      decision: 'PROMPT_CHECKED',
      provider: result.providerUsed,
      details: `Analyzed prompt (Risk: ${result.riskScore}/100 - ${result.riskLevel})`,
      timestamp: new Date().toISOString()
    });

    return result;
  }
}

export const promptScanService = new PromptScanService();
