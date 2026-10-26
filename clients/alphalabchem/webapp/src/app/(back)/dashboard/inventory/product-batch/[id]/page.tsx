import type { Metadata } from 'next'
import { ProductBatchDetail } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Detalle del lote - Inventario',
  description: 'Información del lote de producto, existencias y vencimiento',
}

export default async function ProductBatchDetailPage({ params }: PageProps) {
  const { id } = await params
  return <ProductBatchDetail productBatchId={id} />
}
