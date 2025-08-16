/**
 * WAREHOUSE LOCATION TYPES
 * Basado en API responses reales de Fase 1 testing
 */

import type { Warehouse, WarehouseParsed } from './warehouse'

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

// After JSON:API parsing
export interface WarehouseLocationParsed extends Omit<WarehouseLocation, 'warehouse'> {
  // ID fields for form compatibility
  warehouseId?: string
  
  // Relationships (después de JSON:API parsing)
  warehouse?: WarehouseParsed
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
  search?: string // LIKE search en nombre
  code?: string // LIKE search en código
  exactName?: string // Búsqueda exacta por nombre
  exactCode?: string // Búsqueda exacta por código
  warehouseId?: string
  locationType?: string
  isActive?: boolean
  isPickable?: boolean
  isReceivable?: boolean
}

export interface LocationSortOptions {
  field: 'name' | 'code' | 'locationType' | 'priority' | 'createdAt'
  direction: 'asc' | 'desc'
}