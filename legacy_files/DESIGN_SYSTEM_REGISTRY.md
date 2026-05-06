# 🎨 DESIGN SYSTEM REGISTRY
## Registro de Componentes Nuevos - Módulo Products

---

## 📋 **COMPONENTES NUEVOS REGISTRADOS**

### **1. ViewModeSelector**
**Ubicación:** `src/modules/products/components/ViewModeSelector.tsx`
**Categoría:** Navigation Controls
**Descripción:** Selector profesional entre 5 modos de vista
```tsx
interface ViewModeSelectorProps {
  // Sin props - usa Zustand store interno
}
```
**Uso:**
- Admin panels para cambiar vista de datos
- Reutilizable en cualquier módulo
- Bootstrap button group + iconos + estados

**Features:**
- 5 modos: table, grid, list, compact, showcase
- Estado persistente con Zustand
- Indicador visual del modo activo
- Tooltips descriptivos

---

### **2. PaginationPro**
**Ubicación:** `src/modules/products/components/PaginationPro.tsx`
**Categoría:** Navigation Controls
**Descripción:** Paginación profesional con First/Last/Numbers
```tsx
interface PaginationProProps {
  meta: PaginationMeta
  currentPage: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}
```
**Uso:**
- Reemplazar paginaciones básicas
- Tablas con muchos registros
- Integración con meta de APIs

**Features:**
- First/Previous/Next/Last buttons
- Page numbers con ellipsis inteligente
- Loading states
- Info de items mostrados

---

### **3. StatusBadge**
**Ubicación:** `src/modules/products/components/StatusBadge.tsx`
**Categoría:** Data Display
**Descripción:** Badge de estado configurable
```tsx
interface StatusBadgeProps {
  status: 'active' | 'inactive' | string
}
```
**Uso:**
- Mostrar estados en tablas
- Indicadores de status
- Extensible para nuevos estados

**Features:**
- Colores semánticos (verde/gris)
- Extensible para más estados
- Bootstrap badges con iconos

---

### **4. [Entity]FiltersSimple**
**Ubicación:** `src/modules/products/components/ProductsFiltersSimple.tsx`
**Categoría:** Form Controls
**Descripción:** Filtros independientes con debounce
```tsx
interface FiltersSimpleProps {
  // Sin props - usa Zustand store interno
}
```
**Patrón Reutilizable:**
- Debounce 300ms en búsquedas
- UI state independiente (Zustand)
- Sin re-renders de vistas
- Clear filters functionality

**Features:**
- Search input con preservación de foco
- Indicadores de filtros activos
- Botón limpiar filtros
- Performance optimizado

---

### **5. Vistas Virtualizadas (5 componentes)**

#### **[Entity]TableVirtualized**
**Categoría:** Data Display
**Descripción:** Tabla virtualizada con TanStack Virtual
```tsx
interface TableVirtualizedProps {
  items: Entity[]
  isLoading?: boolean
  onEdit?: (entity: Entity) => void
  onDelete?: (entityId: string) => void
  onView?: (entity: Entity) => void
}
```
**Features:**
- Virtualización para miles de registros
- Actions column estándar
- Loading y empty states
- Responsive design

#### **[Entity]Grid**
**Categoría:** Data Display  
**Descripción:** Vista grid con cards, 4 por fila
**Features:**
- Cards visuales con imágenes
- Hover effects
- Responsive grid (4/3/2/1 columnas)
- Información destacada

#### **[Entity]List**
**Categoría:** Data Display
**Descripción:** Vista lista detallada, móvil optimizada
**Features:**
- Items grandes con info completa
- Touch-friendly actions
- Imagen + detalles + acciones
- Responsive para móviles

#### **[Entity]Compact**
**Categoría:** Data Display
**Descripción:** Vista compacta con info esencial
**Features:**
- Filas pequeñas (50px height)
- Solo datos críticos
- Acciones compactas
- Máxima densidad de información

#### **[Entity]Showcase**
**Categoría:** Data Display
**Descripción:** Vista premium con imágenes grandes
**Features:**
- Cards grandes (2 por fila)
- Imágenes hero (400px)
- CTAs prominentes
- Visual impact alto

---

