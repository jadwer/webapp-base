/**
 * FRACTIONATION TYPES
 * Fraccionamiento de productos
 */

interface ProductBasic {
  id: string
  name: string
  sku: string
}

interface ProductWithUnit {
  id: number
  name: string
  sku: string
  unit?: {
    name: string
    code: string
  } | null
}

interface WarehouseBasic {
  id: string
  name: string
}

export interface Fractionation {
  id: string
  folioNumber: string
  sourceProductId: number
  destinationProductId: number
  productConversionId?: number
  warehouseId: number
  userId: number
  sourceQuantity: number
  producedQuantity: number
  wastePercentage: number
  wasteQuantity: number
  conversionFactorUsed: number
  exitMovementId?: number
  entryMovementId?: number
  status: 'pending' | 'completed' | 'cancelled'
  notes?: string
  executedAt?: string
  createdAt: string
  updatedAt: string

  // Relationships
  sourceProduct?: ProductBasic
  destinationProduct?: ProductBasic
  warehouse?: WarehouseBasic
  user?: { id: string; name: string; email: string }
}

export interface FractionationFilters {
  folioNumber?: string
  sourceProduct?: string
  destinationProduct?: string
  warehouse?: string
  user?: string
  status?: string
}

export interface FractionationSortOptions {
  field: 'folioNumber' | 'sourceQuantity' | 'producedQuantity' | 'executedAt' | 'createdAt'
  direction: 'asc' | 'desc'
}

// Custom endpoint types (not JSON:API)
export interface FractionationCalculateRequest {
  source_product_id: number
  destination_product_id: number
  source_quantity: number
  warehouse_id: number
}

export interface FractionationCalculateResponse {
  data: {
    source_product: ProductWithUnit
    destination_product: ProductWithUnit
    source_quantity: number
    conversion_factor: number
    waste_percentage: number
    produced_quantity: number
    waste_quantity: number
    available_stock: number
    has_enough_stock: boolean
  }
}

export interface FractionationExecuteRequest {
  source_product_id: number
  destination_product_id: number
  source_quantity: number
  warehouse_id: number
  notes?: string
}

export interface FractionationExecuteResponse {
  data: {
    id: number
    folioNumber: string
    sourceProductId: number
    destinationProductId: number
    sourceQuantity: number
    producedQuantity: number
    wastePercentage: number
    wasteQuantity: number
    conversionFactorUsed: number
    status: string
    executedAt: string
    sourceProduct: ProductBasic | null
    destinationProduct: ProductBasic | null
    warehouse: WarehouseBasic | null
  }
  message: string
}
