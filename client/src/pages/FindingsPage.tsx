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
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-400 text-xs font-mono font-bold border border-cyan-300 dark:border-cyan-500/20">
              SECURITY AUDIT
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono font-semibold">THREAT DETECTION & DIAGNOSTICS</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            Detected Security Findings & Vulnerabilities
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Project: <strong className="text-cyan-700 dark:text-cyan-400 font-bold">{activeProject?.name || 'Active Project'}</strong> •{' '}
            {vulnerabilities.length} Total Discovered Threats
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#111726] p-1.5 rounded-xl border border-slate-300 dark:border-[#1f293d] text-xs font-mono shadow-sm">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold ${
                severityFilter === s
                  ? 'bg-cyan-600 dark:bg-cyan-500/20 text-white dark:text-cyan-300 shadow-sm border border-cyan-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filtered.map((v) => (
          <div
            key={v.id}
            className="p-6 rounded-2xl border bg-white dark:bg-[#111726]/90 border-slate-200 dark:border-[#1f293d] hover:border-cyan-500/40 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md dark:shadow-xl card-3d transform-3d"
          >
            <div className="space-y-2.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge severity={v.severity} size="sm" />
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-400 uppercase">
                  {v.type}
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#090d18] text-cyan-800 dark:text-cyan-400 border border-slate-300 dark:border-[#1f293d]">
                  {v.file}:{v.line}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">{v.title}</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
                {v.description}
              </p>

              {/* Snippet */}
              {v.codeSnippet && (
                <pre className="p-3 rounded-xl bg-[#090d18] border border-rose-500/30 text-rose-300 font-mono text-[11px] max-w-3xl overflow-x-auto whitespace-pre-wrap shadow-inner">
                  {v.codeSnippet}
                </pre>
              )}

              {/* Remediation guidance callout */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-300 text-[11px] font-mono max-w-3xl">
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
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Eye className="w-4 h-4" /> Inspect in Code Explorer
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-[#1f293d] shadow-md">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-bounce" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono">No Findings In This Category</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">No vulnerabilities match the selected filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
