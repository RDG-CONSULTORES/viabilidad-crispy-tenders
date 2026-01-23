'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  Search,
  Plus,
  DollarSign,
  Clock,
  Calendar,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Target,
  TrendingUp,
  X,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { SUCURSALES_CRISPY_TENDERS, Sucursal } from '@/data/sucursales';
import { calcularViabilidad, CONFIG_DEFAULT } from '@/lib/scoring';
import { PLAZAS_MTY } from '@/data/plazas';
import { cn } from '@/lib/utils';

type FilterStatus = 'todas' | 'operando' | 'proximamente' | 'propuesta';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SucursalesPage() {
  const [filtro, setFiltro] = useState<FilterStatus>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar sucursales
  const sucursalesFiltradas = useMemo(() => {
    let resultado = SUCURSALES_CRISPY_TENDERS;

    if (filtro !== 'todas') {
      resultado = resultado.filter(s => s.status === filtro);
    }

    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(s =>
        s.nombre.toLowerCase().includes(termino) ||
        s.plaza.toLowerCase().includes(termino) ||
        s.municipio.toLowerCase().includes(termino)
      );
    }

    return resultado;
  }, [filtro, busqueda]);

  // Contadores
  const contadores = useMemo(() => ({
    todas: SUCURSALES_CRISPY_TENDERS.length,
    operando: SUCURSALES_CRISPY_TENDERS.filter(s => s.status === 'operando').length,
    proximamente: SUCURSALES_CRISPY_TENDERS.filter(s => s.status === 'proximamente').length,
    propuesta: SUCURSALES_CRISPY_TENDERS.filter(s => s.status === 'propuesta').length,
  }), []);

  // Stats
  const stats = useMemo(() => ({
    ticketPromedio: Math.round(
      SUCURSALES_CRISPY_TENDERS.reduce((sum, s) => sum + s.ticketPromedio, 0) /
      SUCURSALES_CRISPY_TENDERS.length
    ),
    municipios: new Set(SUCURSALES_CRISPY_TENDERS.map(s => s.municipio)).size,
    verificadas: SUCURSALES_CRISPY_TENDERS.filter(s => s.coordenadasVerificadas).length,
    sinVerificar: SUCURSALES_CRISPY_TENDERS.filter(s => !s.coordenadasVerificadas).length,
  }), []);

  const filterConfigs = [
    { key: 'todas', label: 'Todas', color: 'gray', icon: Building2 },
    { key: 'operando', label: 'Operando', color: 'emerald', icon: CheckCircle2 },
    { key: 'proximamente', label: 'Próximas', color: 'blue', icon: Clock },
    { key: 'propuesta', label: 'Propuestas', color: 'purple', icon: Target },
  ] as const;

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
                Sucursales Crispy Tenders
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Gestión y análisis de ubicaciones
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar sucursal..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-crispy-500 focus:bg-white transition w-64"
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                  showFilters
                    ? 'bg-navy-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                <Filter className="w-4 h-4" />
                Filtros
                <ChevronDown className={cn(
                  'w-4 h-4 transition-transform',
                  showFilters && 'rotate-180'
                )} />
              </button>

              {/* New Proposal Button */}
              <a
                href="/comparar"
                className="px-4 py-2 bg-gradient-to-r from-crispy-500 to-crispy-600 text-white rounded-xl text-sm font-medium hover:from-crispy-600 hover:to-crispy-700 transition-all shadow-lg shadow-crispy-500/25 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Propuesta
              </a>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="mt-4 pb-2"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex gap-2 p-4 bg-gray-50 rounded-xl">
                  {filterConfigs.map(({ key, label, color, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setFiltro(key)}
                      className={cn(
                        'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm',
                        filtro === key
                          ? color === 'gray' ? 'bg-navy-900 text-white' :
                            color === 'emerald' ? 'bg-emerald-600 text-white' :
                            color === 'blue' ? 'bg-blue-600 text-white' :
                            'bg-purple-600 text-white'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        filtro === key ? 'bg-white/20' : 'bg-gray-100'
                      )}>
                        {contadores[key]}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-navy-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-navy-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-navy-900">{contadores.todas}</div>
                  <div className="text-xs text-gray-500">Total sucursales</div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-700">{contadores.operando}</div>
                  <div className="text-xs text-emerald-600">Operando</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-navy-900">${stats.ticketPromedio}</div>
                  <div className="text-xs text-gray-500">Ticket promedio</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-navy-900">{stats.municipios}</div>
                  <div className="text-xs text-gray-500">Municipios</div>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className={cn(
              'rounded-2xl p-5 border',
              stats.verificadas === contadores.todas
                ? 'bg-emerald-50 border-emerald-100'
                : 'bg-amber-50 border-amber-100'
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  stats.verificadas === contadores.todas
                    ? 'bg-emerald-100'
                    : 'bg-amber-100'
                )}>
                  {stats.verificadas === contadores.todas ? (
                    <Shield className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  )}
                </div>
                <div>
                  <div className={cn(
                    'text-2xl font-bold',
                    stats.verificadas === contadores.todas ? 'text-emerald-700' : 'text-amber-700'
                  )}>
                    {stats.verificadas}/{contadores.todas}
                  </div>
                  <div className={cn(
                    'text-xs',
                    stats.verificadas === contadores.todas ? 'text-emerald-600' : 'text-amber-600'
                  )}>
                    Verificadas
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Verification Warning */}
          {stats.sinVerificar > 0 && (
            <motion.div
              variants={itemVariants}
              className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-amber-900">
                  {stats.sinVerificar} sucursal{stats.sinVerificar > 1 ? 'es' : ''} sin coordenadas verificadas
                </div>
                <div className="text-xs text-amber-700 mt-1">
                  Las coordenadas no verificadas pueden afectar la precisión del análisis de distancias.
                  Recomendamos verificar vía Google Places API.
                </div>
              </div>
            </motion.div>
          )}

          {/* Sucursales Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {sucursalesFiltradas.map((sucursal, index) => (
                <SucursalCard key={sucursal.id} sucursal={sucursal} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {sucursalesFiltradas.length === 0 && (
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl p-12 shadow-card text-center"
            >
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-navy-900 mb-2">
                No se encontraron sucursales
              </h3>
              <p className="text-gray-500 text-sm">
                Intenta ajustar los filtros o términos de búsqueda
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ========== SUCURSAL CARD COMPONENT ==========

function SucursalCard({ sucursal, index }: { sucursal: Sucursal; index: number }) {
  // Calcular score si es propuesta
  const score = useMemo(() => {
    if (sucursal.status === 'propuesta' || sucursal.status === 'proximamente') {
      const plaza = PLAZAS_MTY.find(p =>
        p.nombre.toLowerCase().includes(sucursal.plaza.toLowerCase()) ||
        sucursal.plaza.toLowerCase().includes(p.nombre.toLowerCase())
      );
      if (plaza) {
        return calcularViabilidad(plaza, CONFIG_DEFAULT);
      }
    }
    return null;
  }, [sucursal]);

  const statusConfig = {
    operando: {
      label: 'Operando',
      bgCard: 'bg-white',
      borderCard: 'border-gray-100',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-700',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
    proximamente: {
      label: 'Próximamente',
      bgCard: 'bg-blue-50/50',
      borderCard: 'border-blue-100',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-700',
      icon: Clock,
      iconColor: 'text-blue-600',
    },
    propuesta: {
      label: 'Propuesta',
      bgCard: 'bg-purple-50/50',
      borderCard: 'border-purple-100',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-700',
      icon: Target,
      iconColor: 'text-purple-600',
    },
  };

  const config = statusConfig[sucursal.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'rounded-2xl border-2 p-5 transition-all hover:shadow-lg',
        config.bgCard,
        config.borderCard
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-navy-900">{sucursal.plaza}</h3>
          <p className="text-sm text-gray-500">{sucursal.nombre}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Verification Badge */}
          {sucursal.coordenadasVerificadas ? (
            <div className="p-1.5 bg-emerald-100 rounded-lg" title="Coordenadas verificadas">
              <Shield className="w-4 h-4 text-emerald-600" />
            </div>
          ) : (
            <div className="p-1.5 bg-amber-100 rounded-lg" title="Coordenadas sin verificar">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
          )}
          {/* Status Badge */}
          <span className={cn(
            'flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium',
            config.badgeBg,
            config.badgeText
          )}>
            <StatusIcon className="w-3.5 h-3.5" />
            {config.label}
          </span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{sucursal.municipio}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>${sucursal.ticketPromedio} ticket</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{sucursal.horarioApertura} - {sucursal.horarioCierre}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{sucursal.diasOperacion.length} días/sem</span>
        </div>
      </div>

      {/* Coordinate Source */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Fuente coordenadas:</span>
          <span className={cn(
            'font-medium',
            sucursal.fuenteCoordenadas === 'google_places' ? 'text-emerald-600' :
            sucursal.fuenteCoordenadas === 'manual' ? 'text-blue-600' :
            'text-amber-600'
          )}>
            {sucursal.fuenteCoordenadas === 'google_places' ? 'Google Places' :
             sucursal.fuenteCoordenadas === 'manual' ? 'Manual' : 'Estimada'}
          </span>
        </div>
      </div>

      {/* Score for proposals */}
      {score && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Score de Viabilidad</span>
            <div className="flex items-center gap-2">
              <div
                className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden"
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${score.scoreTotal}%`,
                    backgroundColor: score.color
                  }}
                />
              </div>
              <span
                className="font-bold text-sm"
                style={{ color: score.color }}
              >
                {score.scoreTotal}
              </span>
            </div>
          </div>
          <div className="text-xs mt-1" style={{ color: score.color }}>
            {score.clasificacion}
          </div>
        </div>
      )}

      {/* Notes */}
      {sucursal.notas && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 italic">{sucursal.notas}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <a
          href={`/analisis?plaza=${encodeURIComponent(sucursal.plaza)}`}
          className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition text-center"
        >
          {sucursal.status === 'propuesta' ? 'Analizar' : 'Ver Detalle'}
        </a>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${sucursal.lat},${sucursal.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition"
          title="Ver en Google Maps"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
}
