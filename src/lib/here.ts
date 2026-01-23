/**
 * HERE API INTEGRATION
 *
 * Servicios disponibles:
 * - Routing con tráfico en tiempo real
 * - Traffic Flow (velocidad actual vs libre)
 * - Traffic Incidents (accidentes, obras)
 * - Isoline Routing (área alcanzable en X minutos con tráfico real)
 *
 * Free tier: 250,000 transacciones/mes
 * Docs: https://developer.here.com/documentation
 */

// ========== CONFIGURACIÓN ==========

const HERE_API_KEY = process.env.HERE_API_KEY || '';
const HERE_ROUTING_URL = 'https://router.hereapi.com/v8';
const HERE_TRAFFIC_URL = 'https://data.traffic.hereapi.com/v7';
const HERE_ISOLINE_URL = 'https://isoline.router.hereapi.com/v8';

// ========== TIPOS ==========

export interface HERERouteResult {
  origen: { lat: number; lng: number };
  destino: { lat: number; lng: number };
  distanciaKm: number;
  duracionBaseMin: number;      // Sin tráfico
  duracionTraficoMin: number;   // Con tráfico real
  factorTrafico: number;        // > 1 = más lento que normal
  polyline?: string;
}

export interface HERETrafficFlow {
  ubicacion: { lat: number; lng: number };
  velocidadActualKmh: number;
  velocidadLibreKmh: number;
  jamFactor: number;            // 0-10, donde 10 = detenido
  confianza: number;            // 0-1
  descripcion: string;
  nivel: 'fluido' | 'lento' | 'congestionado' | 'detenido';
}

export interface HEREIsolineResult {
  centro: { lat: number; lng: number };
  tiempoMinutos: number;
  modo: 'car' | 'pedestrian';
  conTrafico: boolean;
  areaKm2: number;
  polygono: GeoJSON.Polygon;
}

export interface HERETrafficIncident {
  id: string;
  tipo: string;
  descripcion: string;
  ubicacion: { lat: number; lng: number };
  severidad: 'menor' | 'moderado' | 'mayor' | 'critico';
  inicio?: string;
  finEstimado?: string;
}

export interface AnalisisTraficoZona {
  centro: { lat: number; lng: number };
  radioKm: number;
  timestamp: string;
  flujoPromedio: {
    jamFactorPromedio: number;
    velocidadPromedioKmh: number;
    nivelGeneral: 'fluido' | 'lento' | 'congestionado' | 'detenido';
  };
  puntosCriticos: HERETrafficFlow[];
  incidentes: HERETrafficIncident[];
  isolineConTrafico?: HEREIsolineResult;
  isolineSinTrafico?: HEREIsolineResult;
  impactoTrafico: {
    reduccionAreaPct: number;     // % de área perdida por tráfico
    tiempoAdicionalMin: number;   // Minutos extra promedio
  };
}

// ========== ROUTING CON TRÁFICO ==========

/**
 * Calcula ruta entre dos puntos con tráfico en tiempo real
 */
export async function calcularRutaConTrafico(
  origenLat: number,
  origenLng: number,
  destinoLat: number,
  destinoLng: number
): Promise<HERERouteResult | null> {
  if (!HERE_API_KEY) {
    console.error('HERE_API_KEY no configurado');
    return null;
  }

  const url = new URL(`${HERE_ROUTING_URL}/routes`);
  url.searchParams.set('transportMode', 'car');
  url.searchParams.set('origin', `${origenLat},${origenLng}`);
  url.searchParams.set('destination', `${destinoLat},${destinoLng}`);
  url.searchParams.set('return', 'summary,polyline');
  url.searchParams.set('apiKey', HERE_API_KEY);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 300 } // Cache 5 minutos
    });

    if (!response.ok) {
      console.error('HERE Routing error:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];
    const section = route.sections[0];
    const summary = section.summary;

    const duracionBase = summary.baseDuration || summary.duration;
    const duracionTrafico = summary.duration;

    return {
      origen: { lat: origenLat, lng: origenLng },
      destino: { lat: destinoLat, lng: destinoLng },
      distanciaKm: Math.round(summary.length / 10) / 100, // metros a km
      duracionBaseMin: Math.round(duracionBase / 60),
      duracionTraficoMin: Math.round(duracionTrafico / 60),
      factorTrafico: Math.round((duracionTrafico / duracionBase) * 100) / 100,
      polyline: section.polyline
    };
  } catch (error) {
    console.error('Error calculando ruta HERE:', error);
    return null;
  }
}

