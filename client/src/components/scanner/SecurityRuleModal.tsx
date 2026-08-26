import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Shield,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SecurityRuleStandard } from '../../types';
import { securityRulesStore } from '../../lib/securityRulesStore';
import { SeverityBadge } from '../common/SeverityBadge';

interface SecurityRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToGuide?: () => void;
}

export const SecurityRuleModal: React.FC<SecurityRuleModalProps> = ({
  isOpen,
  onClose,
  onNavigateToGuide
}) => {
  const { user } = useAuth();
  const userId = user?.id || 'usr_guest';

  const [rules, setRules] = useState<SecurityRuleStandard[]>(() =>
    securityRulesStore.getRules(userId)
  );

  useEffect(() => {
    if (isOpen) {
      setRules(securityRulesStore.getRules(userId));
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleToggle = (ruleId: string, currentVal: boolean) => {
    const updated = securityRulesStore.saveRuleToggle(userId, ruleId, !currentVal);
    setRules(updated);
  };

  const handleSetAll = (enableAll: boolean) => {
    const updated = securityRulesStore.setAllRules(userId, enableAll);
    setRules(updated);
  };

  const enabledCount = rules.filter(r => r.enabled).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111726] border-2 border-cyan-500/30 rounded-3xl max-w-2xl w-full p-6 sm:p-7 max-h-[85vh] overflow-y-auto shadow-2xl space-y-5 relative card-3d transform-3d transition-colors">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/20 shadow-sm">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-mono flex items-center gap-2">
              Select Active Security Rules
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {enabledCount} of {rules.length} security checks enabled for active project scans
            </p>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 text-xs font-mono">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Scanning Profile: <strong className="text-cyan-700 dark:text-cyan-400">{enabledCount === rules.length ? 'Full Protection' : 'Custom Rules'}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSetAll(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-[11px] font-bold hover:bg-emerald-200 transition-colors"
            >
              Enable All
            </button>
            <button
              onClick={() => handleSetAll(false)}
              className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-300 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Rules Checklist */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {rules.map(rule => (
            <div
              key={rule.id}
              onClick={() => handleToggle(rule.id, rule.enabled)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                rule.enabled
                  ? 'bg-cyan-50/50 dark:bg-[#0d1322] border-cyan-500/40 shadow-sm'
                  : 'bg-slate-50 dark:bg-[#090d18] border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="space-y-0.5 truncate flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {rule.code}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white font-mono truncate">
                    {rule.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans truncate">
                  {rule.shortDescription}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <SeverityBadge severity={rule.defaultSeverity} size="sm" />
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={() => handleToggle(rule.id, rule.enabled)}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-400 border-slate-300 cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {onNavigateToGuide && (
            <button
              onClick={() => {
                onClose();
                onNavigateToGuide();
              }}
              className="text-xs font-mono font-bold text-cyan-700 dark:text-cyan-400 hover:underline flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" /> Open Full Security Guide & Code Diffs
            </button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow ml-auto"
          >
            Apply & Save ({enabledCount} Active)
          </button>
        </div>
      </div>
    </div>
  );
};
