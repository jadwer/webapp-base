export interface Brand {
  id: string
  name: string
  description?: string
  slug?: string
  isActive?: boolean
  createdAt: string
  updatedAt: string
  productsCount?: number
}

export interface CreateBrandData {
  name: string
  description?: string
  slug?: string
  isActive?: boolean
}

export type UpdateBrandData = Partial<CreateBrandData>

export interface BrandSortOptions {
  field: 'name' | 'slug' | 'isActive' | 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}
