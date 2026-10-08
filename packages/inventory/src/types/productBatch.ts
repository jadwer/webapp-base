/**
 * ProductBatch Type Definitions
 * 
 * Complete TypeScript types for ProductBatch module following
 * the established pattern from products and inventory modules.
 */

// Base ProductBatch interface
export interface ProductBatch {
  id: string
  batchNumber: string
  lotNumber?: string | null
  manufacturingDate: string // ISO date string
  expirationDate: string // ISO date string
  bestBeforeDate?: string | null // ISO date string
  initialQuantity: number
  currentQuantity: number
  reservedQuantity: number
  availableQuantity: number
  unitCost: number
  totalValue: number
  status: ProductBatchStatus
  supplierName?: string | null
  supplierBatch?: string | null
  qualityNotes?: string | null
  testResults?: ProductBatchTestResults | null
  certifications?: ProductBatchCertifications | null
  metadata?: ProductBatchMetadata | null
  createdAt: string
  updatedAt: string
  
  // Relationships
  product?: {
    id: string
    name: string
    sku: string
  }
  warehouse?: {
    id: string
    name: string
    code: string
  }
  warehouseLocation?: {
    id: string
    name: string
    code: string
  } | null
}

// Valores que valida ProductBatchRequest (status in active,expired,quarantine,recalled,consumed)
export type ProductBatchStatus =
  | 'active'
  | 'expired'
  | 'quarantine'
  | 'recalled'
  | 'consumed'

// Test results interface (JSON field)
export interface ProductBatchTestResults {
  ph?: number
  moisture?: number
  quality_grade?: 'A' | 'B' | 'C' | 'D'
  [key: string]: unknown
}

// Certifications interface (JSON field)
export interface ProductBatchCertifications {
  HACCP?: boolean
  ISO9001?: boolean
  Organic?: boolean
  [key: string]: boolean | undefined
}

// Metadata interface (JSON field)
export interface ProductBatchMetadata {
  inspector?: string
  inspection_date?: string
  temperature_log?: string
  [key: string]: unknown
}

// Create ProductBatch request interface
export interface CreateProductBatchRequest {
  batchNumber: string
  lotNumber?: string
  manufacturingDate: string
  expirationDate: string
  bestBeforeDate?: string
  initialQuantity: number
  currentQuantity: number
  unitCost: number
  status: ProductBatchStatus
  supplierName?: string
  supplierBatch?: string
  qualityNotes?: string
  testResults?: ProductBatchTestResults
  certifications?: ProductBatchCertifications
  metadata?: ProductBatchMetadata
  productId: string
  warehouseId: string
  warehouseLocationId?: string
}

// Update ProductBatch request interface
export interface UpdateProductBatchRequest {
  batchNumber?: string
  lotNumber?: string
  manufacturingDate?: string
  expirationDate?: string
  bestBeforeDate?: string
  currentQuantity?: number
  unitCost?: number
  status?: ProductBatchStatus
  supplierName?: string
  supplierBatch?: string
  qualityNotes?: string
  testResults?: ProductBatchTestResults
  certifications?: ProductBatchCertifications
  metadata?: ProductBatchMetadata
  productId?: string
  warehouseId?: string
  warehouseLocationId?: string
}

// Parsed ProductBatch for UI (camelCase)
export interface ParsedProductBatch {
  id: string
  batchNumber: string
  lotNumber?: string | null
  manufacturingDate: string
  expirationDate: string
  bestBeforeDate?: string | null
  initialQuantity: number
  currentQuantity: number
  reservedQuantity: number
  availableQuantity: number
  unitCost: number
  totalValue: number
  status: ProductBatchStatus
  supplierName?: string | null
  supplierBatch?: string | null
  qualityNotes?: string | null
  testResults?: ProductBatchTestResults | null
  certifications?: ProductBatchCertifications | null
  metadata?: ProductBatchMetadata | null
  createdAt: string
  updatedAt: string
  product?: {
    id: string
    name: string
    sku: string
  }
  warehouse?: {
    id: string
    name: string
    code: string
  }
  warehouseLocation?: {
    id: string
    name: string
    code: string
  } | null
}

// Filtros que declara ProductBatchSchema
export interface ProductBatchFilters {
  /** Lote, numero LOT, proveedor, nombre o SKU del producto */
  search?: string
  /** Un solo estado (Where::make('status')) */
  status?: ProductBatchStatus
  productId?: string
  warehouseId?: string
  warehouseLocationId?: string
}

// Sort options interface
export interface ProductBatchSortOptions {
  field: 'batchNumber' | 'manufacturingDate' | 'expirationDate' | 'currentQuantity' | 'totalValue' | 'status' | 'createdAt'
  direction: 'asc' | 'desc'
}

// API response types
export interface ProductBatchApiResponse {
  data: ProductBatch[]
  meta?: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
}

export interface SingleProductBatchApiResponse {
  data: ProductBatch
}

// Hook return types
export interface UseProductBatchesResult {
  productBatches: ParsedProductBatch[]
  meta?: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
  isLoading: boolean
  error: Error | null
}

export interface UseProductBatchResult {
  productBatch: ParsedProductBatch | undefined
  isLoading: boolean
  error: Error | null
}

export interface UseProductBatchMutationsResult {
  createProductBatch: (data: CreateProductBatchRequest) => Promise<ParsedProductBatch>
  updateProductBatch: (id: string, data: UpdateProductBatchRequest) => Promise<ParsedProductBatch>
  deleteProductBatch: (id: string) => Promise<void>
  isLoading: boolean
}

// Form data interface for components
export interface ProductBatchFormData {
  batchNumber: string
  lotNumber?: string
  manufacturingDate: string
  expirationDate: string
  bestBeforeDate?: string
  initialQuantity: number
  currentQuantity: number
  unitCost: number
  status: ProductBatchStatus
  supplierName?: string
  supplierBatch?: string
  qualityNotes?: string
  testResults?: ProductBatchTestResults
  certifications?: ProductBatchCertifications
  metadata?: ProductBatchMetadata
  productId: string
  warehouseId: string
  warehouseLocationId?: string
}

// Status badge configuration
export interface ProductBatchStatusConfig {
  label: string
  variant: 'success' | 'warning' | 'danger' | 'secondary' | 'info'
  icon: string
}

export const QUALITY_GRADE_OPTIONS = [
  { value: 'A', label: 'Grado A - Excelente' },
  { value: 'B', label: 'Grado B - Bueno' },
  { value: 'C', label: 'Grado C - Regular' },
  { value: 'D', label: 'Grado D - Deficiente' }
] as const