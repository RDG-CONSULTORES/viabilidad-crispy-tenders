/**
 * Plazas Comerciales del Área Metropolitana de Monterrey
 * Para análisis de viabilidad de Crispy Tenders
 * Datos actualizados: Enero 2025
 */

export type NivelSocioeconomico = 'A' | 'B' | 'C+' | 'C' | 'D';

export interface FlujoPorDia {
  lunes: number;
  martes: number;
  miercoles: number;
  jueves: number;
  viernes: number;
  sabado: number;
  domingo: number;
}

export interface Plaza {
  id: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  municipio: string;

  // Características físicas
  tiendasAncla: string[];
  superficieM2?: number;
  niveles?: number;
  estacionamientoGratis: boolean;

  // Perfil
  nivelSocioeconomico: NivelSocioeconomico;
  perfilVisitante: string;

  // Flujo estimado (personas/hora en hora pico)
  flujoPeatonalEstimado: FlujoPorDia;
  horasPico: string[];

  // Horarios
  horarioApertura: string;
  horarioCierre: string;

  // Transporte
  cercaMetrorrey: boolean;
  rutasBus: string[];

  // Costos estimados
  rentaEstimadaM2?: number; // MXN/mes

  // Status para Crispy Tenders
  tieneSucursalCT: boolean;
  esPropuesta: boolean;

  // Notas
  notas?: string;
  sitioWeb?: string;
  telefono?: string;
}

