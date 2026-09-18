/**
 * Layout del sitio publico (server component desde SEO Bloque 1, 2026-09).
 *
 * Trae las categorias en servidor (cache 1 h) y se las da al Header, para
 * que el menu "Productos" salga completo en el HTML en vez de "Cargando...".
 * Si la API falla, el Header hace su fetch en cliente como antes.
 *
 * SEO Bloque 2: JSON-LD Organization en todas las paginas publicas, con los
 * datos de contacto de app-config (los mismos que muestra el footer).
 * 2026-09-18: el Footer recibe los mismos settings resueltos en servidor
 * (razon social y telefonos en el HTML inicial) y se monta el rastreo de
 * eventos de negocio para GA4.
 */

// Rendimiento (Bloque 4, 2026-09-18): un server component que importa un
// componente cliente desde un barrel registra como referencia cliente TODO
// lo que el barrel exporta (Next no poda esa traversal), y el JS del home
// cargaba el carrito, el checkout y los formularios de auth. Por eso aqui
// se importa por ruta directa; para los packages @lwm/* lo resuelve
// experimental.optimizePackageImports en next.config.
import { Header } from '@/modules/landing/components/Header'
import { Footer } from '@/modules/landing/components/Footer'
import { AnalyticsEvents } from '@/modules/landing/components/AnalyticsEvents/AnalyticsEvents'
import { CustomerSidebar } from '@lwm/ecommerce'
import { fetchPublicCategoriesServer } from '@lwm/ecommerce/server'
import { JsonLd, organizationJsonLd } from '@/lib/seo/jsonLd'
import { absoluteAsset, getPublicSettings, settingString } from '@/lib/seo/publicSettings'

const HOST = (process.env.NEXT_PUBLIC_CANONICAL_HOST || 'https://laborwasserdemexico.com').replace(/\/+$/, '')

const FOOTER_KEYS = [
  'company.name', 'company.phone', 'company.phone_secondary', 'company.phone_tertiary',
  'company.whatsapp_number', 'company.whatsapp_display', 'company.email', 'company.address',
  'company.logo_path_alt', 'company.logo_path_footer', 'social.facebook', 'social.instagram', 'social.linkedin',
] as const

export default async function FrontLayout({ children }: { children: React.ReactNode }) {
  const [categories, settings] = await Promise.all([
    fetchPublicCategoriesServer(100, { revalidate: 3600 }).catch(() => undefined),
    getPublicSettings(),
  ])

  const footerSettings = Object.fromEntries(FOOTER_KEYS.map((k) => [k, settingString(settings, k)]))

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
      <Footer initialSettings={footerSettings} />
      <AnalyticsEvents />
    </>
  )
}
