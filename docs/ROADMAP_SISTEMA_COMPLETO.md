# ROADMAP: SISTEMA COMPLETO DE VIABILIDAD
## Buscador Híbrido de Plazas Comerciales + APIs Integradas

**Fecha:** Enero 2025
**Objetivo:** Llevar el sistema de ~70% a ~95% de confianza

---

## 📊 ESTADO ACTUAL vs OBJETIVO

### Nivel de Confianza por Pilar

| Pilar | Peso | Actual | Objetivo | Gap |
|-------|------|--------|----------|-----|
| **1. Mercado/Demografía** | 25% | 65% | 95% | 🔴 -30% |
| **2. Competencia** | 20% | 90% | 95% | 🟢 -5% |
| **3. Ubicación/Tráfico** | 20% | 20% | 85% | 🔴 -65% |
| **4. Financiero** | 15% | 40% | 80% | 🟡 -40% |
| **5. Riesgo** | 10% | 75% | 90% | 🟢 -15% |
| **6. Digital/Delivery** | 5% | 30% | 80% | 🟡 -50% |
| **7. Operativo** | 5% | 50% | 75% | 🟡 -25% |
| **TOTAL PONDERADO** | 100% | **~55%** | **~90%** | **-35%** |

---

## 🗺️ MAPA DE APIs Y SERVICIOS

### LEYENDA
- 🟢 **Ya integrado** - Funcionando en producción
- 🟡 **Parcial** - Integrado pero incompleto
- 🔴 **Faltante** - No implementado
- 💰 **Pago** - Requiere suscripción
- 🆓 **Gratis** - Sin costo o free tier generoso

---

## PILAR 1: MERCADO Y DEMOGRAFÍA (25%)

### Estado Actual: 65% → Objetivo: 95%

| Fuente | Status | Costo | Datos | Impacto |
|--------|--------|-------|-------|---------|
| INEGI Censo (municipio) | 🟢 | 🆓 | Población por municipio | +15% |
| INEGI AGEB | 🟡 | 🆓 | Demografía por manzana | +20% |
| AMAI NSE | 🔴 | 💰 ~$5K/año | NSE científico | +15% |
| Data México | 🟡 | 🆓 | PIB, empleo | +10% |
| CONAPO Proyecciones | 🔴 | 🆓 | Crecimiento poblacional | +5% |

### Acciones para Fase 2:
```
1. Descargar datos AGEB completos de Nuevo León
   - URL: https://www.inegi.org.mx/app/scitel/Default?ev=10
   - Importar CSV a base de datos
   - Crear función de geocodificación inversa

2. Integrar CONAPO
   - URL: https://datos.gob.mx/busca/dataset/proyecciones-de-la-poblacion-de-mexico
   - Proyecciones 2020-2050
   - Calcular crecimiento esperado por zona

3. (Opcional) Contratar AMAI
   - Contacto: https://www.amai.org/
   - Proporciona NSE real por AGEB
```

---

## PILAR 2: ANÁLISIS COMPETITIVO (20%)

### Estado Actual: 90% → Objetivo: 95%

| Fuente | Status | Costo | Datos | Impacto |
|--------|--------|-------|-------|---------|
| Google Places | 🟢 | 🆓 10K/mes | Ratings, reviews, horarios | +40% |
| INEGI DENUE | 🟢 | 🆓 | Competidores por zona | +30% |
| Yelp Fusion | 🔴 | 🆓 5K/día | Reviews adicionales | +5% |
| Web Scraping Menús | 🔴 | 🆓 | Precios competencia | +10% |

### Acciones para Fase 2:
```
1. Integrar Yelp Fusion API (opcional)
   - URL: https://www.yelp.com/developers
   - Complementa reviews de Google

2. Scraper de precios (Rappi/UberEats)
   - Obtener precios de KFC, Pollo Loco, etc.
   - Calcular índice de competitividad
```

---

## PILAR 3: UBICACIÓN Y TRÁFICO (20%) ⚠️ CRÍTICO

### Estado Actual: 20% → Objetivo: 85%

| Fuente | Status | Costo | Datos | Impacto |
|--------|--------|-------|-------|---------|
| Google Places (búsqueda) | 🟢 | 🆓 | Lista de plazas | +10% |
| OpenStreetMap | 🔴 | 🆓 | Geometría, POIs | +10% |
| Google Popular Times | 🔴 | 💰 $17/1K | Afluencia por hora | +20% |
| **Placer.ai** | 🔴 | 💰 ~$500/mes | Flujo peatonal REAL | +25% |
| **HERE Traffic** | 🔴 | 💰 ~$100/mes | Tráfico vehicular | +15% |
| Mapbox Isochrone | 🔴 | 🆓 50K/mes | Población alcanzable | +10% |

