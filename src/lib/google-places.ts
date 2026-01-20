/**
 * GOOGLE PLACES API INTEGRATION
 *
 * Proporciona datos REALES de competidores:
 * - Ratings y reviews
 * - Horarios de operación
 * - Nivel de precios
 * - Fotos
 * - Popular times (indirecto)
 *
 * Free tier: 10,000 llamadas/mes (Essentials)
 */

// ========== TIPOS ==========

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  totalReviews?: number;
  priceLevel?: number; // 0-4 (0=gratis, 4=muy caro)
  isOpen?: boolean;
  businessStatus?: string;
  types?: string[];
  phone?: string;
  website?: string;
}

export interface PlaceDetails extends PlaceResult {
  openingHours?: {
    weekdayText: string[];
    periods: {
      open: { day: number; time: string };
      close: { day: number; time: string };
    }[];
  };
  reviews?: PlaceReview[];
}

export interface PlaceReview {
  authorName: string;
  rating: number;
  text: string;
  relativeTime: string;
  time: number;
}

export interface CompetidorEnriquecido {
  // Datos básicos
  id: string;
  nombre: string;
  marca: string;
  direccion: string;
  lat: number;
  lng: number;

  // Datos de Google Places (REALES)
  placeId?: string;
  rating?: number;
  totalReviews?: number;
  priceLevel?: number;
  isOpen?: boolean;
  phone?: string;

  // Reviews
  reviews?: PlaceReview[];

  // Análisis derivado
  sentimentScore?: number; // Calculado de reviews
  promedioRating?: number;

  // Metadata
  fuenteDatos: 'google_places' | 'manual' | 'inegi';
  ultimaActualizacion: string;
}

// ========== CONFIGURACIÓN ==========

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

// ========== FUNCIONES API ==========

/**
 * Busca lugares cercanos a una ubicación
 */
export async function buscarLugaresCercanos(
  lat: number,
  lng: number,
  radiusMeters: number = 3000,
  keyword?: string,
  type: string = 'restaurant'
): Promise<PlaceResult[]> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('GOOGLE_PLACES_API_KEY no configurada');
    return [];
  }

  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: radiusMeters.toString(),
    type,
    key: GOOGLE_PLACES_API_KEY,
  });

  if (keyword) {
    params.append('keyword', keyword);
  }

  try {
    const response = await fetch(`${BASE_URL}/nearbysearch/json?${params}`, {
      next: { revalidate: 3600 } // Cache 1 hora
    });

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message);
      return [];
    }

    return (data.results || []).map((place: any) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.vicinity || place.formatted_address,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      rating: place.rating,
      totalReviews: place.user_ratings_total,
      priceLevel: place.price_level,
      isOpen: place.opening_hours?.open_now,
      businessStatus: place.business_status,
      types: place.types,
    }));
  } catch (error) {
    console.error('Error buscando lugares:', error);
    return [];
  }
}

/**
 * Obtiene detalles completos de un lugar incluyendo reviews
 */
export async function obtenerDetallesLugar(placeId: string): Promise<PlaceDetails | null> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('GOOGLE_PLACES_API_KEY no configurada');
    return null;
  }

  const fields = [
    'name',
    'formatted_address',
    'geometry',
    'rating',
    'user_ratings_total',
    'price_level',
    'opening_hours',
    'formatted_phone_number',
    'website',
    'reviews',
    'business_status'
  ].join(',');

  const params = new URLSearchParams({
    place_id: placeId,
    fields,
    key: GOOGLE_PLACES_API_KEY,
  });

  try {
    const response = await fetch(`${BASE_URL}/details/json?${params}`, {
      next: { revalidate: 86400 } // Cache 24 horas
    });

    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status);
      return null;
    }

    const place = data.result;

    return {
      placeId,
      name: place.name,
      address: place.formatted_address,
      lat: place.geometry?.location?.lat || 0,
      lng: place.geometry?.location?.lng || 0,
      rating: place.rating,
      totalReviews: place.user_ratings_total,
      priceLevel: place.price_level,
      isOpen: place.opening_hours?.open_now,
      businessStatus: place.business_status,
      phone: place.formatted_phone_number,
      website: place.website,
      openingHours: place.opening_hours ? {
        weekdayText: place.opening_hours.weekday_text || [],
        periods: place.opening_hours.periods || []
      } : undefined,
      reviews: (place.reviews || []).map((r: any) => ({
        authorName: r.author_name,
        rating: r.rating,
        text: r.text,
        relativeTime: r.relative_time_description,
        time: r.time
      }))
    };
  } catch (error) {
    console.error('Error obteniendo detalles:', error);
    return null;
  }
}

/**
 * Busca competidores de pollo frito en una zona
 */
