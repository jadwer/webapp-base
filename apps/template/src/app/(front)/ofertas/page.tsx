/**
 * Ofertas Page
 *
 * Public page showing products on offer/featured products.
 * Route: /ofertas
 */

import { Metadata } from 'next'
import { OfertasPageClient } from './OfertasPageClient'

export const metadata: Metadata = {
  title: 'Ofertas | Labor Wasser de Mexico',
  description: 'Descubre nuestras mejores ofertas en reactivos y material de laboratorio. Precios especiales y promociones exclusivas.',
  keywords: 'ofertas, promociones, descuentos, laboratorio, reactivos, material',
}

export default function OfertasPage() {
  return <OfertasPageClient />
}
