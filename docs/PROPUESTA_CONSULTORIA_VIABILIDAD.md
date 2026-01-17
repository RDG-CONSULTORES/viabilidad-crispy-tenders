# Propuesta de Estudio de Viabilidad de Franquicia
## Metodología de Consultoría Estratégica Nivel Tier-1

**Documento Confidencial**
**Versión:** 2.0
**Fecha:** Enero 2025

---

## Resumen Ejecutivo

El presente documento propone una metodología integral para el análisis de viabilidad de ubicaciones de franquicia de fast food, basada en las mejores prácticas de firmas de consultoría estratégica (McKinsey, BCG, Bain) y adaptada al contexto del mercado mexicano.

Nuestro análisis actual cubre aproximadamente **35%** de los factores que las firmas de primer nivel consideran críticos. Esta propuesta expande la cobertura al **90%+** mediante la integración de fuentes de datos adicionales, APIs, y metodologías avanzadas.

---

## 1. GAP ANALYSIS: Estado Actual vs. Best Practice

### Lo que TENEMOS actualmente:
| Factor | Cobertura | Fuente |
|--------|-----------|--------|
| Ubicación geográfica | ✅ | Coordenadas manuales |
| Competencia cercana | ✅ | INEGI DENUE |
| Nivel socioeconómico | ⚠️ Estimado | Manual |
| Flujo peatonal | ⚠️ Estimado | Manual |
| Tiendas ancla | ✅ | Manual |
| Costo de renta | ⚠️ Estimado | Manual |
| Scoring básico | ✅ | Algoritmo propio |

### Lo que NOS FALTA (Gap Crítico):
| Factor | Prioridad | Impacto en Decisión |
|--------|-----------|---------------------|
| Datos demográficos reales | 🔴 CRÍTICO | Alto |
| Flujo vehicular/peatonal real | 🔴 CRÍTICO | Alto |
| Análisis de canibalización | 🔴 CRÍTICO | Alto |
| Proyecciones financieras robustas | 🔴 CRÍTICO | Alto |
| Análisis de riesgo | 🟡 IMPORTANTE | Medio-Alto |
| Sentiment analysis competencia | 🟡 IMPORTANTE | Medio |
| Datos de delivery/dark kitchens | 🟡 IMPORTANTE | Medio |
| Tendencias de consumo | 🟢 DESEABLE | Medio |
| Análisis regulatorio | 🟢 DESEABLE | Bajo-Medio |

---

## 2. FRAMEWORK PROPUESTO: "7 PILARES DE VIABILIDAD"

```
┌─────────────────────────────────────────────────────────────────┐
│                    VIABILIDAD DE FRANQUICIA                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │ MERCADO │ │ COMPET. │ │UBICACIÓN│ │FINANZAS │               │
│  │  (25%)  │ │  (20%)  │ │  (20%)  │ │  (15%)  │               │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘               │
│       │          │          │          │                        │
│  ┌────┴────┐ ┌───┴───┐ ┌────┴────┐                             │
│  │ RIESGO  │ │DIGITAL│ │OPERATIVO│                             │
│  │  (10%)  │ │ (5%)  │ │  (5%)   │                             │
│  └─────────┘ └───────┘ └─────────┘                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. PILAR 1: ANÁLISIS DE MERCADO (25%)

### 3.1 Datos Demográficos

#### API: INEGI Censo de Población
- **Endpoint:** `https://www.inegi.org.mx/servicios/api_censos.html`
- **Datos clave:**
  - Población total por AGEB (Área Geoestadística Básica)
  - Distribución por edad (target 15-45 años para fast food)
  - Hogares y tamaño promedio
  - Población económicamente activa
  - Nivel de escolaridad

```typescript
// Ejemplo de integración
interface DatosDemograficos {
  poblacionTotal: number;
  poblacion15_45: number;      // Target principal
  hogaresTotal: number;
  ingresoPer capita: number;
  densidadPoblacional: number; // hab/km²
  tasaCrecimiento5Años: number;
}
```

