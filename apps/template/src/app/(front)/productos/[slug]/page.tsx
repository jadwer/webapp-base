/**
 * /productos/[slug]: ficha con URL legible (SEO Bloque 1b, 2026-09), server
 * component con ISR (1 h). Sustituye a /productos/[id]: un segmento numerico
 * se resuelve por id y redirige 301 al slug cuando el producto lo tiene; un
 * segmento no numerico se resuelve por filter[slug]; 404 real si no existe.
 */

import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import {
  fetchPublicProductBySlugServer,
  fetchPublicProductServer,
  type EnhancedPublicProduct,
} from '@lwm/ecommerce/server'
import ProductDetailClient from './ProductDetailClient'
import { JsonLd, breadcrumbJsonLd, productJsonLd } from '@/lib/seo/jsonLd'

export const revalidate = 3600

const HOST = (process.env.NEXT_PUBLIC_CANONICAL_HOST || 'http://localhost:3000').replace(/\/+$/, '')

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
  // Igual que el slug: no repetir marca ni sku si el nombre ya los trae.
  const name = product.attributes.name
  const notInName = (token?: string | null) =>
    token && !name.toLowerCase().includes(token.toLowerCase()) ? token : undefined
  const title = [name, notInName(brand), notInName(sku)].filter(Boolean).join(' ')
  // Si la descripcion es pobre (< 60 caracteres o igual al nombre) se usa la plantilla.
  const richText = [cleanText(product.attributes.fullDescription), cleanText(product.attributes.description)]
    .find((t) => t && t.length >= 60 && t.toLowerCase() !== name.toLowerCase())
  const description =
    richText ?? `${name}${brand ? ` de ${brand}` : ''}${sku ? ` (${sku})` : ''}: compra en línea o solicita cotización.`
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
  }
}

export default async function ProductRoute({ params }: ProductRouteProps) {
  const { slug } = await params
  const product = await resolveProduct(slug)
  if (!product) notFound()

  if (isNumeric(slug) && canonicalPath(product) !== `/productos/${slug}`) {
    permanentRedirect(canonicalPath(product))
  }

  // SEO Bloque 2: Product + BreadcrumbList
  const url = `${HOST}${canonicalPath(product)}`
  const category = product.category
  const productLd = productJsonLd({
    name: product.attributes.name,
    url,
    sku: product.attributes.sku,
    description: cleanText(product.attributes.fullDescription, 500) ?? cleanText(product.attributes.description, 500),
    image: product.galleryImages?.[0]?.attributes.imageUrl || product.attributes.imageUrl || null,
    brand: product.brand?.attributes.name,
    category: category?.attributes.name,
    price: product.attributes.price,
    currency: product.currency?.attributes.code ?? 'MXN',
  })
  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Inicio', url: `${HOST}/` },
    { name: 'Productos', url: `${HOST}/productos` },
    ...(category ? [{ name: category.attributes.name, url: `${HOST}/productos?categoryId=${category.id}` }] : []),
    { name: product.attributes.name, url },
  ])

  return (
    <>
      <JsonLd data={productLd} />
      <JsonLd data={breadcrumbLd} />
      <ProductDetailClient productId={String(product.id)} initialProduct={product} />
    </>
  )
}
