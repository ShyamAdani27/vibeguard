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
  ExternalLink
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { UploadProjectModal } from '../components/projects/UploadProjectModal';
import { GitHubImportModal } from '../components/projects/GitHubImportModal';
import { Github } from 'lucide-react';

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
          <h2 className="text-xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-cyan-400" />
            Project Repositories
          </h2>
          <p className="text-xs text-slate-400">
            Manage, link GitHub, upload, and inspect codebases for AI security scanning
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsGitHubOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-[#24292e] hover:bg-[#2f363d] text-white text-xs font-bold font-mono border border-slate-700 hover:border-slate-500 flex items-center gap-2 transition-all shadow-md"
          >
            <Github className="w-4 h-4 fill-current" />
            Link GitHub Repo
          </button>

          <button
            onClick={() => loadSampleProject()}
            className="px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Demo
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-[#192338] hover:bg-[#22304d] text-cyan-300 text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            Import ZIP / Folder
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
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
              className={`p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between relative group ${
                isActive
                  ? 'bg-[#131b2e] border-cyan-500/50 shadow-cyan-500/10 shadow-xl'
                  : 'bg-[#111726]/90 border-[#1f293d] hover:border-[#2f3d59]'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white font-mono truncate">{proj.name}</h3>
                      {isActive && (
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                      {proj.language}
                    </span>
                  </div>

                  <div className="shrink-0">
                    <ScoreGauge score={proj.securityScore} size={54} strokeWidth={6} showLabel={false} />
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                  {proj.description || 'No description provided.'}
                </p>

                {/* Metrics Meta */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#0d1322] border border-[#1f293d] text-[11px] text-slate-400 font-mono mb-4">
                  <div className="flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{proj.fileCount || 0} Files</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>
                      {proj.lastScannedAt ? 'Scanned' : 'Not scanned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#1f293d] flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setActiveProject(proj);
                    setIsUploadOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" /> Upload Files
                </button>

                <button
                  onClick={() => {
                    setActiveProject(proj);
                    setCurrentTab('workspace');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-500/20 hover:border-cyan-500/40 transition-all flex items-center gap-1"
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
