/**
 * Plazas Comerciales del Área Metropolitana de Monterrey
 * Para análisis de viabilidad de Crispy Tenders
 *
 * =============================================================================
 * ⚠️ ADVERTENCIA DE CONFIABILIDAD DE DATOS
 * =============================================================================
 * Este archivo contiene datos con DIFERENTES NIVELES DE CONFIANZA:
 *
 * - VERIFICADO: Confirmado con fuente primaria (Google Places, INEGI, campo)
 * - ESTIMADO: Calculado a partir de proxies o suposiciones documentadas
 * - NO_VERIFICADO: Dato sin fuente conocida - NO USAR PARA DECISIONES
 *
 * ANTES de tomar decisiones de inversión, verificar:
 * 1. Flujo peatonal → con BestTime API o conteo de campo
 * 2. NSE → con datos INEGI por AGEB
 * 3. Renta → con cotización directa de administración de plaza
 *
 * Última actualización: Enero 2025
 * =============================================================================
 */

export type NivelSocioeconomico = 'A' | 'B' | 'C+' | 'C' | 'D';
export type NivelConfianza = 'VERIFICADO' | 'ESTIMADO' | 'CALCULADO' | 'NO_VERIFICADO';

export interface FlujoPorDia {
  lunes: number;
  martes: number;
  miercoles: number;
  jueves: number;
  viernes: number;
  sabado: number;
  domingo: number;
}

/**
 * Trazabilidad de un dato específico
 */
export interface DatoTrazable<T> {
  valor: T;
  nivelConfianza: NivelConfianza;
  fuente?: string;           // "besttime_api_2025-01", "conteo_campo_2025-01-15", etc
  fechaVerificacion?: string; // ISO date
  notas?: string;            // Observaciones sobre el dato
}

export interface Plaza {
  id: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  municipio: string;

  // Verificación de coordenadas
  placeId?: string;
  coordenadasVerificadas: boolean;
  fuenteCoordenadas: 'google_places' | 'manual' | 'estimada';

  // Características físicas
  tiendasAncla: string[];
  tiendasAnclaConfianza: NivelConfianza;
  tiendasAnclaFuente?: string;

  superficieM2?: number;
  niveles?: number;
  estacionamientoGratis: boolean;

  // =========================================================================
  // DATOS CON TRAZABILIDAD OBLIGATORIA
  // =========================================================================

  // NSE - Nivel Socioeconómico
  nivelSocioeconomico: NivelSocioeconomico;
  nseConfianza: NivelConfianza;
  nseFuente?: string; // "inegi_ageb_2020", "amai_encuesta", "estimacion_visual"

  perfilVisitante: string;

  // Flujo Peatonal (personas/hora en hora pico)
  // ⚠️ CRÍTICO: Este dato afecta TODAS las proyecciones financieras
  flujoPeatonalEstimado: FlujoPorDia;
  flujoConfianza: NivelConfianza;
  flujoFuente?: string; // "besttime_api_2025-01", "conteo_campo_2025-01-15"
  flujoFechaVerificacion?: string;

  horasPico: string[];

  // Horarios
  horarioApertura: string;
  horarioCierre: string;

  // Transporte
  cercaMetrorrey: boolean;
  rutasBus: string[];

  // Renta
  rentaEstimadaM2?: number; // MXN/mes
  rentaConfianza: NivelConfianza;
  rentaFuente?: string; // "cotizacion_plaza_2025-01", "promedio_zona"

  // =========================================================================

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
    lat: 25.6490463,  // Coordenadas verificadas CT
    lng: -100.3365036,
    municipio: 'San Pedro Garza García',
    placeId: 'ChIJtS9AhhK-YoYRQbH1OTaIHi0',
    coordenadasVerificadas: true,
    fuenteCoordenadas: 'google_places',

    tiendasAncla: ['Sanborns', 'Soriana', 'Sears'],
    tiendasAnclaConfianza: 'VERIFICADO',
    tiendasAnclaFuente: 'google_places_2025-01',

