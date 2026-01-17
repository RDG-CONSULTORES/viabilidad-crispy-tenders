# Arquitectura del Dashboard - Viabilidad Crispy Tenders

## 1. Stack Tecnológico

### Frontend (NO Streamlit)
- **Framework:** Next.js 14 (React)
- **Mapas:** Leaflet + React-Leaflet (gratuito, OpenStreetMap)
- **Gráficas:** Recharts o Chart.js
- **UI Components:** Tailwind CSS + shadcn/ui
- **Estado:** Zustand (ligero)

### Backend
- **API:** Next.js API Routes (serverless)
- **ORM:** Prisma
- **Validación:** Zod

### Base de Datos
- **PostgreSQL** en Railway (gratis tier disponible)

### Hosting
- **Railway** - Frontend + Backend + DB todo junto

---

## 2. Estructura del Proyecto

```
viabilidad_crispy_tenders/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Dashboard principal
│   │   ├── layout.tsx         # Layout con sidebar
│   │   ├── api/               # API Routes
│   │   │   ├── sucursales/
│   │   │   ├── competencia/
│   │   │   ├── scoring/
│   │   │   └── plazas/
│   │   ├── sucursales/        # Página de sucursales
│   │   ├── analisis/          # Página de análisis
│   │   └── configuracion/     # Config de variables
│   │
│   ├── components/
│   │   ├── maps/
│   │   │   ├── MapContainer.tsx
│   │   │   ├── SucursalMarker.tsx
│   │   │   ├── CompetenciaMarker.tsx
│   │   │   └── PlazaPolygon.tsx
│   │   ├── charts/
│   │   │   ├── ScoreGauge.tsx
│   │   │   ├── TrafficChart.tsx
│   │   │   └── CompetenciaBar.tsx
│   │   ├── cards/
│   │   │   ├── SucursalCard.tsx
│   │   │   ├── PlazaCard.tsx
│   │   │   └── MetricCard.tsx
│   │   └── ui/                # shadcn components
│   │
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── scoring.ts         # Algoritmo de scoring
│   │   └── utils.ts
│   │
│   ├── services/
│   │   ├── inegi-api.ts       # API DENUE INEGI
│   │   ├── google-places.ts   # Google Places API
│   │   └── besttime-api.ts    # BestTime (futuro)
│   │
│   ├── data/
│   │   ├── sucursales.ts      # Data de sucursales CT
│   │   ├── competencia.ts     # KFC, Wingstop, etc.
│   │   └── plazas.ts          # Plazas comerciales
│   │
│   └── types/
│       └── index.ts           # TypeScript types
│
├── prisma/
│   └── schema.prisma          # Schema de BD
│
├── public/
│   └── markers/               # Iconos de markers
│
├── .env.local                 # Variables de entorno
├── package.json
├── tailwind.config.js
└── railway.json               # Config Railway
```

---

## 3. Modelo de Datos

### Sucursal Crispy Tenders
```typescript
interface Sucursal {
  id: string;
  nombre: string;
  plaza: string;
  direccion: string;
  lat: number;
  lng: number;
  municipio: string;
  status: 'operando' | 'proximamente' | 'propuesta';

  // Métricas
  ticketPromedio: number;
  ventasDiarias?: number;
  clientesDiarios?: number;

  // Horarios
  horarioApertura: string;
  horarioCierre: string;
  diasOperacion: string[];

  // Metadata
  fechaApertura?: Date;
  inversionInicial?: number;
}
```

### Plaza Comercial
```typescript
interface Plaza {
  id: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  municipio: string;

  // Características
  tiendasAncla: string[];
  superficieM2?: number;
  nivelSocioeconomico: 'A' | 'B' | 'C+' | 'C' | 'D';

  // Flujo estimado
  flujoPeatonal: {
    lunes: number;
    martes: number;
    miercoles: number;
    jueves: number;
    viernes: number;
    sabado: number;
    domingo: number;
  };

  // Horarios de mayor afluencia
  horasPico: string[];

  // Scoring
  scoreViabilidad?: number;
  scoreCompetencia?: number;
  scoreFlujo?: number;
  scoreTotal?: number;
}
```

### Competidor
```typescript
interface Competidor {
  id: string;
  nombre: string;
  marca: 'KFC' | 'Wingstop' | 'El Pollo Loco' | 'Pollos Asados' | 'Otro';
  direccion: string;
  lat: number;
  lng: number;

  // Distancia a plaza analizada
  distanciaKm?: number;

  // Nivel de amenaza
  nivelCompetencia: 'alto' | 'medio' | 'bajo';

  // Horarios
  horario?: string;
}
```

---

## 4. Algoritmo de Scoring

### Factores y Pesos (Configurables en UI)

