/**
 * INVENTORY SIMPLE - TYPES INDEX
 * Exports centralizados para todos los tipos del módulo
 */

// Warehouse types
export type {
  Warehouse,
  WarehouseParsed,
  CreateWarehouseData,
  UpdateWarehouseData,
  WarehouseFilters,
  WarehouseSortOptions
} from './warehouse'

// Location types
export type {
  WarehouseLocation,
  WarehouseLocationParsed,
  CreateLocationData,
  UpdateLocationData,
  LocationFilters,
  LocationSortOptions
} from './location'

// Stock types
export type {
  Stock,
  CreateStockData,
  UpdateStockData,
  StockFilters,
  StockSortOptions
} from './stock'

// Inventory Movement types
export type {
  InventoryMovement,
  InventoryMovementParsed,
  CreateMovementData,
  UpdateMovementData,
  MovementFilters,
  MovementSortOptions
} from './inventoryMovement'

// Common pagination and response types
export interface PaginationParams {
  page?: number
  size?: number
}

export interface SortParams {
  field?: string
  direction?: 'asc' | 'desc'
}

export interface JsonApiResponse<T> {
  data: T
  included?: import('../utils/jsonApi').JsonApiResource[]
  meta?: {
    pagination?: {
      page: number
      pages: number
      size: number
      total: number
    }
  }
  links?: {
    first?: string
    last?: string
    prev?: string
    next?: string
  }
}

export interface JsonApiError {
  id?: string
  status?: string
  code?: string
  title?: string
  detail?: string
  source?: {
    pointer?: string
    parameter?: string
  }
}

// UI State types (for Zustand) - simplified to avoid missing type references
export interface InventoryUIFilters {
  warehouses: WarehouseFilters
  locations: LocationFilters
  stock: StockFilters  
  movements: MovementFilters
}

export interface InventoryUISort {
  warehouses: WarehouseSortOptions
  locations: LocationSortOptions
  stock: StockSortOptions
  movements: MovementSortOptions
}

export interface InventoryUIPagination {
  warehouses: PaginationParams
  locations: PaginationParams
  stock: PaginationParams
  movements: PaginationParams
}

export type ViewMode = 'table' | 'grid' | 'list' | 'compact' | 'showcase'

// Common types
export type {
  ApiResponse,
  FormData,
  TableProps,
  FilterProps,
  MutationHandlers,
  ComponentProps,
  EventHandlers,
  GenericState
} from './common'