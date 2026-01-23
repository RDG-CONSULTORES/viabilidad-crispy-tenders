/**
 * Foursquare Places API Integration
 * Reviews, categorías y datos de lugares
 * Docs: https://docs.foursquare.com/developer/reference/places-api-overview
 */

const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY;
const FOURSQUARE_BASE_URL = 'https://api.foursquare.com/v3';

export interface FoursquarePlace {
  fsq_id: string;
  name: string;
  categories: {
    id: number;
    name: string;
    short_name: string;
    plural_name: string;
    icon: { prefix: string; suffix: string };
  }[];
  chains?: { id: string; name: string }[];
  distance?: number;
  geocodes: {
    main: { latitude: number; longitude: number };
  };
  location: {
    address?: string;
    address_extended?: string;
    census_block?: string;
    country?: string;
    cross_street?: string;
    dma?: string;
    formatted_address?: string;
    locality?: string;
    postcode?: string;
    region?: string;
  };
  rating?: number;
  price?: number; // 1-4 scale
  popularity?: number;
  verified?: boolean;
  stats?: {
    total_photos?: number;
    total_ratings?: number;
    total_tips?: number;
  };
  hours?: {
    display?: string;
    is_local_holiday?: boolean;
    open_now?: boolean;
  };
  hours_popular?: { close: string; day: number; open: string }[];
  photos?: { id: string; prefix: string; suffix: string }[];
  tips?: { text: string; created_at: string }[];
  tastes?: string[];
  features?: {
    payment?: { credit_cards?: { accepts_credit_cards?: boolean } };
    services?: { delivery?: boolean; dine_in?: boolean; takeout?: boolean };
  };
}

export interface PlaceSearchResult {
  results: FoursquarePlace[];
  context?: {
    geo_bounds?: {
      circle?: { center: { latitude: number; longitude: number }; radius: number };
    };
  };
}

// Categorías de Foursquare relevantes para análisis de plazas
export const CATEGORIAS_RELEVANTES = {
  // Restaurantes de pollo / comida rápida
  POLLO_FRITO: '13065', // Fried Chicken Joint
  COMIDA_RAPIDA: '13145', // Fast Food Restaurant
  RESTAURANTE: '13065', // Restaurant

  // Centros comerciales
  CENTRO_COMERCIAL: '17114', // Shopping Mall
  PLAZA_COMERCIAL: '17069', // Shopping Plaza

  // Servicios que indican tráfico
  BANCO: '11045', // Bank
  SUPERMERCADO: '17069', // Supermarket
  FARMACIA: '17035', // Pharmacy
  CINE: '10024', // Movie Theater
  GYM: '18021', // Gym / Fitness Center
};

/**
 * Buscar lugares cercanos
 */
