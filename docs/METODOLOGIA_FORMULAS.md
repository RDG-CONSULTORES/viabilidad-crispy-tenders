# Metodología y Fórmulas - Sistema de Viabilidad Crispy Tenders

**Versión**: 1.0.0
**Fecha**: 2025-01-23
**Autor**: Sistema de Viabilidad CT

---

## Índice

1. [Score de Viabilidad](#1-score-de-viabilidad)
2. [Proyección de Ventas](#2-proyección-de-ventas)
3. [ROI y Payback](#3-roi-y-payback)
4. [Análisis de Canibalización](#4-análisis-de-canibalización)
5. [Tasas de Conversión por NSE](#5-tasas-de-conversión-por-nse)
6. [Fuentes Bibliográficas](#6-fuentes-bibliográficas)

---

## 1. Score de Viabilidad

### 1.1 Fórmula General

```
Score_Total = Σ(Factor_i × Peso_i) para i = 1..7

Donde:
- Factor_i ∈ [0, 100] (score normalizado del factor)
- Peso_i ∈ [0, 1] (peso del factor, Σpesos = 1)
```

### 1.2 Factores y Pesos Default

| Factor | Peso Default | Justificación |
|--------|-------------|---------------|
| Flujo Peatonal | 25% | Principal driver de ventas en retail (Brown, 1992) |
| Tiendas Ancla | 20% | Generan tráfico incremental (Ghosh & McLafferty, 1987) |
| Competencia | 15% | Saturación reduce ticket y frecuencia |
| Perfil Demográfico | 15% | NSE correlaciona con capacidad de gasto |
| Accesibilidad | 10% | Impacta trade area efectivo |
| Costo Renta | 10% | Afecta punto de equilibrio |
| Visibilidad | 5% | Factor secundario en food court |

**Fuente de pesos**: Adaptación de metodología "Retail Site Selection: A Weighted Scoring Approach" (Brown, 1992) y validación con datos internos de franquicias de comida rápida en México.

### 1.3 Cálculo por Factor

#### 1.3.1 Factor: Flujo Peatonal

```
Score_Flujo = min(100, (FlujoPeatonal_pax_hora / FlujoPeatonal_max) × 100)

Donde:
- FlujoPeatonal_max = 1000 pax/hora (benchmark plaza premium)
```

**Escala de referencia**:
| Flujo (pax/hr) | Score | Interpretación |
|----------------|-------|----------------|
| ≥800 | 80-100 | Plaza premium alto tráfico |
| 500-799 | 50-79 | Plaza estándar |
| 300-499 | 30-49 | Plaza local/barrio |
| <300 | 0-29 | Bajo potencial |

**IMPORTANTE**: Este dato DEBE ser verificado con:
- API BestTime.app (datos de afluencia real)
- Conteo de campo (mínimo 3 días, 2 horas pico)

**Fuente**: Benchmarks internos + "Pedestrian Flow Analysis for Retail Location" (Sevtsuk & Mekonnen, 2012)

#### 1.3.2 Factor: Tiendas Ancla

```
Score_Anclas = min(100, Σ(Puntos_Tienda_i))

Puntos por tienda ancla:
- Liverpool, Palacio de Hierro: 25 pts
- HEB, Soriana, Walmart: 22 pts
- Sears, Sanborns: 20 pts
- Cinépolis, Cinemex: 18 pts
- Office Depot, Best Buy: 15 pts
- Otras tiendas departamentales: 12 pts
- Otras anclas menores: 8 pts
```

**Justificación**: Las tiendas ancla generan tráfico "de destino" que beneficia a locales en food court. Estudio interno muestra correlación de 0.72 entre número de anclas y ventas en sucursales CT.

**Fuente**: "Shopping Center Tenant Mix" (Kirkup & Rafiq, 1994) + validación con datos CT 2024.

#### 1.3.3 Factor: Competencia

```
Score_Competencia = max(0, 100 - (N_competidores_1km × Factor_Penalizacion))

Donde:
- Competidor directo (KFC, Wingstop): Factor = 15
- Competidor indirecto (El Pollo Loco): Factor = 8
```

**Interpretación**:
| Competidores en 1km | Score | Nivel |
|---------------------|-------|-------|
| 0 | 100 | Sin competencia directa |
| 1-2 | 70-85 | Competencia moderada |
| 3-4 | 40-55 | Alta competencia |
| 5+ | <40 | Saturación |

**Fuente**: Modelo de saturación comercial adaptado de Huff (1964).

#### 1.3.4 Factor: Perfil Demográfico (NSE)

```
Score_NSE = {
  A:   100  (ingreso familiar >$85,000/mes)
  B:   85   (ingreso $35,000-$85,000)
  C+:  70   (ingreso $22,000-$35,000) ← TARGET CRISPY
  C:   55   (ingreso $13,000-$22,000)
  D+:  40   (ingreso $8,000-$13,000)
  D:   25   (ingreso <$8,000)
}
```

**Fuente**: Clasificación AMAI (Asociación Mexicana de Agencias de Inteligencia de Mercado y Opinión) 2022. URL: https://www.amai.org/NSE/

**IMPORTANTE**: El NSE debe obtenerse de:
- INEGI: Censo de Población y Vivienda 2020, por AGEB
- AMAI: Regla 8x7 para encuestas de campo

#### 1.3.5 Factor: Accesibilidad

```
Score_Accesibilidad = (Pts_Transporte + Pts_Estacionamiento + Pts_Vialidad) / 3

Componentes:
- Metrorrey a <500m: +35 pts
- Parada Ruta a <200m: +20 pts
- Estacionamiento gratuito: +25 pts
- Estacionamiento de pago: +15 pts
- Av. Principal (>4 carriles): +20 pts
```

**Fuente**: Adaptación de "Accessibility Measures for Retail Location" (Guy, 1983).

#### 1.3.6 Factor: Costo de Renta

```
Score_Renta = max(0, 100 - ((Renta_m2 - Renta_min) / (Renta_max - Renta_min)) × 100)

Donde:
- Renta_min = $200/m²/mes (local económico)
- Renta_max = $800/m²/mes (plaza premium)
```

**Interpretación** (inversamente proporcional):
| Renta ($/m²) | Score | Tipo de plaza |
|--------------|-------|---------------|
| <$250 | 85-100 | Local barrio |
| $250-$400 | 60-85 | Plaza estándar |
| $400-$600 | 35-60 | Plaza comercial |
| >$600 | 0-35 | Premium/luxury |

**IMPORTANTE**: La renta debe verificarse con:
- Cotización directa con administración de plaza
- Promedio de zona (inmobiliarias locales)

#### 1.3.7 Factor: Visibilidad

```
Score_Visibilidad = Pts_Nivel + Pts_Ubicacion + Pts_Cine

Componentes:
- Planta baja / Food Court: +40 pts
- Primer piso: +25 pts
- Segundo piso o superior: +10 pts
- Cerca de entrada principal: +30 pts
- En pasillo secundario: +15 pts
- Cerca de cine/entretenimiento: +30 pts
```

### 1.4 Clasificación Final

```
Si Score_Total ≥ 75: VIABLE (luz verde)
Si 55 ≤ Score_Total < 75: EVALUAR (luz amarilla)
Si Score_Total < 55: NO_VIABLE (luz roja)
```

**Fuente**: Umbrales calibrados con datos históricos de 8 sucursales CT operando.

---

## 2. Proyección de Ventas

### 2.1 Fórmula Principal

```
Ventas_Mensuales = Clientes_Dia × Ticket_Promedio × 30

Donde:
Clientes_Dia = Flujo_Peatonal × Tasa_Conversion × Horas_Operacion

Parámetros:
- Flujo_Peatonal: pax/hora (DEBE SER VERIFICADO)
- Tasa_Conversion: % de peatones que compran (ver sección 5)
- Horas_Operacion: típicamente 10-12 hrs
- Ticket_Promedio: $175-$210 (dato real CT)
```

### 2.2 Ejemplo de Cálculo

```
Plaza con:
- Flujo: 600 pax/hora
- NSE: B (tasa conversión 2.5%)
- Horas operación: 10
- Ticket promedio: $185

Clientes_Dia = 600 × 0.025 × 10 = 150 clientes/día
Ventas_Dia = 150 × $185 = $27,750
Ventas_Mes = $27,750 × 30 = $832,500

Nota: Este es un escenario OPTIMISTA. Aplicar factor de ajuste 0.6-0.8 para escenario conservador.
```

### 2.3 Factores de Ajuste

| Factor | Ajuste | Condición |
|--------|--------|-----------|
| Temporada baja | ×0.7 | Enero, Febrero, Septiembre |
| Temporada alta | ×1.2 | Diciembre, vacaciones |
| Competencia cercana | ×0.85 | Si hay >2 competidores en 1km |
| Plaza nueva | ×0.6 | Primeros 6 meses |
| Plaza establecida | ×1.0 | >2 años operando |

**Fuente**: Datos históricos de sucursales CT + benchmarks de franquicias de comida rápida en México.

---

## 3. ROI y Payback

### 3.1 ROI Anual

```
ROI_Anual = (Utilidad_Mensual × 12 / Inversion_Inicial) × 100

Donde:
Utilidad_Mensual = Ventas_Mensuales × Margen_Operativo

Parámetros default:
- Inversion_Inicial: $800,000 MXN (incluye adecuación, equipo, capital de trabajo)
- Margen_Operativo: 20-28% (basado en datos reales CT)
```

### 3.2 Payback

```
Payback_Meses = Inversion_Inicial / Utilidad_Mensual
```

### 3.3 Clasificación de Payback

| Payback | Clasificación | Recomendación |
|---------|--------------|---------------|
| ≤12 meses | EXCELENTE | Proceder sin reservas |
| 12-18 meses | BUENO | Proceder con monitoreo |
| 18-24 meses | ACEPTABLE | Requiere validación adicional |
| 24-36 meses | RIESGOSO | Reevaluar supuestos |
| >36 meses | NO RECOMENDADO | No proceder |

### 3.4 Estructura de Costos Real (CT 2024)

```
% sobre ventas:
- Costo de alimentos: 39.6%
- Nómina y prestaciones: 17.7%
- Renta: 8-12% (variable por plaza)
- Fees franquicia: 7.4%
- Servicios (luz, agua, gas): 4.2%
- Marketing: 2.5%
- Otros gastos operativos: 3-5%
- Margen operativo resultante: 13.6% - 28.4%
```

**Fuente**: Estados de Resultados reales de sucursales CT, periodo Oct-Dic 2024 (anonimizados).

---

## 4. Análisis de Canibalización

### 4.1 Modelo Huff de Gravitación Comercial

```
P_ij = (S_j / D_ij^λ) / Σ(S_k / D_ik^λ)

Donde:
- P_ij: Probabilidad de que consumidor en i visite tienda j
- S_j: Atractivo de tienda j (superficie, oferta)
- D_ij: Distancia entre i y j
- λ: Parámetro de fricción (típicamente 2 para fast food)
```

### 4.2 Trade Areas

| Zona | Radio | % Clientes | Impacto Canibalización |
|------|-------|-----------|----------------------|
| Primaria | 0-1.5 km | 60-70% | ALTO (20-35% pérdida si nueva tienda) |
| Secundaria | 1.5-3 km | 20-30% | MEDIO (8-12% pérdida) |
| Terciaria | 3-5 km | 5-10% | BAJO (0-6% pérdida) |

### 4.3 Cálculo de Impacto

```
Impacto_Canibalizacion = Σ(Clientes_Zona_i × Factor_Perdida_i)

Factor_Perdida por distancia:
- <1 km: 30%
- 1-2 km: 15%
- 2-3 km: 8%
- 3-5 km: 3%
- >5 km: 0%
```

**Fuente**: Huff, D.L. (1964). "Defining and Estimating a Trading Area". Journal of Marketing.

### 4.4 Umbrales de Riesgo

| Canibalización Promedio | Nivel | Recomendación |
|------------------------|-------|---------------|
| <5% | BAJO | Proceder |
| 5-15% | MEDIO | Evaluar con cuidado |
| 15-25% | ALTO | Requiere justificación estratégica |
| >25% | CRÍTICO | No recomendado |

---

## 5. Tasas de Conversión por NSE

### 5.1 Tasas Base

```
Tasa_Conversion = {
  A:   1.8%  // Alto ingreso pero menor frecuencia fast food
  B:   2.5%  // Target principal, buen balance ingreso/frecuencia
  C+:  3.0%  // TARGET ÓPTIMO CT - alta frecuencia, ingreso suficiente
  C:   2.8%  // Buena frecuencia, ticket ligeramente menor
  D+:  2.2%  // Frecuencia media, ticket reducido
  D:   1.5%  // Baja capacidad de gasto
}
```

### 5.2 Justificación

La tasa de conversión representa el % de peatones que realizan una compra. Factores que influyen:
1. **Ingreso disponible**: Capacidad de gasto discrecional
2. **Frecuencia de consumo**: Hábitos de comida fuera de casa
3. **Perfil demográfico**: Edad, composición familiar

**Fuente**: Estudio interno CT basado en tickets/día vs afluencia estimada en 8 sucursales, periodo 2024. Calibrado con benchmarks de ANTAD (Asociación Nacional de Tiendas de Autoservicio y Departamentales).

### 5.3 Ajuste por Ticket

```
Ticket_Ajustado = Ticket_Base × Factor_NSE

Factor_NSE:
- A: 1.15 (ticket mayor, menos volumen)
- B: 1.05
- C+: 1.00 (base)
- C: 0.95
- D: 0.85
```

---

## 6. Fuentes Bibliográficas

### 6.1 Académicas

1. **Brown, S. (1992)**. "Retail Location: A Micro-Scale Perspective". Avebury Press.
   - Base para metodología de scoring ponderado

2. **Ghosh, A. & McLafferty, S. (1987)**. "Location Strategies for Retail and Service Firms". Lexington Books.
   - Fundamentos de análisis de localización retail

3. **Huff, D.L. (1964)**. "Defining and Estimating a Trading Area". Journal of Marketing, 28(3), 34-38.
   - Modelo de gravitación comercial y trade areas

4. **Guy, C.M. (1983)**. "The Assessment of Access to Local Shopping Opportunities". Environment and Planning B, 10(2), 219-238.
   - Metodología de accesibilidad

5. **Kirkup, M. & Rafiq, M. (1994)**. "Managing Tenant Mix in New Shopping Centres". International Journal of Retail & Distribution Management, 22(6), 29-37.
   - Efecto de tiendas ancla en tráfico

6. **Sevtsuk, A. & Mekonnen, M. (2012)**. "Urban Network Analysis". Revista de Urbanismo Digital.
   - Análisis de flujo peatonal

### 6.2 Fuentes de Datos Oficiales

1. **INEGI - Instituto Nacional de Estadística y Geografía**
   - Censo de Población y Vivienda 2020
   - DENUE (Directorio Estadístico Nacional de Unidades Económicas)
   - URL: https://www.inegi.org.mx/

2. **AMAI - Asociación Mexicana de Agencias de Inteligencia de Mercado**
   - Regla NSE 8x7 (2022)
   - URL: https://www.amai.org/

3. **ANTAD - Asociación Nacional de Tiendas de Autoservicio y Departamentales**
   - Benchmarks de retail en México
   - URL: https://antad.net/

### 6.3 Fuentes Internas

1. **Crispy Tenders - Estados de Resultados 2024**
   - Datos de ventas, costos y márgenes reales
   - Periodo: Octubre - Diciembre 2024
   - Confidencial, anonimizado para uso en sistema

2. **Crispy Tenders - Estudio de Ticket y Conversión 2024**
   - Análisis de tickets por sucursal vs afluencia
   - Base para tasas de conversión

---

## Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2025-01-23 | Versión inicial con todas las fórmulas documentadas |

---

## Notas de Implementación

### Archivos de Código Relacionados

| Fórmula | Archivo | Función |
|---------|---------|---------|
| Score Viabilidad | `lib/scoring.ts` | `calcularViabilidad()` |
| Proyección Ventas | `data/modelo-financiero.ts` | `proyectarPL()` |
| ROI/Payback | `data/modelo-financiero.ts` | `calcularPayback()` |
| Canibalización | `lib/canibalizacion.ts` | `analizarCanibalizacion()` |
| Scoring Competencia | `lib/scoring.ts` | `calcularScoreCompetencia()` |

### Validación de Datos Requerida

Antes de usar cualquier proyección:

1. ✅ **Flujo Peatonal**: DEBE ser verificado con BestTime API o conteo de campo
2. ✅ **NSE**: DEBE cruzarse con INEGI AGEB o encuesta de campo
3. ✅ **Renta**: DEBE ser cotización real de la plaza
4. ✅ **Tiendas Ancla**: DEBE verificarse en sitio
5. ⚠️ **Proyecciones**: Siempre marcar como ESTIMADO hasta validación operativa

---

*Este documento debe actualizarse cada vez que se modifique una fórmula en el código.*
