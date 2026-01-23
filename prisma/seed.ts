/**
 * Seed de Base de Datos - Sistema de Viabilidad Crispy Tenders
 * =============================================================
 *
 * Este script inicializa la base de datos con:
 * 1. Catálogo de fuentes de datos
 * 2. Fórmulas documentadas
 * 3. Configuración default
 * 4. Datos existentes migrados (sucursales, competidores, plazas)
 *
 * Ejecutar con: npx prisma db seed
 */

import { PrismaClient, NivelConfianza, TipoFuente, TipoCompetencia, NivelAmenaza, StatusSucursal, NSE } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...\n');

  // =========================================================================
  // 1. CATÁLOGO DE FUENTES DE DATOS
  // =========================================================================
  console.log('📚 Creando catálogo de fuentes de datos...');

  const fuentesDatos = [
    {
      codigo: 'GOOGLE_PLACES_API',
      nombre: 'Google Places API',
      descripcion: 'API de Google para búsqueda de lugares, coordenadas y reviews',
      tipo: TipoFuente.API_EXTERNA,
      nivelConfianza: NivelConfianza.VERIFICADO,
      urlDocumentacion: 'https://developers.google.com/maps/documentation/places/web-service',
      metodologiaObtencion: 'Búsqueda por texto con validación de coordenadas. Respuestas cacheadas 7 días.',
      frecuenciaActualizacion: 'bajo_demanda',
    },
    {
      codigo: 'INEGI_DENUE_2024',
      nombre: 'INEGI DENUE 2024',
      descripcion: 'Directorio Estadístico Nacional de Unidades Económicas',
      tipo: TipoFuente.DATO_OFICIAL,
      nivelConfianza: NivelConfianza.VERIFICADO,
      urlDocumentacion: 'https://www.inegi.org.mx/app/mapa/denue/',
      metodologiaObtencion: 'Consulta API DENUE por coordenadas o AGEB. Datos actualizados anualmente.',
      frecuenciaActualizacion: 'anual',
      fechaUltimaActualizacion: new Date('2024-01-01'),
    },
    {
      codigo: 'INEGI_CENSO_2020',
      nombre: 'INEGI Censo de Población 2020',
      descripcion: 'Censo de Población y Vivienda 2020 - Datos demográficos por AGEB',
      tipo: TipoFuente.DATO_OFICIAL,
      nivelConfianza: NivelConfianza.VERIFICADO,
      urlDocumentacion: 'https://www.inegi.org.mx/programas/ccpv/2020/',
      metodologiaObtencion: 'Cruce de AGEB con indicadores socioeconómicos. Base para NSE por zona.',
      frecuenciaActualizacion: 'decenal',
      fechaUltimaActualizacion: new Date('2020-03-01'),
    },
    {
      codigo: 'AMAI_NSE_2022',
      nombre: 'AMAI Regla NSE 8x7',
      descripcion: 'Clasificación de Niveles Socioeconómicos de AMAI',
      tipo: TipoFuente.DATO_OFICIAL,
      nivelConfianza: NivelConfianza.VERIFICADO,
      urlDocumentacion: 'https://www.amai.org/NSE/',
      metodologiaObtencion: 'Encuesta de 8 preguntas para clasificación NSE. Aplicable en campo.',
      frecuenciaActualizacion: 'bienal',
      fechaUltimaActualizacion: new Date('2022-01-01'),
    },
    {
      codigo: 'BESTTIME_API',
      nombre: 'BestTime.app API',
      descripcion: 'API de afluencia y flujo peatonal basada en datos de ubicación móvil',
      tipo: TipoFuente.API_EXTERNA,
      nivelConfianza: NivelConfianza.VERIFICADO,
      urlDocumentacion: 'https://besttime.app/api/documentation',
      metodologiaObtencion: 'Consulta por place_id o dirección. Retorna afluencia por hora/día.',
      frecuenciaActualizacion: 'tiempo_real',
    },
    {
      codigo: 'CONTEO_CAMPO',
      nombre: 'Conteo de Campo Manual',
      descripcion: 'Conteo peatonal realizado en sitio por equipo de trabajo',
      tipo: TipoFuente.TRABAJO_CAMPO,
      nivelConfianza: NivelConfianza.VERIFICADO,
      urlDocumentacion: null,
      metodologiaObtencion: 'Conteo manual en intervalos de 15 min durante 2+ horas pico, mínimo 3 días diferentes. Registrar fecha, hora, condiciones climáticas.',
      frecuenciaActualizacion: 'unica',
    },
    {
      codigo: 'CT_ESTADOS_RESULTADOS_2024',
      nombre: 'Estados de Resultados Crispy Tenders 2024',
      descripcion: 'Datos financieros reales de sucursales CT operando',
      tipo: TipoFuente.DATO_OFICIAL,
      nivelConfianza: NivelConfianza.VERIFICADO,
      urlDocumentacion: null,
      metodologiaObtencion: 'Extracción de sistema contable. Periodo: Octubre-Diciembre 2024. Datos anonimizados.',
      frecuenciaActualizacion: 'mensual',
      fechaUltimaActualizacion: new Date('2024-12-31'),
    },
    {
      codigo: 'ESTIMACION_VISUAL',
      nombre: 'Estimación Visual en Campo',
      descripcion: 'Estimación basada en observación del sitio sin conteo formal',
      tipo: TipoFuente.ESTIMACION,
      nivelConfianza: NivelConfianza.ESTIMADO,
      urlDocumentacion: null,
      metodologiaObtencion: 'Observación cualitativa. SOLO usar como indicador preliminar, requiere verificación posterior.',
      frecuenciaActualizacion: 'unica',
    },
    {
      codigo: 'PROMEDIO_ZONA',
      nombre: 'Promedio de Zona',
      descripcion: 'Valor promedio calculado de ubicaciones similares en la zona',
      tipo: TipoFuente.CALCULO_INTERNO,
      nivelConfianza: NivelConfianza.CALCULADO,
      urlDocumentacion: null,
      metodologiaObtencion: 'Promedio aritmético de valores verificados en radio de 3km. Mínimo 3 puntos de referencia.',
      frecuenciaActualizacion: 'bajo_demanda',
    },
  ];

  for (const fuente of fuentesDatos) {
    await prisma.fuenteDatos.upsert({
      where: { codigo: fuente.codigo },
      update: fuente,
      create: fuente,
    });
  }
  console.log(`   ✓ ${fuentesDatos.length} fuentes de datos registradas\n`);

  // =========================================================================
  // 2. FÓRMULAS DOCUMENTADAS
  // =========================================================================
  console.log('📐 Registrando fórmulas documentadas...');

  const formulas = [
    {
      codigo: 'SCORE_VIABILIDAD',
      nombre: 'Score de Viabilidad Total',
      descripcion: 'Calcula el score ponderado de viabilidad de una ubicación basado en 7 factores.',
      formulaLatex: 'Score_{Total} = \\sum_{i=1}^{7} (Factor_i \\times Peso_i)',
      formulaTexto: 'Score Total = Suma de (Factor × Peso) para los 7 factores: Flujo Peatonal, Tiendas Ancla, Competencia, Perfil Demográfico, Accesibilidad, Costo Renta, Visibilidad.',
      implementacion: 'lib/scoring.ts:calcularViabilidad()',
      fuentesBibliograficas: [
        {
          autor: 'Brown, S.',
          titulo: 'Retail Location: A Micro-Scale Perspective',
          anio: 1992,
          editorial: 'Avebury Press',
        },
        {
          autor: 'Ghosh, A. & McLafferty, S.',
          titulo: 'Location Strategies for Retail and Service Firms',
          anio: 1987,
          editorial: 'Lexington Books',
        },
      ],
      variablesEntrada: [
        { nombre: 'flujoPeatonal', descripcion: 'Peatones por hora', unidad: 'pax/hr', fuente: 'BESTTIME_API o CONTEO_CAMPO' },
        { nombre: 'tiendasAncla', descripcion: 'Lista de tiendas ancla', unidad: 'array', fuente: 'GOOGLE_PLACES_API o verificación campo' },
        { nombre: 'competidores', descripcion: 'Número de competidores en 1km', unidad: 'int', fuente: 'cálculo interno' },
        { nombre: 'nse', descripcion: 'Nivel Socioeconómico', unidad: 'A-E', fuente: 'INEGI_CENSO_2020 o AMAI_NSE_2022' },
        { nombre: 'rentaM2', descripcion: 'Renta por metro cuadrado', unidad: '$/m²/mes', fuente: 'cotización directa' },
      ],
      variablesSalida: [
        { nombre: 'scoreTotal', descripcion: 'Score de viabilidad', unidad: '0-100' },
        { nombre: 'clasificacion', descripcion: 'Clasificación', unidad: 'VIABLE|EVALUAR|NO_VIABLE' },
      ],
      supuestos: [
        'Los pesos de los factores son fijos pero configurables',
        'La relación entre factores y score es lineal',
        'No hay interacciones entre factores (cada uno se evalúa independientemente)',
      ],
      limitaciones: [
        'No considera factores cualitativos como marca de plaza o diseño arquitectónico',
        'Pesos óptimos pueden variar por tipo de plaza (food court vs stand alone)',
        'Requiere datos verificados para ser confiable',
      ],
    },
    {
      codigo: 'PROYECCION_VENTAS',
      nombre: 'Proyección de Ventas Mensuales',
      descripcion: 'Estima ventas mensuales basado en flujo peatonal, tasa de conversión y ticket promedio.',
      formulaLatex: 'Ventas_{mes} = Flujo \\times Tasa_{conv} \\times Horas \\times Ticket \\times 30',
      formulaTexto: 'Ventas Mensuales = Flujo Peatonal (pax/hr) × Tasa Conversión (%) × Horas Operación × Ticket Promedio × 30 días',
      implementacion: 'data/modelo-financiero.ts:proyectarPL()',
      fuentesBibliograficas: [
        {
          autor: 'ANTAD',
          titulo: 'Indicadores de Desempeño Retail México',
          anio: 2023,
          url: 'https://antad.net/',
        },
        {
          autor: 'Crispy Tenders',
          titulo: 'Análisis de Ticket y Conversión 2024',
          anio: 2024,
          tipo: 'interno',
        },
      ],
      variablesEntrada: [
        { nombre: 'flujoPeatonal', descripcion: 'Peatones por hora', unidad: 'pax/hr', fuente: 'BESTTIME_API o CONTEO_CAMPO' },
        { nombre: 'tasaConversion', descripcion: 'Tasa de conversión por NSE', unidad: '%', fuente: 'CT_ESTADOS_RESULTADOS_2024' },
        { nombre: 'horasOperacion', descripcion: 'Horas de operación diaria', unidad: 'hrs', fuente: 'configuración' },
        { nombre: 'ticketPromedio', descripcion: 'Ticket promedio', unidad: '$', fuente: 'CT_ESTADOS_RESULTADOS_2024' },
      ],
      variablesSalida: [
        { nombre: 'ventasEstimadas', descripcion: 'Ventas mensuales estimadas', unidad: '$/mes' },
        { nombre: 'clientesDia', descripcion: 'Clientes por día estimados', unidad: 'clientes/día' },
      ],
      supuestos: [
        'La tasa de conversión es constante durante el mes',
        'El flujo peatonal es representativo (promedio, no pico)',
        'El ticket promedio no varía significativamente por día',
      ],
      limitaciones: [
        'No considera estacionalidad (temporada alta/baja)',
        'Asume operación constante todos los días del mes',
        'Puede sobreestimar ventas en plazas nuevas (curva de aprendizaje)',
      ],
    },
    {
      codigo: 'ROI_ANUAL',
      nombre: 'Retorno sobre Inversión Anual',
      descripcion: 'Calcula el ROI anualizado como porcentaje de la inversión inicial.',
      formulaLatex: 'ROI = \\frac{Utilidad_{mes} \\times 12}{Inversion} \\times 100',
      formulaTexto: 'ROI Anual (%) = (Utilidad Mensual × 12 / Inversión Inicial) × 100',
      implementacion: 'data/modelo-financiero.ts:calcularROI()',
      fuentesBibliograficas: [
        {
          autor: 'Damodaran, A.',
          titulo: 'Investment Valuation',
          anio: 2012,
          editorial: 'Wiley Finance',
        },
      ],
      variablesEntrada: [
        { nombre: 'utilidadMensual', descripcion: 'Utilidad operativa mensual', unidad: '$/mes', fuente: 'cálculo interno' },
        { nombre: 'inversionInicial', descripcion: 'Inversión total inicial', unidad: '$', fuente: 'configuración' },
      ],
      variablesSalida: [
        { nombre: 'roiAnual', descripcion: 'ROI anualizado', unidad: '%' },
      ],
      supuestos: [
        'Utilidad mensual es constante durante el año',
        'No hay reinversiones ni gastos extraordinarios',
        'La inversión inicial se recupera linealmente',
      ],
      limitaciones: [
        'No considera valor del dinero en el tiempo (no es TIR)',
        'Puede sobrestimar retorno en operaciones variables',
        'No incluye impuestos sobre utilidades',
      ],
    },
    {
      codigo: 'PAYBACK_MESES',
      nombre: 'Periodo de Recuperación (Payback)',
      descripcion: 'Calcula el número de meses para recuperar la inversión inicial.',
      formulaLatex: 'Payback = \\frac{Inversion}{Utilidad_{mes}}',
      formulaTexto: 'Payback (meses) = Inversión Inicial / Utilidad Mensual',
      implementacion: 'data/modelo-financiero.ts:calcularPayback()',
      fuentesBibliograficas: [
        {
          autor: 'Brealey, R. & Myers, S.',
          titulo: 'Principles of Corporate Finance',
          anio: 2019,
          editorial: 'McGraw-Hill',
        },
      ],
      variablesEntrada: [
        { nombre: 'inversionInicial', descripcion: 'Inversión total inicial', unidad: '$', fuente: 'configuración' },
        { nombre: 'utilidadMensual', descripcion: 'Utilidad operativa mensual', unidad: '$/mes', fuente: 'cálculo interno' },
      ],
      variablesSalida: [
        { nombre: 'paybackMeses', descripcion: 'Meses para recuperar inversión', unidad: 'meses' },
      ],
      supuestos: [
        'Utilidad mensual es constante',
        'No hay variaciones estacionales significativas',
      ],
      limitaciones: [
        'No considera valor del dinero en el tiempo',
        'No diferencia flujos de efectivo variables',
        'Asume que toda la utilidad se destina a recuperar inversión',
      ],
    },
    {
      codigo: 'MODELO_HUFF',
      nombre: 'Modelo de Gravitación de Huff',
      descripcion: 'Calcula la probabilidad de que un consumidor visite una tienda basado en atractivo y distancia.',
      formulaLatex: 'P_{ij} = \\frac{S_j / D_{ij}^\\lambda}{\\sum_k (S_k / D_{ik}^\\lambda)}',
      formulaTexto: 'Probabilidad = (Atractivo tienda j / Distancia^λ) / Suma de (Atractivos / Distancias^λ)',
      implementacion: 'lib/canibalizacion.ts:calcularProbabilidadHuff()',
      fuentesBibliograficas: [
        {
          autor: 'Huff, D.L.',
          titulo: 'Defining and Estimating a Trading Area',
          anio: 1964,
          journal: 'Journal of Marketing',
          volumen: '28(3)',
          paginas: '34-38',
        },
      ],
      variablesEntrada: [
        { nombre: 'atractivoTienda', descripcion: 'Atractivo de la tienda (superficie, oferta)', unidad: 'índice', fuente: 'cálculo interno' },
        { nombre: 'distancia', descripcion: 'Distancia entre consumidor y tienda', unidad: 'km', fuente: 'cálculo Haversine' },
        { nombre: 'lambda', descripcion: 'Parámetro de fricción de distancia', unidad: 'constante', fuente: 'literatura (típico 2 para fast food)' },
      ],
      variablesSalida: [
        { nombre: 'probabilidad', descripcion: 'Probabilidad de visita', unidad: '0-1' },
        { nombre: 'canibalizacion', descripcion: 'Impacto en otras tiendas', unidad: '%' },
      ],
      supuestos: [
        'Los consumidores eligen racionalmente entre opciones',
        'La distancia tiene efecto negativo exponencial',
        'El atractivo es comparable entre tiendas',
      ],
      limitaciones: [
        'No considera lealtad de marca',
        'Asume distribución uniforme de consumidores',
        'Lambda óptimo varía por categoría y mercado',
      ],
    },
  ];

  for (const formula of formulas) {
    await prisma.formulaDocumentada.upsert({
      where: { codigo: formula.codigo },
      update: {
        ...formula,
        fuentesBibliograficas: formula.fuentesBibliograficas,
        variablesEntrada: formula.variablesEntrada,
        variablesSalida: formula.variablesSalida,
      },
      create: {
        ...formula,
        fuentesBibliograficas: formula.fuentesBibliograficas,
        variablesEntrada: formula.variablesEntrada,
        variablesSalida: formula.variablesSalida,
      },
    });
  }
  console.log(`   ✓ ${formulas.length} fórmulas documentadas\n`);

  // =========================================================================
  // 3. CONFIGURACIÓN DEFAULT
  // =========================================================================
  console.log('⚙️  Creando configuración default...');

  await prisma.configuracion.upsert({
    where: { nombre: 'default' },
    update: {},
    create: {
      nombre: 'default',
      // Pesos basados en metodología documentada
      pesoFlujoPeatonal: 25,
      pesoTiendasAncla: 20,
      pesoCompetencia: 15,
      pesoPerfilDemografico: 15,
      pesoAccesibilidad: 10,
      pesoCostoRenta: 10,
      pesoVisibilidad: 5,
      // Umbrales
      umbralViable: 75,
      umbralEvaluar: 55,
      // Parámetros de negocio (datos reales CT)
      ticketPromedio: 185,
      inversionBase: 800000,
      margenOperativo: 0.35,
      metaClientesDia: 150,
      activa: true,
    },
  });
  console.log('   ✓ Configuración default creada\n');

  // =========================================================================
  // RESUMEN
  // =========================================================================
  console.log('✅ Seed completado exitosamente!\n');
  console.log('Siguiente paso: Migrar datos de plazas, competidores y sucursales');
  console.log('Ejecutar: npx prisma db seed -- --data\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
