import React from 'react';
import {
  ShieldAlert,
  Play,
  RotateCcw,
  Sparkles,
  User,
  Activity,
  Layers,
  ChevronDown,
  Github,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onScanClick: () => void;
  onOpenProjectModal: () => void;
  onOpenGitHubModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onScanClick,
  onOpenProjectModal,
  onOpenGitHubModal
}) => {
  const { activeProject, projects, selectProjectById, scanProgress, loadSampleProject } = useProject();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white/95 dark:bg-[#0d1322]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#1f293d] px-6 flex items-center justify-between shrink-0 z-20 transition-colors shadow-sm">
      {/* Left: Project Selector & Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-xs uppercase font-mono font-bold text-slate-700 dark:text-slate-400">Project:</span>
        </div>

        <div className="relative group">
          <select
            value={activeProject?.id || ''}
            onChange={(e) => selectProjectById(e.target.value)}
            className="bg-slate-100 dark:bg-[#141c2e] text-slate-900 dark:text-slate-100 text-xs font-bold rounded-xl px-3 py-2 pr-8 border border-slate-300 dark:border-[#232f48] focus:border-cyan-500 focus:outline-none appearance-none cursor-pointer transition-all hover:bg-slate-200 dark:hover:bg-[#192338] shadow-sm"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.securityScore}/100)
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <button
          onClick={onOpenGitHubModal}
          className="text-xs text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1a2233] hover:bg-slate-200 dark:hover:bg-[#243049] border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02]"
          title="Link GitHub repository and scan codebase"
        >
          <Github className="w-3.5 h-3.5 fill-current" />
          Link GitHub
        </button>

        <button
          onClick={onOpenProjectModal}
          className="text-xs text-cyan-700 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 font-bold px-2 py-1 rounded-lg hover:bg-cyan-500/10 transition-colors"
        >
          + New
        </button>

        <button
          onClick={() => loadSampleProject()}
          className="text-xs text-amber-800 dark:text-amber-300 hover:text-amber-900 font-bold px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/20 transition-all flex items-center gap-1.5 shadow-sm"
          title="Instantly loads College E-Commerce demo project"
        >
          <Sparkles className="w-3 h-3" />
          Load Demo
        </button>
      </div>

      {/* Right: Scan Action, Theme Toggle & User Telemetry */}
      <div className="flex items-center gap-3.5">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-[#141c2e] border border-slate-300 dark:border-[#232f48] text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:border-cyan-500/50 transition-all shadow-sm flex items-center gap-1.5 hover:scale-105"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
          <span className="text-[11px] font-mono font-bold uppercase hidden sm:inline">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
        </button>

        {/* Multi-stage Scan Button */}
        <button
          onClick={onScanClick}
          disabled={scanProgress.isScanning || !activeProject}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
            scanProgress.isScanning
              ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-500/40 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold shadow-cyan-500/25 hover:shadow-cyan-500/35'
          }`}
        >
          {scanProgress.isScanning ? (
            <>
              <Activity className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Scanning: {scanProgress.stage}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Scan Entire Project</span>
            </>
          )}
        </button>

        {/* User profile & Logout */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-[#1f293d]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'VG'}
          </div>
          <div className="hidden md:block">
            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">{user?.name || 'Developer'}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">{user?.role || 'Security Dev'}</span>
          </div>

          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
            title="Log Out of VibeGuard"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
