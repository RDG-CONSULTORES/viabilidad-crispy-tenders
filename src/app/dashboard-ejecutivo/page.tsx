'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  MapPin,
  Users,
  Building2,
  Activity,
  Zap,
  Target,
  Shield,
  ChevronRight,
  Loader2,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Percent,
  ArrowUpRight,
  Car,
} from 'lucide-react';
import { ConfidenceBadge } from '@/components/ui';
import { cn, formatNumber } from '@/lib/utils';
import {
  PERFILES_SUCURSAL,
  PROMEDIOS_PORTAFOLIO,
  ESTRUCTURA_COSTOS,
} from '@/data/modelo-financiero';
import { SUCURSALES_CRISPY_TENDERS } from '@/data/sucursales';

interface TraficoZona {
  centro: { lat: number; lng: number };
  radioKm: number;
  timestamp: string;
  flujoPromedio: {
    jamFactorPromedio: number;
    velocidadPromedioKmh: number;
    nivelGeneral: 'fluido' | 'lento' | 'congestionado' | 'detenido';
  };
  puntosCriticos: any[];
  impactoTrafico: {
    reduccionAreaPct: number;
    tiempoAdicionalMin: number;
  };
  recomendaciones?: string[];
}

const CONFIDENCE_APIS = [
  { nombre: 'Google Places', status: 'activo', confianza: 15, descripcion: 'Búsqueda de plazas y competencia', icon: MapPin },
  { nombre: 'Mapbox Isocronas', status: 'activo', confianza: 15, descripcion: 'Área de cobertura y accesibilidad', icon: Target },
  { nombre: 'HERE Traffic', status: 'activo', confianza: 15, descripcion: 'Tráfico en tiempo real', icon: Car },
  { nombre: 'BestTime.app', status: 'activo', confianza: 10, descripcion: 'Afluencia de personas por hora', icon: Users },
  { nombre: 'Foursquare', status: 'activo', confianza: 5, descripcion: 'Reviews, categorías y densidad', icon: Building2 },
  { nombre: 'Data México', status: 'activo', confianza: 5, descripcion: 'Indicadores económicos oficiales', icon: BarChart3 },
  { nombre: 'CENAPRED Riesgos', status: 'activo', confianza: 10, descripcion: 'Riesgo de inundación', icon: Shield },
  { nombre: 'INEGI Indicadores', status: 'activo', confianza: 10, descripcion: 'Datos económicos NL', icon: PieChart },
  { nombre: 'Scoring V2', status: 'activo', confianza: 10, descripcion: 'Algoritmo de viabilidad mejorado', icon: Zap },
];

