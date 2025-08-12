/**
 * 📦 INVENTORY STORES - INDEX
 * Exports centralizados para todos los stores Zustand del módulo inventory
 */

// ===== WAREHOUSES UI STORE =====
export {
  useWarehousesUIStore,
  useWarehousesFilters,
  useWarehousesView,
  useWarehousesSelection,
  useWarehousesFocus,
  saveWarehouseViewPreferences,
  loadWarehouseViewPreferences,
} from './warehousesUIStore'

// ===== FUTURE STORES (PRÓXIMAS ITERACIONES) =====

// Iteración 2: WarehouseLocation UI Store
// export { useLocationsUIStore } from './locationsUIStore'

// Iteración 3: Stock UI Store
// export { useStockUIStore } from './stockUIStore'

// Global inventory filters store (coordinación entre entidades)
// export { useInventoryGlobalStore } from './inventoryGlobalStore'