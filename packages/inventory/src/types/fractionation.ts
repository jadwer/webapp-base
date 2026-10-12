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

interface BatchBasic {
  id: string
  batchNumber: string
  lotNumber?: string | null
  expirationDate?: string | null
  currentQuantity?: number
  unitCost?: number
}

interface MovementBasic {
  id: string
  movementType: string
  quantity: number
  unitCost: number
  totalValue: number
  movementDate?: string
  glPostingStatus?: string | null
}

export interface Fractionation {
  id: string
  folioNumber: string
  idempotencyKey?: string | null
  sourceProductId: number
  destinationProductId: number
  productConversionId?: number
  warehouseId: number
  warehouseLocationId?: number | null
  sourceBatchId?: number | null
  destinationBatchId?: number | null
  userId: number
  /** Lo que salio del origen (con piezas enteras puede ser menor a lo pedido) */
  sourceQuantity: number
  requestedQuantity?: number | null
  producedQuantity: number
  wastePercentage: number
  wasteQuantity: number
  conversionFactorUsed: number
  sourceUnitCost?: number
  destinationUnitCost?: number
  totalCost?: number
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
  warehouseLocation?: { id: string; name: string; code?: string }
  user?: { id: string; name: string; email: string }
  sourceBatch?: BatchBasic
  destinationBatch?: BatchBasic
  exitMovement?: MovementBasic
  entryMovement?: MovementBasic
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
  warehouse_location_id?: number
  product_batch_id?: number
}

export interface FractionationLocationOption {
  warehouse_location_id: number | null
  name: string | null
  code: string | null
  quantity: number
  available: number
}

export interface FractionationBatchOption {
  id: number
  batch_number: string
  lot_number: string | null
  expiration_date: string | null
  warehouse_location_id: number | null
  available_quantity: number
  unit_cost: number
  is_expired: boolean
  is_expiring_soon: boolean
  /**
   * D10: estado, calidad y disponibilidad del lote. `is_usable` y
   * `unavailable_reason` (en espanol) los calcula el backend; si no llegan
   * (backend anterior) el selector deriva la razon de status, quality_status
   * e is_expired.
   */
  status?: string | null
  quality_status?: string | null
  is_usable?: boolean
  unavailable_reason?: string | null
}

export interface FractionationPreview {
  source_product: ProductWithUnit
  destination_product: ProductWithUnit
  /** Igual a requested_quantity (se conserva por compatibilidad) */
  source_quantity: number
  requested_quantity?: number
  /** Lo que realmente sale del origen (piezas enteras: lo estrictamente necesario) */
  consumed_quantity?: number
  /** Sobrante que se queda en el granel con piezas enteras */
  leftover_quantity?: number
  conversion_factor: number
  waste_percentage: number
  whole_units?: boolean
  produced_quantity: number
  waste_quantity: number
  /** Existencia menos reservado */
  available_stock: number
  on_hand_stock?: number
  reserved_stock?: number
  has_enough_stock: boolean
  source_unit_cost?: number
  destination_unit_cost?: number
  total_cost?: number
  has_cost?: boolean
  location_required?: boolean
  warehouse_location_id?: number | null
  locations?: FractionationLocationOption[]
  batch_required?: boolean
  batches?: FractionationBatchOption[]
  suggested_batch_id?: number | null
  product_batch_id?: number | null
  batch_available?: number | null
  can_execute?: boolean
  warnings?: string[]
}

export interface FractionationCalculateResponse {
  data: FractionationPreview
}

export interface FractionationExecuteRequest {
  source_product_id: number
  destination_product_id: number
  source_quantity: number
  warehouse_id: number
  warehouse_location_id?: number
  product_batch_id?: number
  notes?: string
  /** Clave del formulario: el mismo POST repetido no fracciona dos veces */
  idempotency_key?: string
}

export interface FractionationExecuteResponse {
  data: {
    id: number
    folioNumber: string
    sourceProductId: number
    destinationProductId: number
    sourceQuantity: number
    requestedQuantity?: number | null
    producedQuantity: number
    wastePercentage: number
    wasteQuantity: number
    conversionFactorUsed: number
    sourceUnitCost?: number
    destinationUnitCost?: number
    totalCost?: number
    sourceBatchId?: number | null
    destinationBatchId?: number | null
    status: string
    executedAt: string
    sourceProduct: ProductBasic | null
    destinationProduct: ProductBasic | null
    warehouse: WarehouseBasic | null
  }
  meta?: {
    replayed?: boolean
    warnings?: string[]
  }
  message: string
}
