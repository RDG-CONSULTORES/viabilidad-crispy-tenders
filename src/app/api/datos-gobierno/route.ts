import { NextRequest, NextResponse } from 'next/server';
import {
  analizarZonaCompleta,
  obtenerIndicadoresNuevoLeon,
  obtenerRiesgoMunicipio,
  buscarAGEBCercano,
  MUNICIPIOS_AMM,
  RIESGO_MUNICIPIOS_NL,
  INDICADORES_CLAVE,
  obtenerIndicadorINEGI
} from '@/lib/apis-gobierno';

/**
 * GET /api/datos-gobierno
 *
 * Consulta datos de APIs de gobierno mexicano:
 * - Data México (economía)
 * - INEGI (indicadores, AGEB)
 * - CENAPRED (riesgos)
 *
 * Query params:
 * - tipo: 'analisis' | 'indicadores' | 'riesgo' | 'ageb' | 'municipios'
 * - lat: Latitud (para análisis y AGEB)
 * - lng: Longitud (para análisis y AGEB)
 * - municipioId: ID INEGI del municipio (ej: 19039 para Monterrey)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const tipo = searchParams.get('tipo') || 'analisis';
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const municipioId = searchParams.get('municipioId') || '';

  try {
    switch (tipo) {
      case 'analisis': {
        if (!lat || !lng || !municipioId) {
          return NextResponse.json(
            {
              success: false,
              error: 'Se requieren lat, lng y municipioId para análisis completo',
              ejemplo: '/api/datos-gobierno?tipo=analisis&lat=25.7225&lng=-100.1998&municipioId=19026'
            },
            { status: 400 }
          );
        }

        const analisis = await analizarZonaCompleta(lat, lng, municipioId);

        return NextResponse.json({
          success: true,
          tipo: 'analisis_completo',
          ...analisis
        });
      }

      case 'indicadores': {
        const indicadores = await obtenerIndicadoresNuevoLeon();

        return NextResponse.json({
          success: true,
          tipo: 'indicadores_nuevo_leon',
          estado: 'Nuevo León',
          indicadores,
          indicadoresDisponibles: Object.keys(INDICADORES_CLAVE)
        });
      }

      case 'indicador': {
        const indicadorId = searchParams.get('indicadorId');
        const areaGeo = searchParams.get('areaGeo') || '19'; // Default: Nuevo León

        if (!indicadorId) {
          return NextResponse.json(
            {
              success: false,
              error: 'Se requiere indicadorId',
              indicadoresDisponibles: INDICADORES_CLAVE
            },
            { status: 400 }
          );
        }

        const indicador = await obtenerIndicadorINEGI(indicadorId, areaGeo);

        if (!indicador) {
          return NextResponse.json(
            { success: false, error: 'No se encontró el indicador' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          tipo: 'indicador_inegi',
          indicador
        });
      }

      case 'riesgo': {
        if (!municipioId) {
          // Devolver todos los municipios con datos de riesgo
          return NextResponse.json({
            success: true,
            tipo: 'riesgo_todos_municipios',
            municipios: Object.values(RIESGO_MUNICIPIOS_NL)
          });
        }

        const riesgo = obtenerRiesgoMunicipio(municipioId);

        if (!riesgo) {
          return NextResponse.json(
            {
              success: false,
              error: 'No hay datos de riesgo para este municipio',
              municipiosDisponibles: Object.keys(RIESGO_MUNICIPIOS_NL)
            },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          tipo: 'riesgo_municipio',
          riesgo
        });
      }

      case 'ageb': {
        if (!lat || !lng) {
          return NextResponse.json(
            {
              success: false,
              error: 'Se requieren lat y lng para buscar AGEB',
              ejemplo: '/api/datos-gobierno?tipo=ageb&lat=25.7225&lng=-100.1998'
            },
            { status: 400 }
          );
        }

        const ageb = buscarAGEBCercano(lat, lng);

        if (!ageb) {
          return NextResponse.json({
            success: true,
            tipo: 'ageb',
            encontrado: false,
            mensaje: 'No hay datos AGEB precargados para esta zona. Considera descargar más datos de INEGI SCITEL.'
          });
        }

        return NextResponse.json({
          success: true,
          tipo: 'ageb',
          encontrado: true,
          datosAgeb: ageb
        });
      }

      case 'municipios': {
        return NextResponse.json({
          success: true,
          tipo: 'catalogo_municipios',
          descripcion: 'Municipios del Área Metropolitana de Monterrey con IDs INEGI',
          municipios: MUNICIPIOS_AMM
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Tipo no válido',
            tiposDisponibles: ['analisis', 'indicadores', 'indicador', 'riesgo', 'ageb', 'municipios'],
            ejemplos: {
              analisis: '/api/datos-gobierno?tipo=analisis&lat=25.7225&lng=-100.1998&municipioId=19026',
              indicadores: '/api/datos-gobierno?tipo=indicadores',
              indicador: '/api/datos-gobierno?tipo=indicador&indicadorId=1002000001&areaGeo=19',
              riesgo: '/api/datos-gobierno?tipo=riesgo&municipioId=19039',
              ageb: '/api/datos-gobierno?tipo=ageb&lat=25.72&lng=-100.38',
              municipios: '/api/datos-gobierno?tipo=municipios'
            }
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error en API datos-gobierno:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno consultando datos de gobierno' },
      { status: 500 }
    );
  }
}
