/**
 * Ruta publica de la ficha de un producto (SEO Bloque 1b).
 *
 * Con slug: /productos/<slug>. Sin slug (producto anterior al backfill o
 * respuesta sin el atributo): /productos/<id>, que la ruta [slug] resuelve y
 * redirige 301 al slug cuando existe. Un solo punto de verdad para todos los
 * enlaces internos: tarjetas, buscador, sugerencias, ofertas, sitemap.
 */

export interface ProductPathSource {
  id: string | number
  attributes?: { slug?: string | null }
}

export function productPath(product: ProductPathSource): string {
  const slug = product.attributes?.slug
  return `/productos/${slug && slug.trim() !== '' ? slug : product.id}`
}

/** Un segmento numerico es un id legado; cualquier otro es un slug. */
export function isNumericProductSegment(segment: string): boolean {
  return /^\d+$/.test(segment)
}
