# Proyecto Base Frontend – `webapp-base`  
Plantilla generica para apps tenant del codebase

Este proyecto es una base moderna, ultra modular y escalable con Next.js App Router. Permite desarrollar rápidamente interfaces desacopladas, exportar/importar módulos entre proyectos, y trabajar con diseñadores y clientes de forma fluida.

---

## 1. Estructura del Proyecto

```bash
webapp-base/
├── src/
│   ├── modules/                    # Módulos aislados y portables
│   │   ├── auth/                   # Sistema de autenticación completo
│   │   ├── roles/                  # Gestión de roles y permisos
│   │   ├── users/                  # Gestión de usuarios
│   │   ├── products/               # Sistema completo de productos
│   │   │   ├── components/         # Componentes internos (.html.tsx para diseñador)
│   │   │   ├── hooks/              # Hooks específicos (useProducts, useUnits, etc.)
│   │   │   ├── types/              # Tipado local (Product, Unit, Category, Brand)
│   │   │   ├── services/           # API Layer con JSON:API
│   │   │   ├── templates/          # Plantillas visuales (*.html.tsx)
│   │   │   ├── utils/              # Transformadores y utilidades
│   │   │   └── index.ts            # Autoloader
│   │   ├── page-builder-pro/       # Constructor visual de páginas
│   │   └── inventory/              # Ejemplo de módulo
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

## 5. Módulo Products - Sistema Completo de Gestión

El módulo `products` es un sistema completo de gestión de productos con 4 entidades relacionadas.

### 5.1 Arquitectura del Módulo

```bash
src/modules/products/
├── components/
│   ├── ProductsTable.tsx           # Tabla principal de productos
│   ├── UnitsTable.tsx              # Tabla de unidades de medida
│   ├── CategoriesTable.tsx         # Tabla de categorías
│   ├── BrandsTable.tsx             # Tabla de marcas
│   ├── ProductFilters.tsx          # Filtros de búsqueda
│   └── ProductForm.tsx             # Formulario de productos
├── hooks/
│   ├── useProducts.ts              # Hook para productos
│   ├── useUnits.ts                 # Hook para unidades
│   ├── useCategories.ts            # Hook para categorías
│   ├── useBrands.ts                # Hook para marcas
│   └── useProductMutations.ts      # Mutaciones CRUD
├── services/
│   ├── productService.ts           # API de productos
│   ├── unitService.ts              # API de unidades
│   ├── categoryService.ts          # API de categorías
│   └── brandService.ts             # API de marcas
├── types/
│   ├── product.ts                  # Tipos de productos
│   ├── unit.ts                     # Tipos de unidades
│   ├── category.ts                 # Tipos de categorías
│   ├── brand.ts                    # Tipos de marcas
│   └── api.ts                      # Tipos de API
├── utils/
│   ├── transformers.ts             # Transformadores JSON:API
│   ├── api.ts                      # Utilidades de API
│   ├── validation.ts               # Validaciones
│   └── formatting.ts               # Formateo de datos
├── templates/
│   ├── ProductsAdminTemplate.html.tsx    # Plantilla principal
│   └── ProductFormTemplate.html.tsx      # Plantilla de formulario
└── index.ts                        # Exports del módulo
```

### 5.2 Entidades del Sistema

| Entidad | Descripción | Campos Principales |
|---------|-------------|-------------------|
| **Product** | Producto principal | name, sku, description, price, cost, iva |
| **Unit** | Unidad de medida | name, code, unitType |
| **Category** | Categoría de producto | name, description, slug |
| **Brand** | Marca del producto | name, description, slug |

### 5.3 Características Técnicas

**JSON:API Integration:**
- Cumple con especificación JSON:API 1.0
- Transformadores automáticos camelCase ↔ snake_case
- Soporte para relaciones incluidas (`include=unit,category,brand`)
- Manejo de errores estándar JSON:API

**SWR Data Fetching:**
- Cache automático y revalidación
- Optimistic updates
- Error boundary integration
- Suspense support

**API Endpoints:**
- `GET /api/v1/products` - Lista de productos
- `GET /api/v1/units` - Lista de unidades
- `GET /api/v1/categories` - Lista de categorías  
- `GET /api/v1/brands` - Lista de marcas
- Soporte para `sort`, `filter`, `include`

### 5.4 Debugging y Troubleshooting

**Console Logging:**
- 🔍 API request URLs
- 🔄 JSON:API transformation steps
- Raw API responses para inspección

**Limitaciones Conocidas:**
- No soporta paginación `page[number]` y `page[size]`
- Algunos campos de sort pueden no estar disponibles

---

## 6. Integración con Backend

- El backend Laravel expone `/api/modules`
- El frontend consulta esta lista y muestra/oculta vistas o rutas según los módulos activos
- Se puede integrar un hook global `useAvailableModules()` para esto

---

## 7. Instrucciones para diseñadores y desarrolladores

- Los archivos `*.html.tsx` son los únicos que deben ser editados por diseñadores
- No modificar hooks ni lógica sin coordinación
- Crear siempre un `index.ts` por módulo
- No compartir interfaces o lógica entre módulos, deben ser independientes

---

## 8. Cómo iniciar nuevos proyectos a partir de esta base

```bash
git clone https://github.com/labor-wasser-mexico/base-webapp.git my-new-project
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

Este proyecto base está alineado con `api-base`, el backend Laravel del codebase.  
Permite importar módulos entre proyectos, mantener consistencia en estructura y escalar sin acoplamientos.

