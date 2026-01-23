/**
 * Checklist de Validación de Campo para Crispy Tenders
 * Usado por consultores de franquicias durante visitas de campo
 *
 * Basado en metodología de:
 * - FranConnect Site Selection Criteria
 * - Bain & Company Franchise Expansion Framework
 * - IFA (International Franchise Association) Best Practices
 */

// ========== TIPOS ==========

export type ChecklistStatus = 'pendiente' | 'aprobado' | 'rechazado' | 'na';
export type ChecklistPrioridad = 'critico' | 'importante' | 'deseable';

export interface ChecklistItem {
  id: string;
  categoria: string;
  item: string;
  descripcion: string;
  prioridad: ChecklistPrioridad;
  status: ChecklistStatus;
  notas?: string;
  evidencia?: string; // URL de foto o documento
  verificadoPor?: string;
  fechaVerificacion?: string;
}

export interface ChecklistCategoria {
  id: string;
  nombre: string;
  icono: string;
  items: ChecklistItem[];
  pesoScore: number; // 0-1 para cálculo de score final
}

export interface ChecklistCompleto {
  plazaId: string;
  plazaNombre: string;
  fechaVisita: string;
  visitadoPor: string;
  categorias: ChecklistCategoria[];
  scoreTotal: number;
  recomendacionFinal: 'proceder' | 'condicional' | 'rechazar';
  comentariosGenerales: string;
}

// ========== PLANTILLA DE CHECKLIST ==========

