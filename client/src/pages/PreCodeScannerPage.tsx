import React, { useState } from 'react';
import {
  Zap,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Copy,
  Check,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { api } from '../lib/api';
import { PreCodeScanResult } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { ScoreGauge } from '../components/common/ScoreGauge';

export const PreCodeScannerPage: React.FC = () => {
  const [prompt, setPrompt] = useState(
    'Create a login system with username and password, save session in cookie, and query users from MySQL database.'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PreCodeScanResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleScanPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await api.scanPrompt(prompt);
      setResult(res);
    } catch (err) {
      console.error('Error scanning prompt:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyMitigationPrompt = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.mitigationPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold border border-cyan-500/20">
            PRD SECTION 12
          </span>
          <span className="text-xs text-slate-400 font-mono">PRE-EXECUTION DEFENSE</span>
        </div>
        <h2 className="text-xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Pre-Code Security Check (Prompt Scanner)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Analyze developer prompts for security risks, sensitive operations, and anti-patterns before generating code.
        </p>
      </div>

      {/* Input Prompt Form */}
      <form onSubmit={handleScanPrompt} className="p-5 rounded-xl bg-[#111726]/90 border border-[#1f293d] shadow-xl space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase font-mono text-slate-300 mb-2">
            Developer Prompt to Analyze
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="Describe what code or feature you want to generate..."
            className="w-full bg-[#0d1322] border border-[#1f293d] rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors font-mono leading-relaxed resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>Example prompts:</span>
            <button
              type="button"
              onClick={() => setPrompt('Create user login authentication with JWT and password validation.')}
              className="text-cyan-400 hover:underline"
            >
              Auth & JWT
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setPrompt('Execute shell command to backup database tables.')}
              className="text-cyan-400 hover:underline"
            >
              Shell Exec
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Analyzing Threat Surface...' : 'Scan Prompt Security'}
          </button>
        </div>
      </form>

      {/* Results View */}
      {result && (
        <div className="p-6 rounded-xl bg-[#111726]/90 border border-cyan-500/30 shadow-2xl space-y-6 animate-in fade-in duration-300">
          {/* Top Score Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-5 rounded-xl bg-[#0d1322] border border-[#1f293d]">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-mono font-bold uppercase text-slate-400 block">
                Prompt Threat Evaluation
              </span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black font-mono text-white">
                  Risk Level:
                </span>
                <SeverityBadge severity={result.riskLevel} size="lg" />
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Evaluated by: <strong className="text-cyan-300">{result.providerUsed}</strong>
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <ScoreGauge
                score={result.riskScore}
                size={95}
                label="Risk Score"
              />
            </div>
          </div>

          {/* Detected Risk Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase font-mono text-slate-300 mb-3 tracking-wide flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              Detected Risk Vectors ({result.detectedCategories.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.detectedCategories.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#0d1322] border border-[#1f293d] space-y-2 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{cat.category}</span>
                    <SeverityBadge severity={cat.severity} size="sm" />
                  </div>
                  <p className="text-xs text-slate-300">{cat.description}</p>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono">
                    🛡️ <strong>Mitigation:</strong> {cat.guidance}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Secure Prompt Directive */}
          <div className="space-y-2 pt-2 border-t border-[#1f293d]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase font-mono text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                VibeGuard Secure Prompt Directive (Ready to paste into AI generator)
              </span>

              <button
                onClick={copyMitigationPrompt}
                className="px-3 py-1 rounded bg-[#192338] hover:bg-[#233150] text-cyan-300 text-xs font-mono font-semibold flex items-center gap-1.5 border border-cyan-500/30 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Directive'}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#090d18] border border-cyan-500/20 text-cyan-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {result.mitigationPrompt}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