```typescript
const SCORING_CONFIG = {
  flujoPeatonal: {
    peso: 0.25,
    descripcion: 'Personas caminando/hora en plaza',
    umbrales: {
      excelente: 1000,  // 100 pts
      bueno: 500,       // 75 pts
      regular: 200,     // 50 pts
      bajo: 100         // 25 pts
    }
  },

  tiendasAncla: {
    peso: 0.20,
    descripcion: 'Calidad de tiendas ancla',
    puntosPorTienda: {
      'Liverpool': 25,
      'Soriana': 20,
      'HEB': 20,
      'Sears': 15,
      'Coppel': 15,
      'Cinépolis': 15,
      'Sanborns': 10,
      'Otro': 5
    }
  },

  competenciaDirecta: {
    peso: 0.15,
    descripcion: 'Fast food de pollo en 1km',
    puntuacion: (count: number) => {
      if (count === 0) return 100;
      if (count === 1) return 80;
      if (count <= 3) return 60;
      if (count <= 5) return 40;
      return 20;
    }
  },

  perfilDemografico: {
    peso: 0.15,
    descripcion: 'Poder adquisitivo zona',
    porNivel: {
      'A': 100,
      'B': 85,
      'C+': 70,
      'C': 50,
      'D': 30
    }
  },

  accesibilidad: {
    peso: 0.10,
    descripcion: 'Transporte y estacionamiento',
    factores: {
      metrorrey: 20,
      rutasBus: 15,
      estacionamientoGratis: 25,
      estacionamientoPago: 15,
      viaPrincipal: 25
    }
  },

  costoRenta: {
    peso: 0.10,
    descripcion: 'Costo por m² mensual',
    umbrales: {
      bajo: 300,     // 100 pts (< $300/m²)
      medio: 500,    // 75 pts
      alto: 800,     // 50 pts
      muyAlto: 1200  // 25 pts
    }
  },

  visibilidad: {
    peso: 0.05,
    descripcion: 'Ubicación dentro de plaza',
    opciones: {
      'entrada_principal': 100,
      'food_court': 90,
      'pasillo_principal': 75,
      'segundo_piso': 50,
      'zona_alejada': 25
    }
  }
};
```

### Fórmula Final
```typescript
function calcularScoreTotal(plaza: Plaza, config: ScoringConfig): number {
  let scoreTotal = 0;

  for (const [factor, settings] of Object.entries(config)) {
    const scoreFactor = calcularScoreFactor(plaza, factor, settings);
    scoreTotal += scoreFactor * settings.peso;
  }

  return Math.round(scoreTotal * 100) / 100;
}
```

---

## 5. APIs a Integrar

### APIs Gratuitas (Implementar primero)

| API | Uso | Límite Gratis |
|-----|-----|---------------|
| **INEGI DENUE** | Competidores por SCIAN | Sin límite |
| **OpenStreetMap** | Mapas base | Sin límite |
| **Nominatim** | Geocoding | 1 req/seg |
| **INEGI Indicadores** | Datos demográficos | Sin límite |

### APIs con Costo (Recomendadas para futuro)

