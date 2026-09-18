/**
 * URL publica de una categoria (SEO, 2026-09-18).
 *
 * Con slug: /productos/categoria/<slug>. Sin slug (dato viejo o base demo):
 * /productos?categoryId=<id>, que la pagina del catalogo redirige al slug
 * en cuanto exista. Un solo punto de verdad para menu, migas, sitemap y
 * canonicals.
 */

export interface CategoryPathSource {
  id: string | number
  slug?: string | null
}

export function isCleanCategorySlug(slug: string | null | undefined): slug is string {
  return typeof slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

export function categoryPath(category: CategoryPathSource, page = 1): string {
  const base = isCleanCategorySlug(category.slug)
    ? `/productos/categoria/${category.slug}`
    : `/productos?categoryId=${category.id}`
  if (page <= 1) return base
  return `${base}${base.includes('?') ? '&' : '?'}page=${page}`
}
