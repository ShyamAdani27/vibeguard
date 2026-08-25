import React, { useState } from 'react';
import {
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  FileCode,
  ShieldAlert,
  Clock,
  User,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { ApprovalModal } from '../components/approvals/ApprovalModal';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { ApprovalRequest } from '../types';

interface ApprovalsPageProps {
  setCurrentTab: (tab: string) => void;
}

export const ApprovalsPage: React.FC<ApprovalsPageProps> = ({ setCurrentTab }) => {
  const { pendingApprovals, activeProject, decideApprovalRequest } = useProject();
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);

  const dummyApprovedHistory: ApprovalRequest[] = [
    {
      id: 'app-hist-1',
      projectId: activeProject?.id || 'proj-1',
      projectName: activeProject?.name || 'College E-Commerce',
      actionType: 'MODIFY_SOURCE_FILE',
      targetFile: 'src/database.js',
      riskLevel: 'CRITICAL',
      title: 'Fix SQL Injection via Parameterized Query',
      reason: 'Replaced string concatenation with prepared statements',
      status: 'APPROVED',
      requestedBy: 'VibeGuard AI Gateway',
      decidedBy: 'usr_shyam',
      decidedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString()
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold border border-cyan-500/20">
              PRD SECTION 19 & 20
            </span>
            <span className="text-xs text-slate-400 font-mono">GATEKEEPER SYSTEM</span>
          </div>
          <h2 className="text-xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            Security Gateway & Approval Requests
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Zero automatic modification policy: sensitive operations require human authorization.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono text-xs font-bold animate-pulse">
          {pendingApprovals.length} Pending Actions
        </span>
      </div>

      {/* Sensitive Actions Policy Summary Card */}
      <div className="p-4 rounded-xl bg-[#111726]/90 border border-cyan-500/20 text-xs font-mono grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-300">
        <div className="p-2.5 rounded-lg bg-[#0d1322] border border-[#1f293d]">
          <span className="text-cyan-400 font-bold block mb-0.5">1. Source Files</span>
          <span className="text-[11px] text-slate-400">Patches & fixes require approval</span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#0d1322] border border-[#1f293d]">
          <span className="text-amber-400 font-bold block mb-0.5">2. Secrets & Auth</span>
          <span className="text-[11px] text-slate-400">Tokens, JWTs, env changes guarded</span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#0d1322] border border-[#1f293d]">
          <span className="text-purple-400 font-bold block mb-0.5">3. DB Migrations</span>
          <span className="text-[11px] text-slate-400">DDL & schema changes validated</span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#0d1322] border border-[#1f293d]">
          <span className="text-emerald-400 font-bold block mb-0.5">4. Packages & Deploy</span>
          <span className="text-[11px] text-slate-400">npm installs & releases blocked</span>
        </div>
      </div>

      {/* Pending Approvals List */}
      <div>
        <h3 className="text-xs font-bold uppercase font-mono text-slate-300 mb-3 tracking-wider flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          Pending Gateway Decisions ({pendingApprovals.length})
        </h3>

        <div className="space-y-3">
          {pendingApprovals.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-xl bg-[#111726]/90 border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={req.riskLevel} size="sm" />
                  <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-[#0d1322] border border-[#1f293d]">
                    {req.actionType.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] font-mono text-cyan-300">
                    File: <strong>{req.targetFile}</strong>
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{req.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{req.reason}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedApproval(req)}
                  className="px-3.5 py-2 rounded-lg bg-[#192338] hover:bg-[#233150] text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30 transition-all flex items-center gap-1.5"
                >
                  Review Diff & Decision <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => decideApprovalRequest(req.id, 'APPROVED')}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Quick Approve
                </button>
              </div>
            </div>
          ))}

          {pendingApprovals.length === 0 && (
            <div className="p-8 rounded-xl bg-[#111726]/60 border border-[#1f293d] text-center font-mono">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <h4 className="text-sm font-bold text-white">Security Gateway Clean</h4>
              <p className="text-xs text-slate-400 mt-1">No actions currently pending approval.</p>
            </div>
          )}
        </div>
      </div>

      {/* Historical Approvals */}
      <div>
        <h3 className="text-xs font-bold uppercase font-mono text-slate-300 mb-3 tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Recent Gateway Decisions Log
        </h3>

        <div className="space-y-2">
          {dummyApprovedHistory.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-lg bg-[#0d1322] border border-[#1f293d] flex items-center justify-between text-xs font-mono"
            >
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {item.status} ✓
                </span>
                <span className="text-white font-bold">{item.title}</span>
                <span className="text-slate-400">({item.targetFile})</span>
              </div>

              <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                <span>By: Shyam Sundar</span>
                <span>{new Date(item.decidedAt || item.created_at).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Modal */}
      <ApprovalModal
        isOpen={!!selectedApproval}
        approval={selectedApproval}
        onClose={() => setSelectedApproval(null)}
      />
    </div>
  );
};
