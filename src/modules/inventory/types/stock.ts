/**
 * STOCK TYPES
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

export interface Stock {
  id: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  minimumStock?: number
  maximumStock?: number
  reorderPoint?: number
  unitCost?: number
  totalValue?: number
  status: string
  lastMovementDate?: string
  lastMovementType?: string
  batchInfo?: any
  metadata?: any
  createdAt: string
  updatedAt: string
  
  // Relationships
  product?: ProductBasic
  warehouse?: Warehouse
  location?: WarehouseLocation
}

export interface CreateStockData {
  quantity: number
  reservedQuantity?: number
  availableQuantity: number
  minimumStock?: number
  maximumStock?: number
  reorderPoint?: number
  unitCost?: number
  totalValue?: number
  status: string
  batchInfo?: any
  metadata?: any
  
  // Relationship IDs for creation
  productId: string
  warehouseId: string
  locationId: string
}

export interface UpdateStockData {
  quantity?: number
  reservedQuantity?: number
  availableQuantity?: number
  minimumStock?: number
  maximumStock?: number
  reorderPoint?: number
  unitCost?: number
  totalValue?: number
  status?: string
  batchInfo?: any
  metadata?: any
}

export interface StockFilters {
  search?: string
  productId?: string
  warehouseId?: string
  locationId?: string
  status?: string
  lowStock?: boolean // quantity <= minimumStock
  outOfStock?: boolean // quantity <= 0
  minQuantity?: number
  maxQuantity?: number
}

export interface StockSortOptions {
  field: 'quantity' | 'availableQuantity' | 'unitCost' | 'totalValue' | 'status' | 'createdAt'
  direction: 'asc' | 'desc'
}