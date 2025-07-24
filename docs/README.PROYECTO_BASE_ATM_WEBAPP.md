# Proyecto Base Frontend – `webapp-base`  
Plantilla oficial de Atomo Soluciones

Este proyecto es una base moderna, ultra modular y escalable con Next.js App Router. Permite desarrollar rápidamente interfaces desacopladas, exportar/importar módulos entre proyectos, y trabajar con diseñadores y clientes de forma fluida.

---

## 1. Estructura del Proyecto

```bash
webapp-base/
├── src/
│   ├── modules/                    # Módulos aislados y portables
│   │   ├── inventory/
│   │   │   ├── components/         # Componentes internos (.html.tsx para diseñador)
│   │   │   ├── hooks/              # Hooks específicos
│   │   │   ├── types/              # Tipado local
│   │   │   ├── pages/              # Rutas internas
│   │   │   ├── services/           # API Layer
│   │   │   ├── templates/          # Plantillas visuales (*.html.tsx)
│   │   │   └── index.ts            # Autoloader
│   │   ├── sales/
│   │   └── page-builder/
│   ├── app/
│   │   ├── (back)/dashboard/        # Panel privado
│   │   ├── (front)/p/[slug]/       # Render de PageBuilder
│   ├── lib/                        # Funciones reutilizables
│   ├── ui/                         # Design System atm-ui
│   ├── config/                     # Config global (tema, idioma)
│   └── types.d.ts
```

---

## 2. Dependencias Necesarias

| Paquete             | Propósito                                      |
|---------------------|-------------------------------------------------|
| `next`              | Framework base                                 |
| `react` / `react-dom`| Librerías esenciales                          |
| `tailwindcss`       | Estilos utilitarios                            |
| `clsx`              | Composición condicional de clases              |
| `shadcn/ui`         | Componentes desacoplados (UI base)             |
| `axios`             | Cliente HTTP                                   |
| `swr`               | Data fetching con cache                        |
| `zod`               | Validación de esquemas                         |
| `react-hook-form`   | Formularios modernos                           |
| `lucide-react`      | Iconografía profesional                        |
| `framer-motion`     | Animaciones suaves                             |
| `date-fns`          | Fechas modernas                                |
| `zustand` (opcional)| Estado global simple                           |
| `grapesjs`          | Editor visual (módulo page-builder)            |

---

## 3. Design System Propuesto (atm-ui)

### Formularios
- `Input.tsx`
- `Select.tsx`
- `Textarea.tsx`
- `Checkbox.tsx`
- `Form.tsx`, `FormField.tsx`, `Label.tsx`, `Error.tsx`

### UI General
- `Button.tsx`
- `Card.tsx`
- `Modal.tsx`
- `Drawer.tsx`
- `Alert.tsx`
- `Toast.tsx`

### Utilitarios
- `Skeleton.tsx`
- `LoadingSpinner.tsx`
- `Paginator.tsx`

---

## 4. Modularidad del Frontend

Cada módulo expone todo lo necesario desde `index.ts`:

```ts
export * from './types/Product';
export * from './hooks/useInventory';
export * from './services/inventoryApi';
export * from './components';
```

Esto permite importar de forma simple:

```ts
import { useInventory } from '@/modules/inventory';
```

---

## 5. Integración con Backend

- El backend Laravel expone `/api/modules`
- El frontend consulta esta lista y muestra/oculta vistas o rutas según los módulos activos
- Se puede integrar un hook global `useAvailableModules()` para esto

---

## 6. Instrucciones para diseñadores y desarrolladores

- Los archivos `*.html.tsx` son los únicos que deben ser editados por diseñadores
- No modificar hooks ni lógica sin coordinación
- Crear siempre un `index.ts` por módulo
- No compartir interfaces o lógica entre módulos, deben ser independientes

---

## 7. Cómo iniciar nuevos proyectos a partir de esta base

```bash
git clone https://github.com/atomo-soluciones/base-webapp.git my-new-project
cd my-new-project
npm install
cp .env.local.example .env.local
npm dev
```

1. Elimina módulos innecesarios
2. Crea tu propio módulo dentro de `/modules/`
3. Usa el Design System en `/ui/` o extiéndelo

---

## Publicación

- Compatible con Vercel, Netlify, CPanel (build export), o SSR standalone
- Puedes exportar páginas estáticas con `next export` si es necesario

---

## Notas finales

Este proyecto base está alineado con `api-base`, el backend oficial de Atomo Soluciones.  
Permite importar módulos entre proyectos, mantener consistencia en estructura y escalar sin acoplamientos.

