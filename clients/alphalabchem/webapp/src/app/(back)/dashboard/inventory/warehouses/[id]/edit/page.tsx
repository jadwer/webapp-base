import type { Metadata } from 'next'
import { EditWarehouseWrapper } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Editar almacén - Inventario',
  description: 'Modificar los datos del almacén',
}

export default async function EditWarehousePage({ params }: PageProps) {
  const { id } = await params
  return <EditWarehouseWrapper warehouseId={id} />
}
