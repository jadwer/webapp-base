/**
 * /productos/[id]: server component con ISR (SEO Bloque 1, 2026-09).
 *
 * La ficha se trae en servidor (fetchPublicProductServer, cache 1 h), se
 * entrega a la piel como initialProduct y generateMetadata produce titulo,
 * descripcion, canonical y og:image unicos por producto. Un id inexistente o
 * no publico responde 404 real. Sin generateStaticParams: ISR bajo demanda.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchPublicProductServer } from '@lwm/ecommerce/server'
import ProductDetailClient from './ProductDetailClient'

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
    `${product.attributes.name}${brand ? ` de ${brand}` : ''}${sku ? ` (${sku})` : ''}.`
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
  }
}

export default async function ProductDetailRoute({ params }: ProductDetailRouteProps) {
  const { id } = await params
  const product = await fetchPublicProductServer(id)
  if (!product) notFound()
  return <ProductDetailClient productId={id} initialProduct={product} />
}
