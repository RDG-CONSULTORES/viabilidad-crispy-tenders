/**
 * Modelo Financiero - Crispy Tenders
 * Basado en Estados de Resultados reales de 4 sucursales (2025)
 *
 * CONFIDENCIAL: Nombres de sucursales anonimizados
 */

export interface MetricasFinancieras {
  ventasMensuales: number;
  ventaConIVA: number;
  costoProducto: number;      // % de ventas
  costoManoObra: number;      // % de ventas
  costosVariables: number;    // % de ventas
  costosFijos: number;        // % de ventas
  rentaMensual: number;
  comisionesBancarias: number; // % de ventas
  marketing: number;          // % de ventas
  utilidadAntesImpuesto: number;
  utilidadConFees: number;    // Después de Fee Operativo 5% + Fee MKT 2%
  margenBruto: number;        // %
  margenNeto: number;         // % después de fees
}

export interface PerfilSucursal {
  id: string;
  nombre: string;
  descripcion: string;
  caracteristicas: string[];
  metricas: MetricasFinancieras;
  ventasMinimas: number;      // Para ser viable
  rentaMaxima: number;        // Recomendada
  ticketPromedio: number;
  clientesDiaObjetivo: number;
  paybackMeses: number;       // Estimado con inversión de $900K
}

// Datos reales extraídos del Excel "Estado de Resultados Ricardo Romero.xlsx"
export const PERFILES_SUCURSAL: PerfilSucursal[] = [
  {
    id: 'modelo-premium',
    nombre: 'Sucursal Premium',
    descripcion: 'Plaza de alto tráfico con renta elevada. Requiere alto volumen para compensar costos fijos.',
    caracteristicas: [
      'Ubicación en plaza premium (Galerías, Fashion Mall, etc.)',
      'Renta mensual $36,000 - $41,000',
      'Alto flujo peatonal natural',
      'Competencia cercana pero diferenciable',
      'NSE A/B predominante'
    ],
    metricas: {
      ventasMensuales: 377456,      // Promedio Suc 1 y 2
      ventaConIVA: 437849,
      costoProducto: 0.396,         // 39.6%
      costoManoObra: 0.115,         // 11.5%
      costosVariables: 0.097,       // 9.7%
      costosFijos: 0.131,           // 13.1% (incluyendo renta alta)
      rentaMensual: 38532,          // Promedio
      comisionesBancarias: 0.009,
      marketing: 0.001,
      utilidadAntesImpuesto: 94952,
      utilidadConFees: 68530,
      margenBruto: 0.604,
      margenNeto: 0.182             // 18.2%
    },
    ventasMinimas: 320000,
    rentaMaxima: 45000,
    ticketPromedio: 190,
    clientesDiaObjetivo: 66,
    paybackMeses: 13
  },
  {
    id: 'modelo-eficiente',
    nombre: 'Sucursal Eficiente',
    descripcion: 'La estrella del portafolio. Renta baja con alto margen operativo.',
    caracteristicas: [
      'Plaza con renta negociada o local propio',
      'Renta mensual < $15,000',
      'Excelente relación costo-beneficio',
      'Menor competencia directa',
      'NSE B/C+ con buen poder adquisitivo'
    ],
    metricas: {
      ventasMensuales: 418969,
      ventaConIVA: 486004,
      costoProducto: 0.374,         // 37.4% - mejor control
      costoManoObra: 0.112,         // 11.2%
      costosVariables: 0.087,       // 8.7%
      costosFijos: 0.060,           // 6% - renta baja
      rentaMensual: 14036,
      comisionesBancarias: 0.013,
      marketing: 0.001,
      utilidadAntesImpuesto: 148407,
      utilidadConFees: 119079,
      margenBruto: 0.626,
      margenNeto: 0.284             // 28.4% - TOP PERFORMER
    },
    ventasMinimas: 280000,
    rentaMaxima: 20000,
    ticketPromedio: 210,
    clientesDiaObjetivo: 66,
    paybackMeses: 8
  },
  {
    id: 'modelo-compacto',
    nombre: 'Sucursal Compacta',
    descripcion: 'Local pequeño con operación lean. Menor inversión pero menor volumen.',
    caracteristicas: [
      'Local pequeño (< 50 m²)',
      'Operación con equipo mínimo',
      'Dependencia de delivery',
      'Zona de tráfico moderado',
      'NSE C/C+ con precio accesible'
    ],
    metricas: {
      ventasMensuales: 241634,
      ventaConIVA: 280296,
      costoProducto: 0.387,         // 38.7%
      costoManoObra: 0.178,         // 17.8% - mayor % por menor volumen
      costosVariables: 0.077,       // 7.7%
      costosFijos: 0.141,           // 14.1%
      rentaMensual: 24444,
      comisionesBancarias: 0.015,
      marketing: 0.000,
      utilidadAntesImpuesto: 49716,
      utilidadConFees: 32802,
      margenBruto: 0.613,
      margenNeto: 0.136             // 13.6% - mínimo viable
    },
    ventasMinimas: 200000,
    rentaMaxima: 30000,
    ticketPromedio: 175,
    clientesDiaObjetivo: 46,
    paybackMeses: 27
  },
  {
    id: 'modelo-ideal',
    nombre: 'Sucursal Ideal (Meta)',
    descripcion: 'Configuración objetivo para nuevas aperturas.',
    caracteristicas: [
      'Renta controlada ($30K máximo)',
      'Ubicación estratégica validada',
      'Mínimo 3km de CT existente',
      'NSE B/C+ confirmado',
      'Flujo peatonal verificado > 60%'
    ],
    metricas: {
      ventasMensuales: 353879,
      ventaConIVA: 410500,
      costoProducto: 0.387,
      costoManoObra: 0.178,
      costosVariables: 0.077,
      costosFijos: 0.141,
      rentaMensual: 30000,
      comisionesBancarias: 0.015,
      marketing: 0.000,
      utilidadAntesImpuesto: 97007,
      utilidadConFees: 72235,
      margenBruto: 0.613,
      margenNeto: 0.204             // 20.4% objetivo
    },
    ventasMinimas: 300000,
    rentaMaxima: 35000,
    ticketPromedio: 190,
    clientesDiaObjetivo: 62,
    paybackMeses: 12
  }
];

