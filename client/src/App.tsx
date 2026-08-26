import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectWorkspacePage } from './pages/ProjectWorkspacePage';
import { PreCodeScannerPage } from './pages/PreCodeScannerPage';
import { FindingsPage } from './pages/FindingsPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AIProvidersPage } from './pages/AIProvidersPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { DependencyAuditPage } from './pages/DependencyAuditPage';
import { IaCContainerAuditPage } from './pages/IaCContainerAuditPage';
import { LandingPage } from './pages/LandingPage';
import { SecurityStandardsPage } from './pages/SecurityStandardsPage';
import { TermsAndConditionsPage } from './pages/TermsAndConditionsPage';
import { CreateProjectModal } from './components/projects/CreateProjectModal';
import { GitHubImportModal } from './components/projects/GitHubImportModal';
import { ThemeProvider } from './context/ThemeContext';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isGitHubOpen, setIsGitHubOpen] = useState<boolean>(false);

  // If user is not authenticated, show the world-class Landing Page with overview & login/signup
  if (!user) {
    return <LandingPage onEnterApp={() => setCurrentTab('dashboard')} />;
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage setCurrentTab={setCurrentTab} />;
      case 'projects':
        return <ProjectsPage setCurrentTab={setCurrentTab} />;
      case 'workspace':
        return <ProjectWorkspacePage initialView="code" />;
      case 'security-rules':
        return <SecurityStandardsPage />;
      case 'taint-graph':
        return <ProjectWorkspacePage initialView="taint" />;
      case 'dependency-audit':
        return <DependencyAuditPage />;
      case 'iac-audit':
        return <IaCContainerAuditPage />;
      case 'precode':
        return <PreCodeScannerPage />;
      case 'findings':
        return <FindingsPage setCurrentTab={setCurrentTab} />;
      case 'reports':
        return <ReportsPage />;
      case 'providers':
        return <AIProvidersPage />;
      case 'audit':
        return <AuditLogsPage />;
      case 'terms':
        return <TermsAndConditionsPage onAccept={() => setCurrentTab('dashboard')} />;
      case 'landing':
        return <LandingPage onEnterApp={() => setCurrentTab('dashboard')} />;
      default:
        return <DashboardPage setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <Layout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      onOpenProjectModal={() => setIsCreateOpen(true)}
      onOpenGitHubModal={() => setIsGitHubOpen(true)}
    >
      {renderTabContent()}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <GitHubImportModal
        isOpen={isGitHubOpen}
        onClose={() => setIsGitHubOpen(false)}
        onSuccess={() => setCurrentTab('workspace')}
      />
    </Layout>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProjectProvider>
          <AppContent />
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