### **6. [Entity]AdminPagePro**
**Categoría:** Page Templates
**Descripción:** Template completo de administración
```tsx
interface AdminPageProProps {
  // Sin props - auto-configurable
}
```
**Features:**
- Header con breadcrumbs
- Stats bar con métricas
- Filtros + ViewModeSelector
- Vista dinámica según modo
- Paginación integrada
- Error handling completo

---

### **7. Store UI Zustand**
**Ubicación:** `src/modules/products/store/[entity]UIStore.ts`
**Categoría:** State Management
**Descripción:** Estado UI independiente para performance
```tsx
interface EntityUIState {
  filters: EntityFilters
  sort: EntitySortOptions  
  currentPage: number
  viewMode: ViewMode
  // + Actions
}
```
**Patrón:**
- UI state separado de server state
- Selector hooks específicos
- Zero re-renders innecesarios
- Reutilizable para cualquier entidad

---

## 🎨 **PATRONES DE DISEÑO ESTABLECIDOS**

### **Colores Semánticos**
- **Primary:** `#0d6efd` - Acciones principales
- **Success:** `#198754` - Estados positivos, precios
- **Danger:** `#dc3545` - Eliminar, errores
- **Warning:** `#fd7e14` - Editar, alertas
- **Info:** `#0dcaf0` - Información adicional
- **Secondary:** `#6c757d` - Acciones secundarias

### **Iconografía Bootstrap Icons**
- `bi-table` - Vista tabla
- `bi-grid-3x3` - Vista grid  
- `bi-list-ul` - Vista lista
- `bi-list` - Vista compacta
- `bi-images` - Vista showcase
- `bi-eye` - Ver detalles
- `bi-pencil` - Editar
- `bi-trash` - Eliminar
- `bi-lightning` - Performance/velocidad

### **Espaciado Consistente**
- **Cards:** `shadow-sm` + `border-0`
- **Padding:** `py-3 px-4` para containers
- **Gaps:** `g-3` para grids, `gap-2` para buttons
- **Margins:** `mb-4` para secciones

### **Estados de Loading**
- **Spinner:** `spinner-border text-primary`
- **Skeleton:** `bg-light animate-pulse rounded`
- **Empty:** Icon display-1 + mensaje + sugerencia

---

## 📐 **MEDIDAS ESTÁNDAR**

### **Alturas de Vistas**
- **Table:** 600px (muchos registros)
- **Grid:** 600px (cards grandes)
- **List:** 600px (items expandidos)  
- **Compact:** 400px (filas pequeñas)
- **Showcase:** 600px (imágenes grandes)

### **Row Heights Virtualización**
- **Table:** 80px por fila
- **Grid:** 380px por row (cards)
- **List:** 120px por item
- **Compact:** 50px por fila
- **Showcase:** 650px por row

### **Responsive Breakpoints**
- **Grid:** 4/3/2/1 columnas (lg/md/sm/xs)
- **Actions:** Stack vertical en móvil
- **Filters:** Collapse en móvil

---

## 🚀 **GUÍAS DE USO**

### **Para Implementar Nueva Vista:**
1. Copiar patrón de `ProductsTableVirtualized.tsx`
2. Ajustar altura y estructura del item
3. Usar mismos props interface
4. Integrar en ViewModeSelector

### **Para Nuevo Módulo:**
1. Seguir `MODULE_ARCHITECTURE_BLUEPRINT.md`
2. Copiar store pattern de `productsUIStore.ts`
3. Adaptar tipos de la entidad
4. Reutilizar componentes base (ViewModeSelector, PaginationPro, etc.)

### **Performance Guidelines:**
- Siempre usar React.memo en componentes principales
- TanStack Virtual para listas >50 items
- Zustand para UI state
- useCallback para event handlers
- Debounce 300ms para búsquedas

---

## 📊 **MÉTRICAS DE ADOPCIÓN**

### **Componentes por Módulo:**
- **Products:** 9 componentes nuevos ✅
- **Units:** 3 componentes implementados ✅
- **Categories:** Pendiente aplicar patrón
- **Brands:** Pendiente aplicar patrón

### **Reutilización Lograda:**
- **ViewModeSelector:** Reutilizable 100% ✅
- **PaginationPro:** Reutilizable 100% ✅  
- **StatusBadge:** Reutilizable 100% ✅
- **Store Pattern:** Aplicable a cualquier entidad ✅

---

*Registro actualizado: Post-implementación módulo Products completo*