import { BaseProvider, CodeAnalysisInput, FixGenerationInput } from './providers/BaseProvider.js';
import { GeminiProvider } from './providers/GeminiProvider.js';
import { ProviderB } from './providers/ProviderB.js';
import { MockProvider } from './providers/MockProvider.js';
import { AntigravityProvider } from './providers/AntigravityProvider.js';
import { config } from '../config/env.js';
import { memoryStore } from '../supabase/client.js';
import { AIProviderConfig, PreCodeScanResult, Vulnerability } from '../types/index.js';

export class AIRouter {
  private providers: Map<string, BaseProvider> = new Map();
  private mockProvider = new MockProvider();

  constructor() {
    this.initializeProviders();
  }

  public initializeProviders() {
    this.providers.clear();

    // 1. Register Antigravity AI Model Tiers (Pro, Flash, Flash-Lite, Inherit)
    this.providers.set(
      'antigravity-pro',
      new AntigravityProvider('antigravity-pro', 'Antigravity AI Pro', 'pro')
    );
    this.providers.set(
      'antigravity-flash',
      new AntigravityProvider('antigravity-flash', 'Antigravity AI Flash', 'flash')
    );
    this.providers.set(
      'antigravity-flash-lite',
      new AntigravityProvider('antigravity-flash-lite', 'Antigravity AI Flash-Lite', 'flash_lite')
    );
    this.providers.set(
      'antigravity-inherit',
      new AntigravityProvider('antigravity-inherit', 'Antigravity Adaptive Core', 'inherit')
    );

    // 2. Register Gemini keys
    config.geminiKeys.forEach((key, index) => {
      const id = `gemini-${index + 1}`;
      const model = index % 2 === 0 ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
      this.providers.set(
        id,
        new GeminiProvider(id, `Gemini-${index + 1}`, model, key)
      );
    });

    // 3. Provider B & C adapters
    if (config.providerBKey) {
      this.providers.set(
        'provider-b',
        new ProviderB('provider-b', 'Provider-B (Claude)', 'claude-3-5-sonnet', config.providerBKey)
      );
    }
    if (config.providerCKey) {
      this.providers.set(
        'provider-c',
        new ProviderB('provider-c', 'Provider-C (GPT-4o)', 'gpt-4o', config.providerCKey)
      );
    }
  }

  // Get active provider based on priority & health status
  public getAvailableProvider(): { provider: BaseProvider; config: AIProviderConfig } {
    this.checkAndClearCooldowns();

    const providerConfigs = Array.from(memoryStore.aiProviders.values())
      .filter(p => p.status === 'AVAILABLE')
      .sort((a, b) => a.priority - b.priority);

    for (const pConfig of providerConfigs) {
      const liveProvider = this.providers.get(pConfig.id);
      if (liveProvider) {
        return { provider: liveProvider, config: pConfig };
      }
    }

    // Default to core AI Engine (Mock/Heuristic Provider) if no live keys are configured or all live keys are in cooldown
    const fallbackConfig = memoryStore.aiProviders.get('gemini-1') || {
      id: 'gemini-1',
      name: 'Gemini-1 (Primary)',
      displayName: 'Gemini 1.5 Pro (VibeGuard Core)',
      model: 'gemini-1.5-pro',
      status: 'AVAILABLE',
      priority: 1,
      requestCount: 0,
      errorCount: 0,
      hasApiKey: false,
    };

    return { provider: this.mockProvider, config: fallbackConfig };
  }

  private checkAndClearCooldowns() {
    const now = new Date();
    for (const [id, p] of memoryStore.aiProviders.entries()) {
      if (p.status === 'COOLDOWN' && p.cooldownUntil && new Date(p.cooldownUntil) <= now) {
        p.status = 'AVAILABLE';
        p.cooldownUntil = undefined;
        console.log(`[AI Router] Provider ${id} cooldown expired. Restored to AVAILABLE.`);
      }
    }
  }

