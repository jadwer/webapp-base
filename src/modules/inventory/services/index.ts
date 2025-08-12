/**
 * 📦 INVENTORY SERVICES - INDEX
 * Exports centralizados para todos los servicios del módulo inventory
 */

// ===== WAREHOUSES SERVICE =====
export {
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
} from './warehousesService'

// ===== FUTURE SERVICES (PRÓXIMAS ITERACIONES) =====

// Iteración 2: Warehouse Locations Service ✅
export {
  locationsService,
  getWarehouseLocations,
  getLocationsByWarehouse,
  getWarehouseLocation,
  createWarehouseLocation,
  updateWarehouseLocation,
  deleteWarehouseLocation,
  checkLocationCodeAvailable,
  getLocationHierarchy,
  formatLocationHierarchy,
  getLocationTypeLabel,
  getLocationStatusLabel,
  getPickingPriorityColor,
  formatLocationCode,
  getLocationHierarchyDisplay,
} from './locationsService'

// Iteración 3: Stock Service
// export { stockService } from './stockService'

// Coordinación con Products module
// export { inventoryIntegrationService } from './integrationService'