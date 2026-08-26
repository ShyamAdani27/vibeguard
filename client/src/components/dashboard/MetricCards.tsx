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
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30'
    },
    {
      title: 'Detection Scans',
      value: totalScans,
      subtitle: 'Antigravity AI Analyzed',
      icon: ShieldCheck,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30'
    },
    {
      title: 'Critical Threats',
      value: criticalCount,
      subtitle: 'Immediate risk vectors',
      icon: Flame,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30'
    },
    {
      title: 'High Threats',
      value: highCount,
      subtitle: 'Vulnerabilities detected',
      icon: ShieldAlert,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
    },
    {
      title: 'Medium & Low',
      value: mediumCount,
      subtitle: 'Code quality & hygiene',
      icon: CheckCircle2,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30'
    },
    {
      title: 'Posture Score',
      value: `${currentScore}/100`,
      subtitle: currentScore >= 80 ? 'Grade: A (Defended)' : currentScore >= 60 ? 'Grade: B (Moderate Risk)' : 'Grade: F (High Risk)',
      icon: Award,
      badgeColor: currentScore >= 80
        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
        : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white dark:bg-[#111726]/90 border border-slate-200 dark:border-[#1f293d] shadow-md dark:shadow-xl flex flex-col justify-between space-y-3 card-3d transform-3d hover:border-cyan-500/50 transition-all cursor-default group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-mono font-bold text-slate-700 dark:text-slate-300 truncate">
                {c.title}
              </span>
              <div className={`p-2 rounded-xl border ${c.badgeColor} transition-transform group-hover:scale-110`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {c.value}
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-1 truncate">
                {c.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
