/**
 * /productos: server component (SEO Bloque 1, 2026-09).
 *
 * Trae en servidor la primera pagina del catalogo (misma consulta inicial del
 * motor: catalogInitialQuery) y las categorias, y se las pasa a
 * ProductosClient. Asi el HTML ya contiene los 24 productos y el menu de
 * categorias para el robot; la interaccion (filtros, orden, paginacion)
 * sigue en cliente sin cambios.
 *
 * Si la API falla en servidor NO se rompe la pagina: se renderiza sin datos
 * iniciales y el cliente carga como siempre (degradacion, no error).
 *
 * La ruta es dinamica (lee searchParams); los datos se cachean con
 * `next.revalidate` (5 min productos, 1 h categorias).
 */

import type { Metadata } from 'next'
import {
  catalogInitialQuery,
  fetchPublicCatalogServer,
  fetchPublicCategoriesServer,
  type PublicCategorySummary,
  type PublicProductsPage,
} from '@lwm/ecommerce/server'
import ProductosClient from './ProductosClient'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const PAGE_SIZE = 24
// Al definir openGraph en la pagina se pisa el del layout: repetir la imagen.
const OG_IMAGE = { url: '/images/laborwasser/labor-wasser-mexico-hero-1.webp', alt: 'Labor Wasser de México' }
const CATALOG_DESCRIPTION =
  'Catálogo de reactivos, material y equipo de laboratorio de Labor Wasser de México: más de 37,000 productos certificados con envío a todo el país.'

function firstParam(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value
  const trimmed = v?.trim()
  return trimmed ? trimmed : undefined
}

async function loadInitial(search?: string, categoryId?: string) {
  const query = catalogInitialQuery({
    initialFilters: { search, categoryId },
    initialSortField: 'name',
    initialSortDirection: 'asc',
    initialPageSize: PAGE_SIZE,
  })
  const [catalog, categories] = await Promise.all([
    fetchPublicCatalogServer(query, { revalidate: 300 }).catch((): PublicProductsPage | undefined => undefined),
    fetchPublicCategoriesServer(100, { revalidate: 3600 }).catch((): PublicCategorySummary[] | undefined => undefined),
  ])
  return { catalog, categories }
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams
  const search = firstParam(sp.search)
  const categoryId = firstParam(sp.categoryId)

  // Resultados de busqueda: no indexar (contenido duplicado); canonical al catalogo.
  if (search) {
    return {
      title: `Resultados para "${search}"`,
      description: CATALOG_DESCRIPTION,
      robots: { index: false, follow: true },
      alternates: { canonical: '/productos' },
    }
  }

  if (categoryId) {
    const categories = await fetchPublicCategoriesServer(100, { revalidate: 3600 }).catch(() => [] as PublicCategorySummary[])
    const category = categories.find((c) => c.id === categoryId)
    if (category) {
      const title = `${category.name}: productos de laboratorio`
      const description = category.description
        ? `${category.name}. ${category.description}`.slice(0, 160)
        : `${category.name} en Labor Wasser de México: ${category.productsCount ?? ''} productos certificados con envío a todo el país.`.replace(':  ', ': ')
      return {
        title,
        description,
        alternates: { canonical: `/productos?categoryId=${category.id}` },
        openGraph: { title, description, type: 'website', images: [OG_IMAGE] },
      }
    }
  }

  return {
    title: 'Catálogo de productos',
    description: CATALOG_DESCRIPTION,
    alternates: { canonical: '/productos' },
    openGraph: { title: 'Catálogo de productos', description: CATALOG_DESCRIPTION, type: 'website', images: [OG_IMAGE] },
  }
}

export default async function ProductosPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const { catalog, categories } = await loadInitial(firstParam(sp.search), firstParam(sp.categoryId))
  return <ProductosClient initialCatalog={catalog} initialCategories={categories} />
}
