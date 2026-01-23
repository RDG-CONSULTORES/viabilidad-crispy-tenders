'use client';

import { useState, useEffect } from 'react';

interface PlazaResult {
  placeId: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  rating?: number;
  totalReviews?: number;
  isOpen?: boolean;
  accesibilidad?: {
    poblacionCaminando10min: number;
    poblacionAuto10min: number;
    poblacionAuto15min: number;
    areaKm2Auto10min: number;
  };
  competencia?: {
    kfcCercanos: number;
    polloLocoCercanos: number;
    competidorMasCercanoKm: number;
    totalCompetidores: number;
  };
  riesgo?: {
    inundacion: number;
    nivel: string;
  };
  trafico?: {
    jamFactor: number;
    velocidadActualKmh: number;
    velocidadLibreKmh: number;
    nivel: 'fluido' | 'lento' | 'congestionado' | 'detenido';
    impactoDelivery: string;
  };
  afluencia?: {
    promedioSemanal: number;
    nivel: string;
    color: string;
    mejorDia: string;
    peorDia: string;
    horasPico: { inicio: number; fin: number; intensidad: number }[];
    score: number;
  };
  densidadComercial?: {
    nivel: string;
    color: string;
    servicios: {
      bancos: number;
      supermercados: number;
      farmacias: number;
      restaurantes: number;
      total: number;
    };
  };
  score: number;
  clasificacion: 'EXCELENTE' | 'BUENA' | 'EVALUAR' | 'RIESGOSA';
  factoresPositivos: string[];
  factoresNegativos: string[];
}

interface BusquedaResponse {
  success: boolean;
  busqueda: {
    centro: { lat: number; lng: number };
    radioMetros: number;
    filtros: { sinCompetencia: boolean };
  };
  resumen: {
    totalEncontradas: number;
    totalAnalizadas: number;
    mejorScore: number;
    promedioScore: number;
    excelentes: number;
    buenas: number;
    evaluar: number;
    riesgosas: number;
  };
  plazas: PlazaResult[];
}

const ZONAS_MONTERREY = [
  { nombre: 'Centro Monterrey', lat: 25.6866, lng: -100.3161 },
  { nombre: 'San Pedro Garza García', lat: 25.6574, lng: -100.4023 },
  { nombre: 'Santa Catarina', lat: 25.6733, lng: -100.4584 },
  { nombre: 'Guadalupe', lat: 25.6772, lng: -100.2557 },
  { nombre: 'San Nicolás', lat: 25.7441, lng: -100.2836 },
  { nombre: 'Apodaca', lat: 25.7815, lng: -100.1836 },
  { nombre: 'Escobedo', lat: 25.7981, lng: -100.3401 },
  { nombre: 'Cumbres', lat: 25.7500, lng: -100.4400 },
];

