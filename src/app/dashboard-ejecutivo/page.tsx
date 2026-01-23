'use client';

import { useState, useEffect } from 'react';

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

interface GobiernoData {
  indicadores?: {
    poblacion?: number;
    empleados?: number;
    inflacion?: number;
  };
  municipios?: any[];
}

const CONFIDENCE_APIS = [
  { nombre: 'Google Places', status: 'activo', confianza: 15, descripcion: 'Búsqueda de plazas y competencia' },
  { nombre: 'Mapbox Isocronas', status: 'activo', confianza: 15, descripcion: 'Área de cobertura y accesibilidad' },
  { nombre: 'HERE Traffic', status: 'activo', confianza: 15, descripcion: 'Tráfico en tiempo real' },
  { nombre: 'BestTime.app', status: 'activo', confianza: 10, descripcion: 'Afluencia de personas por hora' },
  { nombre: 'Foursquare', status: 'activo', confianza: 5, descripcion: 'Reviews, categorías y densidad comercial' },
  { nombre: 'Data México', status: 'activo', confianza: 5, descripcion: 'Indicadores económicos oficiales' },
  { nombre: 'CENAPRED Riesgos', status: 'activo', confianza: 10, descripcion: 'Riesgo de inundación' },
  { nombre: 'INEGI Indicadores', status: 'activo', confianza: 10, descripcion: 'Datos económicos NL' },
  { nombre: 'Scoring Interno', status: 'activo', confianza: 10, descripcion: 'Algoritmo de viabilidad' },
];

const APIS_PENDIENTES = [
  { nombre: 'Geolytix / CARTO', confianza: 3, costo: 'Cotizar', descripcion: 'NSE por AGEB (precisión extra)' },
  { nombre: 'Satellite Imagery', confianza: 2, costo: '$500/mes', descripcion: 'Estacionamiento y densidad' },
];

