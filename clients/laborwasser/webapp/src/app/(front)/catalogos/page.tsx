import type { Metadata } from 'next'
import CatalogosClient from './CatalogosClient'

export const metadata: Metadata = {
  title: 'Catálogos en PDF',
  description:
    'Catálogos en PDF de Labor Wasser de México. Mientras los publicamos, consulta el catálogo en línea o pide a un asesor el catálogo de la marca que necesitas.',
  alternates: { canonical: '/catalogos' },
}

export default function CatalogosPage() {
  return <CatalogosClient />
}
