/**
 * BestTime.app API Integration
 * Foot traffic data for venues
 * Docs: https://documentation.besttime.app
 */

const BESTTIME_API_KEY_PRIVATE = process.env.BESTTIME_API_KEY_PRIVATE;
const BESTTIME_API_KEY_PUBLIC = process.env.BESTTIME_API_KEY_PUBLIC;
const BESTTIME_BASE_URL = 'https://besttime.app/api/v1';

interface ForecastResponse {
  status: string;
  venue_info: {
    venue_id: string;
    venue_name: string;
    venue_address: string;
  };
  analysis: DayAnalysis[];
  epoch_analysis: number;
}

interface DayAnalysis {
  day_info: {
    day_int: number; // 0=Monday, 6=Sunday
    day_text: string;
    venue_open: number;
    venue_closed: number;
  };
  day_raw: number[]; // 24 values (0-100) for each hour
  busy_hours: number[];
  quiet_hours: number[];
  peak_hours: { peak_start: number; peak_end: number; peak_intensity: number }[];
  surge_hours: { surge_start: number; surge_end: number }[];
}

interface LiveResponse {
  status: string;
  venue_info: {
    venue_id: string;
    venue_name: string;
  };
  analysis: {
    venue_live_busyness: number; // Current busyness 0-100
    venue_live_busyness_available: boolean;
    venue_live_forecasted_busyness: number;
    venue_forecasted_busyness: number;
  };
}

interface VenueSearchResult {
  venue_name: string;
  venue_address: string;
  venue_id: string;
  day_raw: number[];
  venue_foot_traffic_forecast: number; // Average weekly foot traffic
}

export interface AfluenciaData {
  venue_id: string;
  venue_name: string;
  venue_address: string;
  afluenciaActual?: number; // 0-100
  afluenciaPronosticada?: number;
  horasPico: { inicio: number; fin: number; intensidad: number }[];
  horasTranquilas: number[];
  promedioSemanal: number;
  mejorDia: string;
  peorDia: string;
  analisisPorDia: {
    dia: string;
    promedio: number;
    pico: number;
    horaPico: number;
  }[];
}

/**
 * Crear forecast para un venue nuevo
 */
