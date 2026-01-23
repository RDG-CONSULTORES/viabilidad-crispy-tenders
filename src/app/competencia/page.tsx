'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  MapPin,
  Building2,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Filter,
  BarChart3,
  TrendingUp,
  Shield,
  Eye,
  EyeOff,
  ChevronDown,
  ExternalLink,
  Info,
  Database,
} from 'lucide-react';
import {
  COMPETIDORES_MTY,
  Competidor,
  MarcaCompetencia,
  COLORES_MARCAS,
  getCompetidoresPorMarca,
} from '@/data/competencia';
import { cn } from '@/lib/utils';

// Mapa dinámico
const MapaCompetencia = dynamic(() => import('@/components/maps/MapaCompetencia'), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-gray-100 rounded-2xl flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
    </div>
  ),
});

const MARCAS: MarcaCompetencia[] = ['KFC', 'Wingstop', 'El Pollo Loco'];
const MUNICIPIOS = [
  'Todos',
  'Guadalupe',
  'Monterrey',
  'San Pedro Garza García',
  'San Nicolás de los Garza',
  'Apodaca',
  'Santa Catarina',
  'General Escobedo',
];

interface CompetidorINEGI extends Competidor {
  fuenteINEGI?: boolean;
  distanciaKm?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CompetenciaPage() {
  const [filtroMarcas, setFiltroMarcas] = useState<Set<MarcaCompetencia>>(new Set(MARCAS));
  const [filtroMunicipio, setFiltroMunicipio] = useState<string>('Todos');
  const [cargandoINEGI, setCargandoINEGI] = useState(false);
  const [competidoresINEGI, setCompetidoresINEGI] = useState<CompetidorINEGI[]>([]);
  const [errorINEGI, setErrorINEGI] = useState<string | null>(null);
  const [mostrarINEGI, setMostrarINEGI] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCompetidor, setSelectedCompetidor] = useState<CompetidorINEGI | null>(null);

  // Función para obtener datos de INEGI
  const actualizarDesdeINEGI = useCallback(async () => {
    setCargandoINEGI(true);
    setErrorINEGI(null);

    try {
      const lat = 25.6866;
      const lng = -100.3161;
      const radio = 10000;

      const response = await fetch(`/api/competidores?tipo=zona&lat=${lat}&lng=${lng}&radio=${radio}`);

      if (!response.ok) {
        throw new Error('Error al consultar INEGI');
      }

      const data = await response.json();

      if (data.success && data.competidores) {
        const competidoresConvertidos: CompetidorINEGI[] = data.competidores.map((c: any) => ({
          ...c,
          fuenteINEGI: true
        }));
        setCompetidoresINEGI(competidoresConvertidos);
        setMostrarINEGI(true);
      }
    } catch (error) {
      console.error('Error INEGI:', error);
      setErrorINEGI('No se pudieron obtener datos de INEGI. Mostrando datos locales.');
    } finally {
      setCargandoINEGI(false);
    }
  }, []);

  // Competidores filtrados
  const competidoresFiltrados = useMemo(() => {
    let resultado: CompetidorINEGI[] = mostrarINEGI && competidoresINEGI.length > 0
      ? competidoresINEGI
      : COMPETIDORES_MTY;

    resultado = resultado.filter(c => filtroMarcas.has(c.marca));

    if (filtroMunicipio !== 'Todos') {
      resultado = resultado.filter(c => c.municipio === filtroMunicipio);
    }

    return resultado;
  }, [filtroMarcas, filtroMunicipio, mostrarINEGI, competidoresINEGI]);

  // Estadísticas
  const stats = useMemo(() => {
    const porMarca: Record<string, number> = {};
    const porMunicipio: Record<string, number> = {};
    const porTipo: Record<string, number> = { directa: 0, indirecta: 0 };
    const porAmenaza: Record<string, number> = { alto: 0, medio: 0, bajo: 0 };

    competidoresFiltrados.forEach(c => {
      porMarca[c.marca] = (porMarca[c.marca] || 0) + 1;
      porMunicipio[c.municipio] = (porMunicipio[c.municipio] || 0) + 1;
      porTipo[c.tipoCompetencia]++;
      porAmenaza[c.nivelAmenaza]++;
    });

    return { porMarca, porMunicipio, porTipo, porAmenaza };
  }, [competidoresFiltrados]);

