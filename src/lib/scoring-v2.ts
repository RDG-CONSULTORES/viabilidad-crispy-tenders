/**
 * SCORING V2 - Sistema de Viabilidad Recalibrado
 *
 * Cambios principales:
 * 1. Base score = 0 (no 40)
 * 2. Cada factor tiene confianza asociada
 * 3. Umbrales más estrictos
 * 4. Penalizaciones más agresivas
 */

export interface DatoConfiable {
  valor: number;
  confianza: number; // 0-100%
  fuente: string;
  verificado: boolean;
  fechaActualizacion?: string;
}

export interface FactorScore {
  nombre: string;
  puntos: number;
  maxPuntos: number;
  confianza: number;
  fuente: string;
  descripcion: string;
  esPositivo: boolean;
}

export interface ResultadoScoring {
  scoreTotal: number;
  confianzaGlobal: number;
  clasificacion: 'EXCELENTE' | 'BUENA' | 'EVALUAR' | 'RIESGOSA' | 'NO_VIABLE';
  factores: FactorScore[];
  factoresPositivos: string[];
  factoresNegativos: string[];
  alertas: string[];
  recomendacion: string;
}

// Nuevos umbrales más estrictos
export const UMBRALES_V2 = {
  EXCELENTE: 75,    // Era 80
  BUENA: 60,        // Era 65
  EVALUAR: 45,      // Era 50
  RIESGOSA: 30,     // Nuevo
  // < 30 = NO_VIABLE
};

// Pesos actualizados
export const PESOS_V2 = {
  nse: 25,              // Era 20, más importante
  volumenPeatonal: 25,  // Era 15, crítico
  distanciaCT: 15,      // Se mantiene
  competencia: 15,      // Era 10, más peso
  rentaEstimada: 10,    // NUEVO
  ratingPlaza: 10,      // Se mantiene
};

/**
 * Calcula score de viabilidad V2 con confianza
 */
