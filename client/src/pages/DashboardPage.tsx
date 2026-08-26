import React from 'react';
import { MetricCards } from '../components/dashboard/MetricCards';
import { VulnerabilityChart } from '../components/dashboard/VulnerabilityChart';
import { RecentScansList } from '../components/dashboard/RecentScansList';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { Shield, Sparkles, Play, Flame, ArrowUpRight, CheckCircle2, Layers, Cpu, Lock } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

interface DashboardPageProps {
  setCurrentTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setCurrentTab }) => {
  const { activeProject, scanActiveProject, scanProgress, loadSampleProject } = useProject();

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Welcome / Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-white via-cyan-50/60 to-blue-50/40 dark:from-[#111726] dark:via-[#151f38] dark:to-[#12192b] border border-cyan-500/30 dark:border-cyan-500/20 shadow-xl dark:shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 transition-colors card-3d transform-3d">
        {/* Subtle background ambient mesh */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 z-10 max-w-2xl text-center lg:text-left">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-500/15 border border-cyan-300 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 text-[11px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
              <Shield className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Autonomous AI Security Gateway
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400">
              Antigravity Claude 3.7 Tier 1
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            Code Fast. Scan Smart.{' '}
            <span className="bg-gradient-to-r from-cyan-600 via-teal-500 to-purple-600 dark:from-cyan-400 dark:via-teal-300 dark:to-purple-400 bg-clip-text text-transparent">
              Approve Safely.
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            Multi-model AI scanner protecting full-stack vibe-coded applications. Audits AST data flows, secret credentials, and adversarial prompt injections with <strong>Zero-Code Retention</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
            <button
              onClick={() => scanActiveProject()}
              disabled={scanProgress.isScanning}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {scanProgress.isScanning ? 'Scanning Codebase...' : 'Scan Active Project'}
            </button>

            <button
              onClick={() => setCurrentTab('workspace')}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#1a243b] hover:bg-slate-100 dark:hover:bg-[#233150] text-slate-800 dark:text-slate-200 font-mono font-bold text-xs border border-slate-300 dark:border-[#2b3b5c] transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02]"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Browse Code & Explorer <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => loadSampleProject()}
              className="px-4 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-500/10 hover:bg-amber-200 dark:hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02]"
              title="Loads College E-Commerce with SQL Injection, XSS, Weak Auth"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Load Sample Demo
            </button>
          </div>
        </div>

        {/* 3D Visual Shield & Score Gauge */}
        <div className="shrink-0 flex items-center gap-4 p-5 rounded-2xl bg-white/90 dark:bg-[#0b101d]/90 border border-slate-200 dark:border-[#1f293d] shadow-xl card-3d transform-3d">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 animate-float">
              <Lock className="w-6 h-6" />
            </div>
            <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0b101d] absolute -top-1 -right-1 animate-ping" />
          </div>
          <ScoreGauge score={activeProject?.securityScore || 87} size={110} />
        </div>
      </div>

      {/* 6 Key Metric Cards */}
      <MetricCards />

      {/* Vulnerability Charts */}
      <VulnerabilityChart />

      {/* Recent Scans & Security Gateway Actions */}
      <RecentScansList
        onNavigateWorkspace={() => setCurrentTab('workspace')}
        onNavigateApprovals={() => setCurrentTab('approvals')}
      />
    </div>
  );
};
