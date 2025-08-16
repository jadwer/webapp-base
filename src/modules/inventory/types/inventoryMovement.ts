/**
 * INVENTORY MOVEMENT TYPES
 * Basado en API responses reales de Fase 1 testing
 */

import type { Warehouse, WarehouseParsed } from './warehouse'
import type { WarehouseLocation, WarehouseLocationParsed } from './location'

// Strong typing for movement batch info
export interface MovementBatchInfo {
  expiry_date?: string
  batch_number?: string
  manufacturing_date?: string
  lot_number?: string
  supplier_id?: string
  quality_status?: 'approved' | 'rejected' | 'pending'
  inspector_notes?: string
  temperature_log?: number[]
  humidity_log?: number[]
  customFields?: Record<string, string | number | boolean>
}

// Strong typing for movement metadata
export interface MovementMetadata {
  notes?: string
  source?: string
  temperature?: number
  humidity?: number
  reason?: string
  condition?: string
  document_references?: string[]
  approval_workflow?: {
    status: 'pending' | 'approved' | 'rejected'
    approver_id?: string
    approval_date?: string
    rejection_reason?: string
  }
  audit_trail?: {
    created_by: string
    modified_by?: string
    ip_address?: string
    user_agent?: string
  }
  customFields?: Record<string, string | number | boolean>
}

// Product type básico (existe en products module)
interface ProductBasic {
  id: string
  name: string
  sku: string
  price: number
  cost: number
}

// User type básico (existe en auth module)
interface UserBasic {
  id: string
  name: string
  email: string
}

export interface InventoryMovement {
  id: string
  movementType: 'entry' | 'exit' | 'transfer' | 'adjustment'
  referenceType: string
  referenceId?: number
  movementDate: string
  description?: string
  quantity: number
  unitCost?: number
  totalValue?: number
  status: string
  previousStock?: number
  newStock?: number
  batchInfo?: MovementBatchInfo
  metadata?: MovementMetadata
  createdAt: string
  updatedAt: string
  
  // ID fields for form compatibility
  productId?: string
  warehouseId?: string
  locationId?: string
  destinationWarehouseId?: string
  destinationLocationId?: string
  userId?: string
  
  // Relationships
  product?: ProductBasic
  warehouse?: Warehouse
  location?: WarehouseLocation
  destinationWarehouse?: Warehouse
  destinationLocation?: WarehouseLocation
  user?: UserBasic
}

// After JSON:API parsing
export interface InventoryMovementParsed extends Omit<InventoryMovement, 'warehouse' | 'location' | 'destinationWarehouse' | 'destinationLocation'> {
  // Relationships (después de JSON:API parsing)
  warehouse?: WarehouseParsed
  location?: WarehouseLocationParsed
  destinationWarehouse?: WarehouseParsed
  destinationLocation?: WarehouseLocationParsed
}

export interface CreateMovementData {
  movementType: 'entry' | 'exit' | 'transfer' | 'adjustment'
  referenceType: string
  referenceId?: number
  movementDate: string
  description?: string
  quantity: number
  unitCost?: number
  totalValue?: number
  status: string
  previousStock?: number
  newStock?: number
  batchInfo?: MovementBatchInfo
  metadata?: MovementMetadata
  
  // Relationship IDs for creation
  productId: string
  warehouseId: string
  locationId?: string
  destinationWarehouseId?: string
  destinationLocationId?: string
  userId?: string
}

export interface UpdateMovementData {
  movementType?: 'entry' | 'exit' | 'transfer' | 'adjustment'
  referenceType?: string
  referenceId?: number
  movementDate?: string
  description?: string
  quantity?: number
  unitCost?: number
  totalValue?: number
  status?: string
  previousStock?: number
  newStock?: number
  batchInfo?: MovementBatchInfo
  metadata?: MovementMetadata
}

export interface MovementFilters {
  search?: string
  movementType?: 'entry' | 'exit' | 'transfer' | 'adjustment'
  referenceType?: string
  referenceId?: string
  status?: string
  productId?: string
  warehouseId?: string
  destinationWarehouseId?: string
  userId?: string
  movementDate?: string
  dateFrom?: string
  dateTo?: string
}

export interface MovementSortOptions {
  field: 'movementDate' | 'movementType' | 'quantity' | 'totalValue' | 'status' | 'createdAt'
  direction: 'asc' | 'desc'
}