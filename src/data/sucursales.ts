/**
 * Sucursales de Crispy Tenders
 * Datos actualizados: Enero 2025
 *
 * IMPORTANTE: Las coordenadas requieren verificación con Google Maps
 * El campo 'coordenadasVerificadas' indica si han sido validadas
 */

export interface Sucursal {
  id: string;
  nombre: string;
  plaza: string;
  direccion: string;
  lat: number;
  lng: number;
  municipio: string;
  status: 'operando' | 'proximamente' | 'propuesta';

  // Verificación de datos
  coordenadasVerificadas: boolean;
  fuenteCoordenadas: 'google_places' | 'manual' | 'estimada';
  ultimaVerificacion?: string;
  placeId?: string; // Google Places ID si está verificado

  // Métricas de negocio
  ticketPromedio: number;
  inversionInicial?: number;

  // Horarios
  horarioApertura: string;
  horarioCierre: string;
  diasOperacion: string[];

  // Metadata
  fechaApertura?: string;
  notas?: string;
}

export const SUCURSALES_CRISPY_TENDERS: Sucursal[] = [
  {
    id: 'ct-001',
    nombre: 'Crispy Tenders Plaza Fiesta San Agustín',
    plaza: 'Plaza Fiesta San Agustín',
    direccion: 'Av. Diego Rivera 1000, Zona San Agustín, 66260',
    lat: 25.6519,
    lng: -100.3528,
    municipio: 'San Pedro Garza García',
    status: 'operando',
    coordenadasVerificadas: false,
    fuenteCoordenadas: 'estimada',
    ticketPromedio: 200,
    horarioApertura: '11:00',
    horarioCierre: '21:00',
    diasOperacion: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    notas: 'Plaza premium, alto flujo, tiendas ancla: Sanborns, Soriana, Sears. COORDENADAS REQUIEREN VERIFICACIÓN.'
  },
  {
    id: 'ct-002',
    nombre: 'Crispy Tenders Plaza México',
    plaza: 'Plaza México',
    direccion: 'Centro, Monterrey',
    lat: 25.6695,
    lng: -100.3090,
    municipio: 'Monterrey',
    status: 'operando',
    coordenadasVerificadas: false,
    fuenteCoordenadas: 'estimada',
    ticketPromedio: 180,
    horarioApertura: '10:00',
    horarioCierre: '20:00',
    diasOperacion: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    notas: 'Zona centro, alto tráfico peatonal. COORDENADAS REQUIEREN VERIFICACIÓN.'
  },
  {
    id: 'ct-003',
    nombre: 'Crispy Tenders Interplaza Shoptown',
    plaza: 'Interplaza Shoptown',
    direccion: 'Morelos Ote 101, Monterrey Antiguo, 64720',
    lat: 25.6681,
    lng: -100.3152,
    municipio: 'Monterrey',
    status: 'operando',
    coordenadasVerificadas: false,
    fuenteCoordenadas: 'estimada',
    ticketPromedio: 175,
    horarioApertura: '10:00',
    horarioCierre: '19:00',
    diasOperacion: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    notas: 'Centro histórico, artesanías, cerca de Metrorrey L2/L3. COORDENADAS REQUIEREN VERIFICACIÓN.'
  },
  {
    id: 'ct-004',
    nombre: 'Crispy Tenders Plaza Real',
    plaza: 'Plaza Real',
    direccion: 'Gonzalitos 315, Jardines del Cerro, 64050',
    lat: 25.6773,
    lng: -100.3456,
    municipio: 'Monterrey',
    status: 'operando',
    coordenadasVerificadas: false,
    fuenteCoordenadas: 'estimada',
    ticketPromedio: 190,
    horarioApertura: '10:00',
    horarioCierre: '21:00',
    diasOperacion: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    notas: 'HEB, Office Max, Cinemark, estacionamiento gratis. COORDENADAS REQUIEREN VERIFICACIÓN.'
  },
  {
    id: 'ct-005',
    nombre: 'Crispy Tenders Esfera Park',
    plaza: 'Esfera Centro Comercial',
    direccion: 'Av. La Rioja 245, Residencial la Rioja, 64985',
    lat: 25.6089,
    lng: -100.2785,
    municipio: 'Monterrey',
    status: 'operando',
    coordenadasVerificadas: false,
    fuenteCoordenadas: 'estimada',
    ticketPromedio: 210,
    horarioApertura: '11:00',
    horarioCierre: '21:00',
    diasOperacion: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    notas: 'Plaza certificación LEED Silver, Sears nueva generación, Cinépolis. COORDENADAS REQUIEREN VERIFICACIÓN.'
  },
  {
    id: 'ct-006',
    nombre: 'Crispy Tenders Revolución',
    plaza: 'Local Av. Revolución',
    direccion: 'Revolución 3532, La Primavera',
    lat: 25.6701,
    lng: -100.3380,
    municipio: 'Monterrey',
    status: 'operando',
    coordenadasVerificadas: false,
    fuenteCoordenadas: 'estimada',
    ticketPromedio: 185,
    horarioApertura: '14:00',
    horarioCierre: '22:00',
    diasOperacion: ['Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    notas: 'Local independiente, horario vespertino. COORDENADAS REQUIEREN VERIFICACIÓN.'
  },
  {
    id: 'ct-007',
    nombre: 'Crispy Tenders Centro Morelos',
    plaza: 'Local Centro',
    direccion: 'José María Morelos 385A, Centro, 64000',
    lat: 25.6675,
    lng: -100.3132,
    municipio: 'Monterrey',
    status: 'operando',
    coordenadasVerificadas: false,
    fuenteCoordenadas: 'estimada',
    ticketPromedio: 175,
    horarioApertura: '10:30',
    horarioCierre: '19:30',
    diasOperacion: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    notas: 'Centro histórico, delivery Rappi/UberEats. COORDENADAS REQUIEREN VERIFICACIÓN.'
  },
  {
    id: 'ct-008',
    nombre: 'Crispy Tenders Sun Mall',
    plaza: 'Sun Mall Guadalupe',
    direccion: 'Av. Pablo Livas 7601, Rincón de Guadalupe, 67190',
    lat: 25.657412,
    lng: -100.184647,
    municipio: 'Guadalupe',
    status: 'operando',
    coordenadasVerificadas: false,
    fuenteCoordenadas: 'estimada',
    ticketPromedio: 190,
    horarioApertura: '10:00',
    horarioCierre: '20:00',
    diasOperacion: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    notas: 'Plaza Sun Mall, zona oriente Guadalupe. COORDENADAS REQUIEREN VERIFICACIÓN.'
  },

  // Próximamente
  {
    id: 'ct-009',
    nombre: 'Crispy Tenders Paseo La Fe',
    plaza: 'Paseo La Fe',
    direccion: 'Av. Miguel Alemán 200, Talaverna, 66470',
    lat: 25.7457,
    lng: -100.2589,
    municipio: 'San Nicolás de los Garza',
    status: 'proximamente',
    coordenadasVerificadas: false,
    fuenteCoordenadas: 'estimada',
    ticketPromedio: 200,
    horarioApertura: '11:00',
    horarioCierre: '21:00',
    diasOperacion: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    notas: 'Lifestyle mall, Liverpool, H&M, Coppel, Cinépolis. Apertura próxima. COORDENADAS REQUIEREN VERIFICACIÓN.'
  },

  // Propuestas
  {
    id: 'ct-010',
    nombre: 'Crispy Tenders Plaza 1500',
    plaza: 'Plaza 1500',
    direccion: 'Blvd. Acapulco 800, Josefa Zozaya, 67117',
    lat: 25.7231,
    lng: -100.2005,
    municipio: 'Guadalupe',
    status: 'propuesta',
    coordenadasVerificadas: false,
    fuenteCoordenadas: 'estimada',
    ticketPromedio: 195,
    inversionInicial: 800000,
    horarioApertura: '10:00',
    horarioCierre: '21:00',
    diasOperacion: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    notas: 'PROPUESTA DE ANÁLISIS - Cerca de Plaza Platino y Parque Deportivo Benito Juárez. COORDENADAS REQUIEREN VERIFICACIÓN.'
  },
  {
    id: 'ct-011',
    nombre: 'Crispy Tenders Plaza Andenes Universidad',
    plaza: 'Plaza Andenes Universidad',
    direccion: 'Av. Universidad 1250, Col. Anáhuac, 66450',
    lat: 25.7441,
    lng: -100.3010,
    municipio: 'San Nicolás de los Garza',
    status: 'propuesta',
    coordenadasVerificadas: false,
    fuenteCoordenadas: 'estimada',
    ticketPromedio: 185,
    inversionInicial: 750000,
    horarioApertura: '10:00',
    horarioCierre: '21:00',
    diasOperacion: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    notas: 'PROPUESTA - Zona universitaria, alto flujo estudiantil. COORDENADAS REQUIEREN VERIFICACIÓN.'
  },
  {
    id: 'ct-012',
    nombre: 'Crispy Tenders Alaia Cumbres',
    plaza: 'Alaia Cumbres Center',
    direccion: 'Av. Paseo de Los Leones #500, Col. Cumbres 4 Sector, 64349',
    lat: 25.7245,
    lng: -100.4412,
    municipio: 'Monterrey',
    status: 'propuesta',
    coordenadasVerificadas: false,
    fuenteCoordenadas: 'estimada',
    ticketPromedio: 210,
    inversionInicial: 850000,
    horarioApertura: '10:00',
    horarioCierre: '21:00',
    diasOperacion: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    notas: 'PROPUESTA - Plaza nueva Feb 2025. Food Court climatizado. Zona Cumbres NSE B. COORDENADAS REQUIEREN VERIFICACIÓN.'
  }
];

// Helper functions
export const getSucursalesOperando = () =>
  SUCURSALES_CRISPY_TENDERS.filter(s => s.status === 'operando');

export const getSucursalesProximamente = () =>
  SUCURSALES_CRISPY_TENDERS.filter(s => s.status === 'proximamente');

export const getSucursalesPropuestas = () =>
  SUCURSALES_CRISPY_TENDERS.filter(s => s.status === 'propuesta');

export const getSucursalById = (id: string) =>
  SUCURSALES_CRISPY_TENDERS.find(s => s.id === id);

export const getSucursalesPorMunicipio = (municipio: string) =>
  SUCURSALES_CRISPY_TENDERS.filter(s => s.municipio === municipio);
