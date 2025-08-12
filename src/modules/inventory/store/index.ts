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

// ===== LOCATION UI STORE (ITERACIÓN 2) ✅ =====
export {
  useLocationsUIStore,
  useLocationsFilters,
  useLocationsView,
  useLocationsSelection,
  useLocationsFocus,
  saveLocationViewPreferences,
  loadLocationViewPreferences,
} from './locationsUIStore'

// ===== FUTURE STORES (PRÓXIMAS ITERACIONES) =====

// Iteración 3: Stock UI Store
// export { useStockUIStore } from './stockUIStore'

// Global inventory filters store (coordinación entre entidades)
// export { useInventoryGlobalStore } from './inventoryGlobalStore'