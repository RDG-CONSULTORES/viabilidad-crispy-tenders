'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Fix para iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface TrafficFlow {
  ubicacion: { lat: number; lng: number };
  velocidadActualKmh: number;
  velocidadLibreKmh: number;
  jamFactor: number;
  nivel: 'fluido' | 'lento' | 'congestionado' | 'detenido';
  descripcion: string;
}

interface MapaTraficoProps {
  centro: { lat: number; lng: number; nombre?: string };
  puntosCriticos: TrafficFlow[];
  radioKm: number;
}

// Componente para centrar el mapa
function MapController({ centro }: { centro: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([centro.lat, centro.lng], 13, {
      duration: 1
    });
  }, [centro, map]);

  return null;
}

// Obtener color basado en JamFactor
function getJamFactorColor(jamFactor: number): string {
  if (jamFactor <= 2) return '#22C55E'; // Verde - Fluido
  if (jamFactor <= 5) return '#EAB308'; // Amarillo - Lento
  if (jamFactor <= 8) return '#F97316'; // Naranja - Congestionado
  return '#EF4444'; // Rojo - Detenido
}

// Crear icono de centro
const centroIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      background: #3B82F6;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function MapaTrafico({
  centro,
  puntosCriticos,
  radioKm
}: MapaTraficoProps) {
  return (
    <MapContainer
      center={[centro.lat, centro.lng]}
      zoom={13}
      className="h-[600px] w-full rounded-lg"
      scrollWheelZoom={true}
    >
      {/* Mapa base oscuro para mejor visualización del tráfico */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Traffic data by HERE'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      <MapController centro={centro} />

      {/* Círculo del área de análisis */}
      <Circle
        center={[centro.lat, centro.lng]}
        radius={radioKm * 1000}
        pathOptions={{
          color: '#3B82F6',
          fillColor: '#3B82F6',
          fillOpacity: 0.05,
          weight: 2,
          dashArray: '10, 5'
        }}
      />

      {/* Marcador del centro */}
      <Marker position={[centro.lat, centro.lng]} icon={centroIcon}>
        <Popup>
          <div className="min-w-[150px]">
            <div className="font-bold text-blue-600">📍 Centro de Análisis</div>
            <div className="text-sm text-gray-600">{centro.nombre || 'Ubicación seleccionada'}</div>
            <div className="text-xs text-gray-400 mt-1">
              Radio: {radioKm} km
            </div>
          </div>
        </Popup>
      </Marker>

      {/* Puntos de tráfico */}
      {puntosCriticos.map((punto, index) => {
        const color = getJamFactorColor(punto.jamFactor);
        const size = punto.jamFactor >= 8 ? 12 : punto.jamFactor >= 5 ? 10 : 8;

        return (
          <CircleMarker
            key={index}
            center={[punto.ubicacion.lat, punto.ubicacion.lng]}
            radius={size}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.7,
              weight: 2
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <div className="font-bold capitalize" style={{ color }}>
                  {punto.nivel === 'detenido' ? '🛑' :
                   punto.nivel === 'congestionado' ? '⚠️' :
                   punto.nivel === 'lento' ? '🐢' : '✅'} {punto.nivel}
                </div>

                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">JamFactor:</span>
                    <span className="font-medium">{punto.jamFactor}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Velocidad actual:</span>
                    <span className="font-medium">{punto.velocidadActualKmh} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Velocidad libre:</span>
                    <span className="font-medium">{punto.velocidadLibreKmh} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Eficiencia:</span>
                    <span className="font-medium">
                      {Math.round((punto.velocidadActualKmh / punto.velocidadLibreKmh) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="mt-2 p-2 rounded text-xs" style={{ backgroundColor: `${color}20`, color }}>
                  {punto.descripcion}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Leyenda en el mapa */}
      <div className="leaflet-bottom leaflet-left">
        <div className="leaflet-control bg-white rounded-lg shadow-md p-3 m-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Nivel de Tráfico</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs">Fluido (0-2)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs">Lento (2-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-xs">Congestionado (5-8)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs">Detenido (8-10)</span>
            </div>
          </div>
        </div>
      </div>
    </MapContainer>
  );
}
