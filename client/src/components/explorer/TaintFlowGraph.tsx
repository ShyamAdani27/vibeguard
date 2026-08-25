import React, { useState } from 'react';
import {
  GitCommit,
  ArrowRight,
  ShieldAlert,
  Terminal,
  Database,
  Code2,
  Cpu,
  Sparkles,
  ExternalLink,
  Layers
} from 'lucide-react';
import { TaintGraph, TaintNode } from '../../lib/taintGraphClientService';

interface TaintFlowGraphProps {
  graphs: TaintGraph[];
  onSelectNode?: (node: TaintNode) => void;
}

export const TaintFlowGraph: React.FC<TaintFlowGraphProps> = ({ graphs, onSelectNode }) => {
  const [selectedGraphIndex, setSelectedGraphIndex] = useState<number>(0);
  const [activeNode, setActiveNode] = useState<TaintNode | null>(null);

  if (!graphs || graphs.length === 0) {
    return (
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <Layers className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <h4 className="text-white font-medium mb-1">No Active Taint Flow Detected</h4>
        <p className="text-xs text-slate-500">Run a security scan to trace data flow paths from Source to Sink.</p>
      </div>
    );
  }

  const activeGraph = graphs[selectedGraphIndex] || graphs[0];

  return (
    <div className="bg-[#0b101b] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header & Graph Selector */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-[#0e1424]">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Interactive Taint Flow Graph
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-1 font-mono">
                <Sparkles className="w-2.5 h-2.5" /> Antigravity Claude 3.7 Thinking
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{activeGraph.title}</p>
          </div>
        </div>

        {graphs.length > 1 && (
          <div className="flex items-center gap-1 bg-[#161f36] p-1 rounded-lg border border-slate-700">
            {graphs.map((g, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedGraphIndex(idx);
                  setActiveNode(null);
                }}
                className={`text-xs px-3 py-1 rounded font-mono transition-colors ${
                  selectedGraphIndex === idx
                    ? 'bg-cyan-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Trace #{idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Summary Banner */}
      <div className="px-5 py-2.5 bg-rose-500/10 border-b border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <strong>Taint Vector:</strong> {activeGraph.summary}
        </span>
        <span className="text-[11px] text-slate-400">Click any node to navigate in editor</span>
      </div>

      {/* Interactive Visual Graph Canvas */}
      <div className="p-8 flex flex-col md:flex-row items-center justify-center gap-6 overflow-x-auto min-h-[260px] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        {activeGraph.nodes.map((node, idx) => {
          const isSource = node.type === 'SOURCE';
          const isTransform = node.type === 'TRANSFORM';
          const isSink = node.type === 'SINK';
          const isSelected = activeNode?.id === node.id;

          return (
            <React.Fragment key={node.id}>
              {/* Node Card */}
              <div
                onClick={() => {
                  setActiveNode(node);
                  if (onSelectNode) onSelectNode(node);
                }}
                className={`relative cursor-pointer transition-all duration-200 group w-72 rounded-xl p-4 border text-left shadow-lg ${
                  isSelected
                    ? 'ring-2 ring-cyan-400 scale-105'
                    : 'hover:scale-102'
                } ${
                  isSource
                    ? 'bg-[#181a24] border-amber-500/40 hover:border-amber-400 shadow-amber-500/5'
                    : isTransform
                    ? 'bg-[#131d2e] border-cyan-500/40 hover:border-cyan-400 shadow-cyan-500/5'
                    : 'bg-[#24131b] border-rose-500/50 hover:border-rose-400 shadow-rose-500/10'
                }`}
              >
                {/* Node Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      isSource
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : isTransform
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {isSource ? '🔴 SOURCE (Input)' : isTransform ? '🔵 TRANSFORM' : '🟣 SINK (Execution)'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
                    Line {node.line} <ExternalLink className="w-3 h-3" />
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white mb-1 truncate">{node.label}</h4>
                <p className="text-xs text-slate-400 font-mono truncate mb-2">{node.file}:{node.line}</p>

                {/* Code Snippet Box */}
                <div className="bg-black/50 rounded-lg p-2 font-mono text-[11px] text-slate-300 border border-slate-800 overflow-x-auto truncate">
                  <code>{node.codeSnippet}</code>
                </div>
              </div>

              {/* Connecting Taint Arrow */}
              {idx < activeGraph.nodes.length - 1 && (
                <div className="flex flex-col items-center justify-center text-slate-500 my-2 md:my-0">
                  <div className="hidden md:flex items-center gap-1 text-rose-400 animate-pulse font-mono text-[10px]">
                    <span className="h-[2px] w-8 bg-rose-500/60" />
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-rose-400/80 mt-1 max-w-[120px] text-center hidden md:block">
                    Taint Passed
                  </span>
                  <div className="md:hidden text-rose-400 animate-bounce">
                    ↓
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Footer Node Details */}
      {activeNode && (
        <div className="p-4 bg-[#0e1424] border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300">Selected: <strong>{activeNode.file} (Line {activeNode.line})</strong></span>
          </div>
          <span className="text-cyan-400 font-mono">Jumped to Monaco Line {activeNode.line} ✓</span>
        </div>
      )}
    </div>
  );
};
