/**
 * Zonas del Área Metropolitana de Monterrey - Cobertura Completa
 *
 * Expandido para incluir:
 * - Sur de Monterrey
 * - Juárez
 * - García (crecimiento)
 * - General Zuazua
 * - Pesquería
 * - Santiago (turístico)
 */

export interface ZonaEscaneo {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  municipio: string;
  prioridad: 1 | 2 | 3;  // 1 = alta, 3 = baja
  nseEstimado: 'A' | 'B' | 'C+' | 'C' | 'D';
  descripcion: string;
  poblacionEstimada?: number;
}

export const ZONAS_AMM: ZonaEscaneo[] = [
  // ========== SAN PEDRO GARZA GARCÍA (NSE Alto) ==========
  {
    id: 'spgg-centro',
    nombre: 'San Pedro Centro',
    lat: 25.6574,
    lng: -100.4023,
    municipio: 'San Pedro Garza García',
    prioridad: 1,
    nseEstimado: 'A',
    descripcion: 'Zona premium, Valle, Chipinque',
  },
  {
    id: 'spgg-valle-oriente',
    nombre: 'Valle Oriente',
    lat: 25.6489,
    lng: -100.3693,
    municipio: 'San Pedro Garza García',
    prioridad: 1,
    nseEstimado: 'A',
    descripcion: 'Galerías Valle Oriente, corporativos',
  },
  {
    id: 'spgg-del-valle',
    nombre: 'Del Valle',
    lat: 25.6523,
    lng: -100.3356,
    municipio: 'San Pedro Garza García',
    prioridad: 1,
    nseEstimado: 'A',
    descripcion: 'Zona residencial premium',
  },

  // ========== MONTERREY NORTE/PONIENTE ==========
  {
    id: 'mty-cumbres-1',
    nombre: 'Cumbres 1er Sector',
    lat: 25.7350,
    lng: -100.4450,
    municipio: 'Monterrey',
    prioridad: 1,
    nseEstimado: 'B',
    descripcion: 'Zona familiar, Alaia Center',
  },
  {
    id: 'mty-cumbres-2',
    nombre: 'Cumbres 2-4 Sector',
    lat: 25.7500,
    lng: -100.4200,
    municipio: 'Monterrey',
    prioridad: 2,
    nseEstimado: 'B',
    descripcion: 'Zona residencial consolidada',
  },
  {
    id: 'mty-mitras',
    nombre: 'Mitras Centro',
    lat: 25.6950,
    lng: -100.3550,
    municipio: 'Monterrey',
    prioridad: 2,
    nseEstimado: 'C+',
    descripcion: 'Zona comercial tradicional',
  },
  {
    id: 'mty-linda-vista',
    nombre: 'Linda Vista',
    lat: 25.7150,
    lng: -100.3650,
    municipio: 'Monterrey',
    prioridad: 2,
    nseEstimado: 'C+',
    descripcion: 'Cerca de Parque Fundidora',
  },

  // ========== MONTERREY CENTRO ==========
  {
    id: 'mty-centro',
    nombre: 'Centro Monterrey',
    lat: 25.6866,
    lng: -100.3161,
    municipio: 'Monterrey',
    prioridad: 2,
    nseEstimado: 'C+',
    descripcion: 'Centro histórico, alto tráfico',
  },
  {
    id: 'mty-tecnologico',
    nombre: 'Tecnológico',
    lat: 25.6512,
    lng: -100.2890,
    municipio: 'Monterrey',
    prioridad: 1,
    nseEstimado: 'B',
    descripcion: 'Zona Tec de Monterrey, jóvenes',
  },

  // ========== MONTERREY SUR (NUEVO - Expandido) ==========
  {
    id: 'mty-contry',
    nombre: 'Contry',
    lat: 25.6350,
    lng: -100.3150,
    municipio: 'Monterrey',
    prioridad: 2,
    nseEstimado: 'B',
    descripcion: 'Zona residencial establecida',
  },
  {
    id: 'mty-carretera-nacional',
    nombre: 'Carretera Nacional',
    lat: 25.6150,
    lng: -100.2850,
    municipio: 'Monterrey',
    prioridad: 2,
    nseEstimado: 'B',
    descripcion: 'Corredor comercial sur',
  },
  {
    id: 'mty-estanzuela',
    nombre: 'La Estanzuela',
    lat: 25.5950,
    lng: -100.2700,
    municipio: 'Monterrey',
    prioridad: 2,
    nseEstimado: 'A',
    descripcion: 'Zona residencial premium sur',
  },
  {
    id: 'mty-satelite',
    nombre: 'Satélite',
    lat: 25.6200,
    lng: -100.2500,
    municipio: 'Monterrey',
    prioridad: 3,
    nseEstimado: 'C+',
    descripcion: 'Zona residencial clase media',
  },
  {
    id: 'mty-independencia',
    nombre: 'Independencia',
    lat: 25.6400,
    lng: -100.2600,
    municipio: 'Monterrey',
    prioridad: 3,
    nseEstimado: 'C',
    descripcion: 'Zona popular sur',
  },

  // ========== SAN NICOLÁS DE LOS GARZA ==========
  {
    id: 'sn-centro',
    nombre: 'San Nicolás Centro',
    lat: 25.7441,
    lng: -100.2836,
    municipio: 'San Nicolás de los Garza',
    prioridad: 1,
    nseEstimado: 'C+',
    descripcion: 'Centro comercial, Universidad',
  },
  {
    id: 'sn-anahuac',
    nombre: 'Anáhuac',
    lat: 25.7441,
    lng: -100.3010,
    municipio: 'San Nicolás de los Garza',
    prioridad: 2,
    nseEstimado: 'C+',
    descripcion: 'Zona UANL',
  },
  {
    id: 'sn-norte',
    nombre: 'San Nicolás Norte',
    lat: 25.7600,
    lng: -100.2700,
    municipio: 'San Nicolás de los Garza',
    prioridad: 2,
    nseEstimado: 'C+',
    descripcion: 'Paseo La Fe',
  },
  {
    id: 'sn-casa-bella',
    nombre: 'Casa Bella',
    lat: 25.7700,
    lng: -100.2500,
    municipio: 'San Nicolás de los Garza',
    prioridad: 3,
    nseEstimado: 'C',
    descripcion: 'Zona residencial norte',
  },

  // ========== GUADALUPE ==========
  {
    id: 'gpe-centro',
    nombre: 'Guadalupe Centro',
    lat: 25.6772,
    lng: -100.2557,
    municipio: 'Guadalupe',
    prioridad: 2,
    nseEstimado: 'C+',
    descripcion: 'Centro municipal',
  },
  {
    id: 'gpe-linda-vista',
    nombre: 'Guadalupe Linda Vista',
    lat: 25.6897,
    lng: -100.2456,
    municipio: 'Guadalupe',
    prioridad: 2,
    nseEstimado: 'C+',
    descripcion: 'Zona comercial',
  },
  {
    id: 'gpe-oriente',
    nombre: 'Guadalupe Oriente',
    lat: 25.6900,
    lng: -100.2100,
    municipio: 'Guadalupe',
    prioridad: 3,
    nseEstimado: 'C',
    descripcion: 'Zona en crecimiento',
  },
  {
    id: 'gpe-sur',
    nombre: 'Guadalupe Sur',
    lat: 25.6500,
    lng: -100.2300,
    municipio: 'Guadalupe',
    prioridad: 3,
    nseEstimado: 'C',
    descripcion: 'Valle de la Silla',
  },
  {
    id: 'gpe-expo',
    nombre: 'Guadalupe Expo',
    lat: 25.6634,
    lng: -100.2123,
    municipio: 'Guadalupe',
    prioridad: 2,
    nseEstimado: 'C+',
    descripcion: 'Cerca de Parque Fundidora',
  },

  // ========== APODACA (Expandido) ==========
  {
    id: 'apo-centro',
    nombre: 'Apodaca Centro',
    lat: 25.7815,
    lng: -100.1836,
    municipio: 'Apodaca',
    prioridad: 2,
    nseEstimado: 'C',
    descripcion: 'Centro tradicional',
  },
  {
    id: 'apo-huinala',
    nombre: 'Huinalá',
    lat: 25.7900,
    lng: -100.1500,
    municipio: 'Apodaca',
    prioridad: 3,
    nseEstimado: 'C',
    descripcion: 'Zona industrial/residencial',
  },
  {
    id: 'apo-metroplex',
    nombre: 'Metroplex',
    lat: 25.7700,
    lng: -100.2000,
    municipio: 'Apodaca',
    prioridad: 2,
    nseEstimado: 'C+',
    descripcion: 'Zona comercial nueva',
  },
  {
    id: 'apo-concordia',
    nombre: 'Concordia',
    lat: 25.8000,
    lng: -100.1700,
    municipio: 'Apodaca',
    prioridad: 3,
    nseEstimado: 'C',
    descripcion: 'Desarrollo habitacional',
  },

  // ========== ESCOBEDO (Expandido) ==========
  {
    id: 'esc-centro',
    nombre: 'Escobedo Centro',
    lat: 25.7981,
    lng: -100.3401,
    municipio: 'General Escobedo',
    prioridad: 2,
    nseEstimado: 'C',
    descripcion: 'Centro municipal',
  },
  {
    id: 'esc-nexxus',
    nombre: 'Nexxus',
    lat: 25.8200,
    lng: -100.3200,
    municipio: 'General Escobedo',
    prioridad: 3,
    nseEstimado: 'C',
    descripcion: 'Zona industrial',
  },
  {
    id: 'esc-privadas',
    nombre: 'Escobedo Privadas',
    lat: 25.8100,
    lng: -100.3600,
    municipio: 'General Escobedo',
    prioridad: 3,
    nseEstimado: 'C+',
    descripcion: 'Desarrollos nuevos',
  },

  // ========== SANTA CATARINA ==========
  {
    id: 'sc-centro',
    nombre: 'Santa Catarina Centro',
    lat: 25.6733,
    lng: -100.4584,
    municipio: 'Santa Catarina',
    prioridad: 2,
    nseEstimado: 'C',
    descripcion: 'Centro tradicional',
  },
  {
    id: 'sc-la-fama',
    nombre: 'La Fama',
    lat: 25.6600,
    lng: -100.4800,
    municipio: 'Santa Catarina',
    prioridad: 3,
    nseEstimado: 'C',
    descripcion: 'Zona en crecimiento',
  },
  {
    id: 'sc-nuevo-sur',
    nombre: 'Santa Catarina Nuevo Sur',
    lat: 25.6400,
    lng: -100.4600,
    municipio: 'Santa Catarina',
    prioridad: 3,
    nseEstimado: 'C+',
    descripcion: 'Desarrollos residenciales',
  },

  // ========== GARCÍA (Crecimiento acelerado) ==========
  {
    id: 'garcia-centro',
    nombre: 'García Centro',
    lat: 25.8078,
    lng: -100.5186,
    municipio: 'García',
    prioridad: 3,
    nseEstimado: 'C',
    descripcion: 'Centro tradicional',
  },
  {
    id: 'garcia-sendero',
    nombre: 'Sendero García',
    lat: 25.8300,
    lng: -100.5500,
    municipio: 'García',
    prioridad: 3,
    nseEstimado: 'C',
    descripcion: 'Desarrollos masivos nuevos',
  },

  // ========== JUÁREZ (NUEVO - Población 400K+) ==========
  {
    id: 'juarez-centro',
    nombre: 'Juárez Centro',
    lat: 25.6475,
    lng: -100.0947,
    municipio: 'Juárez',
    prioridad: 2,
    nseEstimado: 'C',
    descripcion: 'Centro municipal, alta densidad',
    poblacionEstimada: 420000,
  },
  {
    id: 'juarez-las-americas',
    nombre: 'Las Américas',
    lat: 25.6600,
    lng: -100.0700,
    municipio: 'Juárez',
    prioridad: 3,
    nseEstimado: 'C',
    descripcion: 'Zona residencial',
  },
  {
    id: 'juarez-cadereyta-road',
    nombre: 'Corredor Juárez-Cadereyta',
    lat: 25.6300,
    lng: -100.0500,
    municipio: 'Juárez',
    prioridad: 3,
    nseEstimado: 'C',
    descripcion: 'Corredor comercial',
  },

  // ========== GENERAL ZUAZUA (Crecimiento explosivo) ==========
  {
    id: 'zuazua-centro',
    nombre: 'Zuazua Centro',
    lat: 25.8750,
    lng: -100.1167,
    municipio: 'General Zuazua',
    prioridad: 3,
    nseEstimado: 'C',
    descripcion: 'Crecimiento acelerado, desarrollos nuevos',
  },

  // ========== PESQUERÍA (Crecimiento) ==========
  {
    id: 'pesqueria-centro',
    nombre: 'Pesquería Centro',
    lat: 25.7639,
    lng: -100.0508,
    municipio: 'Pesquería',
    prioridad: 3,
    nseEstimado: 'C',
    descripcion: 'Zona industrial/residencial en crecimiento',
  },

  // ========== CADEREYTA (NUEVO) ==========
  {
    id: 'cadereyta-centro',
    nombre: 'Cadereyta Centro',
    lat: 25.5864,
    lng: -99.9836,
    municipio: 'Cadereyta Jiménez',
    prioridad: 3,
    nseEstimado: 'C',
    descripcion: 'Zona industrial PEMEX',
  },

  // ========== SANTIAGO (Turístico) ==========
  {
    id: 'santiago-centro',
    nombre: 'Santiago Centro',
    lat: 25.4264,
    lng: -100.1503,
    municipio: 'Santiago',
    prioridad: 3,
    nseEstimado: 'C+',
    descripcion: 'Pueblo mágico, turismo',
  },
];

