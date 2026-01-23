'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { ConfidenceBadge } from './ConfidenceBadge';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: number;
    label: string;
  };
  confidence?: number;
  sparklineData?: number[];
  color?: 'emerald' | 'blue' | 'amber' | 'red' | 'navy';
  className?: string;
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  confidence,
  sparklineData,
  color = 'navy',
  className,
}: MetricCardProps) {
  const colorClasses = {
    emerald: {
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      trendPositive: 'text-emerald-600',
    },
    blue: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trendPositive: 'text-blue-600',
    },
    amber: {
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      trendPositive: 'text-amber-600',
    },
    red: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      trendPositive: 'text-red-600',
    },
    navy: {
      iconBg: 'bg-navy-100',
      iconColor: 'text-navy-600',
      trendPositive: 'text-emerald-600',
    },
  };

  const colors = colorClasses[color];

  // Simple sparkline renderer
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length === 0) return null;

    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;

    const points = sparklineData.map((value, index) => {
      const x = (index / (sparklineData.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={colors.iconColor}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
    );
  };

  return (
    <motion.div
      className={cn(
        'bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2.5 rounded-xl', colors.iconBg)}>
          <Icon className={cn('w-5 h-5', colors.iconColor)} />
        </div>
        {confidence !== undefined && (
          <ConfidenceBadge confidence={confidence} showPercentage={false} size="sm" />
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <div className="flex items-baseline gap-2">
          <motion.p
            className="text-2xl font-bold text-navy-900 tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {typeof value === 'number' ? formatNumber(value) : value}
          </motion.p>
          {subValue && (
            <span className="text-sm text-gray-400">{subValue}</span>
          )}
        </div>
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-3 opacity-60">
          {renderSparkline()}
        </div>
      )}

      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className={cn(
              'text-sm font-medium',
              trend.value >= 0 ? colors.trendPositive : 'text-red-600'
            )}
          >
            {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value)}%
          </span>
          <span className="text-sm text-gray-400">{trend.label}</span>
        </div>
      )}
    </motion.div>
  );
}
