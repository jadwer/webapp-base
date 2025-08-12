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

// ===== FUTURE HOOKS (PRÓXIMAS ITERACIONES) =====

// Iteración 2: WarehouseLocation hooks
// export { useLocations, useLocation, useLocationsMutations } from './useLocations'

// Iteración 3: Stock hooks
// export { useStock, useStockMutations, useStockAlerts } from './useStock'

// Coordinación con Products module
// export { useInventoryIntegration } from './useInventoryIntegration'