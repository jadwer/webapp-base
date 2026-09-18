/**
 * /productos: server component (SEO Bloque 1, 2026-09).
 *
 * Trae en servidor la primera pagina del catalogo (misma consulta inicial del
 * motor: catalogInitialQuery) y las categorias, y se las pasa a
 * ProductosClient. Asi el HTML ya contiene los 24 productos y el menu de
 * categorias para el robot; la interaccion (filtros, orden, paginacion)
 * sigue en cliente sin cambios.
 *
 * 2026-09-18: ?categoryId=N con categoria de slug limpio redirige permanente
 * a /productos/categoria/<slug> (conservando ?search= y ?page=); la pagina
 * de categoria vive en categoria/[slug]/page.tsx sobre las mismas piezas
 * (catalogPage.ts). Si la API falla en servidor NO se rompe la pagina.
 */

import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'
import ProductosClient from './ProductosClient'
import { JsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { categoryPath, isCleanCategorySlug } from '@/lib/seo/categoryPath'
import {
  HOST,
  catalogMetadata,
  categoryMetadata,
  firstParam,
  loadCatalog,
  loadCategories,
  normalizePage,
  searchMetadata,
  type SearchParams,
} from './catalogPage'

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams
  const search = firstParam(sp.search)
  const categoryId = firstParam(sp.categoryId)
  const page = normalizePage(firstParam(sp.page))

  // Resultados de busqueda: no indexar (contenido duplicado); canonical al catalogo.
  if (search) return searchMetadata(search)

  if (categoryId) {
    const category = (await loadCategories())?.find((c) => c.id === categoryId)
    if (category) return categoryMetadata(category, page)
  }

  return catalogMetadata(page)
}

export default async function ProductosPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const search = firstParam(sp.search)
  const categoryId = firstParam(sp.categoryId)
  const page = normalizePage(firstParam(sp.page))

  const categories = await loadCategories()
  const category = categoryId ? categories?.find((c) => c.id === categoryId) : undefined

  // URL legada por id -> URL legible por slug (308 permanente), conservando busqueda y pagina
  if (category && isCleanCategorySlug(category.slug)) {
    const target = categoryPath(category, page)
    permanentRedirect(search ? `${target}${target.includes('?') ? '&' : '?'}search=${encodeURIComponent(search)}` : target)
  }

  const catalog = await loadCatalog(search, categoryId, page)

  const breadcrumb = breadcrumbJsonLd([
    { name: 'Inicio', url: `${HOST}/` },
    { name: 'Productos', url: `${HOST}/productos` },
    ...(category ? [{ name: category.name, url: `${HOST}${categoryPath(category)}` }] : []),
  ])

  return (
    <>
      <JsonLd data={breadcrumb} />
      <ProductosClient
        initialCatalog={catalog}
        initialCategories={categories}
        initialPage={page}
        category={category ? { id: category.id, name: category.name, description: category.description, slug: category.slug } : undefined}
      />
    </>
  )
}
