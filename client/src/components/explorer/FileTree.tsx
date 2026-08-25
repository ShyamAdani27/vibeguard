import React, { useState, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  Lock,
  ChevronRight,
  ChevronDown,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { ProjectFile, Vulnerability } from '../../types';

interface FileTreeProps {
  files: ProjectFile[];
  selectedFile: ProjectFile | null;
  onSelectFile: (file: ProjectFile) => void;
  vulnerabilities: Vulnerability[];
}

interface TreeNode {
  name: string;
  path: string;
  file?: ProjectFile;
  children: { [key: string]: TreeNode };
}

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  selectedFile,
  onSelectFile,
  vulnerabilities
}) => {
  const [openFolders, setOpenFolders] = useState<{ [path: string]: boolean }>({});

  // Auto-expand all folders containing the selected file
  useEffect(() => {
    if (selectedFile) {
      const parts = selectedFile.path.split('/');
      const foldersToOpen: { [path: string]: boolean } = {};
      for (let i = 1; i < parts.length; i++) {
        const folderPath = parts.slice(0, i).join('/');
        foldersToOpen[folderPath] = true;
      }
      setOpenFolders((prev) => ({ ...prev, ...foldersToOpen }));
    }
  }, [selectedFile?.path]);

  // Build tree from flat file list
  const root: TreeNode = { name: 'root', path: '', children: {} };

  files.forEach((file) => {
    const parts = file.path.split('/');
    let current = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const currentPath = parts.slice(0, index + 1).join('/');

      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          path: currentPath,
          file: isFile ? file : undefined,
          children: {}
        };
      }
      current = current.children[part];
    });
  });

  const toggleFolder = (path: string) => {
    setOpenFolders((prev) => ({ ...prev, [path]: !(prev[path] ?? true) }));
  };

  // Get direct vulnerabilities for a file
  const getFileVulns = (path: string) => {
    return vulnerabilities.filter((v) => v.file === path);
  };

  // Get recursive vulnerabilities inside a folder & its subfolders
  const getFolderVulns = (folderPath: string) => {
    const prefix = folderPath ? `${folderPath}/` : '';
    return vulnerabilities.filter(
      (v) => v.file === folderPath || v.file.startsWith(prefix)
    );
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isFolder = Object.keys(node.children).length > 0 && !node.file;
    const isOpen = openFolders[node.path] ?? true;
    const isSelected = selectedFile?.path === node.path;

    if (node.name === 'root') {
      return (
        <div className="space-y-0.5">
          {Object.values(node.children).map((child) => renderNode(child, 0))}
        </div>
      );
    }

    if (isFolder) {
      const folderVulns = getFolderVulns(node.path);
      const hasCritical = folderVulns.some((v) => v.severity === 'CRITICAL');
      const hasHigh = folderVulns.some((v) => v.severity === 'HIGH');

      return (
        <div key={node.path} className="select-none">
          <button
            onClick={() => toggleFolder(node.path)}
            style={{ paddingLeft: `${depth * 14 + 8}px` }}
            className="w-full flex items-center justify-between py-1.5 px-2 rounded text-xs font-medium text-slate-300 dark:text-slate-300 text-slate-700 hover:text-white dark:hover:text-white hover:text-slate-900 hover:bg-[#141d30] dark:hover:bg-[#141d30] hover:bg-slate-200 transition-colors group text-left"
          >
            <div className="flex items-center gap-1.5 truncate">
              {isOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              {isOpen ? (
                <FolderOpen className="w-4 h-4 text-cyan-400 shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-cyan-400 shrink-0" />
              )}
              <span className="font-mono text-[12px] truncate">{node.name}</span>
            </div>

            {/* Folder Error Badge (Shows recursive threat count on folder!) */}
            {folderVulns.length > 0 && (
              <span
                className={`text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded-full shrink-0 flex items-center gap-1 shadow-sm ${
                  hasCritical
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-rose-500/10'
                    : hasHigh
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}
                title={`${folderVulns.length} vulnerabilities inside ${node.name}`}
              >
                <Flame className="w-3 h-3 text-rose-400" />
                <span>{folderVulns.length}</span>
              </span>
            )}
          </button>

          {isOpen && (
            <div>
              {Object.values(node.children).map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // File Node
    const fileVulns = getFileVulns(node.path);
    const hasCritical = fileVulns.some((v) => v.severity === 'CRITICAL');
    const hasHigh = fileVulns.some((v) => v.severity === 'HIGH');

    return (
      <button
        key={node.path}
        onClick={() => node.file && onSelectFile(node.file)}
        style={{ paddingLeft: `${depth * 14 + 18}px` }}
        className={`w-full flex items-center justify-between py-1.5 px-2 rounded text-xs font-medium transition-all text-left ${
          isSelected
            ? 'bg-cyan-500/20 text-cyan-200 dark:text-cyan-200 text-cyan-800 border-l-2 border-cyan-400 font-semibold'
            : 'text-slate-400 dark:text-slate-400 text-slate-600 hover:text-slate-200 dark:hover:text-slate-200 hover:text-slate-900 hover:bg-[#131b2c] dark:hover:bg-[#131b2c] hover:bg-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {node.file?.isSensitive ? (
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          ) : (
            <FileCode
              className={`w-3.5 h-3.5 shrink-0 ${
                fileVulns.length > 0 ? 'text-rose-400' : isSelected ? 'text-cyan-400' : 'text-slate-500'
              }`}
            />
          )}
          <span className="font-mono text-[11.5px] truncate">{node.name}</span>
        </div>

        {/* File Vulnerability Error Badge */}
        {fileVulns.length > 0 && (
          <span
            className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded-full shrink-0 flex items-center gap-0.5 shadow-sm ${
              hasCritical
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-rose-500/10'
                : hasHigh
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
            }`}
            title={`${fileVulns.length} vulnerabilities in this file`}
          >
            <Flame className="w-2.5 h-2.5" />
            <span>{fileVulns.length}</span>
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0b101c] dark:bg-[#0b101c] bg-slate-50 border-r border-[#1f293d] dark:border-[#1f293d] border-slate-200 w-64 shrink-0 select-none transition-colors">
      {/* Header */}
      <div className="p-3 border-b border-[#1f293d] dark:border-[#1f293d] border-slate-200 flex items-center justify-between">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 text-slate-600">
          Project Files ({files.length})
        </span>
        <span className="text-[10px] text-cyan-400 font-mono font-bold">AST Tree</span>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {files.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 font-mono">
            No files in project. Upload ZIP or link GitHub.
          </div>
        ) : (
          renderNode(root)
        )}
      </div>

      {/* Sensitive File Notice */}
      <div className="p-2.5 border-t border-[#1f293d] dark:border-[#1f293d] border-slate-200 bg-[#090d17] dark:bg-[#090d17] bg-slate-100 text-[10px] text-slate-400 dark:text-slate-400 text-slate-600 font-mono flex items-center gap-1.5">
        <Lock className="w-3 h-3 text-amber-400 shrink-0" />
        <span>.env & Secrets auto-masked</span>
      </div>
    </div>
  );
};
