/**
 * Generador de Reportes PDF para Crispy Tenders
 * Genera reportes HTML listos para imprimir/exportar a PDF
 */

import { ResultadoScoring } from './scoring';
import { Plaza } from '@/data/plazas';
import { AnalisisCanibalizacion } from './canibalizacion';

// ========== TIPOS ==========

export interface DatosReporte {
  plaza: Plaza;
  scoring: ResultadoScoring;
  canibalizacion?: AnalisisCanibalizacion;
  fechaGeneracion: string;
  generadoPor?: string;
}

// ========== FUNCIONES ==========

/**
 * Genera el HTML del reporte de viabilidad
 */
export function generarHTMLReporte(datos: DatosReporte): string {
  const { plaza, scoring, canibalizacion, fechaGeneracion } = datos;

  const getColorClasificacion = (clasificacion: string) => {
    switch (clasificacion) {
      case 'VIABLE': return '#22C55E';
      case 'EVALUAR': return '#F59E0B';
      case 'NO_VIABLE': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte de Viabilidad - ${plaza.nombre}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #333;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #F97316;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }

    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #F97316;
    }

    .fecha {
      text-align: right;
      color: #666;
      font-size: 11px;
    }

    .titulo-seccion {
      font-size: 14px;
      font-weight: bold;
      color: #333;
      margin-top: 20px;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #ddd;
    }

    .score-box {
      display: flex;
      align-items: center;
      gap: 20px;
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .score-numero {
      font-size: 48px;
      font-weight: bold;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      color: white;
    }

    .clasificacion {
      font-size: 20px;
      font-weight: bold;
    }

    .recomendacion {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
    }

    .card-titulo {
      font-weight: bold;
      margin-bottom: 10px;
      color: #333;
    }

    .dato {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      border-bottom: 1px dotted #ddd;
    }

    .dato:last-child {
      border-bottom: none;
    }

    .dato-label {
      color: #666;
    }

    .dato-valor {
      font-weight: 600;
    }

    .score-bar {
      display: flex;
      align-items: center;
      margin: 8px 0;
    }

    .score-bar-label {
      width: 120px;
      font-size: 11px;
      color: #666;
    }

    .score-bar-fill {
      flex: 1;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .score-bar-value {
      height: 100%;
      border-radius: 4px;
    }

    .score-bar-number {
      width: 35px;
      text-align: right;
      font-size: 11px;
      font-weight: 600;
    }

    .factores-criticos {
      background: #FEF2F2;
      border: 1px solid #FECACA;
      padding: 10px;
      border-radius: 8px;
      margin-top: 10px;
    }

    .factores-criticos-titulo {
      color: #DC2626;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .factor-item {
      padding: 3px 0;
      font-size: 11px;
    }

    .canibalizacion-warning {
      background: #FFF7ED;
      border: 1px solid #FED7AA;
      padding: 10px;
      border-radius: 8px;
      margin-top: 15px;
    }

    .canibalizacion-titulo {
      color: #C2410C;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
      font-size: 10px;
      color: #999;
      text-align: center;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }

    .badge-verde { background: #DCFCE7; color: #166534; }
    .badge-amarillo { background: #FEF9C3; color: #854D0E; }
    .badge-rojo { background: #FEE2E2; color: #991B1B; }

    @media print {
      body { padding: 10px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🍗 Crispy Tenders</div>
    <div class="fecha">
      <div>Reporte de Viabilidad</div>
      <div>${new Date(fechaGeneracion).toLocaleDateString('es-MX', { dateStyle: 'long' })}</div>
    </div>
  </div>

  <h1 style="font-size: 18px; margin-bottom: 5px;">${plaza.nombre}</h1>
  <p style="color: #666; margin-bottom: 20px;">${plaza.direccion} • ${plaza.municipio}</p>

  <!-- Score Principal -->
  <div class="score-box">
    <div class="score-numero" style="background: ${getColorClasificacion(scoring.clasificacion)}">
      ${scoring.scoreTotal}
    </div>
    <div>
      <div class="clasificacion" style="color: ${getColorClasificacion(scoring.clasificacion)}">
        ${scoring.clasificacion}
      </div>
      <div class="recomendacion">${scoring.recomendacion}</div>
    </div>
  </div>

  <!-- Información General -->
  <h2 class="titulo-seccion">📍 Información General</h2>
  <div class="grid-2">
    <div class="card">
      <div class="card-titulo">Características</div>
      <div class="dato">
        <span class="dato-label">NSE:</span>
        <span class="dato-valor">${plaza.nivelSocioeconomico}</span>
      </div>
      <div class="dato">
        <span class="dato-label">Perfil:</span>
        <span class="dato-valor">${plaza.perfilVisitante}</span>
      </div>
      <div class="dato">
        <span class="dato-label">Estacionamiento:</span>
        <span class="dato-valor">${plaza.estacionamientoGratis ? 'Gratis' : 'Con costo'}</span>
      </div>
      <div class="dato">
        <span class="dato-label">Metrorrey:</span>
        <span class="dato-valor">${plaza.cercaMetrorrey ? 'Sí' : 'No'}</span>
      </div>
    </div>
    <div class="card">
      <div class="card-titulo">Operación</div>
      <div class="dato">
        <span class="dato-label">Horario:</span>
        <span class="dato-valor">${plaza.horarioApertura} - ${plaza.horarioCierre}</span>
      </div>
      <div class="dato">
        <span class="dato-label">Horas Pico:</span>
        <span class="dato-valor">${plaza.horasPico.join(', ')}</span>
      </div>
      <div class="dato">
        <span class="dato-label">Renta est.:</span>
        <span class="dato-valor">${plaza.rentaEstimadaM2 ? `$${plaza.rentaEstimadaM2}/m²` : 'N/A'}</span>
      </div>
      <div class="dato">
        <span class="dato-label">Anclas:</span>
        <span class="dato-valor">${plaza.tiendasAncla.slice(0, 3).join(', ') || 'N/A'}</span>
      </div>
    </div>
  </div>

  <!-- Scores Detallados -->
  <h2 class="titulo-seccion">📊 Análisis de Factores</h2>
  <div class="card">
    ${Object.entries(scoring.scoreDetallado).map(([key, value]) => {
      const labels: Record<string, string> = {
        flujoPeatonal: 'Flujo Peatonal',
        tiendasAncla: 'Tiendas Ancla',
        competencia: 'Competencia',
        perfilDemografico: 'Demografía',
        accesibilidad: 'Accesibilidad',
        costoRenta: 'Costo Renta',
        visibilidad: 'Visibilidad',
      };
      const color = value >= 75 ? '#22C55E' : value >= 50 ? '#F59E0B' : '#EF4444';
      return `
        <div class="score-bar">
          <span class="score-bar-label">${labels[key] || key}</span>
          <div class="score-bar-fill">
            <div class="score-bar-value" style="width: ${value}%; background: ${color}"></div>
          </div>
          <span class="score-bar-number">${value}</span>
        </div>
      `;
    }).join('')}
  </div>

  ${scoring.factoresCriticos.length > 0 ? `
  <div class="factores-criticos">
    <div class="factores-criticos-titulo">⚠️ Factores Críticos a Considerar</div>
    ${scoring.factoresCriticos.map(f => `<div class="factor-item">• ${f}</div>`).join('')}
  </div>
  ` : ''}

  <!-- Proyección Financiera -->
  <h2 class="titulo-seccion">💰 Proyección Financiera</h2>
  <div class="grid-2">
    <div class="card">
      <div class="card-titulo">Ingresos Estimados</div>
      <div class="dato">
        <span class="dato-label">Ventas mensuales:</span>
        <span class="dato-valor">$${scoring.proyeccionFinanciera.ventasMensualesEstimadas.toLocaleString()}</span>
      </div>
      <div class="dato">
        <span class="dato-label">Utilidad mensual:</span>
        <span class="dato-valor" style="color: #22C55E">$${scoring.proyeccionFinanciera.utilidadMensualEstimada.toLocaleString()}</span>
      </div>
    </div>
    <div class="card">
      <div class="card-titulo">Retorno de Inversión</div>
      <div class="dato">
        <span class="dato-label">Payback:</span>
        <span class="dato-valor">${scoring.proyeccionFinanciera.paybackMeses} meses</span>
      </div>
      <div class="dato">
        <span class="dato-label">ROI Anual:</span>
        <span class="dato-valor" style="color: #3B82F6">${scoring.proyeccionFinanciera.roiAnual}%</span>
      </div>
    </div>
  </div>

  ${canibalizacion ? `
  <!-- Análisis de Canibalización -->
  <h2 class="titulo-seccion">🎯 Análisis de Canibalización</h2>
  <div class="canibalizacion-warning">
    <div class="canibalizacion-titulo">
      Riesgo: ${canibalizacion.resumen.riesgoGeneral.toUpperCase()}
      <span class="badge ${
        canibalizacion.resumen.riesgoGeneral === 'bajo' ? 'badge-verde' :
        canibalizacion.resumen.riesgoGeneral === 'medio' ? 'badge-amarillo' : 'badge-rojo'
      }">${canibalizacion.resumen.canibalizacionPromedio}% promedio</span>
    </div>
    <p style="font-size: 11px; margin-top: 5px;">${canibalizacion.resumen.recomendacion}</p>
    ${canibalizacion.sucursalesAfectadas.length > 0 ? `
    <div style="margin-top: 10px; font-size: 11px;">
      <strong>Sucursales afectadas:</strong>
      ${canibalizacion.sucursalesAfectadas
        .filter(s => s.canibalizacionPct > 5)
        .slice(0, 3)
        .map(s => `<div>• ${s.sucursal.nombre} (${s.distanciaKm}km) - ${s.canibalizacionPct}% impacto</div>`)
        .join('')}
    </div>
    ` : ''}
  </div>
  ` : ''}

  <!-- Footer -->
  <div class="footer">
    <p>Reporte generado automáticamente por el Sistema de Viabilidad Crispy Tenders</p>
    <p>Este análisis es una estimación basada en datos públicos y debe complementarse con validación de campo.</p>
    <p style="margin-top: 5px;">© ${new Date().getFullYear()} Crispy Tenders - Todos los derechos reservados</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Abre una ventana con el reporte listo para imprimir
 */
export function abrirReporteParaImprimir(datos: DatosReporte): void {
  const html = generarHTMLReporte(datos);
  const ventana = window.open('', '_blank');

  if (ventana) {
    ventana.document.write(html);
    ventana.document.close();

    // Auto-abrir diálogo de impresión
    setTimeout(() => {
      ventana.print();
    }, 500);
  }
}

/**
 * Descarga el reporte como archivo HTML
 */
export function descargarReporteHTML(datos: DatosReporte): void {
  const html = generarHTMLReporte(datos);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Reporte_${datos.plaza.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