export const CHECKLIST_TEMPLATE: ChecklistCategoria[] = [
  {
    id: 'ubicacion',
    nombre: 'Ubicación y Accesibilidad',
    icono: '📍',
    pesoScore: 0.20,
    items: [
      {
        id: 'ub-001',
        categoria: 'ubicacion',
        item: 'Visibilidad desde vialidades principales',
        descripcion: '¿Se puede ver claramente el local desde la avenida principal o acceso de la plaza?',
        prioridad: 'critico',
        status: 'pendiente',
      },
      {
        id: 'ub-002',
        categoria: 'ubicacion',
        item: 'Acceso vehicular',
        descripcion: 'Evaluar facilidad de entrada y salida del estacionamiento, señalización',
        prioridad: 'critico',
        status: 'pendiente',
      },
      {
        id: 'ub-003',
        categoria: 'ubicacion',
        item: 'Cercanía a anclas de tráfico',
        descripcion: 'Distancia a tiendas ancla, cines, supermercados (ideal: menos de 50m)',
        prioridad: 'importante',
        status: 'pendiente',
      },
      {
        id: 'ub-004',
        categoria: 'ubicacion',
        item: 'Acceso peatonal',
        descripcion: 'Banquetas, cruces seguros, acceso desde transporte público',
        prioridad: 'importante',
        status: 'pendiente',
      },
      {
        id: 'ub-005',
        categoria: 'ubicacion',
        item: 'Ubicación dentro de plaza',
        descripcion: 'Evaluar si está en zona de alto tráfico (food court, entrada principal, pasillos principales)',
        prioridad: 'critico',
        status: 'pendiente',
      },
    ],
  },
  {
    id: 'local',
    nombre: 'Características del Local',
    icono: '🏪',
    pesoScore: 0.20,
    items: [
      {
        id: 'lo-001',
        categoria: 'local',
        item: 'Metros cuadrados suficientes',
        descripcion: 'Mínimo 35m² para cocina + 20m² para mostrador/área de servicio',
        prioridad: 'critico',
        status: 'pendiente',
      },
      {
        id: 'lo-002',
        categoria: 'local',
        item: 'Frente del local',
        descripcion: 'Mínimo 4 metros de frente para visibilidad y exhibición',
        prioridad: 'importante',
        status: 'pendiente',
      },
      {
        id: 'lo-003',
        categoria: 'local',
        item: 'Altura de techo',
        descripcion: 'Mínimo 3 metros para instalación de campana extractora',
        prioridad: 'importante',
        status: 'pendiente',
      },
      {
        id: 'lo-004',
        categoria: 'local',
        item: 'Servicios básicos',
        descripcion: 'Agua, luz (mínimo 50 amperes), gas natural o tanque estacionario',
        prioridad: 'critico',
        status: 'pendiente',
      },
      {
        id: 'lo-005',
        categoria: 'local',
        item: 'Ventilación y extracción',
        descripcion: 'Posibilidad de instalar campana extractora con ducto hacia exterior',
        prioridad: 'critico',
        status: 'pendiente',
      },
      {
        id: 'lo-006',
        categoria: 'local',
        item: 'Área de almacenamiento',
        descripcion: 'Espacio para refrigeradores, congeladores y almacén seco',
        prioridad: 'importante',
        status: 'pendiente',
      },
    ],
  },
  {
    id: 'trafico',
    nombre: 'Tráfico y Flujo Peatonal',
    icono: '👥',
    pesoScore: 0.20,
    items: [
      {
        id: 'tr-001',
        categoria: 'trafico',
        item: 'Conteo de personas (hora pico)',
        descripcion: 'Realizar conteo de 15 minutos y multiplicar por 4. Mínimo deseable: 200/hora',
        prioridad: 'critico',
        status: 'pendiente',
      },
      {
        id: 'tr-002',
        categoria: 'trafico',
        item: 'Perfil de visitantes',
        descripcion: 'Evaluar si coincide con target: familias, jóvenes, trabajadores con poder adquisitivo',
        prioridad: 'importante',
        status: 'pendiente',
      },
      {
        id: 'tr-003',
        categoria: 'trafico',
        item: 'Horarios de mayor afluencia',
        descripcion: 'Identificar y documentar horas pico para planificación de personal',
        prioridad: 'importante',
        status: 'pendiente',
      },
      {
        id: 'tr-004',
        categoria: 'trafico',
        item: 'Tráfico vehicular',
        descripcion: 'Evaluar volumen de autos en vialidades cercanas y estacionamiento',
        prioridad: 'deseable',
        status: 'pendiente',
      },
      {
        id: 'tr-005',
        categoria: 'trafico',
        item: 'Ocupación del estacionamiento',
        descripcion: 'Evaluar si el estacionamiento se llena regularmente (indica alta demanda)',
        prioridad: 'deseable',
        status: 'pendiente',
      },
    ],
  },
  {
    id: 'competencia',
    nombre: 'Análisis de Competencia',
    icono: '🎯',
    pesoScore: 0.15,
    items: [
      {
        id: 'co-001',
        categoria: 'competencia',
        item: 'Competidores en plaza',
        descripcion: 'Listar todos los restaurantes de pollo/fast food dentro de la plaza',
        prioridad: 'critico',
        status: 'pendiente',
      },
      {
        id: 'co-002',
        categoria: 'competencia',
        item: 'KFC más cercano',
        descripcion: 'Ubicar KFC más cercano y medir distancia (ideal: más de 500m)',
        prioridad: 'critico',
        status: 'pendiente',
      },
      {
        id: 'co-003',
        categoria: 'competencia',
        item: 'Estado de competidores',
        descripcion: 'Evaluar si están llenos, vacíos, bien mantenidos, etc.',
        prioridad: 'importante',
        status: 'pendiente',
      },
      {
        id: 'co-004',
        categoria: 'competencia',
        item: 'Precios de competidores',
        descripcion: 'Fotografiar menús y precios de competidores cercanos',
        prioridad: 'deseable',
        status: 'pendiente',
      },
      {
        id: 'co-005',
        categoria: 'competencia',
        item: 'Diferenciación posible',
        descripcion: '¿Hay oportunidad de diferenciarse por producto, precio o servicio?',
        prioridad: 'importante',
        status: 'pendiente',
      },
    ],
  },
  {
    id: 'comercial',
    nombre: 'Aspectos Comerciales',
    icono: '💼',
    pesoScore: 0.15,
    items: [
      {
        id: 'cm-001',
        categoria: 'comercial',
        item: 'Costo de renta mensual',
        descripcion: 'Confirmar renta exacta incluyendo mantenimiento y publicidad',
        prioridad: 'critico',
        status: 'pendiente',
      },
      {
        id: 'cm-002',
        categoria: 'comercial',
        item: 'Condiciones del contrato',
        descripcion: 'Duración, incrementos anuales, depósito, meses de gracia',
        prioridad: 'critico',
        status: 'pendiente',
      },
      {
        id: 'cm-003',
        categoria: 'comercial',
        item: 'Costo de acondicionamiento',
        descripcion: 'Solicitar cotización para obra civil y adecuaciones',
        prioridad: 'importante',
        status: 'pendiente',
      },
      {
        id: 'cm-004',
        categoria: 'comercial',
        item: 'Restricciones de uso',
        descripcion: 'Verificar si permiten preparación de alimentos fritos, horarios, etc.',
        prioridad: 'critico',
        status: 'pendiente',
      },
      {
        id: 'cm-005',
        categoria: 'comercial',
        item: 'Exclusividad de giro',
        descripcion: '¿Podemos negociar exclusividad de pollo frito en la plaza?',
        prioridad: 'deseable',
        status: 'pendiente',
      },
    ],
  },
  {
    id: 'operativo',
    nombre: 'Aspectos Operativos',
    icono: '⚙️',
    pesoScore: 0.10,
    items: [
      {
        id: 'op-001',
        categoria: 'operativo',
        item: 'Área de descarga',
        descripcion: 'Evaluar acceso para proveedores y frecuencia permitida de entregas',
        prioridad: 'importante',
        status: 'pendiente',
      },
      {
        id: 'op-002',
        categoria: 'operativo',
        item: 'Manejo de basura',
        descripcion: 'Verificar sistema de recolección de basura y aceite usado',
        prioridad: 'importante',
        status: 'pendiente',
      },
      {
        id: 'op-003',
        categoria: 'operativo',
        item: 'Horarios de operación',
        descripcion: 'Confirmar horarios permitidos (apertura, cierre, días)',
        prioridad: 'importante',
        status: 'pendiente',
      },
      {
        id: 'op-004',
        categoria: 'operativo',
        item: 'Servicio de delivery',
        descripcion: 'Verificar si hay zona de entrega para apps y acceso de repartidores',
        prioridad: 'deseable',
        status: 'pendiente',
      },
      {
        id: 'op-005',
        categoria: 'operativo',
        item: 'Personal disponible',
        descripcion: 'Evaluar disponibilidad de personal en la zona (cercanía a colonias residenciales)',
        prioridad: 'deseable',
        status: 'pendiente',
      },
    ],
  },
];

