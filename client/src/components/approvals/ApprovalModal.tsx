import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, XCircle, FileCode, AlertOctagon, Sparkles } from 'lucide-react';
import { ApprovalRequest, AIFix } from '../../types';
import { useProject } from '../../context/ProjectContext';
import { DiffViewer } from '../fixes/DiffViewer';
import confetti from 'canvas-confetti';

interface ApprovalModalProps {
  isOpen: boolean;
  approval: ApprovalRequest | null;
  fix?: AIFix | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  approval,
  fix,
  onClose,
  onSuccess
}) => {
  const { decideApprovalRequest } = useProject();
  const [loading, setLoading] = useState(false);

  if (!isOpen || !approval) return null;

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    setLoading(true);
    try {
      await decideApprovalRequest(approval.id, decision);

      if (decision === 'APPROVED') {
        // Trigger celebratory confetti on security improvement
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore if canvas not supported
        }
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error deciding approval:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111726] border-2 border-cyan-500/40 rounded-2xl w-full max-w-2xl shadow-2xl shadow-cyan-500/10 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Gateway Security Header Bar */}
        <div className="bg-gradient-to-r from-[#0d1322] via-[#141d33] to-[#0d1322] p-5 border-b border-[#1f293d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold tracking-widest text-cyan-400">
                  SECURITY GATEWAY
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  ACTION REQUIRED
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white font-mono tracking-tight">
                AI ACTION REQUEST
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Box formatted to exact PRD layout */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-[#0d1322] border border-[#1f293d] space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                Target File
              </span>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
                <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">{approval.targetFile}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0d1322] border border-[#1f293d] space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                Action Type
              </span>
              <span className="text-xs font-mono font-bold text-white block">
                {approval.actionType.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
              <span className="text-[10px] uppercase font-mono text-rose-400 font-bold block">
                Risk Level
              </span>
              <span className="text-xs font-mono font-bold text-rose-300 block">
                🔴 {approval.riskLevel}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0d1322] border border-[#1f293d] space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                Reason
              </span>
              <span className="text-xs text-slate-200 block truncate">
                {approval.reason}
              </span>
            </div>
          </div>

          {/* Diff preview if code available */}
          {(approval.beforeCode || fix) && (
            <div className="space-y-1 pt-2">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                Proposed Patch Comparison
              </span>
              <DiffViewer
                originalCode={approval.beforeCode || fix?.originalCode || ''}
                modifiedCode={approval.afterCode || fix?.proposedCode || ''}
                height="180px"
              />
            </div>
          )}

          <div className="p-3 rounded-lg bg-[#0b101d] border border-[#1f293d] text-[11px] text-slate-400 font-mono">
            🛡️ <strong className="text-white">Gateway Policy:</strong> Approving this request will modify the source file and automatically trigger a new security scan to verify score improvement.
          </div>
        </div>

        {/* Action Buttons: [REJECT] and [APPROVE] */}
        <div className="p-5 border-t border-[#1f293d] bg-[#090d18] flex items-center justify-between gap-4">
          <button
            onClick={() => handleDecision('REJECTED')}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <XCircle className="w-4 h-4" />
            [ REJECT ACTION ]
          </button>

          <button
            onClick={() => handleDecision('APPROVED')}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold font-mono text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <CheckCircle2 className="w-4 h-4" />
            {loading ? 'Applying Fix & Scanning...' : '[ APPROVE & APPLY FIX ]'}
          </button>
        </div>
      </div>
    </div>
  );
};
