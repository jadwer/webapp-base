/**
 * PUBLIC CATEGORIES TRANSFORM (puro, sin axios ni React)
 *
 * Mapeo JSON:API -> {id, name, slug, ...} compartido por el hook de cliente
 * (usePublicCategories) y por el fetcher de servidor (server.ts).
 */

export const PUBLIC_CATEGORIES_PATH = '/api/public/v1/public-categories'

/**
 * Categoria "plana" para navegacion y facetas. Se llama Summary para no
 * chocar con PublicCategory (el recurso JSON:API con type/attributes que
 * viaja incluido en los productos).
 */
export interface PublicCategorySummary {
  id: string
  name: string
  slug: string
  description?: string | null
  productsCount?: number
  updatedAt?: string
}

export interface JsonApiPublicCategory {
  id: string
  attributes?: {
    name?: string
    slug?: string
    description?: string | null
    productsCount?: number
    updatedAt?: string
  }
}

export function mapPublicCategories(raw: JsonApiPublicCategory[] | undefined | null): PublicCategorySummary[] {
  return (raw ?? []).map((c) => ({
    id: c.id,
    name: c.attributes?.name ?? '',
    slug: c.attributes?.slug ?? '',
    description: c.attributes?.description ?? null,
    productsCount: c.attributes?.productsCount,
    updatedAt: c.attributes?.updatedAt,
  }))
}
