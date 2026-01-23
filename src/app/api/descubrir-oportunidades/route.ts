import { NextRequest, NextResponse } from 'next/server';
import { buscarLugaresCercanos, PlaceResult } from '@/lib/google-places';
import { obtenerRiesgoMunicipio, MUNICIPIOS_AMM } from '@/lib/apis-gobierno';
import { obtenerMunicipioIdPorCoordenadas, obtenerIndicadoresEconomicos, getNivelEconomicoInfo } from '@/lib/datamexico';
import { SUCURSALES_CRISPY_TENDERS } from '@/data/sucursales';
import { COMPETIDORES_MTY, calcularDistanciaKm } from '@/data/competencia';
import { analizarAfluenciaPlaza, AfluenciaData, getNivelAfluencia } from '@/lib/besttime';

/**
 * API Route para Descubrimiento de Oportunidades
 *
 * Escanea toda el Área Metropolitana de Monterrey buscando
 * las mejores plazas para Crispy Tenders
 *
 * GET /api/descubrir-oportunidades
 * Query params:
 * - limite: número máximo de resultados (default: 20)
 * - nseMinimo: nivel socioeconómico mínimo ('A', 'B', 'C+', 'C', 'D')
 * - distanciaMinCT: distancia mínima a sucursales existentes en km (default: 2)
 */

// Zonas estratégicas para escanear el AMM
const ZONAS_ESCANEO = [
  // San Pedro / Valle (NSE Alto)
  { nombre: 'San Pedro Centro', lat: 25.6574, lng: -100.4023, prioridad: 1 },
  { nombre: 'Valle Oriente', lat: 25.6489, lng: -100.3693, prioridad: 1 },
  { nombre: 'Del Valle', lat: 25.6523, lng: -100.3356, prioridad: 1 },

  // Cumbres / Mitras (NSE Medio-Alto)
  { nombre: 'Cumbres 1', lat: 25.7350, lng: -100.4450, prioridad: 1 },
  { nombre: 'Cumbres 2', lat: 25.7500, lng: -100.4200, prioridad: 2 },
  { nombre: 'Mitras', lat: 25.6950, lng: -100.3550, prioridad: 2 },
  { nombre: 'Linda Vista', lat: 25.7150, lng: -100.3650, prioridad: 2 },

  // Monterrey Centro/Sur
  { nombre: 'Centro MTY', lat: 25.6866, lng: -100.3161, prioridad: 2 },
  { nombre: 'Contry', lat: 25.6350, lng: -100.3150, prioridad: 2 },
  { nombre: 'Tecnológico', lat: 25.6512, lng: -100.2890, prioridad: 2 },

  // San Nicolás
  { nombre: 'San Nicolás Centro', lat: 25.7441, lng: -100.2836, prioridad: 2 },
  { nombre: 'San Nicolás Norte', lat: 25.7600, lng: -100.2700, prioridad: 2 },
  { nombre: 'Anáhuac', lat: 25.7441, lng: -100.3010, prioridad: 2 },

  // Guadalupe
  { nombre: 'Guadalupe Centro', lat: 25.6772, lng: -100.2557, prioridad: 2 },
  { nombre: 'Guadalupe Oriente', lat: 25.6900, lng: -100.2100, prioridad: 3 },
  { nombre: 'Guadalupe Sur', lat: 25.6500, lng: -100.2300, prioridad: 3 },

  // Apodaca / Escobedo
  { nombre: 'Apodaca Centro', lat: 25.7815, lng: -100.1836, prioridad: 3 },
  { nombre: 'Escobedo', lat: 25.7981, lng: -100.3401, prioridad: 3 },

  // Carretera Nacional
  { nombre: 'Carretera Nacional', lat: 25.6150, lng: -100.2850, prioridad: 2 },

  // Santa Catarina / García
  { nombre: 'Santa Catarina', lat: 25.6733, lng: -100.4584, prioridad: 3 },
  { nombre: 'García', lat: 25.8078, lng: -100.5186, prioridad: 3 },
];

interface OportunidadDescubierta {
  placeId: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  rating?: number;
  totalReviews?: number;

  // Análisis
  zonaOrigen: string;
  municipio: string;
  nseEstimado: string;
  nseColor: string;

  // Distancias
  distanciaCTMasCercano: number;
  sucursalCTMasCercana: string;
  distanciaKFCMasCercano: number;
  competidoresEn2km: number;

  // Volumen Peatonal
  volumenPeatonal: {
    estimado: number; // 0-100
    nivel: string;
    color: string;
    fuente: 'besttime' | 'estimado';
    promedioSemanal?: number;
    mejorDia?: string;
    horasPico?: string;
  };

