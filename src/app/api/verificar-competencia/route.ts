import { NextRequest, NextResponse } from 'next/server';
import { buscarPorTexto, calcularDistanciaKm } from '@/lib/google-places';
import { COMPETIDORES_MTY, Competidor } from '@/data/competencia';

/**
 * GET /api/verificar-competencia
 *
 * Verifica las coordenadas de los competidores usando Google Places
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const marca = searchParams.get('marca'); // KFC, Wingstop, El Pollo Loco
  const competidorId = searchParams.get('id');
  const verificarTodos = searchParams.get('all') === 'true';

  interface ResultadoVerificacion {
    id: string;
    nombre: string;
    marca: string;
    coordenadasOriginales: { lat: number; lng: number };
    coordenadasVerificadas: { lat: number; lng: number } | null;
    placeId: string | null;
    nombreEncontrado: string | null;
    direccionEncontrada: string | null;
    distanciaKm: number | null;
    verificado: boolean;
    requiereRevision: boolean;
    mensaje: string;
  }

  const resultados: ResultadoVerificacion[] = [];

  // Filtrar competidores
  let competidoresAVerificar = COMPETIDORES_MTY;

  if (competidorId) {
    competidoresAVerificar = competidoresAVerificar.filter(c => c.id === competidorId);
  } else if (marca) {
    competidoresAVerificar = competidoresAVerificar.filter(c => c.marca === marca);
  } else if (!verificarTodos) {
    // Por defecto solo KFC (los más importantes)
    competidoresAVerificar = competidoresAVerificar.filter(c => c.marca === 'KFC');
  }

  for (const comp of competidoresAVerificar) {
    // Estrategias de búsqueda específicas por marca
    const queries = [
      // 1. Búsqueda exacta: marca + nombre específico
      `${comp.marca} ${comp.nombre.replace(comp.marca, '').trim()} Monterrey`,
      // 2. Marca + dirección
      `${comp.marca} ${comp.direccion}`,
      // 3. Nombre completo
      `${comp.nombre} ${comp.municipio}`,
      // 4. Solo marca + municipio (último recurso)
      `${comp.marca} ${comp.municipio} Nuevo León`,
    ];

    let encontrado = false;
    let resultado = null;
    let mejorDistancia = Infinity;

    for (const query of queries) {
      console.log(`Buscando: "${query}"`);

      const busqueda = await buscarPorTexto(query, comp.lat, comp.lng);

      if (busqueda) {
        // Verificar que sea de la misma marca
        const nombreLower = busqueda.name.toLowerCase();
        const marcaLower = comp.marca.toLowerCase();

        // Verificar que el nombre contenga la marca
        if (nombreLower.includes(marcaLower) ||
            (marcaLower === 'el pollo loco' && nombreLower.includes('pollo loco'))) {

          const distancia = calcularDistanciaKm(
            comp.lat, comp.lng,
            busqueda.lat, busqueda.lng
          );

          // Tomar el resultado más cercano a nuestras coordenadas originales
          if (distancia < mejorDistancia) {
            mejorDistancia = distancia;
            resultado = busqueda;
            encontrado = true;
          }

          // Si encontramos uno muy cercano, usar ese
          if (distancia < 0.5) {
            break;
          }
        }
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (!encontrado || !resultado) {
      resultados.push({
        id: comp.id,
        nombre: comp.nombre,
        marca: comp.marca,
        coordenadasOriginales: { lat: comp.lat, lng: comp.lng },
        coordenadasVerificadas: null,
        placeId: null,
        nombreEncontrado: null,
        direccionEncontrada: null,
        distanciaKm: null,
        verificado: false,
        requiereRevision: true,
        mensaje: `No se encontró ${comp.marca} con las búsquedas realizadas`
      });
      continue;
    }

    const distanciaFinal = calcularDistanciaKm(
      comp.lat, comp.lng,
      resultado.lat, resultado.lng
    );

    // Umbral: 1km para restaurantes (son ubicaciones puntuales)
    const requiereRevision = distanciaFinal > 1;

    resultados.push({
      id: comp.id,
      nombre: comp.nombre,
      marca: comp.marca,
      coordenadasOriginales: { lat: comp.lat, lng: comp.lng },
      coordenadasVerificadas: { lat: resultado.lat, lng: resultado.lng },
      placeId: resultado.placeId,
      nombreEncontrado: resultado.name,
      direccionEncontrada: resultado.address,
      distanciaKm: distanciaFinal,
      verificado: true,
      requiereRevision,
      mensaje: requiereRevision
        ? `Diferencia de ${distanciaFinal}km - revisar`
        : `Verificado (${distanciaFinal}km)`
    });

    // Rate limiting entre competidores
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  // Estadísticas
  const stats = {
    total: competidoresAVerificar.length,
    verificados: resultados.filter(r => r.verificado && !r.requiereRevision).length,
    requierenRevision: resultados.filter(r => r.requiereRevision).length,
    noEncontrados: resultados.filter(r => !r.verificado).length,
  };

  // Generar código actualizado
  const actualizaciones = resultados
    .filter(r => r.verificado)
    .map(r => ({
      id: r.id,
      nombre: r.nombreEncontrado,
      lat: r.coordenadasVerificadas!.lat,
      lng: r.coordenadasVerificadas!.lng,
      placeId: r.placeId,
      direccion: r.direccionEncontrada,
      distanciaOriginal: r.distanciaKm,
    }));

  return NextResponse.json({
    success: true,
    stats,
    resultados,
    actualizaciones,
  });
}