/**
 * Calcula rutas desde un punto a múltiples destinos
 */
export async function calcularRutasMultiples(
  origenLat: number,
  origenLng: number,
  destinos: Array<{ lat: number; lng: number; nombre?: string }>
): Promise<Array<HERERouteResult & { nombre?: string }>> {
  const resultados: Array<HERERouteResult & { nombre?: string }> = [];

  for (const destino of destinos) {
    const ruta = await calcularRutaConTrafico(
      origenLat, origenLng,
      destino.lat, destino.lng
    );

    if (ruta) {
      resultados.push({ ...ruta, nombre: destino.nombre });
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return resultados;
}

// ========== TRAFFIC FLOW ==========

/**
 * Obtiene flujo de tráfico en un punto específico
 */
export async function obtenerFlujoTrafico(
  lat: number,
  lng: number
): Promise<HERETrafficFlow | null> {
  if (!HERE_API_KEY) {
    console.error('HERE_API_KEY no configurado');
    return null;
  }

  const url = new URL(`${HERE_TRAFFIC_URL}/flow`);
  url.searchParams.set('in', `circle:${lat},${lng};r=500`);
  url.searchParams.set('locationReferencing', 'shape');
  url.searchParams.set('apiKey', HERE_API_KEY);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 60 } // Cache 1 minuto
    });

    if (!response.ok) {
      console.error('HERE Traffic Flow error:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    // Promediar resultados del área
    let totalJamFactor = 0;
    let totalSpeed = 0;
    let totalFreeFlow = 0;
    let count = 0;

    for (const result of data.results) {
      if (result.currentFlow) {
        totalJamFactor += result.currentFlow.jamFactor || 0;
        totalSpeed += result.currentFlow.speed || 0;
        totalFreeFlow += result.currentFlow.freeFlow || result.currentFlow.speed || 0;
        count++;
      }
    }

    if (count === 0) {
      return null;
    }

    const jamFactor = totalJamFactor / count;
    const velocidadActual = (totalSpeed / count) * 3.6; // m/s a km/h
    const velocidadLibre = (totalFreeFlow / count) * 3.6;

    // Determinar nivel
    let nivel: HERETrafficFlow['nivel'];
    let descripcion: string;

    if (jamFactor <= 2) {
      nivel = 'fluido';
      descripcion = 'Tráfico fluido';
    } else if (jamFactor <= 5) {
      nivel = 'lento';
      descripcion = 'Tráfico lento';
    } else if (jamFactor <= 8) {
      nivel = 'congestionado';
      descripcion = 'Tráfico congestionado';
    } else {
      nivel = 'detenido';
      descripcion = 'Tráfico detenido';
    }

    return {
      ubicacion: { lat, lng },
      velocidadActualKmh: Math.round(velocidadActual),
      velocidadLibreKmh: Math.round(velocidadLibre),
      jamFactor: Math.round(jamFactor * 10) / 10,
      confianza: 0.8, // HERE no devuelve confianza directamente
      descripcion,
      nivel
    };
  } catch (error) {
    console.error('Error obteniendo flujo de tráfico:', error);
    return null;
  }
}

/**
 * Obtiene flujo de tráfico en múltiples puntos de una zona
 */