// Promedios del portafolio actual
export const PROMEDIOS_PORTAFOLIO = {
  ventasPromedio: 353879,
  margenNetoPromedio: 0.204,
  rentaPromedio: 28886,
  costoProductoPromedio: 0.387,
  manoObraPromedio: 0.178,
  paybackPromedio: 15,
  inversionTipica: 900000,
};

// Estructura de costos estándar (% de ventas)
export const ESTRUCTURA_COSTOS = {
  costoAlimentos: 0.315,      // 31.5% - mayor componente
  costoBebidas: 0.085,        // 8.5%
  costoDesechables: 0.059,    // 5.9%
  nomina: 0.177,              // 17.7%
  luz: 0.021,
  gas: 0.006,
  agua: 0.002,
  telefono: 0.003,
  sistemaWansoft: 0.009,
  mantenimiento: 0.006,
  comisionesBancarias: 0.015,
  feeOperativo: 0.050,        // 5% a la franquicia
  feeMKT: 0.020,              // 2% marketing
};

// Función para proyectar P&L de una nueva ubicación
export function proyectarPL(params: {
  ventasEstimadas: number;
  rentaMensual: number;
  perfilBase?: string;
}): {
  ventas: number;
  costos: {
    producto: number;
    manoObra: number;
    variables: number;
    fijos: number;
    fees: number;
  };
  utilidadBruta: number;
  utilidadOperativa: number;
  utilidadNeta: number;
  margenNeto: number;
  viable: boolean;
  razon: string;
} {
  const perfil = PERFILES_SUCURSAL.find(p => p.id === params.perfilBase) || PERFILES_SUCURSAL[3]; // Ideal por defecto

  const ventas = params.ventasEstimadas;

  // Calcular costos basados en estructura estándar
  const costoProducto = ventas * ESTRUCTURA_COSTOS.costoAlimentos +
                       ventas * ESTRUCTURA_COSTOS.costoBebidas +
                       ventas * ESTRUCTURA_COSTOS.costoDesechables;

  const costoManoObra = ventas * ESTRUCTURA_COSTOS.nomina;

  const costosVariables = ventas * (
    ESTRUCTURA_COSTOS.mantenimiento +
    ESTRUCTURA_COSTOS.comisionesBancarias
  );

  const costosFijos = params.rentaMensual +
                     ventas * ESTRUCTURA_COSTOS.luz +
                     ventas * ESTRUCTURA_COSTOS.gas +
                     ventas * ESTRUCTURA_COSTOS.telefono +
                     ventas * ESTRUCTURA_COSTOS.sistemaWansoft;

  const fees = ventas * (ESTRUCTURA_COSTOS.feeOperativo + ESTRUCTURA_COSTOS.feeMKT);

  const utilidadBruta = ventas - costoProducto;
  const utilidadOperativa = utilidadBruta - costoManoObra - costosVariables - costosFijos;
  const utilidadNeta = utilidadOperativa - fees;
  const margenNeto = utilidadNeta / ventas;

  // Determinar viabilidad
  let viable = true;
  let razon = 'Proyección dentro de parámetros saludables';

  if (margenNeto < 0.10) {
    viable = false;
    razon = `Margen neto muy bajo (${(margenNeto * 100).toFixed(1)}%). Mínimo recomendado: 10%`;
  } else if (params.rentaMensual > ventas * 0.15) {
    viable = false;
    razon = `Renta muy alta (${((params.rentaMensual / ventas) * 100).toFixed(1)}% de ventas). Máximo: 15%`;
  } else if (ventas < 200000) {
    viable = false;
    razon = 'Ventas proyectadas por debajo del punto de equilibrio ($200K)';
  } else if (margenNeto >= 0.20) {
    razon = 'Excelente proyección. Margen superior al objetivo (20%)';
  } else if (margenNeto >= 0.15) {
    razon = 'Buena proyección. Margen dentro del rango saludable (15-20%)';
  }

  return {
    ventas,
    costos: {
      producto: costoProducto,
      manoObra: costoManoObra,
      variables: costosVariables,
      fijos: costosFijos,
      fees,
    },
    utilidadBruta,
    utilidadOperativa,
    utilidadNeta,
    margenNeto,
    viable,
    razon,
  };
}

