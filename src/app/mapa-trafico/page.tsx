'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Mapa dinámico para evitar SSR
const MapaTrafico = dynamic(() => import('@/components/maps/MapaTrafico'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Cargando mapa de tráfico...</div>
    </div>
  ),
});

interface TrafficFlow {
  ubicacion: { lat: number; lng: number };
  velocidadActualKmh: number;
  velocidadLibreKmh: number;
  jamFactor: number;
  nivel: 'fluido' | 'lento' | 'congestionado' | 'detenido';
  descripcion: string;
}

interface TraficoAnalisis {
  centro: { lat: number; lng: number };
  radioKm: number;
  timestamp: string;
  flujoPromedio: {
    jamFactorPromedio: number;
    velocidadPromedioKmh: number;
    nivelGeneral: string;
  };
  puntosCriticos: TrafficFlow[];
  impactoTrafico: {
    reduccionAreaPct: number;
    tiempoAdicionalMin: number;
  };
  recomendaciones?: string[];
}

interface RutaResult {
  origen: { lat: number; lng: number };
  destino: { lat: number; lng: number };
  distanciaKm: number;
  duracionBaseMin: number;
  duracionTraficoMin: number;
  factorTrafico: number;
}

const ZONAS = [
  { nombre: 'Centro Monterrey', lat: 25.6866, lng: -100.3161 },
  { nombre: 'San Pedro', lat: 25.6574, lng: -100.4023 },
  { nombre: 'Santa Catarina', lat: 25.6733, lng: -100.4584 },
  { nombre: 'Guadalupe', lat: 25.6772, lng: -100.2557 },
  { nombre: 'San Nicolás', lat: 25.7441, lng: -100.2836 },
  { nombre: 'Apodaca', lat: 25.7815, lng: -100.1836 },
];

