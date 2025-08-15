/**
 * STOCK TYPES
 * Basado en API responses reales de Fase 1 testing
 */

import type { WarehouseParsed } from './warehouse'
import type { WarehouseLocationParsed } from './location'

// Product type básico después de JSON:API parsing
interface ProductParsed {
  id: string
  type: 'products'
  name: string
  sku: string
  description?: string
  price: number
  cost: number
  // Otros campos que pueda tener
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
  currency?: 'MXN' | 'USD' | 'CAD' | 'EUR' // Multi-currency support
  status: string
  lastMovementDate?: string
  lastMovementType?: string
  batchInfo?: any
  metadata?: any
  createdAt: string
  updatedAt: string
  
  // Relationships (después de JSON:API parsing)
  product?: ProductParsed
  warehouse?: WarehouseParsed
  location?: WarehouseLocationParsed
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