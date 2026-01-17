'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { SUCURSALES_CRISPY_TENDERS } from '@/data/sucursales';
import { PLAZAS_MTY } from '@/data/plazas';
import { COMPETIDORES_MTY, getCompetidoresEnRadio } from '@/data/competencia';
import { calcularViabilidad, rankingPlazas, CONFIG_DEFAULT, ResultadoScoring } from '@/lib/scoring';

// Importar mapa dinámicamente (no SSR para Leaflet)
const MapaInteractivo = dynamic(() => import('@/components/maps/MapaInteractivo'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Cargando mapa...</div>
    </div>
  ),
});

export default function Dashboard() {
  const [plazaSeleccionada, setPlazaSeleccionada] = useState<string | null>('plaza-006'); // Plaza 1500

  // Calcular rankings de todas las plazas
  const rankings = useMemo(() => {
    return rankingPlazas(PLAZAS_MTY, CONFIG_DEFAULT);
  }, []);

  // Obtener análisis de la plaza seleccionada
  const analisisActual = useMemo(() => {
    if (!plazaSeleccionada) return null;
    const plaza = PLAZAS_MTY.find(p => p.id === plazaSeleccionada);
    if (!plaza) return null;
    return calcularViabilidad(plaza, CONFIG_DEFAULT);
  }, [plazaSeleccionada]);

  // Competencia cercana a la plaza seleccionada
  const competenciaCercana = useMemo(() => {
    if (!analisisActual) return [];
    return getCompetidoresEnRadio(
      analisisActual.plaza.lat,
      analisisActual.plaza.lng,
      2 // 2km de radio
    );
  }, [analisisActual]);

  return (
    <div className="space-y-6">
      {/* KPIs Principales */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          titulo="Sucursales Operando"
          valor={SUCURSALES_CRISPY_TENDERS.filter(s => s.status === 'operando').length}
          icono="🏪"
          color="bg-green-500"
        />
        <KPICard
          titulo="Próximamente"
          valor={SUCURSALES_CRISPY_TENDERS.filter(s => s.status === 'proximamente').length}
          icono="🔜"
          color="bg-blue-500"
        />
        <KPICard
          titulo="Propuestas"
          valor={SUCURSALES_CRISPY_TENDERS.filter(s => s.status === 'propuesta').length}
          icono="📍"
          color="bg-purple-500"
        />
        <KPICard
          titulo="Competidores Mapeados"
          valor={COMPETIDORES_MTY.length}
          icono="🎯"
          color="bg-red-500"
        />
      </div>

      {/* Layout principal: Mapa + Panel lateral */}
      <div className="grid grid-cols-3 gap-6">
        {/* Mapa (2 columnas) */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              🗺️ Mapa de Ubicaciones
              <span className="text-sm font-normal text-gray-500">
                (Click en una plaza para ver análisis)
              </span>
            </h2>
            <div className="h-[500px]">
              <MapaInteractivo
                sucursales={SUCURSALES_CRISPY_TENDERS}
                competidores={COMPETIDORES_MTY}
                plazas={PLAZAS_MTY}
                plazaSeleccionada={plazaSeleccionada}
                onPlazaClick={setPlazaSeleccionada}
              />
            </div>
          </div>
        </div>

        {/* Panel de análisis (1 columna) */}
        <div className="space-y-4">
          {analisisActual ? (
            <>
              {/* Score y clasificación */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  📊 {analisisActual.plaza.nombre}
                </h3>

                {/* Score circular */}
                <div className="flex items-center gap-4 mb-4">
                  <ScoreGauge score={analisisActual.scoreTotal} color={analisisActual.color} />
                  <div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: analisisActual.color }}
                    >
                      {analisisActual.clasificacion}
                    </div>
                    <p className="text-sm text-gray-500">
                      Score: {analisisActual.scoreTotal}/100
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {analisisActual.recomendacion}
                </p>
              </div>

              {/* Scores detallados */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-gray-700 mb-3">📈 Factores de Scoring</h3>
                <div className="space-y-2">
                  <ScoreBar label="Flujo Peatonal" score={analisisActual.scoreDetallado.flujoPeatonal} />
                  <ScoreBar label="Tiendas Ancla" score={analisisActual.scoreDetallado.tiendasAncla} />
                  <ScoreBar label="Competencia" score={analisisActual.scoreDetallado.competencia} />
                  <ScoreBar label="Demografía" score={analisisActual.scoreDetallado.perfilDemografico} />
                  <ScoreBar label="Accesibilidad" score={analisisActual.scoreDetallado.accesibilidad} />
                  <ScoreBar label="Costo Renta" score={analisisActual.scoreDetallado.costoRenta} />
                  <ScoreBar label="Visibilidad" score={analisisActual.scoreDetallado.visibilidad} />
                </div>
              </div>

              {/* Proyección financiera */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-gray-700 mb-3">💰 Proyección Financiera</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500">Ventas/mes</div>
                    <div className="font-semibold">
                      ${analisisActual.proyeccionFinanciera.ventasMensualesEstimadas.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500">Utilidad/mes</div>
                    <div className="font-semibold text-green-600">
                      ${analisisActual.proyeccionFinanciera.utilidadMensualEstimada.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500">Payback</div>
                    <div className="font-semibold">
                      {analisisActual.proyeccionFinanciera.paybackMeses} meses
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500">ROI Anual</div>
                    <div className="font-semibold text-blue-600">
                      {analisisActual.proyeccionFinanciera.roiAnual}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Competencia cercana */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  🎯 Competencia en 2km ({competenciaCercana.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {competenciaCercana.slice(0, 5).map(comp => (
                    <div key={comp.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                      <span>{comp.marca}</span>
                      <span className="text-gray-500">{comp.distanciaKm} km</span>
                    </div>
                  ))}
                  {competenciaCercana.length === 0 && (
                    <p className="text-sm text-gray-500">Sin competencia directa en 2km</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              <p>Selecciona una plaza en el mapa para ver el análisis</p>
            </div>
          )}
        </div>
      </div>

      {/* Ranking de Plazas */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">🏆 Ranking de Plazas por Viabilidad</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Plaza</th>
                <th className="text-left p-3">Municipio</th>
                <th className="text-center p-3">Score</th>
                <th className="text-center p-3">Clasificación</th>
                <th className="text-center p-3">ROI Est.</th>
                <th className="text-center p-3">Payback</th>
                <th className="text-center p-3">Status CT</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((resultado, index) => (
                <tr
                  key={resultado.plaza.id}
                  className={`border-t hover:bg-gray-50 cursor-pointer ${
                    plazaSeleccionada === resultado.plaza.id ? 'bg-crispy-50' : ''
                  }`}
                  onClick={() => setPlazaSeleccionada(resultado.plaza.id)}
                >
                  <td className="p-3 font-semibold text-gray-500">{index + 1}</td>
                  <td className="p-3 font-medium">{resultado.plaza.nombre}</td>
                  <td className="p-3 text-gray-600">{resultado.plaza.municipio}</td>
                  <td className="p-3 text-center">
                    <span
                      className="font-bold"
                      style={{ color: resultado.color }}
                    >
                      {resultado.scoreTotal}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        resultado.clasificacion === 'VIABLE' ? 'badge-viable' :
                        resultado.clasificacion === 'EVALUAR' ? 'badge-evaluar' : 'badge-no-viable'
                      }`}
                    >
                      {resultado.clasificacion}
                    </span>
                  </td>
                  <td className="p-3 text-center text-blue-600 font-medium">
                    {resultado.proyeccionFinanciera.roiAnual}%
                  </td>
                  <td className="p-3 text-center">
                    {resultado.proyeccionFinanciera.paybackMeses}m
                  </td>
                  <td className="p-3 text-center">
                    {resultado.plaza.tieneSucursalCT ? (
                      <span className="text-green-600">✅ Tiene</span>
                    ) : resultado.plaza.esPropuesta ? (
                      <span className="text-purple-600">📍 Propuesta</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ========== COMPONENTES AUXILIARES ==========

function KPICard({ titulo, valor, icono, color }: {
  titulo: string;
  valor: number;
  icono: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 card-hover">
      <div className="flex items-center gap-3">
        <div className={`${color} text-white p-3 rounded-lg text-2xl`}>
          {icono}
        </div>
        <div>
          <div className="text-2xl font-bold">{valor}</div>
          <div className="text-sm text-gray-500">{titulo}</div>
        </div>
      </div>
    </div>
  );
}

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="score-gauge">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Fondo */}
        <circle
          cx="50"
          cy="50"
          r="45"
          className="score-gauge-circle"
          style={{ stroke: '#E5E7EB' }}
        />
        {/* Progreso */}
        <circle
          cx="50"
          cy="50"
          r="45"
          className="score-gauge-circle"
          style={{
            stroke: color,
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: 'stroke-dashoffset 0.5s ease'
          }}
        />
        {/* Texto */}
        <text
          x="50"
          y="55"
          textAnchor="middle"
          className="text-2xl font-bold"
          fill={color}
        >
          {score}
        </text>
      </svg>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 75) return 'bg-green-500';
    if (s >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-28 text-gray-600">{label}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${getColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-8 text-right font-medium">{score}</span>
    </div>
  );
}