export async function obtenerFlujoZona(
  lat: number,
  lng: number,
  radioKm: number = 2
): Promise<HERETrafficFlow[]> {
  if (!HERE_API_KEY) {
    console.error('HERE_API_KEY no configurado');
    return [];
  }

  const radioMetros = radioKm * 1000;
  const url = new URL(`${HERE_TRAFFIC_URL}/flow`);
  url.searchParams.set('in', `circle:${lat},${lng};r=${radioMetros}`);
  url.searchParams.set('locationReferencing', 'shape');
  url.searchParams.set('apiKey', HERE_API_KEY);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      console.error('HERE Traffic Flow Zone error:', response.status);
      return [];
    }

    const data = await response.json();
    const flujos: HERETrafficFlow[] = [];

    for (const result of data.results || []) {
      if (result.currentFlow && result.location?.shape?.links) {
        const link = result.location.shape.links[0];
        if (link?.points && link.points.length > 0) {
          const punto = link.points[0];
          const jamFactor = result.currentFlow.jamFactor || 0;
          const velocidadActual = (result.currentFlow.speed || 0) * 3.6;
          const velocidadLibre = (result.currentFlow.freeFlow || result.currentFlow.speed || 0) * 3.6;

          let nivel: HERETrafficFlow['nivel'];
          let descripcion: string;

          if (jamFactor <= 2) {
            nivel = 'fluido';
            descripcion = 'Tráfico fluido';
          } else if (jamFactor <= 5) {
            nivel = 'lento';
            descripcion = 'Tráfico lento';
          } else if (jamFactor <= 8) {
            nivel = 'congestionado';
            descripcion = 'Tráfico congestionado';
          } else {
            nivel = 'detenido';
            descripcion = 'Tráfico detenido';
          }

          flujos.push({
            ubicacion: { lat: punto.lat, lng: punto.lng },
            velocidadActualKmh: Math.round(velocidadActual),
            velocidadLibreKmh: Math.round(velocidadLibre),
            jamFactor: Math.round(jamFactor * 10) / 10,
            confianza: 0.8,
            descripcion,
            nivel
          });
        }
      }
    }

    return flujos;
  } catch (error) {
    console.error('Error obteniendo flujo de zona:', error);
    return [];
  }
}

// ========== ISOLINES (ÁREA ALCANZABLE) ==========

/**
 * Obtiene área alcanzable en X minutos con tráfico real
 */
export async function obtenerIsolineConTrafico(
  lat: number,
  lng: number,
  minutos: number,
  modo: 'car' | 'pedestrian' = 'car'
): Promise<HEREIsolineResult | null> {
  if (!HERE_API_KEY) {
    console.error('HERE_API_KEY no configurado');
    return null;
  }

  const segundos = minutos * 60;
  const url = new URL(`${HERE_ISOLINE_URL}/isolines`);
  url.searchParams.set('transportMode', modo);
  url.searchParams.set('origin', `${lat},${lng}`);
  url.searchParams.set('range[type]', 'time');
  url.searchParams.set('range[values]', segundos.toString());
  url.searchParams.set('routingMode', 'fast'); // Con tráfico
  url.searchParams.set('apiKey', HERE_API_KEY);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 300 } // Cache 5 minutos
    });

    if (!response.ok) {
      console.error('HERE Isoline error:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.isolines || data.isolines.length === 0) {
      return null;
    }

    const isoline = data.isolines[0];
    const polygons = isoline.polygons;

    if (!polygons || polygons.length === 0) {
      return null;
    }

    // HERE devuelve polígonos en formato flexible polyline
    // Convertir a GeoJSON
    const outerRing = polygons[0].outer;
    const coordinates = decodeFlexiblePolyline(outerRing);

    const geoJsonPolygon: GeoJSON.Polygon = {
      type: 'Polygon',
      coordinates: [coordinates.map(c => [c.lng, c.lat])]
    };

    // Calcular área aproximada
    const areaKm2 = calcularAreaPoligono(geoJsonPolygon);

    return {
      centro: { lat, lng },
      tiempoMinutos: minutos,
      modo,
      conTrafico: true,
      areaKm2,
      polygono: geoJsonPolygon
    };
  } catch (error) {
    console.error('Error obteniendo isoline HERE:', error);
    return null;
  }
}

/**
 * Compara isolines con y sin tráfico para medir impacto
 */
export async function compararIsolinesTrafico(
  lat: number,
  lng: number,
  minutos: number = 10
): Promise<{
  conTrafico: HEREIsolineResult | null;
  sinTrafico: HEREIsolineResult | null;
  impacto: {
    reduccionAreaPct: number;
    descripcion: string;
  };
} | null> {
  // Con tráfico (fast routing)
  const conTrafico = await obtenerIsolineConTrafico(lat, lng, minutos, 'car');

  // Sin tráfico - usar tiempo base estimado
  // HERE no tiene modo "sin tráfico" directo, estimamos con factor 1.3x
  const sinTraficoMinutos = Math.round(minutos * 1.3);
  const sinTrafico = await obtenerIsolineConTrafico(lat, lng, sinTraficoMinutos, 'car');

  if (!conTrafico) {
    return null;
  }

  let reduccionAreaPct = 0;
  let descripcion = 'Sin datos de comparación';

  if (sinTrafico) {
    reduccionAreaPct = Math.round(
      ((sinTrafico.areaKm2 - conTrafico.areaKm2) / sinTrafico.areaKm2) * 100
    );

    if (reduccionAreaPct <= 10) {
      descripcion = 'Impacto mínimo del tráfico';
    } else if (reduccionAreaPct <= 25) {
      descripcion = 'Impacto moderado del tráfico';
    } else if (reduccionAreaPct <= 40) {
      descripcion = 'Impacto significativo del tráfico';
    } else {
      descripcion = 'Impacto severo del tráfico';
    }
  }

  return {
    conTrafico,
    sinTrafico,
    impacto: {
      reduccionAreaPct,
      descripcion
    }
  };
}

