import AdmZip from 'adm-zip';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { projectService } from './projectService.js';
import { securityScanner } from '../scanner/SecurityScanner.js';
import { Project, ProjectFile, Scan } from '../types/index.js';

export class GitHubService {
  /**
   * Parse owner and repo from various URL formats:
   * - https://github.com/owner/repo
   * - https://github.com/owner/repo.git
   * - owner/repo
   */
  public parseGitHubUrl(input: string): { owner: string; repo: string } {
    let clean = input.trim().replace(/\.git$/, '').replace(/\/$/, '');
    if (clean.startsWith('git@github.com:')) {
      clean = clean.replace('git@github.com:', 'https://github.com/');
    }

    try {
      if (clean.startsWith('http://') || clean.startsWith('https://')) {
        const url = new URL(clean);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) {
          return { owner: parts[0], repo: parts[1] };
        }
      } else {
        const parts = clean.split('/').filter(Boolean);
        if (parts.length === 2) {
          return { owner: parts[0], repo: parts[1] };
        }
      }
    } catch (e) {
      // Fallback
    }

    throw new Error('Invalid GitHub repository URL or format. Use "owner/repo" or "https://github.com/owner/repo"');
  }

  /**
   * Fetch and import a GitHub repository into VibeGuard
   */
  public async importFromGitHub(params: {
    repoUrl: string;
    token?: string;
    projectName?: string;
    branch?: string;
    autoScan?: boolean;
    userId?: string;
  }): Promise<{ project: Project; fileCount: number; scan?: Scan }> {
    const { owner, repo } = this.parseGitHubUrl(params.repoUrl);
    const projectName = params.projectName || `${owner}/${repo}`;
    const branch = params.branch || 'main';
    const userId = params.userId || 'usr_shyam';

    console.log(`[GitHub Service] Connecting to GitHub repo ${owner}/${repo} (branch: ${branch})...`);

    // Headers
    const headers: Record<string, string> = {
      'User-Agent': 'VibeGuard-Security-Scanner/1.0',
      'Accept': 'application/vnd.github.v3+json'
    };

    if (params.token) {
      headers['Authorization'] = `token ${params.token}`;
    }

    // Try downloading zipball via GitHub archive API
    let zipBuffer: Buffer | null = null;
    const branchesToTry = [branch, 'master', 'main'];

    for (const b of branchesToTry) {
      const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${b}.zip`;
      console.log(`[GitHub Service] Attempting download from: ${zipUrl}`);

      try {
        const res = await fetch(zipUrl, { headers });
        if (res.ok) {
          const arrayBuf = await res.arrayBuffer();
          zipBuffer = Buffer.from(arrayBuf);
          console.log(`[GitHub Service] Successfully fetched zipball (${zipBuffer.length} bytes) for branch ${b}`);
          break;
        }
      } catch (err) {
        console.warn(`[GitHub Service] Could not fetch branch ${b}:`, err);
      }
    }

    // Fallback: If direct zip failed, try GitHub API zipball endpoint
    if (!zipBuffer) {
      const apiZipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/${branch}`;
      try {
        const res = await fetch(apiZipUrl, { headers, redirect: 'follow' });
        if (res.ok) {
          const arrayBuf = await res.arrayBuffer();
          zipBuffer = Buffer.from(arrayBuf);
        }
      } catch (e) {
        console.warn(`[GitHub Service] API zipball fetch failed:`, e);
      }
    }

    if (!zipBuffer) {
      throw new Error(`Could not fetch repository archive from GitHub for "${owner}/${repo}". Please check if repository is public, branch name is valid, or provide a Personal Access Token.`);
    }

    // Create project in VibeGuard
    const project = projectService.createProject(
      projectName,
      `Imported from GitHub: https://github.com/${owner}/${repo}`,
      'JavaScript/TypeScript',
      userId,
      `https://github.com/${owner}/${repo}`,
      branch
    );

    // Import ZIP contents safely
    const { fileCount } = await projectService.importZip(project.id, zipBuffer);

    let scan: Scan | undefined = undefined;
    if (params.autoScan) {
      console.log(`[GitHub Service] Auto-triggering AI Security Scan for imported project ${project.name}...`);
      scan = await securityScanner.scanProject(project.id);
    }

    return { project, fileCount, scan };
  }
}

export const gitHubService = new GitHubService();