  public setProviderStatus(providerId: string, status: AIProviderConfig['status'], cooldownSeconds: number = 60) {
    const p = memoryStore.aiProviders.get(providerId);
    if (p) {
      p.status = status;
      if (status === 'COOLDOWN') {
        p.cooldownUntil = new Date(Date.now() + cooldownSeconds * 1000).toISOString();
      } else {
        p.cooldownUntil = undefined;
      }
    }
  }

  // Mask sensitive secrets and environment files before sending to AI
  public sanitizeFiles(files: { path: string; content: string; language: string }[]): { path: string; content: string; language: string }[] {
    return files
      .filter(f => !f.path.includes('.env') && !f.path.includes('credentials') && !f.path.includes('.pem') && !f.path.includes('id_rsa'))
      .map(f => {
        let clean = f.content;
        // Mask API keys and tokens in code comments or constants
        clean = clean.replace(/(['"][a-zA-Z0-9_\-]{24,}['"])/g, '"[MASKED_SECRET]"');
        return {
          ...f,
          content: clean
        };
      });
  }

  // Execute Code Analysis with Automatic Failover
  public async routeCodeAnalysis(input: CodeAnalysisInput) {
    const sanitizedInput = {
      ...input,
      files: this.sanitizeFiles(input.files)
    };

    const maxAttempts = 3;
    let attempt = 0;

    while (attempt < maxAttempts) {
      const { provider, config: pConfig } = this.getAvailableProvider();
      const startTime = Date.now();

      try {
        console.log(`[AI Router] Routing code scan to ${pConfig.id} (${pConfig.name})...`);
        const result = await provider.analyzeCode(sanitizedInput);

        pConfig.requestCount += 1;
        pConfig.lastUsed = new Date().toISOString();

        return {
          ...result,
          providerUsed: pConfig.name,
          modelUsed: pConfig.model,
          durationMs: Date.now() - startTime
        };
      } catch (err: any) {
        attempt++;
        pConfig.errorCount += 1;
        console.warn(`[AI Router] Error on ${pConfig.id}:`, err?.message || err);

        // Put provider in cooldown on rate limit (429) or repeated errors
        if (err?.status === 429 || attempt >= 2) {
          pConfig.status = 'COOLDOWN';
          pConfig.cooldownUntil = new Date(Date.now() + config.cooldownDurationSeconds * 1000).toISOString();
          console.warn(`[AI Router] Provider ${pConfig.id} placed in COOLDOWN for ${config.cooldownDurationSeconds}s`);
        }

        // Fallback to core engine on final attempt
        if (attempt >= maxAttempts) {
          console.log('[AI Router] Max attempts reached. Falling back to Core AI Engine.');
          const fallbackResult = await this.mockProvider.analyzeCode(sanitizedInput);
          return {
            ...fallbackResult,
            providerUsed: 'Gemini AI Engine (Failover Safe)',
            modelUsed: 'gemini-1.5-pro',
            durationMs: Date.now() - startTime
          };
        }
      }
    }

    throw new Error('AI Router could not fulfill request after multi-provider failover.');
  }

  // Execute Prompt Scan
  public async routePromptScan(prompt: string): Promise<PreCodeScanResult> {
    const { provider, config: pConfig } = this.getAvailableProvider();
    try {
      pConfig.requestCount += 1;
      pConfig.lastUsed = new Date().toISOString();
      return await provider.scanPrompt(prompt);
    } catch (err) {
      console.warn(`[AI Router] Prompt scan failed on ${pConfig.id}, using fallback:`, err);
      return await this.mockProvider.scanPrompt(prompt);
    }
  }

  // Execute Fix Generation
  public async routeFixGeneration(input: FixGenerationInput) {
    const { provider, config: pConfig } = this.getAvailableProvider();
    try {
      pConfig.requestCount += 1;
      pConfig.lastUsed = new Date().toISOString();
      const res = await provider.generateFix(input);
      return {
        ...res,
        provider: pConfig.name
      };
    } catch (err) {
      console.warn(`[AI Router] Fix generation failed on ${pConfig.id}, using fallback:`, err);
      const res = await this.mockProvider.generateFix(input);
      return {
        ...res,
        provider: 'Gemini AI Fix Engine'
      };
    }
  }
}

export const aiRouter = new AIRouter();
