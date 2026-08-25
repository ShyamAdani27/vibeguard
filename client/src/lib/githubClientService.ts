import { Project, ProjectFile, Scan, Vulnerability } from '../types';
import { scanCodeWithGemini } from './geminiScanner';

export interface GitHubImportResult {
  project: Project;
  files: ProjectFile[];
  scan?: Scan;
  fileCount: number;
}

export async function importGitHubDirect(params: {
  repoUrl: string;
  branch?: string;
  token?: string;
  autoScan?: boolean;
}): Promise<GitHubImportResult> {
  const { repoUrl, branch = 'main', token, autoScan = true } = params;

  // Clean URL / extract owner and repo
  let clean = repoUrl.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
  if (clean.startsWith('/')) clean = clean.substring(1);
  const parts = clean.split('/');
  if (parts.length < 2) {
    throw new Error('Invalid GitHub repository format. Use "owner/repo" or "https://github.com/owner/repo"');
  }

  const owner = parts[0];
  const repo = parts[1];
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json'
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  // 1. Fetch Repository Tree from GitHub API
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const treeRes = await fetch(treeUrl, { headers });

  if (!treeRes.ok) {
    if (treeRes.status === 404) {
      throw new Error(`Repository "${owner}/${repo}" or branch "${branch}" not found. If it is private, please provide a Personal Access Token.`);
    } else if (treeRes.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please provide a Personal Access Token to continue.');
    }
    throw new Error(`GitHub API error (${treeRes.status}): ${treeRes.statusText}`);
  }

  const treeData = await treeRes.json();
  const treeItems: any[] = treeData.tree || [];

  // 2. Filter code files (exact match with server extractor)
  const validExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.json', '.sql', '.html', '.css', '.env', '.yaml', '.yml', '.md', '.sh'];
  const ignoredPatterns = ['node_modules/', '.git/', 'dist/', 'build/', '.cache/', '__MACOSX', '.next/'];

  const candidateFiles = treeItems.filter(item => {
    if (item.type !== 'blob') return false;
    const pathLower = item.path.toLowerCase();
    if (ignoredPatterns.some(ign => pathLower.includes(ign))) return false;
    return validExtensions.some(ext => pathLower.endsWith(ext)) || pathLower.includes('.env');
  });

  if (candidateFiles.length === 0) {
    throw new Error(`No scannable code files found in repository "${owner}/${repo}".`);
  }

  // 3. Fetch ALL candidate files (up to 300 files in fast parallel batches)
  const filesToFetch = candidateFiles.slice(0, 300);
  const parsedFiles: ProjectFile[] = [];
  const projectId = `proj_${Date.now()}`;
  let totalLines = 0;

  // Batch download in parallel chunks of 10 for high speed without network bottleneck
  const batchSize = 10;
  for (let i = 0; i < filesToFetch.length; i += batchSize) {
    const batch = filesToFetch.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async item => {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;
          const rawRes = await fetch(rawUrl, {
            headers: token ? { Authorization: `token ${token}` } : {}
          });
          if (rawRes.ok) {
            const content = await rawRes.text();
            const lines = content.split('\n').length;
            const ext = item.path.split('.').pop() || 'plaintext';
            return {
              id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              projectId,
              path: item.path,
              name: item.path.split('/').pop() || item.path,
              content,
              size: item.size || content.length,
              isSensitive: item.path.includes('.env') || item.path.includes('credential'),
              language: ext,
              lines,
              updated_at: new Date().toISOString()
            };
          }
        } catch (e) {
          console.warn(`[GitHub Import] Notice for file ${item.path}:`, e);
        }
        return null;
      })
    );

    for (const res of results) {
      if (res) {
        totalLines += res.lines;
        parsedFiles.push(res);
      }
    }
  }

  if (parsedFiles.length === 0) {
    throw new Error('Could not download file contents from GitHub. Please check network connection or provide a Personal Access Token.');
  }

  // 4. Create Project
  const project: Project = {
    id: projectId,
    userId: 'usr_current',
    name: `${owner}/${repo}`,
    description: `Imported from GitHub: https://github.com/${owner}/${repo}`,
    language: 'JavaScript/TypeScript',
    githubUrl: `https://github.com/${owner}/${repo}`,
    githubBranch: branch,
    fileCount: parsedFiles.length,
    totalLines,
    securityScore: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // 5. Run Security Scan on ALL extracted files
  let scan: Scan | undefined = undefined;
  if (autoScan) {
    const scanRes = await scanCodeWithGemini(projectId, parsedFiles);
    scan = scanRes.scan;
    project.securityScore = scan.securityScore;
    project.lastScannedAt = scan.completedAt;
  }

  return { project, files: parsedFiles, scan, fileCount: parsedFiles.length };
}
