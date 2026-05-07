/**
 * LABOR WASSER CATÁLOGO COMPLETO
 * Página que demuestra la integración completa del public-catalog
 * con la landing page de LaborWasser
 */

import { Metadata } from 'next'
import { LaborWasserLandingEnhanced } from '@/modules/laborwasser-landing'

export const metadata: Metadata = {
  title: 'Catálogo Completo - Labor Wasser de México',
  description: 'Catálogo completo de productos para laboratorio con filtros avanzados, búsqueda en tiempo real y múltiples vistas. Reactivos, equipos y material científico certificado.',
  keywords: 'catálogo laboratorio, reactivos químicos, equipos científicos, material de laboratorio, productos químicos, México, distribuidora, filtros avanzados',
  authors: [{ name: 'Labor Wasser de México' }],
  creator: 'Labor Wasser de México',
  publisher: 'Labor Wasser de México',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Catálogo Completo - Labor Wasser de México',
    description: 'Catálogo completo de productos para laboratorio con filtros avanzados y búsqueda en tiempo real.',
    type: 'website',
    locale: 'es_MX',
    siteName: 'Labor Wasser de México',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Catálogo Completo - Labor Wasser de México',
    description: 'Catálogo completo de productos para laboratorio con filtros avanzados y búsqueda en tiempo real.',
  },
  alternates: {
    canonical: '/laborwasser-catalogo',
  },
}

export default function LaborWasserCatalogoPage() {
  return (
    <LaborWasserLandingEnhanced 
      showFullCatalog={true}
      enableProductModal={true}
      className="laborwasser-catalogo-page"
    />
  )
}