// ========== FUNCIONES ==========

/**
 * Crea un checklist nuevo para una plaza
 */
export function crearChecklistNuevo(
  plazaId: string,
  plazaNombre: string,
  visitadoPor: string
): ChecklistCompleto {
  // Clonar la plantilla para no modificar el original
  const categorias = CHECKLIST_TEMPLATE.map(cat => ({
    ...cat,
    items: cat.items.map(item => ({ ...item })),
  }));

  return {
    plazaId,
    plazaNombre,
    fechaVisita: new Date().toISOString(),
    visitadoPor,
    categorias,
    scoreTotal: 0,
    recomendacionFinal: 'condicional',
    comentariosGenerales: '',
  };
}

/**
 * Calcula el score total de un checklist
 */
export function calcularScoreChecklist(checklist: ChecklistCompleto): {
  scoreTotal: number;
  scoresPorCategoria: { categoria: string; score: number; peso: number }[];
  itemsCriticosFallidos: ChecklistItem[];
  recomendacion: 'proceder' | 'condicional' | 'rechazar';
} {
  const scoresPorCategoria: { categoria: string; score: number; peso: number }[] = [];
  const itemsCriticosFallidos: ChecklistItem[] = [];

  for (const categoria of checklist.categorias) {
    let itemsEvaluados = 0;
    let itemsAprobados = 0;

    for (const item of categoria.items) {
      if (item.status !== 'na' && item.status !== 'pendiente') {
        itemsEvaluados++;
        if (item.status === 'aprobado') {
          itemsAprobados++;
        }
      }

      // Registrar items críticos fallidos
      if (item.prioridad === 'critico' && item.status === 'rechazado') {
        itemsCriticosFallidos.push(item);
      }
    }

    const score = itemsEvaluados > 0 ? (itemsAprobados / itemsEvaluados) * 100 : 0;

    scoresPorCategoria.push({
      categoria: categoria.nombre,
      score: Math.round(score),
      peso: categoria.pesoScore,
    });
  }

  // Calcular score total ponderado
  const scoreTotal = scoresPorCategoria.reduce(
    (sum, cat) => sum + cat.score * cat.peso,
    0
  );

  // Determinar recomendación
  let recomendacion: 'proceder' | 'condicional' | 'rechazar';

  if (itemsCriticosFallidos.length > 0) {
    // Si hay items críticos fallidos, rechazar o condicional dependiendo de cuántos
    if (itemsCriticosFallidos.length >= 3) {
      recomendacion = 'rechazar';
    } else {
      recomendacion = 'condicional';
    }
  } else if (scoreTotal >= 75) {
    recomendacion = 'proceder';
  } else if (scoreTotal >= 50) {
    recomendacion = 'condicional';
  } else {
    recomendacion = 'rechazar';
  }

  return {
    scoreTotal: Math.round(scoreTotal),
    scoresPorCategoria,
    itemsCriticosFallidos,
    recomendacion,
  };
}