export function calcularScoreV2(params: {
  nse: DatoConfiable;
  volumenPeatonal: DatoConfiable;
  distanciaCTKm: number;
  distanciaKFCKm: number;
  competidoresEn2km: number;
  rentaEstimada?: number;
  ratingPlaza?: number;
  totalReviews?: number;
  coordenadasVerificadas: boolean;
}): ResultadoScoring {
  const factores: FactorScore[] = [];
  const factoresPositivos: string[] = [];
  const factoresNegativos: string[] = [];
  const alertas: string[] = [];

  let scoreTotal = 0;
  let confianzaAcumulada = 0;
  let pesoConfianzaTotal = 0;

  // ========== 1. NSE (25 puntos) ==========
  const nseScores: Record<string, number> = {
    'A': 25,
    'B': 20,
    'C+': 15,
    'C': 8,
    'D': 0,
  };
  const puntosNSE = nseScores[params.nse.valor.toString()] ?? 8;
  scoreTotal += puntosNSE;
  confianzaAcumulada += params.nse.confianza * PESOS_V2.nse;
  pesoConfianzaTotal += PESOS_V2.nse;

  factores.push({
    nombre: 'Nivel Socioeconómico',
    puntos: puntosNSE,
    maxPuntos: PESOS_V2.nse,
    confianza: params.nse.confianza,
    fuente: params.nse.fuente,
    descripcion: `NSE ${params.nse.valor}`,
    esPositivo: puntosNSE >= 15,
  });

  if (puntosNSE >= 20) {
    factoresPositivos.push(`Zona NSE ${params.nse.valor} - alto poder adquisitivo`);
  } else if (puntosNSE <= 8) {
    factoresNegativos.push(`Zona NSE ${params.nse.valor} - poder adquisitivo limitado`);
  }

  if (params.nse.confianza < 70) {
    alertas.push(`NSE estimado a nivel municipio (${params.nse.confianza}% confianza). Validar con AGEB.`);
  }

  // ========== 2. Volumen Peatonal (25 puntos) ==========
  const volPeatonal = params.volumenPeatonal.valor;
  let puntosVolumen = 0;

  if (volPeatonal >= 80) puntosVolumen = 25;
  else if (volPeatonal >= 70) puntosVolumen = 22;
  else if (volPeatonal >= 60) puntosVolumen = 18;
  else if (volPeatonal >= 50) puntosVolumen = 14;
  else if (volPeatonal >= 40) puntosVolumen = 10;
  else if (volPeatonal >= 30) puntosVolumen = 5;
  else puntosVolumen = 0;

  scoreTotal += puntosVolumen;
  confianzaAcumulada += params.volumenPeatonal.confianza * PESOS_V2.volumenPeatonal;
  pesoConfianzaTotal += PESOS_V2.volumenPeatonal;

  factores.push({
    nombre: 'Volumen Peatonal',
    puntos: puntosVolumen,
    maxPuntos: PESOS_V2.volumenPeatonal,
    confianza: params.volumenPeatonal.confianza,
    fuente: params.volumenPeatonal.fuente,
    descripcion: `${volPeatonal}% del máximo`,
    esPositivo: puntosVolumen >= 14,
  });

  if (puntosVolumen >= 18) {
    factoresPositivos.push(`Alto flujo peatonal (${volPeatonal}%)`);
  } else if (puntosVolumen <= 10) {
    factoresNegativos.push(`Bajo flujo peatonal (${volPeatonal}%)`);
  }

  if (params.volumenPeatonal.confianza < 70) {
    alertas.push(`Volumen peatonal es estimación (${params.volumenPeatonal.confianza}% confianza). Recomendar BestTime.`);
  }

  // ========== 3. Distancia a CT existente (15 puntos) ==========
  let puntosCT = 0;

  if (params.distanciaCTKm > 8) puntosCT = 15;
  else if (params.distanciaCTKm > 5) puntosCT = 12;
  else if (params.distanciaCTKm > 3) puntosCT = 8;
  else if (params.distanciaCTKm > 2) puntosCT = 4;
  else puntosCT = 0; // Muy cerca = canibalización

  scoreTotal += puntosCT;
  confianzaAcumulada += (params.coordenadasVerificadas ? 95 : 50) * PESOS_V2.distanciaCT;
  pesoConfianzaTotal += PESOS_V2.distanciaCT;

  factores.push({
    nombre: 'Distancia a CT',
    puntos: puntosCT,
    maxPuntos: PESOS_V2.distanciaCT,
    confianza: params.coordenadasVerificadas ? 95 : 50,
    fuente: params.coordenadasVerificadas ? 'Coordenadas verificadas' : 'Coordenadas estimadas',
    descripcion: `${params.distanciaCTKm.toFixed(1)} km al CT más cercano`,
    esPositivo: puntosCT >= 8,
  });

  if (puntosCT >= 12) {
    factoresPositivos.push(`Sin CT en ${params.distanciaCTKm.toFixed(1)}km - mercado virgen`);
  } else if (puntosCT <= 4) {
    factoresNegativos.push(`CT cercano (${params.distanciaCTKm.toFixed(1)}km) - riesgo canibalización`);
  }

  if (!params.coordenadasVerificadas) {
    alertas.push('Coordenadas de sucursales CT no verificadas. Distancias pueden ser inexactas.');
  }

  // ========== 4. Competencia (15 puntos) ==========
  let puntosComp = 0;

  // Factor distancia KFC
  if (params.distanciaKFCKm > 3) puntosComp += 8;
  else if (params.distanciaKFCKm > 2) puntosComp += 6;
  else if (params.distanciaKFCKm > 1) puntosComp += 4;
  else if (params.distanciaKFCKm > 0.5) puntosComp += 2;
  else puntosComp += 0;

  // Factor densidad competidores
  if (params.competidoresEn2km === 0) puntosComp += 7;
  else if (params.competidoresEn2km <= 2) puntosComp += 5;
  else if (params.competidoresEn2km <= 4) puntosComp += 2;
  else puntosComp -= 2; // Penalización por saturación

  puntosComp = Math.max(0, Math.min(15, puntosComp));
  scoreTotal += puntosComp;
  confianzaAcumulada += (params.coordenadasVerificadas ? 90 : 40) * PESOS_V2.competencia;
  pesoConfianzaTotal += PESOS_V2.competencia;

  factores.push({
    nombre: 'Competencia',
    puntos: puntosComp,
    maxPuntos: PESOS_V2.competencia,
    confianza: params.coordenadasVerificadas ? 90 : 40,
    fuente: params.coordenadasVerificadas ? 'Google Places verificado' : 'Datos estimados',
    descripcion: `KFC a ${params.distanciaKFCKm.toFixed(1)}km, ${params.competidoresEn2km} competidores en 2km`,
    esPositivo: puntosComp >= 8,
  });

  if (params.competidoresEn2km === 0) {
    factoresPositivos.push('Sin competencia directa en 2km');
  } else if (params.competidoresEn2km > 4) {
    factoresNegativos.push(`Zona saturada (${params.competidoresEn2km} competidores en 2km)`);
  }

  // ========== 5. Renta Estimada (10 puntos) ==========
  if (params.rentaEstimada !== undefined) {
    let puntosRenta = 0;

    if (params.rentaEstimada <= 15000) puntosRenta = 10;
    else if (params.rentaEstimada <= 25000) puntosRenta = 8;
    else if (params.rentaEstimada <= 35000) puntosRenta = 5;
    else if (params.rentaEstimada <= 45000) puntosRenta = 2;
    else puntosRenta = 0;

    scoreTotal += puntosRenta;
    confianzaAcumulada += 60 * PESOS_V2.rentaEstimada; // Renta siempre es estimación
    pesoConfianzaTotal += PESOS_V2.rentaEstimada;

    factores.push({
      nombre: 'Renta Estimada',
      puntos: puntosRenta,
      maxPuntos: PESOS_V2.rentaEstimada,
      confianza: 60,
      fuente: 'Estimación por zona',
      descripcion: `~$${params.rentaEstimada.toLocaleString()}/mes`,
      esPositivo: puntosRenta >= 5,
    });

    if (puntosRenta >= 8) {
      factoresPositivos.push(`Renta accesible (~$${params.rentaEstimada.toLocaleString()})`);
    } else if (puntosRenta <= 2) {
      factoresNegativos.push(`Renta elevada (~$${params.rentaEstimada.toLocaleString()})`);
    }
  }

  // ========== 6. Rating Plaza (10 puntos) ==========
  if (params.ratingPlaza !== undefined) {
    let puntosRating = 0;

    if (params.ratingPlaza >= 4.5) puntosRating = 10;
    else if (params.ratingPlaza >= 4.2) puntosRating = 8;
    else if (params.ratingPlaza >= 4.0) puntosRating = 6;
    else if (params.ratingPlaza >= 3.5) puntosRating = 3;
    else puntosRating = 0;

    // Bonus por muchas reviews (más confiable)
    const confRating = params.totalReviews && params.totalReviews > 1000 ? 85 :
                       params.totalReviews && params.totalReviews > 500 ? 75 :
                       params.totalReviews && params.totalReviews > 100 ? 65 : 50;

    scoreTotal += puntosRating;
    confianzaAcumulada += confRating * PESOS_V2.ratingPlaza;
    pesoConfianzaTotal += PESOS_V2.ratingPlaza;

    factores.push({
      nombre: 'Rating Plaza',
      puntos: puntosRating,
      maxPuntos: PESOS_V2.ratingPlaza,
      confianza: confRating,
      fuente: 'Google Places',
      descripcion: `${params.ratingPlaza}★ (${params.totalReviews || 0} reviews)`,
      esPositivo: puntosRating >= 6,
    });

    if (puntosRating >= 8) {
      factoresPositivos.push(`Plaza bien valorada (${params.ratingPlaza}★)`);
    } else if (puntosRating <= 3) {
      factoresNegativos.push(`Plaza con reputación baja (${params.ratingPlaza}★)`);
    }
  }

  // ========== Cálculos finales ==========
  const confianzaGlobal = pesoConfianzaTotal > 0
    ? Math.round(confianzaAcumulada / pesoConfianzaTotal)
    : 50;

  // Clasificación
  let clasificacion: ResultadoScoring['clasificacion'];
  if (scoreTotal >= UMBRALES_V2.EXCELENTE) clasificacion = 'EXCELENTE';
  else if (scoreTotal >= UMBRALES_V2.BUENA) clasificacion = 'BUENA';
  else if (scoreTotal >= UMBRALES_V2.EVALUAR) clasificacion = 'EVALUAR';
  else if (scoreTotal >= UMBRALES_V2.RIESGOSA) clasificacion = 'RIESGOSA';
  else clasificacion = 'NO_VIABLE';

  // Recomendación
  let recomendacion: string;
  if (clasificacion === 'EXCELENTE') {
    recomendacion = 'Oportunidad prioritaria. Proceder con validación de campo.';
  } else if (clasificacion === 'BUENA') {
    recomendacion = 'Buena oportunidad. Validar factores de menor confianza.';
  } else if (clasificacion === 'EVALUAR') {
    recomendacion = 'Requiere análisis adicional. Verificar datos antes de avanzar.';
  } else if (clasificacion === 'RIESGOSA') {
    recomendacion = 'Alto riesgo. No recomendado sin mejora significativa en factores.';
  } else {
    recomendacion = 'No viable con datos actuales. Descartar o reevaluar premisas.';
  }

  // Alerta de confianza global baja
  if (confianzaGlobal < 60) {
    alertas.unshift(`⚠️ Confianza global baja (${confianzaGlobal}%). Datos requieren verificación.`);
  }

  return {
    scoreTotal: Math.round(scoreTotal),
    confianzaGlobal,
    clasificacion,
    factores,
    factoresPositivos,
    factoresNegativos,
    alertas,
    recomendacion,
  };
}

/**
 * Obtiene color por clasificación
 */
export function getColorClasificacion(clasificacion: ResultadoScoring['clasificacion']): string {
  const colores = {
    'EXCELENTE': '#10B981',   // Emerald
    'BUENA': '#3B82F6',       // Blue
    'EVALUAR': '#F59E0B',     // Amber
    'RIESGOSA': '#EF4444',    // Red
    'NO_VIABLE': '#6B7280',   // Gray
  };
  return colores[clasificacion];
}

/**
 * Obtiene color por nivel de confianza
 */
export function getColorConfianza(confianza: number): string {
  if (confianza >= 80) return '#10B981';
  if (confianza >= 60) return '#3B82F6';
  if (confianza >= 40) return '#F59E0B';
  return '#EF4444';
}