export default function BuscarPlazasPage() {
  const [zonaSeleccionada, setZonaSeleccionada] = useState(ZONAS_MONTERREY[0]);
  const [radio, setRadio] = useState(5000);
  const [limite, setLimite] = useState(10);
  const [sinCompetencia, setSinCompetencia] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<BusquedaResponse | null>(null);
  const [plazaSeleccionada, setPlazaSeleccionada] = useState<PlazaResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buscarPlazas = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        lat: zonaSeleccionada.lat.toString(),
        lng: zonaSeleccionada.lng.toString(),
        radio: radio.toString(),
        limite: limite.toString(),
        sinCompetencia: sinCompetencia.toString(),
      });

      const response = await fetch(`/api/buscar-plazas?${params}`);
      const data = await response.json();

      if (data.success) {
        setResultados(data);
        if (data.plazas.length > 0) {
          setPlazaSeleccionada(data.plazas[0]);
        }
      } else {
        setError(data.error || 'Error en la búsqueda');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const getClasificacionColor = (clasificacion: string) => {
    switch (clasificacion) {
      case 'EXCELENTE': return 'bg-green-500';
      case 'BUENA': return 'bg-blue-500';
      case 'EVALUAR': return 'bg-yellow-500';
      case 'RIESGOSA': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getClasificacionBadge = (clasificacion: string) => {
    switch (clasificacion) {
      case 'EXCELENTE': return 'bg-green-100 text-green-800 border-green-300';
      case 'BUENA': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'EVALUAR': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'RIESGOSA': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTraficoColor = (nivel?: string) => {
    switch (nivel) {
      case 'fluido': return 'text-green-600';
      case 'lento': return 'text-yellow-600';
      case 'congestionado': return 'text-orange-600';
      case 'detenido': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">🔍 Búsqueda de Plazas</h1>
        <p className="text-gray-500">Motor de búsqueda inteligente con scoring de viabilidad</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Parámetros de Búsqueda</h2>

        <div className="grid grid-cols-4 gap-4">
          {/* Zona */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zona de Búsqueda
            </label>
            <select
              value={zonaSeleccionada.nombre}
              onChange={(e) => {
                const zona = ZONAS_MONTERREY.find(z => z.nombre === e.target.value);
                if (zona) setZonaSeleccionada(zona);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crispy-500"
            >
              {ZONAS_MONTERREY.map(zona => (
                <option key={zona.nombre} value={zona.nombre}>{zona.nombre}</option>
              ))}
            </select>
          </div>

          {/* Radio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radio (metros)
            </label>
            <select
              value={radio}
              onChange={(e) => setRadio(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crispy-500"
            >
              <option value={2000}>2 km</option>
              <option value={5000}>5 km</option>
              <option value={8000}>8 km</option>
              <option value={10000}>10 km</option>
              <option value={15000}>15 km</option>
            </select>
          </div>

          {/* Límite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Máximo Resultados
            </label>
            <select
              value={limite}
              onChange={(e) => setLimite(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crispy-500"
            >
              <option value={5}>5 plazas</option>
              <option value={10}>10 plazas</option>
              <option value={15}>15 plazas</option>
              <option value={20}>20 plazas</option>
            </select>
          </div>

          {/* Sin Competencia */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sinCompetencia}
                onChange={(e) => setSinCompetencia(e.target.checked)}
                className="w-5 h-5 text-crispy-500 rounded focus:ring-crispy-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Solo sin KFC cercano
              </span>
            </label>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={buscarPlazas}
            disabled={loading}
            className="bg-crispy-500 text-white px-6 py-2 rounded-lg hover:bg-crispy-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Buscando...
              </>
            ) : (
              <>🔍 Buscar Plazas</>
            )}
          </button>

          {resultados && (
            <span className="flex items-center text-sm text-gray-500">
              {resultados.resumen.totalAnalizadas} plazas analizadas de {resultados.resumen.totalEncontradas} encontradas
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Resumen */}
      {resultados && (
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-3xl font-bold text-gray-800">{resultados.resumen.mejorScore}</div>
            <div className="text-sm text-gray-500">Mejor Score</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4 text-center border-2 border-green-200">
            <div className="text-3xl font-bold text-green-600">{resultados.resumen.excelentes}</div>
            <div className="text-sm text-green-700">Excelentes</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-4 text-center border-2 border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{resultados.resumen.buenas}</div>
            <div className="text-sm text-blue-700">Buenas</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-4 text-center border-2 border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600">{resultados.resumen.evaluar}</div>
            <div className="text-sm text-yellow-700">A Evaluar</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow-md p-4 text-center border-2 border-red-200">
            <div className="text-3xl font-bold text-red-600">{resultados.resumen.riesgosas}</div>
            <div className="text-sm text-red-700">Riesgosas</div>
          </div>
        </div>
      )}

      {/* Resultados */}
      {resultados && resultados.plazas.length > 0 && (
        <div className="grid grid-cols-3 gap-6">
          {/* Lista de Plazas */}
          <div className="col-span-2 space-y-3">
            <h2 className="font-semibold text-gray-700">Plazas Encontradas</h2>

            {resultados.plazas.map((plaza, index) => (
              <div
                key={plaza.placeId}
                onClick={() => setPlazaSeleccionada(plaza)}
                className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition hover:shadow-lg ${
                  plazaSeleccionada?.placeId === plaza.placeId ? 'ring-2 ring-crispy-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getClasificacionColor(plaza.clasificacion)}`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{plaza.nombre}</h3>
                      <p className="text-sm text-gray-500">{plaza.direccion}</p>

                      <div className="flex items-center gap-3 mt-2 text-sm">
                        {plaza.rating && (
                          <span className="flex items-center gap-1">
                            ⭐ {plaza.rating} ({plaza.totalReviews} reviews)
                          </span>
                        )}
                        {plaza.trafico && (
                          <span className={`flex items-center gap-1 ${getTraficoColor(plaza.trafico.nivel)}`}>
                            🚗 {plaza.trafico.nivel}
                          </span>
                        )}
                        {plaza.afluencia && (
                          <span className="flex items-center gap-1" style={{ color: plaza.afluencia.color }}>
                            👥 {plaza.afluencia.promedioSemanal}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">{plaza.score}</div>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getClasificacionBadge(plaza.clasificacion)}`}>
                      {plaza.clasificacion}
                    </span>
                  </div>
                </div>

                {/* Mini factores */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {plaza.factoresPositivos.slice(0, 2).map((factor, i) => (
                    <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                      ✓ {factor}
                    </span>
                  ))}
                  {plaza.factoresNegativos.slice(0, 2).map((factor, i) => (
                    <span key={i} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                      ✗ {factor}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Panel de Detalle */}
          <div className="space-y-4">
            {plazaSeleccionada ? (
              <>
                {/* Score */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="font-semibold text-gray-700 mb-3">📊 Score de Viabilidad</h3>
                  <div className="flex items-center gap-4">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${getClasificacionColor(plazaSeleccionada.clasificacion)}`}>
                      {plazaSeleccionada.score}
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${
                        plazaSeleccionada.clasificacion === 'EXCELENTE' ? 'text-green-600' :
                        plazaSeleccionada.clasificacion === 'BUENA' ? 'text-blue-600' :
                        plazaSeleccionada.clasificacion === 'EVALUAR' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {plazaSeleccionada.clasificacion}
                      </div>
                      <p className="text-sm text-gray-500">
                        {plazaSeleccionada.clasificacion === 'EXCELENTE' && 'Oportunidad destacada'}
                        {plazaSeleccionada.clasificacion === 'BUENA' && 'Buena oportunidad'}
                        {plazaSeleccionada.clasificacion === 'EVALUAR' && 'Requiere análisis'}
                        {plazaSeleccionada.clasificacion === 'RIESGOSA' && 'Alto riesgo'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Accesibilidad */}
                {plazaSeleccionada.accesibilidad && (
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">🚶 Accesibilidad</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Caminando 10min:</span>
                        <span className="font-medium">{(plazaSeleccionada.accesibilidad.poblacionCaminando10min / 1000).toFixed(1)}K personas</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Auto 10min:</span>
                        <span className="font-medium">{(plazaSeleccionada.accesibilidad.poblacionAuto10min / 1000).toFixed(1)}K personas</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Auto 15min:</span>
                        <span className="font-medium">{(plazaSeleccionada.accesibilidad.poblacionAuto15min / 1000).toFixed(1)}K personas</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Área alcanzable:</span>
                        <span className="font-medium">{plazaSeleccionada.accesibilidad.areaKm2Auto10min.toFixed(1)} km²</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tráfico */}
                {plazaSeleccionada.trafico && (
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">🚗 Tráfico en Tiempo Real</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Nivel:</span>
                        <span className={`font-medium capitalize ${getTraficoColor(plazaSeleccionada.trafico.nivel)}`}>
                          {plazaSeleccionada.trafico.nivel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">JamFactor:</span>
                        <span className="font-medium">{plazaSeleccionada.trafico.jamFactor}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Velocidad actual:</span>
                        <span className="font-medium">{plazaSeleccionada.trafico.velocidadActualKmh} km/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Velocidad libre:</span>
                        <span className="font-medium">{plazaSeleccionada.trafico.velocidadLibreKmh} km/h</span>
                      </div>
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        {plazaSeleccionada.trafico.impactoDelivery}
                      </div>
                    </div>
                  </div>
                )}

                {/* Afluencia */}
                {plazaSeleccionada.afluencia && (
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">👥 Afluencia de Personas</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Nivel:</span>
                        <span className="font-medium px-2 py-1 rounded" style={{ backgroundColor: `${plazaSeleccionada.afluencia.color}20`, color: plazaSeleccionada.afluencia.color }}>
                          {plazaSeleccionada.afluencia.nivel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Promedio semanal:</span>
                        <span className="font-medium">{plazaSeleccionada.afluencia.promedioSemanal}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Mejor día:</span>
                        <span className="font-medium text-green-600">{plazaSeleccionada.afluencia.mejorDia}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Peor día:</span>
                        <span className="font-medium text-red-600">{plazaSeleccionada.afluencia.peorDia}</span>
                      </div>
                      {plazaSeleccionada.afluencia.horasPico.length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-500 mb-1">Horas pico:</div>
                          <div className="flex flex-wrap gap-1">
                            {plazaSeleccionada.afluencia.horasPico.map((hp, i) => (
                              <span key={i} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                {hp.inicio}:00 - {hp.fin}:00
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Competencia */}
                {plazaSeleccionada.competencia && (
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">🎯 Competencia (2km)</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">KFC cercanos:</span>
                        <span className={`font-medium ${plazaSeleccionada.competencia.kfcCercanos > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {plazaSeleccionada.competencia.kfcCercanos}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Pollo Loco:</span>
                        <span className="font-medium">{plazaSeleccionada.competencia.polloLocoCercanos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total competidores:</span>
                        <span className="font-medium">{plazaSeleccionada.competencia.totalCompetidores}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Más cercano a:</span>
                        <span className="font-medium">{plazaSeleccionada.competencia.competidorMasCercanoKm} km</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Densidad Comercial */}
                {plazaSeleccionada.densidadComercial && (
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">🏪 Densidad Comercial</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Nivel:</span>
                        <span className="font-medium px-2 py-1 rounded" style={{ backgroundColor: `${plazaSeleccionada.densidadComercial.color}20`, color: plazaSeleccionada.densidadComercial.color }}>
                          {plazaSeleccionada.densidadComercial.nivel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total servicios:</span>
                        <span className="font-medium">{plazaSeleccionada.densidadComercial.servicios.total}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 p-2 bg-gray-50 rounded">
                        <div className="text-xs">
                          <span className="text-gray-500">Bancos:</span> {plazaSeleccionada.densidadComercial.servicios.bancos}
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Supermercados:</span> {plazaSeleccionada.densidadComercial.servicios.supermercados}
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Farmacias:</span> {plazaSeleccionada.densidadComercial.servicios.farmacias}
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Restaurantes:</span> {plazaSeleccionada.densidadComercial.servicios.restaurantes}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Riesgo */}
                {plazaSeleccionada.riesgo && (
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">⚠️ Riesgo Natural</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Inundación:</span>
                        <span className={`font-medium ${
                          plazaSeleccionada.riesgo.nivel === 'bajo' ? 'text-green-600' :
                          plazaSeleccionada.riesgo.nivel === 'medio' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {plazaSeleccionada.riesgo.nivel} ({plazaSeleccionada.riesgo.inundacion}%)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Factores */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="font-semibold text-gray-700 mb-3">📋 Factores</h3>

                  {plazaSeleccionada.factoresPositivos.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-green-700 mb-2">Positivos:</h4>
                      <ul className="space-y-1">
                        {plazaSeleccionada.factoresPositivos.map((factor, i) => (
                          <li key={i} className="text-sm text-green-600 flex items-start gap-1">
                            <span>✓</span> {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {plazaSeleccionada.factoresNegativos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-700 mb-2">Negativos:</h4>
                      <ul className="space-y-1">
                        {plazaSeleccionada.factoresNegativos.map((factor, i) => (
                          <li key={i} className="text-sm text-red-600 flex items-start gap-1">
                            <span>✗</span> {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${plazaSeleccionada.lat},${plazaSeleccionada.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-center text-sm"
                  >
                    📍 Ver en Maps
                  </a>
                  <button className="flex-1 bg-crispy-500 text-white px-4 py-2 rounded-lg hover:bg-crispy-600 transition text-sm">
                    💾 Guardar
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                <p>Selecciona una plaza para ver el detalle</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {resultados && resultados.plazas.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-3xl mb-3">🔍</p>
          <p className="text-gray-600">No se encontraron plazas con los filtros seleccionados</p>
          <p className="text-sm text-gray-400 mt-2">Intenta ampliar el radio o cambiar la zona</p>
        </div>
      )}
    </div>
  );
}
