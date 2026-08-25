import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useProject } from '../../context/ProjectContext';

interface LayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenProjectModal: () => void;
  onOpenGitHubModal: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  setCurrentTab,
  onOpenProjectModal,
  onOpenGitHubModal,
  children
}) => {
  const { scanActiveProject, scanProgress } = useProject();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0d14] text-slate-100 font-sans">
      {/* Left Navigation */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Navbar
          onScanClick={() => scanActiveProject()}
          onOpenProjectModal={onOpenProjectModal}
          onOpenGitHubModal={onOpenGitHubModal}
        />

        {/* Global Scan Banner when active */}
        {scanProgress.isScanning && (
          <div className="bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-purple-950/80 border-b border-cyan-500/30 px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <span className="text-xs font-mono font-medium text-cyan-200">
                AI SCAN PIPELINE: <strong className="text-white">{scanProgress.stage}</strong>
              </span>
            </div>
            <div className="w-48 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300"
                style={{ width: `${scanProgress.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6 bg-[#0a0d14]">
          {children}
        </main>
      </div>
    </div>
  );
};
