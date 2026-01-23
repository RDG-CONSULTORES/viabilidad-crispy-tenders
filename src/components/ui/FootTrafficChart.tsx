'use client';

import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

interface FootTrafficChartProps {
  data: {
    day: string;
    value: number;
    peak?: number;
  }[];
  highlightBest?: boolean;
  className?: string;
}

export function FootTrafficChart({
  data,
  highlightBest = true,
  className,
}: FootTrafficChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const bestDayIndex = data.findIndex(d => d.value === maxValue);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-navy-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
          <p className="font-semibold">{label}</p>
          <p className="text-emerald-400">{payload[0].value.toLocaleString()} visitantes</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className={cn('bg-white rounded-2xl p-5 shadow-card', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-navy-900">Flujo Peatonal Semanal</h3>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
          Fuente: Google Popular Times
        </span>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={highlightBest && index === bestDayIndex ? '#10B981' : '#94A3B8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span>Mejor día</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-slate-400" />
          <span>Otros días</span>
        </div>
      </div>
    </motion.div>
  );
}

// Hourly traffic chart
interface HourlyTrafficChartProps {
  data: number[]; // 24 values for each hour
  peakHours?: { start: number; end: number }[];
  className?: string;
}

export function HourlyTrafficChart({
  data,
  peakHours = [],
  className,
}: HourlyTrafficChartProps) {
  const chartData = data.map((value, index) => ({
    hour: `${index}:00`,
    value,
    isPeak: peakHours.some(p => index >= p.start && index <= p.end),
  }));

  return (
    <motion.div
      className={cn('bg-white rounded-2xl p-5 shadow-card', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-navy-900">Flujo por Hora (Día Típico)</h3>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              interval={3}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#102A43',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={20}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isPeak ? '#F97316' : '#CBD5E1'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Peak hours indicator */}
      {peakHours.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <div className="w-3 h-3 rounded bg-crispy-500" />
          <span>
            Horas pico: {peakHours.map(p => `${p.start}:00-${p.end}:00`).join(', ')}
          </span>
        </div>
      )}
    </motion.div>
  );
}
