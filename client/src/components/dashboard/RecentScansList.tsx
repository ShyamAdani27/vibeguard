import React from 'react';
import { History, ShieldCheck, ArrowRight, Cpu, Clock, Flame, Zap, Play } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

interface RecentScansListProps {
  onNavigateWorkspace: () => void;
  onNavigateApprovals?: () => void;
}

export const RecentScansList: React.FC<RecentScansListProps> = ({
  onNavigateWorkspace
}) => {
  const { activeScans, activeProject, scanActiveProject, scanProgress, vulnerabilities } = useProject();

  const dummyScans = [
    {
      id: 'scan-1',
      date: 'Today',
      duration: '1.4s',
      provider: 'Antigravity Claude 3.7 (Thinking)',
      critical: 2,
      high: 5,
      score: 42,
      status: 'COMPLETED'
    },
    {
      id: 'scan-2',
      date: 'Today',
      duration: '0.8s',
      provider: 'Antigravity Claude 3.6 (AST Auditor)',
      critical: 3,
      high: 7,
      score: 35,
      status: 'COMPLETED'
    },
    {
      id: 'scan-3',
      date: 'Yesterday',
      duration: '0.4s',
      provider: 'Antigravity Flash-Lite (Secret Filter)',
      critical: 0,
      high: 2,
      score: 88,
      status: 'COMPLETED'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent Scans (2 cols) */}
      <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#111726]/90 border border-slate-200 dark:border-[#1f293d] shadow-md dark:shadow-xl card-3d transform-3d transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono tracking-wide">
              Recent Security Scans & Audits
            </h3>
          </div>
          <button
            onClick={onNavigateWorkspace}
            className="text-xs text-cyan-700 dark:text-cyan-400 hover:text-cyan-600 font-bold flex items-center gap-1 transition-colors"
          >
            Open Explorer <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {(activeScans.length > 0 ? activeScans : dummyScans).slice(0, 4).map((s: any, idx) => (
            <div
              key={s.id || idx}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0d1322] border border-slate-200 dark:border-[#1f293d] flex items-center justify-between hover:border-cyan-500/40 transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/20 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {activeProject?.name || 'Active Project'}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20">
                      {s.status || 'COMPLETED'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-cyan-600 dark:text-cyan-400" /> {s.providerUsed || s.provider || 'Antigravity AI'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {s.durationMs ? `${(s.durationMs / 1000).toFixed(1)}s` : s.duration || '1.2s'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs font-mono font-extrabold text-rose-700 dark:text-rose-400">
                    {s.criticalCount ?? s.critical ?? 0} Critical • {s.highCount ?? s.high ?? 0} High
                  </div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                    Score: <strong className="text-cyan-700 dark:text-cyan-400">{s.securityScore ?? s.score ?? activeProject?.securityScore ?? 100}/100</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Antigravity AI Engine Quick Trigger Card (1 col) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111726]/90 border border-slate-200 dark:border-[#1f293d] shadow-md dark:shadow-xl flex flex-col justify-between card-3d transform-3d transition-colors">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono tracking-wide flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              AI Threat Scanner
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 font-mono font-bold border border-cyan-300 dark:border-cyan-500/30">
              Antigravity Ready
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Perform end-to-end AST inspection, secret detection, and cross-file taint analysis across your codebase.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0d1322] border border-slate-200 dark:border-[#1f293d] space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Active Target:</span>
              <strong className="text-cyan-700 dark:text-cyan-400">{activeProject?.name || 'College E-Commerce'}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Detected Threats:</span>
              <strong className="text-rose-700 dark:text-rose-400 font-bold">{vulnerabilities.length} items</strong>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Posture Health:</span>
              <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{activeProject?.securityScore || 100}/100</strong>
            </div>
          </div>
        </div>

        <button
          onClick={() => scanActiveProject()}
          disabled={scanProgress.isScanning || !activeProject}
          className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {scanProgress.isScanning ? 'Scanning Codebase...' : 'Launch AI Security Scan'}
        </button>
      </div>
    </div>
  );
};
