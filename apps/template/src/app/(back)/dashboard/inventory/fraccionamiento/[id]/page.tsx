import type { Metadata } from 'next'
import { FractionationDetail } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Detalle del fraccionamiento - Inventario',
  description: 'Origen, destino, cantidades y movimientos del fraccionamiento',
}

export default async function FractionationDetailPage({ params }: PageProps) {
  const { id } = await params
  return <FractionationDetail fractionationId={id} />
}
