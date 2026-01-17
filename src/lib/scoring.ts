/**
 * Sistema de Scoring para Viabilidad de Franquicia Crispy Tenders
 * Todos los pesos y umbrales son CONFIGURABLES desde la UI
 */

import { Plaza, FlujoPorDia, calcularFlujoPromedio } from '../data/plazas';
import { contarCompetenciaPorTipo } from '../data/competencia';

// ========== TIPOS ==========

export interface ScoringConfig {
  pesos: {
    flujoPeatonal: number;      // 0-1
    tiendasAncla: number;       // 0-1
    competencia: number;        // 0-1
    perfilDemografico: number;  // 0-1
    accesibilidad: number;      // 0-1
    costoRenta: number;         // 0-1
    visibilidad: number;        // 0-1
  };
  umbrales: {
    viable: number;      // Score mínimo para "VIABLE"
    evaluar: number;     // Score mínimo para "EVALUAR"
  };
  negocio: {
    ticketPromedio: number;
    inversionBase: number;
    margenOperativo: number;    // 0-1
    metaClientesDia: number;
  };
}

export interface ScoreDetallado {
  flujoPeatonal: number;
  tiendasAncla: number;
  competencia: number;
  perfilDemografico: number;
  accesibilidad: number;
  costoRenta: number;
  visibilidad: number;
}

export interface ResultadoScoring {
  plaza: Plaza;
  scoreTotal: number;
  scoreDetallado: ScoreDetallado;
  clasificacion: 'VIABLE' | 'EVALUAR' | 'NO_VIABLE';
  color: string;
  recomendacion: string;
  factoresCriticos: string[];
  proyeccionFinanciera: {
    ventasMensualesEstimadas: number;
    utilidadMensualEstimada: number;
    paybackMeses: number;
    roiAnual: number;
  };
}

// ========== CONFIGURACIÓN POR DEFECTO ==========

export const CONFIG_DEFAULT: ScoringConfig = {
  pesos: {
    flujoPeatonal: 0.25,
    tiendasAncla: 0.20,
    competencia: 0.15,
    perfilDemografico: 0.15,
    accesibilidad: 0.10,
    costoRenta: 0.10,
    visibilidad: 0.05
  },
  umbrales: {
    viable: 75,
    evaluar: 55
  },
  negocio: {
    ticketPromedio: 200,
    inversionBase: 800000,
    margenOperativo: 0.35,
    metaClientesDia: 80
  }
};

// ========== PUNTUACIONES DE TIENDAS ANCLA ==========

const PUNTOS_TIENDAS_ANCLA: Record<string, number> = {
  'Liverpool': 25,
  'Palacio de Hierro': 30,
  'Soriana': 20,
  'HEB': 22,
  'Sears': 18,
  'Coppel': 15,
  'Cinépolis': 18,
  'Cinemex': 16,
  'Cinemark': 16,
  'Sanborns': 15,
  'H&M': 20,
  'Zara': 22,
  'Office Max': 12,
  'Office Depot': 12,
  'Del Sol': 8,
  'Parisina': 8,
  'Smart Fit': 10,
  // Default para otras
  'default': 5
};

// ========== FUNCIONES DE CÁLCULO ==========

/**
 * Calcula el score de flujo peatonal (0-100)
 */
function calcularScoreFlujo(flujo: FlujoPorDia): number {
  const promedio = calcularFlujoPromedio(flujo);

  if (promedio >= 1000) return 100;
  if (promedio >= 800) return 90;
  if (promedio >= 600) return 75;
  if (promedio >= 400) return 60;
  if (promedio >= 200) return 40;
  return 20;
}

/**
 * Calcula el score de tiendas ancla (0-100)
 */
function calcularScoreAnclas(tiendas: string[]): number {
  if (tiendas.length === 0) return 30; // Penalización si no hay info

  let puntos = 0;
  for (const tienda of tiendas) {
    puntos += PUNTOS_TIENDAS_ANCLA[tienda] || PUNTOS_TIENDAS_ANCLA['default'];
  }

  // Normalizar a 100 (máximo esperado: ~80 puntos para 3 buenas anclas)
  return Math.min(100, Math.round(puntos * 1.25));
}

