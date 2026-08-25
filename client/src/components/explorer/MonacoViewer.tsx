import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { ProjectFile, Vulnerability } from '../../types';
import { FileCode, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface MonacoViewerProps {
  file: ProjectFile | null;
  activeVulnerability: Vulnerability | null;
  onCodeChange?: (newCode: string) => void;
}

export const MonacoViewer: React.FC<MonacoViewerProps> = ({
  file,
  activeVulnerability,
  onCodeChange
}) => {
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom dark cyber theme
    monaco.editor.defineTheme('vibeguard-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: '00f2fe', fontStyle: 'bold' },
        { token: 'string', foreground: '50fa7b' },
        { token: 'number', foreground: 'bd93f9' },
        { token: 'identifier', foreground: 'f8f8f2' },
      ],
      colors: {
        'editor.background': '#0c111d',
        'editor.foreground': '#f8f8f2',
        'editor.lineHighlightBackground': '#141d30',
        'editorLineNumber.foreground': '#3e4c6d',
        'editorLineNumber.activeForeground': '#00f2fe',
        'editorCursor.foreground': '#00f2fe',
        'editor.selectionBackground': '#00f2fe33',
        'editorGutter.background': '#0a0e18'
      }
    });

    monaco.editor.setTheme(theme === 'dark' ? 'vibeguard-dark' : 'vs');

    // If active vulnerability exists on mount, highlight and reveal line immediately
    highlightAndScrollToVuln();
  };

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === 'dark' ? 'vibeguard-dark' : 'vs');
    }
  }, [theme]);

  const highlightAndScrollToVuln = () => {
    if (!editorRef.current || !monacoRef.current || !activeVulnerability || !file) return;

    if (activeVulnerability.file === file.path && activeVulnerability.line > 0) {
      const editor = editorRef.current;
      const monaco = monacoRef.current;
      const line = activeVulnerability.line;

      // Scroll and focus line
      editor.revealLineInCenter(line);
      editor.setPosition({ lineNumber: line, column: 1 });
      editor.focus();

      const isCritical = activeVulnerability.severity === 'CRITICAL';

      const newDecorations = [
        {
          range: new monaco.Range(line, 1, line, 1),
          options: {
            isWholeLine: true,
            className: isCritical ? 'monaco-vuln-line-critical' : 'monaco-vuln-line-high',
            glyphMarginClassName: isCritical ? 'monaco-vuln-glyph-critical' : 'monaco-vuln-glyph-high',
            linesDecorationsClassName: isCritical ? 'monaco-vuln-line-num-critical' : '',
            overviewRuler: {
              color: isCritical ? '#f43f5e' : '#f59e0b',
              position: monaco.editor.OverviewRulerLane.Full
            }
          }
        }
      ];

      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
    } else {
      if (editorRef.current) {
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
      }
    }
  };

  // Line highlighting when active vulnerability or file changes
  useEffect(() => {
    highlightAndScrollToVuln();
  }, [activeVulnerability, file?.path]);

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0c111d] dark:bg-[#0c111d] bg-white text-slate-500 p-8 text-center font-mono transition-colors">
        <FileCode className="w-12 h-12 mb-3 text-slate-400" />
        <h4 className="text-sm font-semibold text-slate-300 dark:text-slate-300 text-slate-700">No File Selected</h4>
        <p className="text-xs text-slate-500 mt-1">Select a file or finding from the explorer tree to inspect source code and vulnerabilities.</p>
      </div>
    );
  }

  const isVulnOnFile = activeVulnerability && activeVulnerability.file === file.path;

  return (
    <div className="h-full flex flex-col bg-[#0c111d] dark:bg-[#0c111d] bg-white overflow-hidden transition-colors">
      {/* File Header Tab */}
      <div className="h-10 bg-[#090d18] dark:bg-[#090d18] bg-slate-100 border-b border-[#1f293d] dark:border-[#1f293d] border-slate-200 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 truncate">
          <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-mono font-bold text-white dark:text-white text-slate-900 tracking-wide truncate">
            {file.path}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 dark:bg-slate-800 bg-slate-200 text-slate-300 dark:text-slate-300 text-slate-700 shrink-0">
            {file.language}
          </span>
          {file.isSensitive && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              SENSITIVE (MASKED)
            </span>
          )}
        </div>

        {isVulnOnFile && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 dark:text-rose-300 text-rose-800 text-xs font-mono shrink-0 animate-pulse">
            <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>
              Detected on Line <strong className="underline decoration-rose-500 decoration-2 font-black">{activeVulnerability.line}</strong>: {activeVulnerability.type}
            </span>
          </div>
        )}
      </div>

      {/* Editor Container */}
      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          language={
            file.language === 'javascript' || file.name.endsWith('.js')
              ? 'javascript'
              : file.language === 'typescript' || file.name.endsWith('.ts') || file.name.endsWith('.tsx')
              ? 'typescript'
              : file.language === 'json' || file.name.endsWith('.json')
              ? 'json'
              : file.name.endsWith('.html')
              ? 'html'
              : file.name.endsWith('.css')
              ? 'css'
              : 'plaintext'
          }
          value={file.content}
          theme={theme === 'dark' ? 'vibeguard-dark' : 'vs'}
          onMount={handleEditorDidMount}
          onChange={(val) => onCodeChange && onCodeChange(val || '')}
          options={{
            readOnly: true,
            minimap: { enabled: true },
            fontSize: 13,
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            glyphMargin: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            renderLineHighlight: 'all',
            fontFamily: 'Fira Code, JetBrains Mono, monospace'
          }}
        />
      </div>
    </div>
  );
};
