import { NextRequest, NextResponse } from 'next/server';
import {
  buscarLugaresCercanos,
  buscarCompetidoresPollo,
  obtenerDetallesLugar,
  analizarCompetenciaZona,
  formatearPrecio
} from '@/lib/google-places';

/**
 * GET /api/google-places
 *
 * Consulta datos REALES de Google Places API
 *
 * Query params:
 * - tipo: 'buscar' | 'detalles' | 'competidores' | 'analisis'
 * - lat: Latitud
 * - lng: Longitud
 * - radio: Radio en metros (default 3000)
 * - keyword: Palabra clave para búsqueda
 * - placeId: ID de lugar para detalles
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const tipo = searchParams.get('tipo') || 'buscar';
  const lat = parseFloat(searchParams.get('lat') || '25.6866');
  const lng = parseFloat(searchParams.get('lng') || '-100.3161');
  const radio = parseInt(searchParams.get('radio') || '3000');
  const keyword = searchParams.get('keyword') || undefined;
  const placeId = searchParams.get('placeId') || undefined;

  try {
    switch (tipo) {
      case 'buscar': {
        const resultados = await buscarLugaresCercanos(lat, lng, radio, keyword);

        return NextResponse.json({
          success: true,
          total: resultados.length,
          centro: { lat, lng },
          radioMetros: radio,
          keyword,
          resultados: resultados.map(r => ({
            ...r,
            precioTexto: formatearPrecio(r.priceLevel)
          }))
        });
      }

      case 'competidores': {
        const competidores = await buscarCompetidoresPollo(lat, lng, radio);

        return NextResponse.json({
          success: true,
          total: competidores.length,
          centro: { lat, lng },
          radioMetros: radio,
          competidores: competidores.map(c => ({
            ...c,
            precioTexto: formatearPrecio(c.priceLevel)
          }))
        });
      }

      case 'detalles': {
        if (!placeId) {
          return NextResponse.json(
            { success: false, error: 'Se requiere placeId para obtener detalles' },
            { status: 400 }
          );
        }

        const detalles = await obtenerDetallesLugar(placeId);

        if (!detalles) {
          return NextResponse.json(
            { success: false, error: 'No se encontró el lugar' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          lugar: {
            ...detalles,
            precioTexto: formatearPrecio(detalles.priceLevel)
          }
        });
      }

      case 'analisis': {
        const analisis = await analizarCompetenciaZona(lat, lng, radio);

        return NextResponse.json({
          success: true,
          centro: { lat, lng },
          radioMetros: radio,
          ...analisis,
          competidores: analisis.competidores.map(c => ({
            ...c,
            precioTexto: formatearPrecio(c.priceLevel)
          }))
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Tipo no válido. Use: buscar, competidores, detalles, analisis' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error en API google-places:', error);
    return NextResponse.json(
      { success: false, error: 'Error consultando Google Places API' },
      { status: 500 }
    );
  }
}
