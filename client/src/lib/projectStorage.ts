import { Project, ProjectFile, Scan, Vulnerability, UserProfile } from '../types';
import { supabase } from './supabase';

const PROJECTS_PREFIX = 'vibeguard_user_projects_';
const FILES_PREFIX = 'vibeguard_project_files_';
const VULNS_PREFIX = 'vibeguard_project_vulns_';
const SCANS_PREFIX = 'vibeguard_project_scans_';
const ACTIVE_PROJECT_PREFIX = 'vibeguard_active_proj_';

export const projectStorage = {
  // Save Projects to Local Storage & Supabase
  saveProjects: async (userId: string, projects: Project[]): Promise<void> => {
    try {
      localStorage.setItem(`${PROJECTS_PREFIX}${userId}`, JSON.stringify(projects));
      localStorage.setItem('vibeguard_latest_projects', JSON.stringify(projects));
    } catch (e) {
      console.warn('[Storage] Failed to save projects locally:', e);
    }

    // Sync to Supabase Cloud if available
    if (supabase && userId && !userId.startsWith('usr_shyam')) {
      try {
        for (const p of projects) {
          await supabase.from('projects').upsert({
            id: p.id,
            user_id: userId,
            name: p.name,
            description: p.description || '',
            language: p.language || 'JavaScript/TypeScript',
            github_url: p.githubUrl || null,
            github_branch: p.githubBranch || 'main',
            file_count: p.fileCount || 0,
            total_lines: p.totalLines || 0,
            security_score: p.securityScore || 100,
            last_scanned_at: p.lastScannedAt || null,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
        }
      } catch (err) {
        console.warn('[Storage] Supabase projects sync notice:', err);
      }
    }
  },

  // Load Projects from Local Storage & Supabase
  loadProjects: async (userId: string): Promise<Project[]> => {
    let localProjects: Project[] = [];
    try {
      const stored = localStorage.getItem(`${PROJECTS_PREFIX}${userId}`) || localStorage.getItem('vibeguard_latest_projects');
      if (stored) {
        localProjects = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[Storage] Failed to read local projects:', e);
    }

    // Try fetching latest from Supabase Cloud
    if (supabase && userId && !userId.startsWith('usr_shyam')) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const cloudProjects: Project[] = data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            name: d.name,
            description: d.description,
            language: d.language,
            githubUrl: d.github_url,
            githubBranch: d.github_branch,
            fileCount: d.file_count,
            totalLines: d.total_lines,
            securityScore: d.security_score,
            lastScannedAt: d.last_scanned_at,
            created_at: d.created_at,
            updated_at: d.updated_at
          }));

          // Merge cloud and local
          const merged = [...cloudProjects];
          for (const lp of localProjects) {
            if (!merged.some(cp => cp.id === lp.id)) {
              merged.push(lp);
            }
          }
          localStorage.setItem(`${PROJECTS_PREFIX}${userId}`, JSON.stringify(merged));
          return merged;
        }
      } catch (err) {
        console.warn('[Storage] Supabase load notice:', err);
      }
    }

    return localProjects;
  },

  // Files Persistence
  saveFiles: (projectId: string, files: ProjectFile[]): void => {
    try {
      localStorage.setItem(`${FILES_PREFIX}${projectId}`, JSON.stringify(files));
    } catch (e) {
      console.warn('[Storage] Files save notice:', e);
    }
  },

  loadFiles: (projectId: string): ProjectFile[] => {
    try {
      const stored = localStorage.getItem(`${FILES_PREFIX}${projectId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Vulnerabilities Persistence
  saveVulns: async (projectId: string, vulns: Vulnerability[]): Promise<void> => {
    try {
      localStorage.setItem(`${VULNS_PREFIX}${projectId}`, JSON.stringify(vulns));
    } catch (e) {
      console.warn('[Storage] Vulns save notice:', e);
    }

    // Sync to Supabase
    if (supabase && vulns.length > 0) {
      try {
        const rows = vulns.map(v => ({
          id: v.id,
          scan_id: v.scanId,
          project_id: v.projectId || projectId,
          file: v.file,
          line: v.line,
          severity: v.severity,
          type: v.type,
          title: v.title,
          description: v.description,
          why: v.why,
          risk: v.risk,
          recommendation: v.recommendation,
          code_snippet: v.codeSnippet,
          detected_by: v.detectedBy,
          status: v.status || 'OPEN',
          created_at: v.created_at || new Date().toISOString()
        }));

        await supabase.from('vulnerabilities').upsert(rows, { onConflict: 'id' });
      } catch (e) {
        console.warn('[Storage] Supabase vulns notice:', e);
      }
    }
  },

  loadVulns: (projectId: string): Vulnerability[] => {
    try {
      const stored = localStorage.getItem(`${VULNS_PREFIX}${projectId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Scans Persistence
  saveScans: (projectId: string, scans: Scan[]): void => {
    try {
      localStorage.setItem(`${SCANS_PREFIX}${projectId}`, JSON.stringify(scans));
    } catch {}
  },

  loadScans: (projectId: string): Scan[] => {
    try {
      const stored = localStorage.getItem(`${SCANS_PREFIX}${projectId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Active Project ID Persistence
  saveActiveProjectId: (userId: string, projectId: string): void => {
    try {
      localStorage.setItem(`${ACTIVE_PROJECT_PREFIX}${userId}`, projectId);
      localStorage.setItem('vibeguard_active_proj_last', projectId);
    } catch {}
  },

  loadActiveProjectId: (userId: string): string | null => {
    try {
      return localStorage.getItem(`${ACTIVE_PROJECT_PREFIX}${userId}`) || localStorage.getItem('vibeguard_active_proj_last');
    } catch {
      return null;
    }
  }
};
