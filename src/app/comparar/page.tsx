'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  MapPin,
  Users,
  Target,
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  BarChart3,
  DollarSign,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScoreGauge, ConfidenceBadge } from '@/components/ui';
import { PERFILES_SUCURSAL, proyectarPL, calcularPayback, estimarVentasPorScore } from '@/data/modelo-financiero';

interface OportunidadComparar {
  id: string;
  nombre: string;
  direccion: string;
  municipio: string;
  score: number;
  confianza: number;
  nse: string;
  nseColor: string;
  volumenPeatonal: number;
  competidoresEn2km: number;
  distanciaCT: number;
  rentaEstimada: number;
  factoresPositivos: string[];
  factoresNegativos: string[];
}

// Mock data for demonstration
const OPORTUNIDADES_DISPONIBLES: OportunidadComparar[] = [
  {
    id: '1',
    nombre: 'Plaza Fiesta Anáhuac',
    direccion: 'Av. Universidad 1000, San Nicolás',
    municipio: 'San Nicolás de los Garza',
    score: 78,
    confianza: 72,
    nse: 'C+',
    nseColor: '#3B82F6',
    volumenPeatonal: 72,
    competidoresEn2km: 2,
    distanciaCT: 4.2,
    rentaEstimada: 28000,
    factoresPositivos: ['Alto flujo peatonal', 'Sin CT en 4km', 'Zona universitaria'],
    factoresNegativos: ['2 competidores cercanos'],
  },
  {
    id: '2',
    nombre: 'Paseo La Fe',
    direccion: 'Av. Miguel Alemán 200, San Nicolás',
    municipio: 'San Nicolás de los Garza',
    score: 82,
    confianza: 68,
    nse: 'B',
    nseColor: '#10B981',
    volumenPeatonal: 85,
    competidoresEn2km: 1,
    distanciaCT: 5.8,
    rentaEstimada: 35000,
    factoresPositivos: ['Muy alto flujo', 'NSE B', 'Plaza nueva', 'Sin CT en 5km'],
    factoresNegativos: ['Renta elevada'],
  },
  {
    id: '3',
    nombre: 'Plaza Cumbres',
    direccion: 'Av. Paseo de los Leones 500, Cumbres',
    municipio: 'Monterrey',
    score: 71,
    confianza: 75,
    nse: 'B',
    nseColor: '#10B981',
    volumenPeatonal: 65,
    competidoresEn2km: 3,
    distanciaCT: 6.1,
    rentaEstimada: 32000,
    factoresPositivos: ['NSE B', 'Sin CT en 6km', 'Zona familiar'],
    factoresNegativos: ['3 competidores', 'Flujo moderado'],
  },
  {
    id: '4',
    nombre: 'Citadel Sur',
    direccion: 'Carretera Nacional Km 265, MTY Sur',
    municipio: 'Monterrey',
    score: 68,
    confianza: 65,
    nse: 'A',
    nseColor: '#8B5CF6',
    volumenPeatonal: 55,
    competidoresEn2km: 1,
    distanciaCT: 8.2,
    rentaEstimada: 45000,
    factoresPositivos: ['NSE A', 'Mercado virgen', 'Poca competencia'],
    factoresNegativos: ['Renta muy alta', 'Flujo bajo'],
  },
];

