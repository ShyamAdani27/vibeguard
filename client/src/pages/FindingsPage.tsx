import React, { useState } from 'react';
import {
  Flame,
  Filter,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  FileCode,
  ShieldCheck,
  Eye,
  Info
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { Vulnerability, Severity } from '../types';

interface FindingsPageProps {
  setCurrentTab: (tab: string) => void;
}

export const FindingsPage: React.FC<FindingsPageProps> = ({ setCurrentTab }) => {
  const { vulnerabilities, activeProject, inspectVulnerability } = useProject();
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const filtered = vulnerabilities.filter((v) => {
    if (severityFilter !== 'ALL' && v.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold border border-cyan-500/20">
              SECURITY AUDIT
            </span>
            <span className="text-xs text-slate-400 font-mono">THREAT DETECTION & DIAGNOSTICS</span>
          </div>
          <h2 className="text-xl font-extrabold text-white dark:text-white text-slate-900 font-mono tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-400" />
            Detected Security Findings & Vulnerabilities
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Project: <strong className="text-cyan-400">{activeProject?.name}</strong> •{' '}
            {vulnerabilities.length} Total Discovered Threats
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-[#111726] dark:bg-[#111726] bg-slate-100 p-1 rounded-lg border border-[#1f293d] dark:border-[#1f293d] border-slate-300 text-xs font-mono">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1.5 rounded transition-all ${
                severityFilter === s
                  ? 'bg-cyan-500/20 text-cyan-400 dark:text-cyan-300 border border-cyan-500/30 font-bold'
                  : 'text-slate-400 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {filtered.map((v) => (
          <div
            key={v.id}
            className="p-5 rounded-xl border bg-[#111726]/90 dark:bg-[#111726]/90 bg-white border-[#1f293d] dark:border-[#1f293d] border-slate-200 hover:border-cyan-500/40 transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge severity={v.severity} size="sm" />
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                  {v.type}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#090d18] dark:bg-[#090d18] bg-slate-100 text-cyan-400 border border-[#1f293d] dark:border-[#1f293d] border-slate-300">
                  {v.file}:{v.line}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white dark:text-white text-slate-900 tracking-wide">{v.title}</h3>
              <p className="text-xs text-slate-300 dark:text-slate-300 text-slate-700 leading-relaxed max-w-3xl">
                {v.description}
              </p>

              {/* Snippet */}
              {v.codeSnippet && (
                <pre className="p-2.5 rounded-lg bg-[#090d18] dark:bg-[#090d18] bg-slate-900 border border-rose-500/30 text-rose-300 font-mono text-[11px] max-w-3xl overflow-x-auto whitespace-pre-wrap">
                  {v.codeSnippet}
                </pre>
              )}

              {/* Remediation guidance callout */}
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 dark:text-emerald-300 text-emerald-800 text-[11px] font-mono max-w-3xl">
                🛡️ <strong>Recommended Fix:</strong> {v.recommendation}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  inspectVulnerability(v);
                  setCurrentTab('workspace');
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4" /> Inspect in Code Explorer
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-[#111726] dark:bg-[#111726] bg-white border border-[#1f293d] dark:border-[#1f293d] border-slate-200">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white dark:text-white text-slate-800 font-mono">No Findings In This Category</h4>
            <p className="text-xs text-slate-400 mt-1">No vulnerabilities match the selected filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
