'use client';

import { useState, useMemo, useEffect } from 'react';
import { ScoringConfig, CONFIG_DEFAULT, validarPesos, normalizarPesos } from '@/lib/scoring';

// Etiquetas amigables para los pesos
const ETIQUETAS_PESOS: Record<keyof ScoringConfig['pesos'], { nombre: string; descripcion: string; icono: string }> = {
  flujoPeatonal: {
    nombre: 'Flujo Peatonal',
    descripcion: 'Cantidad de personas que transitan por la plaza diariamente',
    icono: '👥'
  },
  tiendasAncla: {
    nombre: 'Tiendas Ancla',
    descripcion: 'Presencia de tiendas grandes que atraen clientes (Liverpool, HEB, etc.)',
    icono: '🏬'
  },
  competencia: {
    nombre: 'Competencia',
    descripcion: 'Cantidad de competidores directos e indirectos en la zona',
    icono: '🎯'
  },
  perfilDemografico: {
    nombre: 'Perfil Demográfico',
    descripcion: 'Nivel socioeconómico del área (A, B, C+, C, D)',
    icono: '📊'
  },
  accesibilidad: {
    nombre: 'Accesibilidad',
    descripcion: 'Facilidad de acceso (Metro, rutas de bus, estacionamiento)',
    icono: '🚗'
  },
  costoRenta: {
    nombre: 'Costo de Renta',
    descripcion: 'Precio por m² del local (menor costo = mejor score)',
    icono: '💰'
  },
  visibilidad: {
    nombre: 'Visibilidad',
    descripcion: 'Ubicación dentro de la plaza y exposición visual',
    icono: '👁️'
  }
};

