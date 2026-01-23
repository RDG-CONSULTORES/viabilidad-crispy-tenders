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
    direccion: 'Av. Diego Rivera 1000, Zona San Agustín, 66260 Monterrey',
    lat: 25.6490463,
    lng: -100.3365036,
    municipio: 'San Pedro Garza García',
    status: 'operando',
    coordenadasVerificadas: true,
    fuenteCoordenadas: 'google_places',
    placeId: 'ChIJtS9AhhK-YoYRQbH1OTaIHi0',
    ultimaVerificacion: '2025-01-23',
    ticketPromedio: 200,
    horarioApertura: '11:00',
    horarioCierre: '21:00',
    diasOperacion: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    notas: 'Plaza premium, alto flujo, tiendas ancla: Sanborns, Soriana, Sears.'
  },
  {
    id: 'ct-002',
    nombre: 'Crispy Tenders Plaza México',
    plaza: 'Plaza México',
    direccion: 'José María Morelos 385A, Centro, 64000 Monterrey',
    lat: 25.6676116,
    lng: -100.3131722,
    municipio: 'Monterrey',
    status: 'operando',
    coordenadasVerificadas: true,
    fuenteCoordenadas: 'google_places',
    placeId: 'ChIJ0dLzUk2_YoYRYO1N014Ulyw',
    ultimaVerificacion: '2025-01-23',
    ticketPromedio: 180,
    horarioApertura: '10:00',
    horarioCierre: '20:00',
    diasOperacion: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    notas: 'Zona centro, alto tráfico peatonal.'
  },
  {
    id: 'ct-003',
    nombre: 'Crispy Tenders Interplaza Shoptown',
    plaza: 'Interplaza Shoptown',
    direccion: 'Av. Benito Juárez 851, Centro, 67100 Monterrey',
    lat: 25.6681428,
    lng: -100.3153728,
    municipio: 'Monterrey',
    status: 'operando',
    coordenadasVerificadas: true,
    fuenteCoordenadas: 'google_places',
    placeId: 'ChIJB5WFmJGUYoYRfXa3QQq7YvE',
    ultimaVerificacion: '2025-01-23',
    ticketPromedio: 175,
    horarioApertura: '10:00',
    horarioCierre: '19:00',
    diasOperacion: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    notas: 'Centro histórico, artesanías, cerca de Metrorrey L2/L3.'
  },
  {
    id: 'ct-004',
    nombre: 'Crispy Tenders Plaza Real',
    plaza: 'Plaza Real',
    direccion: 'Av. Dr. José Eleuterio González 315, Jardines del Cerro, 64060 Monterrey',
    lat: 25.679974,
    lng: -100.3504874,
    municipio: 'Monterrey',
    status: 'operando',
    coordenadasVerificadas: true,
    fuenteCoordenadas: 'google_places',
    placeId: 'ChIJX-G3RAeWYoYRtnBG2v8SJAU',
    ultimaVerificacion: '2025-01-23',
    ticketPromedio: 190,
    horarioApertura: '10:00',
    horarioCierre: '21:00',
    diasOperacion: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    notas: 'HEB, Office Max, Cinemark, estacionamiento gratis.'
  },
  {
    id: 'ct-005',
    nombre: 'Crispy Tenders Esfera Park',
    plaza: 'Esfera Centro Comercial',
    direccion: 'Rioja, 64988 Monterrey',
    lat: 25.5780716,
    lng: -100.2453283,
    municipio: 'Monterrey',
    status: 'operando',
    coordenadasVerificadas: true,
    fuenteCoordenadas: 'google_places',
    placeId: 'ChIJJRyfMjzHYoYRdqvOB0jOoS0',
    ultimaVerificacion: '2025-01-23',
    ticketPromedio: 210,
    horarioApertura: '11:00',
    horarioCierre: '21:00',
    diasOperacion: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    notas: 'Plaza certificación LEED Silver, Sears nueva generación, Cinépolis.'
  },
  {
    id: 'ct-006',
    nombre: 'Crispy Tenders Rincón de la Primavera',
    plaza: 'Local Bahía de las Islas',
    direccion: 'C. Bahía de las Islas 3630B, Rincon De La Primavera, 64830 Monterrey',
    lat: 25.6485433,
    lng: -100.2735631,
    municipio: 'Monterrey',
    status: 'operando',
    coordenadasVerificadas: true,
    fuenteCoordenadas: 'google_places',
    placeId: 'ChIJtQLxfQC_YoYR2b7k2aJWgq0',
    ultimaVerificacion: '2025-01-23',
    ticketPromedio: 185,
    horarioApertura: '14:00',
    horarioCierre: '22:00',
    diasOperacion: ['Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    notas: 'Local independiente, horario vespertino. Antes listado como Av. Revolución.'
  },
  {
    id: 'ct-007',
    nombre: 'Crispy Tenders Juarez y Allende Centro',
    plaza: 'Local Centro',
    direccion: 'Juárez y Allende, Centro, 64000 Monterrey',
    lat: 25.6704089,
    lng: -100.3153895,
    municipio: 'Monterrey',
    status: 'operando',
    coordenadasVerificadas: true,
    fuenteCoordenadas: 'google_places',
    placeId: 'ChIJB9ZtMQa_YoYRxGTP1ZIHfDE',
    ultimaVerificacion: '2025-01-23',
    ticketPromedio: 175,
    horarioApertura: '10:30',
    horarioCierre: '19:30',
    diasOperacion: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    notas: 'Centro histórico, delivery Rappi/UberEats.'
  },
  {
    id: 'ct-008',
    nombre: 'Crispy Tenders Sun Mall',
    plaza: 'Sun Mall Guadalupe',
    direccion: 'Av. Pablo Livas 7601, Agua Nueva, 67190 Guadalupe',
    lat: 25.657495,
    lng: -100.1844398,
    municipio: 'Guadalupe',
    status: 'operando',
    coordenadasVerificadas: true,
    fuenteCoordenadas: 'google_places',
    placeId: 'ChIJhbS49tLBYoYRvSoYac79_u4',
    ultimaVerificacion: '2025-01-23',
    ticketPromedio: 190,
    horarioApertura: '10:00',
    horarioCierre: '20:00',
    diasOperacion: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    notas: 'Plaza Sun Mall, zona oriente Guadalupe.'
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
    notas: 'Lifestyle mall, Liverpool, H&M, Coppel, Cinépolis. Apertura próxima. Coordenadas de la plaza, CT no existe aún en Google.'
  },

  // Propuestas
  {
    id: 'ct-010',
    nombre: 'Crispy Tenders Plaza 1500',
    plaza: 'Plaza 1500',
    direccion: 'Local 30, Blvd. Acapulco 800, Josefa Zozaya, 67117 Guadalupe',
    lat: 25.7223823,
    lng: -100.1998254,
    municipio: 'Guadalupe',
    status: 'propuesta',
    coordenadasVerificadas: true,
    fuenteCoordenadas: 'google_places',
    placeId: 'ChIJF0_wkk7qYoYRr11-I50dBek',
    ultimaVerificacion: '2025-01-23',
    ticketPromedio: 195,
    inversionInicial: 800000,
    horarioApertura: '10:00',
    horarioCierre: '21:00',
    diasOperacion: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    notas: 'PROPUESTA DE ANÁLISIS - Cerca de Plaza Platino y Parque Deportivo Benito Juárez.'
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
    notas: 'PROPUESTA - Zona universitaria, alto flujo estudiantil. Coordenadas de la plaza, CT no existe.'
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
    notas: 'PROPUESTA - Plaza nueva Feb 2025. Food Court climatizado. Zona Cumbres NSE B. Coordenadas de la plaza.'
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
