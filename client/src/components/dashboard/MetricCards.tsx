import React from 'react';
import { FolderGit2, ShieldCheck, Flame, ShieldAlert, CheckCircle2, Award } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const MetricCards: React.FC = () => {
  const { projects, activeProject, vulnerabilities, activeScans } = useProject();

  const totalProjects = projects.length;
  const totalScans = activeScans.length;
  const criticalCount = vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
  const highCount = vulnerabilities.filter(v => v.severity === 'HIGH').length;
  const mediumCount = vulnerabilities.filter(v => v.severity === 'MEDIUM' || v.severity === 'LOW').length;
  const currentScore = activeProject ? activeProject.securityScore : 100;

  const cards = [
    {
      title: 'Active Projects',
      value: totalProjects,
      subtitle: `${totalProjects} repository linked`,
      icon: FolderGit2,
      color: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/30 text-cyan-400'
    },
    {
      title: 'Detection Scans',
      value: totalScans,
      subtitle: 'Antigravity AI Analyzed',
      icon: ShieldCheck,
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400'
    },
    {
      title: 'Critical Threats',
      value: criticalCount,
      subtitle: 'Immediate risk vectors',
      icon: Flame,
      color: 'from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-400'
    },
    {
      title: 'High Threats',
      value: highCount,
      subtitle: 'Vulnerabilities detected',
      icon: ShieldAlert,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400'
    },
    {
      title: 'Medium & Low',
      value: mediumCount,
      subtitle: 'Code quality & hygiene',
      icon: CheckCircle2,
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400'
    },
    {
      title: 'Posture Score',
      value: `${currentScore}/100`,
      subtitle: currentScore >= 80 ? 'Grade: A (Defended)' : currentScore >= 60 ? 'Grade: B (Moderate Risk)' : 'Grade: F (High Risk)',
      icon: Award,
      color: currentScore >= 80 ? 'from-emerald-500/20 to-cyan-500/20 border-emerald-500/30 text-emerald-400' : 'from-rose-500/20 to-amber-500/20 border-rose-500/30 text-rose-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="p-4 rounded-xl bg-[#111726]/90 dark:bg-[#111726]/90 bg-white border border-[#1f293d] dark:border-[#1f293d] border-slate-200 shadow-lg flex flex-col justify-between space-y-2 hover:border-cyan-500/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-mono font-bold text-slate-400 dark:text-slate-400 text-slate-600 truncate">
                {c.title}
              </span>
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${c.color} border`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="text-2xl font-black text-white dark:text-white text-slate-900 font-mono tracking-tight">
                {c.value}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 text-slate-500 font-mono mt-0.5 truncate">
                {c.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