export async function buscarCompetidoresPollo(
  lat: number,
  lng: number,
  radiusMeters: number = 3000
): Promise<PlaceResult[]> {
  const keywords = ['KFC', 'Kentucky Fried Chicken', 'Wingstop', 'Pollo Loco', 'pollo frito', 'alitas'];

  const allResults: PlaceResult[] = [];
  const seenPlaceIds = new Set<string>();

  for (const keyword of keywords) {
    const results = await buscarLugaresCercanos(lat, lng, radiusMeters, keyword);

    for (const result of results) {
      if (!seenPlaceIds.has(result.placeId)) {
        seenPlaceIds.add(result.placeId);
        allResults.push(result);
      }
    }

    // Rate limiting - esperar 100ms entre requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Ordenar por rating
  return allResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
}

/**
 * Enriquece un competidor existente con datos de Google Places
 */
export async function enriquecerCompetidor(
  competidor: { nombre: string; lat: number; lng: number; marca: string },
): Promise<CompetidorEnriquecido | null> {
  // Buscar el lugar más cercano que coincida
  const resultados = await buscarLugaresCercanos(
    competidor.lat,
    competidor.lng,
    500, // Radio pequeño para match exacto
    competidor.nombre
  );

  if (resultados.length === 0) {
    return null;
  }

  // Tomar el primer resultado (más relevante)
  const lugar = resultados[0];

  // Obtener detalles completos
  const detalles = await obtenerDetallesLugar(lugar.placeId);

  if (!detalles) {
    return {
      id: `gp-${lugar.placeId}`,
      nombre: lugar.name,
      marca: competidor.marca,
      direccion: lugar.address,
      lat: lugar.lat,
      lng: lugar.lng,
      placeId: lugar.placeId,
      rating: lugar.rating,
      totalReviews: lugar.totalReviews,
      priceLevel: lugar.priceLevel,
      isOpen: lugar.isOpen,
      fuenteDatos: 'google_places',
      ultimaActualizacion: new Date().toISOString()
    };
  }

  // Calcular sentiment score de reviews
  let sentimentScore = 50; // Neutral por defecto
  if (detalles.reviews && detalles.reviews.length > 0) {
    const avgRating = detalles.reviews.reduce((sum, r) => sum + r.rating, 0) / detalles.reviews.length;
    sentimentScore = Math.round((avgRating / 5) * 100);
  }

  return {
    id: `gp-${lugar.placeId}`,
    nombre: detalles.name,
    marca: competidor.marca,
    direccion: detalles.address,
    lat: detalles.lat,
    lng: detalles.lng,
    placeId: detalles.placeId,
    rating: detalles.rating,
    totalReviews: detalles.totalReviews,
    priceLevel: detalles.priceLevel,
    isOpen: detalles.isOpen,
    phone: detalles.phone,
    reviews: detalles.reviews,
    sentimentScore,
    promedioRating: detalles.rating,
    fuenteDatos: 'google_places',
    ultimaActualizacion: new Date().toISOString()
  };
}

/**
 * Analiza la competencia en una zona y devuelve insights
 */
export async function analizarCompetenciaZona(
  lat: number,
  lng: number,
  radiusMeters: number = 3000
): Promise<{
  competidores: PlaceResult[];
  resumen: {
    total: number;
    ratingPromedio: number;
    conMasReviews: PlaceResult | null;
    mejorRating: PlaceResult | null;
    peorRating: PlaceResult | null;
  };
  oportunidad: 'alta' | 'media' | 'baja';
  razon: string;
}> {
  const competidores = await buscarCompetidoresPollo(lat, lng, radiusMeters);

  if (competidores.length === 0) {
    return {
      competidores: [],
      resumen: {
        total: 0,
        ratingPromedio: 0,
        conMasReviews: null,
        mejorRating: null,
        peorRating: null
      },
      oportunidad: 'alta',
      razon: 'Sin competencia directa de pollo frito en la zona'
    };
  }

  // Calcular estadísticas
  const conRating = competidores.filter(c => c.rating);
  const ratingPromedio = conRating.length > 0
    ? conRating.reduce((sum, c) => sum + (c.rating || 0), 0) / conRating.length
    : 0;

  const conMasReviews = [...competidores].sort((a, b) =>
    (b.totalReviews || 0) - (a.totalReviews || 0)
  )[0] || null;

  const mejorRating = [...competidores].sort((a, b) =>
    (b.rating || 0) - (a.rating || 0)
  )[0] || null;

  const peorRating = [...competidores].sort((a, b) =>
    (a.rating || 0) - (b.rating || 0)
  )[0] || null;

  // Determinar oportunidad
  let oportunidad: 'alta' | 'media' | 'baja';
  let razon: string;

  if (competidores.length <= 2 && ratingPromedio < 4.0) {
    oportunidad = 'alta';
    razon = 'Poca competencia y ratings bajos - oportunidad de diferenciación';
  } else if (competidores.length <= 4 && ratingPromedio < 4.2) {
    oportunidad = 'media';
    razon = 'Competencia moderada con espacio para mejorar';
  } else {
    oportunidad = 'baja';
    razon = 'Zona saturada o con competidores bien establecidos';
  }

  return {
    competidores,
    resumen: {
      total: competidores.length,
      ratingPromedio: Math.round(ratingPromedio * 10) / 10,
      conMasReviews,
      mejorRating,
      peorRating
    },
    oportunidad,
    razon
  };
}

// ========== HELPERS ==========

/**
 * Formatea el nivel de precio a texto
 */
export function formatearPrecio(priceLevel?: number): string {
  const niveles = ['Gratis', '$', '$$', '$$$', '$$$$'];
  return priceLevel !== undefined ? niveles[priceLevel] || 'N/A' : 'N/A';
}

/**
 * Calcula distancia entre dos puntos (Haversine)
 */
export function calcularDistanciaKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 100) / 100;
}
