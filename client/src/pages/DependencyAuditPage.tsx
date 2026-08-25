import React, { useState, useEffect } from 'react';
import {
  Package,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Terminal,
  RefreshCw,
  Search,
  Sparkles,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { api } from '../lib/api';
import { runClientSCAScan, DependencyFinding, SCAScanResult } from '../lib/scaClientService';

export const DependencyAuditPage: React.FC = () => {
  const { activeProject, activeFiles } = useProject();
  const [loading, setLoading] = useState(false);
  const [scaData, setScaData] = useState<SCAScanResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchSCA = async () => {
    if (!activeProject) return;
    setLoading(true);
    try {
      try {
        const res = await api.scanDependencies(activeProject.id);
        setScaData(res);
      } catch {
        // Run client-side OSV / SCA scan
        const clientRes = await runClientSCAScan(activeFiles);
        setScaData(clientRes);
      }
    } catch (e) {
      console.error('Error fetching SCA:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSCA();
  }, [activeProject?.id, activeFiles.length]);

  const copyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredFindings = scaData?.findings.filter(f =>
    f.package.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cveId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const postureScore = scaData
    ? Math.max(0, 100 - (scaData.criticalCount * 25 + scaData.highCount * 15 + scaData.mediumCount * 5))
    : 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
              <Package className="w-6 h-6" />
            </div>
            Software Composition Analysis (SCA)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time CVE vulnerability scanner powered by <strong>Google OSV Database</strong> and Antigravity AI.
          </p>
        </div>

        <button
          onClick={fetchSCA}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Auditing Manifests...' : 'Rescan Dependencies'}
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Total Dependencies</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{scaData?.totalDependencies || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Direct & Transitive packages</p>
        </div>

        <div className="bg-white dark:bg-[#111726] border border-rose-500/30 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium uppercase tracking-wider">Critical CVEs</p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{scaData?.criticalCount || 0}</p>
          <p className="text-[11px] text-rose-500/80 mt-1">Immediate RCE / Injection</p>
        </div>

        <div className="bg-white dark:bg-[#111726] border border-amber-500/30 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase tracking-wider">High Severity</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{scaData?.highCount || 0}</p>
          <p className="text-[11px] text-amber-500/80 mt-1">Prototype Pollution & DoS</p>
        </div>

        <div className="bg-white dark:bg-[#111726] border border-emerald-500/30 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wider">SCA Posture Score</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{postureScore}/100</p>
          <p className="text-[11px] text-emerald-500/80 mt-1">Package Health Index</p>
        </div>
      </div>

      {/* Findings List */}
      <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search CVEs, packages, or advisory titles..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0a0f1d] border border-slate-300 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {filteredFindings.length} Vulnerabilities Found
          </span>
        </div>

        {filteredFindings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-12 h-12 mx-auto text-emerald-500 dark:text-emerald-400 mb-3 opacity-80" />
            <h4 className="text-slate-900 dark:text-white font-medium mb-1 font-mono">All Dependencies Clean</h4>
            <p className="text-xs text-slate-500">No known CVEs identified in project manifests.</p>
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
                          : finding.severity === 'HIGH'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {finding.severity}
                    </span>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{finding.title}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      Found in <strong className="text-slate-800 dark:text-slate-200">{finding.manifestFile}</strong>
                    </span>
                    {finding.advisoryUrl && (
                      <a
                        href={finding.advisoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        OSV Advisory <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{finding.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400">
                      Package: <strong className="text-cyan-600 dark:text-cyan-300">{finding.package}</strong>
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      Current Version: <span className="text-rose-600 dark:text-rose-400 font-bold">{finding.version}</span>
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      Fixed In: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{finding.fixedVersion}</span>
                    </span>
                  </div>

                  {/* 1-Click Patch Box */}
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs text-emerald-400 flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                      <code>{finding.remediationCommand}</code>
                    </div>
                    <button
                      onClick={() => copyCommand(finding.remediationCommand, finding.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center gap-1 transition-colors"
                      title="Copy remediation command"
                    >
                      {copiedId === finding.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
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
