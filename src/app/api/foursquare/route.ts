import { NextRequest, NextResponse } from 'next/server';
import {
  buscarLugares,
  obtenerDetallesLugar,
  buscarCompetidoresPollo,
  analizarServiciosArea,
  analizarPlazaFoursquare,
  obtenerTips,
  getDensidadInfo,
  getNivelPrecio,
} from '@/lib/foursquare';

/**
 * API Route para Foursquare - Reviews y categorías
 *
 * Endpoints:
 * - GET /api/foursquare?tipo=buscar&lat=25.6866&lng=-100.3161&query=plaza
 * - GET /api/foursquare?tipo=detalles&fsqId=xxx
 * - GET /api/foursquare?tipo=competidores&lat=25.6866&lng=-100.3161
 * - GET /api/foursquare?tipo=servicios&lat=25.6866&lng=-100.3161
 * - GET /api/foursquare?tipo=analisis&nombre=Plaza&lat=25.6866&lng=-100.3161
 * - GET /api/foursquare?tipo=tips&fsqId=xxx
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tipo = searchParams.get('tipo');

  try {
    switch (tipo) {
      case 'buscar': {
        const lat = parseFloat(searchParams.get('lat') || '');
        const lng = parseFloat(searchParams.get('lng') || '');
        const query = searchParams.get('query') || undefined;
        const radio = parseInt(searchParams.get('radio') || '2000');
        const limite = parseInt(searchParams.get('limite') || '20');
        const categorias = searchParams.get('categorias')?.split(',');

        if (isNaN(lat) || isNaN(lng)) {
          return NextResponse.json({
            success: false,
            error: 'Parámetros requeridos: lat, lng',
          }, { status: 400 });
        }

        const lugares = await buscarLugares(lat, lng, query, categorias, radio, limite);

        return NextResponse.json({
          success: true,
          tipo: 'buscar',
          centro: { lat, lng },
          radio,
          total: lugares.length,
          lugares: lugares.map(l => ({
            fsqId: l.fsq_id,
            nombre: l.name,
            categorias: l.categories.map(c => c.name),
            direccion: l.location.formatted_address,
            lat: l.geocodes.main.latitude,
            lng: l.geocodes.main.longitude,
            distancia: l.distance,
            rating: l.rating,
            precio: l.price,
            precioTexto: getNivelPrecio(l.price),
          })),
        });
      }

      case 'detalles': {
        const fsqId = searchParams.get('fsqId');

        if (!fsqId) {
          return NextResponse.json({
            success: false,
            error: 'Parámetro requerido: fsqId',
          }, { status: 400 });
        }

        const lugar = await obtenerDetallesLugar(fsqId);

        if (!lugar) {
          return NextResponse.json({
            success: false,
            error: 'Lugar no encontrado',
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          tipo: 'detalles',
          data: {
            fsqId: lugar.fsq_id,
            nombre: lugar.name,
            categorias: lugar.categories.map(c => c.name),
            direccion: lugar.location.formatted_address,
            lat: lugar.geocodes.main.latitude,
            lng: lugar.geocodes.main.longitude,
            rating: lugar.rating,
            precio: lugar.price,
            precioTexto: getNivelPrecio(lugar.price),
            popularidad: lugar.popularity,
            verificado: lugar.verified,
            estadisticas: lugar.stats,
            horario: lugar.hours,
            horasPopulares: lugar.hours_popular,
            caracteristicas: lugar.features,
            tastes: lugar.tastes,
          },
        });
      }

      case 'competidores': {
        const lat = parseFloat(searchParams.get('lat') || '');
        const lng = parseFloat(searchParams.get('lng') || '');
        const radio = parseInt(searchParams.get('radio') || '2000');

        if (isNaN(lat) || isNaN(lng)) {
          return NextResponse.json({
            success: false,
            error: 'Parámetros requeridos: lat, lng',
          }, { status: 400 });
        }

        const competidores = await buscarCompetidoresPollo(lat, lng, radio);

        // Agrupar por cadena
        const porCadena: Record<string, number> = {};
        for (const comp of competidores) {
          const nombre = comp.name.toLowerCase();
          if (nombre.includes('kfc') || nombre.includes('kentucky')) {
            porCadena['KFC'] = (porCadena['KFC'] || 0) + 1;
          } else if (nombre.includes('pollo loco')) {
            porCadena['Pollo Loco'] = (porCadena['Pollo Loco'] || 0) + 1;
          } else if (nombre.includes('wingstop')) {
            porCadena['Wingstop'] = (porCadena['Wingstop'] || 0) + 1;
          } else if (nombre.includes('church')) {
            porCadena["Church's"] = (porCadena["Church's"] || 0) + 1;
          } else if (nombre.includes('buffalo')) {
            porCadena['Buffalo Wild Wings'] = (porCadena['Buffalo Wild Wings'] || 0) + 1;
          } else {
            porCadena['Otros'] = (porCadena['Otros'] || 0) + 1;
          }
        }

        return NextResponse.json({
          success: true,
          tipo: 'competidores',
          centro: { lat, lng },
          radio,
          total: competidores.length,
          porCadena,
          competidores: competidores.map(c => ({
            fsqId: c.fsq_id,
            nombre: c.name,
            direccion: c.location.formatted_address,
            distancia: c.distance,
            rating: c.rating,
          })),
        });
      }

      case 'servicios': {
        const lat = parseFloat(searchParams.get('lat') || '');
        const lng = parseFloat(searchParams.get('lng') || '');
        const radio = parseInt(searchParams.get('radio') || '1000');

        if (isNaN(lat) || isNaN(lng)) {
          return NextResponse.json({
            success: false,
            error: 'Parámetros requeridos: lat, lng',
          }, { status: 400 });
        }

        const servicios = await analizarServiciosArea(lat, lng, radio);
        const densidadInfo = getDensidadInfo(servicios.densidadComercial);

        return NextResponse.json({
          success: true,
          tipo: 'servicios',
          centro: { lat, lng },
          radio,
          servicios: {
            ...servicios,
            densidadTexto: densidadInfo.texto,
            densidadColor: densidadInfo.color,
          },
        });
      }

      case 'analisis': {
        const nombre = searchParams.get('nombre');
        const lat = parseFloat(searchParams.get('lat') || '');
        const lng = parseFloat(searchParams.get('lng') || '');

        if (!nombre || isNaN(lat) || isNaN(lng)) {
          return NextResponse.json({
            success: false,
            error: 'Parámetros requeridos: nombre, lat, lng',
          }, { status: 400 });
        }

        const analisis = await analizarPlazaFoursquare(nombre, lat, lng);

        if (!analisis) {
          return NextResponse.json({
            success: false,
            error: 'No se pudo analizar la plaza',
          }, { status: 404 });
        }

        const densidadInfo = getDensidadInfo(analisis.serviciosArea.densidadComercial);

        return NextResponse.json({
          success: true,
          tipo: 'analisis',
          data: {
            plaza: analisis.lugar ? {
              fsqId: analisis.lugar.fsq_id,
              nombre: analisis.lugar.name,
              direccion: analisis.lugar.location.formatted_address,
              rating: analisis.rating,
              popularidad: analisis.popularidad,
              precio: analisis.precio,
              precioTexto: getNivelPrecio(analisis.precio),
            } : null,
            competidoresPollo: analisis.competidoresPollo,
            serviciosArea: {
              ...analisis.serviciosArea,
              densidadTexto: densidadInfo.texto,
              densidadColor: densidadInfo.color,
            },
            tips: analisis.tips,
            score: analisis.score,
          },
        });
      }

      case 'tips': {
        const fsqId = searchParams.get('fsqId');
        const limite = parseInt(searchParams.get('limite') || '10');

        if (!fsqId) {
          return NextResponse.json({
            success: false,
            error: 'Parámetro requerido: fsqId',
          }, { status: 400 });
        }

        const tips = await obtenerTips(fsqId, limite);

        return NextResponse.json({
          success: true,
          tipo: 'tips',
          fsqId,
          total: tips.length,
          tips,
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Tipo no válido. Opciones: buscar, detalles, competidores, servicios, analisis, tips',
          ejemplos: {
            buscar: '/api/foursquare?tipo=buscar&lat=25.6866&lng=-100.3161&query=plaza',
            detalles: '/api/foursquare?tipo=detalles&fsqId=xxx',
            competidores: '/api/foursquare?tipo=competidores&lat=25.6866&lng=-100.3161',
            servicios: '/api/foursquare?tipo=servicios&lat=25.6866&lng=-100.3161',
            analisis: '/api/foursquare?tipo=analisis&nombre=Plaza+Fiesta&lat=25.6866&lng=-100.3161',
            tips: '/api/foursquare?tipo=tips&fsqId=xxx',
          },
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error en Foursquare API:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
