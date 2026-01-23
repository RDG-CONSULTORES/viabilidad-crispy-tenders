'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Users,
  Target,
  Building2,
  TrendingUp,
  ChevronRight,
  X,
  Loader2,
  BarChart3,
  Map as MapIcon,
  List,
  Download,
} from 'lucide-react';
import {
  ScoreGauge,
  ConfidenceBadge,
  MetricCard,
  OpportunityCard,
  FootTrafficChart,
} from '@/components/ui';
import { cn, formatNumber } from '@/lib/utils';

// Dynamic import for InteractiveMap to avoid SSR issues with Leaflet
const InteractiveMap = dynamic(
  () => import('@/components/ui/InteractiveMap').then(mod => mod.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    )
  }
);
import { SUCURSALES_CRISPY_TENDERS } from '@/data/sucursales';
import { COMPETIDORES_MTY } from '@/data/competencia';

interface Oportunidad {
  placeId: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  rating?: number;
  totalReviews?: number;
  zonaOrigen: string;
  municipio: string;
  nseEstimado: string;
  nseColor: string;
  distanciaCTMasCercano: number;
  sucursalCTMasCercana: string;
  distanciaKFCMasCercano: number;
  competidoresEn2km: number;
  volumenPeatonal: {
    estimado: number;
    nivel: string;
    color: string;
    fuente: 'besttime' | 'estimado';
    promedioSemanal?: number;
    mejorDia?: string;
    horasPico?: string;
  };
  scoreViabilidad: number;
  clasificacion: 'EXCELENTE' | 'BUENA' | 'EVALUAR' | 'RIESGOSA';
  factoresPositivos: string[];
  factoresNegativos: string[];
}

interface ResultadoEscaneo {
  success: boolean;
  filtros: {
    limite: number;
    nseMinimo: string;
    distanciaMinCT: number;
  };
  resumen: {
    totalEscaneadas: number;
    totalFiltradas: number;
    mejoresEncontradas: number;
    distribucionClasificacion: {
      excelentes: number;
      buenas: number;
      evaluar: number;
      riesgosas: number;
    };
    scorePromedio: number;
    mejorScore: number;
  };
  oportunidades: Oportunidad[];
}

