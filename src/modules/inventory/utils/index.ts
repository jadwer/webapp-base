/**
 * 📦 INVENTORY UTILS - INDEX
 * Exports centralizados para todas las utilidades del módulo inventory
 */

// ===== BUSINESS RULES =====
export {
  BusinessRules,
  validateWarehouseForLocations,
  validateWarehouseDeletion,
  generateWarehouseCode,
  validateLocationHierarchy,
  generateLocationCode,
  validateStockBusinessRules,
  calculateStockMetrics,
  validateInventoryPermissions,
} from './businessRules'

// ===== FUTURE UTILITIES (PRÓXIMAS ITERACIONES) =====

// Coordinación con Products module
// export { productStockUtils } from './productIntegration'

// Reporting utilities
// export { inventoryReports } from './reporting'

// Import/Export utilities
// export { inventoryImportExport } from './importExport'