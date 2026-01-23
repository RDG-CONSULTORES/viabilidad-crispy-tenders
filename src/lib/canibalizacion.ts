/**
 * Análisis de Canibalización para Crispy Tenders
 * Evalúa el impacto de nuevas ubicaciones sobre sucursales existentes
 *
 * Metodología basada en:
 * - Modelo Huff de gravedad comercial
 * - Trade area overlap analysis
 * - Distancia y tiempo de traslado
 */

import { Sucursal, SUCURSALES_CRISPY_TENDERS } from '@/data/sucursales';
import { Plaza } from '@/data/plazas';
import { calcularDistanciaKm } from '@/data/competencia';

// ========== TIPOS ==========

export interface AnalisisCanibalizacion {
  plazaPropuesta: {
    id: string;
    nombre: string;
    lat: number;
    lng: number;
  };
  sucursalesAfectadas: SucursalAfectada[];
  resumen: {
    totalSucursalesAfectadas: number;
    canibalizacionPromedio: number;
    riesgoGeneral: 'bajo' | 'medio' | 'alto' | 'critico';
    impactoVentasEstimado: number; // Porcentaje de reducción de ventas en red
    recomendacion: string;
  };
  tradeAreaOverlap: {
    radio1km: number; // Porcentaje de overlap
    radio2km: number;
    radio5km: number;
  };
}

export interface SucursalAfectada {
  sucursal: Sucursal;
  distanciaKm: number;
  tiempoAutoMin: number; // Estimado
  canibalizacionPct: number; // Porcentaje de ventas que perdería
  impactoNivel: 'nulo' | 'bajo' | 'medio' | 'alto' | 'critico';
  factores: string[];
}

// ========== CONSTANTES ==========

// Radio de trade area por tipo de ubicación (km)
const TRADE_AREA_RADIOS = {
  primario: 1.5,    // Radio donde captura 60-70% de clientes
  secundario: 3.0,  // Radio donde captura 20-30% adicional
  terciario: 5.0,   // Radio de influencia marginal
};

// Factor de decaimiento de la demanda con la distancia (modelo Huff)
const DECAY_FACTOR = 2.0; // Exponente de distancia

// ========== FUNCIONES ==========

/**
 * Calcula el análisis de canibalización para una plaza propuesta
 */
export function analizarCanibalizacion(
  plaza: Plaza | { id: string; nombre: string; lat: number; lng: number }
): AnalisisCanibalizacion {
  const sucursalesOperando = SUCURSALES_CRISPY_TENDERS.filter(
    s => s.status === 'operando'
  );

  const sucursalesAfectadas: SucursalAfectada[] = [];

  for (const sucursal of sucursalesOperando) {
    const distanciaKm = calcularDistanciaKm(
      plaza.lat, plaza.lng,
      sucursal.lat, sucursal.lng
    );

    // Solo analizar si está dentro del radio de influencia terciario
    if (distanciaKm <= TRADE_AREA_RADIOS.terciario * 1.5) {
      const analisis = analizarImpactoSucursal(sucursal, distanciaKm, plaza);
      sucursalesAfectadas.push(analisis);
    }
  }

  // Ordenar por nivel de impacto (mayor primero)
  sucursalesAfectadas.sort((a, b) => b.canibalizacionPct - a.canibalizacionPct);

  // Calcular resumen
  const afectadasSignificativas = sucursalesAfectadas.filter(
    s => s.canibalizacionPct > 5
  );

  const canibalizacionPromedio = afectadasSignificativas.length > 0
    ? afectadasSignificativas.reduce((sum, s) => sum + s.canibalizacionPct, 0) / afectadasSignificativas.length
    : 0;

  // Calcular impacto total en la red (ponderado por ubicación)
  const impactoVentasEstimado = calcularImpactoRed(sucursalesAfectadas);

  // Determinar riesgo general
  let riesgoGeneral: 'bajo' | 'medio' | 'alto' | 'critico';
  let recomendacion: string;

  if (canibalizacionPromedio < 5 || afectadasSignificativas.length === 0) {
    riesgoGeneral = 'bajo';
    recomendacion = '✅ PROCEDER - Mínimo riesgo de canibalización. La nueva ubicación expandirá el mercado sin afectar significativamente las ventas existentes.';
  } else if (canibalizacionPromedio < 15) {
    riesgoGeneral = 'medio';
    recomendacion = '⚠️ EVALUAR - Canibalización moderada esperada. Considerar estrategias de diferenciación de menú o horarios entre ubicaciones.';
  } else if (canibalizacionPromedio < 25) {
    riesgoGeneral = 'alto';
    recomendacion = '🔶 PRECAUCIÓN - Alto riesgo de canibalización. Evaluar si el mercado tiene suficiente demanda para sostener ambas ubicaciones.';
  } else {
    riesgoGeneral = 'critico';
    recomendacion = '❌ NO RECOMENDADO - Canibalización crítica. Esta ubicación afectaría severamente las ventas de sucursales existentes. Considerar otras zonas.';
  }

  // Calcular overlap de trade areas
  const tradeAreaOverlap = calcularOverlapTradeAreas(plaza, sucursalesOperando);

  return {
    plazaPropuesta: {
      id: plaza.id,
      nombre: plaza.nombre,
      lat: plaza.lat,
      lng: plaza.lng,
    },
    sucursalesAfectadas,
    resumen: {
      totalSucursalesAfectadas: afectadasSignificativas.length,
      canibalizacionPromedio: Math.round(canibalizacionPromedio * 10) / 10,
      riesgoGeneral,
      impactoVentasEstimado: Math.round(impactoVentasEstimado * 10) / 10,
      recomendacion,
    },
    tradeAreaOverlap,
  };
}

