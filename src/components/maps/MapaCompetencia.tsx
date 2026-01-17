'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Competidor, COLORES_MARCAS } from '@/data/competencia';

// Fix para iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;

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

interface MapaCompetenciaProps {
  competidores: Competidor[];
}

export default function MapaCompetencia({ competidores }: MapaCompetenciaProps) {
  // Centro: Monterrey
  const centro: [number, number] = [25.6866, -100.2500];

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

      {competidores.map(comp => {
        const color = COLORES_MARCAS[comp.marca] || '#666666';
        const icon = createIcon(color, 12);

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
                <div className="text-xs text-gray-500 mt-1">{comp.direccion}</div>
                <div className="text-xs text-gray-500">{comp.municipio}</div>
                <div className="mt-2 flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    comp.tipoCompetencia === 'directa'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {comp.tipoCompetencia}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    comp.nivelAmenaza === 'alto' ? 'bg-red-100 text-red-700' :
                    comp.nivelAmenaza === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {comp.nivelAmenaza}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
