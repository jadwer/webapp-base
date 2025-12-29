export interface Brand {
  id: string
  name: string
  description?: string
  slug?: string
  createdAt: string
  updatedAt: string
  productsCount?: number
}

export interface CreateBrandData {
  name: string
  description?: string
  slug?: string
}

export type UpdateBrandData = Partial<CreateBrandData>

export interface BrandSortOptions {
  field: 'name' | 'slug' | 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}
