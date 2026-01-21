/**
 * PUBLIC PRODUCT TYPES
 * Complete TypeScript definitions for Public Products following JSON:API 5.x specification
 * API Endpoint: /api/public/v1/public-products
 */

// Core Public Product Entity
export interface PublicProduct {
  id: string
  type: 'public-products'
  attributes: {
    name: string
    description: string | null
    price: number | null
    sku: string | null
    barcode: string | null
    imageUrl: string | null
    isActive: boolean
    // Offer/Sale fields
    compareAtPrice: number | null
    isOnSale: boolean
    saleStartsAt: string | null
    saleEndsAt: string | null
    saleBadge: string | null
    createdAt: string
    updatedAt: string
    // Additional computed fields
    formattedPrice?: string
    priceRange?: string
  }
  relationships: {
    unit: {
      data: {
        id: string
        type: 'units'
      } | null
    }
    category: {
      data: {
        id: string
        type: 'categories'
      } | null
    }
    brand: {
      data: {
        id: string
        type: 'brands'
      } | null
    }
  }
}

// Related Entities (Included Resources)
export interface PublicUnit {
  id: string
  type: 'units'
  attributes: {
    name: string
    abbreviation: string | null
    description: string | null
  }
}

export interface PublicCategory {
  id: string
  type: 'categories'
  attributes: {
    name: string
    description: string | null
    slug: string | null
    imageUrl: string | null
  }
}

export interface PublicBrand {
  id: string
  type: 'brands'
  attributes: {
    name: string
    description: string | null
    slug: string | null
    logoUrl: string | null
    websiteUrl: string | null
  }
}

// Filter Parameters
export interface PublicProductFilters {
  // Search across multiple fields
  search?: string
  
  // Category filtering
  categoryId?: string | string[]
  categorySlug?: string | string[]
  
  // Brand filtering
  brandId?: string | string[]
  brandSlug?: string | string[]
  
  // Unit filtering
  unitId?: string | string[]
  
  // Price range filtering
  priceMin?: number
  priceMax?: number
  
  // Product status
  isActive?: boolean

  // Offer/Sale filtering
  isOnSale?: boolean

  // SKU filtering
  sku?: string
  
  // Barcode filtering
  barcode?: string
  
  // Date range filtering
  createdAfter?: string
  createdBefore?: string
  updatedAfter?: string
  updatedBefore?: string
}

// Sorting Options
export type PublicProductSortField = 
  | 'name'
  | 'price'
  | 'created_at'
  | 'updated_at'
  | 'category.name'
  | 'brand.name'
  | 'unit.name'

export type SortDirection = 'asc' | 'desc'

export interface PublicProductSort {
  field: PublicProductSortField
  direction: SortDirection
}

// Pagination Parameters
export interface PublicProductPagination {
  page?: number
  size?: number
  limit?: number
  offset?: number
}

// Include Parameters (for relationships)
export type PublicProductInclude = 
  | 'unit'
  | 'category'
  | 'brand'
  | 'unit,category'
  | 'unit,brand'
  | 'category,brand'
  | 'unit,category,brand'

// Complete Query Parameters
export interface PublicProductsQueryParams {
  // Filtering
  'filter[search]'?: string
  'filter[category_id]'?: string
  'filter[category_slug]'?: string
  'filter[brand_id]'?: string
  'filter[brand_slug]'?: string
  'filter[unit_id]'?: string
  'filter[price_min]'?: string
  'filter[price_max]'?: string
  'filter[is_active]'?: string
  'filter[is_on_sale]'?: string
  'filter[sku]'?: string
  'filter[barcode]'?: string
  'filter[created_after]'?: string
  'filter[created_before]'?: string
  'filter[updated_after]'?: string
  'filter[updated_before]'?: string
  
  // Sorting
  sort?: string
  
  // Pagination
  'page[number]'?: string
  'page[size]'?: string
  
  // Includes
  include?: string
}

// API Response Types
export interface PublicProductsResponse {
  data: PublicProduct[]
  included?: (PublicUnit | PublicCategory | PublicBrand)[]
  meta: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
    from: number | null
    to: number | null
    path: string
  }
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}

export interface SinglePublicProductResponse {
  data: PublicProduct
  included?: (PublicUnit | PublicCategory | PublicBrand)[]
}

// Error Types
export interface PublicProductError {
  code: string
  title: string
  detail: string
  source?: {
    pointer?: string
    parameter?: string
  }
}

export interface PublicProductErrorResponse {
  errors: PublicProductError[]
}

// Search/Filter State for UI Components
export interface PublicCatalogFilters {
  search: string
  selectedCategories: string[]
  selectedBrands: string[]
  selectedUnits: string[]
  priceRange: {
    min: number | null
    max: number | null
  }
  sortBy: PublicProductSortField
  sortDirection: SortDirection
  page: number
  pageSize: number
}

// View Modes for Product Display
export type ProductViewMode = 'grid' | 'list' | 'cards' | 'compact' | 'showcase'

// Product Card Display Properties
export interface ProductDisplayProps {
  showPrice: boolean
  showDescription: boolean
  showUnit: boolean
  showCategory: boolean
  showBrand: boolean
  showSku: boolean
  imageSize: 'small' | 'medium' | 'large'
  layout: 'horizontal' | 'vertical'
}

// Utility Types for Components
export interface EnhancedPublicProduct extends PublicProduct {
  // Resolved relationships for easier access
  unit?: PublicUnit
  category?: PublicCategory
  brand?: PublicBrand
  
  // Computed display properties
  displayName: string
  displayPrice: string
  displayCategory: string
  displayBrand: string
  displayUnit: string
}

// Hook Return Types
export interface UsePublicProductsResult {
  products: EnhancedPublicProduct[]
  meta: PublicProductsResponse['meta']
  links: PublicProductsResponse['links']
  isLoading: boolean
  error: Error | null
  mutate: () => void
}

export interface UsePublicProductResult {
  product: EnhancedPublicProduct | null
  isLoading: boolean
  error: Error | null
  mutate: () => void
}

// Filter Options for Dropdowns
export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface FilterOptions {
  categories: FilterOption[]
  brands: FilterOption[]
  units: FilterOption[]
  priceRanges: {
    min: number
    max: number
    step: number
  }
}