/**
 * Actualiza un item del checklist
 */
export function actualizarItemChecklist(
  checklist: ChecklistCompleto,
  itemId: string,
  updates: Partial<ChecklistItem>
): ChecklistCompleto {
  const nuevoChecklist = { ...checklist };

  for (const categoria of nuevoChecklist.categorias) {
    const itemIndex = categoria.items.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      categoria.items[itemIndex] = {
        ...categoria.items[itemIndex],
        ...updates,
        fechaVerificacion: new Date().toISOString(),
      };
      break;
    }
  }

  // Recalcular score
  const { scoreTotal, recomendacion } = calcularScoreChecklist(nuevoChecklist);
  nuevoChecklist.scoreTotal = scoreTotal;
  nuevoChecklist.recomendacionFinal = recomendacion;

  return nuevoChecklist;
}

/**
 * Genera un resumen del checklist para reporte
 */
export function generarResumenChecklist(checklist: ChecklistCompleto): {
  completado: { total: number; aprobados: number; rechazados: number; pendientes: number };
  criticos: { total: number; aprobados: number; rechazados: number };
  score: number;
  recomendacion: string;
} {
  let total = 0;
  let aprobados = 0;
  let rechazados = 0;
  let pendientes = 0;
  let criticosTotal = 0;
  let criticosAprobados = 0;
  let criticosRechazados = 0;

  for (const categoria of checklist.categorias) {
    for (const item of categoria.items) {
      total++;

      if (item.prioridad === 'critico') {
        criticosTotal++;
      }

      switch (item.status) {
        case 'aprobado':
          aprobados++;
          if (item.prioridad === 'critico') criticosAprobados++;
          break;
        case 'rechazado':
          rechazados++;
          if (item.prioridad === 'critico') criticosRechazados++;
          break;
        case 'pendiente':
          pendientes++;
          break;
      }
    }
  }

  const recomendacionTexto = {
    proceder: '✅ PROCEDER - La ubicación cumple con todos los criterios críticos y tiene un score alto.',
    condicional: '⚠️ CONDICIONAL - Hay aspectos que deben resolverse antes de proceder.',
    rechazar: '❌ NO PROCEDER - La ubicación no cumple con criterios críticos importantes.',
  };

  return {
    completado: { total, aprobados, rechazados, pendientes },
    criticos: { total: criticosTotal, aprobados: criticosAprobados, rechazados: criticosRechazados },
    score: checklist.scoreTotal,
    recomendacion: recomendacionTexto[checklist.recomendacionFinal],
  };
}
