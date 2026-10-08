import type { Metadata } from 'next'
import { MovementDetail } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Detalle del movimiento - Inventario',
  description: 'Producto, almacén, cantidades y costo del movimiento de inventario',
}

export default async function MovementDetailPage({ params }: PageProps) {
  const { id } = await params
  return <MovementDetail movementId={id} />
}
