import { NextRequest, NextResponse } from 'next/server';
import {
  obtenerCensoEconomico,
  obtenerDatosVivienda,
  obtenerIndicadoresEconomicos,
  obtenerComparativaMunicipios,
  calcularScoreEconomico,
  getNivelEconomicoInfo,
  obtenerMunicipioIdPorCoordenadas,
  MUNICIPIOS_NL,
} from '@/lib/datamexico';

/**
 * API Route para Data México - Datos económicos oficiales
 * API pública - No requiere autenticación
 *
 * Endpoints:
 * - GET /api/datamexico?tipo=censo&municipioId=19039
 * - GET /api/datamexico?tipo=vivienda&municipioId=19039
 * - GET /api/datamexico?tipo=indicadores&municipioId=19039
 * - GET /api/datamexico?tipo=indicadores&lat=25.6866&lng=-100.3161
 * - GET /api/datamexico?tipo=comparativa
 * - GET /api/datamexico?tipo=municipios
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tipo = searchParams.get('tipo');

  try {
    switch (tipo) {
      case 'censo': {
        const municipioId = searchParams.get('municipioId');

        if (!municipioId) {
          return NextResponse.json({
            success: false,
            error: 'Parámetro requerido: municipioId',
          }, { status: 400 });
        }

        const censo = await obtenerCensoEconomico(municipioId);

        if (!censo) {
          return NextResponse.json({
            success: false,
            error: 'No se encontraron datos del censo para este municipio',
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          tipo: 'censo',
          data: censo,
        });
      }

      case 'vivienda': {
        const municipioId = searchParams.get('municipioId');

        if (!municipioId) {
          return NextResponse.json({
            success: false,
            error: 'Parámetro requerido: municipioId',
          }, { status: 400 });
        }

        const vivienda = await obtenerDatosVivienda(municipioId);

        if (!vivienda) {
          return NextResponse.json({
            success: false,
            error: 'No se encontraron datos de vivienda para este municipio',
          }, { status: 404 });
        }

        // Calcular porcentajes
        const pctInternet = vivienda.viviendasParticulares > 0
          ? Math.round((vivienda.conInternet / vivienda.viviendasParticulares) * 100)
          : 0;
        const pctComputadora = vivienda.viviendasParticulares > 0
          ? Math.round((vivienda.conComputadora / vivienda.viviendasParticulares) * 100)
          : 0;
        const pctAutomovil = vivienda.viviendasParticulares > 0
          ? Math.round((vivienda.conAutomovil / vivienda.viviendasParticulares) * 100)
          : 0;

        return NextResponse.json({
          success: true,
          tipo: 'vivienda',
          data: {
            ...vivienda,
            porcentajes: {
              internet: pctInternet,
              computadora: pctComputadora,
              automovil: pctAutomovil,
            },
          },
        });
      }

      case 'indicadores': {
        let municipioId = searchParams.get('municipioId');
        const lat = parseFloat(searchParams.get('lat') || '');
        const lng = parseFloat(searchParams.get('lng') || '');

        // Si no hay municipioId pero hay coordenadas, determinar el municipio
        if (!municipioId && !isNaN(lat) && !isNaN(lng)) {
          municipioId = obtenerMunicipioIdPorCoordenadas(lat, lng);
        }

        if (!municipioId) {
          return NextResponse.json({
            success: false,
            error: 'Parámetro requerido: municipioId o (lat, lng)',
          }, { status: 400 });
        }

        const indicadores = await obtenerIndicadoresEconomicos(municipioId);

        if (!indicadores) {
          return NextResponse.json({
            success: false,
            error: 'No se encontraron indicadores para este municipio',
          }, { status: 404 });
        }

        const { score, factores } = calcularScoreEconomico(indicadores);
        const nivelInfo = getNivelEconomicoInfo(indicadores.nivelEconomicoEstimado);

        return NextResponse.json({
          success: true,
          tipo: 'indicadores',
          data: {
            ...indicadores,
            nivelTexto: nivelInfo.texto,
            nivelColor: nivelInfo.color,
            score,
            factores,
          },
        });
      }

      case 'comparativa': {
        const comparativa = await obtenerComparativaMunicipios();

        return NextResponse.json({
          success: true,
          tipo: 'comparativa',
          total: comparativa.length,
          data: comparativa.map(ind => {
            const nivelInfo = getNivelEconomicoInfo(ind.nivelEconomicoEstimado);
            const { score } = calcularScoreEconomico(ind);
            return {
              ...ind,
              nivelTexto: nivelInfo.texto,
              nivelColor: nivelInfo.color,
              score,
            };
          }),
        });
      }

      case 'municipios': {
        return NextResponse.json({
          success: true,
          tipo: 'municipios',
          data: Object.entries(MUNICIPIOS_NL).map(([id, info]) => ({
            id,
            ...info,
          })),
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Tipo no válido. Opciones: censo, vivienda, indicadores, comparativa, municipios',
          ejemplos: {
            censo: '/api/datamexico?tipo=censo&municipioId=19039',
            vivienda: '/api/datamexico?tipo=vivienda&municipioId=19039',
            indicadores: '/api/datamexico?tipo=indicadores&municipioId=19039',
            indicadoresPorCoords: '/api/datamexico?tipo=indicadores&lat=25.6866&lng=-100.3161',
            comparativa: '/api/datamexico?tipo=comparativa',
            municipios: '/api/datamexico?tipo=municipios',
          },
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error en Data México API:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