export const PLAZAS_MTY: Plaza[] = [
  // ========== PLAZAS CON SUCURSAL CRISPY TENDERS ==========
  {
    id: 'plaza-001',
    nombre: 'Plaza Fiesta San Agustín',
    direccion: 'Av. Diego Rivera 1000, Zona San Agustín, 66260',
    lat: 25.6515,
    lng: -100.3520,
    municipio: 'San Pedro Garza García',
    tiendasAncla: ['Sanborns', 'Soriana', 'Sears'],
    superficieM2: 180000,
    niveles: 2,
    estacionamientoGratis: false,
    nivelSocioeconomico: 'A',
    perfilVisitante: 'Familias nivel alto, turistas, ejecutivos',
    flujoPeatonalEstimado: {
      lunes: 600,
      martes: 650,
      miercoles: 680,
      jueves: 720,
      viernes: 950,
      sabado: 1200,
      domingo: 1000
    },
    horasPico: ['12:00-14:00', '18:00-21:00'],
    horarioApertura: '10:00',
    horarioCierre: '21:00',
    cercaMetrorrey: false,
    rutasBus: ['R-1', 'R-3'],
    rentaEstimadaM2: 800,
    tieneSucursalCT: true,
    esPropuesta: false,
    notas: '3er centro comercial más grande de México. 4 secciones: antigua, nueva, Main Entrance, Fashion Drive',
    sitioWeb: 'https://plaza-fiesta.mx/',
    telefono: '81 8363 0606'
  },
  {
    id: 'plaza-002',
    nombre: 'Plaza Real',
    direccion: 'Gonzalitos 315, Jardines del Cerro, 64050',
    lat: 25.6773,
    lng: -100.3456,
    municipio: 'Monterrey',
    tiendasAncla: ['HEB', 'Office Max', 'Cinemark'],
    estacionamientoGratis: true,
    nivelSocioeconomico: 'C+',
    perfilVisitante: 'Familias clase media, estudiantes',
    flujoPeatonalEstimado: {
      lunes: 450,
      martes: 480,
      miercoles: 500,
      jueves: 550,
      viernes: 700,
      sabado: 900,
      domingo: 750
    },
    horasPico: ['13:00-15:00', '19:00-21:00'],
    horarioApertura: '09:00',
    horarioCierre: '21:00',
    cercaMetrorrey: true, // Estación Edison
    rutasBus: ['013', '201', '218'],
    rentaEstimadaM2: 450,
    tieneSucursalCT: true,
    esPropuesta: false,
    notas: 'Estacionamiento techado gratis. Food court variado. Cerca Metrorrey Edison.',
    sitioWeb: 'https://www.plazarealmty.com/'
  },
  {
    id: 'plaza-003',
    nombre: 'Esfera Centro Comercial',
    direccion: 'Av. La Rioja 245, Residencial la Rioja, 64985',
    lat: 25.6089,
    lng: -100.2785,
    municipio: 'Monterrey',
    tiendasAncla: ['Sears', 'Cinépolis'],
    superficieM2: 237248,
    estacionamientoGratis: false,
    nivelSocioeconomico: 'B',
    perfilVisitante: 'Familias jóvenes, zona sur residencial',
    flujoPeatonalEstimado: {
      lunes: 400,
      martes: 420,
      miercoles: 450,
      jueves: 500,
      viernes: 680,
      sabado: 850,
      domingo: 720
    },
    horasPico: ['12:00-14:00', '18:00-20:00'],
    horarioApertura: '11:00',
    horarioCierre: '21:00',
    cercaMetrorrey: false,
    rutasBus: ['005', '115', '405'],
    rentaEstimadaM2: 550,
    tieneSucursalCT: true,
    esPropuesta: false,
    notas: 'Certificación LEED Silver. Diseño sustentable con ventilación natural.',
    sitioWeb: 'https://citelis.com.mx/life-center/esfera-monterrey/'
  },
  {
    id: 'plaza-004',
    nombre: 'Interplaza Shoptown',
    direccion: 'Morelos Ote 101, Monterrey Antiguo, 64720',
    lat: 25.6681,
    lng: -100.3152,
    municipio: 'Monterrey',
    tiendasAncla: ['Cinépolis', 'Del Sol', 'Parisina'],
    estacionamientoGratis: false,
    nivelSocioeconomico: 'C',
    perfilVisitante: 'Comerciantes, turistas, trabajadores centro',
    flujoPeatonalEstimado: {
      lunes: 550,
      martes: 580,
      miercoles: 600,
      jueves: 620,
      viernes: 750,
      sabado: 500,
      domingo: 350
    },
    horasPico: ['11:00-14:00', '17:00-19:00'],
    horarioApertura: '10:00',
    horarioCierre: '19:00',
    cercaMetrorrey: true, // Línea 2/3
    rutasBus: ['023', '039', '066', '113', '116', '117', '228'],
    rentaEstimadaM2: 350,
    tieneSucursalCT: true,
    esPropuesta: false,
    notas: 'Centro histórico. Artesanías. A 1 min de parada Metrorrey. Alto flujo laboral.',
    sitioWeb: 'https://www.instagram.com/interplaza_shoptown/'
  },

  // ========== PRÓXIMAMENTE ==========
  {
    id: 'plaza-005',
    nombre: 'Paseo La Fe',
    direccion: 'Av. Miguel Alemán 200, Talaverna, 66470',
    lat: 25.7457,
    lng: -100.2589,
    municipio: 'San Nicolás de los Garza',
    tiendasAncla: ['Liverpool', 'H&M', 'Coppel', 'Cinépolis'],
    superficieM2: 174621,
    niveles: 3,
    estacionamientoGratis: false,
    nivelSocioeconomico: 'B',
    perfilVisitante: 'Familias, jóvenes, zona norte residencial',
    flujoPeatonalEstimado: {
      lunes: 500,
      martes: 520,
      miercoles: 550,
      jueves: 600,
      viernes: 800,
      sabado: 1100,
      domingo: 900
    },
    horasPico: ['13:00-15:00', '18:00-21:00'],
    horarioApertura: '11:00',
    horarioCierre: '21:00',
    cercaMetrorrey: false,
    rutasBus: ['R-5', 'R-8'],
    rentaEstimadaM2: 600,
    tieneSucursalCT: false,
    esPropuesta: true, // Próximamente
    notas: 'Lifestyle mall inaugurado 2016. Pull&Bear, Stradivarius. Hotel NH. Junto a La Fe Music Hall.',
    sitioWeb: 'https://www.alteadesarrollos.com/desarrollos/paseo-la-fe/'
  },

  // ========== PROPUESTA PRINCIPAL: PLAZA 1500 ==========
  {
    id: 'plaza-006',
    nombre: 'Plaza 1500',
    direccion: 'Blvd. Acapulco 800, Josefa Zozaya, 67117',
    lat: 25.72253695092629,
    lng: -100.19978784907616,
    municipio: 'Guadalupe',
    tiendasAncla: [], // Por investigar
    estacionamientoGratis: true, // Común en zona
    nivelSocioeconomico: 'C+',
    perfilVisitante: 'Familias zona oriente, trabajadores industriales',
    flujoPeatonalEstimado: {
      lunes: 400,
      martes: 420,
      miercoles: 450,
      jueves: 480,
      viernes: 620,
      sabado: 750,
      domingo: 600
    },
    horasPico: ['12:00-14:00', '18:00-20:00'],
    horarioApertura: '10:00',
    horarioCierre: '21:00',
    cercaMetrorrey: false,
    rutasBus: ['R-Guadalupe'],
    rentaEstimadaM2: 400,
    tieneSucursalCT: false,
    esPropuesta: true, // PROPUESTA DE ANÁLISIS
    notas: 'PROPUESTA PRINCIPAL. Cerca de Plaza Platino y Parque Deportivo Benito Juárez. KFC a ~0.5km en Blvd. Acapulco.',
    telefono: '81 8363 8888'
  },

  // ========== OTRAS PLAZAS POTENCIALES ==========
  {
    id: 'plaza-007',
    nombre: 'Galerías Monterrey',
    direccion: 'Av. Insurgentes 2500, Vista Hermosa',
    lat: 25.6742,
    lng: -100.3234,
    municipio: 'Monterrey',
    tiendasAncla: ['Liverpool', 'Sears', 'H&M', 'Zara'],
    superficieM2: 85000,
    estacionamientoGratis: false,
    nivelSocioeconomico: 'A',
    perfilVisitante: 'Clase alta, ejecutivos, familias',
    flujoPeatonalEstimado: {
      lunes: 700,
      martes: 720,
      miercoles: 750,
      jueves: 800,
      viernes: 1000,
      sabado: 1300,
      domingo: 1100
    },
    horasPico: ['12:00-15:00', '18:00-21:00'],
    horarioApertura: '11:00',
    horarioCierre: '21:00',
    cercaMetrorrey: true,
    rutasBus: ['Múltiples'],
    rentaEstimadaM2: 900,
    tieneSucursalCT: false,
    esPropuesta: false,
    notas: 'Plaza premium. Alto costo de renta pero flujo garantizado.'
  },
  {
    id: 'plaza-008',
    nombre: 'Plaza Sendero Lincoln',
    direccion: 'Av. Lincoln, Monterrey',
    lat: 25.6923,
    lng: -100.3567,
    municipio: 'Monterrey',
    tiendasAncla: ['Soriana', 'Cinépolis'],
    estacionamientoGratis: true,
    nivelSocioeconomico: 'C+',
    perfilVisitante: 'Familias zona norte, clase media',
    flujoPeatonalEstimado: {
      lunes: 480,
      martes: 500,
      miercoles: 520,
      jueves: 560,
      viernes: 700,
      sabado: 880,
      domingo: 750
    },
    horasPico: ['12:00-14:00', '18:00-20:00'],
    horarioApertura: '10:00',
    horarioCierre: '21:00',
    cercaMetrorrey: false,
    rutasBus: ['R-Lincoln'],
    rentaEstimadaM2: 480,
    tieneSucursalCT: false,
    esPropuesta: false,
    notas: 'Buen flujo, costo moderado. Potencial para expansión.'
  }
];

