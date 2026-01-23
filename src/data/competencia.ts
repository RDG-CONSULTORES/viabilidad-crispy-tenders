/**
 * Competencia - Fast Food de Pollo en Área Metropolitana de Monterrey
 * Datos actualizados: Enero 2025
 * Fuentes: Google Places, INEGI DENUE, búsquedas web
 */

export type MarcaCompetencia =
  | 'KFC'
  | 'Wingstop'
  | 'El Pollo Loco'
  | 'Church\'s Chicken'
  | 'Pollos Asados'
  | 'Buffalo Wild Wings'
  | 'Hooters'
  | 'Otro';

export interface Competidor {
  id: string;
  nombre: string;
  marca: MarcaCompetencia;
  direccion: string;
  lat: number;
  lng: number;
  municipio: string;

  // Verificación Google Places
  placeId?: string;
  coordenadasVerificadas?: boolean;
  ultimaVerificacion?: string;

  // Clasificación
  tipoCompetencia: 'directa' | 'indirecta';
  nivelAmenaza: 'alto' | 'medio' | 'bajo';

  // Operación
  horario?: string;
  telefono?: string;

  // Delivery
  enRappi?: boolean;
  enUberEats?: boolean;
}

export const COMPETIDORES_MTY: Competidor[] = [
  // ========== KFC - GUADALUPE ==========
  {
    id: 'kfc-001',
    nombre: 'KFC Lindavista',
    marca: 'KFC',
    direccion: 'Monterrey - Apodaca 4446, Jardines de La Linda Vista, 67130',
    lat: 25.6887118,
    lng: -100.2572369,
    municipio: 'Guadalupe',
    placeId: 'ChIJqTVKCK3qYoYRoos7NjCZSBA',
    coordenadasVerificadas: true,
    ultimaVerificacion: '2025-01-23',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'alto',
    horario: '10:00-22:00',
    enRappi: true,
    enUberEats: true
  },
  {
    id: 'kfc-002',
    nombre: 'KFC Eloy Cavazos (49ers NFL)',
    marca: 'KFC',
    direccion: 'Av Eloy Cavazos No. 4504, Valle La Silla, 67186 Guadalupe',
    lat: 25.655562,
    lng: -100.215461,
    municipio: 'Guadalupe',
    placeId: 'ChIJ42E5KkvAYoYR97WfL2h-8tQ',
    coordenadasVerificadas: true,
    ultimaVerificacion: '2025-01-23',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'alto',
    horario: '10:00-22:00',
    enRappi: true,
    enUberEats: true
  },
  {
    id: 'kfc-003',
    nombre: 'KFC Misión Santa Cruz',
    marca: 'KFC',
    direccion: 'Autop. Monterrey - Reynosa S/N, Misión Santa Cruz, 67196 Guadalupe',
    lat: 25.6613449,
    lng: -100.1503296,
    municipio: 'Guadalupe',
    placeId: 'ChIJi2Vs6MzDYoYRUh-yhFmbh1w',
    coordenadasVerificadas: true,
    ultimaVerificacion: '2025-01-23',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'alto',
    horario: '09:30-22:30',
    enRappi: true,
    enUberEats: true
  },
  {
    id: 'kfc-004',
    nombre: 'KFC Eduardo Caballero',
    marca: 'KFC',
    direccion: 'Boulevard Acapulco 206 b Eduardo Caballero Escamilla, 67117 Guadalupe',
    lat: 25.6522281,
    lng: -100.1119712,
    municipio: 'Guadalupe',
    placeId: 'ChIJKznrDuXCYoYR4VzzqihPPeU',
    coordenadasVerificadas: true,
    ultimaVerificacion: '2025-01-23',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'alto',
    horario: '10:00-22:00'
  },
  {
    id: 'kfc-005',
    nombre: 'KFC La Fuente',
    marca: 'KFC',
    direccion: 'Benito Juárez 1501, La Fuente, 67154 Guadalupe',
    lat: 25.6789779,
    lng: -100.2382049,
    municipio: 'Guadalupe',
    placeId: 'ChIJK3F_jR_AYoYRlVbhId-Uclc',
    coordenadasVerificadas: true,
    ultimaVerificacion: '2025-01-23',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'alto'
  },
  {
    id: 'kfc-006',
    nombre: 'KFC Blvd. Acapulco',
    marca: 'KFC',
    direccion: 'Blvd. Acapulco 206b, Eduardo Caballero, 67117 Guadalupe',
    lat: 25.7239556,
    lng: -100.1953663,
    municipio: 'Guadalupe',
    placeId: 'ChIJsb0gYDbqYoYRcnXndQCdROc',
    coordenadasVerificadas: true,
    ultimaVerificacion: '2025-01-23',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'alto',
    // NOTA: CERCANO A PLAZA 1500 (~0.5km)
  },
  {
    id: 'kfc-007',
    nombre: 'KFC Sun Mall Guadalupe',
    marca: 'KFC',
    direccion: 'Agua Nueva, 67190 Guadalupe',
    lat: 25.6580579,
    lng: -100.1837718,
    municipio: 'Guadalupe',
    placeId: 'ChIJUXVEZdfBYoYRU69bRRQWvdM',
    coordenadasVerificadas: true,
    ultimaVerificacion: '2025-01-23',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'alto'
  },
  {
    id: 'kfc-008',
    nombre: 'KFC Ruiz Cortines Bernardo Reyes',
    marca: 'KFC',
    direccion: 'Av. Ruiz Cortines 2401, Bernardo Reyes, 64280 Monterrey',
    lat: 25.7054267,
    lng: -100.3399032,
    municipio: 'Monterrey',
    placeId: 'ChIJ1WJf0cSVYoYR2fVwpNTC5VA',
    coordenadasVerificadas: true,
    ultimaVerificacion: '2025-01-23',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'alto'
  },

  // ========== KFC - MONTERREY ==========
  {
    id: 'kfc-009',
    nombre: 'KFC Insurgentes Vista Hermosa',
    marca: 'KFC',
    direccion: 'Av Insurgentes #2500, Vista Hermosa, 64620 Monterrey',
    lat: 25.6802671,
    lng: -100.3557508,
    municipio: 'Monterrey',
    placeId: 'ChIJSWhM_t6XYoYRTvojyGdx9Rs',
    coordenadasVerificadas: true,
    ultimaVerificacion: '2025-01-23',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'alto'
  },
  {
    id: 'kfc-010',
    nombre: 'KFC Garza Sada Altavista',
    marca: 'KFC',
    direccion: 'Av. Eugenio Garza Sada 3367, Altavista, Distrito Tec, 64840 Monterrey',
    lat: 25.6441427,
    lng: -100.2874192,
    municipio: 'Monterrey',
    placeId: 'ChIJFbeYj7y_YoYRKGhDbdNZo9Y',
    coordenadasVerificadas: true,
    ultimaVerificacion: '2025-01-23',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'alto'
  },

  // ========== WINGSTOP - MONTERREY ==========
  {
    id: 'ws-001',
    nombre: 'Wingstop Paseo Tec',
    marca: 'Wingstop',
    direccion: 'Av. Eugenio Garza Sada 2408, Roma, Distrito Tec, 64700 Monterrey',
    lat: 25.6535872,
    lng: -100.2940755,
    municipio: 'Monterrey',
    placeId: 'ChIJQ_UVY66_YoYRwbZidYRSwqM',
    coordenadasVerificadas: true,
    ultimaVerificacion: '2025-01-23',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'medio',
    enRappi: true,
    enUberEats: true
  },
  {
    id: 'ws-002',
    nombre: 'Wingstop Galerías Monterrey',
    marca: 'Wingstop',
    direccion: 'Galerías Monterrey, Sin Nombre de Col 31, 64620 Monterrey',
    lat: 25.6831823,
    lng: -100.3530425,
    municipio: 'Monterrey',
    placeId: 'ChIJpa-aSgCXYoYRL5MOTEMBTqk',
    coordenadasVerificadas: true,
    ultimaVerificacion: '2025-01-23',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'medio',
    enRappi: true,
    enUberEats: true
  },
  {
    id: 'ws-006',
    nombre: 'Wingstop Galerías Valle Oriente',
    marca: 'Wingstop',
    direccion: 'Av. Fundadores 1001, Valle del Mirador, 64750 Monterrey',
    lat: 25.6374328,
    lng: -100.3144519,
    municipio: 'San Pedro Garza García',
    placeId: 'ChIJ-XJ7ZAC_YoYRuk770jnupa4',
    coordenadasVerificadas: true,
    ultimaVerificacion: '2025-01-23',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'medio'
  },

  // ========== EL POLLO LOCO ==========
  {
    id: 'epl-001',
    nombre: 'El Pollo Loco Garza Sada Mederos',
    marca: 'El Pollo Loco',
    direccion: 'Av Eugenio Garza Sada 6044, Mederos, 64950 Monterrey',
    lat: 25.6081963,
    lng: -100.2702331,
    municipio: 'Monterrey',
    placeId: 'ChIJO6_f9me_YoYR1KnfFg9jVto',
    coordenadasVerificadas: true,
    ultimaVerificacion: '2025-01-23',
    tipoCompetencia: 'indirecta',
    nivelAmenaza: 'medio',
    horario: '10:00-22:00'
  },
  {
    id: 'epl-002',
    nombre: 'El Pollo Loco Pino Suárez Centro',
    marca: 'El Pollo Loco',
    direccion: 'Av. Pino Suárez y 15 de Mayo 500, Centro, 64000 Monterrey',
    lat: 25.6722442,
    lng: -100.3199379,
    municipio: 'Monterrey',
    placeId: 'ChIJffpelCa-YoYRrF_0x1lKOpw',
    coordenadasVerificadas: true,
    ultimaVerificacion: '2025-01-23',
    tipoCompetencia: 'indirecta',
    nivelAmenaza: 'medio'
  },
  {
    id: 'epl-003',
    nombre: 'El Pollo Loco Gonzalitos Leones',
    marca: 'El Pollo Loco',
    direccion: 'Av. Dr. José Eleuterio González 150, Leones, 64600 Monterrey',
    lat: 25.6963536,
    lng: -100.3516118,
    municipio: 'Monterrey',
    placeId: 'ChIJb_rH0-SVYoYR3bDNpFS6geU',
    coordenadasVerificadas: true,
    ultimaVerificacion: '2025-01-23',
    tipoCompetencia: 'indirecta',
    nivelAmenaza: 'medio'
  },
  {
    id: 'epl-005',
    nombre: 'El Pollo Loco Guadalupe Reynosa',
    marca: 'El Pollo Loco',
    direccion: 'Autop. Monterrey - Reynosa Km 10-1320, Jardines de Guadalupe, 67116 Guadalupe',
    lat: 25.6941197,
    lng: -100.1744178,
    municipio: 'Guadalupe',
    placeId: 'ChIJx7XEfQDrYoYRevEv2UWnxxw',
    coordenadasVerificadas: true,
    ultimaVerificacion: '2025-01-23',
    tipoCompetencia: 'indirecta',
    nivelAmenaza: 'medio'
  },
  {
    id: 'epl-006',
    nombre: 'El Pollo Loco San Nicolás Universidad',
    marca: 'El Pollo Loco',
    direccion: 'Avenida Universidad 504, Chapultepec, 66450 San Nicolás de los Garza',
    lat: 25.7441486,
    lng: -100.3007341,
    municipio: 'San Nicolás de los Garza',
    placeId: 'ChIJ14hW7PSUYoYRxKhZSpD-jGQ',
    coordenadasVerificadas: true,
    ultimaVerificacion: '2025-01-23',
    tipoCompetencia: 'indirecta',
    nivelAmenaza: 'medio'
  }
];

