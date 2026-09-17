/**
 * /productos: server component (SEO Bloque 1, 2026-09).
 *
 * Trae en servidor la primera pagina del catalogo con la MISMA consulta
 * inicial del motor (catalogInitialQuery) y se la pasa a ProductosClient.
 * Asi el HTML ya contiene los productos para el robot; filtros, orden y
 * paginacion siguen en cliente. Si la API falla en servidor la pagina se
 * renderiza sin datos iniciales y el cliente carga como siempre.
 *
 * Los tenants replican este patron con su propia piel (ver
 * clients/laborwasser/webapp/src/app/(front)/productos/page.tsx).
 */

import type { Metadata } from 'next'
import { catalogInitialQuery, fetchPublicCatalogServer, type PublicProductsPage } from '@lwm/ecommerce/server'
import ProductosClient from './ProductosClient'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function firstParam(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value
  const trimmed = v?.trim()
  return trimmed ? trimmed : undefined
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams
  const search = firstParam(sp.search)
  if (search) {
    return { title: `Resultados para "${search}"`, robots: { index: false, follow: true }, alternates: { canonical: '/productos' } }
  }
  return { title: 'Productos', alternates: { canonical: '/productos' } }
}

export default async function ProductosPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const query = catalogInitialQuery({
    initialFilters: { search: firstParam(sp.search), categoryId: firstParam(sp.categoryId) },
    initialSortField: 'name',
    initialSortDirection: 'asc',
    initialPageSize: 24,
  })
  const initialCatalog = await fetchPublicCatalogServer(query, { revalidate: 300 })
    .catch((): PublicProductsPage | undefined => undefined)

  return <ProductosClient initialCatalog={initialCatalog} />
}
