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

  const handleSaveKey = async (id: string) => {
    const key = keyInput[id];
    if (!key) return;

    try {
      await api.saveProviderApiKey(id, key);
      setActiveModalId(null);
      setKeyInput((prev) => ({ ...prev, [id]: '' }));
      await fetchProviders();
      setMsg(`API Key configured securely in backend pool for ${id}`);
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      console.error(err);
    }
  };

  const getTierBadge = (id: string, model: string) => {
    if (id === 'antigravity-pro' || model.includes('pro')) {
      return {
        label: '🧠 Pro: Multi-File Taint & Auth Auditor',
        color: 'bg-purple-500/15 border-purple-500/30 text-purple-300'
      };
    }
    if (id === 'antigravity-flash' || model.includes('flash')) {
      return {
        label: '⚡ Flash: AST & Prompt Risk Engine',
        color: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
      };
    }
    if (id === 'antigravity-flash-lite' || model.includes('flash_lite')) {
      return {
        label: '🛡️ Flash-Lite: Ultralight Secret Filter',
        color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
      };
    }
    return {
      label: '🔄 Adaptive Orchestrator',
      color: 'bg-slate-700/40 border-slate-600 text-slate-300'
    };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold border border-cyan-500/20">
              ANTIGRAVITY AI MULTI-MODEL ROUTER
            </span>
            <span className="text-xs text-slate-400 font-mono">INTELLIGENT TIERING</span>
          </div>
          <h2 className="text-xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            AI Router & Antigravity Model Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Seamlessly coordinates Antigravity Pro, Flash, Flash-Lite, and Gemini API keys with automatic failover and secret masking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> Antigravity Core Active
          </span>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{msg}</span>
        </div>
      )}

      {/* Antigravity Model Tiers Explainer Card */}
      <div className="p-5 rounded-xl bg-[#111726]/90 border border-[#1f293d] shadow-lg">
        <h3 className="text-xs font-bold uppercase font-mono text-cyan-400 mb-3 tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> Antigravity AI Model Tiering & Detection Architecture:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#0d1322] border border-purple-500/20 space-y-1">
            <span className="text-purple-300 font-bold block">1. Antigravity Pro</span>
            <span className="text-[11px] text-slate-400">Multi-file taint tracking, auth bypasses & verified patch synthesis</span>
          </div>
          <div className="p-3 rounded-lg bg-[#0d1322] border border-cyan-500/20 space-y-1">
            <span className="text-cyan-300 font-bold block">2. Antigravity Flash</span>
            <span className="text-[11px] text-slate-400">Pre-Code prompt risk checks, SQLi, XSS & input validation analysis</span>
          </div>
          <div className="p-3 rounded-lg bg-[#0d1322] border border-emerald-500/20 space-y-1">
            <span className="text-emerald-300 font-bold block">3. Flash-Lite</span>
            <span className="text-[11px] text-slate-400">Sub-second secret masking, credential detection & regex token triage</span>
          </div>
          <div className="p-3 rounded-lg bg-[#0d1322] border border-slate-700 space-y-1">
            <span className="text-slate-200 font-bold block">4. Inherit / Adaptive</span>
            <span className="text-[11px] text-slate-400">Auto-routes to highest available capacity with automatic 429 failover</span>
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
              className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                isAvailable
                  ? 'bg-[#111726]/90 border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                  : isCooldown
                  ? 'bg-[#111726]/90 border-amber-500/30'
                  : 'bg-[#111726]/80 border-rose-500/30 opacity-80'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="truncate">
                    <h3 className="text-xs font-bold text-white font-mono truncate">{p.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">
                      {p.model}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  {isAvailable && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                      AVAILABLE
                    </span>
                  )}
                  {isCooldown && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[9px] font-mono font-bold flex items-center gap-1 shrink-0 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      COOLDOWN
                    </span>
                  )}
                  {isQuota && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[9px] font-mono font-bold flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      QUOTA
                    </span>
                  )}
                </div>

                <div className={`p-1.5 rounded text-[10px] font-mono font-semibold border ${tier.color} mb-2.5 truncate`}>
                  {tier.label}
                </div>

                {/* Telemetry Metrics */}
                <div className="p-2.5 rounded-lg bg-[#0d1322] border border-[#1f293d] space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">Priority:</span>
                    <span className="font-bold text-cyan-300">#{p.priority}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">Scans Done:</span>
                    <span className="font-bold text-white">{p.requestCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">Error Count:</span>
                    <span className="font-bold text-rose-400">{p.errorCount}</span>
                  </div>
                </div>
              </div>

              {/* Simulation Controls */}
              <div className="pt-2 border-t border-[#1f293d] space-y-1.5">
                <span className="text-[9px] uppercase font-mono text-slate-500 block font-bold">
                  Failover Simulator
                </span>
                <div className="grid grid-cols-3 gap-1 text-[9px] font-mono font-bold">
                  <button
                    onClick={() => handleSetStatus(p.id, 'AVAILABLE')}
                    className="py-1 px-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-center"
                  >
                    🟢 Active
                  </button>
                  <button
                    onClick={() => handleSetStatus(p.id, 'COOLDOWN', 45)}
                    className="py-1 px-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-center"
                  >
                    🟡 429
                  </button>
                  <button
                    onClick={() => handleSetStatus(p.id, 'QUOTA_REACHED')}
                    className="py-1 px-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-center"
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
