export interface Category {
  id: string
  name: string
  description?: string
  slug?: string
  isActive?: boolean
  createdAt: string
  updatedAt: string
  productsCount?: number
}

export interface CreateCategoryData {
  name: string
  description?: string
  slug?: string
  isActive?: boolean
}

export type UpdateCategoryData = Partial<CreateCategoryData>

export interface CategorySortOptions {
  field: 'name' | 'slug' | 'isActive' | 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}
