import { Metadata } from 'next'
import { LaborWasserLandingEnhanced } from '@/modules/laborwasser-landing'

export const metadata: Metadata = {
  title: 'Labor Wasser de México - Reactivos y Material de Laboratorio',
  description: 'Distribuidora especializada en reactivos y material de laboratorio con más de 20 años de experiencia. Productos certificados, envío rápido y asesoría especializada.',
  keywords: 'laboratorio, reactivos, material de laboratorio, equipos científicos, México, distribuidora, productos químicos',
  authors: [{ name: 'Labor Wasser de México' }],
  creator: 'AtomoSoluciones.com',
  publisher: 'Labor Wasser de México',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Labor Wasser de México - Reactivos y Material de Laboratorio',
    description: 'Distribuidora especializada en reactivos y material de laboratorio con más de 20 años de experiencia.',
    type: 'website',
    locale: 'es_MX',
    siteName: 'Labor Wasser de México',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Labor Wasser de México - Reactivos y Material de Laboratorio',
    description: 'Distribuidora especializada en reactivos y material de laboratorio con más de 20 años de experiencia.',
  },
  alternates: {
    canonical: '/laborwasser-demo',
  },
}

export default function LaborWasserDemoPage() {
  return (
    <LaborWasserLandingEnhanced 
      showFullCatalog={false}
      enableProductModal={true}
    />
  )
}