import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Upload,
  Sparkles,
  ShieldCheck,
  Calendar,
  FileCode2,
  ArrowRight,
  ExternalLink,
  Github
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { UploadProjectModal } from '../components/projects/UploadProjectModal';
import { GitHubImportModal } from '../components/projects/GitHubImportModal';

interface ProjectsPageProps {
  setCurrentTab: (tab: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ setCurrentTab }) => {
  const { projects, activeProject, setActiveProject, loadSampleProject } = useProject();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isGitHubOpen, setIsGitHubOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Project Repositories
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Manage, link GitHub, upload, and inspect codebases for AI security scanning
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsGitHubOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-[#1a2335] hover:bg-slate-800 dark:hover:bg-[#25324d] text-white text-xs font-bold font-mono border border-slate-700 hover:border-slate-500 flex items-center gap-2 transition-all shadow-md hover:scale-[1.02]"
          >
            <Github className="w-4 h-4 fill-current" />
            Link GitHub Repo
          </button>

          <button
            onClick={() => loadSampleProject()}
            className="px-3.5 py-2 rounded-xl bg-amber-100 dark:bg-amber-500/10 hover:bg-amber-200 dark:hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Demo
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#192338] hover:bg-slate-200 dark:hover:bg-[#22304d] text-cyan-800 dark:text-cyan-300 text-xs font-bold border border-cyan-300 dark:border-cyan-500/30 flex items-center gap-1.5 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            Import ZIP / Folder
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => {
          const isActive = activeProject?.id === proj.id;
          return (
            <div
              key={proj.id}
              className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between relative group card-3d transform-3d ${
                isActive
                  ? 'bg-cyan-50/70 dark:bg-[#131b2e] border-cyan-500 shadow-xl shadow-cyan-500/10'
                  : 'bg-white dark:bg-[#111726]/90 border-slate-200 dark:border-[#1f293d] hover:border-cyan-500/40 shadow-md'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate">{proj.name}</h3>
                      {isActive && (
                        <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-cyan-200 dark:bg-cyan-500/20 text-cyan-900 dark:text-cyan-300 font-mono font-extrabold border border-cyan-300 dark:border-cyan-500/30">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono block mt-0.5">
                      {proj.language}
                    </span>
                  </div>

                  <div className="shrink-0">
                    <ScoreGauge score={proj.securityScore} size={54} strokeWidth={6} showLabel={false} />
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed font-normal">
                  {proj.description || 'No description provided.'}
                </p>

                {/* Metrics Meta */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[#0d1322] border border-slate-200 dark:border-[#1f293d] text-[11px] text-slate-700 dark:text-slate-400 font-mono mb-4">
                  <div className="flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>{proj.fileCount || 0} Files</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>
                      {proj.lastScannedAt ? 'Scanned' : 'Not scanned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-[#1f293d] flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setActiveProject(proj);
                    setIsUploadOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" /> Upload Files
                </button>

                <button
                  onClick={() => {
                    setActiveProject(proj);
                    setCurrentTab('workspace');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 hover:bg-cyan-200 dark:hover:bg-cyan-500/20 text-cyan-900 dark:text-cyan-300 font-bold text-xs border border-cyan-300 dark:border-cyan-500/20 hover:border-cyan-400 transition-all flex items-center gap-1 shadow-sm"
                >
                  Open Workspace <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <CreateProjectModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <UploadProjectModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => setCurrentTab('workspace')}
      />
      <GitHubImportModal
        isOpen={isGitHubOpen}
        onClose={() => setIsGitHubOpen(false)}
        onSuccess={() => setCurrentTab('workspace')}
      />
    </div>
  );
};
