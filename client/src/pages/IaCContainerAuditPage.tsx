import React, { useState, useEffect } from 'react';
import {
  Layers,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  Server,
  FileCode2,
  Terminal,
  Lock,
  ExternalLink
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { api } from '../lib/api';
import { runClientIaCScan, IaCFinding, IaCScanResult } from '../lib/iacSecurityScanner';

export const IaCContainerAuditPage: React.FC = () => {
  const { activeProject, activeFiles } = useProject();
  const [loading, setLoading] = useState(false);
  const [iacData, setIacData] = useState<IaCScanResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchIaC = async () => {
    if (!activeProject) return;
    setLoading(true);
    try {
      try {
        const res = await api.scanIaC(activeProject.id);
        setIacData(res);
      } catch {
        // Run client-side IaC audit
        const clientRes = runClientIaCScan(activeFiles);
        setIacData(clientRes);
      }
    } catch (e) {
      console.error('Error fetching IaC:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIaC();
  }, [activeProject?.id, activeFiles.length]);

  const filteredFindings = iacData?.findings.filter(f =>
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.resource.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
              <Server className="w-6 h-6" />
            </div>
            Docker & Infrastructure as Code (IaC) Auditor
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audits Dockerfiles, docker-compose, CI/CD workflows, and container configurations against <strong>CIS Benchmarks</strong>.
          </p>
        </div>

        <button
          onClick={fetchIaC}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Auditing Infrastructure...' : 'Rescan IaC Configs'}
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Manifests Audited</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{iacData?.filesAudited || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Docker, Compose & Workflows</p>
        </div>

        <div className="bg-white dark:bg-[#111726] border border-rose-500/30 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium uppercase tracking-wider">Critical Misconfigs</p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{iacData?.criticalCount || 0}</p>
          <p className="text-[11px] text-rose-500/80 mt-1">Root / Secret Leak / Privilege</p>
        </div>

        <div className="bg-white dark:bg-[#111726] border border-amber-500/30 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase tracking-wider">High Risk</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{iacData?.highCount || 0}</p>
          <p className="text-[11px] text-amber-500/80 mt-1">Exposed Database Ports</p>
        </div>

        <div className="bg-white dark:bg-[#111726] border border-purple-500/30 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase tracking-wider">IaC Posture Score</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{iacData?.postureScore || 100}/100</p>
          <p className="text-[11px] text-purple-500/80 mt-1">CIS Benchmark Compliance</p>
        </div>
      </div>

      {/* Findings List */}
      <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search IaC findings by file, title, or CIS benchmark..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0a0f1d] border border-slate-300 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {filteredFindings.length} IaC Issues Found
          </span>
        </div>

        {filteredFindings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-12 h-12 mx-auto text-emerald-500 dark:text-emerald-400 mb-3 opacity-80" />
            <h4 className="text-slate-900 dark:text-white font-medium mb-1 font-mono">Container & Infrastructure Hardened</h4>
            <p className="text-xs text-slate-500">No dangerous privilege escalations or exposed port bindings detected.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
            {filteredFindings.map((finding) => (
              <div key={finding.id} className="p-5 hover:bg-slate-50 dark:hover:bg-[#151a2d] transition-colors space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                        finding.severity === 'CRITICAL'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {finding.severity}
                    </span>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{finding.title}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-slate-300 dark:border-slate-700">
                      {finding.standard}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {finding.file}:{finding.line}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{finding.description}</p>

                {/* Problematic snippet */}
                {finding.codeSnippet && (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-rose-300 truncate">
                    <code>{finding.codeSnippet}</code>
                  </div>
                )}

                {/* Remediation Box */}
                <div className="bg-purple-50 dark:bg-[#120e24] border border-purple-300 dark:border-purple-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-purple-900 dark:text-purple-200">
                  <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-purple-700 dark:text-purple-300">Remediation Guidance: </span>
                    {finding.remediation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
