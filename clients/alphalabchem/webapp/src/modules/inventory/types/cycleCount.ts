/**
 * CycleCount Type Definitions
 *
 * Complete TypeScript types for CycleCount module following
 * the established pattern from products and inventory modules.
 *
 * Backend: Modules/Inventory/app/Models/CycleCount.php
 * API: /api/v1/cycle-counts
 */

// CycleCount status enum
export type CycleCountStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

// ABC Classification for inventory (based on value/frequency)
export type ABCClass = 'A' | 'B' | 'C'

// Base CycleCount interface
export interface CycleCount {
  id: string
  countNumber: string
  scheduledDate: string // ISO date string
  completedDate?: string | null // ISO date string
  status: CycleCountStatus
  systemQuantity: number
  countedQuantity?: number | null
  varianceQuantity?: number | null
  varianceValue?: number | null
  abcClass?: ABCClass | null
  notes?: string | null
  metadata?: CycleCountMetadata | null
  // Computed fields (read-only)
  hasVariance: boolean
  variancePercentage?: number | null
  createdAt: string
  updatedAt: string

  // Relationships
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
  product?: {
    id: string
    name: string
    sku: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
  } | null
  countedBy?: {
    id: string
    name: string
    email: string
  } | null
}

// Metadata interface (JSON field)
export interface CycleCountMetadata {
  adjustmentMovementId?: number
  countingMethod?: string
  locationVerified?: boolean
  [key: string]: unknown
}

// Create CycleCount request interface
export interface CreateCycleCountRequest {
  warehouseId: string
  productId: string
  scheduledDate: string
  status: CycleCountStatus
  warehouseLocationId?: string
  systemQuantity?: number
  countedQuantity?: number
  assignedTo?: string
  abcClass?: ABCClass
  notes?: string
  metadata?: CycleCountMetadata
}

// Update CycleCount request interface
export interface UpdateCycleCountRequest {
  warehouseId?: string
  productId?: string
  scheduledDate?: string
  completedDate?: string
  status?: CycleCountStatus
  warehouseLocationId?: string
  systemQuantity?: number
  countedQuantity?: number
  varianceQuantity?: number
  varianceValue?: number
  assignedTo?: string
  countedBy?: string
  abcClass?: ABCClass
  notes?: string
  metadata?: CycleCountMetadata
}

// Parsed CycleCount for UI (camelCase)
export interface ParsedCycleCount {
  id: string
  countNumber: string
  scheduledDate: string
  completedDate?: string | null
  status: CycleCountStatus
  systemQuantity: number
  countedQuantity?: number | null
  varianceQuantity?: number | null
  varianceValue?: number | null
  abcClass?: ABCClass | null
  notes?: string | null
  metadata?: CycleCountMetadata | null
  hasVariance: boolean
  variancePercentage?: number | null
  createdAt: string
  updatedAt: string
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
  product?: {
    id: string
    name: string
    sku: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
  } | null
  countedBy?: {
    id: string
    name: string
    email: string
  } | null
}

// Filters interface
export interface CycleCountFilters {
  search?: string
  status?: CycleCountStatus[]
  abcClass?: ABCClass[]
  warehouseId?: string
  productId?: string
  assignedTo?: string
  scheduledAfter?: string // ISO date
  scheduledBefore?: string // ISO date
  hasVariance?: boolean
  overdue?: boolean
}

// Sort options interface
export interface CycleCountSortOptions {
  field: 'countNumber' | 'scheduledDate' | 'completedDate' | 'status' | 'systemQuantity' | 'varianceQuantity' | 'abcClass' | 'createdAt'
  direction: 'asc' | 'desc'
}

// API response types
export interface CycleCountApiResponse {
  data: CycleCount[]
  meta?: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
}

export interface SingleCycleCountApiResponse {
  data: CycleCount
}

// Hook return types
export interface UseCycleCountsResult {
  cycleCounts: ParsedCycleCount[]
  meta?: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
  isLoading: boolean
  error: Error | null
}

export interface UseCycleCountResult {
  cycleCount: ParsedCycleCount | undefined
  isLoading: boolean
  error: Error | null
}

export interface UseCycleCountMutationsResult {
  createCycleCount: (data: CreateCycleCountRequest) => Promise<ParsedCycleCount>
  updateCycleCount: (id: string, data: UpdateCycleCountRequest) => Promise<ParsedCycleCount>
  deleteCycleCount: (id: string) => Promise<void>
  startCount: (id: string) => Promise<ParsedCycleCount>
  recordCount: (id: string, countedQuantity: number, notes?: string) => Promise<ParsedCycleCount>
  cancelCount: (id: string, reason?: string) => Promise<ParsedCycleCount>
  isLoading: boolean
}

// Form data interface for components
export interface CycleCountFormData {
  warehouseId: string
  productId: string
  scheduledDate: string
  status: CycleCountStatus
  warehouseLocationId?: string
  systemQuantity?: number
  countedQuantity?: number
  assignedTo?: string
  abcClass?: ABCClass
  notes?: string
}

// Record count form data
export interface RecordCountFormData {
  countedQuantity: number
  notes?: string
}

// Status badge configuration
export interface CycleCountStatusConfig {
  label: string
  variant: 'success' | 'warning' | 'danger' | 'secondary' | 'primary'
  icon: string
}

export const CYCLE_COUNT_STATUS_CONFIG: Record<CycleCountStatus, CycleCountStatusConfig> = {
  scheduled: {
    label: 'Programado',
    variant: 'primary',
    icon: 'bi-calendar-event'
  },
  in_progress: {
    label: 'En Progreso',
    variant: 'warning',
    icon: 'bi-hourglass-split'
  },
  completed: {
    label: 'Completado',
    variant: 'success',
    icon: 'bi-check-circle-fill'
  },
  cancelled: {
    label: 'Cancelado',
    variant: 'secondary',
    icon: 'bi-x-circle-fill'
  }
}

// ABC Class badge configuration
export interface ABCClassConfig {
  label: string
  variant: 'danger' | 'warning' | 'secondary'
  description: string
  frequency: string
}

export const ABC_CLASS_CONFIG: Record<ABCClass, ABCClassConfig> = {
  A: {
    label: 'Clase A',
    variant: 'danger',
    description: 'Alto valor - Conteo mensual',
    frequency: 'Mensual (30 dias)'
  },
  B: {
    label: 'Clase B',
    variant: 'warning',
    description: 'Valor medio - Conteo trimestral',
    frequency: 'Trimestral (90 dias)'
  },
  C: {
    label: 'Clase C',
    variant: 'secondary',
    description: 'Bajo valor - Conteo anual',
    frequency: 'Anual (365 dias)'
  }
}

// Constants
export const CYCLE_COUNT_STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Programado' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' }
] as const

export const ABC_CLASS_OPTIONS = [
  { value: 'A', label: 'Clase A - Alto Valor' },
  { value: 'B', label: 'Clase B - Valor Medio' },
  { value: 'C', label: 'Clase C - Bajo Valor' }
] as const
