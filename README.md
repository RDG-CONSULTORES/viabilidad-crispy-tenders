# 🍗 Viabilidad Crispy Tenders

Dashboard de análisis de viabilidad para la franquicia Crispy Tenders en el Área Metropolitana de Monterrey.

## 📋 Características

- **🗺️ Mapa Interactivo** - Visualiza sucursales, competencia y plazas propuestas
- **📊 Scoring de Viabilidad** - Algoritmo de 7 factores con pesos configurables
- **💰 Proyecciones Financieras** - ROI, payback y ventas estimadas
- **🎯 Análisis de Competencia** - KFC, Wingstop, El Pollo Loco mapeados
- **⚙️ Variables Configurables** - Ajusta pesos y umbrales desde la UI

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- npm o yarn

### Instalación

```bash
cd viabilidad_crispy_tenders
npm install
```

### Desarrollo Local

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

### Build de Producción

```bash
npm run build
npm run start
```

## 🏗️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 14 |
| UI | React + Tailwind CSS |
| Mapas | Leaflet + React-Leaflet |
| Gráficas | Recharts |
| Estado | Zustand |
| BD (opcional) | PostgreSQL + Prisma |

## 📁 Estructura del Proyecto

```
viabilidad_crispy_tenders/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── page.tsx       # Dashboard principal
│   │   ├── layout.tsx     # Layout con header/footer
│   │   └── globals.css    # Estilos globales
│   ├── components/
│   │   └── maps/          # Componentes de mapa
│   ├── data/              # Datos estáticos
│   │   ├── sucursales.ts  # Sucursales Crispy Tenders
│   │   ├── competencia.ts # KFC, Wingstop, etc.
│   │   └── plazas.ts      # Plazas comerciales
│   ├── lib/
│   │   └── scoring.ts     # Algoritmo de viabilidad
│   └── types/             # TypeScript types
├── docs/
│   └── ARQUITECTURA.md    # Documentación técnica
└── package.json
```

## 📊 Metodología de Scoring

### Factores y Pesos (por defecto)

| Factor | Peso | Descripción |
|--------|------|-------------|
| Flujo Peatonal | 25% | Personas/hora en plaza |
| Tiendas Ancla | 20% | Calidad de anclas |
| Competencia | 15% | Competidores en 1km |
| Demografía | 15% | Nivel socioeconómico |
| Accesibilidad | 10% | Transporte y estacionamiento |
| Costo Renta | 10% | $/m² estimado |
| Visibilidad | 5% | Ubicación en plaza |

### Clasificación

- **🟢 VIABLE** (Score ≥ 75): Proceder con apertura
- **🟡 EVALUAR** (Score 55-74): Revisar factores críticos
- **🔴 NO VIABLE** (Score < 55): No recomendado

## 🚂 Deploy en Railway

### 1. Crear cuenta en Railway
- Ir a [railway.app](https://railway.app)
- Conectar con GitHub

### 2. Nuevo proyecto
```bash
# Desde el dashboard de Railway:
# New Project > Deploy from GitHub repo
```

### 3. Variables de entorno
```
INEGI_API_KEY=ceb834b8-d2bf-4772-ba8c-079077ded835
```

### 4. Deploy automático
Railway detectará Next.js y configurará el build automáticamente.

## 🔌 APIs Utilizadas

### Gratuitas (Implementadas)
- **OpenStreetMap** - Mapas base
- **INEGI DENUE** - Establecimientos (API key incluida)

### Con Costo (Recomendadas para futuro)
- **[BestTime.app](https://besttime.app/)** - Flujo peatonal en tiempo real (~$49/mes)
- **[Google Places API](https://developers.google.com/maps/documentation/places)** - Reviews y horarios
- **[Placer.ai](https://www.placer.ai/)** - Analytics retail (Enterprise)

## 📍 Datos Incluidos

### Sucursales Crispy Tenders (9)
- 7 operando
- 1 próximamente (Paseo La Fe)
- 1 propuesta (Plaza 1500)

### Competencia Mapeada (~25)
- KFC: 10 sucursales
- Wingstop: 6 sucursales
- El Pollo Loco: 6 sucursales

### Plazas Comerciales (8)
- Con sucursal CT: 4
- Propuestas: 2
- Potenciales: 2

## 🔧 Configuración Avanzada

### Modificar pesos de scoring

Editar `src/lib/scoring.ts`:

```typescript
export const CONFIG_DEFAULT: ScoringConfig = {
  pesos: {
    flujoPeatonal: 0.25,    // Cambiar aquí
    tiendasAncla: 0.20,
    // ...
  },
  // ...
};
```

### Agregar nuevas sucursales

Editar `src/data/sucursales.ts`:

```typescript
{
  id: 'ct-010',
  nombre: 'Nueva Sucursal',
  plaza: 'Nombre Plaza',
  lat: 25.1234,
  lng: -100.5678,
  // ...
}
```

## 📞 Soporte

- Dashboard desarrollado para análisis de expansión de Crispy Tenders
- Datos estimados - validar con investigación de campo

---

**🍗 Crispy Tenders - Los tenders más virales de Monterrey**
