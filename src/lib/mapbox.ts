/**
 * MAPBOX API INTEGRATION
 *
 * Servicios disponibles:
 * - Isocronas: Área alcanzable en X minutos (caminando/auto)
 * - Geocoding: Dirección → Coordenadas
 * - Reverse Geocoding: Coordenadas → Dirección
 *
 * Free tier: 50,000 requests/mes
 * Docs: https://docs.mapbox.com/api/
 */

// ========== CONFIGURACIÓN ==========

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const MAPBOX_BASE_URL = 'https://api.mapbox.com';

// ========== TIPOS ==========

export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface IsochroneResult {
  centro: Coordenadas;
  tiempoMinutos: number;
  modo: 'driving' | 'walking' | 'cycling';
  geometria: GeoJSON.Polygon;
  areaKm2: number;
}

export interface GeocodingResult {
  direccion: string;
  coordenadas: Coordenadas;
  tipo: string; // address, poi, place, etc.
  relevancia: number;
  contexto: {
    colonia?: string;
    municipio?: string;
    estado?: string;
    codigoPostal?: string;
  };
}

export interface AnalisisAccesibilidad {
  ubicacion: Coordenadas;
  direccion?: string;
  isocronas: {
    caminando5min?: IsochroneResult;
    caminando10min?: IsochroneResult;
    auto5min?: IsochroneResult;
    auto10min?: IsochroneResult;
    auto15min?: IsochroneResult;
  };
  poblacionEstimada?: {
    caminando5min: number;
    caminando10min: number;
    auto5min: number;
    auto10min: number;
    auto15min: number;
  };
}

// ========== ISOCRONAS ==========

/**
 * Obtiene el polígono de área alcanzable en X minutos
 *
 * @param lat - Latitud del centro
 * @param lng - Longitud del centro
 * @param minutos - Tiempo en minutos (máx 60)
 * @param modo - 'driving' | 'walking' | 'cycling'
 */
export async function obtenerIsocrona(
  lat: number,
  lng: number,
  minutos: number,
  modo: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<IsochroneResult | null> {
  if (!MAPBOX_TOKEN) {
    console.error('MAPBOX_TOKEN no configurado');
    return null;
  }

  // Mapbox usa segundos, no minutos
  const segundos = minutos * 60;

  // Construir URL
  const url = new URL(`${MAPBOX_BASE_URL}/isochrone/v1/mapbox/${modo}/${lng},${lat}`);
  url.searchParams.set('contours_minutes', minutos.toString());
  url.searchParams.set('polygons', 'true');
  url.searchParams.set('access_token', MAPBOX_TOKEN);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 86400 } // Cache 24 horas
    });

    if (!response.ok) {
      console.error('Mapbox Isochrone error:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];
    const geometry = feature.geometry as GeoJSON.Polygon;

    // Calcular área aproximada del polígono
    const areaKm2 = calcularAreaPoligono(geometry);

    return {
      centro: { lat, lng },
      tiempoMinutos: minutos,
      modo,
      geometria: geometry,
      areaKm2
    };
  } catch (error) {
    console.error('Error obteniendo isocrona:', error);
    return null;
  }
}

/**
 * Obtiene múltiples isocronas para un punto (5, 10, 15 min)
 */
export async function obtenerIsoconasMultiples(
  lat: number,
  lng: number
): Promise<{
  caminando5min: IsochroneResult | null;
  caminando10min: IsochroneResult | null;
  auto5min: IsochroneResult | null;
  auto10min: IsochroneResult | null;
  auto15min: IsochroneResult | null;
}> {
  const [caminando5min, caminando10min, auto5min, auto10min, auto15min] = await Promise.all([
    obtenerIsocrona(lat, lng, 5, 'walking'),
    obtenerIsocrona(lat, lng, 10, 'walking'),
    obtenerIsocrona(lat, lng, 5, 'driving'),
    obtenerIsocrona(lat, lng, 10, 'driving'),
    obtenerIsocrona(lat, lng, 15, 'driving'),
  ]);

  return {
    caminando5min,
    caminando10min,
    auto5min,
    auto10min,
    auto15min
  };
}

// ========== GEOCODING ==========

/**
 * Convierte una dirección a coordenadas
 *
 * @param direccion - Dirección a buscar
 * @param cercaDe - Coordenadas para priorizar resultados cercanos
 */
export async function geocodificar(
  direccion: string,
  cercaDe?: Coordenadas
): Promise<GeocodingResult[]> {
  if (!MAPBOX_TOKEN) {
    console.error('MAPBOX_TOKEN no configurado');
    return [];
  }

  const url = new URL(`${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(direccion)}.json`);
  url.searchParams.set('access_token', MAPBOX_TOKEN);
  url.searchParams.set('country', 'MX'); // Solo México
  url.searchParams.set('language', 'es');
  url.searchParams.set('limit', '5');

  // Priorizar resultados cerca de Monterrey por defecto
  const proximidad = cercaDe || { lat: 25.6866, lng: -100.3161 };
  url.searchParams.set('proximity', `${proximidad.lng},${proximidad.lat}`);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 86400 }
    });

    if (!response.ok) {
      console.error('Mapbox Geocoding error:', response.status);
      return [];
    }

    const data = await response.json();

    return (data.features || []).map((feature: any) => {
      const contexto = extraerContexto(feature.context || []);

      return {
        direccion: feature.place_name,
        coordenadas: {
          lng: feature.center[0],
          lat: feature.center[1]
        },
        tipo: feature.place_type?.[0] || 'unknown',
        relevancia: feature.relevance || 0,
        contexto
      };
    });
  } catch (error) {
    console.error('Error en geocoding:', error);
    return [];
  }
}