const APIS_PENDIENTES = [
  { nombre: 'Geolytix / CARTO', confianza: 3, costo: 'Cotizar', descripcion: 'NSE por AGEB (precisión extra)' },
  { nombre: 'Satellite Imagery', confianza: 2, costo: '$500/mes', descripcion: 'Estacionamiento y densidad' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardEjecutivo() {
  const [traficoData, setTraficoData] = useState<TraficoZona | null>(null);
  const [loading, setLoading] = useState(true);

  const confianzaActual = CONFIDENCE_APIS.reduce((sum, api) => sum + api.confianza, 0);
  const confianzaPotencial = confianzaActual + APIS_PENDIENTES.reduce((sum, api) => sum + api.confianza, 0);

  // Datos de sucursales activas
  const sucursalesActivas = SUCURSALES_CRISPY_TENDERS.filter(s => s.status === 'operando');
  const sucursalesVerificadas = SUCURSALES_CRISPY_TENDERS.filter(s => s.coordenadasVerificadas);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const traficoRes = await fetch('/api/here?tipo=analisis&lat=25.6866&lng=-100.3161&radio=5');
        const trafico = await traficoRes.json();
        if (trafico.success) {
          setTraficoData(trafico);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTraficoStyle = (nivel?: string) => {
    switch (nivel) {
      case 'fluido': return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'bg-emerald-500' };
      case 'lento': return { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'bg-amber-500' };
      case 'congestionado': return { bg: 'bg-orange-100', text: 'text-orange-700', icon: 'bg-orange-500' };
      case 'detenido': return { bg: 'bg-red-100', text: 'text-red-700', icon: 'bg-red-500' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'bg-gray-500' };
    }
  };

  const traficoStyle = getTraficoStyle(traficoData?.flujoPromedio?.nivelGeneral);

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
                Dashboard Ejecutivo
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Visión integral del sistema de viabilidad
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Última actualización</div>
                <div className="text-sm font-medium text-navy-700">
                  {new Date().toLocaleString('es-MX', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </div>
              </div>
              <ConfidenceBadge confidence={confianzaActual} showBar size="md" />
            </div>
          </div>
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
          {/* Confidence Hero */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl p-6 text-white overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-crispy-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-crispy-400" />
                    Nivel de Confianza del Estudio
                  </h2>
                  <p className="text-navy-300 text-sm">
                    Basado en {CONFIDENCE_APIS.length} fuentes de datos integradas
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-crispy-400">{confianzaActual}%</div>
                  <div className="text-navy-300 text-sm">de {confianzaPotencial}% posible</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="w-full bg-navy-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-crispy-400 to-crispy-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${confianzaActual}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-navy-400">
                  <span>0%</span>
                  <span className="text-crispy-400 font-medium">Objetivo: 95%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* KPI Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-5 gap-4">
            {/* Sucursales Operando */}
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Sucursales</div>
                  <div className="text-2xl font-bold text-navy-900">{sucursalesActivas.length}</div>
                  <div className="text-xs text-gray-500">operando</div>
                </div>
              </div>
            </div>

            {/* Tráfico en tiempo real */}
            <div className={cn('rounded-2xl p-5', traficoStyle.bg)}>
              <div className="flex items-center gap-3">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white', traficoStyle.icon)}>
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Tráfico MTY</div>
                  <div className={cn('text-2xl font-bold capitalize', traficoStyle.text)}>
                    {loading ? '...' : traficoData?.flujoPromedio?.nivelGeneral || 'N/A'}
                  </div>
                  {traficoData && (
                    <div className="text-xs text-gray-500">
                      JamFactor: {traficoData.flujoPromedio.jamFactorPromedio}/10
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ventas Promedio */}
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Ventas Prom.</div>
                  <div className="text-2xl font-bold text-navy-900">
                    ${formatNumber(PROMEDIOS_PORTAFOLIO.ventasPromedio)}
                  </div>
                  <div className="text-xs text-gray-500">mensual</div>
                </div>
              </div>
            </div>

            {/* Margen Neto */}
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Percent className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Margen Neto</div>
                  <div className="text-2xl font-bold text-navy-900">
                    {(PROMEDIOS_PORTAFOLIO.margenNetoPromedio * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">objetivo: 20%</div>
                </div>
              </div>
            </div>

            {/* Payback */}
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Payback</div>
                  <div className="text-2xl font-bold text-navy-900">
                    {PROMEDIOS_PORTAFOLIO.paybackPromedio}
                  </div>
                  <div className="text-xs text-gray-500">meses promedio</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Financial Models */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-navy-900">Perfiles de Sucursal</h2>
              <span className="text-sm text-gray-500">Basado en Estados de Resultados reales</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {PERFILES_SUCURSAL.map((perfil, index) => (
                <motion.div
                  key={perfil.id}
                  className={cn(
                    'bg-white rounded-2xl p-5 shadow-card border-2 transition-all hover:shadow-lg',
                    perfil.id === 'modelo-eficiente' ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-transparent'
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-navy-900">{perfil.nombre}</h3>
                    {perfil.id === 'modelo-eficiente' && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                        TOP
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{perfil.descripcion}</p>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Ventas/mes</span>
                      <span className="text-sm font-semibold text-navy-900">
                        ${formatNumber(perfil.metricas.ventasMensuales)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Margen neto</span>
                      <span className={cn(
                        'text-sm font-semibold',
                        perfil.metricas.margenNeto >= 0.20 ? 'text-emerald-600' :
                        perfil.metricas.margenNeto >= 0.15 ? 'text-blue-600' :
                        perfil.metricas.margenNeto >= 0.10 ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {(perfil.metricas.margenNeto * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Renta máx.</span>
                      <span className="text-sm font-medium text-gray-700">
                        ${formatNumber(perfil.rentaMaxima)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Payback</span>
                      <span className={cn(
                        'text-sm font-semibold',
                        perfil.paybackMeses <= 12 ? 'text-emerald-600' :
                        perfil.paybackMeses <= 18 ? 'text-blue-600' :
                        perfil.paybackMeses <= 24 ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {perfil.paybackMeses} meses
                      </span>
                    </div>
                  </div>

                  {/* Mini progress bar for payback */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">ROI Speed</span>
                      <span className="font-medium text-gray-600">{Math.round((24 - perfil.paybackMeses) / 24 * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          perfil.paybackMeses <= 12 ? 'bg-emerald-500' :
                          perfil.paybackMeses <= 18 ? 'bg-blue-500' : 'bg-amber-500'
                        )}
                        style={{ width: `${Math.max(10, (24 - perfil.paybackMeses) / 24 * 100)}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* APIs Integradas */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-navy-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  APIs Integradas
                </h3>
                <span className="text-sm text-emerald-600 font-medium">{confianzaActual}% confianza</span>
              </div>

              <div className="space-y-2">
                {CONFIDENCE_APIS.map((api) => {
                  const Icon = api.icon;
                  return (
                    <div
                      key={api.nombre}
                      className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-navy-900">{api.nombre}</div>
                          <div className="text-xs text-gray-500">{api.descripcion}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-emerald-600">+{api.confianza}%</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* APIs Pendientes */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-navy-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Para Alcanzar 95%
                </h3>
                <span className="text-sm text-blue-600 font-medium">+{APIS_PENDIENTES.reduce((s, a) => s + a.confianza, 0)}% pendiente</span>
              </div>

              <div className="space-y-2 mb-4">
                {APIS_PENDIENTES.map((api) => (
                  <div
                    key={api.nombre}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <div>
                      <div className="text-sm font-medium text-navy-900">{api.nombre}</div>
                      <div className="text-xs text-gray-500">{api.descripcion}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-600">+{api.confianza}%</div>
                      <div className="text-xs text-gray-400">{api.costo}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-blue-900">Inversión estimada</div>
                    <div className="text-xs text-blue-700">~$800 USD/mes para alcanzar 95% de confianza</div>
                  </div>
                </div>
              </div>

              {/* Data Verification Warning */}
              <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-amber-900">Verificación Pendiente</div>
                    <div className="text-xs text-amber-700 mt-1">
                      {sucursalesVerificadas.length} de {SUCURSALES_CRISPY_TENDERS.length} sucursales
                      tienen coordenadas verificadas via Google Places API.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Cost Structure */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy-900">Estructura de Costos Promedio</h3>
              <span className="text-xs text-gray-500">% sobre ventas</span>
            </div>

            <div className="grid grid-cols-6 gap-4">
              {[
                { label: 'Alimentos', value: ESTRUCTURA_COSTOS.costoAlimentos, color: 'bg-red-500' },
                { label: 'Bebidas', value: ESTRUCTURA_COSTOS.costoBebidas, color: 'bg-blue-500' },
                { label: 'Desechables', value: ESTRUCTURA_COSTOS.costoDesechables, color: 'bg-amber-500' },
                { label: 'Nómina', value: ESTRUCTURA_COSTOS.nomina, color: 'bg-purple-500' },
                { label: 'Fee Operativo', value: ESTRUCTURA_COSTOS.feeOperativo, color: 'bg-gray-500' },
                { label: 'Fee MKT', value: ESTRUCTURA_COSTOS.feeMKT, color: 'bg-pink-500' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${item.value * 100 * 1.76} 176`}
                        className={item.color.replace('bg-', 'text-')}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-navy-900">
                        {(item.value * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="grid grid-cols-4 gap-4">
            <a
              href="/descubrir"
              className="group bg-gradient-to-br from-crispy-500 to-crispy-600 text-white p-5 rounded-2xl hover:from-crispy-600 hover:to-crispy-700 transition-all shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <Target className="w-8 h-8 mb-3 opacity-80" />
                  <div className="font-semibold">Descubrir</div>
                  <div className="text-sm text-crispy-100">Escaneo inteligente</div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            <a
              href="/comparar"
              className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <BarChart3 className="w-8 h-8 mb-3 opacity-80" />
                  <div className="font-semibold">Comparar</div>
                  <div className="text-sm text-blue-100">Análisis lado a lado</div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            <a
              href="/competencia"
              className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <Users className="w-8 h-8 mb-3 opacity-80" />
                  <div className="font-semibold">Competencia</div>
                  <div className="text-sm text-purple-100">KFC, Wingstop...</div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            <a
              href="/sucursales"
              className="group bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-5 rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <Building2 className="w-8 h-8 mb-3 opacity-80" />
                  <div className="font-semibold">Sucursales</div>
                  <div className="text-sm text-emerald-100">{sucursalesActivas.length} operando</div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
