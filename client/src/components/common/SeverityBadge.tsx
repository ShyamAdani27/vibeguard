import React from 'react';
import { Severity } from '../../types';

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
  showIcon = true
}) => {
  const getStyles = () => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:border-rose-500/40 dark:text-rose-300 shadow-sm shadow-rose-500/10',
          dot: 'bg-rose-600 dark:bg-rose-500 shadow-[0_0_8px_#f43f5e]'
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/15 dark:border-amber-500/40 dark:text-amber-300 shadow-sm shadow-amber-500/10',
          dot: 'bg-amber-600 dark:bg-amber-500 shadow-[0_0_8px_#f59e0b]'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-500/15 dark:border-yellow-500/40 dark:text-yellow-300 shadow-sm shadow-yellow-500/10',
          dot: 'bg-yellow-600 dark:bg-yellow-400'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-500/15 dark:border-cyan-500/40 dark:text-cyan-300 shadow-sm shadow-cyan-500/10',
          dot: 'bg-cyan-600 dark:bg-cyan-400'
        };
    }
  };

  const styles = getStyles();

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-bold',
    md: 'text-xs px-2.5 py-1 font-bold',
    lg: 'text-sm px-3.5 py-1.5 font-extrabold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${styles.bg} ${sizeClasses[size]} tracking-wider uppercase font-mono transition-colors`}
    >
      {showIcon && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />}
      {severity}
    </span>
  );
};