  // Toggle marca
  const toggleMarca = (marca: MarcaCompetencia) => {
    const newSet = new Set(filtroMarcas);
    if (newSet.has(marca)) {
      newSet.delete(marca);
    } else {
      newSet.add(marca);
    }
    setFiltroMarcas(newSet);
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
                Mapa de Competencia
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Análisis de competidores en el AMM
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Data Source Toggle */}
              <div className="flex items-center gap-2 text-sm">
                <span className={cn(
                  'px-2 py-1 rounded-md transition',
                  !mostrarINEGI ? 'bg-navy-100 text-navy-700 font-medium' : 'text-gray-400'
                )}>
                  Local
                </span>
                <span className={cn(
                  'px-2 py-1 rounded-md transition',
                  mostrarINEGI ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-400'
                )}>
                  INEGI
                </span>
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

              {/* INEGI Button */}
              <button
                onClick={actualizarDesdeINEGI}
                disabled={cargandoINEGI}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center gap-2"
              >
                {cargandoINEGI ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    Actualizar INEGI
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
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-8">
                    {/* Filtro por Marca */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Marcas
                      </label>
                      <div className="flex gap-2">
                        {MARCAS.map(marca => (
                          <button
                            key={marca}
                            onClick={() => toggleMarca(marca)}
                            className={cn(
                              'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm',
                              filtroMarcas.has(marca)
                                ? 'text-white shadow-md'
                                : 'bg-white text-gray-400 border border-gray-200'
                            )}
                            style={{
                              backgroundColor: filtroMarcas.has(marca) ? COLORES_MARCAS[marca] : undefined
                            }}
                          >
                            {filtroMarcas.has(marca) ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                            {marca}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filtro por Municipio */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Municipio
                      </label>
                      <select
                        value={filtroMunicipio}
                        onChange={(e) => setFiltroMunicipio(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-crispy-500 focus:border-transparent"
                      >
                        {MUNICIPIOS.map(m => (
                          <option key={m} value={m}>{m === 'Todos' ? 'Todos los municipios' : m}</option>
                        ))}
                      </select>
                    </div>

                    {/* Reset Button */}
                    <div className="ml-auto">
                      <button
                        onClick={() => {
                          setFiltroMarcas(new Set(MARCAS));
                          setFiltroMunicipio('Todos');
                        }}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                      >
                        Resetear filtros
                      </button>
                    </div>
                  </div>
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
          {/* Alerts */}
          <AnimatePresence>
            {mostrarINEGI && (
              <motion.div
                className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    Mostrando <strong>{competidoresINEGI.length}</strong> establecimientos de INEGI DENUE
                  </span>
                </div>
                <button
                  onClick={() => setMostrarINEGI(false)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Volver a datos locales
                </button>
              </motion.div>
            )}

            {errorINEGI && (
              <motion.div
                className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-amber-700">{errorINEGI}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-5 gap-4">
            {/* Total */}
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-navy-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-navy-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-navy-900">{competidoresFiltrados.length}</div>
                  <div className="text-xs text-gray-500">Total competidores</div>
                </div>
              </div>
            </div>

            {/* Directa */}
            <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-700">{stats.porTipo.directa}</div>
                  <div className="text-xs text-red-600">Comp. directa</div>
                </div>
              </div>
            </div>

            {/* Indirecta */}
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-700">{stats.porTipo.indirecta}</div>
                  <div className="text-xs text-amber-600">Comp. indirecta</div>
                </div>
              </div>
            </div>

            {/* Alta amenaza */}
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-navy-900">{stats.porAmenaza.alto}</div>
                  <div className="text-xs text-gray-500">Amenaza alta</div>
                </div>
              </div>
            </div>

            {/* Municipios */}
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-navy-900">{Object.keys(stats.porMunicipio).length}</div>
                  <div className="text-xs text-gray-500">Municipios</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Map Section */}
            <motion.div variants={itemVariants} className="col-span-8">
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-navy-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-crispy-500" />
                    Mapa de Competidores
                  </h2>
                  <span className="text-sm text-gray-500">
                    {competidoresFiltrados.length} ubicaciones
                  </span>
                </div>
                <div className="h-[550px]">
                  <MapaCompetencia competidores={competidoresFiltrados} />
                </div>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div variants={itemVariants} className="col-span-4 space-y-4">
              {/* Por Marca */}
              <div className="bg-white rounded-2xl p-5 shadow-card">
                <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                  Distribución por Marca
                </h3>
                <div className="space-y-4">
                  {Object.entries(stats.porMarca)
                    .sort((a, b) => b[1] - a[1])
                    .map(([marca, count]) => {
                      const total = competidoresFiltrados.length;
                      const porcentaje = Math.round((count / total) * 100);

                      return (
                        <div key={marca}>
                          <div className="flex justify-between text-sm mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ background: COLORES_MARCAS[marca as MarcaCompetencia] }}
                              />
                              <span className="font-medium text-navy-900">{marca}</span>
                            </div>
                            <span className="text-gray-500">{count} ({porcentaje}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <motion.div
                              className="h-2 rounded-full"
                              style={{ background: COLORES_MARCAS[marca as MarcaCompetencia] }}
                              initial={{ width: 0 }}
                              animate={{ width: `${porcentaje}%` }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Por Municipio */}
              <div className="bg-white rounded-2xl p-5 shadow-card">
                <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  Por Municipio
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {Object.entries(stats.porMunicipio)
                    .sort((a, b) => b[1] - a[1])
                    .map(([municipio, count]) => (
                      <div
                        key={municipio}
                        className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg"
                      >
                        <span className="text-gray-700">{municipio}</span>
                        <span className="font-semibold text-navy-900">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Insights */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5 border border-amber-200">
                <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Insights
                </h3>
                <ul className="text-sm text-amber-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span>KFC domina en Guadalupe con {getCompetidoresPorMarca('KFC').filter(c => c.municipio === 'Guadalupe').length} sucursales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span>Wingstop enfocado en zonas premium</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span>Zona oriente tiene menor saturación</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Competitors Table */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-navy-900">Lista de Competidores</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-600">Marca</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Nombre</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Dirección</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Municipio</th>
                    <th className="text-center p-4 font-semibold text-gray-600">Tipo</th>
                    <th className="text-center p-4 font-semibold text-gray-600">Amenaza</th>
                    <th className="text-center p-4 font-semibold text-gray-600">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {competidoresFiltrados.map((comp, index) => (
                    <motion.tr
                      key={comp.id}
                      className="border-t border-gray-100 hover:bg-gray-50 transition"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ background: COLORES_MARCAS[comp.marca] }}
                          />
                          <span className="font-medium text-navy-900">{comp.marca}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-700">{comp.nombre}</td>
                      <td className="p-4 text-gray-500 text-xs max-w-xs truncate">{comp.direccion}</td>
                      <td className="p-4 text-gray-700">{comp.municipio}</td>
                      <td className="p-4 text-center">
                        <span className={cn(
                          'px-2 py-1 rounded-lg text-xs font-medium',
                          comp.tipoCompetencia === 'directa'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        )}>
                          {comp.tipoCompetencia}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={cn(
                          'px-2 py-1 rounded-lg text-xs font-medium',
                          comp.nivelAmenaza === 'alto' ? 'bg-red-100 text-red-700' :
                          comp.nivelAmenaza === 'medio' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        )}>
                          {comp.nivelAmenaza}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${comp.lat},${comp.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Maps
                        </a>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
