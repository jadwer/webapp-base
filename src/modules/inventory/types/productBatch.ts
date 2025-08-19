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

// ProductBatch status enum
export type ProductBatchStatus = 
  | 'active'
  | 'quarantine'
  | 'expired'
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

// Filters interface
export interface ProductBatchFilters {
  search?: string
  status?: ProductBatchStatus[]
  productId?: string
  warehouseId?: string
  warehouseLocationId?: string
  expiresAfter?: string // ISO date
  expiresBefore?: string // ISO date
  manufacturedAfter?: string // ISO date
  manufacturedBefore?: string // ISO date
  supplierName?: string
  minQuantity?: number
  maxQuantity?: number
  hasTestResults?: boolean
  hasCertifications?: boolean
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

export const PRODUCT_BATCH_STATUS_CONFIG: Record<ProductBatchStatus, ProductBatchStatusConfig> = {
  active: {
    label: 'Activo',
    variant: 'success',
    icon: 'bi-check-circle-fill'
  },
  quarantine: {
    label: 'Cuarentena',
    variant: 'warning',
    icon: 'bi-shield-exclamation'
  },
  expired: {
    label: 'Vencido',
    variant: 'danger',
    icon: 'bi-exclamation-triangle-fill'
  },
  recalled: {
    label: 'Retirado',
    variant: 'danger',
    icon: 'bi-x-circle-fill'
  },
  consumed: {
    label: 'Consumido',
    variant: 'secondary',
    icon: 'bi-archive-fill'
  }
}

// Constants
export const PRODUCT_BATCH_STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'quarantine', label: 'Cuarentena' },
  { value: 'expired', label: 'Vencido' },
  { value: 'recalled', label: 'Retirado' },
  { value: 'consumed', label: 'Consumido' }
] as const

export const QUALITY_GRADE_OPTIONS = [
  { value: 'A', label: 'Grado A - Excelente' },
  { value: 'B', label: 'Grado B - Bueno' },
  { value: 'C', label: 'Grado C - Regular' },
  { value: 'D', label: 'Grado D - Deficiente' }
] as const