'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PLAZAS_MTY, Plaza, calcularFlujoPromedio, getDiaMayorFlujo } from '@/data/plazas';
import { getCompetidoresEnRadio, COLORES_MARCAS } from '@/data/competencia';
import { calcularViabilidad, CONFIG_DEFAULT, ResultadoScoring } from '@/lib/scoring';

// Mapa dinámico (no SSR)
const MapaAnalisis = dynamic(() => import('@/components/maps/MapaAnalisis'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Cargando mapa...</div>
    </div>
  ),
});

export default function AnalisisPage() {
  const [plazaId, setPlazaId] = useState<string>('plaza-006'); // Plaza 1500 por defecto
  const [radioKm, setRadioKm] = useState<number>(2);

  // Plaza seleccionada
  const plaza = useMemo(() => {
    return PLAZAS_MTY.find(p => p.id === plazaId) || PLAZAS_MTY[0];
  }, [plazaId]);

  // Análisis de viabilidad
  const analisis = useMemo(() => {
    return calcularViabilidad(plaza, CONFIG_DEFAULT);
  }, [plaza]);

  // Competencia cercana
  const competencia = useMemo(() => {
    return getCompetidoresEnRadio(plaza.lat, plaza.lng, radioKm);
  }, [plaza, radioKm]);

  // Estadísticas de competencia
  const statsCompetencia = useMemo(() => {
    const porMarca: Record<string, number> = {};
    competencia.forEach(c => {
      porMarca[c.marca] = (porMarca[c.marca] || 0) + 1;
    });
    return porMarca;
  }, [competencia]);

  // Flujo de la plaza
  const flujoStats = useMemo(() => {
    const promedio = calcularFlujoPromedio(plaza.flujoPeatonalEstimado);
    const mayor = getDiaMayorFlujo(plaza.flujoPeatonalEstimado);
    return { promedio, mayor };
  }, [plaza]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">📊 Análisis de Viabilidad</h1>
        <p className="text-gray-500">Evaluación detallada de ubicación</p>
      </div>

      {/* Selector de Plaza y Radio */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccionar Plaza
            </label>
            <select
              value={plazaId}
              onChange={(e) => setPlazaId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crispy-500"
            >
              <optgroup label="📍 Propuestas">
                {PLAZAS_MTY.filter(p => p.esPropuesta).map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} - {p.municipio}</option>
                ))}
              </optgroup>
              <optgroup label="🏪 Con Sucursal CT">
                {PLAZAS_MTY.filter(p => p.tieneSucursalCT).map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} - {p.municipio}</option>
                ))}
              </optgroup>
              <optgroup label="🏢 Otras Plazas">
                {PLAZAS_MTY.filter(p => !p.tieneSucursalCT && !p.esPropuesta).map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} - {p.municipio}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radio de Análisis
            </label>
            <div className="flex gap-2">
              {[1, 2, 5, 10].map(r => (
                <button
                  key={r}
                  onClick={() => setRadioKm(r)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    radioKm === r
                      ? 'bg-crispy-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-3 gap-6">
        {/* Mapa (2 columnas) */}
        <div className="col-span-2 bg-white rounded-lg shadow-sm border p-4">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            🗺️ Mapa de Zona
            <span className="text-sm font-normal text-gray-500">
              (Radio: {radioKm}km)
            </span>
          </h2>
          <div className="h-[400px]">
            <MapaAnalisis
              plaza={plaza}
              competidores={competencia}
              radioKm={radioKm}
            />
          </div>

          {/* Leyenda */}
          <div className="flex gap-4 mt-3 text-sm text-gray-600">
            <span>⭐ Plaza analizada</span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500"></span> KFC
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500"></span> Wingstop
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span> Pollo Loco
            </span>
          </div>
        </div>

        {/* Panel de Score */}
        <div className="space-y-4">
          {/* Score Principal */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold text-gray-700 mb-4">📈 Score de Viabilidad</h3>

            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                style={{ background: analisis.color }}
              >
                {analisis.scoreTotal}
              </div>
              <div>
                <div
                  className="text-xl font-bold"
                  style={{ color: analisis.color }}
                >
                  {analisis.clasificacion}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {analisis.clasificacion === 'VIABLE' && 'Excelente oportunidad'}
                  {analisis.clasificacion === 'EVALUAR' && 'Requiere evaluación'}
                  {analisis.clasificacion === 'NO_VIABLE' && 'Alto riesgo'}
                </p>
              </div>
            </div>

            {/* Recomendación */}
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              {analisis.recomendacion}
            </div>
          </div>

          {/* Factores Detallados */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold text-gray-700 mb-3">🎯 Factores</h3>
            <div className="space-y-3">
              <FactorBar label="Flujo Peatonal" score={analisis.scoreDetallado.flujoPeatonal} peso={25} />
              <FactorBar label="Tiendas Ancla" score={analisis.scoreDetallado.tiendasAncla} peso={20} />
              <FactorBar label="Competencia" score={analisis.scoreDetallado.competencia} peso={15} />
              <FactorBar label="Demografía" score={analisis.scoreDetallado.perfilDemografico} peso={15} />
              <FactorBar label="Accesibilidad" score={analisis.scoreDetallado.accesibilidad} peso={10} />
              <FactorBar label="Costo Renta" score={analisis.scoreDetallado.costoRenta} peso={10} />
              <FactorBar label="Visibilidad" score={analisis.scoreDetallado.visibilidad} peso={5} />
            </div>
          </div>

          {/* Factores Críticos */}
          {analisis.factoresCriticos.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-700 mb-2">⚠️ Factores Críticos</h3>
              <ul className="text-sm text-red-600 space-y-1">
                {analisis.factoresCriticos.map((factor, i) => (
                  <li key={i}>• {factor}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Sección de Competencia */}
      <div className="grid grid-cols-2 gap-6">
        {/* Resumen de Competencia */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="font-semibold text-gray-700 mb-4">
            🎯 Competencia en {radioKm}km ({competencia.length})
          </h3>

          {competencia.length > 0 ? (
            <>
              {/* Por marca */}
              <div className="space-y-2 mb-4">
                {Object.entries(statsCompetencia).map(([marca, count]) => (
                  <div key={marca} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ background: COLORES_MARCAS[marca as keyof typeof COLORES_MARCAS] || '#666' }}
                      ></span>
                      <span className="text-sm">{marca}</span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>

              {/* Lista detallada */}
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Más cercanos:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {competencia.slice(0, 5).map(comp => (
                    <div key={comp.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                      <span>{comp.nombre}</span>
                      <span className="text-gray-500">{comp.distanciaKm} km</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p className="text-3xl mb-2">✨</p>
              <p>Sin competencia directa en {radioKm}km</p>
              <p className="text-sm">Excelente oportunidad</p>
            </div>
          )}
        </div>

        {/* Información de la Plaza */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="font-semibold text-gray-700 mb-4">🏢 Información de Plaza</h3>

          <div className="space-y-3 text-sm">
            <InfoRow label="Nombre" value={plaza.nombre} />
            <InfoRow label="Dirección" value={plaza.direccion} />
            <InfoRow label="Municipio" value={plaza.municipio} />
            <InfoRow label="Nivel Socioeconómico" value={plaza.nivelSocioeconomico} />
            <InfoRow label="Horario" value={`${plaza.horarioApertura} - ${plaza.horarioCierre}`} />
            <InfoRow
              label="Estacionamiento"
              value={plaza.estacionamientoGratis ? '✅ Gratis' : '💰 Con costo'}
            />
            <InfoRow
              label="Cerca Metrorrey"
              value={plaza.cercaMetrorrey ? '✅ Sí' : '❌ No'}
            />

            {plaza.tiendasAncla.length > 0 && (
              <div>
                <span className="text-gray-500">Tiendas Ancla:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {plaza.tiendasAncla.map(tienda => (
                    <span key={tienda} className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {tienda}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {plaza.rentaEstimadaM2 && (
              <InfoRow label="Renta Estimada" value={`$${plaza.rentaEstimadaM2}/m² mensual`} />
            )}
          </div>
        </div>
      </div>

      {/* Flujo Peatonal */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-semibold text-gray-700 mb-4">👥 Flujo Peatonal Estimado (personas/hora)</h3>

        <div className="grid grid-cols-7 gap-2">
          {Object.entries(plaza.flujoPeatonalEstimado).map(([dia, flujo]) => {
            const maxFlujo = Math.max(...Object.values(plaza.flujoPeatonalEstimado));
            const altura = (flujo / maxFlujo) * 100;

            return (
              <div key={dia} className="text-center">
                <div className="h-32 flex items-end justify-center mb-2">
                  <div
                    className="w-12 bg-crispy-500 rounded-t transition-all"
                    style={{ height: `${altura}%` }}
                  ></div>
                </div>
                <div className="font-medium text-sm capitalize">{dia.slice(0, 3)}</div>
                <div className="text-xs text-gray-500">{flujo}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex gap-6 text-sm text-gray-600">
          <span>📊 Promedio: <strong>{flujoStats.promedio}/hora</strong></span>
          <span>🔥 Día pico: <strong>{flujoStats.mayor.dia}</strong> ({flujoStats.mayor.flujo}/hora)</span>
          <span>⏰ Horas pico: <strong>{plaza.horasPico.join(', ')}</strong></span>
        </div>
      </div>

      {/* Proyección Financiera */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-semibold text-gray-700 mb-4">💰 Proyección Financiera</h3>

        <div className="grid grid-cols-4 gap-4">
          <FinanceCard
            label="Inversión Inicial"
            value={`$${CONFIG_DEFAULT.negocio.inversionBase.toLocaleString()}`}
            sublabel="MXN"
          />
          <FinanceCard
            label="Ventas Mensuales Est."
            value={`$${analisis.proyeccionFinanciera.ventasMensualesEstimadas.toLocaleString()}`}
            sublabel="MXN"
            highlight
          />
          <FinanceCard
            label="Utilidad Mensual"
            value={`$${analisis.proyeccionFinanciera.utilidadMensualEstimada.toLocaleString()}`}
            sublabel={`${CONFIG_DEFAULT.negocio.margenOperativo * 100}% margen`}
            color="green"
          />
          <FinanceCard
            label="ROI Anual"
            value={`${analisis.proyeccionFinanciera.roiAnual}%`}
            sublabel={`Payback: ${analisis.proyeccionFinanciera.paybackMeses} meses`}
            color="blue"
          />
        </div>

        <p className="text-xs text-gray-400 mt-4">
          * Proyecciones basadas en flujo estimado, ticket promedio de ${CONFIG_DEFAULT.negocio.ticketPromedio} MXN
          y tasa de conversión del 2%. Los resultados reales pueden variar.
        </p>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-4">
        <button className="bg-crispy-500 text-white px-6 py-3 rounded-lg hover:bg-crispy-600 transition flex items-center gap-2">
          📄 Generar Reporte PDF
        </button>
        <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
          💾 Guardar Análisis
        </button>
        <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
          📊 Comparar con Otra Plaza
        </button>
      </div>
    </div>
  );
}

// ========== COMPONENTES AUXILIARES ==========

function FactorBar({ label, score, peso }: { label: string; score: number; peso: number }) {
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
      <span className="w-10 text-right text-gray-400 text-xs">({peso}%)</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function FinanceCard({
  label,
  value,
  sublabel,
  color = 'gray',
  highlight = false
}: {
  label: string;
  value: string;
  sublabel: string;
  color?: 'gray' | 'green' | 'blue';
  highlight?: boolean;
}) {
  const colorClasses = {
    gray: 'text-gray-800',
    green: 'text-green-600',
    blue: 'text-blue-600',
  };

  return (
    <div className={`p-4 rounded-lg ${highlight ? 'bg-crispy-50 border-2 border-crispy-200' : 'bg-gray-50'}`}>
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
      <div className="text-xs text-gray-400">{sublabel}</div>
    </div>
  );
}