/**
 * Calcula el score de competencia (0-100, menos competencia = mejor)
 */
function calcularScoreCompetencia(lat: number, lng: number, radioKm: number = 1): number {
  const { total, directa } = contarCompetenciaPorTipo(lat, lng, radioKm);

  // Competencia directa pesa más
  const pesoCompetencia = directa * 1.5 + (total - directa) * 0.5;

  if (pesoCompetencia === 0) return 100;
  if (pesoCompetencia <= 1) return 90;
  if (pesoCompetencia <= 2) return 75;
  if (pesoCompetencia <= 3) return 60;
  if (pesoCompetencia <= 5) return 45;
  return 25;
}

/**
 * Calcula el score demográfico (0-100)
 */
function calcularScoreDemografico(nivel: string): number {
  const scores: Record<string, number> = {
    'A': 100,
    'B': 85,
    'C+': 70,
    'C': 55,
    'D': 35
  };
  return scores[nivel] || 50;
}

/**
 * Calcula el score de accesibilidad (0-100)
 */
function calcularScoreAccesibilidad(plaza: Plaza): number {
  let score = 30; // Base

  if (plaza.cercaMetrorrey) score += 25;
  if (plaza.rutasBus.length > 0) score += Math.min(20, plaza.rutasBus.length * 5);
  if (plaza.estacionamientoGratis) score += 25;

  return Math.min(100, score);
}

/**
 * Calcula el score de costo de renta (0-100, menor costo = mejor)
 */
function calcularScoreRenta(rentaM2?: number): number {
  if (!rentaM2) return 50; // Default si no hay data

  if (rentaM2 <= 300) return 100;
  if (rentaM2 <= 450) return 85;
  if (rentaM2 <= 600) return 70;
  if (rentaM2 <= 800) return 50;
  if (rentaM2 <= 1000) return 35;
  return 20;
}

/**
 * Calcula el score de visibilidad (0-100)
 * Basado en características de la plaza
 */
function calcularScoreVisibilidad(plaza: Plaza): number {
  let score = 50; // Base

  // Plazas con múltiples niveles tienen mejor visibilidad
  if (plaza.niveles && plaza.niveles >= 2) score += 15;

  // Plazas grandes tienen más oportunidades de ubicación
  if (plaza.superficieM2 && plaza.superficieM2 > 100000) score += 15;

  // Food court mejora visibilidad (inferido de tiendas ancla de cine)
  const tieneCine = plaza.tiendasAncla.some(t =>
    ['Cinépolis', 'Cinemex', 'Cinemark'].includes(t)
  );
  if (tieneCine) score += 20;

  return Math.min(100, score);
}

// ========== FUNCIÓN PRINCIPAL DE SCORING ==========

/**
 * Calcula el score completo de viabilidad para una plaza
 */
