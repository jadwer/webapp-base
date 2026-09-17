/**
 * /productos/[id]: server component con ISR (SEO Bloque 1, 2026-09).
 *
 * La ficha se trae en servidor (fetchPublicProductServer, cache 1 h) y se
 * entrega a la piel del tenant (modules/catalog/ProductDetail) como
 * initialProduct: el HTML ya lleva nombre, precio, descripcion y marca, y
 * generateMetadata produce titulo, descripcion, canonical y og:image
 * unicos por producto. Un id inexistente o no publico responde 404 real.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchPublicProductServer } from '@lwm/ecommerce/server'
import { ProductDetail } from '@/modules/catalog'

// ISR bajo demanda: la primera visita genera la ficha, se sirve cacheada y
// se regenera como maximo cada hora. NO generateStaticParams (37k productos).
export const revalidate = 3600

interface ProductDetailRouteProps {
  params: Promise<{ id: string }>
}

function cleanText(value: string | null | undefined, max = 160): string | undefined {
  if (!value) return undefined
  const text = value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return undefined
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

export async function generateMetadata({ params }: ProductDetailRouteProps): Promise<Metadata> {
  const { id } = await params
  const product = await fetchPublicProductServer(id)
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
    alternates: { canonical: `/productos/${product.id}` },
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

export default async function ProductDetailRoute({ params }: ProductDetailRouteProps) {
  const { id } = await params
  const product = await fetchPublicProductServer(id)
  if (!product) notFound()
  return <ProductDetail productId={id} initialProduct={product} />
}
