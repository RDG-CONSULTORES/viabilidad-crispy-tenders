import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx and tailwind-merge for optimal class handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-MX').format(num);
}

/**
 * Format currency in MXN
 */
export function formatCurrency(num: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Get confidence level info
 */
export function getConfidenceInfo(confidence: number): {
  level: 'high' | 'medium' | 'low';
  label: string;
  color: string;
  bgColor: string;
} {
  if (confidence >= 85) {
    return {
      level: 'high',
      label: 'Verificado',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    };
  } else if (confidence >= 60) {
    return {
      level: 'medium',
      label: 'Estimado',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    };
  } else {
    return {
      level: 'low',
      label: 'Aproximado',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    };
  }
}

/**
 * Get score classification
 */
export function getScoreClassification(score: number): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  gradient: string;
} {
  if (score >= 80) {
    return {
      label: 'EXCELENTE',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      gradient: 'from-emerald-500 to-emerald-600',
    };
  } else if (score >= 65) {
    return {
      label: 'BUENA',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600',
    };
  } else if (score >= 50) {
    return {
      label: 'EVALUAR',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      gradient: 'from-amber-500 to-amber-600',
    };
  } else {
    return {
      label: 'RIESGOSA',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      gradient: 'from-red-500 to-red-600',
    };
  }
}
