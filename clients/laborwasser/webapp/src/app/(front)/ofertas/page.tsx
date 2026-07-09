/**
 * Ofertas Page
 *
 * Public page showing products on offer/featured products.
 * Route: /ofertas
 */

import { Metadata } from 'next'
import { OfertasPageClient } from './OfertasPageClient'

export const metadata: Metadata = {
  title: 'Ofertas',
  description: 'Descubre nuestras mejores ofertas y promociones exclusivas.',
  keywords: 'ofertas, promociones, descuentos',
}

export default function OfertasPage() {
  return <OfertasPageClient />
}
