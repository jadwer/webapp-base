/**
 * INVENTORY MOVEMENT TYPES
 * Basado en API responses reales de Fase 1 testing
 */

import type { Warehouse } from './warehouse'
import type { WarehouseLocation } from './location'

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
  batchInfo?: {
    expiry_date?: string
    batch_number?: string
    manufacturing_date?: string
    [key: string]: any
  }
  metadata?: {
    notes?: string
    source?: string
    temperature?: number
    humidity?: number
    reason?: string
    condition?: string
    [key: string]: any
  }
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
  batchInfo?: {
    expiry_date?: string
    batch_number?: string
    manufacturing_date?: string
    [key: string]: any
  }
  metadata?: {
    notes?: string
    source?: string
    temperature?: number
    humidity?: number
    reason?: string
    condition?: string
    [key: string]: any
  }
  
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
  batchInfo?: {
    expiry_date?: string
    batch_number?: string
    manufacturing_date?: string
    [key: string]: any
  }
  metadata?: {
    notes?: string
    source?: string
    temperature?: number
    humidity?: number
    reason?: string
    condition?: string
    [key: string]: any
  }
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