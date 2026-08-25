import React from 'react';
import { DiffEditor } from '@monaco-editor/react';

interface DiffViewerProps {
  originalCode: string;
  modifiedCode: string;
  language?: string;
  height?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalCode,
  modifiedCode,
  language = 'javascript',
  height = '280px'
}) => {
  return (
    <div className="border border-[#1f293d] rounded-xl overflow-hidden bg-[#0c111d]">
      <div className="bg-[#090d18] px-4 py-2 border-b border-[#1f293d] flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-rose-400 font-bold">🔴 Before (Vulnerable)</span>
          <span>→</span>
          <span className="text-emerald-400 font-bold">🟢 After (AI Secure Fix)</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">Monaco Diff Inspector</span>
      </div>

      <div style={{ height }}>
        <DiffEditor
          height="100%"
          language={language}
          original={originalCode}
          modified={modifiedCode}
          theme="vs-dark"
          options={{
            readOnly: true,
            renderSideBySide: true,
            minimap: { enabled: false },
            fontSize: 12,
            fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: 'on'
          }}
        />
      </div>
    </div>
  );
};
