'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, HelpCircle, Calculator, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Niveles de confianza para datos
 * ================================
 * VERIFICADO: Confirmado con fuente primaria (Google Places, INEGI, conteo de campo)
 * ESTIMADO: Calculado a partir de proxies o suposiciones documentadas
 * CALCULADO: Resultado de fórmula con datos de entrada documentados
 * NO_VERIFICADO: Dato legacy sin fuente conocida (requiere verificación)
 */
export type NivelConfianza = 'VERIFICADO' | 'ESTIMADO' | 'CALCULADO' | 'NO_VERIFICADO';

// ============================================================================
// BADGE POR PORCENTAJE (existente)
// ============================================================================

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

// ============================================================================
// BADGE POR NIVEL (nuevo - con fuente documentada)
// ============================================================================

const NIVEL_CONFIG = {
  VERIFICADO: {
    icon: CheckCircle,
    label: 'Verificado',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Confirmado con fuente primaria',
  },
  ESTIMADO: {
    icon: AlertTriangle,
    label: 'Estimado',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Basado en supuestos documentados',
  },
  CALCULADO: {
    icon: Calculator,
    label: 'Calculado',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Resultado de fórmula documentada',
  },
  NO_VERIFICADO: {
    icon: HelpCircle,
    label: 'Sin verificar',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: '⚠️ Requiere verificación',
  },
};

interface DataConfidenceBadgeProps {
  nivel: NivelConfianza;
  fuente?: string;
  fechaVerificacion?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function DataConfidenceBadge({
  nivel,
  fuente,
  fechaVerificacion,
  size = 'sm',
  className,
}: DataConfidenceBadgeProps) {
  const config = NIVEL_CONFIG[nivel];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
  };

  const tooltipContent = fuente
    ? `${config.description}\nFuente: ${fuente}${fechaVerificacion ? `\nFecha: ${fechaVerificacion}` : ''}`
    : config.description;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium cursor-help',
        config.bgColor,
        config.borderColor,
        config.color,
        sizeClasses[size],
        className
      )}
      title={tooltipContent}
    >
      <Icon size={iconSizes[size]} />
      <span>{config.label}</span>
    </span>
  );
}

// ============================================================================
// VALOR CON CONFIANZA
// ============================================================================

interface DataValueWithConfidenceProps {
  label: string;
  value: string | number;
  unit?: string;
  nivel: NivelConfianza;
  fuente?: string;
  className?: string;
}

export function DataValueWithConfidence({
  label,
  value,
  unit,
  nivel,
  fuente,
  className,
}: DataValueWithConfidenceProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">{label}</span>
        <DataConfidenceBadge nivel={nivel} fuente={fuente} size="sm" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-semibold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}

// ============================================================================
// ALERTA DE DATOS SIN VERIFICAR
// ============================================================================

interface DataWarningAlertProps {
  camposSinVerificar: string[];
  className?: string;
}

export function DataWarningAlert({ camposSinVerificar, className }: DataWarningAlertProps) {
  if (camposSinVerificar.length === 0) return null;

  return (
    <div
      className={cn(
        'rounded-lg border-2 border-red-200 bg-red-50 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-800">
            ⚠️ Datos sin verificar - No usar para decisiones
          </p>
          <p className="text-sm text-red-700 mt-1">
            Los siguientes datos no tienen fuente verificada:
          </p>
          <ul className="text-sm text-red-700 mt-2 space-y-1">
            {camposSinVerificar.map((campo) => (
              <li key={campo} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {campo}
              </li>
            ))}
          </ul>
          <p className="text-xs text-red-600 mt-3 italic">
            Verifique estos datos antes de tomar decisiones de inversión.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// RESUMEN DE CONFIABILIDAD
// ============================================================================

interface DatosConfianza {
  campo: string;
  nivel: NivelConfianza;
  fuente?: string;
}

interface ConfidenceSummaryProps {
  datos: DatosConfianza[];
  className?: string;
}

export function ConfidenceSummary({ datos, className }: ConfidenceSummaryProps) {
  const verificados = datos.filter((d) => d.nivel === 'VERIFICADO').length;
  const estimados = datos.filter((d) => d.nivel === 'ESTIMADO').length;
  const calculados = datos.filter((d) => d.nivel === 'CALCULADO').length;
  const sinVerificar = datos.filter((d) => d.nivel === 'NO_VERIFICADO').length;
  const total = datos.length;

  const porcentajeConfiable = total > 0
    ? Math.round(((verificados + calculados) / total) * 100)
    : 0;

  const getColorClase = () => {
    if (porcentajeConfiable >= 80) return 'text-emerald-600';
    if (porcentajeConfiable >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-4', className)}>
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        Confiabilidad de Datos
      </h4>

      {/* Barra de progreso */}
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div className="h-full flex">
          {verificados > 0 && (
            <div
              className="bg-emerald-500 transition-all"
              style={{ width: `${(verificados / total) * 100}%` }}
            />
          )}
          {calculados > 0 && (
            <div
              className="bg-blue-500 transition-all"
              style={{ width: `${(calculados / total) * 100}%` }}
            />
          )}
          {estimados > 0 && (
            <div
              className="bg-amber-500 transition-all"
              style={{ width: `${(estimados / total) * 100}%` }}
            />
          )}
          {sinVerificar > 0 && (
            <div
              className="bg-red-500 transition-all"
              style={{ width: `${(sinVerificar / total) * 100}%` }}
            />
          )}
        </div>
      </div>

      {/* Leyenda */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-gray-600">Verificados: {verificados}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-gray-600">Calculados: {calculados}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-gray-600">Estimados: {estimados}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-gray-600">Sin verificar: {sinVerificar}</span>
        </div>
      </div>

      {/* Score de confianza */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Confiabilidad general:</span>
          <span className={cn('text-xl font-bold', getColorClase())}>
            {porcentajeConfiable}%
          </span>
        </div>
        {sinVerificar > 0 && (
          <p className="text-xs text-red-600 mt-2">
            ⚠️ {sinVerificar} dato(s) requieren verificación
          </p>
        )}
      </div>
    </div>
  );
}
