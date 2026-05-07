import { ProductFilters, ProductSortOptions } from '../types'

export function buildProductsQueryParams(params?: {
  page?: { number?: number; size?: number }
  filters?: ProductFilters
  sort?: ProductSortOptions
  include?: string[]
}): URLSearchParams {
  const searchParams = new URLSearchParams()
  
  // Pagination
  if (params?.page?.number) {
    searchParams.append('page[number]', params.page.number.toString())
  }
  if (params?.page?.size) {
    searchParams.append('page[size]', params.page.size.toString())
  }
  
  // Filters
  if (params?.filters) {
    if (params.filters.name) {
      searchParams.append('filter[name]', params.filters.name)
    }
    if (params.filters.sku) {
      searchParams.append('filter[sku]', params.filters.sku)
    }
    if (params.filters.unitId) {
      searchParams.append('filter[unit_id]', params.filters.unitId)
    }
    if (params.filters.categoryId) {
      searchParams.append('filter[category_id]', params.filters.categoryId)
    }
    if (params.filters.brandId) {
      searchParams.append('filter[brand_id]', params.filters.brandId)
    }
    if (params.filters.brands && params.filters.brands.length > 0) {
      searchParams.append('filter[brands]', params.filters.brands.join(','))
    }
    if (params.filters.categories && params.filters.categories.length > 0) {
      searchParams.append('filter[categories]', params.filters.categories.join(','))
    }
  }
  
  // Sorting
  if (params?.sort) {
    const direction = params.sort.direction === 'desc' ? '-' : ''
    searchParams.append('sort', `${direction}${params.sort.field}`)
  }
  
  // Include relationships
  if (params?.include && params.include.length > 0) {
    searchParams.append('include', params.include.join(','))
  }
  
  return searchParams
}

export function buildGenericQueryParams(params?: {
  page?: { number?: number; size?: number }
  filter?: Record<string, string | number | boolean>
  sort?: { field: string; direction: 'asc' | 'desc' }
}): URLSearchParams {
  const searchParams = new URLSearchParams()
  
  // Pagination
  if (params?.page?.number) {
    searchParams.append('page[number]', params.page.number.toString())
  }
  if (params?.page?.size) {
    searchParams.append('page[size]', params.page.size.toString())
  }
  
  // Filters
  if (params?.filter) {
    Object.keys(params.filter).forEach(key => {
      if (params.filter![key]) {
        searchParams.append(`filter[${key}]`, params.filter![key].toString())
      }
    })
  }
  
  // Sorting
  if (params?.sort) {
    const direction = params.sort.direction === 'desc' ? '-' : ''
    searchParams.append('sort', `${direction}${params.sort.field}`)
  }
  
  return searchParams
}

export function extractPaginationFromMeta(meta: Record<string, unknown> | null | undefined): {
  currentPage: number
  lastPage: number
  total: number
  perPage: number
} | null {
  if (!meta) return null
  
  return {
    currentPage: (meta.currentPage || 1) as number,
    lastPage: (meta.lastPage || 1) as number,
    total: (meta.total || 0) as number,
    perPage: (meta.perPage || 20) as number
  }
}

export function isLastPage(meta: Record<string, unknown> | null | undefined): boolean {
  const pagination = extractPaginationFromMeta(meta)
  if (!pagination) return true
  
  return pagination.currentPage >= pagination.lastPage
}

export function hasNextPage(meta: Record<string, unknown> | null | undefined): boolean {
  return !isLastPage(meta)
}

export function hasPreviousPage(meta: Record<string, unknown> | null | undefined): boolean {
  const pagination = extractPaginationFromMeta(meta)
  if (!pagination) return false
  
  return pagination.currentPage > 1
}

export function buildApiUrl(endpoint: string, queryParams?: URLSearchParams): string {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
  const url = new URL(endpoint, baseUrl)
  
  if (queryParams) {
    queryParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })
  }
  
  return url.toString()
}

export function parseIncludedResources(included: unknown[]): Record<string, unknown> {
  const resources: Record<string, unknown> = {}
  
  if (!included || !Array.isArray(included)) {
    return resources
  }
  
  included.forEach(resource => {
    const typedResource = resource as { type?: string; id?: string; attributes?: Record<string, unknown> }
    if (typedResource.type && typedResource.id) {
      const key = `${typedResource.type}:${typedResource.id}`
      resources[key] = typedResource.attributes || typedResource
    }
  })
  
  return resources
}

export function resolveRelationship(
  relationshipData: { type?: string; id?: string } | null | undefined, 
  included: Record<string, unknown>
): unknown | null {
  if (!relationshipData?.type || !relationshipData?.id) {
    return null
  }
  
  const key = `${relationshipData.type}:${relationshipData.id}`
  return included[key] || null
}