/**
 * Analiza el impacto en una sucursal específica
 */
function analizarImpactoSucursal(
  sucursal: Sucursal,
  distanciaKm: number,
  plaza: { nombre: string }
): SucursalAfectada {
  const factores: string[] = [];

  // Estimar tiempo en auto (promedio 25 km/h en ciudad con tráfico)
  const tiempoAutoMin = Math.round(distanciaKm / 25 * 60);

  // Calcular canibalización usando modelo de gravedad comercial
  let canibalizacionPct = 0;

  if (distanciaKm <= TRADE_AREA_RADIOS.primario) {
    // Dentro del trade area primario - alto impacto
    canibalizacionPct = 35 - (distanciaKm / TRADE_AREA_RADIOS.primario) * 15;
    factores.push(`Ubicada en trade area primario (${distanciaKm.toFixed(1)} km)`);
  } else if (distanciaKm <= TRADE_AREA_RADIOS.secundario) {
    // Dentro del trade area secundario
    const factor = (distanciaKm - TRADE_AREA_RADIOS.primario) /
                   (TRADE_AREA_RADIOS.secundario - TRADE_AREA_RADIOS.primario);
    canibalizacionPct = 20 - factor * 12;
    factores.push(`Ubicada en trade area secundario`);
  } else if (distanciaKm <= TRADE_AREA_RADIOS.terciario) {
    // Dentro del trade area terciario
    const factor = (distanciaKm - TRADE_AREA_RADIOS.secundario) /
                   (TRADE_AREA_RADIOS.terciario - TRADE_AREA_RADIOS.secundario);
    canibalizacionPct = 8 - factor * 6;
    factores.push(`Ubicada en trade area terciario`);
  } else {
    // Fuera del trade area principal
    canibalizacionPct = Math.max(0, 5 - (distanciaKm - TRADE_AREA_RADIOS.terciario) * 1);
    if (canibalizacionPct > 0) {
      factores.push(`Influencia marginal a ${distanciaKm.toFixed(1)} km`);
    }
  }

  // Ajustar por factores adicionales
  if (sucursal.municipio === (plaza as any).municipio) {
    canibalizacionPct *= 1.15; // +15% si es mismo municipio
    factores.push('Mismo municipio (+15%)');
  }

  // Normalizar a 0-100
  canibalizacionPct = Math.max(0, Math.min(100, canibalizacionPct));

  // Determinar nivel de impacto
  let impactoNivel: SucursalAfectada['impactoNivel'];
  if (canibalizacionPct < 3) {
    impactoNivel = 'nulo';
  } else if (canibalizacionPct < 10) {
    impactoNivel = 'bajo';
  } else if (canibalizacionPct < 20) {
    impactoNivel = 'medio';
  } else if (canibalizacionPct < 30) {
    impactoNivel = 'alto';
  } else {
    impactoNivel = 'critico';
  }

  return {
    sucursal,
    distanciaKm: Math.round(distanciaKm * 100) / 100,
    tiempoAutoMin,
    canibalizacionPct: Math.round(canibalizacionPct * 10) / 10,
    impactoNivel,
    factores,
  };
}

