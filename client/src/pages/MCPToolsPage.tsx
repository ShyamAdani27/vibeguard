import React, { useEffect, useState } from 'react';
import {
  Boxes,
  CheckCircle2,
  XCircle,
  Radio,
  ExternalLink,
  Shield,
  Layers,
  Terminal
} from 'lucide-react';
import { api } from '../lib/api';
import { MCPTool } from '../types';

export const MCPToolsPage: React.FC = () => {
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTools = async () => {
    try {
      const res = await api.getMCPTools();
      setTools(res.tools || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await api.toggleMCPTool(id);
      await fetchTools();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold border border-cyan-500/20">
            PRD SECTION 22
          </span>
          <span className="text-xs text-slate-400 font-mono">STANDARDIZED PROTOCOL</span>
        </div>
        <h2 className="text-xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
          <Boxes className="w-5 h-5 text-cyan-400" />
          Model Context Protocol (MCP) Security Adapters
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Standardized tool interfaces connecting VibeGuard to enterprise SAST engines, vulnerability databases, and VCS gatekeepers.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map((t) => {
          const isConnected = t.status === 'CONNECTED';
          return (
            <div
              key={t.id}
              className="p-6 rounded-2xl bg-[#111726]/90 border border-[#1f293d] hover:border-cyan-500/40 transition-all shadow-xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white font-mono">{t.name}</h3>
                    <span className="text-xs text-cyan-400 font-mono">{t.type}</span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 border ${
                      isConnected
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-slate-500'
                      }`}
                    />
                    {t.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">{t.description}</p>

                {/* Capabilities */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                    Active Capabilities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {t.capabilities.map((cap, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-[#0d1322] border border-[#1f293d] text-[11px] font-mono text-slate-300"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1f293d] flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">
                  Adapter: Live MCP JSON-RPC
                </span>
                <button
                  onClick={() => handleToggle(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                    isConnected
                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {isConnected ? 'Disconnect' : 'Connect Adapter'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
