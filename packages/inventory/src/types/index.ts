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

// ProductBatch types
export type {
  ProductBatch,
  ParsedProductBatch,
  CreateProductBatchRequest,
  UpdateProductBatchRequest,
  ProductBatchFilters,
  ProductBatchSortOptions,
  ProductBatchFormData,
  ProductBatchStatus,
  ProductBatchTestResults,
  ProductBatchCertifications,
  ProductBatchMetadata,
  ProductBatchStatusConfig,
  UseProductBatchesResult,
  UseProductBatchResult,
  UseProductBatchMutationsResult
} from './productBatch'

// CycleCount types - Backend v1.1
export type {
  CycleCount,
  ParsedCycleCount,
  CreateCycleCountRequest,
  UpdateCycleCountRequest,
  CycleCountFilters,
  CycleCountSortOptions,
  CycleCountFormData,
  CycleCountStatus,
  ABCClass,
  CycleCountMetadata,
  CycleCountStatusConfig,
  ABCClassConfig,
  RecordCountFormData,
  UseCycleCountsResult,
  UseCycleCountResult,
  UseCycleCountMutationsResult
} from './cycleCount'

export {
  CYCLE_COUNT_STATUS_CONFIG,
  ABC_CLASS_CONFIG,
  CYCLE_COUNT_STATUS_OPTIONS,
  ABC_CLASS_OPTIONS
} from './cycleCount'

// ProductConversion types
export type {
  ProductConversion,
  CreateProductConversionData,
  UpdateProductConversionData,
  ProductConversionFilters,
  ProductConversionSortOptions
} from './productConversion'

// Fractionation types
export type {
  Fractionation,
  FractionationFilters,
  FractionationSortOptions,
  FractionationCalculateRequest,
  FractionationCalculateResponse,
  FractionationExecuteRequest,
  FractionationExecuteResponse
} from './fractionation'

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
  // PagePagination de laravel-json-api: meta.page.{currentPage,from,lastPage,perPage,to,total}
  meta?: {
    page?: {
      currentPage: number
      from?: number
      lastPage: number
      perPage: number
      to?: number
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