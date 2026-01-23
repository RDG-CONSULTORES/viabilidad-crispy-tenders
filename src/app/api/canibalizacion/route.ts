import { NextRequest, NextResponse } from 'next/server';
import { analizarCanibalizacion, getSucursalesEnRiesgo, calcularDistanciaMinimaRecomendada } from '@/lib/canibalizacion';
import { PLAZAS_MTY } from '@/data/plazas';

/**
 * API Route para Análisis de Canibalización
 *
 * Endpoints:
 * - GET /api/canibalizacion?plazaId=plaza-006
 * - GET /api/canibalizacion?lat=25.7231&lng=-100.2005&nombre=Nueva%20Ubicacion
 * - GET /api/canibalizacion?tipo=distancia-minima
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tipo = searchParams.get('tipo');
  const plazaId = searchParams.get('plazaId');
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');
  const nombre = searchParams.get('nombre') || 'Ubicación Propuesta';

  try {
    // Tipo: distancia mínima recomendada
    if (tipo === 'distancia-minima') {
      const resultado = calcularDistanciaMinimaRecomendada();
      return NextResponse.json({
        success: true,
        tipo: 'distancia-minima',
        data: resultado,
      });
    }

    // Análisis por plazaId
    if (plazaId) {
      const plaza = PLAZAS_MTY.find(p => p.id === plazaId);

      if (!plaza) {
        return NextResponse.json({
          success: false,
          error: `Plaza no encontrada: ${plazaId}`,
        }, { status: 404 });
      }

      const analisis = analizarCanibalizacion(plaza);

      return NextResponse.json({
        success: true,
        tipo: 'analisis',
        data: analisis,
      });
    }

    // Análisis por coordenadas
    if (!isNaN(lat) && !isNaN(lng)) {
      const ubicacion = {
        id: 'custom',
        nombre,
        lat,
        lng,
      };

      const analisis = analizarCanibalizacion(ubicacion);

      return NextResponse.json({
        success: true,
        tipo: 'analisis',
        data: analisis,
      });
    }

    // Sin parámetros válidos
    return NextResponse.json({
      success: false,
      error: 'Parámetros requeridos: plazaId o (lat, lng)',
      ejemplos: {
        porPlaza: '/api/canibalizacion?plazaId=plaza-006',
        porCoordenadas: '/api/canibalizacion?lat=25.7231&lng=-100.2005&nombre=Mi%20Ubicacion',
        distanciaMinima: '/api/canibalizacion?tipo=distancia-minima',
      },
    }, { status: 400 });

  } catch (error) {
    console.error('Error en análisis de canibalización:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
