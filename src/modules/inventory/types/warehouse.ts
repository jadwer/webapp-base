/**
 * WAREHOUSE TYPES
 * Basado en API responses reales de Fase 1 testing
 */

export interface WarehouseAttributes {
  name: string
  slug: string
  description?: string
  code: string
  warehouseType: 'main' | 'secondary' | 'distribution' | 'returns'
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  phone?: string
  email?: string
  managerName?: string
  maxCapacity?: number
  capacityUnit?: string
  operatingHours?: string
  metadata?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Warehouse {
  id: string
  type: 'warehouses'
  attributes: WarehouseAttributes
}

// After JSON:API parsing
export interface WarehouseParsed extends WarehouseAttributes {
  id: string
  type: 'warehouses'
}

export interface CreateWarehouseData {
  name: string
  slug: string
  description?: string
  code: string
  warehouseType: 'main' | 'secondary' | 'distribution' | 'returns'
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  phone?: string
  email?: string
  managerName?: string
  maxCapacity?: number
  capacityUnit?: string
  operatingHours?: string
  metadata?: string
  isActive: boolean
}

export interface UpdateWarehouseData {
  name?: string
  slug?: string
  description?: string
  code?: string
  warehouseType?: 'main' | 'secondary' | 'distribution' | 'returns'
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  phone?: string
  email?: string
  managerName?: string
  maxCapacity?: number
  capacityUnit?: string
  operatingHours?: string
  metadata?: string
  isActive?: boolean
}

export interface WarehouseFilters {
  search?: string // LIKE search en nombre
  code?: string // LIKE search en código
  exactName?: string // Búsqueda exacta por nombre
  exactCode?: string // Búsqueda exacta por código
  warehouseType?: string
  isActive?: boolean
}

export interface WarehouseSortOptions {
  field: 'name' | 'code' | 'warehouseType' | 'city' | 'createdAt'
  direction: 'asc' | 'desc'
}

export interface PaginationParams {
  page?: number
  size?: number
}

export interface ApiMeta {
  page: {
    currentPage: number
    from: number
    lastPage: number
    perPage: number
    to: number
    total: number
  }
}

export interface ApiResponse<T> {
  data: T[]
  meta: ApiMeta
  links?: {
    first?: string
    last?: string
    prev?: string
    next?: string
  }
  included?: any[]
}