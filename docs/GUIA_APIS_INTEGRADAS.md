# GUÍA DE APIs INTEGRADAS - VIABILIDAD CRISPY TENDERS

**Fecha:** Enero 2025
**Versión:** 1.0

---

## RESUMEN DE APIs ACTIVAS

| API | Status | Costo | Token Requerido |
|-----|--------|-------|-----------------|
| Google Places | ✅ Activa | 10K gratis/mes | ✅ Sí |
| INEGI DENUE | ✅ Activa | Gratis | ✅ Sí |
| INEGI Indicadores | ✅ Activa | Gratis | ✅ Sí |
| INEGI AGEB | ✅ Parcial | Gratis | No (descarga) |
| CENAPRED | ✅ Activa | Gratis | No |
| SEPOMEX | ✅ Activa | Gratis | No |
| SNSP | ✅ Activa | Gratis | No |

---

## 1. GOOGLE PLACES API

### Configuración
```env
GOOGLE_PLACES_API_KEY=AIzaSyCcagtn1scZsDw5FzjBenKRazHEI5VQF4g
```

### Endpoints Disponibles
```bash
# Búsqueda general
/api/google-places?tipo=buscar&lat=25.72&lng=-100.19&keyword=KFC

# Competidores de pollo
/api/google-places?tipo=competidores&lat=25.72&lng=-100.19&radio=3000

# Detalles con reviews
/api/google-places?tipo=detalles&placeId=ChIJsb0gYDbqYoYRcnXndQCdROc

# Análisis completo de zona
/api/google-places?tipo=analisis&lat=25.72&lng=-100.19
```

### Datos Obtenidos
- Rating (1-5 estrellas)
- Total de reviews
- Nivel de precio (1-4)
- Horarios de operación
- Estado del negocio
- Reviews textuales

### Límites
- Free tier: 10,000 llamadas/mes
- Cache implementado: 1h búsquedas, 24h detalles

### Documentación
- Console: https://console.cloud.google.com/apis/credentials
- Docs: https://developers.google.com/maps/documentation/places/web-service

---

## 2. INEGI DENUE API

### Configuración
```env
INEGI_API_KEY=ceb834b8-d2bf-4772-ba8c-079077ded835
```

### Endpoint
```bash
/api/competidores?lat=25.72&lng=-100.19&radio=3000
```

### Datos Obtenidos
- Unidades económicas por zona
- Clasificación SCIAN (código de actividad)
- Nombre comercial
- Dirección
- Estrato de empleados

### Documentación
- API: https://www.inegi.org.mx/servicios/api_denue.html
- Token: https://www.inegi.org.mx/app/api/denue/v1/tokenVerify.aspx

---

## 3. INEGI INDICADORES API

### Configuración
```env
INEGI_API_KEY=ceb834b8-d2bf-4772-ba8c-079077ded835
```

### Endpoints
```bash
# Indicadores de Nuevo León
/api/datos-gobierno?tipo=indicadores

# Indicador específico
/api/datos-gobierno?tipo=indicador&indicadorId=1002000001&areaGeo=19
```

### Indicadores Clave
| ID | Nombre | Valor NL |
|----|--------|----------|
| 1002000001 | Población Total | 5,784,442 |
| 6200093954 | Población Ocupada | 2,926,943 |
| 6207019014 | PIB Trimestral | - |
| 628194 | Inflación Mensual | - |

### Documentación
- API: https://www.inegi.org.mx/servicios/api_indicadores.html

---

## 4. INEGI AGEB (Datos por Manzana)

### Acceso
No hay API directa. Se descarga de SCITEL.

### Cómo Obtener Datos
1. Ir a https://www.inegi.org.mx/app/scitel/Default?ev=10
2. Seleccionar "Nuevo León"
3. Descargar CSV o XLSX
4. Importar datos relevantes al sistema

### Datos Precargados
```typescript
// Zonas con datos AGEB en el sistema:
- Cumbres (Alaia): AGEB 1903900011318
- Universidad: AGEB 1904600012541
- Guadalupe: AGEB 1902600010892
```

