/**
 * PUBLIC CATALOG: FETCHERS PARA COMPONENTES DE SERVIDOR (SEO Bloque 1)
 *
 * Sin 'use client', sin axios, sin React: solo fetch nativo con la cache de
 * Next (`next: { revalidate }`) y las MISMAS transformaciones que usa el
 * cliente, de modo que lo que el servidor inyecta como fallback de SWR es
 * byte a byte lo que el hook habria pedido.
 *
 * Se importa desde `@lwm/ecommerce/server` (subpath propio) para que un
 * server component no arrastre el index del package (hooks y componentes
 * cliente).
 */

import {
  PUBLIC_PRODUCTS_PATH,
  buildPublicProductsQueryString,
  enhancePublicProductResponse,
  enhancePublicProductsResponse,
  type PublicProductsPage
} from './services/publicProductsTransform'
import {
  PUBLIC_CATEGORIES_PATH,
  mapPublicCategories,
  type JsonApiPublicCategory,
  type PublicCategorySummary
} from './services/publicCategoriesTransform'
import type {
  EnhancedPublicProduct,
  PublicProductFilters,
  PublicProductInclude,
  PublicProductPagination,
  PublicProductSort,
  PublicProductsResponse,
  SinglePublicProductResponse
} from './types/publicProduct'

export type { PublicProductsPage, PublicCategorySummary, EnhancedPublicProduct }
export { productPath, isNumericProductSegment } from './utils/productPath'
// La consulta inicial del catalogo se importa desde aqui en server
// components (el index del package arrastra modulos 'use client').
export { catalogInitialQuery, CATALOG_PRODUCTS_INCLUDE } from './services/catalogQuery'
export type { CatalogInitialQueryOptions, CatalogQuery } from './services/catalogQuery'

export interface PublicCatalogServerOptions {
  /** Base del backend; por defecto NEXT_PUBLIC_BACKEND_URL. */
  backendUrl?: string
  /** Segundos de cache de datos en Next (default 300). */
  revalidate?: number
  /** Inyectable para tests. */
  fetchImpl?: typeof fetch
}

export interface PublicCatalogQuery {
  filters?: PublicProductFilters
  sort?: PublicProductSort[]
  pagination?: PublicProductPagination
  include?: PublicProductInclude
}

export class PublicCatalogServerError extends Error {
  constructor(public readonly status: number, public readonly url: string) {
    super(`Catalogo publico: ${url} respondio ${status}`)
    this.name = 'PublicCatalogServerError'
  }
}

function resolveBackendUrl(explicit?: string): string {
  const raw = (explicit ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? '').trim()
  if (!raw) throw new Error('Catalogo publico: falta NEXT_PUBLIC_BACKEND_URL')
  return raw.replace(/\/+$/, '')
}

async function getJson<T>(url: string, options: PublicCatalogServerOptions): Promise<{ status: number; body: T | null }> {
  const fetchImpl = options.fetchImpl ?? fetch
  const init = {
    headers: { Accept: 'application/vnd.api+json' },
    next: { revalidate: options.revalidate ?? 300 }
  } as RequestInit
  const response = await fetchImpl(url, init)
  if (!response.ok) return { status: response.status, body: null }
  return { status: response.status, body: (await response.json()) as T }
}

/** Una pagina del catalogo publico, enriquecida igual que en el cliente. */
export async function fetchPublicCatalogServer(
  query: PublicCatalogQuery = {},
  options: PublicCatalogServerOptions = {}
): Promise<PublicProductsPage> {
  const qs = buildPublicProductsQueryString(query.filters, query.sort, query.pagination, query.include)
  const url = `${resolveBackendUrl(options.backendUrl)}${PUBLIC_PRODUCTS_PATH}${qs ? `?${qs}` : ''}`
  const { status, body } = await getJson<PublicProductsResponse>(url, options)
  if (!body) throw new PublicCatalogServerError(status, url)
  return enhancePublicProductsResponse(body)
}

/** Ficha publica; null si el backend responde 404 (producto inexistente o no publico). */
export async function fetchPublicProductServer(
  id: string,
  include: PublicProductInclude = 'unit,category,brand,images,currency',
  options: PublicCatalogServerOptions = {}
): Promise<EnhancedPublicProduct | null> {
  if (!/^\d+$/.test(id)) return null
  const url = `${resolveBackendUrl(options.backendUrl)}${PUBLIC_PRODUCTS_PATH}/${id}?include=${encodeURIComponent(include)}`
  const { status, body } = await getJson<SinglePublicProductResponse>(url, { revalidate: 3600, ...options })
  if (status === 404) return null
  if (!body) throw new PublicCatalogServerError(status, url)
  return enhancePublicProductResponse(body)
}

/**
 * Ficha publica por slug (SEO Bloque 1b): filter[slug] sobre el indice
 * publico (respeta activo/publico/marca/categoria activas). null si no hay.
 */
export async function fetchPublicProductBySlugServer(
  slug: string,
  include: PublicProductInclude = 'unit,category,brand,images,currency',
  options: PublicCatalogServerOptions = {}
): Promise<EnhancedPublicProduct | null> {
  const clean = slug.trim()
  if (!clean || clean.length > 191 || !/^[a-z0-9-]+$/.test(clean)) return null
  const qs = buildPublicProductsQueryString({ sku: undefined }, undefined, { page: 1, size: 1 }, include)
  const url = `${resolveBackendUrl(options.backendUrl)}${PUBLIC_PRODUCTS_PATH}?filter%5Bslug%5D=${encodeURIComponent(clean)}&${qs}`
  const { status, body } = await getJson<PublicProductsResponse>(url, { revalidate: 3600, ...options })
  if (!body) throw new PublicCatalogServerError(status, url)
  const page = enhancePublicProductsResponse(body)
  return page.products[0] ?? null
}

/** Categorias activas ordenadas por nombre, mismo shape que usePublicCategories. */
export async function fetchPublicCategoriesServer(
  limit = 100,
  options: PublicCatalogServerOptions = {}
): Promise<PublicCategorySummary[]> {
  const url = `${resolveBackendUrl(options.backendUrl)}${PUBLIC_CATEGORIES_PATH}?page%5Bsize%5D=${limit}&sort=name`
  const { status, body } = await getJson<{ data: JsonApiPublicCategory[] }>(url, { revalidate: 3600, ...options })
  if (!body) throw new PublicCatalogServerError(status, url)
  return mapPublicCategories(body.data)
}
