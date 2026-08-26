import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Flame,
  RotateCcw,
  Zap,
  Key,
  Shield,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { api } from '../lib/api';
import { AIProviderConfig } from '../types';

export const AIProvidersPage: React.FC = () => {
  const [providers, setProviders] = useState<AIProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyInput, setKeyInput] = useState<{ [id: string]: string }>({});
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const fetchProviders = async () => {
    try {
      const res = await api.getAIProviders();
      setProviders(res.providers || []);
    } catch (err) {
      console.error('Error loading AI providers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    const interval = setInterval(fetchProviders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSetStatus = async (id: string, status: string, cooldownSec: number = 60) => {
    try {
      await api.updateProviderStatus(id, status, cooldownSec);
      await fetchProviders();
      setMsg(`Provider ${id} status updated to ${status}`);
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      console.error(err);
    }
  };

  const getTierBadge = (id: string, model: string) => {
    if (id.includes('claude-3-7') || model.includes('claude-3-7')) {
      return {
        label: '🧠 Tier 1: Claude 3.7 (Thinking)',
        color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-300'
      };
    }
    if (id.includes('claude-3-6') || model.includes('claude-3-6')) {
      return {
        label: '🛡️ Tier 2: Claude 3.6 (IaC & AST Auditor)',
        color: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/15 dark:border-purple-500/30 dark:text-purple-300'
      };
    }
    if (id.includes('claude-3-5') || model.includes('claude-3-5')) {
      return {
        label: '⚡ Tier 3: Claude 3.5 (Security Logic)',
        color: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-300'
      };
    }
    if (id === 'antigravity-pro' || model.includes('pro')) {
      return {
        label: '🔍 Tier 4: Pro (Logic Auditor)',
        color: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-500/15 dark:border-cyan-500/30 dark:text-cyan-300'
      };
    }
    if (id === 'antigravity-flash' || model.includes('flash')) {
      return {
        label: '⚡ Tier 5: Flash (Fast Scanner)',
        color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/15 dark:border-blue-500/30 dark:text-blue-300'
      };
    }
    if (id === 'antigravity-flash-lite' || model.includes('flash_lite')) {
      return {
        label: '🔒 Tier 6: Flash-Lite (Secret Guard)',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-300'
      };
    }
    return {
      label: '🔄 Adaptive Hybrid Core',
      color: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-700/40 dark:border-slate-600 dark:text-slate-300'
    };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-400 text-xs font-mono font-bold border border-cyan-300 dark:border-cyan-500/20">
              ANTIGRAVITY AI MULTI-MODEL ROUTER
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono font-semibold">INTELLIGENT TIERING</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            AI Router & Antigravity Model Hub
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Seamlessly coordinates Antigravity Pro, Flash, Flash-Lite, and Claude models with automatic failover and secret masking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-xs font-mono font-bold shadow-sm">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600 dark:text-emerald-400" /> Antigravity Core Active
          </span>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 text-cyan-900 dark:text-cyan-300 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>{msg}</span>
        </div>
      )}

      {/* Antigravity Model Tiers Explainer Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111726]/90 border border-slate-200 dark:border-[#1f293d] shadow-md dark:shadow-xl card-3d transform-3d transition-colors">
        <h3 className="text-xs font-bold uppercase font-mono text-cyan-700 dark:text-cyan-400 mb-3 tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> Antigravity AI Model Tiering & Detection Architecture:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0d1322] border border-purple-200 dark:border-purple-500/20 space-y-1 shadow-sm">
            <span className="text-purple-800 dark:text-purple-300 font-bold block">1. Claude 3.7 (Thinking)</span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400">Deep step-by-step reasoning & vulnerability remediation</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0d1322] border border-cyan-200 dark:border-cyan-500/20 space-y-1 shadow-sm">
            <span className="text-cyan-800 dark:text-cyan-300 font-bold block">2. Claude 3.6 / Pro</span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400">Multi-file AST pattern validation & security heuristics</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0d1322] border border-emerald-200 dark:border-emerald-500/20 space-y-1 shadow-sm">
            <span className="text-emerald-800 dark:text-emerald-300 font-bold block">3. Flash-Lite</span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400">Sub-second secret masking & high-speed token triage</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0d1322] border border-slate-200 dark:border-slate-700 space-y-1 shadow-sm">
            <span className="text-slate-800 dark:text-slate-200 font-bold block">4. Inherit / Adaptive</span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400">Auto-routes to highest available capacity with 429 failover</span>
          </div>
        </div>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {providers.map((p) => {
          const isAvailable = p.status === 'AVAILABLE';
          const isCooldown = p.status === 'COOLDOWN';
          const isQuota = p.status === 'QUOTA_REACHED';
          const tier = getTierBadge(p.id, p.model);

          return (
            <div
              key={p.id}
              className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3 card-3d transform-3d ${
                isAvailable
                  ? 'bg-white dark:bg-[#111726]/90 border-cyan-300 dark:border-cyan-500/30 shadow-md'
                  : isCooldown
                  ? 'bg-white dark:bg-[#111726]/90 border-amber-300 dark:border-amber-500/30 shadow-md'
                  : 'bg-white dark:bg-[#111726]/80 border-rose-300 dark:border-rose-500/30 opacity-80 shadow-md'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="truncate">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white font-mono truncate">{p.name}</h3>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono block truncate">
                      {p.model}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  {isAvailable && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 text-[9px] font-mono font-bold flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                      AVAILABLE
                    </span>
                  )}
                  {isCooldown && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 text-[9px] font-mono font-bold flex items-center gap-1 shrink-0 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      COOLDOWN
                    </span>
                  )}
                  {isQuota && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/15 border border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-[9px] font-mono font-bold flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      QUOTA
                    </span>
                  )}
                </div>

                <div className={`p-1.5 rounded-lg text-[10px] font-mono font-bold border ${tier.color} mb-2.5 truncate`}>
                  {tier.label}
                </div>

                {/* Telemetry Metrics */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0d1322] border border-slate-200 dark:border-[#1f293d] space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-slate-500 dark:text-slate-500">Priority:</span>
                    <span className="font-bold text-cyan-700 dark:text-cyan-300">#{p.priority}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-slate-500 dark:text-slate-500">Scans Done:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{p.requestCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-slate-500 dark:text-slate-500">Error Count:</span>
                    <span className="font-bold text-rose-700 dark:text-rose-400">{p.errorCount}</span>
                  </div>
                </div>
              </div>

              {/* Simulation Controls */}
              <div className="pt-2 border-t border-slate-200 dark:border-[#1f293d] space-y-1.5">
                <span className="text-[9px] uppercase font-mono text-slate-500 block font-bold">
                  Failover Simulator
                </span>
                <div className="grid grid-cols-3 gap-1 text-[9px] font-mono font-bold">
                  <button
                    onClick={() => handleSetStatus(p.id, 'AVAILABLE')}
                    className="py-1 px-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 text-center transition-colors"
                  >
                    🟢 Active
                  </button>
                  <button
                    onClick={() => handleSetStatus(p.id, 'COOLDOWN', 45)}
                    className="py-1 px-1 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/20 text-center transition-colors"
                  >
                    🟡 429
                  </button>
                  <button
                    onClick={() => handleSetStatus(p.id, 'QUOTA_REACHED')}
                    className="py-1 px-1 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/20 text-center transition-colors"
                  >
                    🔴 Quota
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
