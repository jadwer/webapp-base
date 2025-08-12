/**
 * 📦 INVENTORY HOOKS - INDEX
 * Exports centralizados para todos los hooks del módulo inventory
 */

// ===== WAREHOUSES HOOKS =====
export {
  useWarehouses,
  useWarehouse,
  useWarehousesSearch,
  useWarehouseOptions,
  useWarehouseMetrics,
} from './useWarehouses'

export {
  useWarehousesMutations,
  useWarehouseCodeValidation,
  useWarehouseSlugValidation,
} from './useWarehousesMutations'

// ===== LOCATION HOOKS (ITERACIÓN 2) ✅ =====
export {
  useLocations,
  useLocationsByWarehouse,
  useLocation,
  useLocationHierarchy,
  useLocationCodeValidation,
  useLocationOptions,
  useLocationMetrics,
  useLocationsSearch,
} from './useLocations'

export {
  useLocationsMutations,
  useLocationHierarchyValidation,
} from './useLocationsMutations'

// ===== FUTURE HOOKS (PRÓXIMAS ITERACIONES) =====

// Iteración 3: Stock hooks
// export { useStock, useStockMutations, useStockAlerts } from './useStock'

// Coordinación con Products module
// export { useInventoryIntegration } from './useInventoryIntegration'