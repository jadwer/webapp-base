import type { Metadata } from 'next'
import { WarehouseDetail } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Detalle del almacén - Inventario',
  description: 'Información y ubicaciones del almacén',
}

export default async function WarehouseDetailPage({ params }: PageProps) {
  const { id } = await params
  return <WarehouseDetail warehouseId={id} />
}
