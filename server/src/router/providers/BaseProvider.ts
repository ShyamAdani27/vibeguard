import { Vulnerability, PreCodeScanResult, AIFix } from '../../types/index.js';

export interface CodeAnalysisInput {
  projectId: string;
  files: { path: string; content: string; language: string }[];
}

export interface FixGenerationInput {
  file: string;
  vulnerability: Vulnerability;
  fileContent: string;
}

export abstract class BaseProvider {
  abstract id: string;
  abstract name: string;
  abstract model: string;

  abstract analyzeCode(input: CodeAnalysisInput): Promise<{
    riskScore: number;
    riskLevel: string;
    findings: Omit<Vulnerability, 'id' | 'scanId' | 'projectId' | 'created_at'>[];
  }>;

  abstract scanPrompt(prompt: string): Promise<PreCodeScanResult>;

  abstract generateFix(input: FixGenerationInput): Promise<{
    proposedCode: string;
    diff: string;
    explanation: string;
    whyThisFix: string;
    lineStart: number;
    lineEnd: number;
    originalCode: string;
  }>;
}
