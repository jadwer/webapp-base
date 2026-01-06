'use client'

/**
 * INVENTORY SIMPLE - HOOKS INDEX
 * Exports centralizados para todos los hooks del módulo
 */

// Warehouses hooks
export {
  useWarehouses,
  useWarehouse,
  useWarehousesMutations,
  useWarehouseLocations,
  useWarehouseStock
} from './useWarehouses'

// Locations hooks
export {
  useLocations,
  useLocation,
  useLocationsMutations,
  useLocationStock
} from './useLocations'

// Stock hooks
export {
  useStock,
  useStockItem,
  useStockMutations,
  useStockByProduct,
  useWarehouseStockSummary,
  useLocationStockSummary
} from './useStock'

// Inventory Movements hooks
export {
  useInventoryMovements,
  useInventoryMovement,
  useInventoryMovementsMutations,
  useMovementsByProduct,
  useMovementsByWarehouse,
  useEntryMovements,
  useExitMovements
} from './useInventoryMovements'

// Product Batch hooks
export {
  useProductBatches,
  useProductBatchesByProduct,
  useProductBatchesByWarehouse,
  useProductBatchesByStatus,
  useExpiringProductBatches,
  useLowStockProductBatches
} from './useProductBatches'

export {
  useProductBatch
} from './useProductBatch'

export {
  useProductBatchMutations
} from './useProductBatchMutations'


// Dashboard hooks
export {
  useInventoryDashboard,
  useStockAlerts,
  useRecentActivity
} from './useDashboard'

// Cycle Count hooks - Backend v1.1
export { useCycleCounts } from './useCycleCounts'
export { useCycleCount } from './useCycleCount'
export { useCycleCountMutations } from './useCycleCountMutations'