export default function DashboardEjecutivo() {
  const [traficoData, setTraficoData] = useState<TraficoZona | null>(null);
  const [gobiernoData, setGobiernoData] = useState<GobiernoData | null>(null);
  const [loading, setLoading] = useState(true);

  const confianzaActual = CONFIDENCE_APIS.reduce((sum, api) => sum + api.confianza, 0);
  const confianzaPotencial = confianzaActual + APIS_PENDIENTES.reduce((sum, api) => sum + api.confianza, 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch traffic data for Monterrey center
        const traficoRes = await fetch('/api/here?tipo=analisis&lat=25.6866&lng=-100.3161&radio=5');
        const trafico = await traficoRes.json();
        if (trafico.success) {
          setTraficoData(trafico);
        }

        // Fetch gobierno data
        const gobRes = await fetch('/api/datos-gobierno?tipo=analisis&municipioId=19039');
        const gob = await gobRes.json();
        if (gob.success) {
          setGobiernoData(gob.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTraficoColor = (nivel?: string) => {
    switch (nivel) {
      case 'fluido': return 'bg-green-500';
      case 'lento': return 'bg-yellow-500';
      case 'congestionado': return 'bg-orange-500';
      case 'detenido': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 Dashboard Ejecutivo</h1>
          <p className="text-gray-500">Visión general del sistema de viabilidad</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Última actualización</div>
          <div className="font-medium">{new Date().toLocaleString('es-MX')}</div>
        </div>
      </div>

      {/* Nivel de Confianza */}
      <div className="bg-gradient-to-r from-crispy-500 to-crispy-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-1">Nivel de Confianza del Estudio</h2>
            <p className="text-crispy-100 text-sm">Basado en fuentes de datos integradas</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{confianzaActual}%</div>
            <div className="text-crispy-100 text-sm">de {confianzaPotencial}% posible</div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="w-full bg-crispy-700 rounded-full h-4">
            <div
              className="bg-white rounded-full h-4 transition-all duration-500"
              style={{ width: `${(confianzaActual / 100) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-crispy-100">
            <span>0%</span>
            <span>Objetivo: 95%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* KPIs en tiempo real */}
      <div className="grid grid-cols-4 gap-4">
        {/* Tráfico */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl ${
              getTraficoColor(traficoData?.flujoPromedio?.nivelGeneral)
            }`}>
              🚗
            </div>
            <div>
              <div className="text-sm text-gray-500">Tráfico MTY</div>
              <div className="text-xl font-bold capitalize">
                {loading ? '...' : traficoData?.flujoPromedio?.nivelGeneral || 'N/A'}
              </div>
              {traficoData && (
                <div className="text-xs text-gray-400">
                  JamFactor: {traficoData.flujoPromedio.jamFactorPromedio}/10
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Puntos Críticos */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-500 text-white text-xl">
              ⚠️
            </div>
            <div>
              <div className="text-sm text-gray-500">Puntos Críticos</div>
              <div className="text-xl font-bold">
                {loading ? '...' : traficoData?.puntosCriticos?.length || 0}
              </div>
              <div className="text-xs text-gray-400">zonas congestionadas</div>
            </div>
          </div>
        </div>

        {/* Velocidad Promedio */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-500 text-white text-xl">
              ⚡
            </div>
            <div>
              <div className="text-sm text-gray-500">Velocidad Promedio</div>
              <div className="text-xl font-bold">
                {loading ? '...' : `${traficoData?.flujoPromedio?.velocidadPromedioKmh || 0} km/h`}
              </div>
              <div className="text-xs text-gray-400">en zona analizada</div>
            </div>
          </div>
        </div>

        {/* APIs Activas */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-500 text-white text-xl">
              🔌
            </div>
            <div>
              <div className="text-sm text-gray-500">APIs Activas</div>
              <div className="text-xl font-bold">{CONFIDENCE_APIS.length}</div>
              <div className="text-xs text-gray-400">fuentes de datos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-2 gap-6">
        {/* APIs Integradas */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            ✅ APIs Integradas
            <span className="text-sm font-normal text-gray-400">({confianzaActual}% confianza)</span>
          </h3>

          <div className="space-y-3">
            {CONFIDENCE_APIS.map((api) => (
              <div key={api.nombre} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                <div>
                  <div className="font-medium text-gray-800">{api.nombre}</div>
                  <div className="text-sm text-gray-500">{api.descripcion}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">+{api.confianza}%</div>
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">Activo</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* APIs Pendientes */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            📋 APIs Recomendadas para 95%
            <span className="text-sm font-normal text-gray-400">(+{APIS_PENDIENTES.reduce((s, a) => s + a.confianza, 0)}%)</span>
          </h3>

          <div className="space-y-3">
            {APIS_PENDIENTES.map((api) => (
              <div key={api.nombre} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <div className="font-medium text-gray-800">{api.nombre}</div>
                  <div className="text-sm text-gray-500">{api.descripcion}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">+{api.confianza}%</div>
                  <span className="text-xs text-gray-500">{api.costo}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-800">
              <strong>Costo estimado mensual:</strong> ~$800 USD para alcanzar 95%
            </div>
          </div>
        </div>
      </div>

      {/* Recomendaciones de Tráfico */}
      {traficoData?.recomendaciones && traficoData.recomendaciones.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-700 mb-4">💡 Recomendaciones Basadas en Tráfico</h3>
          <div className="grid grid-cols-2 gap-3">
            {traficoData.recomendaciones.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-blue-500">→</span>
                <span className="text-sm text-gray-700">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Métricas del Sistema */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-gray-700 mb-4">📈 Capacidades del Sistema</h3>

        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-crispy-500">∞</div>
            <div className="text-sm text-gray-500">Plazas analizables</div>
            <div className="text-xs text-gray-400">vía Google Places</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-500">5</div>
            <div className="text-sm text-gray-500">Isocronas/ubicación</div>
            <div className="text-xs text-gray-400">5, 10, 15 min</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-green-500">24/7</div>
            <div className="text-sm text-gray-500">Datos de tráfico</div>
            <div className="text-xs text-gray-400">tiempo real</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-500">12</div>
            <div className="text-sm text-gray-500">Municipios AMM</div>
            <div className="text-xs text-gray-400">cobertura completa</div>
          </div>
        </div>
      </div>

      {/* Descubrir Oportunidades - Destacado */}
      <a href="/descubrir" className="block bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl mb-2">🚀</div>
            <div className="text-xl font-bold">Descubrir Oportunidades</div>
            <div className="text-purple-200">Escanea todo el AMM y encuentra las mejores plazas automáticamente</div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">22</div>
            <div className="text-purple-200">zonas a escanear</div>
          </div>
        </div>
      </a>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-4 gap-4">
        <a href="/buscar-plazas" className="bg-crispy-500 text-white p-4 rounded-lg hover:bg-crispy-600 transition text-center">
          <div className="text-2xl mb-2">🔍</div>
          <div className="font-medium">Buscar Plazas</div>
          <div className="text-sm text-crispy-100">Motor inteligente</div>
        </a>
        <a href="/analisis" className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className="font-medium">Análisis Detallado</div>
          <div className="text-sm text-blue-100">Por ubicación</div>
        </a>
        <a href="/mapa-trafico" className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition text-center">
          <div className="text-2xl mb-2">🗺️</div>
          <div className="font-medium">Mapa de Tráfico</div>
          <div className="text-sm text-green-100">Tiempo real</div>
        </a>
        <a href="/competencia" className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 transition text-center">
          <div className="text-2xl mb-2">🎯</div>
          <div className="font-medium">Competencia</div>
          <div className="text-sm text-orange-100">KFC, Wingstop...</div>
        </a>
      </div>
    </div>
  );
}