/**
 * Calcula el impacto total en la red de sucursales
 */
function calcularImpactoRed(sucursalesAfectadas: SucursalAfectada[]): number {
  if (sucursalesAfectadas.length === 0) return 0;

  // Promedio ponderado - sucursales con mayor canibalización pesan más
  let sumaPonderada = 0;
  let sumaPesos = 0;

  for (const s of sucursalesAfectadas) {
    const peso = s.canibalizacionPct / 100;
    sumaPonderada += s.canibalizacionPct * peso;
    sumaPesos += peso;
  }

  return sumaPesos > 0 ? sumaPonderada / sumaPesos : 0;
}

/**
 * Calcula el porcentaje de overlap de trade areas
 */
function calcularOverlapTradeAreas(
  plaza: { lat: number; lng: number },
  sucursales: Sucursal[]
): { radio1km: number; radio2km: number; radio5km: number } {
  const radios = [1, 2, 5];
  const overlaps: number[] = [];

  for (const radio of radios) {
    let sucursalesEnRadio = 0;

    for (const sucursal of sucursales) {
      const distancia = calcularDistanciaKm(
        plaza.lat, plaza.lng,
        sucursal.lat, sucursal.lng
      );

      // Si la distancia es menor que la suma de los radios de trade area,
      // hay overlap
      if (distancia <= radio * 2) {
        // Calcular porcentaje de overlap basado en la distancia
        const overlapFactor = Math.max(0, 1 - (distancia / (radio * 2)));
        sucursalesEnRadio += overlapFactor;
      }
    }

    // Normalizar a porcentaje (máximo 100% si todas las sucursales tienen overlap total)
    const overlapPct = Math.min(100, (sucursalesEnRadio / Math.max(1, sucursales.length)) * 100);
    overlaps.push(Math.round(overlapPct));
  }

  return {
    radio1km: overlaps[0],
    radio2km: overlaps[1],
    radio5km: overlaps[2],
  };
}

/**
 * Obtiene sucursales que serían afectadas por una nueva ubicación
 */
export function getSucursalesEnRiesgo(
  lat: number,
  lng: number,
  radioKm: number = 3
): (Sucursal & { distanciaKm: number })[] {
  return SUCURSALES_CRISPY_TENDERS
    .filter(s => s.status === 'operando')
    .map(sucursal => ({
      ...sucursal,
      distanciaKm: calcularDistanciaKm(lat, lng, sucursal.lat, sucursal.lng)
    }))
    .filter(s => s.distanciaKm <= radioKm)
    .sort((a, b) => a.distanciaKm - b.distanciaKm);
}

/**
 * Calcula la distancia mínima recomendada a sucursales existentes
 * para minimizar canibalización
 */
export function calcularDistanciaMinimaRecomendada(): {
  distanciaMinKm: number;
  razon: string;
} {
  // Basado en trade area primario + buffer de seguridad
  const distanciaMinKm = TRADE_AREA_RADIOS.primario * 2;

  return {
    distanciaMinKm,
    razon: `Se recomienda un mínimo de ${distanciaMinKm} km entre sucursales para minimizar la canibalización. Esta distancia asegura que los trade areas primarios no se superpongan significativamente.`
  };
}
