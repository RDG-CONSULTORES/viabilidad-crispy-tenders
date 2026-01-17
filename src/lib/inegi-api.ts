/**
 * Integración con INEGI DENUE API
 *
 * DENUE: Directorio Estadístico Nacional de Unidades Económicas
 * Documentación: https://www.inegi.org.mx/servicios/api_denue.html
 *
 * Esta API es GRATUITA y no requiere autenticación
 */

// ========== TIPOS ==========

export interface UnidadEconomica {
  id: string;
  nom_estab: string;           // Nombre del establecimiento
  raz_social: string;          // Razón social
  codigo_act: string;          // Código SCIAN (Sistema de Clasificación Industrial)
  nombre_act: string;          // Descripción de actividad
  per_ocu: string;             // Personal ocupado (rango)
  tipo_vial: string;           // Tipo de vialidad
  nom_vial: string;            // Nombre de vialidad
  numero_ext: string;          // Número exterior
  numero_int: string;          // Número interior
  colonia: string;
  cod_postal: string;
  cve_ent: string;             // Clave entidad (19 = Nuevo León)
  entidad: string;
  cve_mun: string;             // Clave municipio
  municipio: string;
  cve_loc: string;             // Clave localidad
  localidad: string;
  telefono: string;
  correoelec: string;
  www: string;
  latitud: string;
  longitud: string;
}

export interface DenueResponse {
  nombre: string;
  total_reg: string;
  registros: UnidadEconomica[];
}

// ========== CONFIGURACIÓN ==========

// Códigos SCIAN relevantes para restaurantes de pollo
const SCIAN_CODES = {
  // Preparación de alimentos
  restaurantes_general: '7225',
  comida_rapida: '722519',      // Restaurantes de comida para llevar
  autoservicio: '722512',       // Restaurantes de autoservicio

  // Específicos
  pollo: '311615',              // Procesamiento de pollo (producción)
};

// Nombres de cadenas de competencia para filtrado
const COMPETIDORES_KEYWORDS = [
  'KFC', 'KENTUCKY', 'WINGSTOP', 'WING', 'POLLO LOCO', 'EL POLLO',
  'POLLO FELIZ', 'BACHOCO', 'POLLOS ASADOS', 'POLLO FRITO',
  'BUFFALO', 'HOOTERS', 'ALITAS', 'WINGS'
];

// ========== FUNCIONES API ==========

/**
 * Busca unidades económicas en un radio dado
 * @param lat Latitud central
 * @param lng Longitud central
 * @param radioMetros Radio de búsqueda en metros (máx 5000)
 * @param codigoActividad Código SCIAN de actividad
 */
export async function buscarUnidadesEnRadio(
  lat: number,
  lng: number,
  radioMetros: number = 2000,
  codigoActividad: string = SCIAN_CODES.restaurantes_general
): Promise<UnidadEconomica[]> {
  // DENUE API tiene límite de 5000m
  const radio = Math.min(radioMetros, 5000);

  const url = `https://www.inegi.org.mx/app/api/denue/v1/consulta/buscar/${codigoActividad}/${lat},${lng}/${radio}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      // Cache por 1 hora
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      console.error(`DENUE API Error: ${response.status}`);
      return [];
    }

    const data = await response.json();

    // La API devuelve un array directamente
    if (Array.isArray(data)) {
      return data as UnidadEconomica[];
    }

    return [];
  } catch (error) {
    console.error('Error consultando DENUE:', error);
    return [];
  }
}

/**
 * Busca unidades económicas por nombre
 * @param nombre Nombre o parte del nombre a buscar
 * @param entidad Clave de entidad (19 = Nuevo León)
 */
export async function buscarPorNombre(
  nombre: string,
  entidad: string = '19'  // Nuevo León
): Promise<UnidadEconomica[]> {
  // Codificar el nombre para URL
  const nombreEncoded = encodeURIComponent(nombre);

  const url = `https://www.inegi.org.mx/app/api/denue/v1/consulta/nombre/${nombreEncoded}/${entidad}/todos`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      console.error(`DENUE API Error: ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return data as UnidadEconomica[];
    }

    return [];
  } catch (error) {
    console.error('Error consultando DENUE:', error);
    return [];
  }
}

/**
 * Busca todos los competidores de pollo frito en una zona
 */