#### API: AMAI (Asociación Mexicana de Agencias de Investigación)
- **Propósito:** Clasificación NSE científica (no estimada)
- **Niveles:** A/B, C+, C, C-, D+, D, E
- **Variables:** 6 preguntas AMAI (educación jefe hogar, autos, internet, etc.)

#### API: Data México (data.mexico.gob.mx)
- **Endpoint:** API REST abierta
- **Datos:** PIB municipal, empleo formal, actividad económica

### 3.2 Análisis de Demanda

#### Metodología: TAM-SAM-SOM
```
TAM (Total Addressable Market)
├── Gasto total en fast food en ZMM: ~$XX millones/año
│
SAM (Serviceable Addressable Market)
├── Mercado de pollo frito/tenders: ~$XX millones/año
│
SOM (Serviceable Obtainable Market)
└── Participación realista Crispy Tenders: X%
```

#### Fuentes para sizing de mercado:
1. **Euromonitor International** - Reportes de fast food México
2. **CANIRAC** (Cámara Nacional de Restaurantes) - Estadísticas del sector
3. **ANTAD** - Datos de consumo en centros comerciales

---

## 4. PILAR 2: ANÁLISIS COMPETITIVO (20%)

### 4.1 Inteligencia Competitiva en Tiempo Real

#### API: Google Places API
```typescript
// Datos a extraer por competidor
interface CompetidorEnriquecido {
  // Básicos (ya los tenemos)
  nombre: string;
  ubicacion: [number, number];

  // NUEVOS - Google Places
  rating: number;              // 1-5 estrellas
  totalReviews: number;        // Volumen de reviews
  priceLevel: number;          // 1-4 ($-$$$$)
  horariosReales: string[];    // Horarios verificados
  tiempoEspera: string;        // "Usually not busy"

  // NUEVOS - Análisis derivado
  sentimentScore: number;      // NLP de reviews
  topComplaints: string[];     // Temas negativos frecuentes
  topPraises: string[];        // Temas positivos
  trendingDirection: 'up' | 'down' | 'stable';
}
```

#### Costo estimado Google Places:
- $17 USD por 1,000 requests (Place Details)
- $32 USD por 1,000 requests (con reviews)
- Presupuesto mensual recomendado: ~$50-100 USD

#### API: Yelp Fusion (si disponible en México)
- Reviews adicionales
- Fotos de usuarios
- Check-ins históricos

### 4.2 Análisis de Precios y Menú

#### Web Scraping (Ético/Legal):
- Menús de competidores desde sitios oficiales
- Precios de Rappi/Uber Eats
- Promociones activas

```typescript
interface AnalisisMenu {
  competidor: string;
  precioPromedio: number;
  rangoPrecios: [number, number];
  productosEstrella: string[];
  combosDisponibles: number;
  precioComboPromedio: number;

  // Índice de competitividad de precio
  indicePrecio: number; // 100 = igual al mercado
}
```

### 4.3 Modelo de Canibalización

**CRÍTICO:** Análisis que las firmas top SIEMPRE incluyen.

```typescript
interface AnalisisCanibaizacion {
  sucursalNueva: string;
  sucursalesExistentes: {
    sucursal: string;
    distanciaKm: number;
    solapamientoZona: number;     // % de overlap en área de influencia
    impactoEstimado: number;      // % reducción ventas esperada
    clientesCompartidos: number;  // Estimación
  }[];

  ventaNetaEsperada: number;      // Ventas nuevas - canibalización
  esViableSinCanibalizar: boolean;
}
```

**Metodología:**
- Círculos de influencia (1km, 3km, 5km)
- Modelo gravitacional de Huff
- Análisis de overlap de isocronas

---

## 5. PILAR 3: ANÁLISIS DE UBICACIÓN (20%)

### 5.1 Flujo y Tráfico Real

