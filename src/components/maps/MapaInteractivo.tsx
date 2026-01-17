'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

import { Sucursal } from '@/data/sucursales';
import { Competidor, COLORES_MARCAS } from '@/data/competencia';
import { Plaza, COLORES_NIVEL } from '@/data/plazas';

// Fix para iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Crear iconos personalizados
function createIcon(color: string, size: number = 12, pulse: boolean = false) {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ${pulse ? 'animation: pulse 2s infinite;' : ''}
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Iconos por tipo
const ICONOS = {
  crispy: createIcon('#F97316', 16),
  crispyProximamente: createIcon('#8B5CF6', 16, true),
  crispyPropuesta: createIcon('#EC4899', 18, true),
  kfc: createIcon('#E4002B', 10),
  wingstop: createIcon('#00A651', 10),
  polloLoco: createIcon('#FF6B00', 10),
  otro: createIcon('#666666', 8),
  plaza: createIcon('#3B82F6', 14),
  plazaPropuesta: createIcon('#A855F7', 16, true),
};

interface MapaInteractivoProps {
  sucursales: Sucursal[];
  competidores: Competidor[];
  plazas: Plaza[];
  plazaSeleccionada: string | null;
  onPlazaClick: (id: string) => void;
}

// Componente para centrar el mapa cuando cambia la plaza seleccionada
function MapController({ plaza }: { plaza: Plaza | null }) {
  const map = useMap();

  useEffect(() => {
    if (plaza) {
      map.flyTo([plaza.lat, plaza.lng], 15, {
        duration: 1
      });
    }
  }, [plaza, map]);

  return null;
}

export default function MapaInteractivo({
  sucursales,
  competidores,
  plazas,
  plazaSeleccionada,
  onPlazaClick
}: MapaInteractivoProps) {
  // Centro del mapa: Monterrey
  const centro: [number, number] = [25.6866, -100.3161];

  const plazaActual = plazas.find(p => p.id === plazaSeleccionada) || null;

  return (
    <MapContainer
      center={centro}
      zoom={11}
      className="h-full w-full rounded-lg"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController plaza={plazaActual} />

      {/* Círculo de área de influencia para plaza seleccionada */}
      {plazaActual && (
        <>
          <Circle
            center={[plazaActual.lat, plazaActual.lng]}
            radius={1000}
            pathOptions={{
              color: '#F97316',
              fillColor: '#F97316',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 5'
            }}
          />
          <Circle
            center={[plazaActual.lat, plazaActual.lng]}
            radius={2000}
            pathOptions={{
              color: '#94A3B8',
              fillColor: '#94A3B8',
              fillOpacity: 0.05,
              weight: 1,
              dashArray: '3, 3'
            }}
          />
        </>
      )}

      {/* Markers de Sucursales Crispy Tenders */}
      {sucursales.map(sucursal => {
        const icon = sucursal.status === 'operando'
          ? ICONOS.crispy
          : sucursal.status === 'proximamente'
          ? ICONOS.crispyProximamente
          : ICONOS.crispyPropuesta;

        return (
          <Marker
            key={sucursal.id}
            position={[sucursal.lat, sucursal.lng]}
            icon={icon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="font-bold text-crispy-600 flex items-center gap-2">
                  🍗 {sucursal.nombre}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {sucursal.plaza}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  📍 {sucursal.direccion}
                </div>
                <div className="mt-2 text-xs">
                  <span className={`px-2 py-1 rounded ${
                    sucursal.status === 'operando' ? 'bg-green-100 text-green-700' :
                    sucursal.status === 'proximamente' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {sucursal.status === 'operando' ? '✅ Operando' :
                     sucursal.status === 'proximamente' ? '🔜 Próximamente' :
                     '📍 Propuesta'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  🕐 {sucursal.horarioApertura} - {sucursal.horarioCierre}
                </div>
                <div className="text-xs text-gray-500">
                  💰 Ticket promedio: ${sucursal.ticketPromedio}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Markers de Competidores */}
      {competidores.map(comp => {
        const icon = comp.marca === 'KFC' ? ICONOS.kfc :
                    comp.marca === 'Wingstop' ? ICONOS.wingstop :
                    comp.marca === 'El Pollo Loco' ? ICONOS.polloLoco :
                    ICONOS.otro;

        return (
          <Marker
            key={comp.id}
            position={[comp.lat, comp.lng]}
            icon={icon}
          >
            <Popup>
              <div className="min-w-[180px]">
                <div
                  className="font-bold flex items-center gap-2"
                  style={{ color: COLORES_MARCAS[comp.marca] }}
                >
                  🎯 {comp.nombre}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {comp.direccion}
                </div>
                <div className="mt-2 flex gap-2 text-xs">
                  <span className={`px-2 py-1 rounded ${
                    comp.tipoCompetencia === 'directa' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {comp.tipoCompetencia === 'directa' ? '⚠️ Directa' : '📊 Indirecta'}
                  </span>
                  <span className={`px-2 py-1 rounded ${
                    comp.nivelAmenaza === 'alto' ? 'bg-red-100 text-red-700' :
                    comp.nivelAmenaza === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {comp.nivelAmenaza}
                  </span>
                </div>
                {comp.horario && (
                  <div className="text-xs text-gray-500 mt-1">
                    🕐 {comp.horario}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Markers de Plazas (sin sucursal CT) */}
      {plazas
        .filter(p => !p.tieneSucursalCT)
        .map(plaza => {
          const icon = plaza.esPropuesta ? ICONOS.plazaPropuesta : ICONOS.plaza;
          const isSelected = plaza.id === plazaSeleccionada;

          return (
            <Marker
              key={plaza.id}
              position={[plaza.lat, plaza.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onPlazaClick(plaza.id)
              }}
            >
              <Popup>
                <div className="min-w-[220px]">
                  <div className="font-bold text-blue-600 flex items-center gap-2">
                    🏢 {plaza.nombre}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    📍 {plaza.direccion}
                  </div>
                  <div className="text-xs text-gray-500">
                    📌 {plaza.municipio}
                  </div>

                  {plaza.tiendasAncla.length > 0 && (
                    <div className="text-xs mt-2">
                      <strong>Tiendas Ancla:</strong> {plaza.tiendasAncla.join(', ')}
                    </div>
                  )}

                  <div className="mt-2 flex gap-2 text-xs">
                    <span
                      className="px-2 py-1 rounded text-white"
                      style={{ background: COLORES_NIVEL[plaza.nivelSocioeconomico] }}
                    >
                      NSE: {plaza.nivelSocioeconomico}
                    </span>
                    {plaza.esPropuesta && (
                      <span className="px-2 py-1 rounded bg-purple-100 text-purple-700">
                        📍 Propuesta
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mt-2">
                    🕐 {plaza.horarioApertura} - {plaza.horarioCierre}
                  </div>
                  {plaza.rentaEstimadaM2 && (
                    <div className="text-xs text-gray-500">
                      💰 Renta est: ${plaza.rentaEstimadaM2}/m²
                    </div>
                  )}

                  <button
                    className="mt-2 w-full bg-crispy-500 text-white py-1 px-2 rounded text-xs hover:bg-crispy-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlazaClick(plaza.id);
                    }}
                  >
                    Ver Análisis Completo
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}
