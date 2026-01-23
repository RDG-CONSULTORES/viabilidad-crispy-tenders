'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfidenceBadgeProps {
  confidence: number;
  showPercentage?: boolean;
  showBar?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function ConfidenceBadge({
  confidence,
  showPercentage = true,
  showBar = false,
  size = 'sm',
  className,
}: ConfidenceBadgeProps) {
  const getConfidenceInfo = () => {
    if (confidence >= 85) {
      return {
        icon: CheckCircle,
        label: 'Verificado',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        barColor: 'bg-emerald-500',
      };
    } else if (confidence >= 60) {
      return {
        icon: AlertCircle,
        label: 'Estimado',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        barColor: 'bg-amber-500',
      };
    } else {
      return {
        icon: HelpCircle,
        label: 'Aproximado',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        barColor: 'bg-red-500',
      };
    }
  };

  const info = getConfidenceInfo();
  const Icon = info.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div
        className={cn(
          'inline-flex items-center rounded-full border font-medium',
          info.bgColor,
          info.borderColor,
          info.color,
          sizeClasses[size]
        )}
      >
        <Icon size={iconSizes[size]} />
        <span>{info.label}</span>
        {showPercentage && (
          <span className="opacity-75">{confidence}%</span>
        )}
      </div>

      {showBar && (
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', info.barColor)}
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      )}
    </div>
  );
}
