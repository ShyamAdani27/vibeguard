import React, { useState } from 'react';
import {
  X,
  Github,
  Link2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../lib/api';
import { useProject } from '../../context/ProjectContext';
import { importGitHubDirect } from '../../lib/githubClientService';

interface GitHubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const GitHubImportModal: React.FC<GitHubImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { fetchProjects, setActiveProject, addImportedProject } = useProject();
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [autoScan, setAutoScan] = useState(true);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'IDLE' | 'CONNECTING' | 'FETCHING' | 'SCANNING' | 'COMPLETE'>('IDLE');
  const [error, setError] = useState('');
  const [importedFileCount, setImportedFileCount] = useState(0);

  if (!isOpen) return null;

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL or "owner/repo"');
      return;
    }

    setError('');
    setLoading(true);
    setStep('CONNECTING');

    setTimeout(() => setStep('FETCHING'), 400);

    try {
      if (autoScan) {
        setTimeout(() => setStep('SCANNING'), 1100);
      }

      try {
        const res = await api.importGitHubRepo({
          repoUrl,
          branch: branch || 'main',
          token: token ? token : undefined,
          autoScan
        });

        setImportedFileCount(res.fileCount);
        setStep('COMPLETE');
        await fetchProjects();
        setActiveProject(res.project);
      } catch (backendErr: any) {
        // Direct Client GitHub Ingestion (for static Vercel deployment)
        console.log('[GitHub Modal] Running client-side GitHub direct ingestion...');
        const directRes = await importGitHubDirect({
          repoUrl,
          branch: branch || 'main',
          token: token ? token : undefined,
          autoScan
        });

        setImportedFileCount(directRes.fileCount);
        setStep('COMPLETE');
        addImportedProject(directRes.project, directRes.files, directRes.scan);
      }

      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (err: any) {
      setStep('IDLE');
      setLoading(false);
      setError(err.message || 'Failed to import repository from GitHub');
    }
  };

  const setSampleRepo = (url: string, br: string = 'main') => {
    setRepoUrl(url);
    setBranch(br);
    setError('');
  };

  const handleFinish = () => {
    setStep('IDLE');
    setRepoUrl('');
    setError('');
    onClose();
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111726] border-2 border-cyan-500/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl shadow-cyan-500/10 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-white text-black font-black flex items-center justify-center shadow-lg shadow-white/10">
            <Github className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                GIT INTEGRATION
              </span>
              <span className="text-xs text-slate-400 font-mono">AUTOMATED INGEST</span>
            </div>
            <h3 className="text-base font-extrabold text-white font-mono tracking-tight">
              Link GitHub Repository & Scan
            </h3>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step !== 'IDLE' ? (
          <div className="p-8 rounded-xl bg-[#0d1322] border border-[#1f293d] text-center space-y-4 font-mono">
            {step === 'COMPLETE' ? (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Repository Imported & Scanned! ✓</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Successfully loaded {importedFileCount} source files and generated security findings.
                  </p>
                </div>
                <button
                  onClick={handleFinish}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                >
                  Open in Workspace & View Findings
                </button>
              </>
            ) : (
              <>
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
                <div className="space-y-2 text-xs">
                  <p className="text-cyan-300 font-bold">
                    {step === 'CONNECTING' && 'Connecting to GitHub API & verifying permissions...'}
                    {step === 'FETCHING' && 'Fetching repository tree & extracting source files...'}
                    {step === 'SCANNING' && 'Routing code to Gemini AI Router & scanning security vulnerabilities...'}
                  </p>
                  <div className="w-52 mx-auto bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-cyan-400 h-full w-3/4 animate-pulse" />
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase font-mono text-slate-300 mb-1.5">
                GitHub Repository URL or Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://github.com/owner/repository or owner/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full bg-[#0d1322] border border-[#1f293d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors font-mono"
                  required
                />
                <Link2 className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Quick Demo Preset Repositories */}
            <div>
              <span className="text-[11px] text-slate-400 font-mono block mb-1.5">
                Quick sample repositories:
              </span>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setSampleRepo('https://github.com/expressjs/express', 'master')}
                  className="px-2.5 py-1 rounded bg-[#0d1322] hover:bg-[#151f33] text-cyan-300 border border-[#1f293d] hover:border-cyan-500/40 transition-colors"
                >
                  expressjs/express
                </button>
                <button
                  type="button"
                  onClick={() => setSampleRepo('https://github.com/axios/axios', 'main')}
                  className="px-2.5 py-1 rounded bg-[#0d1322] hover:bg-[#151f33] text-cyan-300 border border-[#1f293d] hover:border-cyan-500/40 transition-colors"
                >
                  axios/axios
                </button>
                <button
                  type="button"
                  onClick={() => setSampleRepo('https://github.com/facebook/react', 'main')}
                  className="px-2.5 py-1 rounded bg-[#0d1322] hover:bg-[#151f33] text-cyan-300 border border-[#1f293d] hover:border-cyan-500/40 transition-colors"
                >
                  facebook/react
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Branch (Optional)
                </label>
                <input
                  type="text"
                  placeholder="main"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-[#0d1322] border border-[#1f293d] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Private Token (Optional)
                </label>
                <input
                  type="password"
                  placeholder="ghp_... for private repos"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full bg-[#0d1322] border border-[#1f293d] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-[#0d1322] border border-[#1f293d] cursor-pointer hover:border-cyan-500/30 transition-colors select-none">
              <input
                type="checkbox"
                checked={autoScan}
                onChange={(e) => setAutoScan(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-xs text-slate-200 font-mono font-medium">
                Automatically trigger AI Security Scan upon import
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
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'Importing from GitHub...' : 'Import & Scan Repository'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