export default function DescubrirPage() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoEscaneo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [limite, setLimite] = useState(20);
  const [nseMinimo, setNseMinimo] = useState('C');
  const [distanciaMinCT, setDistanciaMinCT] = useState(2);

  const [selectedOportunidad, setSelectedOportunidad] = useState<Oportunidad | null>(null);

  const iniciarEscaneo = async () => {
    setLoading(true);
    setError(null);
    setResultado(null);
    setSelectedOportunidad(null);

    try {
      const params = new URLSearchParams({
        limite: limite.toString(),
        nseMinimo,
        distanciaMinCT: distanciaMinCT.toString(),
      });

      const response = await fetch(`/api/descubrir-oportunidades?${params}`);
      const data = await response.json();

      if (data.success) {
        setResultado(data);
        if (data.oportunidades.length > 0) {
          setSelectedOportunidad(data.oportunidades[0]);
        }
      } else {
        setError(data.error || 'Error en el escaneo');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Map data
  const mapOpportunities = useMemo(() => {
    if (!resultado) return [];
    return resultado.oportunidades.map(o => ({
      id: o.placeId,
      lat: o.lat,
      lng: o.lng,
      name: o.nombre,
      type: 'opportunity' as const,
      score: o.scoreViabilidad,
      details: o,
    }));
  }, [resultado]);

  const existingStores = useMemo(() => {
    return SUCURSALES_CRISPY_TENDERS.filter(s => s.status === 'operando').map(s => ({
      id: s.id,
      lat: s.lat,
      lng: s.lng,
      name: s.nombre,
      type: 'ct_existing' as const,
    }));
  }, []);

  const competitors = useMemo(() => {
    return COMPETIDORES_MTY.slice(0, 30).map(c => ({
      id: `comp-${c.lat}-${c.lng}`,
      lat: c.lat,
      lng: c.lng,
      name: c.nombre,
      type: c.marca === 'KFC' ? 'competitor_kfc' as const : 'competitor_other' as const,
    }));
  }, []);

  // Foot traffic mock data for selected opportunity
  const footTrafficData = useMemo(() => {
    if (!selectedOportunidad) return [];
    const baseValue = selectedOportunidad.volumenPeatonal.estimado * 120;
    return [
      { day: 'Lun', value: Math.round(baseValue * 0.7) },
      { day: 'Mar', value: Math.round(baseValue * 0.8) },
      { day: 'Mié', value: Math.round(baseValue * 0.85) },
      { day: 'Jue', value: Math.round(baseValue * 0.9) },
      { day: 'Vie', value: Math.round(baseValue * 1.1) },
      { day: 'Sáb', value: Math.round(baseValue * 1.3) },
      { day: 'Dom', value: Math.round(baseValue * 1.15) },
    ];
  }, [selectedOportunidad]);

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
                Descubrir Oportunidades
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Escaneo inteligente del Área Metropolitana de Monterrey
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5',
                    viewMode === 'map'
                      ? 'bg-white shadow-sm text-navy-900'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <MapIcon className="w-4 h-4" />
                  Mapa
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5',
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-navy-900'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <List className="w-4 h-4" />
                  Lista
                </button>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                  showFilters
                    ? 'bg-navy-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
              </button>

              {/* Scan Button */}
              <button
                onClick={iniciarEscaneo}
                disabled={loading}
                className="px-5 py-2 bg-gradient-to-r from-crispy-500 to-crispy-600 text-white rounded-xl text-sm font-semibold hover:from-crispy-600 hover:to-crispy-700 transition-all shadow-lg shadow-crispy-500/25 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Escaneando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Iniciar Escaneo
                  </>
                )}
              </button>
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
                <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Máximo Resultados
                    </label>
                    <select
                      value={limite}
                      onChange={(e) => setLimite(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-crispy-500 focus:border-transparent"
                    >
                      <option value={10}>Top 10</option>
                      <option value={20}>Top 20</option>
                      <option value={30}>Top 30</option>
                      <option value={50}>Top 50</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      NSE Mínimo
                    </label>
                    <select
                      value={nseMinimo}
                      onChange={(e) => setNseMinimo(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-crispy-500 focus:border-transparent"
                    >
                      <option value="A">Solo A (Premium)</option>
                      <option value="B">B o superior</option>
                      <option value="C+">C+ o superior</option>
                      <option value="C">C o superior</option>
                      <option value="D">Todas las zonas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Distancia mín. a CT
                    </label>
                    <select
                      value={distanciaMinCT}
                      onChange={(e) => setDistanciaMinCT(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-crispy-500 focus:border-transparent"
                    >
                      <option value={1}>1 km</option>
                      <option value={2}>2 km</option>
                      <option value={3}>3 km</option>
                      <option value={5}>5 km</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                    >
                      Aplicar y Cerrar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <X className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {/* Results Summary */}
        {resultado && (
          <motion.div
            className="grid grid-cols-6 gap-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <MetricCard
              icon={MapPin}
              label="Plazas Escaneadas"
              value={resultado.resumen.totalEscaneadas}
              color="navy"
            />
            <MetricCard
              icon={TrendingUp}
              label="Mejor Score"
              value={resultado.resumen.mejorScore}
              color="emerald"
            />
            <div className="bg-emerald-50 rounded-2xl p-4 flex flex-col items-center justify-center border-2 border-emerald-200">
              <span className="text-3xl font-bold text-emerald-600">
                {resultado.resumen.distribucionClasificacion.excelentes}
              </span>
              <span className="text-sm font-medium text-emerald-700">Excelentes</span>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 flex flex-col items-center justify-center border-2 border-blue-200">
              <span className="text-3xl font-bold text-blue-600">
                {resultado.resumen.distribucionClasificacion.buenas}
              </span>
              <span className="text-sm font-medium text-blue-700">Buenas</span>
            </div>
            <div className="bg-amber-50 rounded-2xl p-4 flex flex-col items-center justify-center border-2 border-amber-200">
              <span className="text-3xl font-bold text-amber-600">
                {resultado.resumen.distribucionClasificacion.evaluar}
              </span>
              <span className="text-sm font-medium text-amber-700">A evaluar</span>
            </div>
            <div className="bg-red-50 rounded-2xl p-4 flex flex-col items-center justify-center border-2 border-red-200">
              <span className="text-3xl font-bold text-red-600">
                {resultado.resumen.distribucionClasificacion.riesgosas}
              </span>
              <span className="text-sm font-medium text-red-700">Riesgosas</span>
            </div>
          </motion.div>
        )}

        {/* Main Layout */}
        {resultado ? (
          <div className="grid grid-cols-12 gap-6">
            {/* Map or List View */}
            <div className={cn(
              'col-span-8',
              viewMode === 'list' && 'col-span-12 lg:col-span-8'
            )}>
              {viewMode === 'map' ? (
                <InteractiveMap
                  opportunities={mapOpportunities}
                  existingStores={existingStores}
                  competitors={competitors}
                  selectedId={selectedOportunidad?.placeId}
                  onMarkerClick={(point) => {
                    const opp = resultado.oportunidades.find(o => o.placeId === point.id);
                    if (opp) setSelectedOportunidad(opp);
                  }}
                  className="h-[600px]"
                />
              ) : (
                <div className="space-y-4">
                  {resultado.oportunidades.map((oportunidad, index) => (
                    <OpportunityCard
                      key={oportunidad.placeId}
                      rank={index + 1}
                      name={oportunidad.nombre}
                      address={oportunidad.direccion}
                      municipality={oportunidad.municipio}
                      score={oportunidad.scoreViabilidad}
                      nse={oportunidad.nseEstimado}
                      nseColor={oportunidad.nseColor}
                      pedestrianVolume={oportunidad.volumenPeatonal.estimado}
                      pedestrianLevel={oportunidad.volumenPeatonal.nivel}
                      pedestrianColor={oportunidad.volumenPeatonal.color}
                      competitors={oportunidad.competidoresEn2km}
                      distanceToCT={oportunidad.distanciaCTMasCercano}
                      confidence={85}
                      positiveFactors={oportunidad.factoresPositivos}
                      negativeFactors={oportunidad.factoresNegativos}
                      isSelected={selectedOportunidad?.placeId === oportunidad.placeId}
                      onClick={() => setSelectedOportunidad(oportunidad)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Detail Panel */}
            <div className="col-span-4 space-y-4">
              {selectedOportunidad ? (
                <>
                  {/* Score Card */}
                  <motion.div
                    className="bg-white rounded-2xl p-6 shadow-card"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={selectedOportunidad.placeId}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="font-bold text-xl text-navy-900">
                          {selectedOportunidad.nombre}
                        </h2>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {selectedOportunidad.municipio}
                        </p>
                      </div>
                      <ScoreGauge score={selectedOportunidad.scoreViabilidad} size="md" />
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <ConfidenceBadge confidence={85} showBar size="md" />
                    </div>

                    {/* Quick Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <Users className="w-4 h-4" />
                          <span className="text-xs font-medium">Peatones</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span
                            className="text-xl font-bold"
                            style={{ color: selectedOportunidad.volumenPeatonal.color }}
                          >
                            {selectedOportunidad.volumenPeatonal.estimado}%
                          </span>
                          <span className="text-xs text-gray-400">
                            {selectedOportunidad.volumenPeatonal.nivel}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <Target className="w-4 h-4" />
                          <span className="text-xs font-medium">Competencia</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className={cn(
                            'text-xl font-bold',
                            selectedOportunidad.competidoresEn2km <= 2 ? 'text-emerald-600' : 'text-amber-600'
                          )}>
                            {selectedOportunidad.competidoresEn2km}
                          </span>
                          <span className="text-xs text-gray-400">en 2km</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <Building2 className="w-4 h-4" />
                          <span className="text-xs font-medium">Dist. CT</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-navy-700">
                            {selectedOportunidad.distanciaCTMasCercano}
                          </span>
                          <span className="text-xs text-gray-400">km</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <BarChart3 className="w-4 h-4" />
                          <span className="text-xs font-medium">NSE</span>
                        </div>
                        <div
                          className="text-xl font-bold"
                          style={{ color: selectedOportunidad.nseColor }}
                        >
                          {selectedOportunidad.nseEstimado}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Foot Traffic Chart */}
                  <FootTrafficChart data={footTrafficData} />

                  {/* Factors */}
                  <motion.div
                    className="bg-white rounded-2xl p-5 shadow-card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="font-semibold text-navy-900 mb-4">Factores de Viabilidad</h3>

                    {selectedOportunidad.factoresPositivos.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                          Positivos
                        </p>
                        <ul className="space-y-1.5">
                          {selectedOportunidad.factoresPositivos.map((factor, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-700 flex items-start gap-2"
                            >
                              <span className="text-emerald-500 mt-0.5">✓</span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedOportunidad.factoresNegativos.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">
                          Riesgos
                        </p>
                        <ul className="space-y-1.5">
                          {selectedOportunidad.factoresNegativos.map((factor, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-700 flex items-start gap-2"
                            >
                              <span className="text-red-500 mt-0.5">✗</span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedOportunidad.lat},${selectedOportunidad.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition text-center"
                    >
                      Ver en Maps
                    </a>
                    <button className="flex-1 py-2.5 bg-crispy-500 text-white rounded-xl text-sm font-medium hover:bg-crispy-600 transition flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Exportar
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-card text-center">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Selecciona una oportunidad del mapa para ver el detalle
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty State */
          <motion.div
            className="bg-white rounded-2xl shadow-card p-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-crispy-100 to-crispy-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-crispy-600" />
            </div>
            <h2 className="text-2xl font-bold text-navy-900 mb-2">
              Escanea el Área Metropolitana
            </h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Nuestro algoritmo analizará 22 zonas estratégicas para encontrar
              las mejores oportunidades para Crispy Tenders.
            </p>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-400 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                NSE y poder adquisitivo
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                Flujo peatonal
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                Competencia
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Canibalización
              </div>
            </div>

            <button
              onClick={iniciarEscaneo}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-crispy-500 to-crispy-600 text-white rounded-xl font-semibold hover:from-crispy-600 hover:to-crispy-700 transition-all shadow-lg shadow-crispy-500/25 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Escaneando el AMM...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Iniciar Escaneo Inteligente
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
