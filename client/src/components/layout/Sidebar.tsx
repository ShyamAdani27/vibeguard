import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  ShieldCheck,
  Zap,
  Flame,
  Wrench,
  KeyRound,
  FileSpreadsheet,
  Cpu,
  ScrollText,
  Lock,
  ChevronRight,
  Radio,
  Sun,
  Moon
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { activeProject } = useProject();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderGit2, badge: null },
    { id: 'workspace', label: 'Scanner & Explorer', icon: ShieldCheck, highlight: true },
    { id: 'precode', label: 'Pre-Code Check', icon: Zap },
    { id: 'findings', label: 'Findings & Analysis', icon: Flame },
    { id: 'reports', label: 'Security Reports', icon: FileSpreadsheet },
    { id: 'providers', label: 'AI Providers Router', icon: Cpu },
    { id: 'audit', label: 'Audit Logs', icon: ScrollText },
  ];

  return (
    <aside className="w-64 bg-[#0d1322] dark:bg-[#0d1322] bg-white border-r border-[#1f293d] dark:border-[#1f293d] border-slate-200 flex flex-col h-screen shrink-0 select-none transition-colors">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1f293d] dark:border-[#1f293d] border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-lg tracking-tight text-white dark:text-white text-slate-900 font-mono">
                Vibe<span className="text-cyan-400">Guard</span>
              </h1>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                AI GATEWAY
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 text-slate-500 font-medium">Code Fast. Scan Smart.</p>
          </div>
        </div>
      </div>

      {/* Active Project Pill */}
      {activeProject && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-[#141c2e] dark:bg-[#141c2e] bg-slate-50 border border-cyan-500/20 dark:border-cyan-500/20 border-slate-200 flex items-center justify-between shadow-sm">
          <div className="truncate">
            <span className="text-[10px] uppercase font-mono text-cyan-500 dark:text-cyan-400 block font-semibold">Active Project</span>
            <span className="text-xs text-white dark:text-white text-slate-800 font-medium truncate block">{activeProject.name}</span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {activeProject.securityScore}/100
          </span>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 dark:text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10 font-bold'
                  : 'text-slate-400 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#151c2d]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-500 dark:text-slate-500 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                  }`}
                />
                <span className="tracking-wide">{item.label}</span>
              </div>

              <div className="flex items-center gap-2">
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* AI Router Status Badge at Bottom */}
      <div className="p-3 border-t border-[#1f293d] dark:border-[#1f293d] border-slate-200 bg-[#0b101c] dark:bg-[#0b101c] bg-slate-50 space-y-2">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#111726] dark:bg-[#111726] bg-white border border-[#1f293d] dark:border-[#1f293d] border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <span className="text-[11px] font-mono font-semibold text-white dark:text-white text-slate-800 block">AI Router Live</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 text-slate-500">Gemini-1 • Failover</span>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
        </div>
      </div>
    </aside>
  );
};