export default function ConfiguracionPage() {
  // Estado de la configuración
  const [config, setConfig] = useState<ScoringConfig>(CONFIG_DEFAULT);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  // Cargar configuración guardada
  useEffect(() => {
    const saved = localStorage.getItem('crispy_scoring_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Error al cargar configuración:', e);
      }
    }
  }, []);

  // Validación de pesos
  const sumaPesos = useMemo(() => {
    return Object.values(config.pesos).reduce((a, b) => a + b, 0);
  }, [config.pesos]);

  const pesosValidos = Math.abs(sumaPesos - 1) < 0.01;

  // Actualizar un peso
  const actualizarPeso = (key: keyof ScoringConfig['pesos'], valor: number) => {
    setConfig(prev => ({
      ...prev,
      pesos: {
        ...prev.pesos,
        [key]: valor
      }
    }));
  };

  // Normalizar pesos
  const normalizarPesosClick = () => {
    setConfig(prev => ({
      ...prev,
      pesos: normalizarPesos(prev.pesos)
    }));
  };

  // Restaurar valores por defecto
  const restaurarDefaults = () => {
    setConfig(CONFIG_DEFAULT);
    localStorage.removeItem('crispy_scoring_config');
    setMensajeExito('Configuración restaurada a valores por defecto');
    setTimeout(() => setMensajeExito(''), 3000);
  };

  // Guardar configuración
  const guardarConfig = () => {
    setGuardando(true);

    // Simular guardado (en producción sería una API)
    setTimeout(() => {
      localStorage.setItem('crispy_scoring_config', JSON.stringify(config));
      setGuardando(false);
      setMensajeExito('Configuración guardada exitosamente');
      setTimeout(() => setMensajeExito(''), 3000);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Configuración del Modelo</h1>
          <p className="text-gray-500">Ajusta los pesos y parámetros del algoritmo de scoring</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={restaurarDefaults}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Restaurar Defaults
          </button>
          <button
            onClick={guardarConfig}
            disabled={!pesosValidos || guardando}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              pesosValidos
                ? 'bg-crispy-500 text-white hover:bg-crispy-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {guardando ? (
              <>
                <span className="animate-spin">⏳</span>
                Guardando...
              </>
            ) : (
              <>
                <span>💾</span>
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mensaje de éxito */}
      {mensajeExito && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span>✅</span>
          {mensajeExito}
        </div>
      )}

      {/* Sección 1: Pesos del Modelo */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Pesos del Modelo de Scoring</h2>
            <p className="text-sm text-gray-500">Define la importancia relativa de cada factor (deben sumar 100%)</p>
          </div>

          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            pesosValidos
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            Total: {Math.round(sumaPesos * 100)}%
            {!pesosValidos && (
              <button
                onClick={normalizarPesosClick}
                className="ml-2 underline text-xs"
              >
                Normalizar
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {(Object.keys(config.pesos) as Array<keyof ScoringConfig['pesos']>).map(key => {
            const etiqueta = ETIQUETAS_PESOS[key];
            const valor = config.pesos[key];

            return (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{etiqueta.icono}</span>
                    <div>
                      <div className="font-medium text-gray-700">{etiqueta.nombre}</div>
                      <div className="text-xs text-gray-400">{etiqueta.descripcion}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-crispy-600">
                      {Math.round(valor * 100)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={valor * 100}
                    onChange={(e) => actualizarPeso(key, Number(e.target.value) / 100)}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-crispy-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(valor * 100)}
                    onChange={(e) => actualizarPeso(key, Number(e.target.value) / 100)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Visualización de distribución */}
        <div className="mt-6 pt-4 border-t">
          <div className="text-sm font-medium text-gray-600 mb-2">Distribución Visual</div>
          <div className="flex h-8 rounded-lg overflow-hidden">
            {(Object.keys(config.pesos) as Array<keyof ScoringConfig['pesos']>).map((key, index) => {
              const colors = ['#F97316', '#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#6366F1'];
              const valor = config.pesos[key];

              return (
                <div
                  key={key}
                  style={{
                    width: `${valor * 100}%`,
                    backgroundColor: colors[index % colors.length]
                  }}
                  className="flex items-center justify-center text-white text-xs font-medium"
                  title={`${ETIQUETAS_PESOS[key].nombre}: ${Math.round(valor * 100)}%`}
                >
                  {valor >= 0.08 && `${Math.round(valor * 100)}%`}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sección 2: Umbrales de Clasificación */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Umbrales de Clasificación</h2>
        <p className="text-sm text-gray-500 mb-6">Define los puntos de corte para clasificar las plazas</p>

        <div className="grid grid-cols-2 gap-6">
          {/* Umbral VIABLE */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="font-medium">VIABLE</span>
            </div>
            <p className="text-xs text-gray-500">Score mínimo para considerar la ubicación como viable</p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="50"
                max="100"
                value={config.umbrales.viable}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  umbrales: { ...prev.umbrales, viable: Number(e.target.value) }
                }))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <span className="font-bold text-green-600 text-lg">{config.umbrales.viable}</span>
            </div>
          </div>

          {/* Umbral EVALUAR */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="font-medium">EVALUAR</span>
            </div>
            <p className="text-xs text-gray-500">Score mínimo para recomendar evaluación adicional</p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="30"
                max={config.umbrales.viable - 1}
                value={config.umbrales.evaluar}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  umbrales: { ...prev.umbrales, evaluar: Number(e.target.value) }
                }))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <span className="font-bold text-yellow-600 text-lg">{config.umbrales.evaluar}</span>
            </div>
          </div>
        </div>

        {/* Escala visual */}
        <div className="mt-6 pt-4 border-t">
          <div className="text-sm font-medium text-gray-600 mb-2">Escala de Clasificación</div>
          <div className="relative h-8 rounded-lg overflow-hidden flex">
            <div
              className="bg-red-400 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${config.umbrales.evaluar}%` }}
            >
              NO VIABLE
            </div>
            <div
              className="bg-yellow-400 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${config.umbrales.viable - config.umbrales.evaluar}%` }}
            >
              EVALUAR
            </div>
            <div
              className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${100 - config.umbrales.viable}%` }}
            >
              VIABLE
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>{config.umbrales.evaluar}</span>
            <span>{config.umbrales.viable}</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Sección 3: Parámetros del Negocio */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Parámetros del Negocio</h2>
        <p className="text-sm text-gray-500 mb-6">Variables financieras para proyecciones</p>

        <div className="grid grid-cols-2 gap-6">
          {/* Ticket Promedio */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Ticket Promedio
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={config.negocio.ticketPromedio}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  negocio: { ...prev.negocio, ticketPromedio: Number(e.target.value) }
                }))}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crispy-500"
              />
            </div>
            <p className="text-xs text-gray-400">Venta promedio por cliente</p>
          </div>

          {/* Inversión Base */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Inversión Base
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={config.negocio.inversionBase}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  negocio: { ...prev.negocio, inversionBase: Number(e.target.value) }
                }))}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crispy-500"
              />
            </div>
            <p className="text-xs text-gray-400">Costo total para abrir nueva sucursal</p>
          </div>

          {/* Margen Operativo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Margen Operativo
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="10"
                max="60"
                value={config.negocio.margenOperativo * 100}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  negocio: { ...prev.negocio, margenOperativo: Number(e.target.value) / 100 }
                }))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-crispy-500"
              />
              <span className="font-bold text-crispy-600 w-12 text-right">
                {Math.round(config.negocio.margenOperativo * 100)}%
              </span>
            </div>
            <p className="text-xs text-gray-400">Porcentaje de ganancia sobre ventas</p>
          </div>

          {/* Meta Clientes/Día */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Meta Clientes/Día
            </label>
            <input
              type="number"
              value={config.negocio.metaClientesDia}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                negocio: { ...prev.negocio, metaClientesDia: Number(e.target.value) }
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crispy-500"
            />
            <p className="text-xs text-gray-400">Objetivo de transacciones diarias</p>
          </div>
        </div>

        {/* Proyección Ejemplo */}
        <div className="mt-6 pt-4 border-t bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600 mb-3">Proyección con estos parámetros:</div>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-400">Ventas Diarias</div>
              <div className="font-bold text-gray-700">
                ${(config.negocio.ticketPromedio * config.negocio.metaClientesDia).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Ventas Mensuales</div>
              <div className="font-bold text-gray-700">
                ${(config.negocio.ticketPromedio * config.negocio.metaClientesDia * 30).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Utilidad Mensual</div>
              <div className="font-bold text-green-600">
                ${Math.round(config.negocio.ticketPromedio * config.negocio.metaClientesDia * 30 * config.negocio.margenOperativo).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Payback (meses)</div>
              <div className="font-bold text-blue-600">
                {Math.round(config.negocio.inversionBase / (config.negocio.ticketPromedio * config.negocio.metaClientesDia * 30 * config.negocio.margenOperativo) * 10) / 10}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 4: APIs y Fuentes de Datos */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Fuentes de Datos</h2>
        <p className="text-sm text-gray-500 mb-6">Conexiones con APIs externas para datos en tiempo real</p>

        <div className="space-y-4">
          {/* INEGI DENUE */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏛️</span>
              </div>
              <div>
                <div className="font-medium text-gray-700">INEGI DENUE</div>
                <div className="text-xs text-gray-400">Directorio de unidades económicas</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Conectado
              </span>
              <button className="text-sm text-blue-500 hover:underline">
                Configurar
              </button>
            </div>
          </div>

          {/* Google Places */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📍</span>
              </div>
              <div>
                <div className="font-medium text-gray-700">Google Places API</div>
                <div className="text-xs text-gray-400">Información de lugares y reseñas</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                No configurado
              </span>
              <button className="text-sm text-blue-500 hover:underline">
                Conectar
              </button>
            </div>
          </div>

          {/* OpenStreetMap */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🗺️</span>
              </div>
              <div>
                <div className="font-medium text-gray-700">OpenStreetMap</div>
                <div className="text-xs text-gray-400">Mapas y tiles gratuitos</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Activo
              </span>
              <span className="text-xs text-gray-400">Sin límites</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 5: Información del Modelo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-800 mb-3">Acerca del Modelo de Scoring</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p>
            El modelo de viabilidad utiliza 7 factores ponderados para calcular un score de 0 a 100.
            Cada factor se evalúa independientemente y luego se combina según los pesos configurados.
          </p>
          <p>
            <strong>Fórmula:</strong> Score = (F1 × P1) + (F2 × P2) + ... + (F7 × P7)
          </p>
          <p className="text-xs">
            Donde F = Factor score (0-100) y P = Peso (0-1, suman 1)
          </p>
        </div>
      </div>
    </div>
  );
}
