'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  COMPETIDORES_MTY,
  Competidor,
  MarcaCompetencia,
  COLORES_MARCAS,
  getCompetidoresPorMarca,
  getCompetidoresPorMunicipio
} from '@/data/competencia';

// Mapa dinámico
const MapaCompetencia = dynamic(() => import('@/components/maps/MapaCompetencia'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Cargando mapa...</div>
    </div>
  ),
});

const MARCAS: MarcaCompetencia[] = ['KFC', 'Wingstop', 'El Pollo Loco'];
const MUNICIPIOS = ['Guadalupe', 'Monterrey', 'San Pedro Garza García', 'San Nicolás de los Garza'];

// Tipo para competidores de INEGI
interface CompetidorINEGI extends Competidor {
  fuenteINEGI?: boolean;
  distanciaKm?: number;
}

export default function CompetenciaPage() {
  const [filtroMarcas, setFiltroMarcas] = useState<Set<MarcaCompetencia>>(new Set(MARCAS));
  const [filtroMunicipio, setFiltroMunicipio] = useState<string>('Todos');
  const [cargandoINEGI, setCargandoINEGI] = useState(false);
  const [competidoresINEGI, setCompetidoresINEGI] = useState<CompetidorINEGI[]>([]);
  const [errorINEGI, setErrorINEGI] = useState<string | null>(null);
  const [mostrarINEGI, setMostrarINEGI] = useState(false);

  // Función para obtener datos de INEGI
  const actualizarDesdeINEGI = useCallback(async () => {
    setCargandoINEGI(true);
    setErrorINEGI(null);

    try {
      // Centro de Monterrey
      const lat = 25.6866;
      const lng = -100.3161;
      const radio = 10000; // 10km

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

  // Competidores filtrados (combina datos locales e INEGI)
  const competidoresFiltrados = useMemo(() => {
    // Usar datos INEGI si están disponibles, sino usar locales
    let resultado: CompetidorINEGI[] = mostrarINEGI && competidoresINEGI.length > 0
      ? competidoresINEGI
      : COMPETIDORES_MTY;

    // Filtrar por marcas
    resultado = resultado.filter(c => filtroMarcas.has(c.marca));

    // Filtrar por municipio
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

    competidoresFiltrados.forEach(c => {
      porMarca[c.marca] = (porMarca[c.marca] || 0) + 1;
      porMunicipio[c.municipio] = (porMunicipio[c.municipio] || 0) + 1;
      porTipo[c.tipoCompetencia]++;
    });

    return { porMarca, porMunicipio, porTipo };
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🎯 Mapa de Competencia</h1>
          <p className="text-gray-500">Fast food de pollo en el Área Metropolitana de Monterrey</p>
        </div>
        <div className="flex items-center gap-3">
          {mostrarINEGI && (
            <button
              onClick={() => setMostrarINEGI(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Volver a datos locales
            </button>
          )}
          <button
            onClick={actualizarDesdeINEGI}
            disabled={cargandoINEGI}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2 disabled:opacity-50"
          >
            {cargandoINEGI ? (
              <>
                <span className="animate-spin">⏳</span>
                Consultando...
              </>
            ) : (
              <>
                🔄 Actualizar desde INEGI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Indicador de fuente de datos */}
      {mostrarINEGI && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
          <span>🏛️</span>
          <span className="text-sm">
            Mostrando {competidoresINEGI.length} establecimientos de <strong>INEGI DENUE</strong>
          </span>
        </div>
      )}

      {/* Error INEGI */}
      {errorINEGI && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-lg flex items-center gap-2">
          <span>⚠️</span>
          <span className="text-sm">{errorINEGI}</span>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap gap-6">
          {/* Filtro por Marca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por marca:
            </label>
            <div className="flex gap-2">
              {MARCAS.map(marca => (
                <button
                  key={marca}
                  onClick={() => toggleMarca(marca)}
                  className={`px-3 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                    filtroMarcas.has(marca)
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  style={{
                    backgroundColor: filtroMarcas.has(marca) ? COLORES_MARCAS[marca] : undefined
                  }}
                >
                  <span className="w-3 h-3 rounded-full bg-white/30"></span>
                  {marca}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por Municipio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por municipio:
            </label>
            <select
              value={filtroMunicipio}
              onChange={(e) => setFiltroMunicipio(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crispy-500"
            >
              <option value="Todos">Todos los municipios</option>
              {MUNICIPIOS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon="🎯"
          label="Total Competidores"
          value={competidoresFiltrados.length}
          sublabel={`de ${COMPETIDORES_MTY.length} mapeados`}
        />
        <StatCard
          icon="⚠️"
          label="Competencia Directa"
          value={stats.porTipo.directa}
          sublabel="KFC, Wingstop"
          color="red"
        />
        <StatCard
          icon="📊"
          label="Competencia Indirecta"
          value={stats.porTipo.indirecta}
          sublabel="El Pollo Loco"
          color="yellow"
        />
        <StatCard
          icon="📍"
          label="En Guadalupe"
          value={stats.porMunicipio['Guadalupe'] || 0}
          sublabel="Zona de análisis"
          color="blue"
        />
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-3 gap-6">
        {/* Mapa (2 columnas) */}
        <div className="col-span-2 bg-white rounded-lg shadow-sm border p-4">
          <h2 className="font-semibold text-gray-700 mb-3">
            🗺️ Mapa de Competidores ({competidoresFiltrados.length})
          </h2>
          <div className="h-[500px]">
            <MapaCompetencia competidores={competidoresFiltrados} />
          </div>
        </div>

        {/* Panel de Resumen */}
        <div className="space-y-4">
          {/* Por Marca */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold text-gray-700 mb-3">📊 Por Marca</h3>
            <div className="space-y-3">
              {Object.entries(stats.porMarca)
                .sort((a, b) => b[1] - a[1])
                .map(([marca, count]) => {
                  const total = competidoresFiltrados.length;
                  const porcentaje = Math.round((count / total) * 100);

                  return (
                    <div key={marca}>
                      <div className="flex justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ background: COLORES_MARCAS[marca as MarcaCompetencia] }}
                          ></span>
                          <span>{marca}</span>
                        </div>
                        <span className="font-medium">{count} ({porcentaje}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${porcentaje}%`,
                            background: COLORES_MARCAS[marca as MarcaCompetencia]
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Por Municipio */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold text-gray-700 mb-3">📍 Por Municipio</h3>
            <div className="space-y-2">
              {Object.entries(stats.porMunicipio)
                .sort((a, b) => b[1] - a[1])
                .map(([municipio, count]) => (
                  <div key={municipio} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                    <span>{municipio}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">💡 Insights</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• KFC domina en Guadalupe con {getCompetidoresPorMarca('KFC').filter(c => c.municipio === 'Guadalupe').length} sucursales</li>
              <li>• Wingstop enfocado en zonas premium</li>
              <li>• El Pollo Loco distribuido uniformemente</li>
              <li>• Zona oriente tiene menor saturación</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabla de Competidores */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-semibold text-gray-700 mb-4">📋 Lista de Competidores</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Marca</th>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Dirección</th>
                <th className="text-left p-3">Municipio</th>
                <th className="text-center p-3">Tipo</th>
                <th className="text-center p-3">Amenaza</th>
              </tr>
            </thead>
            <tbody>
              {competidoresFiltrados.map(comp => (
                <tr key={comp.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ background: COLORES_MARCAS[comp.marca] }}
                      ></span>
                      <span className="font-medium">{comp.marca}</span>
                    </div>
                  </td>
                  <td className="p-3">{comp.nombre}</td>
                  <td className="p-3 text-gray-500 text-xs">{comp.direccion}</td>
                  <td className="p-3">{comp.municipio}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      comp.tipoCompetencia === 'directa'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {comp.tipoCompetencia}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      comp.nivelAmenaza === 'alto' ? 'bg-red-100 text-red-700' :
                      comp.nivelAmenaza === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {comp.nivelAmenaza}
                    </span>
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

function StatCard({
  icon,
  label,
  value,
  sublabel,
  color = 'gray'
}: {
  icon: string;
  label: string;
  value: number;
  sublabel: string;
  color?: 'gray' | 'red' | 'yellow' | 'blue';
}) {
  const colorClasses = {
    gray: 'border-gray-200',
    red: 'border-red-200 bg-red-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    blue: 'border-blue-200 bg-blue-50',
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
          <div className="text-xs text-gray-400">{sublabel}</div>
        </div>
      </div>
    </div>
  );
}
