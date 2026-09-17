/**
 * Datos estructurados Schema.org (SEO Bloque 2, 2026-09).
 *
 * Constructores puros (testeables) + un componente <JsonLd> que serializa con
 * escape de "<" para que nunca se pueda cerrar el <script> desde un dato del
 * backend. Se renderiza en server components: el robot lo ve en el HTML.
 */

import React from 'react'

export type JsonLdObject = Record<string, unknown>

export interface OrganizationInput {
  name: string
  url: string
  logo?: string | null
  phones?: Array<string | null | undefined>
  email?: string | null
  address?: { street?: string | null; city?: string | null; region?: string | null; postalCode?: string | null; country?: string }
  sameAs?: Array<string | null | undefined>
}

export interface FaqInput {
  question: string
  answer: string
}

export interface BreadcrumbInput {
  name: string
  url: string
}

export interface ProductInput {
  name: string
  url: string
  sku?: string | null
  description?: string | null
  image?: string | null
  brand?: string | null
  category?: string | null
  price?: number | null
  currency?: string | null
}

function clean<T extends JsonLdObject>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0))
  ) as T
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '')
  if (!digits) return ''
  if (digits.startsWith('+')) return digits
  // Numeros mexicanos de 10 digitos: prefijo +52
  return digits.length === 10 ? `+52${digits}` : `+${digits}`
}

export function organizationJsonLd(input: OrganizationInput): JsonLdObject {
  const phones = (input.phones ?? []).filter((p): p is string => !!p && p.trim() !== '').map(normalizePhone).filter(Boolean)
  const address = input.address
  return clean({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: input.name,
    url: input.url,
    logo: input.logo || undefined,
    email: input.email || undefined,
    telephone: phones[0],
    contactPoint: phones.length
      ? phones.map((telephone) => clean({ '@type': 'ContactPoint', telephone, contactType: 'sales', availableLanguage: 'es' }))
      : undefined,
    address: address && (address.street || address.city || address.region)
      ? clean({
          '@type': 'PostalAddress',
          streetAddress: address.street || undefined,
          addressLocality: address.city || undefined,
          addressRegion: address.region || undefined,
          postalCode: address.postalCode || undefined,
          addressCountry: address.country ?? 'MX',
        })
      : undefined,
    sameAs: (input.sameAs ?? []).filter((s): s is string => !!s && /^https?:\/\//.test(s)),
  })
}

export function faqPageJsonLd(items: FaqInput[]): JsonLdObject | null {
  const valid = items.filter((i) => i.question?.trim() && i.answer?.trim())
  if (valid.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: valid.map((i) => ({
      '@type': 'Question',
      name: i.question.trim(),
      acceptedAnswer: { '@type': 'Answer', text: i.answer.trim() },
    })),
  }
}

export function breadcrumbJsonLd(items: BreadcrumbInput[]): JsonLdObject | null {
  if (items.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function productJsonLd(input: ProductInput): JsonLdObject {
  const hasPrice = typeof input.price === 'number' && Number.isFinite(input.price) && input.price > 0
  return clean({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    url: input.url,
    sku: input.sku || undefined,
    description: input.description || undefined,
    image: input.image || undefined,
    brand: input.brand ? { '@type': 'Brand', name: input.brand } : undefined,
    category: input.category || undefined,
    // Sin disponibilidad: el catalogo publico no expone stock y no se afirma
    // lo que no se sabe. Precio solo si es mayor a cero (0 = "cotizar").
    offers: hasPrice
      ? {
          '@type': 'Offer',
          url: input.url,
          price: (input.price as number).toFixed(2),
          priceCurrency: input.currency || 'MXN',
          itemCondition: 'https://schema.org/NewCondition',
        }
      : undefined,
  })
}

/** Serializa sin permitir cerrar el script desde el contenido. */
export function serializeJsonLd(data: JsonLdObject): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function JsonLd({ data }: { data: JsonLdObject | null | undefined }) {
  if (!data) return null
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
}
