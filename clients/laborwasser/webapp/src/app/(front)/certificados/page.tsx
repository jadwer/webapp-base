import type { Metadata } from 'next'
import CertificadosClient from './CertificadosClient'

export const metadata: Metadata = {
  title: 'Certificados de análisis y hojas de seguridad (SDS) por marca',
  description:
    'Consulta certificados de análisis (COA) y hojas de seguridad (SDS) de Hach, Merck, J.T. Baker, Fisher, VWR, Thermo Scientific y más marcas de laboratorio, en el portal oficial de cada fabricante.',
  alternates: { canonical: '/certificados' },
  openGraph: {
    title: 'Certificados y hojas de seguridad | Labor Wasser de México',
    description: 'Certificados de análisis (COA) y hojas de seguridad (SDS) por marca, en el portal oficial de cada fabricante.',
    type: 'website',
    images: [{ url: '/images/laborwasser/labor-wasser-mexico-hero-1.webp', alt: 'Labor Wasser de México' }],
  },
}

export default function CertificadosPage() {
  return <CertificadosClient />
}
