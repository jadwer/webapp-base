/**
 * PUBLIC PRODUCTS TRANSFORM (puro, sin axios ni React)
 *
 * Extraido de PublicProductsService (SEO Bloque 1, 2026-09) para que el
 * mismo armado de query y la misma resolucion de relaciones JSON:API sirvan
 * tanto al cliente (axios + SWR) como a los componentes de servidor (fetch
 * nativo con cache de Next). Si cambia como se construye una URL o como se
 * enriquece un producto, cambia AQUI y ambos lados lo heredan.
 */

import type {
  PublicProduct,
  PublicProductFilters,
  PublicProductSort,
  PublicProductPagination,
  PublicProductInclude,
  PublicProductsQueryParams,
  PublicProductsResponse,
  SinglePublicProductResponse,
  EnhancedPublicProduct,
  PublicUnit,
  PublicCategory,
  PublicBrand,
  PublicCurrency,
  PublicProductImage
} from '../types/publicProduct'

export const PUBLIC_PRODUCTS_PATH = '/api/public/v1/public-products'

export type PublicIncluded = (PublicUnit | PublicCategory | PublicBrand | PublicCurrency | PublicProductImage)[]

export interface PublicProductsPage {
  products: EnhancedPublicProduct[]
  meta: PublicProductsResponse['meta']
  links: PublicProductsResponse['links']
}

/**
 * Transform filters to JSON:API query parameters
 */
export function buildPublicProductsQueryParams(
  filters?: PublicProductFilters,
  sort?: PublicProductSort[],
  pagination?: PublicProductPagination,
  include?: PublicProductInclude
): PublicProductsQueryParams {
  const params: PublicProductsQueryParams = {}

  if (filters) {
    if (filters.search) {
      params['filter[search]'] = filters.search
    }

    // Multi-value filters: backend maps plural params (brands/categories/units)
    // to WhereIn with comma delimiter. Singular *_id params only accept a
    // single value, so we always send the plural form (works for 1..n values).
    if (filters.categoryId) {
      params['filter[categories]'] = Array.isArray(filters.categoryId)
        ? filters.categoryId.join(',')
        : filters.categoryId
    }

    if (filters.brandId) {
      params['filter[brands]'] = Array.isArray(filters.brandId)
        ? filters.brandId.join(',')
        : filters.brandId
    }

    if (filters.unitId) {
      params['filter[units]'] = Array.isArray(filters.unitId)
        ? filters.unitId.join(',')
        : filters.unitId
    }

    if (filters.priceMin !== undefined) {
      params['filter[price_min]'] = filters.priceMin.toString()
    }

    if (filters.priceMax !== undefined) {
      params['filter[price_max]'] = filters.priceMax.toString()
    }

    // is_active no lo soporta la API publica (solo devuelve activos)

    if (filters.isOnSale !== undefined) {
      params['filter[is_on_sale]'] = filters.isOnSale ? '1' : '0'
    }

    if (filters.sku) {
      params['filter[sku]'] = filters.sku
    }
  }

  if (sort && sort.length > 0) {
    params.sort = sort
      .map(s => s.direction === 'desc' ? `-${s.field}` : s.field)
      .join(',')
  }

  if (pagination) {
    if (pagination.page !== undefined) {
      params['page[number]'] = pagination.page.toString()
    }
    if (pagination.size !== undefined) {
      params['page[size]'] = pagination.size.toString()
    }
  }

  if (include) {
    params.include = include
  }

  return params
}

/** Query string lista para pegar a una URL (misma codificacion que axios: corchetes sin escapar no hacen falta). */
export function buildPublicProductsQueryString(
  filters?: PublicProductFilters,
  sort?: PublicProductSort[],
  pagination?: PublicProductPagination,
  include?: PublicProductInclude
): string {
  const params = buildPublicProductsQueryParams(filters, sort, pagination, include)
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  return search.toString()
}

/**
 * Format price for display
 */
export function formatPublicPrice(price: number | null | undefined, currencyCode: string = 'MXN'): string {
  if (price === null || price === undefined) {
    return 'Precio no disponible'
  }

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2
  }).format(price)
}

/**
 * Resolve relationships from included resources
 */
export function enhancePublicProduct(product: PublicProduct, included?: PublicIncluded): EnhancedPublicProduct {
  const enhanced: EnhancedPublicProduct = {
    ...product,
    displayName: product.attributes.name,
    displayPrice: formatPublicPrice(product.attributes.price),
    displayCurrency: 'MXN',
    displayCategory: 'Sin categoría',
    displayBrand: 'Sin marca',
    displayUnit: 'Sin unidad'
  }

  if (!included) return enhanced

  if (product.relationships.currency?.data) {
    const curr = included.find(
      item => item.type === 'currencies' && item.id === product.relationships.currency?.data?.id
    ) as PublicCurrency | undefined

    if (curr) {
      enhanced.currency = curr
      enhanced.displayCurrency = curr.attributes.code
      enhanced.displayPrice = formatPublicPrice(product.attributes.price, curr.attributes.code)
    }
  }

  if (product.relationships.unit?.data) {
    const unit = included.find(
      item => item.type === 'units' && item.id === product.relationships.unit.data?.id
    ) as PublicUnit | undefined

    if (unit) {
      enhanced.unit = unit
      enhanced.displayUnit = unit.attributes.abbreviation || unit.attributes.name
    }
  }

  if (product.relationships.category?.data) {
    const category = included.find(
      item => item.type === 'categories' && item.id === product.relationships.category.data?.id
    ) as PublicCategory | undefined

    if (category) {
      enhanced.category = category
      enhanced.displayCategory = category.attributes.name
    }
  }

  if (product.relationships.brand?.data) {
    const brand = included.find(
      item => item.type === 'brands' && item.id === product.relationships.brand.data?.id
    ) as PublicBrand | undefined

    if (brand) {
      enhanced.brand = brand
      enhanced.displayBrand = brand.attributes.name
    }
  }

  if (product.relationships.images?.data) {
    const imageIds = new Set(product.relationships.images.data.map(r => r.id))
    const images = included
      .filter((item): item is PublicProductImage => item.type === 'product-images' && imageIds.has(item.id))
      .sort((a, b) => (a.attributes.sortOrder ?? 0) - (b.attributes.sortOrder ?? 0))
    if (images.length > 0) {
      enhanced.galleryImages = images
    }
  }

  return enhanced
}

/** JSON:API pagination wraps meta under meta.page */
export function normalizePublicProductsMeta(rawMeta: unknown): PublicProductsResponse['meta'] {
  const meta = (rawMeta ?? {}) as PublicProductsResponse['meta'] & { page?: PublicProductsResponse['meta'] }
  return meta.page ?? meta
}

export function enhancePublicProductsResponse(body: PublicProductsResponse): PublicProductsPage {
  return {
    products: (body.data ?? []).map(product => enhancePublicProduct(product, body.included)),
    meta: normalizePublicProductsMeta(body.meta),
    links: body.links
  }
}

export function enhancePublicProductResponse(body: SinglePublicProductResponse): EnhancedPublicProduct {
  return enhancePublicProduct(body.data, body.included)
}
