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
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300',
          dot: 'bg-yellow-400'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
          dot: 'bg-cyan-400'
        };
    }
  };

  const styles = getStyles();

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3.5 py-1.5 font-bold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-sm ${styles.bg} ${sizeClasses[size]} tracking-wider uppercase font-mono`}
    >
      {showIcon && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />}
      {severity}
    </span>
  );
};