    superficieM2: 180000,
    niveles: 2,
    estacionamientoGratis: false,

    nivelSocioeconomico: 'A',
    nseConfianza: 'ESTIMADO',
    nseFuente: 'clasificacion_visual_zona_san_pedro',

    perfilVisitante: 'Familias nivel alto, turistas, ejecutivos',

    // ⚠️ FLUJO NO VERIFICADO - Requiere BestTime API o conteo campo
    flujoPeatonalEstimado: {
      lunes: 600,
      martes: 650,
      miercoles: 680,
      jueves: 720,
      viernes: 950,
      sabado: 1200,
      domingo: 1000
    },
    flujoConfianza: 'NO_VERIFICADO',
    flujoFuente: 'estimacion_sin_fuente',

    horasPico: ['12:00-14:00', '18:00-21:00'],
    horarioApertura: '10:00',
    horarioCierre: '21:00',
    cercaMetrorrey: false,
    rutasBus: ['R-1', 'R-3'],

    rentaEstimadaM2: 800,
    rentaConfianza: 'NO_VERIFICADO',
    rentaFuente: 'estimacion_sin_cotizacion',

    tieneSucursalCT: true,
    esPropuesta: false,
    notas: '3er centro comercial más grande de México. 4 secciones: antigua, nueva, Main Entrance, Fashion Drive',
    sitioWeb: 'https://plaza-fiesta.mx/',
    telefono: '81 8363 0606'
  },
  {
    id: 'plaza-002',
    nombre: 'Plaza Real',
    direccion: 'Av. Dr. José Eleuterio González 315, Jardines del Cerro, 64060',
    lat: 25.679974,  // Verificado con Google Places
    lng: -100.3504874,
    municipio: 'Monterrey',
    placeId: 'ChIJX-G3RAeWYoYRtnBG2v8SJAU',
    coordenadasVerificadas: true,
    fuenteCoordenadas: 'google_places',

    tiendasAncla: ['HEB', 'Office Max', 'Cinemark'],
    tiendasAnclaConfianza: 'VERIFICADO',
    tiendasAnclaFuente: 'google_places_2025-01',

    estacionamientoGratis: true,

    nivelSocioeconomico: 'C+',
    nseConfianza: 'ESTIMADO',
    nseFuente: 'clasificacion_visual_zona',

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
    flujoConfianza: 'NO_VERIFICADO',
    flujoFuente: 'estimacion_sin_fuente',

    horasPico: ['13:00-15:00', '19:00-21:00'],
    horarioApertura: '09:00',
    horarioCierre: '21:00',
    cercaMetrorrey: true,
    rutasBus: ['013', '201', '218'],

    rentaEstimadaM2: 450,
    rentaConfianza: 'NO_VERIFICADO',
    rentaFuente: 'estimacion_sin_cotizacion',

    tieneSucursalCT: true,
    esPropuesta: false,
    notas: 'Estacionamiento techado gratis. Food court variado. Cerca Metrorrey Edison.',
    sitioWeb: 'https://www.plazarealmty.com/'
  },
  {
    id: 'plaza-003',
    nombre: 'Esfera Centro Comercial',
    direccion: 'Rioja, 64988 Monterrey',
    lat: 25.5780716,  // Verificado con Google Places
    lng: -100.2453283,
    municipio: 'Monterrey',
    placeId: 'ChIJJRyfMjzHYoYRdqvOB0jOoS0',
    coordenadasVerificadas: true,
    fuenteCoordenadas: 'google_places',

    tiendasAncla: ['Sears', 'Cinépolis'],
    tiendasAnclaConfianza: 'VERIFICADO',
    tiendasAnclaFuente: 'google_places_2025-01',

    superficieM2: 237248,
    estacionamientoGratis: false,

    nivelSocioeconomico: 'B',
    nseConfianza: 'ESTIMADO',
    nseFuente: 'clasificacion_visual_zona_sur',

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
    flujoConfianza: 'NO_VERIFICADO',
    flujoFuente: 'estimacion_sin_fuente',

    horasPico: ['12:00-14:00', '18:00-20:00'],
    horarioApertura: '11:00',
    horarioCierre: '21:00',
    cercaMetrorrey: false,
    rutasBus: ['005', '115', '405'],

    rentaEstimadaM2: 550,
    rentaConfianza: 'NO_VERIFICADO',
    rentaFuente: 'estimacion_sin_cotizacion',

    tieneSucursalCT: true,
    esPropuesta: false,
    notas: 'Certificación LEED Silver. Diseño sustentable con ventilación natural.',
    sitioWeb: 'https://citelis.com.mx/life-center/esfera-monterrey/'
  },
  {
    id: 'plaza-004',
    nombre: 'Interplaza Shoptown',
    direccion: 'Av. Benito Juárez 851, Centro, 67100 Guadalupe',
    lat: 25.6681428,  // Verificado con Google Places
    lng: -100.3153728,
    municipio: 'Monterrey',
    placeId: 'ChIJB5WFmJGUYoYRfXa3QQq7YvE',
    coordenadasVerificadas: true,
    fuenteCoordenadas: 'google_places',

    tiendasAncla: ['Cinépolis', 'Del Sol', 'Parisina'],
    tiendasAnclaConfianza: 'ESTIMADO',
    tiendasAnclaFuente: 'busqueda_web',

    estacionamientoGratis: false,

    nivelSocioeconomico: 'C',
    nseConfianza: 'ESTIMADO',
    nseFuente: 'clasificacion_visual_centro',

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
    flujoConfianza: 'NO_VERIFICADO',
    flujoFuente: 'estimacion_sin_fuente',

    horasPico: ['11:00-14:00', '17:00-19:00'],
    horarioApertura: '10:00',
    horarioCierre: '19:00',
    cercaMetrorrey: true,
    rutasBus: ['023', '039', '066', '113', '116', '117', '228'],

    rentaEstimadaM2: 350,
    rentaConfianza: 'NO_VERIFICADO',
    rentaFuente: 'estimacion_sin_cotizacion',

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
    coordenadasVerificadas: false,
    fuenteCoordenadas: 'estimada',

    tiendasAncla: ['Liverpool', 'H&M', 'Coppel', 'Cinépolis'],
    tiendasAnclaConfianza: 'ESTIMADO',
    tiendasAnclaFuente: 'sitio_web_plaza',

    superficieM2: 174621,
    niveles: 3,
    estacionamientoGratis: false,

    nivelSocioeconomico: 'B',
    nseConfianza: 'ESTIMADO',
    nseFuente: 'clasificacion_visual_zona_norte',

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
    flujoConfianza: 'NO_VERIFICADO',
    flujoFuente: 'estimacion_sin_fuente',

    horasPico: ['13:00-15:00', '18:00-21:00'],
    horarioApertura: '11:00',
    horarioCierre: '21:00',
    cercaMetrorrey: false,
    rutasBus: ['R-5', 'R-8'],

    rentaEstimadaM2: 600,
    rentaConfianza: 'NO_VERIFICADO',
    rentaFuente: 'estimacion_sin_cotizacion',

    tieneSucursalCT: false,
    esPropuesta: true,
    notas: 'Lifestyle mall inaugurado 2016. Pull&Bear, Stradivarius. Hotel NH. Junto a La Fe Music Hall.',
    sitioWeb: 'https://www.alteadesarrollos.com/desarrollos/paseo-la-fe/'
  },

  // ========== PROPUESTA PRINCIPAL: PLAZA 1500 ==========
  {
    id: 'plaza-006',
    nombre: 'Plaza 1500',
    direccion: 'Local 30, Blvd. Acapulco 800, Josefa Zozaya, 67117',
    lat: 25.7223823,  // Verificado con Google Places
    lng: -100.1998254,
    municipio: 'Guadalupe',
    placeId: 'ChIJF0_wkk7qYoYRr11-I50dBek',
    coordenadasVerificadas: true,
    fuenteCoordenadas: 'google_places',

    tiendasAncla: [],
    tiendasAnclaConfianza: 'NO_VERIFICADO',
    tiendasAnclaFuente: 'pendiente_verificacion_campo',

    estacionamientoGratis: true,

    nivelSocioeconomico: 'C+',
    nseConfianza: 'ESTIMADO',
    nseFuente: 'clasificacion_visual_zona_guadalupe',

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
    flujoConfianza: 'NO_VERIFICADO',
    flujoFuente: 'estimacion_sin_fuente',

    horasPico: ['12:00-14:00', '18:00-20:00'],
    horarioApertura: '10:00',
    horarioCierre: '21:00',
    cercaMetrorrey: false,
    rutasBus: ['R-Guadalupe'],

    rentaEstimadaM2: 400,
    rentaConfianza: 'NO_VERIFICADO',
    rentaFuente: 'estimacion_sin_cotizacion',

    tieneSucursalCT: false,
    esPropuesta: true,
    notas: '⚠️ PROPUESTA - TODOS LOS DATOS REQUIEREN VERIFICACIÓN. Cerca de Plaza Platino y Parque Deportivo Benito Juárez. KFC a ~0.5km en Blvd. Acapulco.',
    telefono: '81 8363 8888'
  },

  // ========== OTRAS PLAZAS POTENCIALES ==========
  {
    id: 'plaza-007',
    nombre: 'Galerías Monterrey',
    direccion: 'Av. Insurgentes 2500, Vista Hermosa, 64620',
    lat: 25.6831823,  // Coordenadas de Wingstop verificado en plaza
    lng: -100.3530425,
    municipio: 'Monterrey',
    coordenadasVerificadas: false,
    fuenteCoordenadas: 'estimada',

    tiendasAncla: ['Liverpool', 'Sears', 'H&M', 'Zara'],
    tiendasAnclaConfianza: 'VERIFICADO',
    tiendasAnclaFuente: 'google_places_2025-01',

    superficieM2: 85000,
    estacionamientoGratis: false,

    nivelSocioeconomico: 'A',
    nseConfianza: 'VERIFICADO',
    nseFuente: 'conocimiento_publico_plaza_premium',

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
    flujoConfianza: 'NO_VERIFICADO',
    flujoFuente: 'estimacion_sin_fuente',

    horasPico: ['12:00-15:00', '18:00-21:00'],
    horarioApertura: '11:00',
    horarioCierre: '21:00',
    cercaMetrorrey: true,
    rutasBus: ['Múltiples'],

    rentaEstimadaM2: 900,
    rentaConfianza: 'NO_VERIFICADO',
    rentaFuente: 'estimacion_plaza_premium',

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
    coordenadasVerificadas: false,
    fuenteCoordenadas: 'estimada',

    tiendasAncla: ['Soriana', 'Cinépolis'],
    tiendasAnclaConfianza: 'ESTIMADO',
    tiendasAnclaFuente: 'busqueda_web',

    estacionamientoGratis: true,

    nivelSocioeconomico: 'C+',
    nseConfianza: 'ESTIMADO',
    nseFuente: 'clasificacion_visual_zona',

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
    flujoConfianza: 'NO_VERIFICADO',
    flujoFuente: 'estimacion_sin_fuente',

    horasPico: ['12:00-14:00', '18:00-20:00'],
    horarioApertura: '10:00',
    horarioCierre: '21:00',
    cercaMetrorrey: false,
    rutasBus: ['R-Lincoln'],

    rentaEstimadaM2: 480,
    rentaConfianza: 'NO_VERIFICADO',
    rentaFuente: 'estimacion_sin_cotizacion',

    tieneSucursalCT: false,
    esPropuesta: false,
    notas: 'Buen flujo, costo moderado. Potencial para expansión.'
  },

  // ========== PROPUESTA: PLAZA ANDENES UNIVERSIDAD ==========
  {
    id: 'plaza-009',
    nombre: 'Plaza Andenes Universidad',
    direccion: 'Av. Universidad 1250, Col. Anáhuac, 66450',
    lat: 25.7441,
    lng: -100.3010,
    municipio: 'San Nicolás de los Garza',
    coordenadasVerificadas: false,
    fuenteCoordenadas: 'estimada',

    tiendasAncla: ['Locales comerciales variados'],
    tiendasAnclaConfianza: 'NO_VERIFICADO',
    tiendasAnclaFuente: 'pendiente_verificacion',

    superficieM2: 8000,
    niveles: 2,
    estacionamientoGratis: true,

    nivelSocioeconomico: 'C+',
    nseConfianza: 'ESTIMADO',
    nseFuente: 'clasificacion_visual_zona_universitaria',

    perfilVisitante: 'Estudiantes universitarios, familias zona norte, trabajadores',

    flujoPeatonalEstimado: {
      lunes: 550,
      martes: 580,
      miercoles: 600,
      jueves: 620,
      viernes: 780,
      sabado: 700,
      domingo: 500
    },
    flujoConfianza: 'NO_VERIFICADO',
    flujoFuente: 'estimacion_sin_fuente',

    horasPico: ['12:00-14:00', '18:00-20:00'],
    horarioApertura: '10:00',
    horarioCierre: '21:00',
    cercaMetrorrey: false,
    rutasBus: ['064', '088', '209', '213', '221', '232', 'SNB'],

    rentaEstimadaM2: 380,
    rentaConfianza: 'NO_VERIFICADO',
    rentaFuente: 'estimacion_sin_cotizacion',

    tieneSucursalCT: false,
    esPropuesta: true,
    notas: '⚠️ PROPUESTA - DATOS NO VERIFICADOS. Zona universitaria con alto flujo estudiantil. Requiere validación de campo.',
    sitioWeb: 'https://www.behome.mx/propiedad/plaza-andenes-ave-universidad-san-nicolas-nl-2/'
  },

  // ========== PROPUESTA: ALAIA CUMBRES CENTER (NUEVO 2025) ==========
  {
    id: 'plaza-010',
    nombre: 'Alaia Cumbres Center',
    direccion: 'Av. Paseo de Los Leones #500, Col. Cumbres 4 Sector, 64349',
    lat: 25.7245,
    lng: -100.4412,
    municipio: 'Monterrey',
    coordenadasVerificadas: false,
    fuenteCoordenadas: 'estimada',

    tiendasAncla: ['Food Court', 'Locales comerciales premium'],
    tiendasAnclaConfianza: 'ESTIMADO',
    tiendasAnclaFuente: 'sitio_web_desarrollador',

    superficieM2: 45000,
    niveles: 5,
    estacionamientoGratis: false,

    nivelSocioeconomico: 'B',
    nseConfianza: 'ESTIMADO',
    nseFuente: 'clasificacion_visual_zona_cumbres',

    perfilVisitante: 'Residentes Cumbres, familias jóvenes profesionistas, clase media-alta',

    flujoPeatonalEstimado: {
      lunes: 450,
      martes: 480,
      miercoles: 500,
      jueves: 550,
      viernes: 750,
      sabado: 950,
      domingo: 800
    },
    flujoConfianza: 'NO_VERIFICADO',
    flujoFuente: 'estimacion_plaza_nueva_sin_datos',

    horasPico: ['12:00-14:00', '18:00-21:00'],
    horarioApertura: '10:00',
    horarioCierre: '21:00',
    cercaMetrorrey: false,
    rutasBus: ['Rutas Cumbres', 'Periférico'],

    rentaEstimadaM2: 650,
    rentaConfianza: 'NO_VERIFICADO',
    rentaFuente: 'estimacion_plaza_nueva',

    tieneSucursalCT: false,
    esPropuesta: true,
    notas: '⚠️ PROPUESTA - Plaza nueva apertura Feb 2025. TODOS LOS DATOS SON ESTIMACIONES. Requiere verificación post-apertura.',
    sitioWeb: 'https://quantiumdesarrollos.com/desarrollos/alaia-cumbres-center-monterrey/'
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
