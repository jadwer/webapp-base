import { Product, CreateProductData, UpdateProductData } from './product'
import { Unit, CreateUnitData, UpdateUnitData } from './unit'
import { Category, CreateCategoryData, UpdateCategoryData } from './category'
import { Brand, CreateBrandData, UpdateBrandData } from './brand'

export interface PaginationMeta {
  page: {
    currentPage: number
    from: number
    lastPage: number
    perPage: number
    to: number
    total: number
  }
}

export interface JsonApiLinks {
  first: string
  last: string
  prev?: string
  next?: string
}

export interface JsonApiResponse<T> {
  data: T
  meta?: PaginationMeta
  links?: JsonApiLinks
  included?: unknown[]
}

export interface JsonApiError {
  status: string
  code?: string
  title: string
  detail: string
  source?: {
    pointer?: string
    parameter?: string
  }
}

export interface JsonApiErrorResponse {
  errors: JsonApiError[]
}

// Product API Types
export type ProductsResponse = JsonApiResponse<Product[]>
export type ProductResponse = JsonApiResponse<Product>
export type CreateProductRequest = CreateProductData
export type UpdateProductRequest = UpdateProductData

// Unit API Types
export type UnitsResponse = JsonApiResponse<Unit[]>
export type UnitResponse = JsonApiResponse<Unit>
export type CreateUnitRequest = CreateUnitData
export type UpdateUnitRequest = UpdateUnitData

// Category API Types
export type CategoriesResponse = JsonApiResponse<Category[]>
export type CategoryResponse = JsonApiResponse<Category>
export type CreateCategoryRequest = CreateCategoryData
export type UpdateCategoryRequest = UpdateCategoryData

// Brand API Types  
export type BrandsResponse = JsonApiResponse<Brand[]>
export type BrandResponse = JsonApiResponse<Brand>
export type CreateBrandRequest = CreateBrandData
export type UpdateBrandRequest = UpdateBrandData

// Common Query Parameters
export interface QueryParams {
  page?: {
    number?: number
    size?: number
  }
  filter?: Record<string, unknown>
  sort?: string
  include?: string
}