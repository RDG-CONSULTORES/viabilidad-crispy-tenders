'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Plaza } from '@/data/plazas';
import { Competidor, COLORES_MARCAS } from '@/data/competencia';

// Fix para iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function createIcon(color: string, size: number = 12) {
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
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Icono de estrella para la plaza
const plazaIcon = L.divIcon({
  className: 'plaza-marker',
  html: `
    <div style="
      background: #F97316;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    ">⭐</div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface MapaAnalisisProps {
  plaza: Plaza;
  competidores: (Competidor & { distanciaKm: number })[];
  radioKm: number;
}

export default function MapaAnalisis({ plaza, competidores, radioKm }: MapaAnalisisProps) {
  return (
    <MapContainer
      center={[plaza.lat, plaza.lng]}
      zoom={14}
      className="h-full w-full rounded-lg"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Círculos de radio */}
      <Circle
        center={[plaza.lat, plaza.lng]}
        radius={radioKm * 1000}
        pathOptions={{
          color: '#F97316',
          fillColor: '#F97316',
          fillOpacity: 0.1,
          weight: 2,
        }}
      />
      <Circle
        center={[plaza.lat, plaza.lng]}
        radius={1000}
        pathOptions={{
          color: '#22C55E',
          fillColor: '#22C55E',
          fillOpacity: 0.1,
          weight: 1,
          dashArray: '5, 5',
        }}
      />

      {/* Marker de la Plaza */}
      <Marker position={[plaza.lat, plaza.lng]} icon={plazaIcon}>
        <Popup>
          <div className="min-w-[200px]">
            <div className="font-bold text-crispy-600">⭐ {plaza.nombre}</div>
            <div className="text-sm text-gray-600 mt-1">{plaza.direccion}</div>
            <div className="text-xs text-gray-500 mt-1">
              NSE: {plaza.nivelSocioeconomico} | {plaza.municipio}
            </div>
          </div>
        </Popup>
      </Marker>

      {/* Markers de Competidores */}
      {competidores.map(comp => {
        const color = COLORES_MARCAS[comp.marca] || '#666666';
        const icon = createIcon(color, 10);

        return (
          <Marker
            key={comp.id}
            position={[comp.lat, comp.lng]}
            icon={icon}
          >
            <Popup>
              <div className="min-w-[180px]">
                <div className="font-bold" style={{ color }}>
                  {comp.marca}
                </div>
                <div className="text-sm text-gray-600">{comp.nombre}</div>
                <div className="text-xs text-gray-500 mt-1">
                  📍 {comp.distanciaKm} km de la plaza
                </div>
                <div className={`text-xs mt-1 ${
                  comp.tipoCompetencia === 'directa' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {comp.tipoCompetencia === 'directa' ? '⚠️ Competencia Directa' : '📊 Competencia Indirecta'}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
