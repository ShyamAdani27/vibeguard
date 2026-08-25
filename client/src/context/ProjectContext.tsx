import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, ProjectFile, Scan, Vulnerability, ApprovalRequest } from '../types';
import { api } from '../lib/api';
import { scanCodeWithGemini } from '../lib/geminiScanner';

interface ScanProgress {
  isScanning: boolean;
  stage: string;
  progressPercent: number;
}

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  activeFiles: ProjectFile[];
  activeScans: Scan[];
  vulnerabilities: Vulnerability[];
  selectedVuln: Vulnerability | null;
  selectedFile: ProjectFile | null;
  pendingApprovals: ApprovalRequest[];
  scanProgress: ScanProgress;
  loading: boolean;
  setActiveProject: (project: Project | null) => void;
  setSelectedVuln: (v: Vulnerability | null) => void;
  setSelectedFile: (f: ProjectFile | null) => void;
  fetchProjects: () => Promise<void>;
  selectProjectById: (id: string) => Promise<void>;
  scanActiveProject: () => Promise<Scan | null>;
  loadSampleProject: () => Promise<Project>;
  refreshFiles: () => Promise<void>;
  inspectVulnerability: (v: Vulnerability) => void;
  addImportedProject: (project: Project, files: ProjectFile[], scan?: Scan) => void;
  decideApprovalRequest: (approvalId: string, decision: 'APPROVED' | 'REJECTED') => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeFiles, setActiveFiles] = useState<ProjectFile[]>([]);
  const [activeScans, setActiveScans] = useState<Scan[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    isScanning: false,
    stage: '',
    progressPercent: 0
  });

  const fetchProjects = async () => {
    try {
      const res = await api.getProjects();
      setProjects(res.projects || []);
      if (!activeProject && res.projects?.length > 0) {
        const college = res.projects.find(p => p.name === 'College E-Commerce') || res.projects[0];
        setActiveProject(college);
      }
    } catch (err) {
      console.error('[ProjectContext] Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectProjectById = async (id: string) => {
    try {
      const res = await api.getProject(id);
      if (res.project) {
        setActiveProject(res.project);
      }
    } catch (err) {
      console.error('[ProjectContext] Error selecting project:', err);
    }
  };

  const refreshFiles = async () => {
    if (!activeProject) return;
    try {
      const res = await api.getProjectFiles(activeProject.id);
      setActiveFiles(res.files || []);
    } catch (err) {
      console.error('[ProjectContext] Error refreshing files:', err);
    }
  };

  const refreshDataForActiveProject = async () => {
    if (!activeProject) return;
    try {
      const [filesRes, scansRes, vulnsRes] = await Promise.all([
        api.getProjectFiles(activeProject.id),
        api.getProjectScans(activeProject.id),
        api.getVulnerabilities(activeProject.id)
      ]);
      const files = filesRes.files || [];
      setActiveFiles(files);
      setActiveScans(scansRes.scans || []);
      setVulnerabilities(vulnsRes.vulnerabilities || []);

      // If no selected file, default to first or target file
      if (!selectedFile && files.length > 0) {
        const target =
          files.find((f: ProjectFile) => f.path.includes('database.js')) ||
          files.find((f: ProjectFile) => f.path.includes('auth.js')) ||
          files[0];
        setSelectedFile(target);
      }
    } catch (err) {
      console.error('[ProjectContext] Error fetching project details:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (activeProject) {
      refreshDataForActiveProject();
    }
  }, [activeProject?.id]);

  const inspectVulnerability = (v: Vulnerability) => {
    setSelectedVuln(v);
    const matchingFile = activeFiles.find(f => f.path === v.file);
    if (matchingFile) {
      setSelectedFile(matchingFile);
    }
  };

  const scanActiveProject = async (): Promise<Scan | null> => {
    if (!activeProject) return null;

    setScanProgress({ isScanning: true, stage: 'File Discovery & AST Traversal...', progressPercent: 15 });
    
    setTimeout(() => {
      setScanProgress({ isScanning: true, stage: 'Secret Detection & Masking Filter...', progressPercent: 35 });
    }, 400);

    setTimeout(() => {
      setScanProgress({ isScanning: true, stage: 'Routing to Antigravity AI Engine...', progressPercent: 65 });
    }, 800);

    setTimeout(() => {
      setScanProgress({ isScanning: true, stage: 'Evaluating Security Rules & Score Calculation...', progressPercent: 90 });
    }, 1300);

    try {
      let scanResult: Scan | null = null;
      try {
        const res = await api.scanProject(activeProject.id);
        scanResult = res.scan;
        await refreshDataForActiveProject();
        await fetchProjects();
      } catch (backendErr) {
        // Direct Google AI Studio Gemini Cloud Scanner (for Vercel deployment)
        console.log('[ProjectContext] Running cloud Google Gemini security scan...');
        const { scan, vulnerabilities: directVulns } = await scanCodeWithGemini(
          activeProject.id,
          activeFiles
        );
        scanResult = scan;
        setVulnerabilities(directVulns);
        setActiveScans(prev => [scan, ...prev]);
        setActiveProject(prev => prev ? { ...prev, securityScore: scan.securityScore } : null);
      }

      setScanProgress({ isScanning: true, stage: 'Security Scan Complete!', progressPercent: 100 });

      setTimeout(() => {
        setScanProgress({ isScanning: false, stage: '', progressPercent: 0 });
      }, 800);

      return scanResult;
    } catch (err: any) {
      console.error('[ProjectContext] Scan error:', err);
      setScanProgress({ isScanning: false, stage: '', progressPercent: 0 });
      return null;
    }
  };

  const loadSampleProject = async (): Promise<Project> => {
    try {
      const res = await api.loadSampleProject();
      await fetchProjects();
      setActiveProject(res.project);
      setActiveFiles(res.files || []);
      const vulnsRes = await api.getVulnerabilities(res.project.id);
      setVulnerabilities(vulnsRes.vulnerabilities || []);
      return res.project;
    } catch (err) {
      console.error('Error loading sample project:', err);
      throw err;
    }
  };

  const addImportedProject = (project: Project, files: ProjectFile[], scan?: Scan) => {
    setProjects(prev => [project, ...prev.filter(p => p.id !== project.id)]);
    setActiveProject(project);
    setActiveFiles(files);
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
    if (scan) {
      setActiveScans(prev => [scan, ...prev]);
      if (scan.vulnerabilities) {
        setVulnerabilities(scan.vulnerabilities);
      }
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        activeFiles,
        activeScans,
        vulnerabilities,
        selectedVuln,
        selectedFile,
        scanProgress,
        loading,
        setActiveProject,
        setSelectedVuln,
        setSelectedFile,
        fetchProjects,
        selectProjectById,
        scanActiveProject,
        loadSampleProject,
        refreshFiles,
        inspectVulnerability,
        addImportedProject,
        pendingApprovals: [],
        decideApprovalRequest: async () => {}
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};