export async function buscarCompetidoresPollo(
  lat: number,
  lng: number,
  radioMetros: number = 3000
): Promise<UnidadEconomica[]> {
  // Buscar restaurantes en general
  const unidades = await buscarUnidadesEnRadio(lat, lng, radioMetros, '7225');

  // Filtrar por keywords de competencia
  return unidades.filter(u => {
    const nombreUpper = u.nom_estab?.toUpperCase() || '';
    const actividadUpper = u.nombre_act?.toUpperCase() || '';

    return COMPETIDORES_KEYWORDS.some(keyword =>
      nombreUpper.includes(keyword) || actividadUpper.includes(keyword)
    );
  });
}

/**
 * Busca específicamente KFC, Wingstop y El Pollo Loco en Nuevo León
 */
export async function buscarCadenasCompetencia(): Promise<{
  kfc: UnidadEconomica[];
  wingstop: UnidadEconomica[];
  polloLoco: UnidadEconomica[];
}> {
  const [kfc, wingstop, polloLoco] = await Promise.all([
    buscarPorNombre('KFC', '19'),
    buscarPorNombre('WINGSTOP', '19'),
    buscarPorNombre('POLLO LOCO', '19'),
  ]);

  return { kfc, wingstop, polloLoco };
}

/**
 * Convierte una unidad económica de DENUE al formato de Competidor
 */
export function convertirACompetidor(unidad: UnidadEconomica): {
  id: string;
  marca: string;
  nombre: string;
  direccion: string;
  municipio: string;
  lat: number;
  lng: number;
  tipoCompetencia: 'directa' | 'indirecta';
  nivelAmenaza: 'alto' | 'medio' | 'bajo';
} {
  const nombreUpper = unidad.nom_estab?.toUpperCase() || '';

  // Determinar marca
  let marca = 'Otro';
  if (nombreUpper.includes('KFC') || nombreUpper.includes('KENTUCKY')) {
    marca = 'KFC';
  } else if (nombreUpper.includes('WINGSTOP') || nombreUpper.includes('WING STOP')) {
    marca = 'Wingstop';
  } else if (nombreUpper.includes('POLLO LOCO')) {
    marca = 'El Pollo Loco';
  }

  // Determinar tipo de competencia
  const tipoCompetencia = (marca === 'KFC' || marca === 'Wingstop') ? 'directa' : 'indirecta';

  // Determinar nivel de amenaza
  let nivelAmenaza: 'alto' | 'medio' | 'bajo' = 'bajo';
  if (marca === 'KFC') nivelAmenaza = 'alto';
  else if (marca === 'Wingstop') nivelAmenaza = 'alto';
  else if (marca === 'El Pollo Loco') nivelAmenaza = 'medio';

  return {
    id: `denue-${unidad.id}`,
    marca,
    nombre: unidad.nom_estab,
    direccion: `${unidad.tipo_vial} ${unidad.nom_vial} ${unidad.numero_ext}, ${unidad.colonia}`,
    municipio: unidad.municipio,
    lat: parseFloat(unidad.latitud) || 0,
    lng: parseFloat(unidad.longitud) || 0,
    tipoCompetencia,
    nivelAmenaza,
  };
}

/**
 * Cuenta restaurantes por tipo en una zona
 */
export async function contarRestaurantesEnZona(
  lat: number,
  lng: number,
  radioMetros: number = 1000
): Promise<{
  total: number;
  competenciaDirecta: number;
  competenciaIndirecta: number;
  detalles: {
    kfc: number;
    wingstop: number;
    polloLoco: number;
    otros: number;
  };
}> {
  const competidores = await buscarCompetidoresPollo(lat, lng, radioMetros);

  let kfc = 0;
  let wingstop = 0;
  let polloLoco = 0;
  let otros = 0;

  competidores.forEach(c => {
    const nombre = c.nom_estab?.toUpperCase() || '';
    if (nombre.includes('KFC') || nombre.includes('KENTUCKY')) kfc++;
    else if (nombre.includes('WINGSTOP')) wingstop++;
    else if (nombre.includes('POLLO LOCO')) polloLoco++;
    else otros++;
  });

  return {
    total: competidores.length,
    competenciaDirecta: kfc + wingstop,
    competenciaIndirecta: polloLoco + otros,
    detalles: { kfc, wingstop, polloLoco, otros }
  };
}

// ========== HELPER: Distancia Haversine ==========

export function calcularDistanciaKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}