// Función para filtrar zonas por municipio
export function getZonasPorMunicipio(municipio: string): ZonaEscaneo[] {
  return ZONAS_AMM.filter(z => z.municipio === municipio);
}

// Función para filtrar zonas por NSE mínimo
export function getZonasPorNSE(nseMinimo: string): ZonaEscaneo[] {
  const orden = { 'A': 5, 'B': 4, 'C+': 3, 'C': 2, 'D': 1 };
  const minOrden = orden[nseMinimo as keyof typeof orden] || 2;
  return ZONAS_AMM.filter(z => (orden[z.nseEstimado] || 2) >= minOrden);
}

// Función para filtrar zonas por prioridad
export function getZonasPorPrioridad(maxPrioridad: 1 | 2 | 3): ZonaEscaneo[] {
  return ZONAS_AMM.filter(z => z.prioridad <= maxPrioridad);
}

// Lista de municipios únicos
export const MUNICIPIOS_AMM = [
  'San Pedro Garza García',
  'Monterrey',
  'San Nicolás de los Garza',
  'Guadalupe',
  'Apodaca',
  'General Escobedo',
  'Santa Catarina',
  'García',
  'Juárez',
  'General Zuazua',
  'Pesquería',
  'Cadereyta Jiménez',
  'Santiago',
];

// Estimaciones de renta por municipio
export const RENTA_ESTIMADA_POR_MUNICIPIO: Record<string, { min: number; max: number; promedio: number }> = {
  'San Pedro Garza García': { min: 45000, max: 80000, promedio: 55000 },
  'Monterrey': { min: 25000, max: 50000, promedio: 35000 },
  'San Nicolás de los Garza': { min: 20000, max: 40000, promedio: 28000 },
  'Guadalupe': { min: 18000, max: 35000, promedio: 25000 },
  'Apodaca': { min: 15000, max: 30000, promedio: 22000 },
  'General Escobedo': { min: 15000, max: 30000, promedio: 20000 },
  'Santa Catarina': { min: 15000, max: 30000, promedio: 22000 },
  'García': { min: 12000, max: 25000, promedio: 18000 },
  'Juárez': { min: 12000, max: 25000, promedio: 18000 },
  'General Zuazua': { min: 10000, max: 20000, promedio: 15000 },
  'Pesquería': { min: 10000, max: 20000, promedio: 15000 },
  'Cadereyta Jiménez': { min: 10000, max: 20000, promedio: 15000 },
  'Santiago': { min: 15000, max: 30000, promedio: 20000 },
};
