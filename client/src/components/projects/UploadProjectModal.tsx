import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FolderArchive,
  FolderUp,
  Github,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { api } from '../../lib/api';
import { useProject } from '../../context/ProjectContext';

interface UploadProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadProjectModal: React.FC<UploadProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { activeProject, refreshFiles, selectProjectById, fetchProjects } = useProject();
  const [uploadMode, setUploadMode] = useState<'ZIP' | 'FOLDER' | 'GITHUB'>('ZIP');
  const [uploadState, setUploadState] = useState<'IDLE' | 'UPLOADING' | 'EXTRACTING' | 'ANALYZING' | 'SCANNING' | 'COMPLETE'>('IDLE');
  const [error, setError] = useState('');
  const [fileCount, setFileCount] = useState(0);

  // GitHub fields
  const [githubUrl, setGithubUrl] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  const [githubToken, setGithubToken] = useState('');
  const [autoScanGitHub, setAutoScanGitHub] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !activeProject) return null;

  const handleZipFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploadState('UPLOADING');

    try {
      setTimeout(() => setUploadState('EXTRACTING'), 400);
      setTimeout(() => setUploadState('ANALYZING'), 900);

      const res = await api.uploadZip(activeProject.id, file);

      setTimeout(() => {
        setUploadState('COMPLETE');
        setFileCount(res.fileCount || 0);
        refreshFiles();
        selectProjectById(activeProject.id);
      }, 1400);
    } catch (err: any) {
      setUploadState('IDLE');
      setError(err.message || 'Failed to extract ZIP archive');
    }
  };

  const handleFolderSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setError('');
    setUploadState('UPLOADING');

    const filesToUpload: { path: string; content: string }[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const relativePath = (file as any).webkitRelativePath || file.name;

      if (
        relativePath.includes('node_modules/') ||
        relativePath.includes('.git/') ||
        relativePath.includes('dist/') ||
        file.size > 2 * 1024 * 1024
      ) {
        continue;
      }

      try {
        const text = await file.text();
        filesToUpload.push({ path: relativePath, content: text });
      } catch (e) {}
    }

    setUploadState('ANALYZING');
    try {
      const res = await api.importFolder(activeProject.id, filesToUpload);
      setUploadState('COMPLETE');
      setFileCount(res.fileCount || filesToUpload.length);
      refreshFiles();
      selectProjectById(activeProject.id);
    } catch (err: any) {
      setUploadState('IDLE');
      setError(err.message || 'Failed to import folder');
    }
  };

  const handleGitHubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) {
      setError('Please enter a GitHub repository URL or "owner/repo"');
      return;
    }

    setError('');
    setUploadState('UPLOADING');

    try {
      setTimeout(() => setUploadState('EXTRACTING'), 300);
      if (autoScanGitHub) {
        setTimeout(() => setUploadState('SCANNING'), 800);
      }

      const res = await api.importGitHubRepo({
        repoUrl: githubUrl,
        branch: githubBranch || 'main',
        token: githubToken ? githubToken : undefined,
        autoScan: autoScanGitHub
      });

      setFileCount(res.fileCount);
      setUploadState('COMPLETE');
      await fetchProjects();
      selectProjectById(res.project.id);
      refreshFiles();
    } catch (err: any) {
      setUploadState('IDLE');
      setError(err.message || 'Failed to import repository from GitHub');
    }
  };

  const resetModal = () => {
    setUploadState('IDLE');
    setError('');
    onClose();
    if (uploadState === 'COMPLETE') onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111726] border border-[#1f293d] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={resetModal}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono">Import & Link Codebase</h3>
            <p className="text-xs text-slate-400">
              Active Project: <strong className="text-cyan-300">{activeProject.name}</strong>
            </p>
          </div>
        </div>

        {/* Upload Mode Selector (ZIP / FOLDER / GITHUB) */}
        <div className="flex rounded-lg bg-[#0d1322] p-1 border border-[#1f293d] mb-6">
          <button
            onClick={() => { setUploadMode('ZIP'); setUploadState('IDLE'); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
              uploadMode === 'ZIP' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" /> Option A: ZIP
          </button>
          <button
            onClick={() => { setUploadMode('FOLDER'); setUploadState('IDLE'); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
              uploadMode === 'FOLDER' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderUp className="w-3.5 h-3.5" /> Option B: Folder
          </button>
          <button
            onClick={() => { setUploadMode('GITHUB'); setUploadState('IDLE'); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
              uploadMode === 'GITHUB' ? 'bg-slate-700/60 text-white border border-slate-600 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Github className="w-3.5 h-3.5" /> Option C: GitHub
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload State Visualizer */}
        {uploadState !== 'IDLE' ? (
          <div className="p-8 rounded-xl bg-[#0d1322] border border-[#1f293d] text-center space-y-4">
            {uploadState === 'COMPLETE' ? (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-mono">Import & Security Scan Complete ✓</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Successfully loaded {fileCount} project files into VibeGuard.
                  </p>
                </div>
                <button
                  onClick={resetModal}
                  className="px-5 py-2 rounded-lg bg-cyan-500 text-black font-extrabold text-xs shadow-lg"
                >
                  Open in Workspace & View Findings
                </button>
              </>
            ) : (
              <>
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
                <div className="space-y-2 font-mono text-xs">
                  <p className="text-cyan-300 font-bold">
                    {uploadState === 'UPLOADING' && 'Connecting & downloading code bundle...'}
                    {uploadState === 'EXTRACTING' && 'Safely extracting archive & sanitizing paths...'}
                    {uploadState === 'ANALYZING' && 'Filtering ignored folders (node_modules, .git) & checking secrets...'}
                    {uploadState === 'SCANNING' && 'Multi-AI Router scanning repository for security vulnerabilities...'}
                  </p>
                  <div className="w-48 mx-auto bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-cyan-400 h-full w-2/3 animate-pulse" />
                  </div>
                </div>
              </>
            )}
          </div>
        ) : uploadMode === 'GITHUB' ? (
          /* Option C: GitHub Link Form */
          <form onSubmit={handleGitHubSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase font-mono text-slate-300 mb-1.5">
                GitHub Repository URL or Name *
              </label>
              <input
                type="text"
                placeholder="https://github.com/owner/repo or owner/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full bg-[#0d1322] border border-[#1f293d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Branch (Optional)
                </label>
                <input
                  type="text"
                  placeholder="main"
                  value={githubBranch}
                  onChange={(e) => setGithubBranch(e.target.value)}
                  className="w-full bg-[#0d1322] border border-[#1f293d] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Token (For Private Repos)
                </label>
                <input
                  type="password"
                  placeholder="ghp_..."
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="w-full bg-[#0d1322] border border-[#1f293d] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0d1322] border border-[#1f293d] cursor-pointer hover:border-cyan-500/30 transition-colors">
              <input
                type="checkbox"
                checked={autoScanGitHub}
                onChange={(e) => setAutoScanGitHub(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-xs text-slate-200 font-mono">
                Automatically scan codebase with AI after GitHub import
              </span>
            </label>

            <div className="pt-3 border-t border-[#1f293d] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> Link GitHub & Scan
              </button>
            </div>
          </form>
        ) : (
          /* Options A & B: ZIP / Folder */
          <div className="border-2 border-dashed border-[#232f48] hover:border-cyan-500/50 rounded-xl p-8 text-center bg-[#0d1322]/50 hover:bg-[#0d1322] transition-all cursor-pointer">
            {uploadMode === 'ZIP' ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleZipFileSelected}
                  className="hidden"
                />
                <FolderArchive className="w-12 h-12 text-cyan-400 mx-auto mb-3 opacity-80" />
                <h4 className="text-sm font-bold text-white font-mono">Select or Drop ZIP File</h4>
                <p className="text-xs text-slate-400 mt-1">Supports complete codebases and repositories up to 50MB</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-4 py-2 rounded-lg bg-[#192338] hover:bg-[#233150] text-xs font-bold text-cyan-300 border border-cyan-500/30 transition-all"
                >
                  Browse ZIP File
                </button>
              </>
            ) : (
              <>
                <input
                  ref={folderInputRef}
                  type="file"
                  {...({ webkitdirectory: '', directory: '' } as any)}
                  onChange={handleFolderSelected}
                  className="hidden"
                />
                <FolderUp className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-80" />
                <h4 className="text-sm font-bold text-white font-mono">Select Entire Directory</h4>
                <p className="text-xs text-slate-400 mt-1">Direct directory tree upload with client-side parsing</p>
                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  className="mt-4 px-4 py-2 rounded-lg bg-[#192338] hover:bg-[#233150] text-xs font-bold text-purple-300 border border-purple-500/30 transition-all"
                >
                  Select Folder
                </button>
              </>
            )}
          </div>
        )}

        {/* Ignored Notice */}
        <div className="mt-4 p-3 rounded-lg bg-[#0b101c] border border-[#1f293d] text-[11px] text-slate-400 font-mono flex items-center justify-between">
          <span>Ignored: <strong className="text-slate-300">node_modules/, .git/, dist/, build/</strong></span>
          <span className="text-cyan-400">Secrets Masked</span>
        </div>
      </div>
    </div>
  );
};
