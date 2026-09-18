import type { Metadata } from 'next'
import NosotrosClient from './NosotrosClient'

export const metadata: Metadata = {
  title: 'Nosotros: quiénes somos',
  description:
    'Labor Wasser de México: distribuidora de reactivos, material y equipo de laboratorio en Ciudad de México. Misión, visión y valores de un equipo comprometido con el laboratorio.',
  alternates: { canonical: '/nosotros' },
  openGraph: {
    title: 'Nosotros | Labor Wasser de México',
    description: 'Distribuidora de reactivos, material y equipo de laboratorio en Ciudad de México. Misión, visión y valores.',
    type: 'website',
    images: [{ url: '/images/laborwasser/labor-wasser-mexico-about.webp', alt: 'Labor Wasser de México' }],
  },
}

export default function NosotrosPage() {
  return <NosotrosClient />
}
