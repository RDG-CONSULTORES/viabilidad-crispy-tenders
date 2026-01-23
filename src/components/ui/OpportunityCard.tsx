'use client';

import { motion } from 'framer-motion';
import { MapPin, Users, Target, Building2, TrendingUp, ChevronRight } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { ScoreGauge } from './ScoreGauge';
import { ConfidenceBadge } from './ConfidenceBadge';

interface OpportunityCardProps {
  rank: number;
  name: string;
  address: string;
  municipality: string;
  score: number;
  nse: string;
  nseColor: string;
  pedestrianVolume: number;
  pedestrianLevel: string;
  pedestrianColor: string;
  competitors: number;
  distanceToCT: number;
  confidence: number;
  positiveFactors: string[];
  negativeFactors: string[];
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function OpportunityCard({
  rank,
  name,
  address,
  municipality,
  score,
  nse,
  nseColor,
  pedestrianVolume,
  pedestrianLevel,
  pedestrianColor,
  competitors,
  distanceToCT,
  confidence,
  positiveFactors,
  negativeFactors,
  isSelected = false,
  onClick,
  className,
}: OpportunityCardProps) {
  const getScoreGradient = () => {
    if (score >= 80) return 'from-emerald-500 to-emerald-600';
    if (score >= 65) return 'from-blue-500 to-blue-600';
    if (score >= 50) return 'from-amber-500 to-amber-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <motion.div
      className={cn(
        'bg-white rounded-2xl shadow-card overflow-hidden cursor-pointer',
        'transition-all duration-300 hover:shadow-card-hover',
        isSelected && 'ring-2 ring-crispy-500 shadow-card-hover',
        className
      )}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with rank and score */}
      <div className="flex items-stretch">
        {/* Rank badge */}
        <div className={cn(
          'w-14 flex items-center justify-center text-white font-bold text-xl bg-gradient-to-br',
          getScoreGradient()
        )}>
          #{rank}
        </div>

        {/* Main content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-navy-900 text-lg truncate">{name}</h3>
              <p className="text-sm text-gray-500 truncate flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                {address}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <ScoreGauge score={score} size="sm" showLabel={false} />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* NSE */}
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: nseColor }}
            >
              NSE {nse}
            </span>

            {/* Pedestrian Volume */}
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1"
              style={{ backgroundColor: pedestrianColor }}
            >
              <Users className="w-3 h-3" />
              {pedestrianVolume}%
            </span>

            {/* Municipality */}
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {municipality}
            </span>
          </div>

          {/* Quick metrics */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                <span className={cn(
                  'font-semibold',
                  competitors <= 2 ? 'text-emerald-600' : competitors <= 4 ? 'text-amber-600' : 'text-red-600'
                )}>
                  {competitors}
                </span>
                {' '}competidores
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                <span className="font-semibold text-navy-700">{distanceToCT} km</span> a CT
              </span>
            </div>
          </div>

          {/* Factors preview */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {positiveFactors.slice(0, 2).map((factor, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-700"
              >
                <TrendingUp className="w-3 h-3" />
                {factor.length > 25 ? factor.substring(0, 25) + '...' : factor}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <ConfidenceBadge confidence={confidence} size="sm" />
            <button className="flex items-center gap-1 text-sm font-medium text-crispy-600 hover:text-crispy-700 transition-colors">
              Ver detalle
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
