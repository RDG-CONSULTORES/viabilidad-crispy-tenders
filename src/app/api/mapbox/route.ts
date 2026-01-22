import { NextRequest, NextResponse } from 'next/server';
import {
  obtenerIsocrona,
  obtenerIsoconasMultiples,
  geocodificar,
  obtenerDireccion,
  buscarPlazasComerciales,
  analizarAccesibilidad,
  MAPBOX_TOKEN
} from '@/lib/mapbox';

/**
 * GET /api/mapbox
 *
 * Servicios de Mapbox:
 * - Isocronas (área alcanzable en X minutos)
 * - Geocoding (dirección → coordenadas)
 * - Reverse geocoding (coordenadas → dirección)
 * - Búsqueda de plazas comerciales
 * - Análisis de accesibilidad completo
 *
 * Query params:
 * - tipo: 'isocrona' | 'isocronas' | 'geocoding' | 'reverse' | 'plazas' | 'accesibilidad'
 * - lat, lng: Coordenadas
 * - minutos: Tiempo para isocrona (default 10)
 * - modo: 'driving' | 'walking' | 'cycling'
 * - direccion: Para geocoding
 * - radio: Radio en km para búsqueda de plazas
 */
export async function GET(request: NextRequest) {
  // Verificar token
  if (!MAPBOX_TOKEN) {
    return NextResponse.json(
      { success: false, error: 'MAPBOX_TOKEN no configurado' },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;

  const tipo = searchParams.get('tipo') || 'isocrona';
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const minutos = parseInt(searchParams.get('minutos') || '10');
  const modo = (searchParams.get('modo') || 'driving') as 'driving' | 'walking' | 'cycling';
  const direccion = searchParams.get('direccion') || '';
  const radio = parseFloat(searchParams.get('radio') || '5');

  try {
    switch (tipo) {
      case 'isocrona': {
        if (!lat || !lng) {
          return NextResponse.json(
            {
              success: false,
              error: 'Se requieren lat y lng',
              ejemplo: '/api/mapbox?tipo=isocrona&lat=25.7225&lng=-100.1998&minutos=10&modo=driving'
            },
            { status: 400 }
          );
        }

        const isocrona = await obtenerIsocrona(lat, lng, minutos, modo);

        if (!isocrona) {
          return NextResponse.json(
            { success: false, error: 'No se pudo obtener la isocrona' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          tipo: 'isocrona',
          ...isocrona
        });
      }

      case 'isocronas': {
        if (!lat || !lng) {
          return NextResponse.json(
            {
              success: false,
              error: 'Se requieren lat y lng',
              ejemplo: '/api/mapbox?tipo=isocronas&lat=25.7225&lng=-100.1998'
            },
            { status: 400 }
          );
        }

        const isocronas = await obtenerIsoconasMultiples(lat, lng);

        return NextResponse.json({
          success: true,
          tipo: 'isocronas_multiples',
          centro: { lat, lng },
          isocronas
        });
      }

      case 'geocoding': {
        if (!direccion) {
          return NextResponse.json(
            {
              success: false,
              error: 'Se requiere dirección',
              ejemplo: '/api/mapbox?tipo=geocoding&direccion=Plaza+Fiesta+San+Agustin+Monterrey'
            },
            { status: 400 }
          );
        }

        const cercaDe = lat && lng ? { lat, lng } : undefined;
        const resultados = await geocodificar(direccion, cercaDe);

        return NextResponse.json({
          success: true,
          tipo: 'geocoding',
          query: direccion,
          total: resultados.length,
          resultados
        });
      }

      case 'reverse': {
        if (!lat || !lng) {
          return NextResponse.json(
            {
              success: false,
              error: 'Se requieren lat y lng',
              ejemplo: '/api/mapbox?tipo=reverse&lat=25.7225&lng=-100.1998'
            },
            { status: 400 }
          );
        }

        const resultado = await obtenerDireccion(lat, lng);

        if (!resultado) {
          return NextResponse.json(
            { success: false, error: 'No se encontró dirección' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          tipo: 'reverse_geocoding',
          ...resultado
        });
      }

      case 'plazas': {
        // Por defecto, centro de Monterrey
        const centroLat = lat || 25.6866;
        const centroLng = lng || -100.3161;

        const plazas = await buscarPlazasComerciales(centroLat, centroLng, radio);

        return NextResponse.json({
          success: true,
          tipo: 'busqueda_plazas',
          centro: { lat: centroLat, lng: centroLng },
          radioKm: radio,
          total: plazas.length,
          plazas
        });
      }

      case 'accesibilidad': {
        if (!lat || !lng) {
          return NextResponse.json(
            {
              success: false,
              error: 'Se requieren lat y lng',
              ejemplo: '/api/mapbox?tipo=accesibilidad&lat=25.7225&lng=-100.1998'
            },
            { status: 400 }
          );
        }

        const analisis = await analizarAccesibilidad(lat, lng);

        return NextResponse.json({
          success: true,
          tipo: 'analisis_accesibilidad',
          ...analisis
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Tipo no válido',
            tiposDisponibles: ['isocrona', 'isocronas', 'geocoding', 'reverse', 'plazas', 'accesibilidad'],
            ejemplos: {
              isocrona: '/api/mapbox?tipo=isocrona&lat=25.72&lng=-100.19&minutos=10&modo=driving',
              isocronas: '/api/mapbox?tipo=isocronas&lat=25.72&lng=-100.19',
              geocoding: '/api/mapbox?tipo=geocoding&direccion=Plaza+Fiesta+Monterrey',
              reverse: '/api/mapbox?tipo=reverse&lat=25.72&lng=-100.19',
              plazas: '/api/mapbox?tipo=plazas&lat=25.68&lng=-100.31&radio=10',
              accesibilidad: '/api/mapbox?tipo=accesibilidad&lat=25.72&lng=-100.19'
            }
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error en API mapbox:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno en servicios de Mapbox' },
      { status: 500 }
    );
  }
}
