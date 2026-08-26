import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showLabel?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 120,
  strokeWidth = 10,
  label = 'Security Score',
  showLabel = true
}) => {
  const { theme } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 85) {
      return {
        stroke: '#10b981',
        text: 'text-emerald-700 dark:text-emerald-400',
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]'
      };
    }
    if (s >= 70) {
      return {
        stroke: '#06b6d4',
        text: 'text-cyan-700 dark:text-cyan-400',
        glow: 'shadow-[0_0_15px_rgba(6,182,212,0.3)]'
      };
    }
    if (s >= 50) {
      return {
        stroke: '#f59e0b',
        text: 'text-amber-700 dark:text-amber-400',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]'
      };
    }
    return {
      stroke: '#f43f5e',
      text: 'text-rose-700 dark:text-rose-500',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]'
    };
  };

  const color = getColor(clampedScore);
  const trackStroke = theme === 'light' ? '#e2e8f0' : '#1a2333';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative transform-3d card-3d" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackStroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            className="transition-colors duration-300"
          />
          {/* Indicator Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-black font-mono tracking-tighter ${color.text}`}>
            {clampedScore}
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">/100</span>
          </span>
        </div>
      </div>

      {showLabel && (
        <span className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono transition-colors">
          {label}
        </span>
      )}
    </div>
  );
};