// ========== FUNCIONES HELPER ==========

/**
 * Calcula distancia en km entre dos puntos (Haversine)
 */
export function calcularDistanciaKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Obtiene competidores en un radio dado desde un punto
 */
export function getCompetidoresEnRadio(
  lat: number,
  lng: number,
  radioKm: number = 1
): (Competidor & { distanciaKm: number })[] {
  return COMPETIDORES_MTY
    .map(comp => ({
      ...comp,
      distanciaKm: calcularDistanciaKm(lat, lng, comp.lat, comp.lng)
    }))
    .filter(comp => comp.distanciaKm <= radioKm)
    .sort((a, b) => a.distanciaKm - b.distanciaKm);
}

/**
 * Obtiene competidores por marca
 */
export function getCompetidoresPorMarca(marca: MarcaCompetencia): Competidor[] {
  return COMPETIDORES_MTY.filter(c => c.marca === marca);
}

/**
 * Obtiene competidores por municipio
 */
export function getCompetidoresPorMunicipio(municipio: string): Competidor[] {
  return COMPETIDORES_MTY.filter(c => c.municipio === municipio);
}

/**
 * Cuenta competidores por tipo en un radio
 */
export function contarCompetenciaPorTipo(
  lat: number,
  lng: number,
  radioKm: number = 1
): { directa: number; indirecta: number; total: number } {
  const cercanos = getCompetidoresEnRadio(lat, lng, radioKm);
  const directa = cercanos.filter(c => c.tipoCompetencia === 'directa').length;
  const indirecta = cercanos.filter(c => c.tipoCompetencia === 'indirecta').length;
  return { directa, indirecta, total: directa + indirecta };
}

// Colores para markers por marca
export const COLORES_MARCAS: Record<MarcaCompetencia, string> = {
  'KFC': '#E4002B',           // Rojo KFC
  'Wingstop': '#00A651',      // Verde Wingstop
  'El Pollo Loco': '#FF6B00', // Naranja Pollo Loco
  'Church\'s Chicken': '#7B2D26',
  'Pollos Asados': '#8B4513',
  'Buffalo Wild Wings': '#FFB81C',
  'Hooters': '#FF6600',
  'Otro': '#666666'
};
