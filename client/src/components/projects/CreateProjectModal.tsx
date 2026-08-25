import React, { useState } from 'react';
import { X, FolderPlus, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { useProject } from '../../context/ProjectContext';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { fetchProjects, setActiveProject } = useProject();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('JavaScript/TypeScript');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.createProject(name, description, language);
      await fetchProjects();
      setActiveProject(res.project);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111726] border border-[#1f293d] rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono">Create New Project</h3>
            <p className="text-xs text-slate-400">Configure workspace and scanning rules</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase font-mono text-slate-300 mb-1.5">
              Project Name *
            </label>
            <input
              type="text"
              placeholder="e.g. College E-Commerce"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0d1322] border border-[#1f293d] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase font-mono text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              placeholder="Campus student marketplace with Node.js & Express API"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#0d1322] border border-[#1f293d] rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase font-mono text-slate-300 mb-1.5">
              Primary Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-[#0d1322] border border-[#1f293d] rounded-lg px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none transition-colors"
            >
              <option value="JavaScript/TypeScript">JavaScript / TypeScript (Node.js/React)</option>
              <option value="Python">Python (FastAPI / Flask / Django)</option>
              <option value="Go">Go (Golang)</option>
              <option value="Rust">Rust</option>
              <option value="Java">Java / Spring Boot</option>
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#1f293d]">
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
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
