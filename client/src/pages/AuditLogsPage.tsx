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
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-400 text-xs font-mono font-bold border border-cyan-300 dark:border-cyan-500/20">
            AUDIT TRAIL
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-mono font-semibold">LOGS & HISTORY</span>
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          Security Audit & Action Trail
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
          Immutable chronological log tracking every security scan, human approval, code modification, and AI provider interaction.
        </p>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#1f293d] bg-white dark:bg-[#111726]/90 overflow-hidden shadow-xl card-3d transform-3d transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-[#090d18] border-b border-slate-200 dark:border-[#1f293d] text-slate-700 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-bold">Timestamp</th>
                <th className="py-3.5 px-4 font-bold">User</th>
                <th className="py-3.5 px-4 font-bold">Action</th>
                <th className="py-3.5 px-4 font-bold">Target / File</th>
                <th className="py-3.5 px-4 font-bold">Risk</th>
                <th className="py-3.5 px-4 font-bold">Decision</th>
                <th className="py-3.5 px-4 font-bold">AI Provider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#1f293d] text-slate-800 dark:text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-[#151d2f] transition-colors">
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="py-3.5 px-4 text-cyan-800 dark:text-cyan-300 font-bold">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 truncate max-w-xs font-medium">
                    {log.file || log.projectName || '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    {log.risk ? <SeverityBadge severity={log.risk} size="sm" /> : '—'}
                  </td>
                  <td className="py-3.5 px-4 font-bold">
                    {log.decision === 'APPROVED' && (
                      <span className="text-emerald-700 dark:text-emerald-400">APPROVED ✓</span>
                    )}
                    {log.decision === 'REJECTED' && (
                      <span className="text-rose-700 dark:text-rose-400">REJECTED ✗</span>
                    )}
                    {log.decision === 'EXECUTED' && (
                      <span className="text-cyan-800 dark:text-cyan-300">EXECUTED</span>
                    )}
                    {log.decision === 'SCAN_COMPLETED' && (
                      <span className="text-purple-800 dark:text-purple-300">SCANNED</span>
                    )}
                    {log.decision === 'PROMPT_CHECKED' && (
                      <span className="text-amber-800 dark:text-amber-300">PROMPT CHECK</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap font-medium">
                    {log.provider || 'VibeGuard Gateway'}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    No audit logs recorded yet. Run a scan to generate audit events.
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
