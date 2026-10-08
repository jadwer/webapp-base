import type { Metadata } from 'next'
import { LocationDetail } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Detalle de la ubicación - Inventario',
  description: 'Información de la ubicación dentro del almacén',
}

export default async function LocationDetailPage({ params }: PageProps) {
  const { id } = await params
  return <LocationDetail locationId={id} />
}