// Función para estimar ventas basado en score de viabilidad
export function estimarVentasPorScore(score: number): {
  ventasMinimas: number;
  ventasEsperadas: number;
  ventasOptimistas: number;
} {
  // Basado en correlación observada entre score y performance
  const baseVentas = 150000; // Mínimo absoluto
  const factorScore = score / 100;

  return {
    ventasMinimas: Math.round(baseVentas + (factorScore * 100000)),
    ventasEsperadas: Math.round(baseVentas + (factorScore * 200000)),
    ventasOptimistas: Math.round(baseVentas + (factorScore * 300000)),
  };
}

// Función para calcular payback
export function calcularPayback(
  utilidadMensualNeta: number,
  inversionInicial: number = 900000
): {
  meses: number;
  anos: number;
  viable: boolean;
  clasificacion: 'excelente' | 'bueno' | 'aceptable' | 'riesgoso';
} {
  if (utilidadMensualNeta <= 0) {
    return {
      meses: Infinity,
      anos: Infinity,
      viable: false,
      clasificacion: 'riesgoso',
    };
  }

  const meses = inversionInicial / utilidadMensualNeta;
  const anos = meses / 12;

  let clasificacion: 'excelente' | 'bueno' | 'aceptable' | 'riesgoso';
  let viable = true;

  if (meses <= 12) {
    clasificacion = 'excelente';
  } else if (meses <= 18) {
    clasificacion = 'bueno';
  } else if (meses <= 24) {
    clasificacion = 'aceptable';
  } else {
    clasificacion = 'riesgoso';
    viable = meses <= 36; // Más de 3 años = no viable
  }

  return {
    meses: Math.round(meses * 10) / 10,
    anos: Math.round(anos * 10) / 10,
    viable,
    clasificacion,
  };
}