/**
 * Convierte coordenadas a dirección (reverse geocoding)
 */
export async function obtenerDireccion(
  lat: number,
  lng: number
): Promise<GeocodingResult | null> {
  if (!MAPBOX_TOKEN) {
    console.error('MAPBOX_TOKEN no configurado');
    return null;
  }

  const url = new URL(`${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${lng},${lat}.json`);
  url.searchParams.set('access_token', MAPBOX_TOKEN);
  url.searchParams.set('language', 'es');
  url.searchParams.set('limit', '1');

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 86400 }
    });

    if (!response.ok) {
      console.error('Mapbox Reverse Geocoding error:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];
    const contexto = extraerContexto(feature.context || []);

    return {
      direccion: feature.place_name,
      coordenadas: { lat, lng },
      tipo: feature.place_type?.[0] || 'unknown',
      relevancia: 1,
      contexto
    };
  } catch (error) {
    console.error('Error en reverse geocoding:', error);
    return null;
  }
}

// ========== BÚSQUEDA DE PLAZAS ==========

/**
 * Busca plazas comerciales en un área
 */
export async function buscarPlazasComerciales(
  lat: number,
  lng: number,
  radioKm: number = 5
): Promise<GeocodingResult[]> {
  const queries = [
    'plaza comercial',
    'centro comercial',
    'shopping mall',
    'plaza'
  ];

  const allResults: GeocodingResult[] = [];
  const seenAddresses = new Set<string>();

  for (const query of queries) {
    const fullQuery = `${query} Monterrey`;
    const results = await geocodificar(fullQuery, { lat, lng });

    for (const result of results) {
      // Filtrar duplicados
      if (!seenAddresses.has(result.direccion)) {
        // Verificar que está dentro del radio
        const distancia = calcularDistanciaKm(lat, lng, result.coordenadas.lat, result.coordenadas.lng);
        if (distancia <= radioKm) {
          seenAddresses.add(result.direccion);
          allResults.push(result);
        }
      }
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return allResults;
}

// ========== ANÁLISIS DE ACCESIBILIDAD ==========

/**
 * Análisis completo de accesibilidad de una ubicación
 */
export async function analizarAccesibilidad(
  lat: number,
  lng: number
): Promise<AnalisisAccesibilidad> {
  // Obtener dirección
  const direccionResult = await obtenerDireccion(lat, lng);

  // Obtener isocronas
  const isocronas = await obtenerIsoconasMultiples(lat, lng);

  // Estimar población alcanzable (basado en densidad promedio de AMM)
  // Densidad promedio AMM: ~2,500 hab/km²
  const DENSIDAD_PROMEDIO = 2500;

  const poblacionEstimada = {
    caminando5min: Math.round((isocronas.caminando5min?.areaKm2 || 0) * DENSIDAD_PROMEDIO),
    caminando10min: Math.round((isocronas.caminando10min?.areaKm2 || 0) * DENSIDAD_PROMEDIO),
    auto5min: Math.round((isocronas.auto5min?.areaKm2 || 0) * DENSIDAD_PROMEDIO),
    auto10min: Math.round((isocronas.auto10min?.areaKm2 || 0) * DENSIDAD_PROMEDIO),
    auto15min: Math.round((isocronas.auto15min?.areaKm2 || 0) * DENSIDAD_PROMEDIO),
  };

  return {
    ubicacion: { lat, lng },
    direccion: direccionResult?.direccion,
    isocronas: {
      caminando5min: isocronas.caminando5min || undefined,
      caminando10min: isocronas.caminando10min || undefined,
      auto5min: isocronas.auto5min || undefined,
      auto10min: isocronas.auto10min || undefined,
      auto15min: isocronas.auto15min || undefined,
    },
    poblacionEstimada
  };
}

// ========== HELPERS ==========

/**
 * Extrae información del contexto de Mapbox
 */
function extraerContexto(context: any[]): GeocodingResult['contexto'] {
  const resultado: GeocodingResult['contexto'] = {};

  for (const item of context) {
    const id = item.id || '';

    if (id.startsWith('neighborhood')) {
      resultado.colonia = item.text;
    } else if (id.startsWith('place')) {
      resultado.municipio = item.text;
    } else if (id.startsWith('region')) {
      resultado.estado = item.text;
    } else if (id.startsWith('postcode')) {
      resultado.codigoPostal = item.text;
    }
  }

  return resultado;
}

/**
 * Calcula el área de un polígono GeoJSON en km²
 * Usando fórmula del área esférica simplificada
 */
function calcularAreaPoligono(geometry: GeoJSON.Polygon): number {
  const coords = geometry.coordinates[0];

  if (coords.length < 3) return 0;

  let area = 0;
  const n = coords.length;

  for (let i = 0; i < n - 1; i++) {
    const [lng1, lat1] = coords[i];
    const [lng2, lat2] = coords[i + 1];

    area += toRadians(lng2 - lng1) * (2 + Math.sin(toRadians(lat1)) + Math.sin(toRadians(lat2)));
  }

  area = Math.abs(area * 6371 * 6371 / 2); // Radio de la Tierra en km

  return Math.round(area * 100) / 100;
}

function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

/**
 * Calcula distancia entre dos puntos (Haversine)
 */
function calcularDistanciaKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

// ========== EXPORTS ==========

export {
  calcularDistanciaKm,
  MAPBOX_TOKEN
};
