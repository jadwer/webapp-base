/**
 * Sitemap builder (SEO Bloque 0, 2026-09-16).
 *
 * Funciones puras + fetch inyectable para poder testearlas sin Next. Las
 * rutas de app (app/sitemap.ts y app/sitemap.xml/route.ts) solo las cablean.
 *
 * Esquema de ids (Next sirve cada uno en /sitemap/<id>.xml):
 *   id 0        -> home, estaticas y paginas publicadas del page builder
 *   id 1..N     -> productos publicos por lotes de PRODUCT_CHUNK_SIZE
 *                  (id == numero de pagina del endpoint publico)
 * /sitemap.xml es el indice que apunta a todos ellos.
 *
 * Categorias: /productos?categoryId=<id> (canonica desde SEO Bloque 1).
 * Marcas: no existe endpoint publico.
 */

export const PRODUCT_CHUNK_SIZE = 5000
export const SITEMAP_REVALIDATE_SECONDS = 86400

export type ChangeFrequency =
  | 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

export interface SitemapEntry {
  url: string
  lastModified?: string | Date
  changeFrequency?: ChangeFrequency
  priority?: number
}

export interface SitemapSource {
  /** Host canonico con protocolo, sin barra final. */
  host: string
  /** URL base del backend Laravel, sin barra final. */
  backendUrl: string
  /** Rutas estaticas propias de la app (cada tenant define las suyas). */
  staticPaths: string[]
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

interface JsonApiCollection<A> {
  data: Array<{ id: string; attributes: A }>
  meta?: { page?: { total?: number; lastPage?: number } }
}

export function normalizeHost(raw: string | undefined, fallback = 'http://localhost:3000'): string {
  const value = (raw ?? '').trim()
  if (!value) return fallback
  return value.replace(/\/+$/, '')
}

export function absoluteUrl(host: string, path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${host}${cleanPath}`
}

async function fetchJsonApi<A>(url: string, fetchImpl: FetchLike): Promise<JsonApiCollection<A>> {
  const response = await fetchImpl(url, { headers: { Accept: 'application/vnd.api+json' } })
  if (!response.ok) {
    throw new Error(`Sitemap: ${url} respondio ${response.status}`)
  }
  return (await response.json()) as JsonApiCollection<A>
}

export function productChunkCount(total: number, chunkSize = PRODUCT_CHUNK_SIZE): number {
  if (!Number.isFinite(total) || total <= 0) return 0
  return Math.ceil(total / chunkSize)
}

export async function fetchProductTotal(backendUrl: string, fetchImpl: FetchLike): Promise<number> {
  const url = `${backendUrl}/api/public/v1/public-products?fields[public-products]=sku&page[size]=1`
  const body = await fetchJsonApi<{ sku: string }>(url, fetchImpl)
  return body.meta?.page?.total ?? 0
}

export interface ProductRef {
  id: string
  updatedAt?: string
}

export async function fetchProductChunk(
  backendUrl: string,
  page: number,
  fetchImpl: FetchLike,
  chunkSize = PRODUCT_CHUNK_SIZE,
): Promise<ProductRef[]> {
  const url = `${backendUrl}/api/public/v1/public-products?fields[public-products]=sku,updatedAt&page[size]=${chunkSize}&page[number]=${page}`
  const body = await fetchJsonApi<{ sku: string; updatedAt?: string }>(url, fetchImpl)
  return body.data.map((item) => ({ id: item.id, updatedAt: item.attributes.updatedAt }))
}

export interface PublishedPageRef {
  slug: string
  updatedAt?: string
}

export async function fetchPublishedPages(backendUrl: string, fetchImpl: FetchLike): Promise<PublishedPageRef[]> {
  const url = `${backendUrl}/api/v1/pages?filter[status]=published&page[size]=100`
  const body = await fetchJsonApi<{ slug?: string; status?: string; updatedAt?: string }>(url, fetchImpl)
  return body.data
    .filter((item) => item.attributes.status === 'published' && !!item.attributes.slug)
    .map((item) => ({ slug: item.attributes.slug as string, updatedAt: item.attributes.updatedAt }))
}

export interface PublicCategoryRef {
  id: string
  updatedAt?: string
}

/** Categorias activas; su URL canonica en el front es /productos?categoryId=<id> (SEO Bloque 1). */
export async function fetchPublicCategoryRefs(backendUrl: string, fetchImpl: FetchLike): Promise<PublicCategoryRef[]> {
  const url = `${backendUrl}/api/public/v1/public-categories?page[size]=100&sort=name`
  const body = await fetchJsonApi<{ updatedAt?: string }>(url, fetchImpl)
  return body.data.map((item) => ({ id: item.id, updatedAt: item.attributes.updatedAt }))
}

export function categoryEntries(host: string, categories: PublicCategoryRef[]): SitemapEntry[] {
  return categories.map((category) => ({
    url: absoluteUrl(host, `/productos?categoryId=${encodeURIComponent(category.id)}`),
    lastModified: category.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))
}

export function staticEntries(host: string, paths: string[]): SitemapEntry[] {
  return paths.map((path) => ({
    url: absoluteUrl(host, path),
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.8,
  }))
}

export function pageEntries(host: string, pages: PublishedPageRef[]): SitemapEntry[] {
  return pages.map((page) => ({
    url: absoluteUrl(host, `/${page.slug}`),
    lastModified: page.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))
}

export function productEntries(host: string, products: ProductRef[]): SitemapEntry[] {
  return products.map((product) => ({
    url: absoluteUrl(host, `/productos/${product.id}`),
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))
}

/** Conserva la primera aparicion de cada URL (una pagina del builder puede duplicar una ruta estatica). */
export function dedupeEntries(entries: SitemapEntry[]): SitemapEntry[] {
  const seen = new Set<string>()
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false
    seen.add(entry.url)
    return true
  })
}

/** Ids que Next debe generar: 0 (estaticas) + un id por lote de productos. */
export async function listSitemapIds(backendUrl: string, fetchImpl: FetchLike): Promise<Array<{ id: number }>> {
  const total = await fetchProductTotal(backendUrl, fetchImpl)
  const chunks = productChunkCount(total)
  const ids = [{ id: 0 }]
  for (let page = 1; page <= chunks; page += 1) ids.push({ id: page })
  return ids
}

export async function buildSitemap(rawId: number | string, source: SitemapSource, fetchImpl: FetchLike): Promise<SitemapEntry[]> {
  const id = Number(rawId)
  if (!Number.isInteger(id) || id < 0) return []

  if (id === 0) {
    const [pages, categories] = await Promise.all([
      fetchPublishedPages(source.backendUrl, fetchImpl),
      fetchPublicCategoryRefs(source.backendUrl, fetchImpl),
    ])
    return dedupeEntries([
      ...staticEntries(source.host, source.staticPaths),
      ...categoryEntries(source.host, categories),
      ...pageEntries(source.host, pages),
    ])
  }

  const products = await fetchProductChunk(source.backendUrl, id, fetchImpl)
  return productEntries(source.host, products)
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function sitemapIndexXml(host: string, ids: Array<{ id: number }>): string {
  const items = ids
    .map(({ id }) => `  <sitemap><loc>${escapeXml(absoluteUrl(host, `/sitemap/${id}.xml`))}</loc></sitemap>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`
}
