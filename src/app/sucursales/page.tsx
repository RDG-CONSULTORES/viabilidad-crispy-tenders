'use client';

import { useState, useMemo } from 'react';
import { SUCURSALES_CRISPY_TENDERS, Sucursal } from '@/data/sucursales';
import { calcularViabilidad, CONFIG_DEFAULT } from '@/lib/scoring';
import { PLAZAS_MTY } from '@/data/plazas';

type FilterStatus = 'todas' | 'operando' | 'proximamente' | 'propuesta';

export default function SucursalesPage() {
  const [filtro, setFiltro] = useState<FilterStatus>('todas');
  const [busqueda, setBusqueda] = useState('');

  // Filtrar sucursales
  const sucursalesFiltradas = useMemo(() => {
    let resultado = SUCURSALES_CRISPY_TENDERS;

    // Filtrar por status
    if (filtro !== 'todas') {
      resultado = resultado.filter(s => s.status === filtro);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(s =>
        s.nombre.toLowerCase().includes(termino) ||
        s.plaza.toLowerCase().includes(termino) ||
        s.municipio.toLowerCase().includes(termino)
      );
    }

    return resultado;
  }, [filtro, busqueda]);

  // Contadores
  const contadores = useMemo(() => ({
    todas: SUCURSALES_CRISPY_TENDERS.length,
    operando: SUCURSALES_CRISPY_TENDERS.filter(s => s.status === 'operando').length,
    proximamente: SUCURSALES_CRISPY_TENDERS.filter(s => s.status === 'proximamente').length,
    propuesta: SUCURSALES_CRISPY_TENDERS.filter(s => s.status === 'propuesta').length,
  }), []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📍 Sucursales Crispy Tenders</h1>
          <p className="text-gray-500">Gestión y análisis de ubicaciones</p>
        </div>
        <button className="bg-crispy-500 text-white px-4 py-2 rounded-lg hover:bg-crispy-600 transition flex items-center gap-2">
          <span>+</span> Nueva Propuesta
        </button>
      </div>

      {/* Filtros por Status */}
      <div className="flex gap-2">
        <FilterButton
          active={filtro === 'todas'}
          onClick={() => setFiltro('todas')}
          count={contadores.todas}
        >
          Todas
        </FilterButton>
        <FilterButton
          active={filtro === 'operando'}
          onClick={() => setFiltro('operando')}
          count={contadores.operando}
          color="green"
        >
          ✅ Operando
        </FilterButton>
        <FilterButton
          active={filtro === 'proximamente'}
          onClick={() => setFiltro('proximamente')}
          count={contadores.proximamente}
          color="blue"
        >
          🔜 Próximas
        </FilterButton>
        <FilterButton
          active={filtro === 'propuesta'}
          onClick={() => setFiltro('propuesta')}
          count={contadores.propuesta}
          color="purple"
        >
          📍 Propuestas
        </FilterButton>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre, plaza o municipio..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-crispy-500 focus:border-transparent"
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Sucursales"
          value={contadores.todas}
          icon="🏪"
        />
        <StatCard
          label="Ticket Promedio"
          value={`$${Math.round(
            SUCURSALES_CRISPY_TENDERS.reduce((sum, s) => sum + s.ticketPromedio, 0) /
            SUCURSALES_CRISPY_TENDERS.length
          )}`}
          icon="💰"
        />
        <StatCard
          label="Municipios"
          value={new Set(SUCURSALES_CRISPY_TENDERS.map(s => s.municipio)).size}
          icon="📍"
        />
        <StatCard
          label="En Guadalupe"
          value={SUCURSALES_CRISPY_TENDERS.filter(s => s.municipio === 'Guadalupe').length}
          icon="🗺️"
        />
      </div>

      {/* Grid de Sucursales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sucursalesFiltradas.map(sucursal => (
          <SucursalCard key={sucursal.id} sucursal={sucursal} />
        ))}
      </div>

      {/* Mensaje si no hay resultados */}
      {sucursalesFiltradas.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">🔍</p>
          <p>No se encontraron sucursales con los filtros aplicados</p>
        </div>
      )}
    </div>
  );
}

// ========== COMPONENTES AUXILIARES ==========

function FilterButton({
  children,
  active,
  onClick,
  count,
  color = 'gray'
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  count: number;
  color?: 'gray' | 'green' | 'blue' | 'purple';
}) {
  const colorClasses = {
    gray: active ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    green: active ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100',
    blue: active ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    purple: active ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${colorClasses[color]}`}
    >
      {children}
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        active ? 'bg-white/20' : 'bg-gray-200'
      }`}>
        {count}
      </span>
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-2xl font-bold text-gray-800">{value}</div>
          <div className="text-sm text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  );
}

function SucursalCard({ sucursal }: { sucursal: Sucursal }) {
  // Calcular score si es propuesta
  const score = useMemo(() => {
    if (sucursal.status === 'propuesta' || sucursal.status === 'proximamente') {
      const plaza = PLAZAS_MTY.find(p =>
        p.nombre.toLowerCase().includes(sucursal.plaza.toLowerCase()) ||
        sucursal.plaza.toLowerCase().includes(p.nombre.toLowerCase())
      );
      if (plaza) {
        return calcularViabilidad(plaza, CONFIG_DEFAULT);
      }
    }
    return null;
  }, [sucursal]);

  const statusConfig = {
    operando: {
      badge: '✅ Operando',
      bgColor: 'bg-green-50 border-green-200',
      badgeColor: 'bg-green-100 text-green-700',
    },
    proximamente: {
      badge: '🔜 Próximamente',
      bgColor: 'bg-blue-50 border-blue-200',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    propuesta: {
      badge: '📍 Propuesta',
      bgColor: 'bg-purple-50 border-purple-200',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
  };

  const config = statusConfig[sucursal.status];

  return (
    <div className={`rounded-lg border-2 p-4 transition hover:shadow-md ${config.bgColor}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{sucursal.plaza}</h3>
          <p className="text-sm text-gray-500">{sucursal.nombre}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.badgeColor}`}>
          {config.badge}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <span>📍</span>
          <span>{sucursal.municipio}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span>💰</span>
          <span>Ticket: ${sucursal.ticketPromedio} promedio</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span>🕐</span>
          <span>{sucursal.horarioApertura} - {sucursal.horarioCierre}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span>📅</span>
          <span>{sucursal.diasOperacion.join(', ')}</span>
        </div>
      </div>

      {/* Score para propuestas */}
      {score && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Score de Viabilidad:</span>
            <span
              className="font-bold text-lg"
              style={{ color: score.color }}
            >
              {score.scoreTotal}/100
            </span>
          </div>
          <div className="text-xs mt-1" style={{ color: score.color }}>
            {score.clasificacion}
          </div>
        </div>
      )}

      {/* Notas */}
      {sucursal.notas && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 italic">{sucursal.notas}</p>
        </div>
      )}

      {/* Botón de acción */}
      <div className="mt-4">
        <a
          href={`/analisis?plaza=${encodeURIComponent(sucursal.plaza)}`}
          className="block w-full text-center bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
        >
          {sucursal.status === 'propuesta' ? '🔍 Analizar' : '📊 Ver Detalle'}
        </a>
      </div>
    </div>
  );
}
