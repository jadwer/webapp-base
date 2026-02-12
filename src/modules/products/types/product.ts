import { Unit } from './unit'
import { Category } from './category'
import { Brand } from './brand'
import { ProductImage } from './productImage'

export interface Product {
  id: string
  name: string
  sku?: string
  description?: string
  fullDescription?: string
  price?: number
  cost?: number
  iva: boolean
  isActive: boolean
  imgPath?: string
  datasheetPath?: string
  imgUrl?: string
  datasheetUrl?: string
  unitId: string
  categoryId: string | null
  brandId: string | null
  createdAt: string
  updatedAt: string

  // Relationships
  unit?: Unit
  category?: Category
  brand?: Brand
  images?: ProductImage[]
}

export interface CreateProductData {
  name: string
  sku?: string
  description?: string
  fullDescription?: string
  price?: number
  cost?: number
  iva?: boolean
  isActive?: boolean
  imgPath?: string
  datasheetPath?: string
  unitId: string
  categoryId?: string | null
  brandId?: string | null
}

export type UpdateProductData = Partial<CreateProductData>

export interface ProductFilters {
  name?: string
  sku?: string
  isActive?: boolean
  unitId?: string
  categoryId?: string
  brandId?: string
  brands?: string[]
  categories?: string[]
}

export interface ProductSortOptions {
  field: 'name' | 'price' | 'cost' | 'sku' | 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}