export default function CompararPage() {
  const [seleccionados, setSeleccionados] = useState<OportunidadComparar[]>([]);
  const [showSelector, setShowSelector] = useState(false);

  const agregarOportunidad = (oportunidad: OportunidadComparar) => {
    if (seleccionados.length < 3 && !seleccionados.find(s => s.id === oportunidad.id)) {
      setSeleccionados([...seleccionados, oportunidad]);
    }
    setShowSelector(false);
  };

  const quitarOportunidad = (id: string) => {
    setSeleccionados(seleccionados.filter(s => s.id !== id));
  };

  const getProyeccion = (oportunidad: OportunidadComparar) => {
    const ventasEstimadas = estimarVentasPorScore(oportunidad.score);
    return proyectarPL({
      ventasEstimadas: ventasEstimadas.ventasEsperadas,
      rentaMensual: oportunidad.rentaEstimada,
    });
  };

  const getMejorEnMetrica = (metrica: keyof OportunidadComparar) => {
    if (seleccionados.length === 0) return null;
    return seleccionados.reduce((mejor, actual) => {
      const valorMejor = mejor[metrica] as number;
      const valorActual = actual[metrica] as number;
      // Para competidores y renta, menor es mejor
      if (metrica === 'competidoresEn2km' || metrica === 'rentaEstimada') {
        return valorActual < valorMejor ? actual : mejor;
      }
      return valorActual > valorMejor ? actual : mejor;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
            <Scale className="w-7 h-7 text-crispy-500" />
            Comparador de Oportunidades
          </h1>
          <p className="text-gray-500 mt-1">
            Selecciona hasta 3 ubicaciones para comparar lado a lado
          </p>
        </div>

        {seleccionados.length < 3 && (
          <button
            onClick={() => setShowSelector(true)}
            className="flex items-center gap-2 px-4 py-2 bg-crispy-500 text-white rounded-xl hover:bg-crispy-600 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Agregar Ubicación
          </button>
        )}
      </div>

      {/* Empty State */}
      {seleccionados.length === 0 && (
        <motion.div
          className="bg-white rounded-2xl shadow-card p-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-crispy-100 to-crispy-200 rounded-2xl flex items-center justify-center">
            <Scale className="w-10 h-10 text-crispy-600" />
          </div>
          <h3 className="text-xl font-semibold text-navy-900 mb-2">
            Comienza a Comparar
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Selecciona oportunidades desde la página de Descubrir o agrega ubicaciones
            para ver una comparación detallada lado a lado.
          </p>
          <button
            onClick={() => setShowSelector(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-crispy-500 text-white rounded-xl hover:bg-crispy-600 transition"
          >
            <Plus className="w-5 h-5" />
            Agregar Primera Ubicación
          </button>
        </motion.div>
      )}

      {/* Comparison Grid */}
      {seleccionados.length > 0 && (
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${seleccionados.length}, 1fr)` }}>
          {seleccionados.map((oportunidad, index) => {
            const proyeccion = getProyeccion(oportunidad);
            const payback = calcularPayback(proyeccion.utilidadNeta);
            const mejorScore = getMejorEnMetrica('score')?.id === oportunidad.id;
            const mejorPeatonal = getMejorEnMetrica('volumenPeatonal')?.id === oportunidad.id;
            const menosCompetencia = getMejorEnMetrica('competidoresEn2km')?.id === oportunidad.id;
            const mejorRenta = getMejorEnMetrica('rentaEstimada')?.id === oportunidad.id;

            return (
              <motion.div
                key={oportunidad.id}
                className="bg-white rounded-2xl shadow-card overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Header */}
                <div className="relative bg-gradient-to-r from-navy-800 to-navy-900 p-4 text-white">
                  <button
                    onClick={() => quitarOportunidad(oportunidad.id)}
                    className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <h3 className="font-semibold pr-8">{oportunidad.nombre}</h3>
                  <p className="text-sm text-white/70 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {oportunidad.municipio}
                  </p>
                </div>

                {/* Score */}
                <div className="p-4 border-b flex items-center justify-center gap-4">
                  <ScoreGauge score={oportunidad.score} size="md" />
                  <div>
                    <ConfidenceBadge confidence={oportunidad.confianza} size="sm" />
                    {mejorScore && (
                      <span className="block mt-2 text-xs text-emerald-600 font-medium">
                        Mejor score
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="p-4 space-y-3 border-b">
                  {/* NSE */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">NSE</span>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: oportunidad.nseColor }}
                    >
                      {oportunidad.nse}
                    </span>
                  </div>

                  {/* Peatonal */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Peatonal
                    </span>
                    <span className={cn(
                      "font-semibold",
                      mejorPeatonal ? "text-emerald-600" : "text-gray-700"
                    )}>
                      {oportunidad.volumenPeatonal}%
                      {mejorPeatonal && <span className="text-xs ml-1">★</span>}
                    </span>
                  </div>

                  {/* Competidores */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      Competidores
                    </span>
                    <span className={cn(
                      "font-semibold",
                      menosCompetencia ? "text-emerald-600" : "text-gray-700"
                    )}>
                      {oportunidad.competidoresEn2km} en 2km
                      {menosCompetencia && <span className="text-xs ml-1">★</span>}
                    </span>
                  </div>

                  {/* Distancia CT */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      Distancia CT
                    </span>
                    <span className="font-semibold text-gray-700">
                      {oportunidad.distanciaCT} km
                    </span>
                  </div>

                  {/* Renta */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Renta Est.
                    </span>
                    <span className={cn(
                      "font-semibold",
                      mejorRenta ? "text-emerald-600" : "text-gray-700"
                    )}>
                      ${oportunidad.rentaEstimada.toLocaleString()}
                      {mejorRenta && <span className="text-xs ml-1">★</span>}
                    </span>
                  </div>
                </div>

                {/* Financial Projection */}
                <div className="p-4 bg-gray-50 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Proyección Financiera
                  </h4>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ventas Est.</span>
                      <span className="font-medium">${proyeccion.ventas.toLocaleString()}/mes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Utilidad Neta</span>
                      <span className={cn(
                        "font-medium",
                        proyeccion.utilidadNeta > 0 ? "text-emerald-600" : "text-red-600"
                      )}>
                        ${Math.round(proyeccion.utilidadNeta).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Margen Neto</span>
                      <span className={cn(
                        "font-medium",
                        proyeccion.margenNeto >= 0.15 ? "text-emerald-600" :
                        proyeccion.margenNeto >= 0.10 ? "text-amber-600" : "text-red-600"
                      )}>
                        {(proyeccion.margenNeto * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Payback
                      </span>
                      <span className={cn(
                        "font-semibold",
                        payback.clasificacion === 'excelente' ? "text-emerald-600" :
                        payback.clasificacion === 'bueno' ? "text-blue-600" :
                        payback.clasificacion === 'aceptable' ? "text-amber-600" : "text-red-600"
                      )}>
                        {payback.meses} meses
                      </span>
                    </div>
                  </div>

                  {/* Viabilidad */}
                  <div className={cn(
                    "mt-3 p-2 rounded-lg text-center text-sm font-medium",
                    proyeccion.viable
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  )}>
                    {proyeccion.viable ? (
                      <span className="flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Viable
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        Riesgo Alto
                      </span>
                    )}
                  </div>
                </div>

                {/* Factors */}
                <div className="p-4 space-y-3">
                  {oportunidad.factoresPositivos.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Fortalezas
                      </h5>
                      <div className="space-y-1">
                        {oportunidad.factoresPositivos.map((factor, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {oportunidad.factoresNegativos.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Debilidades
                      </h5>
                      <div className="space-y-1">
                        {oportunidad.factoresNegativos.map((factor, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <TrendingDown className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Selector Modal */}
      <AnimatePresence>
        {showSelector && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSelector(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-navy-900">Seleccionar Ubicación</h3>
                <button
                  onClick={() => setShowSelector(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
                {OPORTUNIDADES_DISPONIBLES.filter(
                  o => !seleccionados.find(s => s.id === o.id)
                ).map(oportunidad => (
                  <button
                    key={oportunidad.id}
                    onClick={() => agregarOportunidad(oportunidad)}
                    className="w-full p-4 bg-gray-50 hover:bg-crispy-50 rounded-xl text-left transition border-2 border-transparent hover:border-crispy-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-navy-900">{oportunidad.nombre}</h4>
                        <p className="text-sm text-gray-500">{oportunidad.direccion}</p>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "text-2xl font-bold",
                          oportunidad.score >= 75 ? "text-emerald-600" :
                          oportunidad.score >= 60 ? "text-blue-600" :
                          oportunidad.score >= 45 ? "text-amber-600" : "text-red-600"
                        )}>
                          {oportunidad.score}
                        </div>
                        <div className="text-xs text-gray-400">score</div>
                      </div>
                    </div>
                  </button>
                ))}

                {OPORTUNIDADES_DISPONIBLES.filter(
                  o => !seleccionados.find(s => s.id === o.id)
                ).length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No hay más ubicaciones disponibles
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      {seleccionados.length >= 2 && (
        <motion.div
          className="bg-gradient-to-r from-navy-800 to-navy-900 rounded-2xl p-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-semibold text-lg mb-4">Resumen Comparativo</h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-white/60 text-sm">Mejor Score</p>
              <p className="text-xl font-bold text-emerald-400">
                {getMejorEnMetrica('score')?.nombre}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Mejor Renta</p>
              <p className="text-xl font-bold text-emerald-400">
                {getMejorEnMetrica('rentaEstimada')?.nombre}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Menos Competencia</p>
              <p className="text-xl font-bold text-emerald-400">
                {getMejorEnMetrica('competidoresEn2km')?.nombre}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
