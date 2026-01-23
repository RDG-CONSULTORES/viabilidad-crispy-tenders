/**
 * Data México API Integration
 * Datos económicos oficiales del gobierno de México
 * API pública - No requiere autenticación
 * Docs: https://www.economia.gob.mx/datamexico/en/about/infoapi
 */

const DATAMEXICO_BASE_URL = 'https://www.economia.gob.mx/apidatamexico/tesseract';

// Mapeo de municipios del Área Metropolitana de Monterrey
export const MUNICIPIOS_NL: Record<string, { nombre: string; cve: string }> = {
  '19039': { nombre: 'Monterrey', cve: '19039' },
  '19006': { nombre: 'Apodaca', cve: '19006' },
  '19018': { nombre: 'García', cve: '19018' },
  '19019': { nombre: 'San Pedro Garza García', cve: '19019' },
  '19021': { nombre: 'General Escobedo', cve: '19021' },
  '19026': { nombre: 'Guadalupe', cve: '19026' },
  '19031': { nombre: 'Juárez', cve: '19031' },
  '19046': { nombre: 'San Nicolás de los Garza', cve: '19046' },
  '19048': { nombre: 'Santa Catarina', cve: '19048' },
  '19009': { nombre: 'Cadereyta Jiménez', cve: '19009' },
  '19010': { nombre: 'El Carmen', cve: '19010' },
  '19049': { nombre: 'Santiago', cve: '19049' },
};

export interface CensoEconomicoData {
  municipio: string;
  municipioId: string;
  year: number;
  unidadesEconomicas: number;
  personalOcupado: number;
  produccionBruta: number; // Millones MXN
  valorAgregado: number; // Millones MXN
  remuneraciones: number; // Millones MXN
}

export interface DatosVivienda {
  municipio: string;
  municipioId: string;
  viviendasParticulares: number;
  ocupantesPromedio: number;
  conInternet: number;
  conComputadora: number;
  conAutomovil: number;
}

export interface IndicadoresEconomicos {
  municipio: string;
  municipioId: string;
  empleoTotal: number;
  empresasTotal: number;
  salarioPromedio: number;
  produccionPerCapita: number;
  densidadEmpresarial: number; // Empresas por cada 1000 habitantes
  nivelEconomicoEstimado: 'muy_alto' | 'alto' | 'medio' | 'bajo';
}

/**
 * Consulta genérica al API de Data México
 */