// ========== ANÁLISIS COMPLETO DE ZONA ==========

/**
 * Análisis completo de tráfico para una ubicación
 */
export async function analizarTraficoZona(
  lat: number,
  lng: number,
  radioKm: number = 2
): Promise<AnalisisTraficoZona> {
  // Obtener flujo de tráfico en la zona
  const flujos = await obtenerFlujoZona(lat, lng, radioKm);

  // Calcular promedios
  let jamFactorTotal = 0;
  let velocidadTotal = 0;

  for (const flujo of flujos) {
    jamFactorTotal += flujo.jamFactor;
    velocidadTotal += flujo.velocidadActualKmh;
  }

  const count = flujos.length || 1;
  const jamFactorPromedio = Math.round((jamFactorTotal / count) * 10) / 10;
  const velocidadPromedio = Math.round(velocidadTotal / count);

  let nivelGeneral: HERETrafficFlow['nivel'];
  if (jamFactorPromedio <= 2) {
    nivelGeneral = 'fluido';
  } else if (jamFactorPromedio <= 5) {
    nivelGeneral = 'lento';
  } else if (jamFactorPromedio <= 8) {
    nivelGeneral = 'congestionado';
  } else {
    nivelGeneral = 'detenido';
  }

  // Identificar puntos críticos (jamFactor > 5)
  const puntosCriticos = flujos.filter(f => f.jamFactor > 5);

  // Obtener isolines comparativos
  const isolineConTrafico = await obtenerIsolineConTrafico(lat, lng, 10, 'car');

  // Calcular impacto estimado
  let reduccionAreaPct = 0;
  let tiempoAdicionalMin = 0;

  if (jamFactorPromedio > 2) {
    // Estimación: cada punto de jamFactor = ~5% reducción área
    reduccionAreaPct = Math.min(50, Math.round(jamFactorPromedio * 5));
    // Estimación: cada punto de jamFactor = ~1 min adicional
    tiempoAdicionalMin = Math.round(jamFactorPromedio);
  }

  return {
    centro: { lat, lng },
    radioKm,
    timestamp: new Date().toISOString(),
    flujoPromedio: {
      jamFactorPromedio,
      velocidadPromedioKmh: velocidadPromedio,
      nivelGeneral
    },
    puntosCriticos,
    incidentes: [], // TODO: Integrar API de incidentes
    isolineConTrafico: isolineConTrafico || undefined,
    isolineSinTrafico: undefined,
    impactoTrafico: {
      reduccionAreaPct,
      tiempoAdicionalMin
    }
  };
}

// ========== HELPERS ==========

/**
 * Decodifica HERE Flexible Polyline a coordenadas
 * Simplificación - HERE usa un formato específico
 */
function decodeFlexiblePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  // HERE Flexible Polyline decoder simplificado
  // Para producción, usar la librería oficial: @here/flexpolyline
  const coordinates: Array<{ lat: number; lng: number }> = [];

  try {
    // Decodificación básica
    let index = 0;
    let lat = 0;
    let lng = 0;

    // Skip header (first few characters contain precision info)
    // El formato real es más complejo, esto es una aproximación
    const precision = 5;
    const factor = Math.pow(10, precision);

    while (index < encoded.length) {
      let result = 0;
      let shift = 0;
      let byte;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20 && index < encoded.length);

      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      result = 0;
      shift = 0;

      if (index >= encoded.length) break;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20 && index < encoded.length);

      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      coordinates.push({
        lat: lat / factor,
        lng: lng / factor
      });
    }
  } catch (e) {
    console.error('Error decodificando polyline:', e);
  }

  return coordinates;
}

/**
 * Calcula el área de un polígono GeoJSON en km²
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

  area = Math.abs(area * 6371 * 6371 / 2);

  return Math.round(area * 100) / 100;
}

function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

// ========== EXPORTS ==========

export {
  HERE_API_KEY
};
