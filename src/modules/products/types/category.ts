export interface Category {
  id: string
  name: string
  description?: string
  slug: string
  createdAt: string
  updatedAt: string
  productsCount?: number // TODO: Backend needs to provide this count
}

export interface CreateCategoryData {
  name: string
  description?: string
  slug?: string
}

export type UpdateCategoryData = Partial<CreateCategoryData>

export interface CategorySortOptions {
  field: 'name' | 'slug' | 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}