async function queryDataMexico(
  cube: string,
  drilldowns: string[],
  measures: string[],
  cuts?: Record<string, string>
): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    params.append('drilldowns', drilldowns.join(','));
    params.append('measures', measures.join(','));

    if (cuts) {
      for (const [key, value] of Object.entries(cuts)) {
        params.append(key, value);
      }
    }

    const url = `${DATAMEXICO_BASE_URL}/cubes/${cube}/aggregate.jsonrecords?${params}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Error en Data México API:', response.status);
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error consultando Data México:', error);
    return [];
  }
}

/**
 * Obtener datos del censo económico por municipio
 */
export async function obtenerCensoEconomico(
  municipioId: string
): Promise<CensoEconomicoData | null> {
  const data = await queryDataMexico(
    'inegi_economic_census_additional',
    ['Geography Municipality', 'Year'],
    [
      'Unidades economicas',
      'Total de personal ocupado',
      'Produccion bruta total',
      'Valor agregado censal bruto',
      'Total de remuneraciones'
    ],
    { 'Geography Municipality': municipioId }
  );

  if (data.length === 0) return null;

  // Tomar el año más reciente
  const latest = data.sort((a: any, b: any) => b.Year - a.Year)[0];
  const municipioInfo = MUNICIPIOS_NL[municipioId];

  return {
    municipio: municipioInfo?.nombre || `Municipio ${municipioId}`,
    municipioId,
    year: latest.Year,
    unidadesEconomicas: latest['Unidades economicas'] || 0,
    personalOcupado: latest['Total de personal ocupado'] || 0,
    produccionBruta: latest['Produccion bruta total'] || 0,
    valorAgregado: latest['Valor agregado censal bruto'] || 0,
    remuneraciones: latest['Total de remuneraciones'] || 0,
  };
}

/**
 * Obtener datos de vivienda por municipio
 */
export async function obtenerDatosVivienda(
  municipioId: string
): Promise<DatosVivienda | null> {
  const data = await queryDataMexico(
    'inegi_housing',
    ['Geography Municipality'],
    [
      'Viviendas particulares habitadas',
      'Promedio de ocupantes en viviendas particulares habitadas',
      'Viviendas particulares habitadas que disponen de internet',
      'Viviendas particulares habitadas que disponen de computadora',
      'Viviendas particulares habitadas que disponen de automovil o camioneta'
    ],
    { 'Geography Municipality': municipioId }
  );

  if (data.length === 0) return null;

  const record = data[0];
  const municipioInfo = MUNICIPIOS_NL[municipioId];

  return {
    municipio: municipioInfo?.nombre || `Municipio ${municipioId}`,
    municipioId,
    viviendasParticulares: record['Viviendas particulares habitadas'] || 0,
    ocupantesPromedio: record['Promedio de ocupantes en viviendas particulares habitadas'] || 0,
    conInternet: record['Viviendas particulares habitadas que disponen de internet'] || 0,
    conComputadora: record['Viviendas particulares habitadas que disponen de computadora'] || 0,
    conAutomovil: record['Viviendas particulares habitadas que disponen de automovil o camioneta'] || 0,
  };
}

/**
 * Obtener indicadores económicos agregados para un municipio
 */
export async function obtenerIndicadoresEconomicos(
  municipioId: string,
  poblacionEstimada?: number
): Promise<IndicadoresEconomicos | null> {
  const censo = await obtenerCensoEconomico(municipioId);
  const vivienda = await obtenerDatosVivienda(municipioId);

  if (!censo) return null;

  const municipioInfo = MUNICIPIOS_NL[municipioId];

  // Estimar población si no se proporciona (promedio 3.5 ocupantes por vivienda)
  const poblacion = poblacionEstimada || (vivienda?.viviendasParticulares || 0) * 3.5;

  // Calcular indicadores
  const salarioPromedio = censo.personalOcupado > 0
    ? (censo.remuneraciones * 1000000) / censo.personalOcupado / 12 // Mensual
    : 0;

  const produccionPerCapita = poblacion > 0
    ? (censo.produccionBruta * 1000000) / poblacion
    : 0;

  const densidadEmpresarial = poblacion > 0
    ? (censo.unidadesEconomicas / poblacion) * 1000
    : 0;

  // Determinar nivel económico basado en indicadores
  let nivelEconomicoEstimado: IndicadoresEconomicos['nivelEconomicoEstimado'];

  // Criterios basados en salario promedio mensual y acceso a servicios
  const pctInternet = vivienda
    ? (vivienda.conInternet / vivienda.viviendasParticulares) * 100
    : 0;
  const pctAuto = vivienda
    ? (vivienda.conAutomovil / vivienda.viviendasParticulares) * 100
    : 0;

  const scoreNSE = (
    (salarioPromedio > 25000 ? 30 : salarioPromedio > 15000 ? 20 : salarioPromedio > 8000 ? 10 : 0) +
    (pctInternet > 80 ? 25 : pctInternet > 60 ? 15 : pctInternet > 40 ? 10 : 0) +
    (pctAuto > 70 ? 25 : pctAuto > 50 ? 15 : pctAuto > 30 ? 10 : 0) +
    (densidadEmpresarial > 50 ? 20 : densidadEmpresarial > 30 ? 10 : 0)
  );

  if (scoreNSE >= 80) nivelEconomicoEstimado = 'muy_alto';
  else if (scoreNSE >= 55) nivelEconomicoEstimado = 'alto';
  else if (scoreNSE >= 30) nivelEconomicoEstimado = 'medio';
  else nivelEconomicoEstimado = 'bajo';

  return {
    municipio: municipioInfo?.nombre || `Municipio ${municipioId}`,
    municipioId,
    empleoTotal: censo.personalOcupado,
    empresasTotal: censo.unidadesEconomicas,
    salarioPromedio: Math.round(salarioPromedio),
    produccionPerCapita: Math.round(produccionPerCapita),
    densidadEmpresarial: Math.round(densidadEmpresarial * 10) / 10,
    nivelEconomicoEstimado,
  };
}

/**
 * Obtener comparativa de todos los municipios del AMM
 */
export async function obtenerComparativaMunicipios(): Promise<IndicadoresEconomicos[]> {
  const indicadores: IndicadoresEconomicos[] = [];

  for (const [id] of Object.entries(MUNICIPIOS_NL)) {
    const ind = await obtenerIndicadoresEconomicos(id);
    if (ind) {
      indicadores.push(ind);
    }
    // Rate limiting
    await new Promise(r => setTimeout(r, 200));
  }

  // Ordenar por nivel económico
  const orden = { 'muy_alto': 4, 'alto': 3, 'medio': 2, 'bajo': 1 };
  return indicadores.sort((a, b) => orden[b.nivelEconomicoEstimado] - orden[a.nivelEconomicoEstimado]);
}

/**
 * Calcular score de viabilidad económica para el algoritmo
 */
export function calcularScoreEconomico(indicadores: IndicadoresEconomicos): {
  score: number;
  factores: { nombre: string; valor: number; impacto: number }[];
} {
  const factores: { nombre: string; valor: number; impacto: number }[] = [];

  // Nivel económico (peso alto)
  const nivelScore = {
    'muy_alto': 25,
    'alto': 15,
    'medio': 5,
    'bajo': -10
  }[indicadores.nivelEconomicoEstimado];
  factores.push({ nombre: 'Nivel económico', valor: nivelScore, impacto: nivelScore });

  // Salario promedio
  let salarioScore = 0;
  if (indicadores.salarioPromedio > 20000) salarioScore = 15;
  else if (indicadores.salarioPromedio > 12000) salarioScore = 10;
  else if (indicadores.salarioPromedio > 8000) salarioScore = 5;
  else salarioScore = -5;
  factores.push({ nombre: 'Poder adquisitivo', valor: indicadores.salarioPromedio, impacto: salarioScore });

  // Densidad empresarial (más empresas = más tráfico)
  let densidadScore = 0;
  if (indicadores.densidadEmpresarial > 40) densidadScore = 10;
  else if (indicadores.densidadEmpresarial > 25) densidadScore = 5;
  factores.push({ nombre: 'Densidad empresarial', valor: indicadores.densidadEmpresarial, impacto: densidadScore });

  const score = Math.max(0, Math.min(100, 50 + factores.reduce((sum, f) => sum + f.impacto, 0)));

  return { score, factores };
}

/**
 * Obtener información de NSE como texto
 */
export function getNivelEconomicoInfo(nivel: string): { texto: string; color: string } {
  switch (nivel) {
    case 'muy_alto': return { texto: 'Muy Alto (A/B)', color: '#10B981' };
    case 'alto': return { texto: 'Alto (C+)', color: '#22C55E' };
    case 'medio': return { texto: 'Medio (C)', color: '#EAB308' };
    case 'bajo': return { texto: 'Bajo (D+/D)', color: '#EF4444' };
    default: return { texto: 'No disponible', color: '#6B7280' };
  }
}

/**
 * Obtener municipio ID basado en coordenadas (aproximación)
 */
export function obtenerMunicipioIdPorCoordenadas(lat: number, lng: number): string {
  // Aproximación basada en centros de municipios del AMM
  const municipiosCentros = [
    { id: '19039', lat: 25.6866, lng: -100.3161, nombre: 'Monterrey' },
    { id: '19019', lat: 25.6574, lng: -100.4023, nombre: 'San Pedro' },
    { id: '19048', lat: 25.6733, lng: -100.4584, nombre: 'Santa Catarina' },
    { id: '19026', lat: 25.6772, lng: -100.2557, nombre: 'Guadalupe' },
    { id: '19046', lat: 25.7441, lng: -100.2836, nombre: 'San Nicolás' },
    { id: '19006', lat: 25.7815, lng: -100.1836, nombre: 'Apodaca' },
    { id: '19021', lat: 25.7981, lng: -100.3401, nombre: 'Escobedo' },
    { id: '19018', lat: 25.8078, lng: -100.5186, nombre: 'García' },
    { id: '19031', lat: 25.6472, lng: -100.0944, nombre: 'Juárez' },
  ];

  let closest = municipiosCentros[0];
  let minDist = Infinity;

  for (const mun of municipiosCentros) {
    const dist = Math.sqrt(Math.pow(lat - mun.lat, 2) + Math.pow(lng - mun.lng, 2));
    if (dist < minDist) {
      minDist = dist;
      closest = mun;
    }
  }

  return closest.id;
}
