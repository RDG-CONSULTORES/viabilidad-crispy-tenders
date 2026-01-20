import { NextRequest, NextResponse } from 'next/server';
import {
  obtenerDatosCompletosMunicipio,
  calcularScoreZona,
  buscarPorCodigoPostal,
  obtenerPoblacionNL,
  obtenerIndiceSeguridadNL,
  estimarNSEPorCP
} from '@/lib/apis-gratuitas';

/**
 * GET /api/datos-zona
 *
 * Obtiene datos demográficos, económicos y de seguridad para una zona
 *
 * Query params:
 * - municipio: Nombre del municipio (ej: "Guadalupe")
 * - cp: Código postal (opcional, para datos más específicos)
 * - tipo: 'completo' | 'score' | 'seguridad' | 'poblacion'
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const municipio = searchParams.get('municipio') || 'Monterrey';
  const codigoPostal = searchParams.get('cp') || undefined;
  const tipo = searchParams.get('tipo') || 'completo';

  try {
    switch (tipo) {
      case 'completo': {
        const datos = await obtenerDatosCompletosMunicipio(municipio);
        const score = await calcularScoreZona(municipio, codigoPostal);

        let datosCP = null;
        if (codigoPostal) {
          datosCP = await buscarPorCodigoPostal(codigoPostal);
        }

        return NextResponse.json({
          success: true,
          municipio,
          codigoPostal,
          datos,
          score,
          colonias: datosCP,
          metadata: {
            fuentes: [
              'INEGI Censo de Población 2020',
              'INEGI Censo Económico 2019',
              'SNSP Incidencia Delictiva 2024',
              'SEPOMEX Códigos Postales'
            ],
            actualizacion: new Date().toISOString(),
            disclaimer: 'Algunos datos son estimaciones. Verificar con fuentes oficiales para decisiones de inversión.'
          }
        });
      }

      case 'score': {
        const score = await calcularScoreZona(municipio, codigoPostal);
        return NextResponse.json({
          success: true,
          municipio,
          score
        });
      }

      case 'seguridad': {
        const seguridad = await obtenerIndiceSeguridadNL();
        return NextResponse.json({
          success: true,
          datos: seguridad[municipio] || null,
          todosLosMunicipios: seguridad
        });
      }

      case 'poblacion': {
        const poblacion = await obtenerPoblacionNL();
        return NextResponse.json({
          success: true,
          municipio,
          poblacion: poblacion[municipio] || null,
          todosLosMunicipios: poblacion,
          fuente: 'INEGI Censo 2020'
        });
      }

      case 'nse': {
        if (!codigoPostal) {
          return NextResponse.json(
            { success: false, error: 'Se requiere código postal (cp) para estimar NSE' },
            { status: 400 }
          );
        }
        const nse = estimarNSEPorCP(codigoPostal);
        const colonias = await buscarPorCodigoPostal(codigoPostal);

        return NextResponse.json({
          success: true,
          codigoPostal,
          nse: nse.nse,
          confianza: `${Math.round(nse.confianza * 100)}%`,
          colonias
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Tipo no válido. Use: completo, score, seguridad, poblacion, nse' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error en API datos-zona:', error);
    return NextResponse.json(
      { success: false, error: 'Error obteniendo datos de zona' },
      { status: 500 }
    );
  }
}
