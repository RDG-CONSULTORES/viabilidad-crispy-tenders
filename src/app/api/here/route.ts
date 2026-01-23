import { NextRequest, NextResponse } from 'next/server';
import {
  calcularRutaConTrafico,
  calcularRutasMultiples,
  obtenerFlujoTrafico,
  obtenerFlujoZona,
  obtenerIsolineConTrafico,
  compararIsolinesTrafico,
  analizarTraficoZona,
  HERE_API_KEY
} from '@/lib/here';

/**
 * GET /api/here
 *
 * Servicios de HERE Traffic:
 * - Rutas con tráfico en tiempo real
 * - Flujo de tráfico (jamFactor, velocidades)
 * - Isolines (área alcanzable con tráfico)
 * - Análisis completo de zona
 *
 * Query params:
 * - tipo: 'ruta' | 'flujo' | 'flujo-zona' | 'isoline' | 'comparar-trafico' | 'analisis'
 * - lat, lng: Coordenadas del punto/origen
 * - destinoLat, destinoLng: Coordenadas del destino (para rutas)
 * - minutos: Tiempo para isoline (default 10)
 * - radio: Radio en km para análisis de zona (default 2)
 */
export async function GET(request: NextRequest) {
  // Verificar API key
  if (!HERE_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'HERE_API_KEY no configurado' },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;

  const tipo = searchParams.get('tipo') || 'flujo';
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const destinoLat = parseFloat(searchParams.get('destinoLat') || '0');
  const destinoLng = parseFloat(searchParams.get('destinoLng') || '0');
  const minutos = parseInt(searchParams.get('minutos') || '10');
  const radio = parseFloat(searchParams.get('radio') || '2');

  try {
    switch (tipo) {
      case 'ruta': {
        if (!lat || !lng || !destinoLat || !destinoLng) {
          return NextResponse.json(
            {
              success: false,
              error: 'Se requieren lat, lng, destinoLat y destinoLng',
              ejemplo: '/api/here?tipo=ruta&lat=25.6866&lng=-100.3161&destinoLat=25.7225&destinoLng=-100.1998'
            },
            { status: 400 }
          );
        }

        const ruta = await calcularRutaConTrafico(lat, lng, destinoLat, destinoLng);

        if (!ruta) {
          return NextResponse.json(
            { success: false, error: 'No se pudo calcular la ruta' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          tipo: 'ruta_con_trafico',
          ...ruta,
          interpretacion: {
            tiempoExtra: `+${ruta.duracionTraficoMin - ruta.duracionBaseMin} min por tráfico`,
            impacto: ruta.factorTrafico > 1.3 ? 'Alto impacto de tráfico' :
                     ruta.factorTrafico > 1.1 ? 'Impacto moderado' : 'Tráfico fluido'
          }
        });
      }

      case 'flujo': {
        if (!lat || !lng) {
          return NextResponse.json(
            {
              success: false,
              error: 'Se requieren lat y lng',
              ejemplo: '/api/here?tipo=flujo&lat=25.6866&lng=-100.3161'
            },
            { status: 400 }
          );
        }

        const flujo = await obtenerFlujoTrafico(lat, lng);

        if (!flujo) {
          return NextResponse.json(
            { success: false, error: 'No se pudo obtener flujo de tráfico' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          tipo: 'flujo_trafico',
          ...flujo,
          interpretacion: {
            eficiencia: `${Math.round((flujo.velocidadActualKmh / flujo.velocidadLibreKmh) * 100)}% de velocidad libre`,
            recomendacion: flujo.nivel === 'fluido' ? 'Buen momento para desplazarse' :
                          flujo.nivel === 'lento' ? 'Esperar tráfico moderado' :
                          flujo.nivel === 'congestionado' ? 'Considerar rutas alternativas' :
                          'Evitar la zona si es posible'
          }
        });
      }

      case 'flujo-zona': {
        // Por defecto, centro de Monterrey
        const centroLat = lat || 25.6866;
        const centroLng = lng || -100.3161;

        const flujos = await obtenerFlujoZona(centroLat, centroLng, radio);

        // Calcular estadísticas
        const totalJamFactor = flujos.reduce((sum, f) => sum + f.jamFactor, 0);
        const promedioJamFactor = flujos.length > 0 ? totalJamFactor / flujos.length : 0;
        const puntosCriticos = flujos.filter(f => f.jamFactor > 5);

        return NextResponse.json({
          success: true,
          tipo: 'flujo_zona',
          centro: { lat: centroLat, lng: centroLng },
          radioKm: radio,
          puntosAnalizados: flujos.length,
          promedioJamFactor: Math.round(promedioJamFactor * 10) / 10,
          puntosCriticos: puntosCriticos.length,
          flujos: flujos.slice(0, 50) // Limitar respuesta
        });
      }

      case 'isoline': {
        if (!lat || !lng) {
          return NextResponse.json(
            {
              success: false,
              error: 'Se requieren lat y lng',
              ejemplo: '/api/here?tipo=isoline&lat=25.6866&lng=-100.3161&minutos=10'
            },
            { status: 400 }
          );
        }

        const isoline = await obtenerIsolineConTrafico(lat, lng, minutos, 'car');

        if (!isoline) {
          return NextResponse.json(
            { success: false, error: 'No se pudo obtener isoline' },
            { status: 404 }
          );
        }

        // Estimar población (densidad promedio AMM: 2,500 hab/km²)
        const poblacionEstimada = Math.round(isoline.areaKm2 * 2500);

        return NextResponse.json({
          success: true,
          tipo: 'isoline_con_trafico',
          ...isoline,
          poblacionEstimada,
          interpretacion: {
            alcance: `${isoline.areaKm2.toFixed(1)} km² alcanzables en ${minutos} min con tráfico actual`,
            poblacion: `~${(poblacionEstimada / 1000).toFixed(0)}K personas alcanzables`
          }
        });
      }

      case 'comparar-trafico': {
        if (!lat || !lng) {
          return NextResponse.json(
            {
              success: false,
              error: 'Se requieren lat y lng',
              ejemplo: '/api/here?tipo=comparar-trafico&lat=25.6866&lng=-100.3161&minutos=10'
            },
            { status: 400 }
          );
        }

        const comparacion = await compararIsolinesTrafico(lat, lng, minutos);

        if (!comparacion) {
          return NextResponse.json(
            { success: false, error: 'No se pudo realizar comparación' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          tipo: 'comparacion_trafico',
          tiempoMinutos: minutos,
          ...comparacion
        });
      }

      case 'analisis': {
        // Por defecto, centro de Monterrey
        const centroLat = lat || 25.6866;
        const centroLng = lng || -100.3161;

        const analisis = await analizarTraficoZona(centroLat, centroLng, radio);

        return NextResponse.json({
          success: true,
          tipo: 'analisis_trafico_zona',
          ...analisis,
          recomendaciones: generarRecomendaciones(analisis)
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Tipo no válido',
            tiposDisponibles: ['ruta', 'flujo', 'flujo-zona', 'isoline', 'comparar-trafico', 'analisis'],
            ejemplos: {
              ruta: '/api/here?tipo=ruta&lat=25.68&lng=-100.31&destinoLat=25.72&destinoLng=-100.19',
              flujo: '/api/here?tipo=flujo&lat=25.68&lng=-100.31',
              'flujo-zona': '/api/here?tipo=flujo-zona&lat=25.68&lng=-100.31&radio=3',
              isoline: '/api/here?tipo=isoline&lat=25.68&lng=-100.31&minutos=10',
              'comparar-trafico': '/api/here?tipo=comparar-trafico&lat=25.68&lng=-100.31&minutos=10',
              analisis: '/api/here?tipo=analisis&lat=25.68&lng=-100.31&radio=2'
            }
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error en API HERE:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno en servicios de HERE' },
      { status: 500 }
    );
  }
}

/**
 * Genera recomendaciones basadas en análisis de tráfico
 */
function generarRecomendaciones(analisis: {
  flujoPromedio: { jamFactorPromedio: number; nivelGeneral: string };
  puntosCriticos: any[];
  impactoTrafico: { reduccionAreaPct: number; tiempoAdicionalMin: number };
}): string[] {
  const recomendaciones: string[] = [];

  const { flujoPromedio, puntosCriticos, impactoTrafico } = analisis;

  // Recomendaciones por nivel de tráfico
  if (flujoPromedio.nivelGeneral === 'fluido') {
    recomendaciones.push('Zona con tráfico fluido - ideal para entregas rápidas');
  } else if (flujoPromedio.nivelGeneral === 'lento') {
    recomendaciones.push('Considerar horarios de menor afluencia para entregas');
  } else if (flujoPromedio.nivelGeneral === 'congestionado') {
    recomendaciones.push('Planificar rutas alternativas para entregas a domicilio');
    recomendaciones.push('Considerar tiempos de entrega extendidos en hora pico');
  } else {
    recomendaciones.push('Zona con alto congestionamiento - impacto significativo en operación');
  }

  // Recomendaciones por puntos críticos
  if (puntosCriticos.length > 3) {
    recomendaciones.push(`${puntosCriticos.length} puntos de congestión detectados - evaluar accesos`);
  }

  // Recomendaciones por impacto
  if (impactoTrafico.reduccionAreaPct > 30) {
    recomendaciones.push('El tráfico reduce significativamente el área de cobertura');
  }

  if (impactoTrafico.tiempoAdicionalMin > 5) {
    recomendaciones.push(`Agregar ${impactoTrafico.tiempoAdicionalMin}+ min a tiempos estimados de entrega`);
  }

  // Recomendación general
  if (flujoPromedio.jamFactorPromedio <= 3) {
    recomendaciones.push('Ubicación favorable para operación de delivery');
  } else if (flujoPromedio.jamFactorPromedio <= 6) {
    recomendaciones.push('Ubicación aceptable - optimizar horarios de entrega');
  } else {
    recomendaciones.push('Considerar impacto de tráfico en decisión de ubicación');
  }

  return recomendaciones;
}
