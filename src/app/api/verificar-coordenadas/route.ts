import { NextRequest, NextResponse } from 'next/server';
import { buscarPorTexto, calcularDistanciaKm } from '@/lib/google-places';
import { SUCURSALES_CRISPY_TENDERS } from '@/data/sucursales';

/**
 * GET /api/verificar-coordenadas
 *
 * Verifica las coordenadas de las sucursales de Crispy Tenders
 * buscando las plazas en Google Places API
 *
 * Query params:
 * - id: (opcional) ID de sucursal específica a verificar
 * - all: (opcional) si es 'true', verifica todas las sucursales
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sucursalId = searchParams.get('id');
  const verificarTodas = searchParams.get('all') === 'true';

  const resultados: {
    id: string;
    nombre: string;
    plaza: string;
    coordenadasOriginales: { lat: number; lng: number };
    coordenadasVerificadas: { lat: number; lng: number } | null;
    placeId: string | null;
    nombreEncontrado: string | null;
    direccionEncontrada: string | null;
    distanciaKm: number | null;
    verificado: boolean;
    requiereRevision: boolean;
    mensaje: string;
  }[] = [];

  // Filtrar sucursales a verificar
  let sucursalesAVerificar = SUCURSALES_CRISPY_TENDERS;

  if (sucursalId) {
    sucursalesAVerificar = sucursalesAVerificar.filter(s => s.id === sucursalId);
  } else if (!verificarTodas) {
    // Por defecto, solo las no verificadas
    sucursalesAVerificar = sucursalesAVerificar.filter(s => !s.coordenadasVerificadas);
  }

  if (sucursalesAVerificar.length === 0) {
    return NextResponse.json({
      success: true,
      mensaje: 'No hay sucursales para verificar',
      resultados: []
    });
  }

  for (const sucursal of sucursalesAVerificar) {
    // Construir query de búsqueda
    // Intentar primero con el nombre de la plaza + "Monterrey"
    const queries = [
      `${sucursal.plaza} Monterrey`,
      `${sucursal.plaza} ${sucursal.municipio}`,
      sucursal.direccion,
    ];

    let encontrado = false;
    let resultado = null;

    for (const query of queries) {
      // Buscar con ubicación aproximada actual
      resultado = await buscarPorTexto(query, sucursal.lat, sucursal.lng);

      if (resultado) {
        encontrado = true;
        break;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (!encontrado || !resultado) {
      resultados.push({
        id: sucursal.id,
        nombre: sucursal.nombre,
        plaza: sucursal.plaza,
        coordenadasOriginales: { lat: sucursal.lat, lng: sucursal.lng },
        coordenadasVerificadas: null,
        placeId: null,
        nombreEncontrado: null,
        direccionEncontrada: null,
        distanciaKm: null,
        verificado: false,
        requiereRevision: true,
        mensaje: 'No se encontró la plaza en Google Places'
      });
      continue;
    }

    // Calcular distancia entre coordenadas originales y encontradas
    const distancia = calcularDistanciaKm(
      sucursal.lat, sucursal.lng,
      resultado.lat, resultado.lng
    );

    // Si la distancia es mayor a 1km, marcar para revisión
    const requiereRevision = distancia > 1;

    resultados.push({
      id: sucursal.id,
      nombre: sucursal.nombre,
      plaza: sucursal.plaza,
      coordenadasOriginales: { lat: sucursal.lat, lng: sucursal.lng },
      coordenadasVerificadas: { lat: resultado.lat, lng: resultado.lng },
      placeId: resultado.placeId,
      nombreEncontrado: resultado.name,
      direccionEncontrada: resultado.address,
      distanciaKm: distancia,
      verificado: true,
      requiereRevision,
      mensaje: requiereRevision
        ? `Verificado pero con diferencia de ${distancia}km - revisar manualmente`
        : `Verificado correctamente (diferencia: ${distancia}km)`
    });

    // Rate limiting entre sucursales
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Generar código TypeScript actualizado
  const sucursalesActualizadas = SUCURSALES_CRISPY_TENDERS.map(sucursal => {
    const resultado = resultados.find(r => r.id === sucursal.id);

    if (resultado?.verificado && resultado.coordenadasVerificadas && !resultado.requiereRevision) {
      return {
        ...sucursal,
        lat: resultado.coordenadasVerificadas.lat,
        lng: resultado.coordenadasVerificadas.lng,
        coordenadasVerificadas: true,
        fuenteCoordenadas: 'google_places' as const,
        placeId: resultado.placeId || undefined,
        ultimaVerificacion: new Date().toISOString().split('T')[0],
      };
    }

    return sucursal;
  });

  // Estadísticas
  const stats = {
    total: sucursalesAVerificar.length,
    verificadas: resultados.filter(r => r.verificado && !r.requiereRevision).length,
    requierenRevision: resultados.filter(r => r.requiereRevision).length,
    noEncontradas: resultados.filter(r => !r.verificado).length,
  };

  return NextResponse.json({
    success: true,
    stats,
    resultados,
    // Incluir el código actualizado para copiar
    codigoActualizado: sucursalesActualizadas.filter(s =>
      resultados.some(r => r.id === s.id && r.verificado && !r.requiereRevision)
    ).map(s => ({
      id: s.id,
      lat: s.lat,
      lng: s.lng,
      placeId: s.placeId,
      coordenadasVerificadas: s.coordenadasVerificadas,
      fuenteCoordenadas: s.fuenteCoordenadas,
    }))
  });
}
