'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Leaflet types - will be loaded dynamically
type LeafletType = typeof import('leaflet');
let L: LeafletType | null = null;

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  name: string;
  type: 'opportunity' | 'ct_existing' | 'competitor_kfc' | 'competitor_other';
  score?: number;
  details?: Record<string, any>;
}

interface InteractiveMapProps {
  opportunities: MapPoint[];
  existingStores?: MapPoint[];
  competitors?: MapPoint[];
  center?: { lat: number; lng: number };
  zoom?: number;
  showHeatmap?: boolean;
  showLayers?: boolean;
  onMarkerClick?: (point: MapPoint) => void;
  selectedId?: string;
  className?: string;
}

export function InteractiveMap({
  opportunities,
  existingStores = [],
  competitors = [],
  center = { lat: 25.6866, lng: -100.3161 },
  zoom = 11,
  showLayers = true,
  onMarkerClick,
  selectedId,
  className,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [layers, setLayers] = useState({
    opportunities: true,
    existingStores: true,
    competitors: true,
  });
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  const getMarkerColor = useCallback((type: MapPoint['type'], score?: number) => {
    switch (type) {
      case 'opportunity':
        if (!score) return '#6B7280';
        if (score >= 80) return '#10B981';
        if (score >= 65) return '#3B82F6';
        if (score >= 50) return '#F59E0B';
        return '#EF4444';
      case 'ct_existing':
        return '#F97316';
      case 'competitor_kfc':
        return '#DC2626';
      case 'competitor_other':
        return '#9333EA';
      default:
        return '#6B7280';
    }
  }, []);

  const createCustomIcon = useCallback((color: string, score?: number, isSelected?: boolean) => {
    if (!L) return null;
    const size = isSelected ? 40 : 32;
    const scoreHtml = score ? `<span style="position:absolute;top:-8px;right:-8px;background:#fff;border-radius:50%;padding:2px 5px;font-size:10px;font-weight:bold;box-shadow:0 1px 3px rgba(0,0,0,0.2)">${score}</span>` : '';

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="position:relative;width:${size}px;height:${size}px;">
          <div style="
            width:${size}px;
            height:${size}px;
            background:${color};
            border-radius:50%;
            border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
            display:flex;
            align-items:center;
            justify-content:center;
            ${isSelected ? 'box-shadow:0 0 0 4px rgba(249,115,22,0.4), 0 2px 8px rgba(0,0,0,0.3);' : ''}
          ">
            <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          ${scoreHtml}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
    });
  }, [isLoaded]);

  // Initialize map with dynamic Leaflet import
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = async () => {
      // Dynamically import Leaflet
      const leaflet = await import('leaflet');
      L = leaflet.default;

      if (!mapContainerRef.current || mapRef.current) return;

      const tileUrl = MAPBOX_TOKEN
        ? `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: false,
      });

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: MAPBOX_TOKEN ? '© Mapbox' : '© CARTO',
      }).addTo(map);

      mapRef.current = map;
      markersRef.current = L.layerGroup().addTo(map);
      setIsLoaded(true);
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = null;
      }
    };
  }, [center.lat, center.lng, zoom]);

  // Update markers when data changes
  useEffect(() => {
    if (!mapRef.current || !markersRef.current || !L || !isLoaded) return;
    const leaflet = L; // Local reference for TypeScript

    markersRef.current.clearLayers();

    // Add opportunity markers
    if (layers.opportunities) {
      opportunities.forEach((point) => {
        const isSelected = point.id === selectedId;
        const icon = createCustomIcon(getMarkerColor(point.type, point.score), point.score, isSelected);
        if (!icon) return;

        const marker = leaflet.marker([point.lat, point.lng], { icon })
          .bindPopup(`
            <div style="min-width:180px">
              <h4 style="font-weight:600;margin-bottom:4px">${point.name}</h4>
              ${point.score ? `<div style="display:inline-block;background:${getMarkerColor(point.type, point.score)};color:white;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:500">Score: ${point.score}</div>` : ''}
            </div>
          `)
          .on('click', () => onMarkerClick?.(point));

        markersRef.current?.addLayer(marker);
      });
    }

    // Add existing store markers
    if (layers.existingStores) {
      existingStores.forEach((point) => {
        const icon = createCustomIcon(getMarkerColor('ct_existing'));
        if (!icon) return;
        const marker = leaflet.marker([point.lat, point.lng], { icon })
          .bindPopup(`<b>${point.name}</b><br><small>Sucursal Crispy Tenders</small>`);
        markersRef.current?.addLayer(marker);
      });
    }

    // Add competitor markers
    if (layers.competitors) {
      competitors.forEach((point) => {
        const icon = createCustomIcon(getMarkerColor(point.type));
        if (!icon) return;
        const marker = leaflet.marker([point.lat, point.lng], { icon })
          .bindPopup(`<b>${point.name}</b><br><small>Competidor</small>`);
        markersRef.current?.addLayer(marker);
      });
    }
  }, [opportunities, existingStores, competitors, layers, selectedId, onMarkerClick, getMarkerColor, createCustomIcon, isLoaded]);

  // Center on selected marker
  useEffect(() => {
    if (!mapRef.current || !selectedId) return;

    const selected = opportunities.find(o => o.id === selectedId);
    if (selected) {
      mapRef.current.setView([selected.lat, selected.lng], 14, { animate: true });
    }
  }, [selectedId, opportunities]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  return (
    <div className={cn('relative rounded-2xl overflow-hidden shadow-card bg-gray-100', className)}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition"
        >
          <ZoomIn className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition"
        >
          <ZoomOut className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      {/* Layer Controls */}
      {showLayers && (
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={cn(
              'p-2.5 rounded-xl shadow-lg transition-all',
              showLayerPanel ? 'bg-navy-900 text-white' : 'bg-white text-navy-700 hover:bg-gray-50'
            )}
          >
            <Layers className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showLayerPanel && (
              <motion.div
                className="absolute top-12 left-0 bg-white rounded-xl shadow-lg p-4 min-w-[180px]"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Capas
                </p>
                <div className="space-y-2">
                  {[
                    { key: 'opportunities', label: 'Oportunidades', color: '#3B82F6' },
                    { key: 'existingStores', label: 'CT Existentes', color: '#F97316' },
                    { key: 'competitors', label: 'Competencia', color: '#DC2626' },
                  ].map(({ key, label, color }) => (
                    <label
                      key={key}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={layers[key as keyof typeof layers]}
                        onChange={(e) => setLayers({ ...layers, [key]: e.target.checked })}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          'w-4 h-4 rounded border-2 transition-all flex items-center justify-center',
                          layers[key as keyof typeof layers]
                            ? 'border-transparent'
                            : 'border-gray-300 group-hover:border-gray-400'
                        )}
                        style={{
                          backgroundColor: layers[key as keyof typeof layers] ? color : 'transparent',
                        }}
                      >
                        {layers[key as keyof typeof layers] && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                            <path d="M10.28 2.72a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06L4.25 7.69l4.97-4.97a.75.75 0 0 1 1.06 0Z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 z-10">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Score de Viabilidad
        </p>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>80+</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>65+</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>50+</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>&lt;50</span>
          </div>
        </div>
      </div>
    </div>
  );
}
