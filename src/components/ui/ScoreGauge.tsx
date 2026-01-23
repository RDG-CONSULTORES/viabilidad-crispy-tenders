'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export function ScoreGauge({
  score,
  size = 'md',
  showLabel = true,
  animated = true,
  className,
}: ScoreGaugeProps) {
  const normalizedScore = Math.max(0, Math.min(100, score));

  const getScoreColor = () => {
    if (normalizedScore >= 80) return { stroke: '#10B981', bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'EXCELENTE' };
    if (normalizedScore >= 65) return { stroke: '#3B82F6', bg: 'bg-blue-50', text: 'text-blue-600', label: 'BUENA' };
    if (normalizedScore >= 50) return { stroke: '#F59E0B', bg: 'bg-amber-50', text: 'text-amber-600', label: 'EVALUAR' };
    return { stroke: '#EF4444', bg: 'bg-red-50', text: 'text-red-600', label: 'RIESGOSA' };
  };

  const colors = getScoreColor();

  const sizes = {
    sm: { width: 80, strokeWidth: 6, fontSize: 'text-xl', labelSize: 'text-[10px]' },
    md: { width: 120, strokeWidth: 8, fontSize: 'text-3xl', labelSize: 'text-xs' },
    lg: { width: 160, strokeWidth: 10, fontSize: 'text-4xl', labelSize: 'text-sm' },
  };

  const { width, strokeWidth, fontSize, labelSize } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <svg width={width} height={width} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Score circle */}
        <motion.circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: animated ? circumference : offset }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={cn('font-bold tracking-tight', fontSize, colors.text)}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {normalizedScore}
        </motion.span>
        {showLabel && (
          <motion.span
            className={cn('font-semibold uppercase tracking-wider', labelSize, colors.text)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.3 }}
          >
            {colors.label}
          </motion.span>
        )}
      </div>
    </div>
  );
}
