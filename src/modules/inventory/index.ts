/**
 * 📦 INVENTORY MODULE - MAIN INDEX
 * Export principal del módulo inventory con arquitectura enterprise
 * 
 * Módulo completo para gestión de inventario con 3 entidades:
 * - Warehouses (Almacenes) ✅ COMPLETADO - Iteración 1
 * - WarehouseLocations (Ubicaciones) 🔄 Iteración 2
 * - Stock (Control de Inventario) 🔄 Iteración 3
 */

// ===== COMPONENTS =====
export {
  // Warehouses - Iteración 1 ✅ + Iteración 1.5 ✅
  WarehousesAdminPagePro,
  WarehousesTableVirtualized,
  WarehousesGrid,
  WarehousesList,
  WarehousesCompact,
  WarehousesShowcase,
  WarehousesFiltersSimple,
  WarehouseForm,
  
  // Shared components (re-exports)
  ViewModeSelector,
  PaginationPro,
} from './components'

// ===== HOOKS =====
export {
  // Warehouses data hooks
  useWarehouses,
  useWarehouse,
  useWarehousesSearch,
  useWarehouseOptions,
  useWarehouseMetrics,
  
  // Warehouses mutation hooks
  useWarehousesMutations,
  useWarehouseCodeValidation,
  useWarehouseSlugValidation,
} from './hooks'

// ===== STORES =====
export {
  // Warehouses UI store
  useWarehousesUIStore,
  useWarehousesFilters,
  useWarehousesView,
  useWarehousesSelection,
  useWarehousesFocus,
  saveWarehouseViewPreferences,
  loadWarehouseViewPreferences,
} from './store'

// ===== SERVICES =====
export {
  // Warehouses service
  warehousesService,
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  checkWarehouseCodeAvailable,
  checkWarehouseSlugAvailable,
  generateSlugFromName,
  formatCapacity,
  getWarehouseTypeLabel,
} from './services'

// ===== TYPES =====
export type {
  // Core warehouse types
  Warehouse,
  WarehouseLocation,
  Stock,
  
  // Enums y auxiliary types
  WarehouseType,
  WarehouseStatus,
  StockStatus,
  MovementType,
  
  // Coordination types (con Products module)
  Product,
  Unit,
  Category,
  Brand,
  
  // API y Forms DTOs
  CreateWarehouseData,
  UpdateWarehouseData,
  WarehouseFilters,
  PaginatedWarehousesResponse,
  
  // UI State types
  WarehouseLoadingState,
  WarehouseMetrics,
  
  // Re-exports from other modules
  JsonApiResponse,
  JsonApiResource,
  JsonApiError,
  PaginationMeta,
  ApiFilters,
  ViewMode,
  SortDirection,
  LoadingState,
} from './types'

// ===== CONSTANTS =====
export { WAREHOUSE_BUSINESS_RULES } from './types'

// ===== MODULE METADATA =====
export const INVENTORY_MODULE_INFO = {
  name: 'inventory',
  version: '1.0.0',
  description: 'Sistema enterprise de gestión de inventario',
  entities: ['warehouses', 'warehouse-locations', 'stock'],
  
  // Estado de implementación
  implementation: {
    iteracion1: {
      entity: 'warehouses',
      status: '✅ COMPLETADO + Iteración 1.5 ✅',
      features: [
        '✅ 5 vistas virtualizadas completas (Table, Grid, List, Compact, Showcase)',
        '✅ Performance optimization 500K+',
        '✅ Error handling enterprise',
        '✅ Business rules validation',
        '✅ Real-time search con debounce',
        '✅ Bulk operations support',
        '✅ TypeScript completo',
        '✅ Vista Grid con cards y stats visuales',
        '✅ Vista List detallada con expansión',
        '✅ Vista Compact para bulk operations',
        '✅ Vista Showcase premium con layout atractivo',
        '✅ Responsive design en todas las vistas',
        '✅ Loading skeletons y empty states',
      ]
    },
    iteracion2: {
      entity: 'warehouse-locations',
      status: '🔄 PENDIENTE',
      features: [
        'Jerarquía visual navegable',
        'Relación con warehouses',
        'Bulk location operations',
        'Visual grouping por warehouse',
      ]
    },
    iteracion3: {
      entity: 'stock',
      status: '🔄 PENDIENTE',
      features: [
        'Control completo de inventario',
        'Alertas de stock bajo/alto',
        'Coordinación con Products module',
        'Real-time calculations',
        'Advanced multi-entity filtering',
      ]
    }
  },
  
  // Arquitectura enterprise aplicada
  architecture: {
    performance: 'TanStack Virtual + React.memo + Zustand',
    state: 'SWR (server) + Zustand (UI)',
    api: 'JSON:API compliant',
    validation: 'Business rules + real-time',
    errors: 'Enterprise handling + toast notifications',
    responsive: 'Desktop/Tablet/Mobile optimized',
    accessibility: 'ARIA + keyboard navigation',
  },
  
  // Dependencies principales
  dependencies: {
    '@tanstack/react-virtual': '^3.0.0',
    'swr': '^2.0.0',
    'zustand': '^4.0.0',
    'next': '^15.0.0',
    'react': '^18.0.0',
  },
  
  // API endpoints base
  apiEndpoints: {
    warehouses: '/api/v1/warehouses',
    locations: '/api/v1/warehouse-locations',
    stock: '/api/v1/stocks',
  },
  
  // Rutas del módulo
  routes: {
    warehouses: {
      list: '/dashboard/inventory/warehouses',
      create: '/dashboard/inventory/warehouses/create',
      view: '/dashboard/inventory/warehouses/[id]',
      edit: '/dashboard/inventory/warehouses/[id]/edit',
    },
    // locations: { ... }, // Iteración 2
    // stock: { ... },     // Iteración 3
  }
} as const

// ===== FUTURE EXPORTS (PRÓXIMAS ITERACIONES) =====

// Iteración 2: WarehouseLocation exports
// export { useLocations, useLocationsMutations, LocationsAdminPagePro } from './...'

// Iteración 3: Stock exports
// export { useStock, useStockMutations, StockAdminPagePro } from './...'

// Coordinación con Products module
// export { useInventoryIntegration, ProductStockInfo } from './...'