| API | Uso | Costo Estimado |
|-----|-----|----------------|
| **[BestTime.app](https://besttime.app/)** | Flujo peatonal en tiempo real | ~$49/mes |
| **[Placer.ai](https://www.placer.ai/)** | Analytics retail profesional | Enterprise |
| **[Google Places API](https://developers.google.com/maps/documentation/places/web-service)** | Lugares, reviews, horarios | $17/1000 requests |
| **[Google Maps Platform](https://mapsplatform.google.com/)** | Street View, rutas | $7/1000 cargas |
| **[SafeGraph](https://www.safegraph.com/)** | Foot traffic histórico | Enterprise |

### API Keys Necesarias
```env
# .env.local
INEGI_API_KEY=ceb834b8-d2bf-4772-ba8c-079077ded835
DATABASE_URL=postgresql://...@railway/crispy_tenders
GOOGLE_PLACES_API_KEY=opcional_si_tienes
BESTTIME_API_KEY=opcional_futuro
```

---

## 6. Diseño UI/UX

### Layout Principal
```
┌─────────────────────────────────────────────────────────────┐
│  🍗 Crispy Tenders - Dashboard de Viabilidad               │
│  [Sucursales] [Análisis] [Competencia] [Configuración]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────┐  ┌──────────────────┐ │
│  │                                 │  │  MÉTRICAS CLAVE  │ │
│  │                                 │  │  ───────────────  │ │
│  │         MAPA INTERACTIVO        │  │  Score: 85/100   │ │
│  │                                 │  │  Competencia: 3  │ │
│  │    [Sucursales CT marcadas]     │  │  Flujo: 850/hr   │ │
│  │    [Competencia marcada]        │  │  Renta: $450/m²  │ │
│  │    [Plazas propuestas]          │  │                  │ │
│  │                                 │  ├──────────────────┤ │
│  │                                 │  │  SCORE GAUGE     │ │
│  │                                 │  │      [85]        │ │
│  │                                 │  │   🟢 VIABLE      │ │
│  └─────────────────────────────────┘  └──────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  📊 ANÁLISIS POR PLAZA                                  ││
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           ││
│  │  │Plaza   │ │Plaza   │ │Esfera  │ │Plaza   │           ││
│  │  │1500    │ │Real    │ │Park    │ │Fiesta  │           ││
│  │  │Score:85│ │Score:72│ │Score:78│ │Score:91│           ││
│  │  └────────┘ └────────┘ └────────┘ └────────┘           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  📈 FLUJO POR DÍA Y HORA                                ││
│  │  [Gráfica de barras: Lun-Dom con horas pico]            ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Vista de Plaza Individual
```
┌─────────────────────────────────────────────────────────────┐
│  🏢 Plaza 1500 - Guadalupe                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐  ┌────────────────────────────────┐│
│  │  MAPA ZOOM PLAZA    │  │  INFORMACIÓN                   ││
│  │  [Street View?]     │  │  ────────────────────          ││
│  │                     │  │  📍 Blvd. Acapulco 800        ││
│  │  🔴 KFC (0.3km)     │  │  📞 81 8363 8888              ││
│  │  🟠 Wingstop (0.8km)│  │                                ││
│  │  🟡 Pollo Loco (1km)│  │  🏪 Tiendas Ancla:            ││
│  │                     │  │     - (por investigar)         ││
│  │  ⭐ PROPUESTA CT    │  │                                ││
│  └─────────────────────┘  │  👥 Flujo: ~600/hora          ││
│                           │  💰 Renta: ~$400/m²           ││
│  ┌─────────────────────┐  └────────────────────────────────┘│
│  │  SCORE DETALLADO    │                                    │
│  │  ─────────────────  │  ┌────────────────────────────────┐│
│  │  Flujo:      ████░ 80│  │  COMPETENCIA EN 1KM           ││
│  │  Anclas:     ███░░ 60│  │  ────────────────────          ││
│  │  Competencia:████░ 85│  │  🔴 KFC Blvd Acapulco  0.3km  ││
│  │  Demografía: ████░ 75│  │  🟠 Wingstop          0.8km  ││
│  │  Acceso:     █████ 90│  │  🟡 Pollo Loco        1.2km  ││
│  │  Renta:      ████░ 80│  │                                ││
│  │  Visibilidad:███░░ 65│  │  Total: 3 competidores        ││
│  │  ─────────────────  │  │  Nivel: MEDIO                  ││
│  │  TOTAL:      ████░ 78│  └────────────────────────────────┘│
│  └─────────────────────┘                                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  📊 FLUJO ESTIMADO POR DÍA                              ││
│  │  Lun  Mar  Mié  Jue  Vie  Sáb  Dom                      ││
│  │  ▄▄   ▄▄   ▄▄   ▅▅   ▆▆   ██   ▇▇                       ││
│  │  500  520  530  620  780  950  850                      ││
│  │                                                          ││
│  │  Horas Pico: 12-14h, 18-21h                             ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  [💾 Guardar Análisis]  [📄 Exportar PDF]  [📊 Comparar]   │
└─────────────────────────────────────────────────────────────┘
```

### Página de Configuración
```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ Configuración de Variables de Scoring                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PESOS DE FACTORES (deben sumar 100%)                      │
│  ─────────────────────────────────                         │
│                                                             │
│  Flujo Peatonal      [====25%====]  ← →                    │
│  Tiendas Ancla       [===20%===]    ← →                    │
│  Competencia         [==15%==]      ← →                    │
│  Perfil Demográfico  [==15%==]      ← →                    │
│  Accesibilidad       [=10%=]        ← →                    │
│  Costo Renta         [=10%=]        ← →                    │
│  Visibilidad         [5%]           ← →                    │
│                                                             │
│  UMBRALES DE CLASIFICACIÓN                                 │
│  ─────────────────────────                                 │
│                                                             │
│  🟢 VIABLE (Excelente)    Score ≥ [80]                     │
│  🟡 EVALUAR (Moderado)    Score ≥ [60]                     │
│  🔴 NO VIABLE (Riesgo)    Score < [60]                     │
│                                                             │
│  PARÁMETROS DE NEGOCIO                                     │
│  ─────────────────────                                     │
│                                                             │
│  Ticket Promedio:     $[200] MXN                           │
│  Inversión Base:      $[800,000] MXN                       │
│  Margen Operativo:    [35]%                                │
│  Meta Clientes/día:   [80]                                 │
│                                                             │
│  [Restaurar Defaults]  [Guardar Cambios]                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Deployment en Railway

### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Servicios en Railway
1. **Web Service** - Next.js app
2. **PostgreSQL** - Base de datos
3. **Redis** (opcional) - Cache para APIs

---

## 8. Roadmap de Desarrollo

### Fase 1: MVP (Esta semana)
- [x] Estructura del proyecto
- [ ] Data estática de sucursales y competencia
- [ ] Mapa básico con markers
- [ ] Scoring básico hardcodeado
- [ ] Deploy inicial en Railway

### Fase 2: APIs Gratis
- [ ] Integrar INEGI DENUE
- [ ] Geocoding con Nominatim
- [ ] Datos demográficos INEGI

### Fase 3: Interactividad
- [ ] Configuración de pesos en UI
- [ ] Guardar análisis en BD
- [ ] Exportar reportes

### Fase 4: APIs Premium (Opcional)
- [ ] BestTime para flujo real
- [ ] Google Places para reviews
- [ ] Street View integrado
