import { NextRequest, NextResponse } from 'next/server';
import {
  buscarCompetidoresPollo,
  buscarCadenasCompetencia,
  contarRestaurantesEnZona,
  convertirACompetidor,
  calcularDistanciaKm
} from '@/lib/inegi-api';

/**
 * GET /api/competidores
 *
 * Query params:
 * - lat: Latitud central
 * - lng: Longitud central
 * - radio: Radio en metros (default 3000)
 * - tipo: 'zona' | 'cadenas' | 'conteo'
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const tipo = searchParams.get('tipo') || 'zona';
  const lat = parseFloat(searchParams.get('lat') || '25.6866');
  const lng = parseFloat(searchParams.get('lng') || '-100.3161');
  const radio = parseInt(searchParams.get('radio') || '3000');

  try {
    switch (tipo) {
      case 'zona': {
        // Buscar competidores en un radio específico
        const unidades = await buscarCompetidoresPollo(lat, lng, radio);
        const competidores = unidades.map(u => {
          const comp = convertirACompetidor(u);
          return {
            ...comp,
            distanciaKm: calcularDistanciaKm(lat, lng, comp.lat, comp.lng)
          };
        });

        // Ordenar por distancia
        competidores.sort((a, b) => a.distanciaKm - b.distanciaKm);

        return NextResponse.json({
          success: true,
          total: competidores.length,
          centro: { lat, lng },
          radioMetros: radio,
          competidores
        });
      }

      case 'cadenas': {
        // Buscar todas las cadenas principales en Nuevo León
        const cadenas = await buscarCadenasCompetencia();

        const resultado = {
          kfc: cadenas.kfc.map(u => convertirACompetidor(u)),
          wingstop: cadenas.wingstop.map(u => convertirACompetidor(u)),
          polloLoco: cadenas.polloLoco.map(u => convertirACompetidor(u)),
          totales: {
            kfc: cadenas.kfc.length,
            wingstop: cadenas.wingstop.length,
            polloLoco: cadenas.polloLoco.length
          }
        };

        return NextResponse.json({
          success: true,
          ...resultado
        });
      }

      case 'conteo': {
        // Solo contar competidores en la zona
        const conteo = await contarRestaurantesEnZona(lat, lng, radio);

        return NextResponse.json({
          success: true,
          centro: { lat, lng },
          radioMetros: radio,
          ...conteo
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Tipo no válido. Use: zona, cadenas, conteo' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error en API competidores:', error);
    return NextResponse.json(
      { success: false, error: 'Error consultando INEGI DENUE' },
      { status: 500 }
    );
  }
}
