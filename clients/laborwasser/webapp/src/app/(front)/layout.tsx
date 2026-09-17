/**
 * Layout del sitio publico (server component desde SEO Bloque 1, 2026-09).
 *
 * Trae las categorias en servidor (cache 1 h) y se las da al Header, para
 * que el menu "Productos" salga completo en el HTML en vez de "Cargando...".
 * Si la API falla, el Header hace su fetch en cliente como antes.
 */

import { Header, Footer } from '@/modules/landing'
import { CustomerSidebar } from '@lwm/ecommerce'
import { fetchPublicCategoriesServer } from '@lwm/ecommerce/server'

export default async function FrontLayout({ children }: { children: React.ReactNode }) {
  const categories = await fetchPublicCategoriesServer(100, { revalidate: 3600 }).catch(() => undefined)

  return (
    <>
      <Header initialCategories={categories} />
      <CustomerSidebar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
