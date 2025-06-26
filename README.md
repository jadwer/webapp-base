# webapp-base

Plantilla base para aplicaciones Next.js con enfoque modular. Incluye estructura para crear modulos aislados y un design system reutilizable.

## Comenzar

```bash
npm install
npm run dev
```

## Estructura

- `src/modules` – Contiene modulos independientes como `inventory` o `sales`.
- `src/ui` – Componentes base del design system.
- `src/app` – Rutas y layout principal.

Cada módulo exporta sus hooks, componentes y servicios desde `index.ts` para facilitar su consumo.

## Dependencias destacadas

- Next.js
- React
- Tailwind CSS
- axios / swr
- zod y react-hook-form
- lucide-react y framer-motion
- date-fns
- zustand y grapesjs

Esta plantilla es compatible con despliegues en Vercel, Netlify o entornos SSR.