export function calcularViabilidad(
  plaza: Plaza,
  config: ScoringConfig = CONFIG_DEFAULT
): ResultadoScoring {
  // Calcular scores individuales
  const scoreDetallado: ScoreDetallado = {
    flujoPeatonal: calcularScoreFlujo(plaza.flujoPeatonalEstimado),
    tiendasAncla: calcularScoreAnclas(plaza.tiendasAncla),
    competencia: calcularScoreCompetencia(plaza.lat, plaza.lng),
    perfilDemografico: calcularScoreDemografico(plaza.nivelSocioeconomico),
    accesibilidad: calcularScoreAccesibilidad(plaza),
    costoRenta: calcularScoreRenta(plaza.rentaEstimadaM2),
    visibilidad: calcularScoreVisibilidad(plaza)
  };

  // Calcular score total ponderado
  const scoreTotal = Math.round(
    scoreDetallado.flujoPeatonal * config.pesos.flujoPeatonal +
    scoreDetallado.tiendasAncla * config.pesos.tiendasAncla +
    scoreDetallado.competencia * config.pesos.competencia +
    scoreDetallado.perfilDemografico * config.pesos.perfilDemografico +
    scoreDetallado.accesibilidad * config.pesos.accesibilidad +
    scoreDetallado.costoRenta * config.pesos.costoRenta +
    scoreDetallado.visibilidad * config.pesos.visibilidad
  );

  // Clasificar
  let clasificacion: 'VIABLE' | 'EVALUAR' | 'NO_VIABLE';
  let color: string;
  let recomendacion: string;

  if (scoreTotal >= config.umbrales.viable) {
    clasificacion = 'VIABLE';
    color = '#22C55E'; // Verde
    recomendacion = '✅ PROCEDER - Excelente oportunidad de negocio con alto potencial de éxito';
  } else if (scoreTotal >= config.umbrales.evaluar) {
    clasificacion = 'EVALUAR';
    color = '#F59E0B'; // Amarillo
    recomendacion = '⚠️ EVALUAR - Oportunidad moderada. Revisar factores críticos antes de decidir';
  } else {
    clasificacion = 'NO_VIABLE';
    color = '#EF4444'; // Rojo
    recomendacion = '❌ NO VIABLE - Alto riesgo. Considerar otras ubicaciones';
  }

  // Identificar factores críticos (scores < 50)
  const factoresCriticos: string[] = [];
  if (scoreDetallado.flujoPeatonal < 50) factoresCriticos.push('Flujo peatonal bajo');
  if (scoreDetallado.tiendasAncla < 50) factoresCriticos.push('Pocas tiendas ancla');
  if (scoreDetallado.competencia < 50) factoresCriticos.push('Alta competencia en zona');
  if (scoreDetallado.perfilDemografico < 50) factoresCriticos.push('Perfil demográfico limitado');
  if (scoreDetallado.accesibilidad < 50) factoresCriticos.push('Baja accesibilidad');
  if (scoreDetallado.costoRenta < 50) factoresCriticos.push('Costo de renta elevado');
  if (scoreDetallado.visibilidad < 50) factoresCriticos.push('Visibilidad limitada');

  // Proyección financiera
  const flujoPromedio = calcularFlujoPromedio(plaza.flujoPeatonalEstimado);
  const tasaConversion = 0.02; // 2% de personas que pasan compran
  const clientesDia = Math.round(flujoPromedio * tasaConversion * 10); // 10 horas operación

  const ventasMensuales = clientesDia * config.negocio.ticketPromedio * 30;
  const utilidadMensual = ventasMensuales * config.negocio.margenOperativo;
  const paybackMeses = config.negocio.inversionBase / utilidadMensual;
  const roiAnual = (utilidadMensual * 12 / config.negocio.inversionBase) * 100;

  return {
    plaza,
    scoreTotal,
    scoreDetallado,
    clasificacion,
    color,
    recomendacion,
    factoresCriticos,
    proyeccionFinanciera: {
      ventasMensualesEstimadas: Math.round(ventasMensuales),
      utilidadMensualEstimada: Math.round(utilidadMensual),
      paybackMeses: Math.round(paybackMeses * 10) / 10,
      roiAnual: Math.round(roiAnual * 10) / 10
    }
  };
}

/**
 * Calcula viabilidad para múltiples plazas y las ordena por score
 */
export function rankingPlazas(
  plazas: Plaza[],
  config: ScoringConfig = CONFIG_DEFAULT
): ResultadoScoring[] {
  return plazas
    .map(plaza => calcularViabilidad(plaza, config))
    .sort((a, b) => b.scoreTotal - a.scoreTotal);
}

/**
 * Valida que los pesos sumen 1 (100%)
 */
export function validarPesos(pesos: ScoringConfig['pesos']): boolean {
  const suma = Object.values(pesos).reduce((a, b) => a + b, 0);
  return Math.abs(suma - 1) < 0.01; // Tolerancia de 1%
}

/**
 * Normaliza los pesos para que sumen 1
 */
export function normalizarPesos(pesos: ScoringConfig['pesos']): ScoringConfig['pesos'] {
  const suma = Object.values(pesos).reduce((a, b) => a + b, 0);
  return {
    flujoPeatonal: pesos.flujoPeatonal / suma,
    tiendasAncla: pesos.tiendasAncla / suma,
    competencia: pesos.competencia / suma,
    perfilDemografico: pesos.perfilDemografico / suma,
    accesibilidad: pesos.accesibilidad / suma,
    costoRenta: pesos.costoRenta / suma,
    visibilidad: pesos.visibilidad / suma
  };
}
