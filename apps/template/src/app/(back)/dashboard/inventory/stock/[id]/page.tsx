import type { Metadata } from 'next'
import { StockDetail } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Detalle del stock - Inventario',
  description: 'Existencias, niveles y último movimiento del registro de stock',
}

export default async function StockDetailPage({ params }: PageProps) {
  const { id } = await params
  return <StockDetail stockId={id} />
}
