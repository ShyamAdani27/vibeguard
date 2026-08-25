import React, { useEffect, useState } from 'react';
import { FileTree } from '../components/explorer/FileTree';
import { MonacoViewer } from '../components/explorer/MonacoViewer';
import { FindingInspectorDrawer } from '../components/scanner/FindingInspectorDrawer';
import { TaintFlowGraph } from '../components/explorer/TaintFlowGraph';
import { useProject } from '../context/ProjectContext';
import { ProjectFile, Vulnerability } from '../types';
import {
  Play,
  Flame,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  FileCode,
  CheckCircle2,
  Lock,
  Eye,
  Layers,
  Code2
} from 'lucide-react';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { extractClientTaintFlows, TaintGraph, TaintNode } from '../lib/taintGraphClientService';

interface ProjectWorkspacePageProps {
  initialView?: 'code' | 'taint';
}

export const ProjectWorkspacePage: React.FC<ProjectWorkspacePageProps> = ({ initialView = 'code' }) => {
  const {
    activeProject,
    activeFiles,
    vulnerabilities,
    selectedFile,
    setSelectedFile,
    selectedVuln,
    setSelectedVuln,
    inspectVulnerability,
    scanActiveProject,
    scanProgress
  } = useProject();

  const [activeTab, setActiveTab] = useState<'code' | 'taint'>(initialView);
  const [taintGraphs, setTaintGraphs] = useState<TaintGraph[]>([]);

  // Generate or extract Taint Flow Graphs
  useEffect(() => {
    if (activeProject && activeFiles.length > 0) {
      const graphs = extractClientTaintFlows(activeFiles, activeProject.id);
      setTaintGraphs(graphs);
    }
  }, [activeProject?.id, activeFiles.length]);

  // Default select first file or vulnerable file if none selected
  useEffect(() => {
    if (activeFiles.length > 0 && !selectedFile) {
      const target =
        activeFiles.find((f) => f.path.includes('database.js')) ||
        activeFiles.find((f) => f.path.includes('auth.js')) ||
        activeFiles[0];
      setSelectedFile(target);
    }
  }, [activeFiles, selectedFile]);

  // When a vulnerability is clicked, open its file, highlight in Monaco, and open drawer
  const handleSelectVuln = (vuln: Vulnerability) => {
    inspectVulnerability(vuln);
  };

  const handleSelectTaintNode = (node: TaintNode) => {
    const targetFile = activeFiles.find(f => f.path === node.file) || activeFiles[0];
    if (targetFile) {
      setSelectedFile(targetFile);
      const matchingVuln = vulnerabilities.find(v => v.file === node.file && v.line === node.line);
      if (matchingVuln) {
        setSelectedVuln(matchingVuln);
      } else {
        setSelectedVuln({
          id: `taint_highlight_${node.line}`,
          scanId: 'taint_scan',
          projectId: activeProject?.id || 'p1',
          file: node.file,
          line: node.line,
          severity: node.severity || 'HIGH',
          type: 'SQL_INJECTION',
          title: node.label,
          description: `Tainted data node in ${node.file} at line ${node.line}.`,
          why: 'Untrusted input propagation path identified by Antigravity Claude 3.7.',
          risk: 'Direct flow into execution sink.',
          recommendation: 'Sanitize input before propagation.',
          codeSnippet: node.codeSnippet,
          detectedBy: 'Antigravity Claude 3.7 (Thinking)',
          status: 'OPEN',
          created_at: new Date().toISOString()
        });
      }
    }
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col -m-6 bg-[#0a0e1a] dark:bg-[#0a0e1a] bg-slate-100 overflow-hidden transition-colors">
      {/* Top Workspace Toolbar */}
      <div className="h-14 bg-[#0d1322] dark:bg-[#0d1322] bg-white border-b border-[#1f293d] dark:border-[#1f293d] border-slate-200 px-5 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white dark:text-white text-slate-900 font-mono uppercase tracking-wider">
              Workspace & Security Inspector
            </h2>
          </div>
          <span className="text-slate-600 dark:text-slate-600 text-slate-300">|</span>
          <span className="text-xs text-slate-300 dark:text-slate-300 text-slate-700 font-mono">
            {activeProject?.name || 'No project selected'}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 dark:text-cyan-300 text-cyan-700 border border-cyan-500/20 font-mono font-bold">
            Score: {activeProject?.securityScore || 100}/100
          </span>
        </div>

        {/* View Switcher: Code Editor vs Taint Flow Graph */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#111726] border border-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-colors ${
                activeTab === 'code'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Code & Monaco
            </button>
            <button
              onClick={() => setActiveTab('taint')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-colors ${
                activeTab === 'taint'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Taint Flow Graph
              <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-400/20 text-cyan-200">AI</span>
            </button>
          </div>

          <button
            onClick={() => scanActiveProject()}
            disabled={scanProgress.isScanning || !activeProject}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 dark:text-cyan-300 text-cyan-700 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {scanProgress.isScanning ? 'Scanning...' : 'Re-Scan Codebase'}
          </button>

          <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5 pl-2 border-l border-[#1f293d] dark:border-[#1f293d] border-slate-200">
            <Flame className="w-4 h-4 text-rose-400" />
            <strong className="text-white dark:text-white text-slate-900">{vulnerabilities.length}</strong> Threats Detected
          </span>
        </div>
      </div>

      {/* Main Workspace Body */}
      {activeTab === 'taint' ? (
        <div className="flex-1 p-6 overflow-y-auto">
          <TaintFlowGraph
            graphs={taintGraphs}
            onSelectNode={(node) => {
              handleSelectTaintNode(node);
              setActiveTab('code');
            }}
          />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: AST File Explorer */}
          <FileTree
            files={activeFiles}
            selectedFile={selectedFile}
            onSelectFile={(f) => {
              setSelectedFile(f);
              if (selectedVuln && selectedVuln.file !== f.path) {
                setSelectedVuln(null);
              }
            }}
            vulnerabilities={vulnerabilities}
          />

          {/* Center Column: Monaco Code Viewer & Bottom Findings Diagnostic Tray */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#0c111d] dark:bg-[#0c111d] bg-white border-r border-[#1f293d] dark:border-[#1f293d] border-slate-200">
            <div className="flex-1 min-h-0">
              <MonacoViewer
                file={selectedFile}
                activeVulnerability={selectedVuln}
              />
            </div>

            {/* Bottom Diagnostic Findings Tray */}
            {vulnerabilities.length > 0 && (
              <div className="h-44 border-t border-[#1f293d] dark:border-[#1f293d] border-slate-200 bg-[#0b101c] dark:bg-[#0b101c] bg-slate-50 flex flex-col shrink-0">
                <div className="px-4 py-2 bg-[#090d18] dark:bg-[#090d18] bg-slate-100 border-b border-[#1f293d] dark:border-[#1f293d] border-slate-200 flex items-center justify-between font-mono">
                  <span className="text-xs font-bold text-white dark:text-white text-slate-800 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    Detected Security Findings ({vulnerabilities.length} Active)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Click any finding to inspect in Monaco Editor & jump directly to line
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                  {vulnerabilities.map((v) => {
                    const isSelected = selectedVuln?.id === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => handleSelectVuln(v)}
                        className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 dark:text-cyan-200 text-cyan-900 shadow-sm shadow-cyan-500/10'
                            : 'bg-[#0d1322] dark:bg-[#0d1322] bg-white border-[#1f293d] dark:border-[#1f293d] border-slate-200 hover:border-cyan-500/30 text-slate-300 dark:text-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <SeverityBadge severity={v.severity} size="sm" />
                          <span className="font-mono text-xs font-bold text-white dark:text-white text-slate-900 truncate">
                            {v.title}
                          </span>
                          <span className="font-mono text-[11px] text-cyan-400 font-bold">
                            {v.file}:{v.line}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <Eye className="w-3 h-3 text-cyan-400" /> View Line {v.line}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            via {v.detectedBy}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Finding Inspector Drawer */}
          {selectedVuln ? (
            <FindingInspectorDrawer
              vulnerability={selectedVuln}
              onClose={() => setSelectedVuln(null)}
            />
          ) : (
            <div className="w-80 bg-[#0d1322] dark:bg-[#0d1322] bg-slate-50 p-6 flex flex-col items-center justify-center text-center font-mono shrink-0 border-l border-[#1f293d] dark:border-[#1f293d] border-slate-200">
              <ShieldCheck className="w-12 h-12 text-slate-500 mb-3" />
              <h4 className="text-xs font-bold text-slate-300 dark:text-slate-300 text-slate-800 uppercase">Detection Inspector Ready</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Select any finding from the bottom diagnostic tray or file tree to inspect WHAT, WHERE, WHY, and jump to the exact highlighted line.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
