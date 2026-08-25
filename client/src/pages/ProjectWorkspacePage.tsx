import React, { useEffect } from 'react';
import { FileTree } from '../components/explorer/FileTree';
import { MonacoViewer } from '../components/explorer/MonacoViewer';
import { FindingInspectorDrawer } from '../components/scanner/FindingInspectorDrawer';
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
  Eye
} from 'lucide-react';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { SeverityBadge } from '../components/common/SeverityBadge';

export const ProjectWorkspacePage: React.FC = () => {
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
    scanProgress,
    loadSampleProject
  } = useProject();

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

        <div className="flex items-center gap-3">
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

      {/* Main Workspace Body: FileTree + Monaco Editor + Findings Inspector */}
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
    </div>
  );
};
