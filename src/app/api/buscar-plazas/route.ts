import { NextRequest, NextResponse } from 'next/server';
import { buscarLugaresCercanos, buscarCompetidoresPollo, PlaceResult } from '@/lib/google-places';
import { analizarAccesibilidad } from '@/lib/mapbox';
import { obtenerRiesgoMunicipio, MUNICIPIOS_AMM } from '@/lib/apis-gobierno';
import { obtenerFlujoTrafico, HERETrafficFlow } from '@/lib/here';
import { analizarAfluenciaPlaza, calcularScoreAfluencia, getNivelAfluencia, AfluenciaData } from '@/lib/besttime';
import { analizarServiciosArea, getDensidadInfo } from '@/lib/foursquare';
import { obtenerIndicadoresEconomicos, calcularScoreEconomico, getNivelEconomicoInfo, obtenerMunicipioIdPorCoordenadas } from '@/lib/datamexico';

/**
 * GET /api/buscar-plazas
 *
 * Motor de búsqueda de plazas comerciales viables para Crispy Tenders
 *
 * Combina datos de:
 * - Google Places: Descubrimiento de plazas y competencia
 * - Mapbox: Análisis de accesibilidad (isocronas)
 * - CENAPRED: Riesgo natural
 * - Algoritmo de scoring propio
 *
 * Query params:
 * - lat: Latitud centro de búsqueda (default: centro MTY)
 * - lng: Longitud centro de búsqueda
 * - radio: Radio en metros (default: 10000 = 10km)
 * - nseMinimo: NSE mínimo ('A/B', 'C+', 'C', 'C-', 'D+')
 * - sinCompetencia: Si true, filtra plazas sin KFC/competencia directa cercana
 */

interface PlazaEnriquecida {
  // Datos básicos (Google Places)
  placeId: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  rating?: number;
  totalReviews?: number;
  isOpen?: boolean;

  // Accesibilidad (Mapbox)
  accesibilidad?: {
    poblacionCaminando10min: number;
    poblacionAuto10min: number;
    poblacionAuto15min: number;
    areaKm2Auto10min: number;
  };

  // Competencia (Google Places)
  competencia?: {
    kfcCercanos: number;
    polloLocoCercanos: number;
    competidorMasCercanoKm: number;
    totalCompetidores: number;
  };

  // Riesgo (CENAPRED)
  riesgo?: {
    inundacion: number;
    nivel: string;
  };

  // Tráfico (HERE)
  trafico?: {
    jamFactor: number;
    velocidadActualKmh: number;
    velocidadLibreKmh: number;
    nivel: 'fluido' | 'lento' | 'congestionado' | 'detenido';
    impactoDelivery: string;
  };

  // Afluencia (BestTime)
  afluencia?: {
    promedioSemanal: number;
    nivel: string;
    color: string;
    mejorDia: string;
    peorDia: string;
    horasPico: { inicio: number; fin: number; intensidad: number }[];
    score: number;
  };

  // Densidad Comercial (Foursquare)
  densidadComercial?: {
    nivel: string;
    color: string;
    servicios: {
      bancos: number;
      supermercados: number;
      farmacias: number;
      restaurantes: number;
      total: number;
    };
  };

  // Nivel Socioeconómico (Data México)
  nivelSocioeconomico?: {
    nivel: string;
    nivelTexto: string;
    color: string;
    salarioPromedio: number;
    empresasTotal: number;
    empleoTotal: number;
  };

