/**
 * 📦 INVENTORY MODULE - TYPES INDEX
 * Exports centralizados para todas las definiciones TypeScript del módulo
 */

// ===== WAREHOUSE TYPES =====
export type {
  // Core interfaces
  Warehouse,
  WarehouseLocation,
  Stock,
  
  // Enums y tipos auxiliares
  WarehouseType,
  WarehouseStatus,
  StockStatus,
  MovementType,
  
  // Coordination interfaces con Products module
  Product,
  Unit,
  Category,
  Brand,
  
  // API y Forms DTOs
  CreateWarehouseData,
  UpdateWarehouseData,
  WarehouseFilters,
  PaginatedWarehousesResponse,
  
  // UI State
  WarehouseLoadingState,
  WarehouseMetrics,
  
} from './warehouse'

// ===== BUSINESS RULES CONSTANTS =====
export { WAREHOUSE_BUSINESS_RULES } from './warehouse'

// ===== RE-EXPORTS FROM OTHER MODULES =====
// Para coordination, re-exportamos tipos necesarios de otros módulos

// JSON:API types (coordinación con backend)
export type {
  JsonApiResponse,
  JsonApiResource,
  JsonApiError,
  PaginationMeta,
  ApiFilters,
} from '@/modules/products/types/api'

// UI common types (coordinación con design system)
export type {
  ViewMode,
  SortDirection,
  LoadingState,
} from '@/modules/products/types'

// ===== FUTURE TYPES (PREPARADO PARA PRÓXIMAS ITERACIONES) =====

/**
 * Placeholder para tipos de próximas iteraciones
 * Se implementarán en iteraciones 2 y 3
 */

// Iteración 2: WarehouseLocation types
// export type { LocationHierarchy, LocationFilters } from './location'

// Iteración 3: Stock types  
// export type { StockMovement, StockAlert, StockDashboard } from './stock'

// Coordinación con Products module (iteración 3)
// export type { ProductStock, StockLevel, StockIntegration } from './product-coordination'