/**
 * Layout del sitio publico (server component desde SEO Bloque 1, 2026-09).
 *
 * Trae las categorias en servidor (cache 1 h) y se las da al Header, para
 * que el menu "Productos" salga completo en el HTML en vez de "Cargando...".
 * Si la API falla, el Header hace su fetch en cliente como antes.
 *
 * SEO Bloque 2: JSON-LD Organization en todas las paginas publicas, con los
 * datos de contacto de app-config (los mismos que muestra el footer).
 */

import { Header, Footer } from '@/modules/landing'
import { CustomerSidebar } from '@lwm/ecommerce'
import { fetchPublicCategoriesServer } from '@lwm/ecommerce/server'
import { JsonLd, organizationJsonLd } from '@/lib/seo/jsonLd'
import { absoluteAsset, getPublicSettings, settingString } from '@/lib/seo/publicSettings'

const HOST = (process.env.NEXT_PUBLIC_CANONICAL_HOST || 'https://laborwasserdemexico.com').replace(/\/+$/, '')

export default async function FrontLayout({ children }: { children: React.ReactNode }) {
  const [categories, settings] = await Promise.all([
    fetchPublicCategoriesServer(100, { revalidate: 3600 }).catch(() => undefined),
    getPublicSettings(),
  ])

  const organization = organizationJsonLd({
    name: settingString(settings, 'company.name') ?? 'Labor Wasser de México',
    url: HOST,
    logo: absoluteAsset(settingString(settings, 'company.logo_path_alt') ?? '/images/laborwasser/labor-wasser-mexico-logo2.webp', HOST),
    phones: [
      settingString(settings, 'company.phone'),
      settingString(settings, 'company.phone_secondary'),
      settingString(settings, 'company.phone_tertiary'),
    ],
    email: settingString(settings, 'company.email'),
    address: {
      street: settingString(settings, 'company.address'),
      city: settingString(settings, 'company.city'),
      region: settingString(settings, 'company.state'),
      postalCode: settingString(settings, 'company.postal_code'),
    },
    sameAs: [
      settingString(settings, 'social.facebook'),
      settingString(settings, 'social.instagram'),
      settingString(settings, 'social.linkedin'),
      settingString(settings, 'social.youtube'),
    ],
  })

  return (
    <>
      <JsonLd data={organization} />
      <Header initialCategories={categories} />
      <CustomerSidebar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
