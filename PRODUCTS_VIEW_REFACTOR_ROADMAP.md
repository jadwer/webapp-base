# 🚀 ROADMAP: Refactorización ProductsView Reutilizable

## 📝 Contexto
Refactorizar el módulo de productos para crear componentes reutilizables que puedan funcionar tanto en el admin como en el frontend público.

## 🎯 Objetivo
Separar la lógica de visualización de productos para permitir diferentes vistas (tabla, grid, cards) y reutilización entre admin y frontend.

---

## 📋 FASE 1: Análisis y Preparación

### ✅ Completado en esta sesión:
- ✅ Análisis de arquitectura actual
- ✅ Identificación de problemas de reutilización
- ✅ Definición de arquitectura objetivo
- ✅ Corrección de todos los filtros del módulo productos:
  - ✅ Búsqueda parcial por nombre (search_name)
  - ✅ Búsqueda parcial por SKU (search_sku) 
  - ✅ Filtros por unit_id, category_id, brand_id
  - ✅ Filtros múltiples (brands, categories, units)
  - ✅ Fix problema de foco perdido en campos de búsqueda
  - ✅ Actualización de estructura PaginationMeta (meta.page.total)

---

## 📋 FASE 2: Creación de Componentes Base Reutilizables

### ✅ 2.1 - Crear PaginationControls ✅ **COMPLETADO**
**Ubicación:** `src/modules/products/components/PaginationControls.tsx`
**Implementado con props:**
```tsx
interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  perPage: number
  totalItems: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  className?: string
  showInfo?: boolean
}
```

### ✅ 2.2 - Crear ProductsStats ✅ **COMPLETADO**
**Ubicación:** `src/modules/products/components/ProductsStats.tsx`
**Implementado con props:**
```tsx
interface ProductsStatsProps {
  products: Product[]
  totalProducts: number
  currentPage?: number
  perPage?: number
  displayedItems?: number
  customStats?: React.ReactNode
  className?: string
  showDetailedStats?: boolean
}
```

### ✅ 2.3 - Crear ProductsView (Componente Principal) ✅ **COMPLETADO**
**Ubicación:** `src/modules/products/components/ProductsView.tsx`
**Implementado con props:**
```tsx
interface ProductsViewProps {
  products: Product[]
  meta: PaginationMeta | undefined
  isLoading: boolean
  viewMode?: 'table' | 'grid' | 'list'
  showStats?: boolean
  showPagination?: boolean
  currentPage?: number
  onPageChange?: (page: number) => void
  emptyState?: React.ReactNode
  loadingState?: React.ReactNode
  className?: string
  onEdit?: (product: { id: string }) => void
  onDelete?: (productId: string) => Promise<void>
  onDuplicate?: (productId: string) => Promise<void>
  onView?: (product: { id: string }) => void
  showDetailedStats?: boolean
  customStats?: React.ReactNode
}
```

---

## 📋 FASE 3: Vistas Específicas de Productos

### **🎯 VISTAS CORE (Roadmap Original)**

### 🎯 3.1 - ProductsTable (Refactorizar existente)
**Ubicación:** `src/modules/products/components/ProductsTable.tsx`
- Mover lógica de paginación a ProductsView
- Mantener solo lógica de tabla
- Hacer más genérica (admin/frontend)
- **Contextos:** Admin (gestión completa), Frontend (reportes)

### 🎯 3.2 - Crear ProductsGrid
**Ubicación:** `src/modules/products/components/ProductsGrid.tsx`
- Vista tipo catálogo para frontend
- Cards responsive con imágenes
- Hover effects y call-to-actions
- **Contextos:** Frontend (catálogo principal), Admin (vista previa)

### 🎯 3.3 - Crear ProductsList
**Ubicación:** `src/modules/products/components/ProductsList.tsx`
- Vista lista simple y optimizada
- Ideal para móviles
- Menos información por producto
- **Contextos:** Ambos (búsquedas rápidas, móvil)

### **🚀 VISTAS ADICIONALES IDENTIFICADAS**

### 🎯 3.4 - Crear ProductsCompact
**Ubicación:** `src/modules/products/components/ProductsCompact.tsx`
- Vista densa para selección/picking
- Información mínima esencial
- Checkboxes/selection support
- **Contextos:** Admin (formularios, pedidos), Frontend (comparadores, wishlists)

### 🎯 3.5 - Crear ProductsShowcase  
**Ubicación:** `src/modules/products/components/ProductsShowcase.tsx`
- Vista destacada para productos hero/featured
- Imágenes grandes y llamativas
- CTAs prominentes
- **Contextos:** Frontend (homepage, landings), Admin (gestión destacados)

### **📱 MATRIZ DE CONTEXTOS DE USO**

| Vista | Admin | Frontend | Móvil | Descripción |
|-------|--------|----------|--------|-------------|
| **Table** | ✅ Gestión completa | ✅ Reportes | ❌ | Tabla detallada con todas las acciones |
| **Grid** | ✅ Vista previa | ✅ Catálogo principal | ⚡ Adaptable | Cards con imágenes y hover effects |
| **List** | ✅ Búsquedas | ✅ Móvil optimizado | ✅ | Lista simple y rápida |
| **Compact** | ✅ Selección rápida | ✅ Comparadores | ✅ | Vista densa para picking |
| **Showcase** | ✅ Gestión destacados | ✅ Hero products | ⚡ Adaptable | Productos destacados grandes |

---

## 📋 FASE 4: Actualización de Templates Existentes

### 🎯 4.1 - Refactorizar ProductsAdminTemplate
- Remover lógica de paginación inline
- Usar nuevo ProductsView con viewMode='table'
- Mantener filtros admin-específicos
- Preservar funcionalidad existente

