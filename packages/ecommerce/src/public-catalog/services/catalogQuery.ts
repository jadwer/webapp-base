/**
 * CONSULTA INICIAL DEL CATALOGO (puro, sin 'use client')
 *
 * Vive fuera del controller porque los server components la necesitan y Next
 * no permite invocar funciones exportadas desde un modulo 'use client'.
 * Es la UNICA fuente para que un server component prerenderice exactamente lo
 * que el cliente pediria: misma forma de filtros (isActive primero, luego los
 * iniciales), mismo sort, misma paginacion e include, y por tanto la misma
 * clave de SWR (ver createProductsKey).
 */

import type {
  PublicProductFilters,
  PublicProductInclude,
  PublicProductPagination,
  PublicProductSort,
  PublicProductSortField,
  SortDirection
} from '../types/publicProduct'

/** Include fijo del listado del catalogo (productos con galeria y moneda). */
export const CATALOG_PRODUCTS_INCLUDE: PublicProductInclude = 'unit,category,brand,images,currency'

export interface CatalogInitialQueryOptions {
  initialFilters?: Partial<PublicProductFilters>
  initialSortField?: PublicProductSortField
  initialSortDirection?: SortDirection
  initialPageSize?: number
  /** Pagina inicial (?page=N en la URL, para paginacion rastreable). */
  initialPage?: number
}

export interface CatalogQuery {
  filters: PublicProductFilters
  sort: PublicProductSort[]
  pagination: PublicProductPagination
  include: PublicProductInclude
}

export function catalogInitialQuery({
  initialFilters = {},
  initialSortField = 'name',
  initialSortDirection = 'asc',
  initialPageSize = 24,
  initialPage = 1
}: CatalogInitialQueryOptions = {}): CatalogQuery {
  return {
    filters: { isActive: true, ...initialFilters },
    sort: [{ field: initialSortField, direction: initialSortDirection }],
    pagination: { page: normalizePage(initialPage), size: initialPageSize },
    include: CATALOG_PRODUCTS_INCLUDE
  }
}

/** Entero >= 1; cualquier otra cosa (NaN, 0, negativos, texto) es pagina 1. */
export function normalizePage(value: unknown): number {
  const n = typeof value === 'string' ? parseInt(value, 10) : Number(value)
  return Number.isInteger(n) && n >= 1 ? n : 1
}
