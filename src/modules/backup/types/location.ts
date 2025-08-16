/**
 * WAREHOUSE LOCATION TYPES
 * Basado en API responses reales de Fase 1 testing
 */

import type { Warehouse } from './warehouse'

export interface WarehouseLocation {
  id: string
  name: string
  code: string
  description?: string
  locationType: string
  aisle?: string
  rack?: string
  shelf?: string
  level?: string
  position?: string
  barcode?: string
  maxWeight?: number
  maxVolume?: number
  dimensions?: string
  isActive: boolean
  isPickable: boolean
  isReceivable: boolean
  priority: number
  metadata?: any
  createdAt: string
  updatedAt: string
  
  // Relationships
  warehouse?: Warehouse
}

export interface CreateLocationData {
  name: string
  code: string
  description?: string
  locationType: string
  aisle?: string
  rack?: string
  shelf?: string
  level?: string
  position?: string
  barcode?: string
  maxWeight?: number
  maxVolume?: number
  dimensions?: string
  isActive: boolean
  isPickable: boolean
  isReceivable: boolean
  priority?: number
  metadata?: any
  
  // Relationship IDs for creation
  warehouseId: string
}

export interface UpdateLocationData {
  name?: string
  code?: string
  description?: string
  locationType?: string
  aisle?: string
  rack?: string
  shelf?: string
  level?: string
  position?: string
  barcode?: string
  maxWeight?: number
  maxVolume?: number
  dimensions?: string
  isActive?: boolean
  isPickable?: boolean
  isReceivable?: boolean
  priority?: number
  metadata?: any
}

export interface LocationFilters {
  search?: string
  warehouseId?: string
  locationType?: string
  isActive?: boolean
  isPickable?: boolean
  isReceivable?: boolean
  aisle?: string
  rack?: string
}

export interface LocationSortOptions {
  field: 'name' | 'code' | 'locationType' | 'priority' | 'createdAt'
  direction: 'asc' | 'desc'
}