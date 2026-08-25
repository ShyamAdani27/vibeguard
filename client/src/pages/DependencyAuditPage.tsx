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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Package className="w-6 h-6" />
            </div>
            Software Composition Analysis (SCA)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time CVE vulnerability scanner powered by <strong>Google OSV Database</strong> and Antigravity AI.
          </p>
        </div>

        <button
          onClick={fetchSCA}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Auditing Manifests...' : 'Rescan Dependencies'}
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Dependencies</p>
          <p className="text-2xl font-bold text-white mt-1">{scaData?.totalDependencies || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Direct & Transitive packages</p>
        </div>

        <div className="bg-[#111726] border border-rose-500/30 rounded-xl p-4">
          <p className="text-xs text-rose-400 font-medium uppercase tracking-wider">Critical CVEs</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">{scaData?.criticalCount || 0}</p>
          <p className="text-[11px] text-rose-500/80 mt-1">Immediate RCE / Injection</p>
        </div>

        <div className="bg-[#111726] border border-amber-500/30 rounded-xl p-4">
          <p className="text-xs text-amber-400 font-medium uppercase tracking-wider">High Severity</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{scaData?.highCount || 0}</p>
          <p className="text-[11px] text-amber-500/80 mt-1">Known public advisories</p>
        </div>

        <div className="bg-[#111726] border border-emerald-500/30 rounded-xl p-4">
          <p className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Ecosystem Status</p>
          <p className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5" />
            {scaData?.vulnerableCount === 0 ? 'Fully Patched' : `${scaData?.vulnerableCount} Advisory`}
          </p>
          <p className="text-[11px] text-emerald-500/80 mt-1">Google OSV Synchronized</p>
        </div>
      </div>

      {/* Findings List */}
      <div className="bg-[#111726] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by package name, CVE, or title..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <span className="text-xs font-mono text-slate-400">
            {filteredFindings.length} Vulnerabilities Listed
          </span>
        </div>

        {filteredFindings.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShieldCheck className="w-12 h-12 mx-auto text-emerald-400 mb-3 opacity-80" />
            <h4 className="text-white font-medium mb-1">No Vulnerable Dependencies Found</h4>
            <p className="text-xs text-slate-500">All scanned manifests pass OSV security benchmarks.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredFindings.map((finding) => (
              <div key={finding.id} className="p-5 hover:bg-[#141b2d] transition-colors space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                        finding.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {finding.severity}
                    </span>
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      {finding.package}
                      <span className="text-xs font-mono text-slate-400 font-normal">v{finding.version}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {finding.cveId}
                    </span>
                    <a
                      href={finding.advisoryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                    >
                      OSV Advisory <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{finding.description}</p>

                {/* Remediation Box */}
                <div className="bg-[#090d18] border border-cyan-500/20 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                    <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Recommended Patch: <strong>{finding.remediationCommand}</strong></span>
                  </div>
                  <button
                    onClick={() => copyCommand(finding.remediationCommand, finding.id)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono transition-colors"
                  >
                    {copiedId === finding.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Fix</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
