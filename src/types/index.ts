/**
 * Tipos centralizados para el proyecto Crispy Tenders
 */

// Re-exportar tipos de otros módulos
export type { Sucursal } from '@/data/sucursales';
export type { Competidor, MarcaCompetencia } from '@/data/competencia';
export type { Plaza, NivelSocioeconomico, FlujoPorDia } from '@/data/plazas';
export type { ScoringConfig, ScoreDetallado, ResultadoScoring } from '@/lib/scoring';

// Tipos adicionales

export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface RangoHorario {
  inicio: string;
  fin: string;
}

export interface MetricaFlujo {
  dia: string;
  hora: string;
  flujo: number;
}

export interface AnalisisCompetencia {
  totalCompetidores: number;
  competenciaDirecta: number;
  competenciaIndirecta: number;
  competidorMasCercano: {
    nombre: string;
    distanciaKm: number;
  } | null;
  densidadPorKm2: number;
}

export interface ProyeccionFinanciera {
  ventasMensualesEstimadas: number;
  utilidadMensualEstimada: number;
  paybackMeses: number;
  roiAnual: number;
}

// Estados de la aplicación
export type StatusSucursal = 'operando' | 'proximamente' | 'propuesta';
export type ClasificacionViabilidad = 'VIABLE' | 'EVALUAR' | 'NO_VIABLE';
export type NivelAmenaza = 'alto' | 'medio' | 'bajo';
export type TipoCompetencia = 'directa' | 'indirecta';

// Configuración de UI
export interface FiltrosMapaConfig {
  mostrarSucursalesCT: boolean;
  mostrarCompetencia: boolean;
  mostrarPlazas: boolean;
  filtroMarca: string[];
  filtroMunicipio: string[];
  radioAnalisis: number; // km
}

// API responses
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Para el store de Zustand
export interface AppState {
  // Plaza seleccionada
  plazaSeleccionadaId: string | null;
  setPlazaSeleccionada: (id: string | null) => void;

  // Configuración de scoring
  scoringConfig: import('@/lib/scoring').ScoringConfig;
  setScoringConfig: (config: import('@/lib/scoring').ScoringConfig) => void;

  // Filtros del mapa
  filtrosMapa: FiltrosMapaConfig;
  setFiltrosMapa: (filtros: Partial<FiltrosMapaConfig>) => void;
}
