/**
 * Ofertas Page
 *
 * Public page showing products on offer/featured products.
 * Route: /ofertas
 */

import { Metadata } from 'next'
import { OfertasPageClient } from './OfertasPageClient'

export const metadata: Metadata = {
  title: 'Ofertas en reactivos y material de laboratorio',
  description:
    'Ofertas vigentes en reactivos, material y equipo de laboratorio de marcas como Hach, Merck y J.T. Baker, con atención desde Ciudad de México.',
  alternates: { canonical: '/ofertas' },
  openGraph: {
    title: 'Ofertas | Labor Wasser de México',
    description: 'Ofertas vigentes en reactivos, material y equipo de laboratorio.',
    type: 'website',
    images: [{ url: '/images/laborwasser/labor-wasser-mexico-hero-1.webp', alt: 'Labor Wasser de México' }],
  },
}

export default function OfertasPage() {
  return <OfertasPageClient />
}
