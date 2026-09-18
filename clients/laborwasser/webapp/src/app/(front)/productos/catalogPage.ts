/**
 * Piezas compartidas por /productos y /productos/categoria/[slug] (server).
 *
 * Carga inicial (primera pagina + categorias con cache de Next), metadata y
 * resolucion de la categoria activa. Sin 'use client': solo lo importan
 * server components.
 */

import type { Metadata } from 'next'
import {
  catalogInitialQuery,
  normalizePage,
  fetchPublicCatalogServer,
  fetchPublicCategoriesServer,
  type PublicCategorySummary,
  type PublicProductsPage,
} from '@lwm/ecommerce/server'
import { categoryPath } from '@/lib/seo/categoryPath'

export const PAGE_SIZE = 24
export const HOST = (process.env.NEXT_PUBLIC_CANONICAL_HOST || 'https://laborwasserdemexico.com').replace(/\/+$/, '')
export const OG_IMAGE = { url: '/images/laborwasser/labor-wasser-mexico-hero-1.webp', alt: 'Labor Wasser de México' }
export const CATALOG_DESCRIPTION =
  'Catálogo de reactivos, material y equipo de laboratorio de Labor Wasser de México: más de 37,000 productos certificados con envío a todo el país.'

export type SearchParams = Promise<Record<string, string | string[] | undefined>>

export function firstParam(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value
  const trimmed = v?.trim()
  return trimmed ? trimmed : undefined
}

export async function loadCategories(): Promise<PublicCategorySummary[] | undefined> {
  return fetchPublicCategoriesServer(100, { revalidate: 3600 }).catch(() => undefined)
}

export async function loadCatalog(search: string | undefined, categoryId: string | undefined, page: number): Promise<PublicProductsPage | undefined> {
  const query = catalogInitialQuery({
    initialFilters: { search, categoryId },
    initialSortField: 'name',
    initialSortDirection: 'asc',
    initialPageSize: PAGE_SIZE,
    initialPage: page,
  })
  return fetchPublicCatalogServer(query, { revalidate: 300 }).catch(() => undefined)
}

export function categoryMetadata(category: PublicCategorySummary, page: number): Metadata {
  const pageSuffix = page > 1 ? ` (página ${page})` : ''
  const title = `${category.name}: productos de laboratorio${pageSuffix}`
  const description = category.description
    ? `${category.name}. ${category.description}`.slice(0, 160)
    : `${category.name} en Labor Wasser de México: ${category.productsCount ?? ''} productos certificados con envío a todo el país.`.replace(':  ', ': ')
  return {
    title,
    description,
    alternates: { canonical: categoryPath(category, page) },
    openGraph: { title, description, type: 'website', images: [OG_IMAGE] },
  }
}

export function catalogMetadata(page: number): Metadata {
  const pageSuffix = page > 1 ? ` (página ${page})` : ''
  return {
    title: `Catálogo de productos${pageSuffix}`,
    description: CATALOG_DESCRIPTION,
    alternates: { canonical: page > 1 ? `/productos?page=${page}` : '/productos' },
    openGraph: { title: 'Catálogo de productos', description: CATALOG_DESCRIPTION, type: 'website', images: [OG_IMAGE] },
  }
}

export function searchMetadata(search: string): Metadata {
  return {
    title: `Resultados para "${search}"`,
    description: CATALOG_DESCRIPTION,
    robots: { index: false, follow: true },
    alternates: { canonical: '/productos' },
  }
}

export { normalizePage }