### Acciones para Fase 3-4:
```
FASE 3 (Gratis):
1. Integrar OpenStreetMap via Overpass API
   - Buscar: amenity=shopping_mall
   - Obtener geometría y metadata

2. Integrar Mapbox Isochrone
   - URL: https://www.mapbox.com/
   - Free tier: 50,000 requests/mes
   - Calcular población a 5, 10, 15 min

FASE 4 (Pago):
3. Placer.ai (CRÍTICO para flujo real)
   - URL: https://www.placer.ai/
   - Contactar para cotización enterprise
   - Alternativa: SafeGraph, Unacast

4. HERE Traffic API
   - URL: https://developer.here.com/
   - Free tier: 250K requests/mes
   - Datos de tráfico en tiempo real
```

---

## PILAR 4: ANÁLISIS FINANCIERO (15%)

### Estado Actual: 40% → Objetivo: 80%

| Componente | Status | Costo | Descripción | Impacto |
|------------|--------|-------|-------------|---------|
| P&L Proyectado | 🟡 | 🆓 | 5 años básico | +15% |
| Análisis Sensibilidad | 🔴 | 🆓 | Escenarios | +15% |
| Monte Carlo | 🔴 | 🆓 | Simulación riesgo | +20% |
| Benchmarks industria | 🔴 | 💰 | Comparativos reales | +10% |
| Modelo Canibalización | 🔴 | 🆓 | Impacto entre sucursales | +20% |

### Acciones para Fase 3:
```
1. Modelo de Canibalización
   - Implementar modelo de Huff
   - Calcular overlap de áreas de influencia
   - Estimar impacto en ventas de sucursales existentes

2. Simulación Monte Carlo
   - 10,000 iteraciones
   - Variables: ticket, clientes, renta, costo insumos
   - Calcular probabilidad de éxito

3. Análisis de Sensibilidad
   - Escenarios: Pesimista, Base, Optimista
   - Tornado chart de variables críticas
```

---

## PILAR 5: ANÁLISIS DE RIESGO (10%)

### Estado Actual: 75% → Objetivo: 90%

| Fuente | Status | Costo | Datos | Impacto |
|--------|--------|-------|-------|---------|
| CENAPRED | 🟢 | 🆓 | Riesgo natural | +30% |
| SNSP | 🟢 | 🆓 | Seguridad estatal | +20% |
| SNSP por colonia | 🔴 | 🆓 | Seguridad granular | +15% |
| Riesgo regulatorio | 🔴 | Manual | Uso de suelo | +10% |

### Acciones para Fase 2:
```
1. Integrar datos SNSP por municipio
   - Descargar: https://www.gob.mx/sesnsp
   - Calcular índice por tipo de delito
   - Normalizar a escala 0-100

2. Checklist regulatorio
   - Uso de suelo comercial
   - Licencias requeridas
   - Restricciones de horario
```

---

## PILAR 6: ECOSISTEMA DIGITAL (5%)

### Estado Actual: 30% → Objetivo: 80%

| Fuente | Status | Costo | Datos | Impacto |
|--------|--------|-------|-------|---------|
| Cobertura Rappi | 🔴 | Manual | Zona de entrega | +25% |
| Cobertura UberEats | 🔴 | Manual | Zona de entrega | +25% |
| DiDi Food | 🔴 | Manual | Zona de entrega | +15% |
| Cobertura 4G/5G | 🔴 | 🆓 | Conectividad | +10% |

### Acciones para Fase 3:
```
1. Verificar cobertura de delivery
   - Método: Consulta manual en apps
   - O usar sus APIs (si disponibles)

2. Mapa de conectividad
   - Datos de IFT (Instituto Federal de Telecomunicaciones)
   - Cobertura por operador
```

---

## PILAR 7: FACTIBILIDAD OPERATIVA (5%)

### Estado Actual: 50% → Objetivo: 75%

| Componente | Status | Costo | Datos | Impacto |
|------------|--------|-------|-------------|---------|
| Distancia a CEDIS | 🟡 | 🆓 | Google Maps | +20% |
| Disponibilidad talento | 🔴 | 💰 | LinkedIn Insights | +15% |
| Costo logístico | 🔴 | Manual | Estimación | +15% |

