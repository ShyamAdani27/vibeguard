import { BaseProvider, CodeAnalysisInput, FixGenerationInput } from './BaseProvider.js';
import { Vulnerability, PreCodeScanResult } from '../../types/index.js';

export class GeminiProvider extends BaseProvider {
  id: string;
  name: string;
  model: string;
  private apiKey: string;

  constructor(id: string, name: string, model: string, apiKey: string) {
    super();
    this.id = id;
    this.name = name;
    this.model = model;
    this.apiKey = apiKey;
  }

  private async callGeminiApi(prompt: string, systemInstruction?: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    
    const body = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      },
      ...(systemInstruction ? {
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        }
      } : {})
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errorText = await res.text();
      if (res.status === 429) {
        const error = new Error(`Rate limit exceeded on provider ${this.id}`);
        (error as any).status = 429;
        throw error;
      }
      throw new Error(`Gemini API Error (${res.status}): ${errorText}`);
    }

    const data = (await res.json()) as any;
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    return rawText;
  }

  async analyzeCode(input: CodeAnalysisInput): Promise<{
    riskScore: number;
    riskLevel: string;
    findings: Omit<Vulnerability, 'id' | 'scanId' | 'projectId' | 'created_at'>[];
  }> {
    const systemPrompt = `You are VibeGuard AI, an elite security auditor for vibe-coded full-stack applications.
Analyze the provided code files for security vulnerabilities, including:
- SQL Injection
- Command Injection
- Hardcoded Secrets / Credentials
- Authentication & Authorization Bypasses
- Cross-Site Scripting (XSS)
- Weak Password Policy & Session Management
- Missing Input Validation
- Insecure Configurations

Return STRICT JSON matching this schema:
{
  "riskScore": number (0-100, where 100 is cleanest/safest, 0 is most critical),
  "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "findings": [
    {
      "file": string (exact file path),
      "line": number (line number where vulnerability occurs),
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "type": "SQL_INJECTION" | "COMMAND_INJECTION" | "HARDCODED_CREDENTIALS" | "AUTH_BYPASS" | "XSS" | "WEAK_AUTHENTICATION" | "INSECURE_AUTHORIZATION" | "SENSITIVE_DATA_EXPOSURE" | "MISSING_INPUT_VALIDATION" | "WEAK_PASSWORD_POLICY" | "INSECURE_CONFIG" | "UNSAFE_EVAL" | "CODE_QUALITY",
      "title": string (concise title, e.g. "Direct User Input Concatenation in SQL Query"),
      "description": string (clear explanation of what happened),
      "why": string (why this is dangerous and how it can be exploited),
      "risk": string (potential business and system impact),
      "recommendation": string (actionable advice to fix),
      "codeSnippet": string (the problematic line/block of code),
      "detectedBy": "${this.name}",
      "status": "OPEN"
    }
  ]
}`;

    const filesContent = input.files
      .map(f => `--- FILE: ${f.path} (${f.language}) ---\n${f.content}\n--- END FILE ---`)
      .join('\n\n');

    const rawResponse = await this.callGeminiApi(`Analyze these project files for security vulnerabilities:\n\n${filesContent}`, systemPrompt);
    try {
      const parsed = JSON.parse(rawResponse);
      return {
        riskScore: typeof parsed.riskScore === 'number' ? parsed.riskScore : 50,
        riskLevel: parsed.riskLevel || 'HIGH',
        findings: Array.isArray(parsed.findings) ? parsed.findings.map((f: any) => ({
          ...f,
          detectedBy: `${this.name} (${this.model})`,
          status: 'OPEN'
        })) : []
      };
    } catch (e) {
      throw new Error(`Failed to parse AI response: ${rawResponse}`);
    }
  }

  async scanPrompt(prompt: string): Promise<PreCodeScanResult> {
    const systemPrompt = `You are VibeGuard Pre-Code Security Analyzer.
Analyze the user's coding prompt before code generation occurs.
Identify high-risk architectural decisions, sensitive operations (auth, cryptography, file system, database, session management, input validation).

Return STRICT JSON matching this schema:
{
  "riskScore": number (0-100, where 100 is high risk, 0 is safe),
  "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "detectedCategories": [
    {
      "category": string (e.g. "Authentication", "Password Storage", "Session Management", "Input Validation"),
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "description": string,
      "guidance": string
    }
  ],
  "mitigationPrompt": string (An enhanced, secure version of the prompt that includes proper guardrails and safety patterns)
}`;

    const rawResponse = await this.callGeminiApi(`Analyze this developer prompt before code generation:\n"${prompt}"`, systemPrompt);
    const parsed = JSON.parse(rawResponse);

    return {
      prompt,
      riskScore: parsed.riskScore || 65,
      riskLevel: parsed.riskLevel || 'HIGH',
      detectedCategories: parsed.detectedCategories || [],
      mitigationPrompt: parsed.mitigationPrompt || prompt,
      providerUsed: `${this.name} (${this.model})`
    };
  }

  async generateFix(input: FixGenerationInput): Promise<{
    proposedCode: string;
    diff: string;
    explanation: string;
    whyThisFix: string;
    lineStart: number;
    lineEnd: number;
    originalCode: string;
  }> {
    const systemPrompt = `You are VibeGuard AI Security Fix Generator.
Given a vulnerable code snippet and its file content, generate the complete, secure replacement code.

Return STRICT JSON matching this schema:
{
  "lineStart": number,
  "lineEnd": number,
  "originalCode": string (exact vulnerable snippet),
  "proposedCode": string (the secure replacement snippet),
  "diff": string (a unified or visual diff representation),
  "explanation": string (What changed and why),
  "whyThisFix": string (Technical justification of why this prevents the vulnerability)
}`;

    const userPrompt = `File: ${input.file}
Vulnerability: ${input.vulnerability.type} - ${input.vulnerability.title}
Problem Line: ${input.vulnerability.line}
Details: ${input.vulnerability.description}

Full File Content:
${input.fileContent}

Generate a minimal, secure drop-in fix.`;

    const rawResponse = await this.callGeminiApi(userPrompt, systemPrompt);
    return JSON.parse(rawResponse);
  }
}
