import React from 'react';
import { MetricCards } from '../components/dashboard/MetricCards';
import { VulnerabilityChart } from '../components/dashboard/VulnerabilityChart';
import { RecentScansList } from '../components/dashboard/RecentScansList';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { Shield, Sparkles, Play, Flame, ArrowUpRight } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

interface DashboardPageProps {
  setCurrentTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setCurrentTab }) => {
  const { activeProject, scanActiveProject, scanProgress, loadSampleProject } = useProject();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome / Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111726] via-[#151f38] to-[#12192b] border border-cyan-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              AI-Powered Vibe Coding Security Platform
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Code Fast. Scan Smart. <span className="text-cyan-400">Approve Safely.</span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Multi-model AI scanner protecting your full-stack vibe-coded applications. Detects SQL Injection, Hardcoded Secrets, Weak Authentication, and XSS with automated secure fixes and Gatekeeper approvals.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => scanActiveProject()}
              disabled={scanProgress.isScanning}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs tracking-wide shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Scan Active Project
            </button>

            <button
              onClick={() => setCurrentTab('workspace')}
              className="px-4 py-2 rounded-lg bg-[#1a243b] hover:bg-[#233150] text-slate-200 hover:text-white font-semibold text-xs border border-[#2b3b5c] transition-all flex items-center gap-1.5"
            >
              Browse Code & Explorer <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => loadSampleProject()}
              className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load College E-Commerce Demo
            </button>
          </div>
        </div>

        {/* Big Score Gauge */}
        <div className="shrink-0 p-4 rounded-xl bg-[#0b101d]/80 border border-[#1f293d] flex items-center gap-4">
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