export default function MapaTraficoPage() {
  const [zonaSeleccionada, setZonaSeleccionada] = useState(ZONAS[0]);
  const [radio, setRadio] = useState(3);
  const [loading, setLoading] = useState(false);
  const [traficoData, setTraficoData] = useState<TraficoAnalisis | null>(null);
  const [rutaData, setRutaData] = useState<RutaResult | null>(null);
  const [destinoSeleccionado, setDestinoSeleccionado] = useState<typeof ZONAS[0] | null>(null);

  const cargarTrafico = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/here?tipo=analisis&lat=${zonaSeleccionada.lat}&lng=${zonaSeleccionada.lng}&radio=${radio}`
      );
      const data = await response.json();
      if (data.success) {
        setTraficoData(data);
      }
    } catch (error) {
      console.error('Error cargando tráfico:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularRuta = async () => {
    if (!destinoSeleccionado) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/here?tipo=ruta&lat=${zonaSeleccionada.lat}&lng=${zonaSeleccionada.lng}&destinoLat=${destinoSeleccionado.lat}&destinoLng=${destinoSeleccionado.lng}`
      );
      const data = await response.json();
      if (data.success) {
        setRutaData(data);
      }
    } catch (error) {
      console.error('Error calculando ruta:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTrafico();
  }, [zonaSeleccionada, radio]);

  useEffect(() => {
    if (destinoSeleccionado) {
      calcularRuta();
    }
  }, [destinoSeleccionado]);

  const getNivelColor = (nivel?: string) => {
    switch (nivel) {
      case 'fluido': return 'text-green-600 bg-green-100';
      case 'lento': return 'text-yellow-600 bg-yellow-100';
      case 'congestionado': return 'text-orange-600 bg-orange-100';
      case 'detenido': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getJamFactorColor = (jf: number) => {
    if (jf <= 2) return 'bg-green-500';
    if (jf <= 5) return 'bg-yellow-500';
    if (jf <= 8) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🗺️ Mapa de Tráfico en Tiempo Real</h1>
          <p className="text-gray-500">Datos de HERE Traffic API</p>
        </div>
        <button
          onClick={cargarTrafico}
          disabled={loading}
          className="bg-crispy-500 text-white px-4 py-2 rounded-lg hover:bg-crispy-600 transition disabled:opacity-50"
        >
          {loading ? 'Actualizando...' : '🔄 Actualizar'}
        </button>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-4 gap-4">
          {/* Zona */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Centro de Análisis
            </label>
            <select
              value={zonaSeleccionada.nombre}
              onChange={(e) => {
                const zona = ZONAS.find(z => z.nombre === e.target.value);
                if (zona) setZonaSeleccionada(zona);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crispy-500"
            >
              {ZONAS.map(zona => (
                <option key={zona.nombre} value={zona.nombre}>{zona.nombre}</option>
              ))}
            </select>
          </div>

          {/* Radio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radio (km)
            </label>
            <select
              value={radio}
              onChange={(e) => setRadio(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crispy-500"
            >
              <option value={1}>1 km</option>
              <option value={2}>2 km</option>
              <option value={3}>3 km</option>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
            </select>
          </div>

          {/* Destino para ruta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calcular Ruta a:
            </label>
            <select
              value={destinoSeleccionado?.nombre || ''}
              onChange={(e) => {
                const zona = ZONAS.find(z => z.nombre === e.target.value);
                setDestinoSeleccionado(zona || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crispy-500"
            >
              <option value="">-- Seleccionar destino --</option>
              {ZONAS.filter(z => z.nombre !== zonaSeleccionada.nombre).map(zona => (
                <option key={zona.nombre} value={zona.nombre}>{zona.nombre}</option>
              ))}
            </select>
          </div>

          {/* Timestamp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Última Actualización
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              {traficoData?.timestamp
                ? new Date(traficoData.timestamp).toLocaleTimeString('es-MX')
                : '--:--:--'}
            </div>
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-3 gap-6">
        {/* Mapa */}
        <div className="col-span-2 bg-white rounded-lg shadow-md p-4">
          <h2 className="font-semibold text-gray-700 mb-3">Mapa de Flujo de Tráfico</h2>
          <MapaTrafico
            centro={zonaSeleccionada}
            puntosCriticos={traficoData?.puntosCriticos || []}
            radioKm={radio}
          />
        </div>

        {/* Panel derecho */}
        <div className="space-y-4">
          {/* Resumen de tráfico */}
          {traficoData && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-700 mb-3">📊 Resumen de Zona</h3>

              <div className="space-y-4">
                {/* Nivel general */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Nivel General:</span>
                  <span className={`px-3 py-1 rounded-full font-medium capitalize ${getNivelColor(traficoData.flujoPromedio.nivelGeneral)}`}>
                    {traficoData.flujoPromedio.nivelGeneral}
                  </span>
                </div>

                {/* JamFactor */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">JamFactor Promedio</span>
                    <span className="font-medium">{traficoData.flujoPromedio.jamFactorPromedio}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${getJamFactorColor(traficoData.flujoPromedio.jamFactorPromedio)}`}
                      style={{ width: `${(traficoData.flujoPromedio.jamFactorPromedio / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Velocidad */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Velocidad Promedio:</span>
                  <span className="font-medium">{traficoData.flujoPromedio.velocidadPromedioKmh} km/h</span>
                </div>

                {/* Puntos críticos */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Puntos Críticos:</span>
                  <span className="font-medium text-red-600">{traficoData.puntosCriticos.length}</span>
                </div>

                {/* Impacto */}
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Reducción de área:</span>
                    <span className="font-medium">-{traficoData.impactoTrafico.reduccionAreaPct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiempo adicional:</span>
                    <span className="font-medium">+{traficoData.impactoTrafico.tiempoAdicionalMin} min</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ruta calculada */}
          {rutaData && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-700 mb-3">🚗 Ruta Calculada</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Distancia:</span>
                  <span className="font-medium">{rutaData.distanciaKm} km</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tiempo sin tráfico:</span>
                  <span className="font-medium">{rutaData.duracionBaseMin} min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tiempo con tráfico:</span>
                  <span className="font-bold text-orange-600">{rutaData.duracionTraficoMin} min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Factor de tráfico:</span>
                  <span className={`font-medium ${rutaData.factorTrafico > 1.3 ? 'text-red-600' : 'text-green-600'}`}>
                    {rutaData.factorTrafico}x
                  </span>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg text-sm text-orange-800">
                  +{rutaData.duracionTraficoMin - rutaData.duracionBaseMin} minutos por tráfico actual
                </div>
              </div>
            </div>
          )}

          {/* Puntos críticos */}
          {traficoData && traficoData.puntosCriticos.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-700 mb-3">⚠️ Puntos Críticos</h3>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {traficoData.puntosCriticos.slice(0, 10).map((punto, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-red-50 rounded text-sm">
                    <div>
                      <span className={`capitalize font-medium ${
                        punto.nivel === 'detenido' ? 'text-red-700' : 'text-orange-700'
                      }`}>
                        {punto.nivel}
                      </span>
                      <div className="text-xs text-gray-500">
                        {punto.velocidadActualKmh} km/h
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">JF: {punto.jamFactor}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recomendaciones */}
          {traficoData?.recomendaciones && traficoData.recomendaciones.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-700 mb-3">💡 Recomendaciones</h3>

              <ul className="space-y-2 text-sm">
                {traficoData.recomendaciones.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-500">→</span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Leyenda */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-gray-700 mb-3">📋 Leyenda de JamFactor</h3>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-sm">0-2: Fluido</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-sm">2-5: Lento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500"></div>
            <span className="text-sm">5-8: Congestionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm">8-10: Detenido</span>
          </div>
        </div>
      </div>
    </div>
  );
}