export async function crearForecast(
  venueName: string,
  venueAddress: string
): Promise<ForecastResponse | null> {
  if (!BESTTIME_API_KEY_PRIVATE) {
    console.error('BESTTIME_API_KEY_PRIVATE no configurada');
    return null;
  }

  try {
    const params = new URLSearchParams({
      api_key_private: BESTTIME_API_KEY_PRIVATE,
      venue_name: venueName,
      venue_address: venueAddress,
    });

    const response = await fetch(`${BESTTIME_BASE_URL}/forecasts?${params}`, {
      method: 'POST',
    });

    if (!response.ok) {
      console.error('Error en BestTime forecast:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error creando forecast:', error);
    return null;
  }
}

/**
 * Obtener datos live de un venue
 */
export async function obtenerLive(venueId: string): Promise<LiveResponse | null> {
  if (!BESTTIME_API_KEY_PRIVATE) {
    console.error('BESTTIME_API_KEY_PRIVATE no configurada');
    return null;
  }

  try {
    const params = new URLSearchParams({
      api_key_private: BESTTIME_API_KEY_PRIVATE,
      venue_id: venueId,
    });

    const response = await fetch(`${BESTTIME_BASE_URL}/forecasts/live?${params}`);

    if (!response.ok) {
      console.error('Error en BestTime live:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo live:', error);
    return null;
  }
}

/**
 * Buscar venues en un área con filtros
 */
export async function buscarVenuesPorArea(
  lat: number,
  lng: number,
  radiusMeters: number = 2000,
  tipos?: string[] // e.g., ['restaurant', 'cafe']
): Promise<VenueSearchResult[]> {
  if (!BESTTIME_API_KEY_PRIVATE) {
    console.error('BESTTIME_API_KEY_PRIVATE no configurada');
    return [];
  }

  try {
    const params = new URLSearchParams({
      api_key_private: BESTTIME_API_KEY_PRIVATE,
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radiusMeters.toString(),
      fast: 'false', // Normal speed = 1 credit per 20 venues
    });

    if (tipos && tipos.length > 0) {
      params.append('types', tipos.join(','));
    }

    const response = await fetch(`${BESTTIME_BASE_URL}/venues/search?${params}`);

    if (!response.ok) {
      console.error('Error en BestTime search:', response.status);
      return [];
    }

    const data = await response.json();
    return data.venues || [];
  } catch (error) {
    console.error('Error buscando venues:', error);
    return [];
  }
}

/**
 * Obtener forecast existente por venue_id (usa public key - sin costo)
 */
export async function obtenerForecastExistente(
  venueId: string
): Promise<ForecastResponse | null> {
  if (!BESTTIME_API_KEY_PUBLIC) {
    console.error('BESTTIME_API_KEY_PUBLIC no configurada');
    return null;
  }

  try {
    const params = new URLSearchParams({
      api_key_public: BESTTIME_API_KEY_PUBLIC,
      venue_id: venueId,
    });

    const response = await fetch(`${BESTTIME_BASE_URL}/forecasts?${params}`);

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo forecast:', error);
    return null;
  }
}

/**
 * Analizar afluencia de una plaza comercial
 * Esta es la función principal para integrar con el dashboard
 */
export async function analizarAfluenciaPlaza(
  nombrePlaza: string,
  direccion: string
): Promise<AfluenciaData | null> {
  try {
    // Primero intentamos crear un forecast
    const forecast = await crearForecast(nombrePlaza, direccion);

    if (!forecast || forecast.status !== 'OK') {
      console.log('No se pudo crear forecast para:', nombrePlaza);
      return null;
    }

    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    // Analizar cada día
    const analisisPorDia = forecast.analysis.map((day, index) => {
      const raw = day.day_raw || [];
      const promedio = raw.length > 0
        ? Math.round(raw.reduce((a, b) => a + b, 0) / raw.length)
        : 0;
      const pico = Math.max(...raw, 0);
      const horaPico = raw.indexOf(pico);

      return {
        dia: dias[index],
        promedio,
        pico,
        horaPico,
      };
    });

    // Encontrar mejor y peor día
    const promedios = analisisPorDia.map(d => d.promedio);
    const mejorDiaIndex = promedios.indexOf(Math.max(...promedios));
    const peorDiaIndex = promedios.indexOf(Math.min(...promedios));

    // Recolectar todas las horas pico
    const horasPico: { inicio: number; fin: number; intensidad: number }[] = [];
    forecast.analysis.forEach(day => {
      if (day.peak_hours) {
        day.peak_hours.forEach(peak => {
          horasPico.push({
            inicio: peak.peak_start,
            fin: peak.peak_end,
            intensidad: peak.peak_intensity,
          });
        });
      }
    });

    // Horas tranquilas más comunes
    const horasTranquilas: number[] = [];
    forecast.analysis.forEach(day => {
      if (day.quiet_hours) {
        day.quiet_hours.forEach(hour => {
          if (!horasTranquilas.includes(hour)) {
            horasTranquilas.push(hour);
          }
        });
      }
    });

    // Promedio semanal
    const promedioSemanal = Math.round(
      analisisPorDia.reduce((sum, d) => sum + d.promedio, 0) / analisisPorDia.length
    );

    // Intentar obtener datos live
    let afluenciaActual: number | undefined;
    let afluenciaPronosticada: number | undefined;

    try {
      const live = await obtenerLive(forecast.venue_info.venue_id);
      if (live && live.analysis) {
        afluenciaActual = live.analysis.venue_live_busyness_available
          ? live.analysis.venue_live_busyness
          : undefined;
        afluenciaPronosticada = live.analysis.venue_forecasted_busyness;
      }
    } catch {
      // Live data no disponible, continuar sin ella
    }

    return {
      venue_id: forecast.venue_info.venue_id,
      venue_name: forecast.venue_info.venue_name,
      venue_address: forecast.venue_info.venue_address,
      afluenciaActual,
      afluenciaPronosticada,
      horasPico,
      horasTranquilas: horasTranquilas.sort((a, b) => a - b),
      promedioSemanal,
      mejorDia: dias[mejorDiaIndex],
      peorDia: dias[peorDiaIndex],
      analisisPorDia,
    };
  } catch (error) {
    console.error('Error analizando afluencia:', error);
    return null;
  }
}

/**
 * Obtener nivel de afluencia como texto
 */
export function getNivelAfluencia(valor: number): {
  nivel: 'muy_baja' | 'baja' | 'media' | 'alta' | 'muy_alta';
  texto: string;
  color: string;
} {
  if (valor <= 20) {
    return { nivel: 'muy_baja', texto: 'Muy Baja', color: '#EF4444' };
  } else if (valor <= 40) {
    return { nivel: 'baja', texto: 'Baja', color: '#F97316' };
  } else if (valor <= 60) {
    return { nivel: 'media', texto: 'Media', color: '#EAB308' };
  } else if (valor <= 80) {
    return { nivel: 'alta', texto: 'Alta', color: '#22C55E' };
  } else {
    return { nivel: 'muy_alta', texto: 'Muy Alta', color: '#10B981' };
  }
}

/**
 * Calcular score de afluencia para viabilidad (0-100)
 */
export function calcularScoreAfluencia(data: AfluenciaData): {
  score: number;
  factores: { nombre: string; valor: number; peso: number }[];
} {
  const factores = [
    {
      nombre: 'Promedio semanal',
      valor: data.promedioSemanal,
      peso: 0.4,
    },
    {
      nombre: 'Horas pico (cantidad)',
      valor: Math.min(data.horasPico.length * 10, 100),
      peso: 0.3,
    },
    {
      nombre: 'Consistencia días',
      valor: 100 - (Math.max(...data.analisisPorDia.map(d => d.promedio)) -
                   Math.min(...data.analisisPorDia.map(d => d.promedio))),
      peso: 0.2,
    },
    {
      nombre: 'Pico máximo',
      valor: Math.max(...data.analisisPorDia.map(d => d.pico)),
      peso: 0.1,
    },
  ];

  const score = Math.round(
    factores.reduce((sum, f) => sum + f.valor * f.peso, 0)
  );

  return { score, factores };
}
