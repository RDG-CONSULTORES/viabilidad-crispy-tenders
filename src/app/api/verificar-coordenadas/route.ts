import { NextRequest, NextResponse } from 'next/server';
import { buscarPorTexto, calcularDistanciaKm } from '@/lib/google-places';
import { SUCURSALES_CRISPY_TENDERS } from '@/data/sucursales';

/**
 * GET /api/verificar-coordenadas
 *
 * Verifica las coordenadas de las sucursales de Crispy Tenders
 * usando múltiples estrategias de búsqueda en Google Places
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sucursalId = searchParams.get('id');
  const verificarTodas = searchParams.get('all') === 'true';
  const soloNoVerificadas = searchParams.get('pending') === 'true';

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
    estrategiaUsada: string;
  }[] = [];

  // Filtrar sucursales
  let sucursalesAVerificar = SUCURSALES_CRISPY_TENDERS;

  if (sucursalId) {
    sucursalesAVerificar = sucursalesAVerificar.filter(s => s.id === sucursalId);
  } else if (soloNoVerificadas) {
    sucursalesAVerificar = sucursalesAVerificar.filter(s => !s.coordenadasVerificadas);
  } else if (!verificarTodas) {
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
    // ESTRATEGIA MEJORADA: Múltiples queries en orden de especificidad
    const queries = [
      // 1. Buscar "Crispy Tenders" directamente en la plaza
      { query: `Crispy Tenders ${sucursal.plaza} Monterrey`, estrategia: 'crispy_tenders_plaza' },
      // 2. Buscar "Crispy Tenders" con la dirección
      { query: `Crispy Tenders ${sucursal.direccion}`, estrategia: 'crispy_tenders_direccion' },
      // 3. Buscar la plaza con municipio
      { query: `${sucursal.plaza} ${sucursal.municipio} Nuevo León`, estrategia: 'plaza_municipio' },
      // 4. Buscar solo la dirección completa
      { query: `${sucursal.direccion} ${sucursal.municipio}`, estrategia: 'direccion_completa' },
      // 5. Buscar la plaza genérica
      { query: `${sucursal.plaza} Monterrey`, estrategia: 'plaza_monterrey' },
    ];

    let encontrado = false;
    let resultado = null;
    let estrategiaUsada = '';

    for (const { query, estrategia } of queries) {
      console.log(`Buscando: "${query}"`);

      // Buscar sin sesgo de ubicación primero para resultados más precisos
      resultado = await buscarPorTexto(query);

      if (resultado) {
        // Verificar que el resultado sea razonable (dentro de 50km de Monterrey)
        const distanciaACentro = calcularDistanciaKm(
          resultado.lat, resultado.lng,
          25.6866, -100.3161 // Centro de Monterrey
        );

        if (distanciaACentro < 50) {
          encontrado = true;
          estrategiaUsada = estrategia;
          console.log(`✓ Encontrado con estrategia: ${estrategia}`);
          break;
        } else {
          console.log(`✗ Resultado muy lejos (${distanciaACentro}km de MTY)`);
        }
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 250));
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
        mensaje: 'No se encontró con ninguna estrategia de búsqueda',
        estrategiaUsada: 'ninguna'
      });
      continue;
    }

    // Calcular distancia
    const distancia = calcularDistanciaKm(
      sucursal.lat, sucursal.lng,
      resultado.lat, resultado.lng
    );

    // Umbral más permisivo: 2km para plazas (son grandes)
    const requiereRevision = distancia > 2;

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
        ? `Diferencia de ${distancia}km - revisar si es correcto`
        : `Verificado (${distancia}km de diferencia)`,
      estrategiaUsada
    });

    // Rate limiting entre sucursales
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Estadísticas
  const stats = {
    total: sucursalesAVerificar.length,
    verificadas: resultados.filter(r => r.verificado && !r.requiereRevision).length,
    requierenRevision: resultados.filter(r => r.requiereRevision).length,
    noEncontradas: resultados.filter(r => !r.verificado).length,
  };

  // Generar código para actualizar
  const actualizaciones = resultados
    .filter(r => r.verificado && !r.requiereRevision)
    .map(r => ({
      id: r.id,
      lat: r.coordenadasVerificadas!.lat,
      lng: r.coordenadasVerificadas!.lng,
      placeId: r.placeId,
      nombreEncontrado: r.nombreEncontrado,
      direccionEncontrada: r.direccionEncontrada,
    }));

  return NextResponse.json({
    success: true,
    stats,
    resultados,
    actualizaciones,
    // Código TypeScript listo para copiar
    codigoTS: actualizaciones.map(a =>
      `// ${a.id}: ${a.nombreEncontrado}\nlat: ${a.lat},\nlng: ${a.lng},\nplaceId: '${a.placeId}',`
    ).join('\n\n')
  });
}
