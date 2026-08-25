import { v4 as uuidv4 } from 'uuid';
import { memoryStore } from '../supabase/client.js';
import { securityScanner } from '../scanner/SecurityScanner.js';
import { ApprovalRequest, ApprovalActionType, Severity } from '../types/index.js';

export class ApprovalService {
  public createApprovalRequest(params: {
    projectId: string;
    fixId?: string;
    actionType: ApprovalActionType;
    targetFile: string;
    riskLevel: Severity;
    title: string;
    reason: string;
    beforeCode?: string;
    afterCode?: string;
  }): ApprovalRequest {
    const project = memoryStore.projects.get(params.projectId);
    const approvalId = uuidv4();

    const request: ApprovalRequest = {
      id: approvalId,
      projectId: params.projectId,
      projectName: project?.name || 'Project',
      fixId: params.fixId,
      actionType: params.actionType,
      targetFile: params.targetFile,
      riskLevel: params.riskLevel,
      title: params.title,
      reason: params.reason,
      beforeCode: params.beforeCode,
      afterCode: params.afterCode,
      status: 'PENDING',
      requestedBy: 'VibeGuard AI Gateway',
      created_at: new Date().toISOString()
    };

    memoryStore.approvals.set(approvalId, request);
    return request;
  }

  public async decideApproval(
    approvalId: string,
    decision: 'APPROVED' | 'REJECTED',
    userId: string = 'usr_shyam',
    userName: string = 'Shyam Sundar'
  ): Promise<{ approval: ApprovalRequest; newScan?: any }> {
    const request = memoryStore.approvals.get(approvalId);
    if (!request) {
      throw new Error(`Approval request ${approvalId} not found`);
    }

    request.status = decision;
    request.decidedBy = userId;
    request.decidedAt = new Date().toISOString();

    let newScan = null;

    if (decision === 'APPROVED') {
      // If associated with a fix, apply fix to file
      if (request.fixId) {
        const fix = memoryStore.fixes.get(request.fixId);
        if (fix) {
          fix.status = 'APPLIED';
          fix.applied_at = new Date().toISOString();

          // Update vulnerability status
          const vuln = memoryStore.vulnerabilities.get(fix.vulnerabilityId);
          if (vuln) {
            vuln.status = 'FIXED';
          }

          // Modify file in project files
          const files = memoryStore.files.get(request.projectId) || [];
          const targetFile = files.find(f => f.path === request.targetFile);
          if (targetFile) {
            if (fix.originalCode && targetFile.content.includes(fix.originalCode)) {
              targetFile.content = targetFile.content.replace(fix.originalCode, fix.proposedCode);
            } else {
              // Line-based replacement fallback
              const lines = targetFile.content.split('\n');
              const idx = Math.max(0, fix.lineStart - 1);
              lines[idx] = fix.proposedCode;
              targetFile.content = lines.join('\n');
            }
            targetFile.updated_at = new Date().toISOString();
          }

          // Trigger automatic re-scan to show immediate score improvement!
          console.log(`[Approval Gateway] Fix applied to ${request.targetFile}. Automatically initiating re-scan...`);
          newScan = await securityScanner.scanProject(request.projectId);
        }
      }

      // Audit Log
      memoryStore.auditLogs.unshift({
        id: uuidv4(),
        userId,
        userName,
        action: `Approved action: ${request.title}`,
        projectId: request.projectId,
        projectName: request.projectName,
        file: request.targetFile,
        risk: request.riskLevel,
        decision: 'APPROVED',
        provider: 'Security Gateway',
        details: `Reason: ${request.reason}`,
        timestamp: new Date().toISOString()
      });
    } else {
      if (request.fixId) {
        const fix = memoryStore.fixes.get(request.fixId);
        if (fix) fix.status = 'REJECTED';
      }

      memoryStore.auditLogs.unshift({
        id: uuidv4(),
        userId,
        userName,
        action: `Rejected action: ${request.title}`,
        projectId: request.projectId,
        projectName: request.projectName,
        file: request.targetFile,
        risk: request.riskLevel,
        decision: 'REJECTED',
        provider: 'Security Gateway',
        details: `Rejected change to ${request.targetFile}`,
        timestamp: new Date().toISOString()
      });
    }

    return { approval: request, newScan };
  }

  public getPendingApprovals(): ApprovalRequest[] {
    return Array.from(memoryStore.approvals.values()).filter(a => a.status === 'PENDING');
  }

  public getAllApprovals(projectId?: string): ApprovalRequest[] {
    const all = Array.from(memoryStore.approvals.values());
    return projectId ? all.filter(a => a.projectId === projectId) : all;
  }
}

export const approvalService = new ApprovalService();
