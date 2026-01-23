import { NextRequest, NextResponse } from 'next/server';
import {
  analizarAfluenciaPlaza,
  buscarVenuesPorArea,
  obtenerForecastExistente,
  obtenerLive,
  getNivelAfluencia,
  calcularScoreAfluencia,
} from '@/lib/besttime';

/**
 * API Route para BestTime - Datos de afluencia
 *
 * Endpoints:
 * - GET /api/besttime?tipo=analisis&nombre=Plaza&direccion=Monterrey
 * - GET /api/besttime?tipo=buscar&lat=25.6866&lng=-100.3161&radio=2000
 * - GET /api/besttime?tipo=live&venueId=xxx
 * - GET /api/besttime?tipo=forecast&venueId=xxx
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tipo = searchParams.get('tipo');

  try {
    switch (tipo) {
      case 'analisis': {
        // Análisis completo de afluencia para una plaza
        const nombre = searchParams.get('nombre');
        const direccion = searchParams.get('direccion');

        if (!nombre || !direccion) {
          return NextResponse.json({
            success: false,
            error: 'Parámetros requeridos: nombre, direccion',
          }, { status: 400 });
        }

        const afluencia = await analizarAfluenciaPlaza(nombre, direccion);

        if (!afluencia) {
          return NextResponse.json({
            success: false,
            error: 'No se pudo obtener datos de afluencia para esta ubicación',
          }, { status: 404 });
        }

        const { score, factores } = calcularScoreAfluencia(afluencia);
        const nivel = getNivelAfluencia(afluencia.promedioSemanal);

        return NextResponse.json({
          success: true,
          tipo: 'analisis',
          data: {
            ...afluencia,
            score,
            factores,
            nivel,
          },
        });
      }

      case 'buscar': {
        // Buscar venues en un área
        const lat = parseFloat(searchParams.get('lat') || '');
        const lng = parseFloat(searchParams.get('lng') || '');
        const radio = parseInt(searchParams.get('radio') || '2000');
        const tipos = searchParams.get('tipos')?.split(',');

        if (isNaN(lat) || isNaN(lng)) {
          return NextResponse.json({
            success: false,
            error: 'Parámetros requeridos: lat, lng',
          }, { status: 400 });
        }

        const venues = await buscarVenuesPorArea(lat, lng, radio, tipos);

        return NextResponse.json({
          success: true,
          tipo: 'buscar',
          centro: { lat, lng },
          radio,
          total: venues.length,
          venues,
        });
      }

      case 'live': {
        // Datos en tiempo real de un venue
        const venueId = searchParams.get('venueId');

        if (!venueId) {
          return NextResponse.json({
            success: false,
            error: 'Parámetro requerido: venueId',
          }, { status: 400 });
        }

        const live = await obtenerLive(venueId);

        if (!live) {
          return NextResponse.json({
            success: false,
            error: 'No se pudo obtener datos live',
          }, { status: 404 });
        }

        const nivelActual = live.analysis.venue_live_busyness_available
          ? getNivelAfluencia(live.analysis.venue_live_busyness)
          : null;

        return NextResponse.json({
          success: true,
          tipo: 'live',
          data: {
            venueId: live.venue_info.venue_id,
            venueName: live.venue_info.venue_name,
            afluenciaActual: live.analysis.venue_live_busyness,
            afluenciaDisponible: live.analysis.venue_live_busyness_available,
            afluenciaPronosticada: live.analysis.venue_forecasted_busyness,
            nivel: nivelActual,
          },
        });
      }

      case 'forecast': {
        // Obtener forecast existente (sin costo - usa public key)
        const venueId = searchParams.get('venueId');

        if (!venueId) {
          return NextResponse.json({
            success: false,
            error: 'Parámetro requerido: venueId',
          }, { status: 400 });
        }

        const forecast = await obtenerForecastExistente(venueId);

        if (!forecast) {
          return NextResponse.json({
            success: false,
            error: 'No se encontró forecast para este venue',
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          tipo: 'forecast',
          data: forecast,
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Tipo no válido. Opciones: analisis, buscar, live, forecast',
          ejemplos: {
            analisis: '/api/besttime?tipo=analisis&nombre=Plaza+Fiesta&direccion=San+Nicolas,Monterrey',
            buscar: '/api/besttime?tipo=buscar&lat=25.6866&lng=-100.3161&radio=2000',
            live: '/api/besttime?tipo=live&venueId=ven_xxx',
            forecast: '/api/besttime?tipo=forecast&venueId=ven_xxx',
          },
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error en BestTime API:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