#### API: Google Maps Platform - Routes/Traffic
```typescript
interface DatosTrafico {
  // Flujo vehicular
  traficoPromedioDia: number;    // Vehículos/hora
  traficoHoraPico: number;
  congestionIndex: number;       // 0-10

  // Accesibilidad
  tiempoAcceso5km: number;       // Minutos promedio
  estacionamientoCercano: number; // Cajones estimados
}
```

#### API: Mapbox Traffic / HERE Traffic
- Alternativa más económica a Google
- Datos históricos de tráfico
- Predicciones de flujo

#### Foot Traffic Analytics (Premium)

**Placer.ai / SafeGraph equivalente México:**
- Datos de movilidad de celulares (anonimizados)
- Flujo peatonal real por hora/día
- Perfil demográfico de visitantes
- Tiempo de permanencia

**Alternativa económica: Datos de Google Popular Times**
- Extraer via Places API
- Patrones de afluencia por hora
- Comparativo con competencia

### 5.2 Análisis de Isocronas

**Herramienta:** TravelTime API / Mapbox Isochrone

```typescript
interface AnalisisIsocrona {
  ubicacion: [number, number];

  // Población alcanzable en X minutos
  poblacion5minCaminando: number;
  poblacion10minCaminando: number;
  poblacion5minAuto: number;
  poblacion15minAuto: number;

  // Comparativo con otras ubicaciones
  rankingAccesibilidad: number;
}
```

### 5.3 Análisis de Visibilidad y Señalización

**Checklist de campo (no automatizable):**
- [ ] Visibilidad desde calle principal
- [ ] Señalización permitida
- [ ] Iluminación nocturna
- [ ] Acceso peatonal directo
- [ ] Fachada atractiva disponible

---

## 6. PILAR 4: ANÁLISIS FINANCIERO (15%)

### 6.1 Modelo Financiero Completo

#### Proyección a 5 años
```typescript
interface ProyeccionFinanciera {
  // Año 1-5
  años: {
    ingresos: number;
    costoVentas: number;         // ~30-35% en fast food
    gastosOperativos: number;    // ~25-30%
    rentaYServicios: number;     // ~10-15%
    marketing: number;           // ~3-5%
    EBITDA: number;
    utilidadNeta: number;
    flujoEfectivo: number;
  }[];

  // Métricas clave
  VPN: number;                   // Valor Presente Neto
  TIR: number;                   // Tasa Interna de Retorno
  paybackMeses: number;
  puntoEquilibrio: {
    clientesDia: number;
    ventasMensuales: number;
  };
}
```

### 6.2 Análisis de Sensibilidad

**Variables a estresar:**
1. Ticket promedio: ±20%
2. Número de clientes: ±30%
3. Costo de renta: ±25%
4. Costo de insumos: ±15%

```typescript
interface AnalisisSensibilidad {
  escenarios: {
    nombre: 'Pesimista' | 'Base' | 'Optimista';
    supuestos: Record<string, number>;
    resultados: {
      TIR: number;
      VPN: number;
      payback: number;
    };
    probabilidad: number; // % asignado
  }[];

  valorEsperado: number; // Suma ponderada
}
```

### 6.3 Simulación Monte Carlo

**Propósito:** Cuantificar incertidumbre de forma rigurosa.

```typescript
// Ejecutar 10,000 simulaciones variando inputs
interface SimulacionMonteCarlo {
  iteraciones: number;

  distribucionResultados: {
    percentil5: number;    // Peor caso realista
    percentil25: number;
    mediana: number;
    percentil75: number;
    percentil95: number;   // Mejor caso realista
  };

  probabilidadExito: number;      // P(VPN > 0)
  probabilidadFracaso: number;    // P(pérdida > inversión)
  riesgoRuina: number;            // P(quiebra en 2 años)
}
```

---

## 7. PILAR 5: ANÁLISIS DE RIESGO (10%)

### 7.1 Riesgo de Seguridad

