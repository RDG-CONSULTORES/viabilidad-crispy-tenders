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
    direccion: 'Madero Oriente 4446, Lindavista, 67130',
    lat: 25.6897,
    lng: -100.2456,
    municipio: 'Guadalupe',
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
    direccion: 'Av. Eloy Cavazos 4500, Valle de la Silla, 67180',
    lat: 25.6634,
    lng: -100.2123,
    municipio: 'Guadalupe',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'alto',
    horario: '10:00-22:00',
    enRappi: true,
    enUberEats: true
  },
  {
    id: 'kfc-003',
    nombre: 'KFC Molinete',
    marca: 'KFC',
    direccion: 'Calle Uranio, Kalos',
    lat: 25.7012,
    lng: -100.2345,
    municipio: 'Guadalupe',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'alto',
    horario: '09:30-22:30',
    enRappi: true,
    enUberEats: true
  },
  {
    id: 'kfc-004',
    nombre: 'KFC San Sebastián',
    marca: 'KFC',
    direccion: 'Av. Benito Juárez 413, Los Lermas, 67190',
    lat: 25.6789,
    lng: -100.2234,
    municipio: 'Guadalupe',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'alto',
    horario: '10:00-22:00'
  },
  {
    id: 'kfc-005',
    nombre: 'KFC La Fuente',
    marca: 'KFC',
    direccion: 'Benito Juárez 1501, Col. La Fuente',
    lat: 25.6845,
    lng: -100.2456,
    municipio: 'Guadalupe',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'alto'
  },
  {
    id: 'kfc-006',
    nombre: 'KFC Blvd. Acapulco',
    marca: 'KFC',
    direccion: 'Blvd. Acapulco 206b, Eduardo Caballero, 67110',
    lat: 25.7198,
    lng: -100.2012,
    municipio: 'Guadalupe',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'alto',
    // NOTA: CERCANO A PLAZA 1500 (~0.5km)
  },
  {
    id: 'kfc-007',
    nombre: 'KFC Plaza Sun Mall',
    marca: 'KFC',
    direccion: 'Av Pablo Livas 7601, Roble Santa María',
    lat: 25.7156,
    lng: -100.2234,
    municipio: 'Guadalupe',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'alto'
  },
  {
    id: 'kfc-008',
    nombre: 'KFC Ruiz Cortines',
    marca: 'KFC',
    direccion: 'Av. Ruiz Cortines 150',
    lat: 25.6923,
    lng: -100.2567,
    municipio: 'Guadalupe',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'alto'
  },

  // ========== KFC - MONTERREY ==========
  {
    id: 'kfc-009',
    nombre: 'KFC Gonzalitos',
    marca: 'KFC',
    direccion: 'Av. Gonzalitos, Monterrey',
    lat: 25.6756,
    lng: -100.3423,
    municipio: 'Monterrey',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'alto'
  },
  {
    id: 'kfc-010',
    nombre: 'KFC Constitución',
    marca: 'KFC',
    direccion: 'Av. Constitución, Centro',
    lat: 25.6698,
    lng: -100.3234,
    municipio: 'Monterrey',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'alto'
  },

  // ========== WINGSTOP - MONTERREY ==========
  {
    id: 'ws-001',
    nombre: 'Wingstop Paseo Tec',
    marca: 'Wingstop',
    direccion: 'Paseo Tec, Monterrey',
    lat: 25.6512,
    lng: -100.2890,
    municipio: 'Monterrey',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'medio',
    enRappi: true,
    enUberEats: true
  },
  {
    id: 'ws-002',
    nombre: 'Wingstop Galerías Monterrey',
    marca: 'Wingstop',
    direccion: 'Galerías Monterrey',
    lat: 25.6678,
    lng: -100.3012,
    municipio: 'Monterrey',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'medio',
    enRappi: true,
    enUberEats: true
  },
  {
    id: 'ws-003',
    nombre: 'Wingstop Micropolis',
    marca: 'Wingstop',
    direccion: 'Micropolis, Monterrey',
    lat: 25.6734,
    lng: -100.3145,
    municipio: 'Monterrey',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'medio',
    enRappi: true,
    enUberEats: true
  },
  {
    id: 'ws-004',
    nombre: 'Wingstop San Jerónimo',
    marca: 'Wingstop',
    direccion: 'San Jerónimo, Monterrey',
    lat: 25.6567,
    lng: -100.3567,
    municipio: 'Monterrey',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'medio'
  },
  {
    id: 'ws-005',
    nombre: 'Wingstop Síkara',
    marca: 'Wingstop',
    direccion: 'Síkara, Monterrey',
    lat: 25.6423,
    lng: -100.2789,
    municipio: 'Monterrey',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'medio'
  },
  {
    id: 'ws-006',
    nombre: 'Wingstop Galerías Valle Oriente',
    marca: 'Wingstop',
    direccion: 'Galerías Valle Oriente',
    lat: 25.6534,
    lng: -100.3234,
    municipio: 'San Pedro Garza García',
    tipoCompetencia: 'directa',
    nivelAmenaza: 'medio'
  },

  // ========== EL POLLO LOCO ==========
  {
    id: 'epl-001',
    nombre: 'El Pollo Loco Garza Sada',
    marca: 'El Pollo Loco',
    direccion: 'Av. Eugenio Garza Sada 6044, Mederos, 64950',
    lat: 25.6234,
    lng: -100.2845,
    municipio: 'Monterrey',
    tipoCompetencia: 'indirecta',
    nivelAmenaza: 'medio',
    horario: '10:00-22:00'
  },
  {
    id: 'epl-002',
    nombre: 'El Pollo Loco Madero Centro',
    marca: 'El Pollo Loco',
    direccion: 'Av. Francisco I Madero 1536, Centro, 64000',
    lat: 25.6712,
    lng: -100.3123,
    municipio: 'Monterrey',
    tipoCompetencia: 'indirecta',
    nivelAmenaza: 'medio'
  },
  {
    id: 'epl-003',
    nombre: 'El Pollo Loco Paseo de los Leones',
    marca: 'El Pollo Loco',
    direccion: 'Av. Paseo de los Leones 150, Leones, 64460',
    lat: 25.6890,
    lng: -100.3567,
    municipio: 'Monterrey',
    tipoCompetencia: 'indirecta',
    nivelAmenaza: 'medio'
  },
  {
    id: 'epl-004',
    nombre: 'El Pollo Loco Ruiz Cortines',
    marca: 'El Pollo Loco',
    direccion: 'Av. Ruiz Cortines 5600, Valle de Infonavit, 64350',
    lat: 25.7023,
    lng: -100.2890,
    municipio: 'Monterrey',
    tipoCompetencia: 'indirecta',
    nivelAmenaza: 'medio'
  },
  {
    id: 'epl-005',
    nombre: 'El Pollo Loco Guadalupe Ruiz Cortines',
    marca: 'El Pollo Loco',
    direccion: 'Av. Ruiz Cortines 450, Valle Soleado, 67114',
    lat: 25.6934,
    lng: -100.2567,
    municipio: 'Guadalupe',
    tipoCompetencia: 'indirecta',
    nivelAmenaza: 'medio'
  },
  {
    id: 'epl-006',
    nombre: 'El Pollo Loco San Nicolás Universidad',
    marca: 'El Pollo Loco',
    direccion: 'Av. Universidad 504, Chapultepec, 66450',
    lat: 25.7345,
    lng: -100.2890,
    municipio: 'San Nicolás de los Garza',
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