export async function buscarLugares(
  lat: number,
  lng: number,
  query?: string,
  categorias?: string[],
  radio: number = 2000,
  limite: number = 50
): Promise<FoursquarePlace[]> {
  if (!FOURSQUARE_API_KEY) {
    console.error('FOURSQUARE_API_KEY no configurada');
    return [];
  }

  try {
    const params = new URLSearchParams({
      ll: `${lat},${lng}`,
      radius: radio.toString(),
      limit: limite.toString(),
      sort: 'RELEVANCE',
    });

    if (query) {
      params.append('query', query);
    }

    if (categorias && categorias.length > 0) {
      params.append('categories', categorias.join(','));
    }

    const response = await fetch(`${FOURSQUARE_BASE_URL}/places/search?${params}`, {
      headers: {
        'Authorization': FOURSQUARE_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Error en Foursquare search:', response.status);
      return [];
    }

    const data: PlaceSearchResult = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error buscando lugares:', error);
    return [];
  }
}

/**
 * Obtener detalles de un lugar específico
 */
export async function obtenerDetallesLugar(fsqId: string): Promise<FoursquarePlace | null> {
  if (!FOURSQUARE_API_KEY) {
    console.error('FOURSQUARE_API_KEY no configurada');
    return null;
  }

  try {
    const fields = [
      'fsq_id', 'name', 'categories', 'chains', 'geocodes', 'location',
      'rating', 'price', 'popularity', 'verified', 'stats', 'hours',
      'hours_popular', 'photos', 'tips', 'tastes', 'features'
    ].join(',');

    const response = await fetch(`${FOURSQUARE_BASE_URL}/places/${fsqId}?fields=${fields}`, {
      headers: {
        'Authorization': FOURSQUARE_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Error en Foursquare details:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo detalles:', error);
    return null;
  }
}

/**
 * Buscar competidores de pollo en un área
 */
export async function buscarCompetidoresPollo(
  lat: number,
  lng: number,
  radio: number = 2000
): Promise<FoursquarePlace[]> {
  // Búsqueda por nombre de cadenas
  const cadenas = ['KFC', 'Kentucky Fried', 'Pollo Loco', 'Church\'s Chicken', 'Wingstop', 'Buffalo Wild Wings'];
  const competidores: FoursquarePlace[] = [];

  for (const cadena of cadenas) {
    const resultados = await buscarLugares(lat, lng, cadena, undefined, radio, 10);
    competidores.push(...resultados);
    // Rate limiting
    await new Promise(r => setTimeout(r, 100));
  }

  // También buscar por categoría de pollo frito
  const porCategoria = await buscarLugares(lat, lng, undefined, [CATEGORIAS_RELEVANTES.POLLO_FRITO], radio, 20);
  competidores.push(...porCategoria);

  // Eliminar duplicados por fsq_id
  const uniqueMap = new Map<string, FoursquarePlace>();
  for (const comp of competidores) {
    if (!uniqueMap.has(comp.fsq_id)) {
      uniqueMap.set(comp.fsq_id, comp);
    }
  }

  return Array.from(uniqueMap.values());
}

/**
 * Analizar servicios/amenidades en un área (indicador de tráfico peatonal)
 */
export async function analizarServiciosArea(
  lat: number,
  lng: number,
  radio: number = 1000
): Promise<{
  bancos: number;
  supermercados: number;
  farmacias: number;
  cines: number;
  gimnasios: number;
  restaurantes: number;
  total: number;
  densidadComercial: 'baja' | 'media' | 'alta' | 'muy_alta';
}> {
  const categorias = [
    { nombre: 'bancos', id: '11045' },
    { nombre: 'supermercados', id: '17069' },
    { nombre: 'farmacias', id: '17035' },
    { nombre: 'cines', id: '10024' },
    { nombre: 'gimnasios', id: '18021' },
    { nombre: 'restaurantes', id: '13065' },
  ];

  const conteos: Record<string, number> = {};
  let total = 0;

  for (const cat of categorias) {
    const lugares = await buscarLugares(lat, lng, undefined, [cat.id], radio, 50);
    conteos[cat.nombre] = lugares.length;
    total += lugares.length;
    await new Promise(r => setTimeout(r, 100));
  }

  // Determinar densidad comercial
  let densidadComercial: 'baja' | 'media' | 'alta' | 'muy_alta';
  if (total >= 50) {
    densidadComercial = 'muy_alta';
  } else if (total >= 30) {
    densidadComercial = 'alta';
  } else if (total >= 15) {
    densidadComercial = 'media';
  } else {
    densidadComercial = 'baja';
  }

  return {
    bancos: conteos.bancos || 0,
    supermercados: conteos.supermercados || 0,
    farmacias: conteos.farmacias || 0,
    cines: conteos.cines || 0,
    gimnasios: conteos.gimnasios || 0,
    restaurantes: conteos.restaurantes || 0,
    total,
    densidadComercial,
  };
}

/**
 * Obtener tips/reviews de un lugar
 */
export async function obtenerTips(fsqId: string, limite: number = 10): Promise<{
  text: string;
  created_at: string;
  agree_count?: number;
  disagree_count?: number;
}[]> {
  if (!FOURSQUARE_API_KEY) {
    return [];
  }

  try {
    const response = await fetch(`${FOURSQUARE_BASE_URL}/places/${fsqId}/tips?limit=${limite}`, {
      headers: {
        'Authorization': FOURSQUARE_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error obteniendo tips:', error);
    return [];
  }
}

/**
 * Analizar una plaza comercial completa con Foursquare
 */
export async function analizarPlazaFoursquare(
  nombrePlaza: string,
  lat: number,
  lng: number
): Promise<{
  lugar: FoursquarePlace | null;
  competidoresPollo: number;
  serviciosArea: Awaited<ReturnType<typeof analizarServiciosArea>>;
  rating?: number;
  popularidad?: number;
  precio?: number;
  tips: string[];
  score: number;
} | null> {
  try {
    // 1. Buscar la plaza
    const plazas = await buscarLugares(lat, lng, nombrePlaza, undefined, 500, 5);
    const lugar = plazas[0] || null;

    // 2. Buscar competidores de pollo
    const competidores = await buscarCompetidoresPollo(lat, lng, 2000);

    // 3. Analizar servicios del área
    const serviciosArea = await analizarServiciosArea(lat, lng, 1000);

    // 4. Obtener tips si encontramos la plaza
    let tips: string[] = [];
    if (lugar) {
      const tipsData = await obtenerTips(lugar.fsq_id, 5);
      tips = tipsData.map(t => t.text);
    }

    // 5. Calcular score
    let score = 50;

    // Por rating
    if (lugar?.rating) {
      if (lugar.rating >= 8) score += 15;
      else if (lugar.rating >= 6) score += 10;
      else if (lugar.rating < 5) score -= 10;
    }

    // Por densidad comercial
    if (serviciosArea.densidadComercial === 'muy_alta') score += 15;
    else if (serviciosArea.densidadComercial === 'alta') score += 10;
    else if (serviciosArea.densidadComercial === 'baja') score -= 10;

    // Por competencia
    if (competidores.length === 0) score += 10;
    else if (competidores.length >= 3) score -= 15;

    // Normalizar
    score = Math.max(0, Math.min(100, score));

    return {
      lugar,
      competidoresPollo: competidores.length,
      serviciosArea,
      rating: lugar?.rating,
      popularidad: lugar?.popularity,
      precio: lugar?.price,
      tips,
      score,
    };
  } catch (error) {
    console.error('Error analizando plaza:', error);
    return null;
  }
}

/**
 * Obtener nivel de precio como texto
 */
export function getNivelPrecio(precio?: number): string {
  switch (precio) {
    case 1: return 'Económico';
    case 2: return 'Moderado';
    case 3: return 'Caro';
    case 4: return 'Muy Caro';
    default: return 'No disponible';
  }
}

/**
 * Obtener densidad comercial como texto con color
 */
export function getDensidadInfo(densidad: string): { texto: string; color: string } {
  switch (densidad) {
    case 'muy_alta': return { texto: 'Muy Alta', color: '#10B981' };
    case 'alta': return { texto: 'Alta', color: '#22C55E' };
    case 'media': return { texto: 'Media', color: '#EAB308' };
    case 'baja': return { texto: 'Baja', color: '#EF4444' };
    default: return { texto: 'Desconocida', color: '#6B7280' };
  }
}