#### API: Datos de Incidencia Delictiva
- **Fuente:** Secretariado Ejecutivo del SNSP
- **Endpoint:** `https://www.gob.mx/sesnsp/acciones-y-programas/datos-abiertos-de-incidencia-delictiva`

```typescript
interface RiesgoSeguridad {
  colonia: string;

  // Incidentes por cada 100,000 habitantes
  roboNegocio: number;
  roboTranseunte: number;
  vandalismo: number;

  // Índice compuesto
  indiceSeguridad: number;  // 0-100 (100 = más seguro)

  // Tendencia
  tendencia12Meses: 'mejorando' | 'estable' | 'empeorando';
}
```

### 7.2 Riesgo Climático y Natural

#### API: CENAPRED (Centro Nacional de Prevención de Desastres)
- Zonas de inundación
- Riesgo sísmico
- Riesgo de huracanes (menos relevante para MTY)

### 7.3 Riesgo Regulatorio

**Checklist:**
- [ ] Uso de suelo compatible (comercial/mixto)
- [ ] Licencia de funcionamiento factible
- [ ] Regulaciones de ruido/horarios
- [ ] Restricciones de venta de alcohol (si aplica)
- [ ] Normativas de sanidad (COFEPRIS)

### 7.4 Riesgo de Mercado

```typescript
interface RiesgoMercado {
  // Amenaza de nuevos entrantes
  barrerasEntrada: 'alta' | 'media' | 'baja';

  // Concentración de mercado
  herfindahlIndex: number;  // <0.15 = fragmentado, >0.25 = concentrado

  // Tendencia del sector
  crecimientoSector5Años: number;

  // Riesgo específico
  dependenciaAnclaPrincipal: number; // % flujo que depende de 1 tienda
}
```

---

## 8. PILAR 6: ECOSISTEMA DIGITAL (5%)

### 8.1 Cobertura de Delivery

#### APIs de Delivery Platforms
```typescript
interface CoberturaDelivery {
  // Cobertura de plataformas
  rappiDisponible: boolean;
  uberEatsDisponible: boolean;
  didiFood: boolean;

  // Métricas de zona
  tiempoEntregaPromedio: number;  // minutos
  demandaDeliveryZona: 'alta' | 'media' | 'baja';

  // Competencia en delivery
  restaurantesCercanos: number;
  ratingPromedioZona: number;
}
```

### 8.2 Presencia Digital de la Zona

```typescript
interface EcosistemaDigital {
  // Conectividad
  coberturaInternetHogar: number;  // % hogares con internet
  cobertura4G5G: number;           // % cobertura móvil

  // Adopción digital
  penetracionSmartphone: number;
  usoAppsBancarias: number;

  // Para marketing digital
  costoAdquisicionDigital: number; // CAC estimado
  alcanceFacebookAds: number;      // Usuarios alcanzables
}
```

---

## 9. PILAR 7: FACTIBILIDAD OPERATIVA (5%)

### 9.1 Supply Chain

```typescript
interface AnalisisSupplyChain {
  // Proveedores
  distanciaCEDIS: number;          // km al centro de distribución
  frecuenciaAbasto: string;        // diaria, 3x semana, etc.

  // Logística
  accesoCargaDescarga: boolean;
  restriccionesHorario: string[];

  // Costos logísticos
  costoFleteEstimado: number;
}
```

### 9.2 Disponibilidad de Talento

#### API: LinkedIn Talent Insights (Premium)
- Disponibilidad de personal en zona
- Salarios promedio del sector
- Rotación estimada

#### Alternativa: IMSS/INEGI
- Trabajadores registrados en sector restaurantero
- Salario promedio municipal

---

## 10. IMPLEMENTACIÓN TÉCNICA PROPUESTA

