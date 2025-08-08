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

### 🎯 2.1 - Crear PaginationControls
**Ubicación:** `src/modules/products/components/PaginationControls.tsx`
**Props:**
```tsx
interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  perPage: number
  totalItems: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}
```

### 🎯 2.2 - Crear ProductsStats
**Ubicación:** `src/modules/products/components/ProductsStats.tsx`
**Props:**
```tsx
interface ProductsStatsProps {
  totalProducts: number
  currentPage: number
  perPage: number
  displayedItems: number
  customStats?: React.ReactNode
}
```

### 🎯 2.3 - Crear ProductsView (Componente Principal)
**Ubicación:** `src/modules/products/components/ProductsView.tsx`
**Props:**
```tsx
interface ProductsViewProps {
  products: Product[]
  meta: PaginationMeta | undefined
  isLoading: boolean
  viewMode: 'table' | 'grid' | 'list'
  showStats?: boolean
  showPagination?: boolean
  onPageChange?: (page: number) => void
  onProductAction?: (action: string, product: Product) => void
  emptyState?: React.ReactNode
  loadingState?: React.ReactNode
  className?: string
}
```

---

## 📋 FASE 3: Vistas Específicas de Productos

### 🎯 3.1 - ProductsTable (Refactorizar existente)
- Mover lógica de paginación a ProductsView
- Mantener solo lógica de tabla
- Hacer más genérica (admin/frontend)

### 🎯 3.2 - Crear ProductsGrid
**Ubicación:** `src/modules/products/components/ProductsGrid.tsx`
- Vista tipo catálogo para frontend
- Cards responsive con imágenes
- Hover effects y call-to-actions

### 🎯 3.3 - Crear ProductsList
**Ubicación:** `src/modules/products/components/ProductsList.tsx`
- Vista lista simple
- Útil para móviles
- Menos información por producto

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
├── ProductsView.tsx              # Componente principal reutilizable
├── PaginationControls.tsx        # Controles de paginación independientes
├── ProductsStats.tsx             # Estadísticas y contadores
├── ProductsTable.tsx             # Vista tabla (refactorizada)
├── ProductsGrid.tsx              # Vista grid para frontend
├── ProductsList.tsx              # Vista lista simple
├── ProductFilters.tsx            # Filtros admin (existente)
├── PublicFilters.tsx             # Filtros frontend (nuevo)
└── index.ts                      # Exports actualizados
```

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
- ✅ FASE 1: Completada en esta sesión
- 🔄 FASE 2: Siguiente prioridad
- ⏳ Pendientes: FASES 3-6

**Próxima sesión:** Comenzar FASE 2 con creación de PaginationControls