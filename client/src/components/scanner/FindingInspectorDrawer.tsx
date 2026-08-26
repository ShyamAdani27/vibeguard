import React, { useState } from 'react';
import {
  Flame,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  Cpu,
  X,
  Code2,
  Sparkles,
  BookOpen,
  Info
} from 'lucide-react';
import { Vulnerability } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';

interface FindingInspectorDrawerProps {
  vulnerability: Vulnerability | null;
  onClose: () => void;
}

export const FindingInspectorDrawer: React.FC<FindingInspectorDrawerProps> = ({
  vulnerability,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'EXPLAIN'>('DETAILS');

  if (!vulnerability) return null;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0d1322] border-l border-slate-200 dark:border-[#1f293d] w-96 shrink-0 shadow-2xl transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-[#1f293d] flex items-center justify-between bg-slate-50 dark:bg-[#0b101c]">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={vulnerability.severity} />
          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase">
            {vulnerability.type}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#1f293d] bg-slate-100 dark:bg-[#090d18] px-3 pt-2 gap-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('DETAILS')}
          className={`pb-2 px-2.5 font-bold transition-all border-b-2 ${
            activeTab === 'DETAILS'
              ? 'text-cyan-700 dark:text-cyan-400 border-cyan-600 dark:border-cyan-400'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Diagnostic Overview
        </button>
        <button
          onClick={() => setActiveTab('EXPLAIN')}
          className={`pb-2 px-2.5 font-bold transition-all border-b-2 ${
            activeTab === 'EXPLAIN'
              ? 'text-purple-700 dark:text-purple-400 border-purple-600 dark:border-purple-400'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          AI Deep Reasoning
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        {activeTab === 'DETAILS' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {vulnerability.title}
              </h3>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#090d18] border border-slate-300 dark:border-[#1f293d] font-mono text-[11px] text-slate-800 dark:text-slate-300">
                <span>File: <strong className="text-cyan-700 dark:text-cyan-400">{vulnerability.file}</strong></span>
                <span className="ml-3">Line: <strong className="text-rose-700 dark:text-rose-400">{vulnerability.line}</strong></span>
              </div>
            </div>

            {/* WHAT */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#141b2c] border border-slate-300 dark:border-[#1f293d] space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-cyan-700 dark:text-cyan-400 block">
                WHAT WAS DETECTED:
              </span>
              <p className="text-slate-900 dark:text-slate-200 leading-relaxed font-normal">
                {vulnerability.description}
              </p>
            </div>

            {/* WHY */}
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-rose-700 dark:text-rose-400 block">
                WHY IT'S A SECURITY RISK:
              </span>
              <p className="text-rose-950 dark:text-rose-200/90 leading-relaxed">
                {vulnerability.why}
              </p>
            </div>

            {/* RISK */}
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-amber-800 dark:text-amber-400 block">
                EXPLOITATION IMPACT:
              </span>
              <p className="text-amber-950 dark:text-amber-200/90 leading-relaxed">
                {vulnerability.risk}
              </p>
            </div>

            {/* RECOMMENDATION */}
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-800 dark:text-emerald-400 block">
                REMEDIATION GUIDANCE:
              </span>
              <p className="text-emerald-950 dark:text-emerald-200/90 leading-relaxed">
                {vulnerability.recommendation}
              </p>
            </div>

            {/* Snippet */}
            {vulnerability.codeSnippet && (
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-700 dark:text-slate-400 block mb-1">
                  Vulnerable Line Snippet:
                </span>
                <pre className="p-3 rounded-xl bg-[#090d18] border border-rose-500/30 text-rose-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap shadow-inner">
                  {vulnerability.codeSnippet}
                </pre>
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-400 font-mono pt-2 border-t border-slate-200 dark:border-[#1f293d]">
              <Cpu className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Engine: <strong className="text-slate-900 dark:text-white font-bold">{vulnerability.detectedBy}</strong></span>
            </div>
          </div>
        )}

        {activeTab === 'EXPLAIN' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#141b2c] border border-purple-300 dark:border-purple-500/30 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase font-mono mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> 1. Root Cause Analysis
                </h4>
                <p className="text-slate-800 dark:text-slate-300 text-xs leading-relaxed">
                  The AST pattern scanner identified that external request parameters or unsanitized expressions flow directly into critical operational logic without defensive validation boundaries.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase font-mono mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> 2. Threat Vector
                </h4>
                <p className="text-slate-800 dark:text-slate-300 text-xs leading-relaxed">
                  {vulnerability.why}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase font-mono mb-1 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> 3. Developer Best Practice
                </h4>
                <p className="text-slate-800 dark:text-slate-300 text-xs leading-relaxed">
                  {vulnerability.recommendation}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#090d18] border border-slate-300 dark:border-[#1f293d] text-[11px] text-slate-700 dark:text-slate-400 font-mono">
              💡 <strong className="text-cyan-700 dark:text-cyan-400">VibeGuard Detection Policy:</strong> Manual verification is recommended in accordance with OWASP Top 10 security standards.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
