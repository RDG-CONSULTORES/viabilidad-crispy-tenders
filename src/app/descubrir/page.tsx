'use client';

import { useState } from 'react';
import Link from 'next/link';

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

  // Filtros
  const [limite, setLimite] = useState(20);
  const [nseMinimo, setNseMinimo] = useState('C');
  const [distanciaMinCT, setDistanciaMinCT] = useState(2);

  const [oportunidadSeleccionada, setOportunidadSeleccionada] = useState<Oportunidad | null>(null);

  const iniciarEscaneo = async () => {
    setLoading(true);
    setError(null);
    setResultado(null);

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
          setOportunidadSeleccionada(data.oportunidades[0]);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">🔍 Descubrir Oportunidades</h1>
        <p className="text-gray-500">Escáner automático del Área Metropolitana de Monterrey</p>
      </div>

      {/* Configuración de Escaneo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Configuración del Escaneo</h2>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Máximo Resultados
            </label>
            <select
              value={limite}
              onChange={(e) => setLimite(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crispy-500"
            >
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={30}>Top 30</option>
              <option value={50}>Top 50</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NSE Mínimo
            </label>
            <select
              value={nseMinimo}
              onChange={(e) => setNseMinimo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crispy-500"
            >
              <option value="A">Solo A (Premium)</option>
              <option value="B">B o superior</option>
              <option value="C+">C+ o superior</option>
              <option value="C">C o superior</option>
              <option value="D">Todas las zonas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distancia mín. a CT existente
            </label>
            <select
              value={distanciaMinCT}
              onChange={(e) => setDistanciaMinCT(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crispy-500"
            >
              <option value={1}>1 km</option>
              <option value={2}>2 km</option>
              <option value={3}>3 km</option>
              <option value={5}>5 km</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={iniciarEscaneo}
              disabled={loading}
              className="w-full bg-crispy-500 text-white px-6 py-2 rounded-lg hover:bg-crispy-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Escaneando AMM...
                </>
              ) : (
                <>🚀 Iniciar Escaneo</>
              )}
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          El escáner buscará plazas comerciales en 22 zonas estratégicas del AMM,
          filtrando por distancia a sucursales existentes y nivel socioeconómico.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Resultados */}
      {resultado && (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-6 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-3xl font-bold text-gray-800">{resultado.resumen.totalEscaneadas}</div>
              <div className="text-sm text-gray-500">Plazas escaneadas</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-3xl font-bold text-gray-800">{resultado.resumen.mejorScore}</div>
              <div className="text-sm text-gray-500">Mejor score</div>
            </div>
            <div className="bg-green-50 rounded-lg shadow-md p-4 text-center border-2 border-green-200">
              <div className="text-3xl font-bold text-green-600">{resultado.resumen.distribucionClasificacion.excelentes}</div>
              <div className="text-sm text-green-700">Excelentes</div>
            </div>
            <div className="bg-blue-50 rounded-lg shadow-md p-4 text-center border-2 border-blue-200">
              <div className="text-3xl font-bold text-blue-600">{resultado.resumen.distribucionClasificacion.buenas}</div>
              <div className="text-sm text-blue-700">Buenas</div>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow-md p-4 text-center border-2 border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600">{resultado.resumen.distribucionClasificacion.evaluar}</div>
              <div className="text-sm text-yellow-700">A evaluar</div>
            </div>
            <div className="bg-red-50 rounded-lg shadow-md p-4 text-center border-2 border-red-200">
              <div className="text-3xl font-bold text-red-600">{resultado.resumen.distribucionClasificacion.riesgosas}</div>
              <div className="text-sm text-red-700">Riesgosas</div>
            </div>
          </div>

          {/* Lista y Detalle */}
          <div className="grid grid-cols-3 gap-6">
            {/* Lista de Oportunidades */}
            <div className="col-span-2 space-y-3">
              <h2 className="font-semibold text-gray-700">
                Mejores Oportunidades ({resultado.oportunidades.length})
              </h2>

              {resultado.oportunidades.map((oportunidad, index) => (
                <div
                  key={oportunidad.placeId}
                  onClick={() => setOportunidadSeleccionada(oportunidad)}
                  className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition hover:shadow-lg ${
                    oportunidadSeleccionada?.placeId === oportunidad.placeId ? 'ring-2 ring-crispy-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getClasificacionColor(oportunidad.clasificacion)}`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{oportunidad.nombre}</h3>
                        <p className="text-sm text-gray-500">{oportunidad.direccion}</p>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <span className="px-2 py-0.5 rounded text-xs text-white" style={{ background: oportunidad.nseColor }}>
                            NSE {oportunidad.nseEstimado}
                          </span>
                          <span className="text-gray-500">{oportunidad.municipio}</span>
                          {oportunidad.rating && (
                            <span className="flex items-center gap-1">
                              ⭐ {oportunidad.rating}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">{oportunidad.scoreViabilidad}</div>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getClasificacionBadge(oportunidad.clasificacion)}`}>
                        {oportunidad.clasificacion}
                      </span>
                    </div>
                  </div>

                  {/* Mini factores */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {oportunidad.factoresPositivos.slice(0, 2).map((factor, i) => (
                      <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                        ✓ {factor}
                      </span>
                    ))}
                    {oportunidad.factoresNegativos.slice(0, 1).map((factor, i) => (
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
              {oportunidadSeleccionada ? (
                <>
                  {/* Score */}
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">📊 Score de Viabilidad</h3>
                    <div className="flex items-center gap-4">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${getClasificacionColor(oportunidadSeleccionada.clasificacion)}`}>
                        {oportunidadSeleccionada.scoreViabilidad}
                      </div>
                      <div>
                        <div className={`text-xl font-bold ${
                          oportunidadSeleccionada.clasificacion === 'EXCELENTE' ? 'text-green-600' :
                          oportunidadSeleccionada.clasificacion === 'BUENA' ? 'text-blue-600' :
                          oportunidadSeleccionada.clasificacion === 'EVALUAR' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {oportunidadSeleccionada.clasificacion}
                        </div>
                        <p className="text-sm text-gray-500">
                          {oportunidadSeleccionada.clasificacion === 'EXCELENTE' && 'Oportunidad destacada'}
                          {oportunidadSeleccionada.clasificacion === 'BUENA' && 'Buena oportunidad'}
                          {oportunidadSeleccionada.clasificacion === 'EVALUAR' && 'Requiere análisis'}
                          {oportunidadSeleccionada.clasificacion === 'RIESGOSA' && 'Alto riesgo'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Información */}
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">📍 Información</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Zona:</span>
                        <span className="font-medium">{oportunidadSeleccionada.zonaOrigen}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Municipio:</span>
                        <span className="font-medium">{oportunidadSeleccionada.municipio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">NSE:</span>
                        <span className="font-medium px-2 py-0.5 rounded text-white text-xs" style={{ background: oportunidadSeleccionada.nseColor }}>
                          {oportunidadSeleccionada.nseEstimado}
                        </span>
                      </div>
                      {oportunidadSeleccionada.rating && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Rating:</span>
                          <span className="font-medium">⭐ {oportunidadSeleccionada.rating} ({oportunidadSeleccionada.totalReviews} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Distancias */}
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">📏 Distancias</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">CT más cercano:</span>
                        <span className="font-medium">{oportunidadSeleccionada.distanciaCTMasCercano} km</span>
                      </div>
                      <div className="text-xs text-gray-400 -mt-1">
                        {oportunidadSeleccionada.sucursalCTMasCercana}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">KFC más cercano:</span>
                        <span className={`font-medium ${oportunidadSeleccionada.distanciaKFCMasCercano > 2 ? 'text-green-600' : 'text-red-600'}`}>
                          {oportunidadSeleccionada.distanciaKFCMasCercano} km
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Competidores en 2km:</span>
                        <span className={`font-medium ${oportunidadSeleccionada.competidoresEn2km <= 2 ? 'text-green-600' : 'text-orange-600'}`}>
                          {oportunidadSeleccionada.competidoresEn2km}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Factores */}
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">📋 Factores</h3>

                    {oportunidadSeleccionada.factoresPositivos.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-green-700 mb-2">Positivos:</h4>
                        <ul className="space-y-1">
                          {oportunidadSeleccionada.factoresPositivos.map((factor, i) => (
                            <li key={i} className="text-sm text-green-600 flex items-start gap-1">
                              <span>✓</span> {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {oportunidadSeleccionada.factoresNegativos.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-red-700 mb-2">Negativos:</h4>
                        <ul className="space-y-1">
                          {oportunidadSeleccionada.factoresNegativos.map((factor, i) => (
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
                      href={`https://www.google.com/maps/search/?api=1&query=${oportunidadSeleccionada.lat},${oportunidadSeleccionada.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-center text-sm"
                    >
                      📍 Ver en Maps
                    </a>
                    <Link
                      href={`/buscar-plazas`}
                      className="flex-1 bg-crispy-500 text-white px-4 py-2 rounded-lg hover:bg-crispy-600 transition text-center text-sm"
                    >
                      🔍 Análisis Detallado
                    </Link>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                  <p>Selecciona una oportunidad para ver el detalle</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Estado inicial */}
      {!loading && !resultado && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-6xl mb-4">🗺️</p>
          <p className="text-xl text-gray-600 mb-2">Escáner de Oportunidades del AMM</p>
          <p className="text-gray-500">
            Configura los filtros y presiona "Iniciar Escaneo" para encontrar
            las mejores plazas para Crispy Tenders en toda el área metropolitana.
          </p>
        </div>
      )}
    </div>
  );
}
