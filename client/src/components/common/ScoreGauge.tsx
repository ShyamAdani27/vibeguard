import React from 'react';

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
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 85) return { stroke: '#10b981', text: 'text-emerald-400', glow: 'shadow-[0_0_15px_#10b981]' };
    if (s >= 70) return { stroke: '#06b6d4', text: 'text-cyan-400', glow: 'shadow-[0_0_15px_#06b6d4]' };
    if (s >= 50) return { stroke: '#f59e0b', text: 'text-amber-400', glow: 'shadow-[0_0_15px_#f59e0b]' };
    return { stroke: '#f43f5e', text: 'text-rose-500', glow: 'shadow-[0_0_15px_#f43f5e]' };
  };

  const color = getColor(clampedScore);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1a2333"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Indicator */}
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
            <span className="text-xs font-normal text-slate-400">/100</span>
          </span>
        </div>
      </div>

      {showLabel && (
        <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
          {label}
        </span>
      )}
    </div>
  );
};
