/**
 * 📦 INVENTORY COMPONENTS - INDEX
 * Exports centralizados para todos los componentes del módulo inventory
 */

// ===== WAREHOUSES COMPONENTS =====
export { default as WarehousesAdminPagePro } from './WarehousesAdminPagePro'
export { default as WarehousesTableVirtualized } from './WarehousesTableVirtualized'
export { default as WarehousesGrid } from './WarehousesGrid'
export { default as WarehousesList } from './WarehousesList'
export { default as WarehousesCompact } from './WarehousesCompact'
export { default as WarehousesShowcase } from './WarehousesShowcase'
export { default as WarehousesFiltersSimple } from './WarehousesFiltersSimple'
export { default as WarehouseForm } from './WarehouseForm'

// ===== SHARED COMPONENTS (REUTILIZADOS) =====
// Nota: Estos se importan desde otros módulos, aquí solo re-exportamos para conveniencia
export { ViewModeSelector, PaginationPro } from '@/modules/products/components'

// ===== FUTURE COMPONENTS (PRÓXIMAS ITERACIONES) =====

// Iteración 2: WarehouseLocation components
// export { default as LocationsAdminPagePro } from './LocationsAdminPagePro'
// export { default as LocationsTableVirtualized } from './LocationsTableVirtualized'
// export { default as LocationForm } from './LocationForm'

// Iteración 3: Stock components
// export { default as StockAdminPagePro } from './StockAdminPagePro'
// export { default as StockTableVirtualized } from './StockTableVirtualized'
// export { default as StockForm } from './StockForm'

// Specialized components
// export { default as StockLevelIndicator } from './StockLevelIndicator'
// export { default as StockAlerts } from './StockAlerts'
// export { default as LocationHierarchy } from './LocationHierarchy'

// Coordinación con Products module
// export { default as ProductStockInfo } from './ProductStockInfo'