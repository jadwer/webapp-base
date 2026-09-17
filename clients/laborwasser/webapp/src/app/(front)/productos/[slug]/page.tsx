/**
 * /productos/[slug]: ficha con URL legible (SEO Bloque 1b, 2026-09), server
 * component con ISR (1 h). Sustituye a /productos/[id]:
 *
 * - Segmento numerico (URL legada /productos/604, enlaces viejos, sitemap
 *   anterior, carrito): se busca por id; si el producto ya tiene slug se
 *   responde 301 a /productos/<slug> (no se pierde lo indexado); si aun no lo
 *   tiene (antes del backfill) se renderiza con canonical al id.
 * - Segmento no numerico: se resuelve por filter[slug]; 404 real si no hay.
 *
 * La piel del tenant (modules/catalog/ProductDetail) recibe el producto ya
 * traido (initialProduct) y su id numerico para tracking y sugerencias.
 */

import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import {
  fetchPublicProductBySlugServer,
  fetchPublicProductServer,
  type EnhancedPublicProduct,
} from '@lwm/ecommerce/server'
import { ProductDetail } from '@/modules/catalog'

export const revalidate = 3600

interface ProductRouteProps {
  params: Promise<{ slug: string }>
}

function isNumeric(segment: string): boolean {
  return /^\d+$/.test(segment)
}

async function resolveProduct(segment: string): Promise<EnhancedPublicProduct | null> {
  return isNumeric(segment)
    ? fetchPublicProductServer(segment)
    : fetchPublicProductBySlugServer(segment)
}

function canonicalPath(product: EnhancedPublicProduct): string {
  const slug = product.attributes.slug
  return `/productos/${slug && slug.trim() !== '' ? slug : product.id}`
}

function cleanText(value: string | null | undefined, max = 160): string | undefined {
  if (!value) return undefined
  const text = value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return undefined
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

export async function generateMetadata({ params }: ProductRouteProps): Promise<Metadata> {
  const { slug } = await params
  const product = await resolveProduct(slug)
  if (!product) {
    return { title: 'Producto no encontrado', robots: { index: false, follow: false } }
  }

  const brand = product.brand?.attributes.name
  const sku = product.attributes.sku
  const title = [product.attributes.name, brand, sku].filter(Boolean).join(' ')
  const description =
    cleanText(product.attributes.description) ??
    cleanText(product.attributes.fullDescription) ??
    `${product.attributes.name}${brand ? ` de ${brand}` : ''}${sku ? ` (${sku})` : ''} en Labor Wasser de México. Reactivos y material de laboratorio con envío a todo el país.`
  const image = product.galleryImages?.[0]?.attributes.imageUrl || product.attributes.imageUrl || undefined

  return {
    title,
    description,
    alternates: { canonical: canonicalPath(product) },
    openGraph: {
      title,
      description,
      type: 'website',
      ...(image ? { images: [{ url: image, alt: product.attributes.name }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default async function ProductRoute({ params }: ProductRouteProps) {
  const { slug } = await params
  const product = await resolveProduct(slug)
  if (!product) notFound()

  // URL legada por id con slug disponible: 301 a la URL legible
  if (isNumeric(slug) && canonicalPath(product) !== `/productos/${slug}`) {
    permanentRedirect(canonicalPath(product))
  }

  return <ProductDetail productId={String(product.id)} initialProduct={product} />
}
