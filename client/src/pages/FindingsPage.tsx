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
  Info,
  Sliders,
  FolderGit2
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { Vulnerability, Severity } from '../types';
import { securityRulesStore } from '../lib/securityRulesStore';

interface FindingsPageProps {
  setCurrentTab: (tab: string) => void;
}

export const FindingsPage: React.FC<FindingsPageProps> = ({ setCurrentTab }) => {
  const { vulnerabilities, activeProject, activeFiles, inspectVulnerability, scanActiveProject, scanProgress } = useProject();
  const { user } = useAuth();
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const activeRules = securityRulesStore.getRules(user?.id);
  const enabledRules = activeRules.filter(r => r.enabled);

  const filtered = vulnerabilities.filter((v) => {
    if (severityFilter !== 'ALL' && v.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-400 text-xs font-mono font-bold border border-cyan-300 dark:border-cyan-500/20">
              SECURITY FINDINGS & AUDIT
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono font-semibold">
              DIAGNOSTICS & ACTIVE RULES
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            Detected Security Findings ({vulnerabilities.length})
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Active Project: <strong className="text-cyan-700 dark:text-cyan-400 font-bold">{activeProject?.name || 'No Project'}</strong> •{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">{enabledRules.length} Active Security Rules Checked</span>
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-[#111726] p-1.5 rounded-2xl border border-slate-200 dark:border-[#1f293d] text-xs font-mono shadow-sm">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1.5 rounded-xl transition-all font-bold ${
                severityFilter === s
                  ? 'bg-cyan-600 dark:bg-cyan-500/20 text-white dark:text-cyan-300 shadow-sm border border-cyan-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Active Rules Filter Badge */}
      <div className="p-3.5 rounded-2xl bg-cyan-50/70 dark:bg-[#0d1322] border border-cyan-200 dark:border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 flex-wrap">
          <Sliders className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-bold">Scanning Profile:</span>
          {enabledRules.map(r => (
            <span key={r.id} className="px-2 py-0.5 rounded-md bg-white dark:bg-[#111726] border border-cyan-300 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 font-semibold text-[10px]">
              {r.code} ({r.title.split(' ')[0]})
            </span>
          ))}
          {enabledRules.length === 0 && (
            <span className="text-rose-600 dark:text-rose-400 font-bold">No Rules Active!</span>
          )}
        </div>

        <button
          onClick={() => setCurrentTab('terms')}
          className="text-cyan-700 dark:text-cyan-400 hover:underline font-bold text-[11px] shrink-0"
        >
          Configure Rules →
        </button>
      </div>

      {/* Findings List or Empty States */}
      <div className="space-y-4">
        {filtered.map((v) => (
          <div
            key={v.id}
            className="p-6 rounded-3xl border bg-white dark:bg-[#111726]/90 border-slate-200 dark:border-[#1f293d] hover:border-cyan-500/40 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md dark:shadow-xl card-3d transform-3d"
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

              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wide">{v.title}</h3>
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
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-300 text-[11px] font-mono max-w-3xl">
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

        {/* Empty States Handling */}
        {filtered.length === 0 && (
          <div className="p-10 sm:p-14 text-center rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-[#1f293d] shadow-lg space-y-3 card-3d">
            {activeFiles.length === 0 ? (
              <>
                <FolderGit2 className="w-12 h-12 text-slate-400 mx-auto" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  No Project Files Available To Scan
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto font-medium">
                  Please link a GitHub repository or click "Load Demo" to import files for security scanning.
                </p>
              </>
            ) : enabledRules.length === 0 ? (
              <>
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  All Security Rules Are Disabled
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto font-medium">
                  You currently have 0 active rules selected. Open the Security Rules Selector or Terms & Security Guide to enable detection rules.
                </p>
                <button
                  onClick={() => setCurrentTab('terms')}
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-mono font-bold hover:bg-cyan-500 transition-colors shadow"
                >
                  Enable Security Rules
                </button>
              </>
            ) : (
              <>
                <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  Clean Codebase — No Vulnerabilities Found!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto font-medium">
                  No security vulnerabilities were detected across your {activeFiles.length} project files for the {enabledRules.length} enabled security rules.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => scanActiveProject()}
                    disabled={scanProgress.isScanning}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow"
                  >
                    {scanProgress.isScanning ? 'Scanning...' : 'Re-Run Security Scan'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