### 🎯 4.2 - Actualizar exports del módulo
**Ubicación:** `src/modules/products/index.ts`
- Exportar nuevos componentes
- Mantener compatibilidad con imports existentes

---

## 📋 FASE 5: Implementación Frontend (Opcional)

### 🎯 5.1 - Crear FrontendProductsPage
**Ubicación:** `src/app/(front)/productos/page.tsx`
- Usar ProductsView con viewMode='grid'
- Filtros simples para frontend
- SEO y meta tags

### 🎯 5.2 - Filtros Frontend
**Ubicación:** `src/modules/products/components/PublicFilters.tsx`
- Versión simplificada de ProductFilters
- Enfoque en búsqueda y categorías principales
- UI más amigable para usuarios finales

---

## 📋 FASE 6: Testing y Optimización

### 🎯 6.1 - Testing de Componentes
- Unit tests para ProductsView
- Integration tests para diferentes viewModes
- Verificar reutilización admin/frontend

### 🎯 6.2 - Optimización de Performance
- Memo para componentes pesados
- Lazy loading para ProductsGrid
- Optimización de re-renders

### 🎯 6.3 - Documentación
- Storybook para nuevos componentes
- Ejemplos de uso en diferentes contextos
- Guía de migración

---

## 🗂️ Estructura Final Esperada

```
src/modules/products/components/
├── ProductsView.tsx              # Componente principal reutilizable ✅
├── PaginationControls.tsx        # Controles de paginación independientes ✅
├── ProductsStats.tsx             # Estadísticas y contadores ✅
├── ProductsTable.tsx             # Vista tabla (refactorizada) 🔄
├── ProductsGrid.tsx              # Vista grid para catálogo 🔄
├── ProductsList.tsx              # Vista lista simple móvil 🔄
├── ProductsCompact.tsx           # Vista densa para selección 🔄
├── ProductsShowcase.tsx          # Vista destacada hero/featured 🔄
├── ProductFilters.tsx            # Filtros admin (existente) ✅
├── PublicFilters.tsx             # Filtros frontend (nuevo) ⏳
└── index.ts                      # Exports actualizados ✅
```

### **📊 Estimación de Implementación por Token Usage**

| Componente | Complejidad | Tokens Est. | Status |
|------------|-------------|-------------|--------|
| ProductsGrid | Alta | ~800 tokens | 🔄 Prioridad 1 |
| ProductsList | Media | ~500 tokens | 🔄 Prioridad 2 |
| ProductsCompact | Media | ~600 tokens | 🔄 Prioridad 3 |
| ProductsShowcase | Alta | ~700 tokens | 🔄 Prioridad 4 |
| Table Refactor | Baja | ~300 tokens | 🔄 Prioridad 5 |
| **Total estimado** | | **~2900 tokens** | **+ margen commit** |

---

## 📊 Beneficios Esperados

### 🔄 Reutilización
- Un solo componente ProductsView para admin y frontend
- Diferentes vistas sin duplicar lógica
- Fácil agregar nuevos viewModes

### 🎨 Flexibilidad
- Cambio de vista con un simple prop
- Personalización fácil por contexto
- Componentes más testables

### 🚀 Mantenibilidad
- Lógica centralizada en ProductsView
- Separación clara de responsabilidades
- Fácil agregar nuevas funcionalidades

### 📱 Escalabilidad
- Preparado para vistas móviles
- Fácil agregar filtros avanzados
- Base sólida para features futuras

---

## ⚠️ Consideraciones de Implementación

### 🔧 Compatibilidad hacia atrás
- Mantener ProductsTable funcionando como antes
- No romper imports existentes
- Migración gradual opcional

### 🎯 Fases opcionales
- FASE 5 (Frontend) es opcional según necesidades
- FASE 6 (Testing) se puede hacer incrementalmente
- Priorizar según tiempo disponible

### 📝 Documentación en CLAUDE.md
- Actualizar documentación con nuevos componentes
- Agregar ejemplos de uso
- Mantener coherencia con arquitectura modular existente

---

## 🚦 Estado Actual
- ✅ **FASE 1: COMPLETADA** - Análisis, preparación y corrección de filtros
- ✅ **FASE 2: COMPLETADA** - Componentes base reutilizables creados:
  - ✅ PaginationControls - Controles de paginación independientes
  - ✅ ProductsStats - Estadísticas y contadores reutilizables  
  - ✅ ProductsView - Componente principal con múltiples vistas
  - ✅ Exports actualizados en components/index.ts
  - ✅ Build verificado y funcionando
  - ✅ Correcciones de tipos PaginationMeta en templates existentes
  - ✅ **Análisis extendido completado** - 5 vistas específicas identificadas
  - ✅ **Roadmap actualizado** - Matriz de contextos y estimación de tokens
- 🔄 **FASE 3: EN PROGRESO** - Vistas específicas (5 componentes: Grid, List, Compact, Showcase, Table refactor)
- ⏳ **Pendientes:** FASES 4-6

### **📋 Plan de Implementación FASE 3**
**Estimación:** ~2900 tokens + margen para commit (~3500 tokens total)
1. **ProductsGrid** (Prioridad 1) - Catálogo principal frontend
2. **ProductsList** (Prioridad 2) - Vista móvil optimizada  
3. **ProductsCompact** (Prioridad 3) - Selección/picking
4. **ProductsShowcase** (Prioridad 4) - Productos destacados
5. **Table Refactor** (Prioridad 5) - Limpieza final

**Próxima acción:** Implementar ProductsGrid con tokens suficientes para commit