// ========== FUNCIONES HELPER ==========

export const getPlazasConSucursalCT = () =>
  PLAZAS_MTY.filter(p => p.tieneSucursalCT);

export const getPlazasPropuestas = () =>
  PLAZAS_MTY.filter(p => p.esPropuesta);

export const getPlazasSinSucursalCT = () =>
  PLAZAS_MTY.filter(p => !p.tieneSucursalCT && !p.esPropuesta);

export const getPlazaById = (id: string) =>
  PLAZAS_MTY.find(p => p.id === id);

export const getPlazasPorMunicipio = (municipio: string) =>
  PLAZAS_MTY.filter(p => p.municipio === municipio);

export const getPlazasPorNivel = (nivel: NivelSocioeconomico) =>
  PLAZAS_MTY.filter(p => p.nivelSocioeconomico === nivel);

/**
 * Calcula el flujo promedio semanal
 */
export function calcularFlujoPromedio(flujo: FlujoPorDia): number {
  const dias = Object.values(flujo);
  return Math.round(dias.reduce((a, b) => a + b, 0) / dias.length);
}

/**
 * Obtiene el día de mayor flujo
 */
export function getDiaMayorFlujo(flujo: FlujoPorDia): { dia: string; flujo: number } {
  const entries = Object.entries(flujo) as [string, number][];
  const max = entries.reduce((a, b) => a[1] > b[1] ? a : b);
  return { dia: max[0], flujo: max[1] };
}

// Colores por nivel socioeconómico para visualización
export const COLORES_NIVEL: Record<NivelSocioeconomico, string> = {
  'A': '#1E88E5',   // Azul premium
  'B': '#43A047',   // Verde
  'C+': '#FFC107',  // Amarillo
  'C': '#FF9800',   // Naranja
  'D': '#E53935'    // Rojo
};
