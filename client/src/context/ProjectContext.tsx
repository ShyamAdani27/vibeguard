import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, ProjectFile, Scan, Vulnerability, ApprovalRequest } from '../types';
import { api } from '../lib/api';
import { scanCodeWithGemini } from '../lib/geminiScanner';
import { projectStorage } from '../lib/projectStorage';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();
  const userId = user?.id || '';

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);
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

  const setActiveProject = (p: Project | null) => {
    setActiveProjectState(p);
    if (p && userId) {
      projectStorage.saveActiveProjectId(userId, p.id);
    }
  };

  const fetchProjects = async () => {
    if (!userId) {
      setProjects([]);
      setActiveProjectState(null);
      setActiveFiles([]);
      setVulnerabilities([]);
      setLoading(false);
      return;
    }

    try {
      // 1. Load strictly for THIS user from Persistent Storage (LocalStorage + Supabase)
      const stored = await projectStorage.loadProjects(userId);
      
      // 2. Also try API backend if online (filtered strictly by userId)
      let mergedProjects = [...stored];
      try {
        const res = await api.getProjects();
        if (res.projects && res.projects.length > 0) {
          // Strict user check: only include projects owned by this user
          const userProjects = res.projects.filter((ap: Project) => ap.userId === userId);
          for (const ap of userProjects) {
            if (!mergedProjects.some(mp => mp.id === ap.id)) {
              mergedProjects.push(ap);
            }
          }
        }
      } catch (e) {
        // Offline / static host
      }

      setProjects(mergedProjects);

      // Restore active project strictly for THIS user
      const savedActiveId = projectStorage.loadActiveProjectId(userId);
      const restored = mergedProjects.find(p => p.id === savedActiveId) || (mergedProjects.length > 0 ? mergedProjects[0] : null);
      setActiveProjectState(restored);
    } catch (err) {
      console.error('[ProjectContext] Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectProjectById = async (id: string) => {
    const found = projects.find(p => p.id === id);
    if (found) {
      setActiveProject(found);
      return;
    }
    try {
      const res = await api.getProject(id);
      if (res.project && res.project.userId === userId) {
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
      if (res.files && res.files.length > 0) {
        setActiveFiles(res.files);
        projectStorage.saveFiles(activeProject.id, res.files);
        return;
      }
    } catch (err) {}

    // Persistent storage fallback
    const localFiles = projectStorage.loadFiles(activeProject.id);
    if (localFiles.length > 0) {
      setActiveFiles(localFiles);
    }
  };

  const refreshDataForActiveProject = async () => {
    if (!activeProject) {
      setActiveFiles([]);
      setVulnerabilities([]);
      setActiveScans([]);
      setSelectedFile(null);
      setSelectedVuln(null);
      return;
    }

    // 1. Immediately hydrate from local persistent storage for instant zero-latency render
    const storedFiles = projectStorage.loadFiles(activeProject.id);
    const storedVulns = projectStorage.loadVulns(activeProject.id);
    const storedScans = projectStorage.loadScans(activeProject.id);

    if (storedFiles.length > 0) setActiveFiles(storedFiles);
    if (storedVulns.length > 0) setVulnerabilities(storedVulns);
    if (storedScans.length > 0) setActiveScans(storedScans);

    if (storedFiles.length > 0 && !selectedFile) {
      setSelectedFile(storedFiles[0]);
    }

    // 2. Try fetching updated data from API if online
    try {
      const [filesRes, scansRes, vulnsRes] = await Promise.all([
        api.getProjectFiles(activeProject.id).catch(() => ({ files: [] })),
        api.getProjectScans(activeProject.id).catch(() => ({ scans: [] })),
        api.getVulnerabilities(activeProject.id).catch(() => ({ vulnerabilities: [] }))
      ]);

      const files = filesRes.files || [];
      const scans = scansRes.scans || [];
      const vulns = vulnsRes.vulnerabilities || [];

      if (files.length > 0) {
        setActiveFiles(files);
        projectStorage.saveFiles(activeProject.id, files);
      }
      if (scans.length > 0) {
        setActiveScans(scans);
        projectStorage.saveScans(activeProject.id, scans);
      }
      if (vulns.length > 0) {
        setVulnerabilities(vulns);
        projectStorage.saveVulns(activeProject.id, vulns);
      }

      if (!selectedFile && files.length > 0) {
        const target =
          files.find((f: ProjectFile) => f.path.includes('database.js')) ||
          files.find((f: ProjectFile) => f.path.includes('auth.js')) ||
          files[0];
        setSelectedFile(target);
      }
    } catch (err) {
      console.warn('[ProjectContext] Network sync notice, using persistent local storage:', err);
    }
  };

  // Reset and reload strictly when user changes (e.g. login with different account)
  useEffect(() => {
    setProjects([]);
    setActiveProjectState(null);
    setActiveFiles([]);
    setVulnerabilities([]);
    setActiveScans([]);
    setSelectedFile(null);
    setSelectedVuln(null);
    fetchProjects();
  }, [userId]);

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
      setScanProgress({ isScanning: true, stage: 'Routing to Antigravity AI Engine (Claude 3.7 / Pro)...', progressPercent: 65 });
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
        // Direct Hybrid & Gemini Cloud Scanner
        console.log('[ProjectContext] Running cloud Google Gemini security scan...');
        const { scan, vulnerabilities: directVulns } = await scanCodeWithGemini(
          activeProject.id,
          activeFiles,
          userId
        );
        scanResult = scan;
        setVulnerabilities(directVulns);
        setActiveScans(prev => [scan, ...prev]);
        setActiveProjectState(prev => prev ? { ...prev, securityScore: scan.securityScore } : null);

        // Save scan and vulns to persistent storage
        projectStorage.saveVulns(activeProject.id, directVulns);
        projectStorage.saveScans(activeProject.id, [scan, ...activeScans]);
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
      if (res.project) {
        res.project.userId = userId;
      }
      addImportedProject(res.project, res.files || []);
      return res.project;
    } catch (err) {
      console.error('Error loading sample project:', err);
      throw err;
    }
  };

  const addImportedProject = (project: Project, files: ProjectFile[], scan?: Scan) => {
    project.userId = userId;
    const updatedProjects = [project, ...projects.filter(p => p.id !== project.id)];
    setProjects(updatedProjects);
    setActiveProject(project);
    setActiveFiles(files);
    
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
    if (scan) {
      setActiveScans(prev => [scan, ...prev]);
      if (scan.vulnerabilities) {
        setVulnerabilities(scan.vulnerabilities);
        projectStorage.saveVulns(project.id, scan.vulnerabilities);
      }
      projectStorage.saveScans(project.id, [scan]);
    }

    // Persist strictly under this userId
    projectStorage.saveProjects(userId, updatedProjects);
    projectStorage.saveFiles(project.id, files);
    projectStorage.saveActiveProjectId(userId, project.id);
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