  // Scoring
  scoreViabilidad: number;
  clasificacion: 'EXCELENTE' | 'BUENA' | 'EVALUAR' | 'RIESGOSA';
  factoresPositivos: string[];
  factoresNegativos: string[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limite = parseInt(searchParams.get('limite') || '20');
  const nseMinimo = searchParams.get('nseMinimo') || 'C';
  const distanciaMinCT = parseFloat(searchParams.get('distanciaMinCT') || '2');

  try {
    const todasLasOportunidades: OportunidadDescubierta[] = [];
    const placeIdsVistos = new Set<string>();

    // Ordenar zonas por prioridad
    const zonasOrdenadas = [...ZONAS_ESCANEO].sort((a, b) => a.prioridad - b.prioridad);

    // Escanear cada zona
    for (const zona of zonasOrdenadas) {
      // Buscar plazas comerciales en esta zona
      const plazas = await buscarLugaresCercanos(
        zona.lat,
        zona.lng,
        5000, // 5km radio
        'plaza comercial centro comercial mall',
        'shopping_mall'
      );

      // Procesar cada plaza encontrada
      for (const plaza of plazas) {
        // Evitar duplicados
        if (placeIdsVistos.has(plaza.placeId)) continue;
        placeIdsVistos.add(plaza.placeId);

        // Calcular distancia a sucursales CT existentes
        let distanciaCTMin = Infinity;
        let sucursalCTCercana = '';

        for (const ct of SUCURSALES_CRISPY_TENDERS.filter(s => s.status === 'operando')) {
          const dist = calcularDistanciaKm(plaza.lat, plaza.lng, ct.lat, ct.lng);
          if (dist < distanciaCTMin) {
            distanciaCTMin = dist;
            sucursalCTCercana = ct.nombre;
          }
        }

        // Filtrar si está muy cerca de una sucursal existente
        if (distanciaCTMin < distanciaMinCT) continue;

        // Calcular distancia a KFC y competidores
        let distanciaKFCMin = Infinity;
        let competidoresEn2km = 0;

        for (const comp of COMPETIDORES_MTY) {
          const dist = calcularDistanciaKm(plaza.lat, plaza.lng, comp.lat, comp.lng);
          if (comp.marca === 'KFC' && dist < distanciaKFCMin) {
            distanciaKFCMin = dist;
          }
          if (dist <= 2) {
            competidoresEn2km++;
          }
        }

        // Obtener NSE del municipio
        const municipioId = obtenerMunicipioIdPorCoordenadas(plaza.lat, plaza.lng);
        let nseEstimado = 'C';
        let nseColor = '#EAB308';
        let municipioNombre = 'Desconocido';

        try {
          const indicadores = await obtenerIndicadoresEconomicos(municipioId);
          if (indicadores) {
            nseEstimado = indicadores.nivelEconomicoEstimado === 'muy_alto' ? 'A' :
                         indicadores.nivelEconomicoEstimado === 'alto' ? 'B' :
                         indicadores.nivelEconomicoEstimado === 'medio' ? 'C+' : 'C';
            const nseInfo = getNivelEconomicoInfo(indicadores.nivelEconomicoEstimado);
            nseColor = nseInfo.color;
            municipioNombre = indicadores.municipio;
          }
        } catch (e) {
          // Usar default
        }

        // Filtrar por NSE mínimo
        const nseOrden = { 'A': 5, 'B': 4, 'C+': 3, 'C': 2, 'D': 1 };
        if ((nseOrden[nseEstimado as keyof typeof nseOrden] || 2) < (nseOrden[nseMinimo as keyof typeof nseOrden] || 2)) {
          continue;
        }

        // Estimar volumen peatonal (rápido, sin API externa)
        const volumenPeatonal = estimarVolumenPeatonal(plaza.rating, plaza.totalReviews, nseEstimado);

        // Calcular score de viabilidad
        const { score, clasificacion, factoresPositivos, factoresNegativos } = calcularScoreOportunidad({
          rating: plaza.rating,
          totalReviews: plaza.totalReviews,
          distanciaCT: distanciaCTMin,
          distanciaKFC: distanciaKFCMin,
          competidoresEn2km,
          nse: nseEstimado,
          volumenPeatonal: volumenPeatonal.estimado,
        });

        todasLasOportunidades.push({
          placeId: plaza.placeId,
          nombre: plaza.name,
          direccion: plaza.address,
          lat: plaza.lat,
          lng: plaza.lng,
          rating: plaza.rating,
          totalReviews: plaza.totalReviews,
          zonaOrigen: zona.nombre,
          municipio: municipioNombre,
          nseEstimado,
          nseColor,
          distanciaCTMasCercano: Math.round(distanciaCTMin * 100) / 100,
          sucursalCTMasCercana: sucursalCTCercana,
          distanciaKFCMasCercano: Math.round(distanciaKFCMin * 100) / 100,
          competidoresEn2km,
          volumenPeatonal,
          scoreViabilidad: score,
          clasificacion,
          factoresPositivos,
          factoresNegativos,
        });
      }

      // Rate limiting entre zonas
      await new Promise(r => setTimeout(r, 300));

      // Si ya tenemos suficientes oportunidades excelentes, parar
      const excelentes = todasLasOportunidades.filter(o => o.clasificacion === 'EXCELENTE');
      if (excelentes.length >= limite) break;
    }

    // Ordenar por score y limitar
    todasLasOportunidades.sort((a, b) => b.scoreViabilidad - a.scoreViabilidad);
    const mejoresOportunidades = todasLasOportunidades.slice(0, limite);

    // Generar resumen
    const resumen = {
      totalEscaneadas: placeIdsVistos.size,
      totalFiltradas: todasLasOportunidades.length,
      mejoresEncontradas: mejoresOportunidades.length,
      distribucionClasificacion: {
        excelentes: mejoresOportunidades.filter(o => o.clasificacion === 'EXCELENTE').length,
        buenas: mejoresOportunidades.filter(o => o.clasificacion === 'BUENA').length,
        evaluar: mejoresOportunidades.filter(o => o.clasificacion === 'EVALUAR').length,
        riesgosas: mejoresOportunidades.filter(o => o.clasificacion === 'RIESGOSA').length,
      },
      scorePromedio: Math.round(
        mejoresOportunidades.reduce((sum, o) => sum + o.scoreViabilidad, 0) / mejoresOportunidades.length
      ),
      mejorScore: mejoresOportunidades[0]?.scoreViabilidad || 0,
    };

    return NextResponse.json({
      success: true,
      filtros: {
        limite,
        nseMinimo,
        distanciaMinCT,
      },
      resumen,
      oportunidades: mejoresOportunidades,
    });

  } catch (error) {
    console.error('Error en descubrimiento de oportunidades:', error);
    return NextResponse.json({
      success: false,
      error: 'Error escaneando oportunidades',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * Estima el volumen peatonal basado en datos de Google Places
 */
function estimarVolumenPeatonal(rating?: number, totalReviews?: number, nse?: string): {
  estimado: number;
  nivel: string;
  color: string;
  fuente: 'besttime' | 'estimado';
} {
  let estimado = 50; // Base

  // Reviews como proxy de tráfico (principal indicador)
  if (totalReviews) {
    if (totalReviews > 5000) estimado += 30;
    else if (totalReviews > 2000) estimado += 25;
    else if (totalReviews > 1000) estimado += 20;
    else if (totalReviews > 500) estimado += 15;
    else if (totalReviews > 200) estimado += 10;
    else if (totalReviews < 50) estimado -= 15;
    else if (totalReviews < 100) estimado -= 10;
  }

  // Rating como indicador de calidad/atracción
  if (rating) {
    if (rating >= 4.5) estimado += 10;
    else if (rating >= 4.0) estimado += 5;
    else if (rating < 3.5) estimado -= 10;
  }

  // NSE afecta capacidad de gasto pero no necesariamente tráfico
  if (nse === 'A' || nse === 'B') estimado += 5;

  // Normalizar
  estimado = Math.max(0, Math.min(100, estimado));

  // Determinar nivel
  const nivelInfo = getNivelAfluencia(estimado);

  return {
    estimado,
    nivel: nivelInfo.texto,
    color: nivelInfo.color,
    fuente: 'estimado',
  };
}

/**
 * Obtiene datos reales de BestTime (más lento, usa créditos API)
 */
async function obtenerVolumenPeatonalReal(
  nombre: string,
  direccion: string
): Promise<{
  estimado: number;
  nivel: string;
  color: string;
  fuente: 'besttime' | 'estimado';
  promedioSemanal?: number;
  mejorDia?: string;
  horasPico?: string;
} | null> {
  try {
    const afluencia = await analizarAfluenciaPlaza(nombre, direccion);
    if (!afluencia) return null;

    const nivelInfo = getNivelAfluencia(afluencia.promedioSemanal);

    // Formatear horas pico
    const horasPicoStr = afluencia.horasPico.length > 0
      ? afluencia.horasPico.slice(0, 3).map(h => `${h.inicio}:00-${h.fin}:00`).join(', ')
      : 'No disponible';

    return {
      estimado: afluencia.promedioSemanal,
      nivel: nivelInfo.texto,
      color: nivelInfo.color,
      fuente: 'besttime',
      promedioSemanal: afluencia.promedioSemanal,
      mejorDia: afluencia.mejorDia,
      horasPico: horasPicoStr,
    };
  } catch (error) {
    console.error('Error obteniendo datos BestTime:', error);
    return null;
  }
}

/**
 * Calcula el score de viabilidad para una oportunidad
 */
function calcularScoreOportunidad(params: {
  rating?: number;
  totalReviews?: number;
  distanciaCT: number;
  distanciaKFC: number;
  competidoresEn2km: number;
  nse: string;
  volumenPeatonal: number;
}): {
  score: number;
  clasificacion: 'EXCELENTE' | 'BUENA' | 'EVALUAR' | 'RIESGOSA';
  factoresPositivos: string[];
  factoresNegativos: string[];
} {
  let score = 40; // Base reducido para dar más peso a otros factores
  const factoresPositivos: string[] = [];
  const factoresNegativos: string[] = [];

  // NSE (20 puntos)
  const nseScores: Record<string, number> = { 'A': 20, 'B': 16, 'C+': 12, 'C': 8, 'D': 0 };
  const nseScore = nseScores[params.nse] || 8;
  score += nseScore;
  if (nseScore >= 16) {
    factoresPositivos.push(`Zona NSE ${params.nse} - alto poder adquisitivo`);
  } else if (nseScore <= 8) {
    factoresNegativos.push(`Zona NSE ${params.nse} - menor poder adquisitivo`);
  }

  // Volumen Peatonal (15 puntos) - NUEVO FACTOR PRINCIPAL
  if (params.volumenPeatonal >= 70) {
    score += 15;
    factoresPositivos.push(`Alto volumen peatonal (${params.volumenPeatonal}%)`);
  } else if (params.volumenPeatonal >= 50) {
    score += 10;
    factoresPositivos.push(`Buen volumen peatonal (${params.volumenPeatonal}%)`);
  } else if (params.volumenPeatonal >= 30) {
    score += 5;
  } else {
    score -= 5;
    factoresNegativos.push(`Bajo volumen peatonal (${params.volumenPeatonal}%)`);
  }

  // Distancia a Crispy Tenders existente (15 puntos)
  if (params.distanciaCT > 5) {
    score += 15;
    factoresPositivos.push(`Sin CT en 5km - mercado virgen`);
  } else if (params.distanciaCT > 3) {
    score += 10;
    factoresPositivos.push(`CT más cercano a ${params.distanciaCT.toFixed(1)}km`);
  } else {
    score += 5;
  }

  // Distancia a KFC (10 puntos)
  if (params.distanciaKFC > 2) {
    score += 10;
    factoresPositivos.push(`Sin KFC en 2km`);
  } else if (params.distanciaKFC > 1) {
    score += 7;
    factoresPositivos.push(`KFC a ${params.distanciaKFC.toFixed(1)}km`);
  } else if (params.distanciaKFC > 0.5) {
    score += 3;
    factoresNegativos.push(`KFC cercano (${(params.distanciaKFC * 1000).toFixed(0)}m)`);
  } else {
    score -= 5;
    factoresNegativos.push(`KFC muy cercano (${(params.distanciaKFC * 1000).toFixed(0)}m)`);
  }

  // Competidores en 2km (10 puntos)
  if (params.competidoresEn2km === 0) {
    score += 10;
    factoresPositivos.push(`Sin competencia directa en 2km`);
  } else if (params.competidoresEn2km <= 2) {
    score += 5;
  } else if (params.competidoresEn2km > 4) {
    score -= 5;
    factoresNegativos.push(`Zona saturada (${params.competidoresEn2km} competidores)`);
  }

  // Rating de la plaza (10 puntos)
  if (params.rating && params.rating >= 4.5) {
    score += 10;
    factoresPositivos.push(`Plaza bien valorada (${params.rating}★)`);
  } else if (params.rating && params.rating >= 4.0) {
    score += 5;
  } else if (params.rating && params.rating < 3.5) {
    score -= 5;
    factoresNegativos.push(`Plaza con rating bajo (${params.rating}★)`);
  }

  // Normalizar
  score = Math.max(0, Math.min(100, score));

  // Clasificar
  let clasificacion: 'EXCELENTE' | 'BUENA' | 'EVALUAR' | 'RIESGOSA';
  if (score >= 80) clasificacion = 'EXCELENTE';
  else if (score >= 65) clasificacion = 'BUENA';
  else if (score >= 50) clasificacion = 'EVALUAR';
  else clasificacion = 'RIESGOSA';

  return { score, clasificacion, factoresPositivos, factoresNegativos };
}
