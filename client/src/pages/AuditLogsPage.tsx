import React, { useEffect, useState } from 'react';
import { ScrollText, Shield, User, Clock, CheckCircle2, XCircle, Cpu, Filter } from 'lucide-react';
import { api } from '../lib/api';
import { AuditLog } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.getAuditLogs();
      setLogs(res.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold border border-cyan-500/20">
            PRD SECTION 21
          </span>
          <span className="text-xs text-slate-400 font-mono">AUDIT TRAIL & LOGS</span>
        </div>
        <h2 className="text-xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-cyan-400" />
          Security Audit & Action Trail
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Immutable chronological log tracking every security scan, human approval, code modification, and AI provider interaction.
        </p>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-[#1f293d] bg-[#111726]/90 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#090d18] border-b border-[#1f293d] text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target / File</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">AI Provider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f293d] text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#151d2f] transition-colors">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="py-3 px-4 text-cyan-300 font-medium">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-300 truncate max-w-xs">
                    {log.file || log.projectName || '—'}
                  </td>
                  <td className="py-3 px-4">
                    {log.risk ? <SeverityBadge severity={log.risk} size="sm" /> : '—'}
                  </td>
                  <td className="py-3 px-4 font-bold">
                    {log.decision === 'APPROVED' && (
                      <span className="text-emerald-400">APPROVED ✓</span>
                    )}
                    {log.decision === 'REJECTED' && (
                      <span className="text-rose-400">REJECTED ✗</span>
                    )}
                    {log.decision === 'EXECUTED' && (
                      <span className="text-cyan-300">EXECUTED</span>
                    )}
                    {log.decision === 'SCAN_COMPLETED' && (
                      <span className="text-purple-300">SCANNED</span>
                    )}
                    {log.decision === 'PROMPT_CHECKED' && (
                      <span className="text-amber-300">PROMPT CHECK</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {log.provider || 'VibeGuard Gateway'}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    No audit records logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
