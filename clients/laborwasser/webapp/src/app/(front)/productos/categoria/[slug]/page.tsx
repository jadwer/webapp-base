/**
 * /productos/categoria/[slug]: pagina de categoria con URL legible
 * (SEO 2026-09-18). Misma piel y motor que /productos: la categoria se
 * resuelve por slug contra la lista publica (cache 1 h); si no existe, 404.
 * ?page=N se renderiza en servidor; los enlaces de paginacion llevan el
 * slug en la ruta. Canonical: /productos/categoria/<slug>[?page=N].
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductosClient from '../../ProductosClient'
import { JsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { categoryPath } from '@/lib/seo/categoryPath'
import {
  HOST,
  categoryMetadata,
  firstParam,
  loadCatalog,
  loadCategories,
  normalizePage,
  searchMetadata,
  type SearchParams,
} from '../../catalogPage'

interface CategoryRouteProps {
  params: Promise<{ slug: string }>
  searchParams: SearchParams
}

async function resolveCategory(slug: string) {
  const categories = await loadCategories()
  return { categories, category: categories?.find((c) => c.slug === slug) }
}

export async function generateMetadata({ params, searchParams }: CategoryRouteProps): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const search = firstParam(sp.search)
  if (search) return searchMetadata(search)
  const { category } = await resolveCategory(slug)
  if (!category) return { title: 'Categoría no encontrada', robots: { index: false, follow: false } }
  return categoryMetadata(category, normalizePage(firstParam(sp.page)))
}

export default async function CategoryPage({ params, searchParams }: CategoryRouteProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const { categories, category } = await resolveCategory(slug)
  if (!category) notFound()

  const search = firstParam(sp.search)
  const page = normalizePage(firstParam(sp.page))
  const catalog = await loadCatalog(search, category.id, page)
  const basePath = categoryPath(category)

  const breadcrumb = breadcrumbJsonLd([
    { name: 'Inicio', url: `${HOST}/` },
    { name: 'Productos', url: `${HOST}/productos` },
    { name: category.name, url: `${HOST}${basePath}` },
  ])

  return (
    <>
      <JsonLd data={breadcrumb} />
      <ProductosClient
        initialCatalog={catalog}
        initialCategories={categories}
        initialPage={page}
        category={{ id: category.id, name: category.name, description: category.description, slug: category.slug }}
        basePath={basePath}
      />
    </>
  )
}