  // Scoring
  score: number;
  clasificacion: 'EXCELENTE' | 'BUENA' | 'EVALUAR' | 'RIESGOSA';
  factoresPositivos: string[];
  factoresNegativos: string[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Parámetros
  const lat = parseFloat(searchParams.get('lat') || '25.6866'); // Centro MTY
  const lng = parseFloat(searchParams.get('lng') || '-100.3161');
  const radio = parseInt(searchParams.get('radio') || '10000'); // 10km default
  const sinCompetencia = searchParams.get('sinCompetencia') === 'true';
  const limite = parseInt(searchParams.get('limite') || '20');

  try {
    // 1. Buscar plazas comerciales con Google Places
    const plazasRaw = await buscarLugaresCercanos(
      lat, lng, radio,
      'plaza comercial centro comercial',
      'shopping_mall'
    );

    if (plazasRaw.length === 0) {
      return NextResponse.json({
        success: true,
        mensaje: 'No se encontraron plazas en el área especificada',
        total: 0,
        plazas: []
      });
    }

    // 2. Enriquecer cada plaza
    const plazasEnriquecidas: PlazaEnriquecida[] = [];

    for (const plaza of plazasRaw.slice(0, limite)) {
      const plazaEnriquecida = await enriquecerPlaza(plaza);

      // Filtrar por competencia si se solicita
      if (sinCompetencia && plazaEnriquecida.competencia) {
        if (plazaEnriquecida.competencia.kfcCercanos > 0 ||
            plazaEnriquecida.competencia.competidorMasCercanoKm < 0.5) {
          continue; // Saltar plazas con competencia directa
        }
      }

      plazasEnriquecidas.push(plazaEnriquecida);

      // Rate limiting para no saturar APIs
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // 3. Ordenar por score
    plazasEnriquecidas.sort((a, b) => b.score - a.score);

    // 4. Generar resumen
    const resumen = {
      totalEncontradas: plazasRaw.length,
      totalAnalizadas: plazasEnriquecidas.length,
      mejorScore: plazasEnriquecidas[0]?.score || 0,
      promedioScore: Math.round(
        plazasEnriquecidas.reduce((sum, p) => sum + p.score, 0) / plazasEnriquecidas.length
      ),
      excelentes: plazasEnriquecidas.filter(p => p.clasificacion === 'EXCELENTE').length,
      buenas: plazasEnriquecidas.filter(p => p.clasificacion === 'BUENA').length,
      evaluar: plazasEnriquecidas.filter(p => p.clasificacion === 'EVALUAR').length,
      riesgosas: plazasEnriquecidas.filter(p => p.clasificacion === 'RIESGOSA').length,
    };

    return NextResponse.json({
      success: true,
      busqueda: {
        centro: { lat, lng },
        radioMetros: radio,
        filtros: { sinCompetencia }
      },
      resumen,
      plazas: plazasEnriquecidas
    });

  } catch (error) {
    console.error('Error en búsqueda de plazas:', error);
    return NextResponse.json(
      { success: false, error: 'Error buscando plazas comerciales' },
      { status: 500 }
    );
  }
}

/**
 * Enriquece una plaza con datos de múltiples fuentes
 */
async function enriquecerPlaza(plaza: PlaceResult): Promise<PlazaEnriquecida> {
  const factoresPositivos: string[] = [];
  const factoresNegativos: string[] = [];
  let score = 50; // Base

  // 1. Obtener accesibilidad (Mapbox)
  let accesibilidad: PlazaEnriquecida['accesibilidad'];
  try {
    const analisis = await analizarAccesibilidad(plaza.lat, plaza.lng);
    if (analisis.poblacionEstimada) {
      accesibilidad = {
        poblacionCaminando10min: analisis.poblacionEstimada.caminando10min,
        poblacionAuto10min: analisis.poblacionEstimada.auto10min,
        poblacionAuto15min: analisis.poblacionEstimada.auto15min,
        areaKm2Auto10min: analisis.isocronas.auto10min?.areaKm2 || 0
      };

      // Scoring por accesibilidad
      if (accesibilidad.poblacionAuto10min > 50000) {
        score += 15;
        factoresPositivos.push(`Alta población alcanzable (${(accesibilidad.poblacionAuto10min / 1000).toFixed(0)}K en 10min)`);
      } else if (accesibilidad.poblacionAuto10min > 30000) {
        score += 10;
        factoresPositivos.push(`Buena población alcanzable (${(accesibilidad.poblacionAuto10min / 1000).toFixed(0)}K en 10min)`);
      } else if (accesibilidad.poblacionAuto10min < 15000) {
        score -= 10;
        factoresNegativos.push(`Baja población alcanzable (${(accesibilidad.poblacionAuto10min / 1000).toFixed(0)}K en 10min)`);
      }
    }
  } catch (e) {
    console.error('Error obteniendo accesibilidad:', e);
  }

  // 2. Obtener competencia cercana (Google Places)
  let competencia: PlazaEnriquecida['competencia'];
  try {
    const competidores = await buscarCompetidoresPollo(plaza.lat, plaza.lng, 2000); // 2km

    const kfcCercanos = competidores.filter(c =>
      c.name.toLowerCase().includes('kfc') ||
      c.name.toLowerCase().includes('kentucky')
    ).length;

    const polloLocoCercanos = competidores.filter(c =>
      c.name.toLowerCase().includes('pollo loco')
    ).length;

    // Encontrar competidor más cercano
    let competidorMasCercanoKm = 999;
    for (const comp of competidores) {
      const dist = calcularDistanciaKm(plaza.lat, plaza.lng, comp.lat, comp.lng);
      if (dist < competidorMasCercanoKm) {
        competidorMasCercanoKm = dist;
      }
    }

    competencia = {
      kfcCercanos,
      polloLocoCercanos,
      competidorMasCercanoKm: Math.round(competidorMasCercanoKm * 100) / 100,
      totalCompetidores: competidores.length
    };

    // Scoring por competencia
    if (kfcCercanos === 0) {
      score += 15;
      factoresPositivos.push('Sin KFC en radio de 2km');
    } else {
      score -= 10 * kfcCercanos;
      factoresNegativos.push(`${kfcCercanos} KFC en radio de 2km`);
    }

    if (competidorMasCercanoKm > 1) {
      score += 5;
      factoresPositivos.push('Competencia directa a más de 1km');
    } else if (competidorMasCercanoKm < 0.3) {
      score -= 15;
      factoresNegativos.push(`Competidor a solo ${(competidorMasCercanoKm * 1000).toFixed(0)}m`);
    }

  } catch (e) {
    console.error('Error obteniendo competencia:', e);
  }

  // 3. Obtener riesgo (CENAPRED)
  let riesgo: PlazaEnriquecida['riesgo'];
  const municipioId = obtenerMunicipioId(plaza.address);
  if (municipioId) {
    const riesgoData = obtenerRiesgoMunicipio(municipioId);
    if (riesgoData) {
      riesgo = {
        inundacion: riesgoData.riesgoInundacion,
        nivel: riesgoData.nivelRiesgo
      };

      // Scoring por riesgo
      if (riesgoData.nivelRiesgo === 'bajo') {
        score += 5;
        factoresPositivos.push('Bajo riesgo de inundación');
      } else if (riesgoData.nivelRiesgo === 'alto' || riesgoData.nivelRiesgo === 'muy_alto') {
        score -= 10;
        factoresNegativos.push(`Riesgo ${riesgoData.nivelRiesgo} de inundación`);
      }
    }
  }

  // 4. Obtener tráfico en tiempo real (HERE)
  let trafico: PlazaEnriquecida['trafico'];
  try {
    const flujoData = await obtenerFlujoTrafico(plaza.lat, plaza.lng);
    if (flujoData) {
      let impactoDelivery: string;
      if (flujoData.nivel === 'fluido') {
        impactoDelivery = 'Ideal para entregas rápidas';
      } else if (flujoData.nivel === 'lento') {
        impactoDelivery = 'Entregas con tiempos moderados';
      } else if (flujoData.nivel === 'congestionado') {
        impactoDelivery = 'Considerar tiempos extendidos';
      } else {
        impactoDelivery = 'Alto impacto en tiempos de entrega';
      }

      trafico = {
        jamFactor: flujoData.jamFactor,
        velocidadActualKmh: flujoData.velocidadActualKmh,
        velocidadLibreKmh: flujoData.velocidadLibreKmh,
        nivel: flujoData.nivel,
        impactoDelivery
      };

      // Scoring por tráfico
      if (flujoData.nivel === 'fluido') {
        score += 10;
        factoresPositivos.push('Tráfico fluido en la zona');
      } else if (flujoData.nivel === 'lento') {
        score += 5;
      } else if (flujoData.nivel === 'congestionado') {
        score -= 5;
        factoresNegativos.push('Zona con congestión frecuente');
      } else {
        score -= 10;
        factoresNegativos.push('Tráfico muy congestionado');
      }
    }
  } catch (e) {
    console.error('Error obteniendo tráfico:', e);
  }

  // 5. Obtener afluencia de personas (BestTime)
  let afluencia: PlazaEnriquecida['afluencia'];
  try {
    const afluenciaData = await analizarAfluenciaPlaza(plaza.name, plaza.address);
    if (afluenciaData) {
      const { score: afluenciaScore } = calcularScoreAfluencia(afluenciaData);
      const nivel = getNivelAfluencia(afluenciaData.promedioSemanal);

      afluencia = {
        promedioSemanal: afluenciaData.promedioSemanal,
        nivel: nivel.texto,
        color: nivel.color,
        mejorDia: afluenciaData.mejorDia,
        peorDia: afluenciaData.peorDia,
        horasPico: afluenciaData.horasPico.slice(0, 3), // Top 3 horas pico
        score: afluenciaScore
      };

      // Scoring por afluencia
      if (afluenciaData.promedioSemanal >= 70) {
        score += 15;
        factoresPositivos.push(`Muy alta afluencia (${afluenciaData.promedioSemanal}%)`);
      } else if (afluenciaData.promedioSemanal >= 50) {
        score += 10;
        factoresPositivos.push(`Buena afluencia (${afluenciaData.promedioSemanal}%)`);
      } else if (afluenciaData.promedioSemanal >= 30) {
        score += 5;
      } else {
        score -= 5;
        factoresNegativos.push(`Baja afluencia (${afluenciaData.promedioSemanal}%)`);
      }
    }
  } catch (e) {
    console.error('Error obteniendo afluencia:', e);
  }

  // 6. Obtener densidad comercial del área (Foursquare)
  let densidadComercial: PlazaEnriquecida['densidadComercial'];
  try {
    const serviciosData = await analizarServiciosArea(plaza.lat, plaza.lng, 1000);
    const densidadInfo = getDensidadInfo(serviciosData.densidadComercial);

    densidadComercial = {
      nivel: densidadInfo.texto,
      color: densidadInfo.color,
      servicios: {
        bancos: serviciosData.bancos,
        supermercados: serviciosData.supermercados,
        farmacias: serviciosData.farmacias,
        restaurantes: serviciosData.restaurantes,
        total: serviciosData.total,
      },
    };

    // Scoring por densidad comercial
    if (serviciosData.densidadComercial === 'muy_alta') {
      score += 10;
      factoresPositivos.push(`Zona con muy alta densidad comercial (${serviciosData.total} servicios)`);
    } else if (serviciosData.densidadComercial === 'alta') {
      score += 5;
      factoresPositivos.push(`Buena densidad comercial (${serviciosData.total} servicios)`);
    } else if (serviciosData.densidadComercial === 'baja') {
      score -= 5;
      factoresNegativos.push(`Baja densidad comercial en la zona`);
    }
  } catch (e) {
    console.error('Error obteniendo densidad comercial:', e);
  }

  // 7. Obtener nivel socioeconómico del municipio (Data México)
  let nivelSocioeconomico: PlazaEnriquecida['nivelSocioeconomico'];
  try {
    const municipioId = obtenerMunicipioIdPorCoordenadas(plaza.lat, plaza.lng);
    const indicadores = await obtenerIndicadoresEconomicos(municipioId);

    if (indicadores) {
      const nivelInfo = getNivelEconomicoInfo(indicadores.nivelEconomicoEstimado);
      const { score: nseScore } = calcularScoreEconomico(indicadores);

      nivelSocioeconomico = {
        nivel: indicadores.nivelEconomicoEstimado,
        nivelTexto: nivelInfo.texto,
        color: nivelInfo.color,
        salarioPromedio: indicadores.salarioPromedio,
        empresasTotal: indicadores.empresasTotal,
        empleoTotal: indicadores.empleoTotal,
      };

      // Scoring por nivel socioeconómico
      if (indicadores.nivelEconomicoEstimado === 'muy_alto') {
        score += 15;
        factoresPositivos.push(`Zona NSE muy alto (${nivelInfo.texto})`);
      } else if (indicadores.nivelEconomicoEstimado === 'alto') {
        score += 10;
        factoresPositivos.push(`Zona NSE alto (${nivelInfo.texto})`);
      } else if (indicadores.nivelEconomicoEstimado === 'medio') {
        score += 5;
      } else {
        score -= 5;
        factoresNegativos.push(`Zona NSE bajo (${nivelInfo.texto})`);
      }
    }
  } catch (e) {
    console.error('Error obteniendo nivel socioeconómico:', e);
  }

  // 8. Scoring por rating de la plaza
  if (plaza.rating) {
    if (plaza.rating >= 4.5) {
      score += 10;
      factoresPositivos.push(`Plaza bien valorada (${plaza.rating}★)`);
    } else if (plaza.rating >= 4.0) {
      score += 5;
    } else if (plaza.rating < 3.5) {
      score -= 5;
      factoresNegativos.push(`Plaza con rating bajo (${plaza.rating}★)`);
    }
  }

  // 9. Scoring por reviews (indicador de tráfico)
  if (plaza.totalReviews) {
    if (plaza.totalReviews > 1000) {
      score += 10;
      factoresPositivos.push(`Alto tráfico estimado (${plaza.totalReviews} reviews)`);
    } else if (plaza.totalReviews > 500) {
      score += 5;
    } else if (plaza.totalReviews < 100) {
      score -= 5;
      factoresNegativos.push('Bajo tráfico estimado');
    }
  }

  // Normalizar score
  score = Math.max(0, Math.min(100, score));

  // Clasificación
  let clasificacion: PlazaEnriquecida['clasificacion'];
  if (score >= 75) {
    clasificacion = 'EXCELENTE';
  } else if (score >= 60) {
    clasificacion = 'BUENA';
  } else if (score >= 45) {
    clasificacion = 'EVALUAR';
  } else {
    clasificacion = 'RIESGOSA';
  }

  return {
    placeId: plaza.placeId,
    nombre: plaza.name,
    direccion: plaza.address,
    lat: plaza.lat,
    lng: plaza.lng,
    rating: plaza.rating,
    totalReviews: plaza.totalReviews,
    isOpen: plaza.isOpen,
    accesibilidad,
    competencia,
    riesgo,
    trafico,
    afluencia,
    densidadComercial,
    nivelSocioeconomico,
    score,
    clasificacion,
    factoresPositivos,
    factoresNegativos
  };
}

/**
 * Obtiene el ID de municipio basado en la dirección
 */
function obtenerMunicipioId(direccion: string): string | null {
  const direccionLower = direccion.toLowerCase();

  for (const [key, value] of Object.entries(MUNICIPIOS_AMM)) {
    if (direccionLower.includes(value.nombre.toLowerCase())) {
      return value.id;
    }
  }

  // Default a Monterrey si no se encuentra
  if (direccionLower.includes('monterrey') || direccionLower.includes('mty')) {
    return '19039';
  }

  return null;
}

/**
 * Calcula distancia entre dos puntos (Haversine)
 */
function calcularDistanciaKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
