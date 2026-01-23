'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PLAZAS_MTY } from '@/data/plazas';
import {
  CHECKLIST_TEMPLATE,
  ChecklistCompleto,
  ChecklistItem,
  ChecklistCategoria,
  crearChecklistNuevo,
  actualizarItemChecklist,
  calcularScoreChecklist,
  generarResumenChecklist,
} from '@/lib/checklist-campo';

function ChecklistContent() {
  const searchParams = useSearchParams();
  const plazaIdParam = searchParams.get('plazaId') || 'plaza-006';

  const [plazaId, setPlazaId] = useState(plazaIdParam);
  const [visitadoPor, setVisitadoPor] = useState('');
  const [checklist, setChecklist] = useState<ChecklistCompleto | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<string>('ubicacion');

  // Plaza seleccionada
  const plaza = useMemo(() => {
    return PLAZAS_MTY.find(p => p.id === plazaId) || PLAZAS_MTY[0];
  }, [plazaId]);

  // Inicializar checklist
  const iniciarChecklist = () => {
    if (!visitadoPor.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }
    const nuevoChecklist = crearChecklistNuevo(plaza.id, plaza.nombre, visitadoPor);
    setChecklist(nuevoChecklist);
  };

  // Actualizar item
  const handleUpdateItem = (itemId: string, status: ChecklistItem['status'], notas?: string) => {
    if (!checklist) return;
    const actualizado = actualizarItemChecklist(checklist, itemId, {
      status,
      notas,
      verificadoPor: visitadoPor,
    });
    setChecklist(actualizado);
  };

  // Resumen
  const resumen = useMemo(() => {
    if (!checklist) return null;
    return generarResumenChecklist(checklist);
  }, [checklist]);

  // Calcular progreso por categoría
  const progresoPorCategoria = useMemo(() => {
    if (!checklist) return {};
    const progreso: Record<string, { total: number; completados: number }> = {};

    for (const cat of checklist.categorias) {
      const total = cat.items.length;
      const completados = cat.items.filter(i => i.status !== 'pendiente').length;
      progreso[cat.id] = { total, completados };
    }

    return progreso;
  }, [checklist]);

  if (!checklist) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">✅ Checklist de Validación de Campo</h1>
          <p className="text-gray-500">Evaluación in-situ para validación de ubicaciones</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 max-w-xl">
          <h2 className="font-semibold text-gray-700 mb-4">Iniciar Nueva Evaluación</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seleccionar Plaza
              </label>
              <select
                value={plazaId}
                onChange={(e) => setPlazaId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crispy-500"
              >
                <optgroup label="Propuestas">
                  {PLAZAS_MTY.filter(p => p.esPropuesta).map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </optgroup>
                <optgroup label="Otras Plazas">
                  {PLAZAS_MTY.filter(p => !p.esPropuesta).map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tu Nombre
              </label>
              <input
                type="text"
                value={visitadoPor}
                onChange={(e) => setVisitadoPor(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crispy-500"
              />
            </div>

            <button
              onClick={iniciarChecklist}
              className="w-full bg-crispy-500 text-white py-3 rounded-lg hover:bg-crispy-600 transition font-medium"
            >
              Iniciar Checklist
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Sobre el Checklist</h3>
            <p className="text-sm text-gray-600">
              Este checklist está basado en las mejores prácticas de consultoras de franquicias
              como FranConnect, Bain & Company, y la IFA. Evalúa {CHECKLIST_TEMPLATE.reduce((sum, cat) => sum + cat.items.length, 0)} criterios
              en {CHECKLIST_TEMPLATE.length} categorías.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const categoriaActual = checklist.categorias.find(c => c.id === categoriaActiva);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">✅ Checklist: {plaza.nombre}</h1>
          <p className="text-gray-500">Evaluador: {visitadoPor} • {new Date().toLocaleDateString('es-MX')}</p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${
            checklist.recomendacionFinal === 'proceder' ? 'text-green-600' :
            checklist.recomendacionFinal === 'condicional' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {checklist.scoreTotal}/100
          </div>
          <div className={`text-sm font-medium ${
            checklist.recomendacionFinal === 'proceder' ? 'text-green-600' :
            checklist.recomendacionFinal === 'condicional' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {checklist.recomendacionFinal === 'proceder' ? 'PROCEDER' :
             checklist.recomendacionFinal === 'condicional' ? 'CONDICIONAL' : 'NO PROCEDER'}
          </div>
        </div>
      </div>

      {/* Resumen */}
      {resumen && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-2xl font-bold text-gray-800">{resumen.completado.total}</div>
            <div className="text-sm text-gray-500">Total criterios</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
            <div className="text-2xl font-bold text-green-600">{resumen.completado.aprobados}</div>
            <div className="text-sm text-green-700">Aprobados</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
            <div className="text-2xl font-bold text-red-600">{resumen.completado.rechazados}</div>
            <div className="text-sm text-red-700">Rechazados</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">{resumen.completado.pendientes}</div>
            <div className="text-sm text-yellow-700">Pendientes</div>
          </div>
        </div>
      )}

      {/* Navegación por categorías */}
      <div className="bg-white rounded-lg shadow-sm border p-2">
        <div className="flex flex-wrap gap-2">
          {checklist.categorias.map(cat => {
            const prog = progresoPorCategoria[cat.id];
            const completado = prog ? (prog.completados / prog.total) * 100 : 0;

            return (
              <button
                key={cat.id}
                onClick={() => setCategoriaActiva(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition relative ${
                  categoriaActiva === cat.id
                    ? 'bg-crispy-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.icono} {cat.nombre}
                {prog && prog.completados > 0 && (
                  <span className="ml-2 text-xs opacity-75">
                    {prog.completados}/{prog.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items de la categoría activa */}
      {categoriaActual && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-700">
              {categoriaActual.icono} {categoriaActual.nombre}
            </h2>
            <p className="text-sm text-gray-500">
              Peso en score final: {Math.round(categoriaActual.pesoScore * 100)}%
            </p>
          </div>

          <div className="divide-y">
            {categoriaActual.items.map(item => (
              <div key={item.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        item.prioridad === 'critico' ? 'bg-red-100 text-red-700' :
                        item.prioridad === 'importante' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.prioridad}
                      </span>
                      <span className="font-medium text-gray-800">{item.item}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{item.descripcion}</p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleUpdateItem(item.id, 'aprobado')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        item.status === 'aprobado'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-green-100'
                      }`}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleUpdateItem(item.id, 'rechazado')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        item.status === 'rechazado'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-red-100'
                      }`}
                    >
                      ✗
                    </button>
                    <button
                      onClick={() => handleUpdateItem(item.id, 'na')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        item.status === 'na'
                          ? 'bg-gray-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      N/A
                    </button>
                  </div>
                </div>

                {/* Notas */}
                {item.status !== 'pendiente' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Agregar notas..."
                      defaultValue={item.notas || ''}
                      onBlur={(e) => handleUpdateItem(item.id, item.status, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-crispy-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendación final */}
      {resumen && resumen.completado.pendientes === 0 && (
        <div className={`rounded-lg p-6 ${
          checklist.recomendacionFinal === 'proceder' ? 'bg-green-50 border-2 border-green-300' :
          checklist.recomendacionFinal === 'condicional' ? 'bg-yellow-50 border-2 border-yellow-300' :
          'bg-red-50 border-2 border-red-300'
        }`}>
          <h3 className="font-bold text-lg mb-2">Recomendación Final</h3>
          <p>{resumen.recomendacion}</p>

          {resumen.criticos.rechazados > 0 && (
            <p className="mt-2 text-sm text-red-600">
              ⚠️ {resumen.criticos.rechazados} criterios críticos no aprobados
            </p>
          )}
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-4">
        <button
          onClick={() => window.print()}
          className="bg-crispy-500 text-white px-6 py-3 rounded-lg hover:bg-crispy-600 transition"
        >
          🖨️ Imprimir Checklist
        </button>
        <button
          onClick={() => setChecklist(null)}
          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition"
        >
          🔄 Nueva Evaluación
        </button>
        <a
          href={`/analisis?plazaId=${plaza.id}`}
          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition"
        >
          ← Volver a Análisis
        </a>
      </div>
    </div>
  );
}

// Loading component for Suspense
function ChecklistLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">✅ Checklist de Validación de Campo</h1>
        <p className="text-gray-500">Cargando...</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

// Default export with Suspense wrapper
export default function ChecklistPage() {
  return (
    <Suspense fallback={<ChecklistLoading />}>
      <ChecklistContent />
    </Suspense>
  );
}