### Acciones para Fase 4:
```
1. Calcular rutas a CEDIS
   - Usar Google Directions API
   - Estimar costo de flete

2. (Opcional) LinkedIn Talent Insights
   - Disponibilidad de personal en zona
   - Salarios promedio del sector
```

---

## 📅 CRONOGRAMA DE IMPLEMENTACIÓN

### FASE 1: Auditoría y Preparación (Día 1)
```
✅ Documentar estado actual (este documento)
✅ Definir prioridades
✅ Estimar costos
```

### FASE 2: APIs Gratuitas (Días 2-4)
```
□ Descargar datos AGEB completos de NL
□ Integrar CONAPO proyecciones
□ Mejorar datos SNSP por municipio
□ Integrar OpenStreetMap para plazas
□ Integrar Mapbox Isochrone
```

### FASE 3: Motor de Búsqueda (Días 5-8)
```
□ API de descubrimiento de plazas
□ Sistema de scoring unificado
□ Modelo de canibalización
□ Análisis financiero avanzado
□ UI de búsqueda y filtros
□ Mapa interactivo con resultados
```

### FASE 4: APIs de Pago (Días 9-12)
```
□ Contratar HERE Traffic (~$100/mes)
□ Evaluar Placer.ai (~$500/mes)
□ Integrar Google Popular Times
□ Calibrar modelo con datos reales
```

### FASE 5: Capa Agéntica (Días 13-15)
```
□ Definir tools para Claude
□ Crear prompt system optimizado
□ UI de chat integrada
□ Testing y refinamiento
```

---

## 💰 PRESUPUESTO ESTIMADO

### Costos Únicos (Desarrollo)
| Fase | Estimado |
|------|----------|
| Fase 2: APIs Gratuitas | ~$10,000 MXN |
| Fase 3: Motor Búsqueda | ~$25,000 MXN |
| Fase 4: APIs Pago | ~$15,000 MXN |
| Fase 5: Agente IA | ~$20,000 MXN |
| **Total Desarrollo** | **~$70,000 MXN** |

### Costos Recurrentes (Mensuales)
| Servicio | Costo/Mes |
|----------|-----------|
| Google Places (10K gratis, excedente) | ~$50 USD |
| Mapbox (50K gratis) | $0 |
| HERE Traffic | ~$100 USD |
| Placer.ai (opcional) | ~$500 USD |
| Claude API | ~$50 USD |
| Railway hosting | ~$20 USD |
| **Total Mensual Mínimo** | **~$220 USD** |
| **Total Mensual con Placer** | **~$720 USD** |

---

## 🎯 IMPACTO ESPERADO POR FASE

```
Estado Inicial:     ████████░░░░░░░░░░░░ 55%

Después Fase 2:     ██████████████░░░░░░ 70%
(+APIs gratuitas)

Después Fase 3:     ████████████████░░░░ 80%
(+Motor búsqueda)

Después Fase 4:     ██████████████████░░ 90%
(+APIs pago)

Después Fase 5:     ███████████████████░ 95%
(+Agente IA)
```

---

## 🔑 APIs Y SERVICIOS - RESUMEN DE ACCESO

### GRATUITAS (Implementar en Fase 2)

| API | URL | Token | Límite |
|-----|-----|-------|--------|
| OpenStreetMap | overpass-api.de | No | Ilimitado |
| Mapbox | mapbox.com | Sí (gratis) | 50K/mes |
| CONAPO | datos.gob.mx | No | Ilimitado |
| IFT Cobertura | ift.org.mx | No | Ilimitado |

### DE PAGO (Implementar en Fase 4)

| API | URL | Costo | Contacto |
|-----|-----|-------|----------|
| HERE Traffic | developer.here.com | ~$100/mes | Self-service |
| Placer.ai | placer.ai | ~$500/mes | Sales call |
| BestTime | besttime.app | ~$50/mes | Self-service |
| AMAI NSE | amai.org | ~$5K/año | Membresía |

---

## ✅ SIGUIENTE PASO

**¿Empezamos con Fase 2?**

Te guío para:
1. Descargar datos AGEB de Nuevo León
2. Crear cuenta Mapbox (gratis)
3. Integrar OpenStreetMap
4. Mejorar scoring con nuevos datos

¿Listo para comenzar?

---

*Roadmap generado: Enero 2025*
*Proyecto: Viabilidad Crispy Tenders*