### Estructura de Clave AGEB
```
EEMMMLLLLAGEB
│││││││││└── AGEB (4 caracteres)
│││││└────── Localidad (4 dígitos)
│││└──────── Municipio (3 dígitos)
└─────────── Estado (2 dígitos, 19=NL)
```

---

## 5. CENAPRED (Riesgos Naturales)

### Acceso
Sin token requerido. Datos via datos.gob.mx

### Endpoints
```bash
# Todos los municipios
/api/datos-gobierno?tipo=riesgo

# Municipio específico
/api/datos-gobierno?tipo=riesgo&municipioId=19026
```

### Datos Disponibles
| Municipio | Inundación | Sísmico | Deslizamiento | Nivel |
|-----------|------------|---------|---------------|-------|
| Monterrey | 45 | 15 | 30 | Medio |
| Guadalupe | 55 | 12 | 20 | Medio |
| San Nicolás | 40 | 10 | 15 | Bajo |
| Apodaca | 50 | 10 | 10 | Medio |
| San Pedro | 35 | 15 | 40 | Medio |

### Fuentes
- Portal: https://datos.gob.mx/busca/dataset?organization=cenapred
- Atlas: http://www.atlasnacionalderiesgos.gob.mx/

---

## 6. SEPOMEX API

### Acceso
Sin token requerido.

### Uso en el Sistema
```typescript
// En src/lib/apis-gratuitas.ts
buscarPorCodigoPostal(codigoPostal: string)
```

### Datos Obtenidos
- Colonias por código postal
- Municipio
- Estado
- Tipo de asentamiento

---

## 7. SNSP (Seguridad Pública)

### Acceso
Sin token requerido. Datos abiertos.

### Uso en el Sistema
```typescript
// En src/lib/apis-gratuitas.ts
obtenerIndiceSeguridadNL()
```

### Datos Obtenidos
- Incidencia delictiva por estado
- Tendencias de seguridad
- Índices calculados

### Fuente
- https://www.gob.mx/sesnsp/acciones-y-programas/datos-abiertos-de-incidencia-delictiva

---

## ENDPOINT CONSOLIDADO

### Análisis Completo de Zona
```bash
/api/datos-gobierno?tipo=analisis&lat=25.7225&lng=-100.1998&municipioId=19026
```

### Respuesta Incluye
- Datos demográficos (AGEB)
- Indicadores económicos (INEGI)
- Riesgo natural (CENAPRED)
- Confianza general del análisis

---

## ARCHIVOS CLAVE DEL PROYECTO

```
src/
├── lib/
│   ├── google-places.ts      # Google Places API
│   ├── apis-gratuitas.ts     # SEPOMEX, SNSP, básicos
│   ├── apis-gobierno.ts      # INEGI, CENAPRED, Data México
│   └── inegi-denue.ts        # INEGI DENUE
├── app/api/
│   ├── google-places/route.ts
│   ├── datos-gobierno/route.ts
│   ├── datos-zona/route.ts
│   └── competidores/route.ts
```

---

## VARIABLES DE ENTORNO (.env.local)

```env
# INEGI (DENUE + Indicadores)
INEGI_API_KEY=ceb834b8-d2bf-4772-ba8c-079077ded835

# Google Places
GOOGLE_PLACES_API_KEY=AIzaSyCcagtn1scZsDw5FzjBenKRazHEI5VQF4g

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## PRÓXIMAS INTEGRACIONES RECOMENDADAS

### Gratuitas
| API | Propósito | Prioridad |
|-----|-----------|-----------|
| Data México (completo) | PIB municipal | Media |
| OpenStreetMap | Datos de plazas | Alta |
| Mapbox (free tier) | Isocronas | Media |

### De Pago
| API | Propósito | Costo Est. |
|-----|-----------|------------|
| Placer.ai | Flujo peatonal real | $$$$ |
| HERE Traffic | Tráfico vehicular | ~$50/mes |
| BestTime | Popular times | ~$30/mes |

---

*Documento generado: Enero 2025*
*Proyecto: Viabilidad Crispy Tenders*