### 10.1 Arquitectura de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │Dashboard │  │ Análisis │  │ Reportes │  │  Config  │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │                │
├───────┴─────────────┴─────────────┴─────────────┴────────────────┤
│                        API LAYER (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Scoring   │  │  Financial  │  │    Risk     │              │
│  │   Engine    │  │   Models    │  │  Analysis   │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
├─────────┴────────────────┴────────────────┴──────────────────────┤
│                     DATA AGGREGATION LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐   │
│  │ INEGI │ │Google │ │ SNSP  │ │ Data  │ │Delivery│ │Scrapers│  │
│  │ DENUE │ │Places │ │Crime  │ │México │ │ APIs  │ │ (Menu) │   │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 APIs a Integrar (Prioridad)

| API | Prioridad | Costo Estimado | Impacto |
|-----|-----------|----------------|---------|
| Google Places | 🔴 Alta | ~$100/mes | Reviews, ratings, horarios |
| INEGI Censos | 🔴 Alta | Gratis | Demografía real |
| Data México | 🔴 Alta | Gratis | Economía municipal |
| SNSP Delitos | 🟡 Media | Gratis | Índice seguridad |
| Mapbox/HERE | 🟡 Media | ~$50/mes | Isocronas, tráfico |
| LinkedIn Talent | 🟢 Baja | Premium | RRHH insights |

### 10.3 Roadmap de Implementación

```
FASE 1 (Semanas 1-2): Datos Demográficos
├── Integrar INEGI Censos API
├── Integrar Data México
└── Crear modelo demográfico por AGEB

FASE 2 (Semanas 3-4): Inteligencia Competitiva
├── Integrar Google Places API
├── Desarrollar análisis de sentiment
└── Implementar modelo de canibalización

FASE 3 (Semanas 5-6): Análisis Financiero Avanzado
├── Modelo de proyección a 5 años
├── Análisis de sensibilidad
└── Simulación Monte Carlo básica

FASE 4 (Semanas 7-8): Riesgo y Operaciones
├── Integrar datos de seguridad SNSP
├── Análisis de cobertura delivery
└── Dashboard de riesgos

FASE 5 (Semanas 9-10): Refinamiento
├── Calibración de modelo con datos reales
├── Validación con sucursales existentes
└── Documentación y training
```

---

## 11. ENTREGABLES FINALES (Estilo McKinsey)

### 11.1 Executive Summary (1 página)
- Recomendación GO/NO-GO
- Score final con semáforo
- 3 factores críticos
- ROI esperado

### 11.2 Scorecard de Ubicación (2 páginas)
```
┌─────────────────────────────────────────────────────────────────┐
│                    VIABILITY SCORECARD                           │
│                    Plaza Andenes Universidad                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SCORE TOTAL: 72/100                    [=======>    ] EVALUAR  │
│                                                                  │
│  ┌─────────────────┬────────┬────────┬───────────────────────┐  │
│  │ Factor          │ Peso   │ Score  │ Detalle               │  │
│  ├─────────────────┼────────┼────────┼───────────────────────┤  │
│  │ Mercado         │ 25%    │ 78     │ Zona universitaria    │  │
│  │ Competencia     │ 20%    │ 65     │ 2 KFC en 3km          │  │
│  │ Ubicación       │ 20%    │ 82     │ Excelente acceso      │  │
│  │ Finanzas        │ 15%    │ 70     │ ROI 28%, payback 14m  │  │
│  │ Riesgo          │ 10%    │ 60     │ Seguridad media       │  │
│  │ Digital         │ 5%     │ 75     │ Cobertura delivery OK │  │
│  │ Operativo       │ 5%     │ 68     │ Supply chain viable   │  │
│  └─────────────────┴────────┴────────┴───────────────────────┘  │
│                                                                  │
│  RECOMENDACIÓN: Proceder con due diligence adicional en        │
│                 competencia y negociación de renta              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 11.3 Análisis Detallado (10-15 páginas)
- Metodología
- Datos y fuentes
- Análisis por pilar
- Escenarios financieros
- Matriz de riesgos
- Plan de mitigación

### 11.4 Modelo Financiero (Excel/Interactivo)
- P&L proyectado 5 años
- Flujo de caja
- Análisis de sensibilidad
- Dashboard interactivo

---

## 12. INVERSIÓN ESTIMADA

### Desarrollo Técnico
| Concepto | Costo Estimado |
|----------|----------------|
| Integración APIs (Fase 1-2) | $15,000 - $25,000 MXN |
| Modelos Financieros (Fase 3) | $10,000 - $15,000 MXN |
| Dashboard de Riesgos (Fase 4) | $8,000 - $12,000 MXN |
| QA y Refinamiento | $5,000 - $8,000 MXN |
| **Total Desarrollo** | **$38,000 - $60,000 MXN** |

### Costos Recurrentes (Mensuales)
| Concepto | Costo/Mes |
|----------|-----------|
| Google Places API | ~$100 USD (~$1,800 MXN) |
| Hosting (Railway) | ~$20 USD (~$360 MXN) |
| Mapbox (opcional) | ~$50 USD (~$900 MXN) |
| **Total Mensual** | **~$3,000 MXN** |

### ROI del Sistema
- Costo de decisión equivocada (abrir mal ubicación): **~$500,000 - $800,000 MXN**
- Costo del sistema completo: **~$60,000 MXN + $36,000/año**
- **ROI si evita 1 mala decisión: 700%+**

---

## 13. BENCHMARKS DE INDUSTRIA

### Métricas de éxito en Fast Food México (2024):
| Métrica | Promedio | Top Quartile | Meta Crispy |
|---------|----------|--------------|-------------|
| Ticket promedio | $120-150 | $180-220 | $185-200 |
| Clientes/día | 80-120 | 150-200 | 100-130 |
| Rent-to-Sales | 8-12% | 6-8% | <10% |
| Food Cost | 28-35% | 25-28% | <30% |
| Labor Cost | 20-28% | 18-22% | <25% |
| EBITDA Margin | 8-15% | 18-25% | >15% |
| Payback (meses) | 24-36 | 12-18 | <18 |

---

## 14. PRÓXIMOS PASOS RECOMENDADOS

### Inmediato (Esta semana):
1. ✅ Aprobar alcance de Fase 1 (Demografía)
2. ✅ Obtener API key de Google Places
3. ✅ Definir las 3-5 ubicaciones prioritarias a analizar

### Corto plazo (2-4 semanas):
1. Implementar integraciones Fase 1-2
2. Validar modelo con datos de sucursales actuales
3. Generar primer reporte completo para Plaza 1500

### Mediano plazo (1-2 meses):
1. Completar Fases 3-5
2. Calibrar modelo con resultados reales
3. Documentar metodología para uso interno

---

## ANEXO A: APIs y Fuentes de Datos Detalladas

### A.1 INEGI - APIs Disponibles

| API | URL | Datos |
|-----|-----|-------|
| DENUE | inegi.org.mx/servicios/api_denue.html | Unidades económicas |
| Censos | inegi.org.mx/servicios/api_censos.html | Población, vivienda |
| Indicadores | inegi.org.mx/servicios/api_indicadores.html | Económicos |
| SCINCE | inegi.org.mx/servicios/scince.html | Por AGEB |

### A.2 Google Maps Platform

| API | Uso | Pricing (USD) |
|-----|-----|---------------|
| Places API | Detalles, reviews | $17/1000 requests |
| Geocoding | Coordenadas | $5/1000 requests |
| Distance Matrix | Tiempos | $5/1000 elements |
| Directions | Rutas | $5/1000 requests |

### A.3 Otras Fuentes Gratuitas

| Fuente | URL | Datos |
|--------|-----|-------|
| Data México | datamexico.org | Económicos abiertos |
| SNSP | gob.mx/sesnsp | Incidencia delictiva |
| CONEVAL | coneval.org.mx | Pobreza, marginación |
| CONAPO | conapo.gob.mx | Proyecciones población |

---

*Documento preparado siguiendo metodologías de consultoría estratégica.*
*Adaptado para el mercado mexicano de franquicias de fast food.*
