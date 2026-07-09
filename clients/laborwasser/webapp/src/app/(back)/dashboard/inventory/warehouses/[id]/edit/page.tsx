/**
 * EDIT WAREHOUSE PAGE
 * Página para editar un almacén existente
 */

import { EditWarehouseWrapper } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditWarehousePage({ params }: PageProps) {
  const { id } = await params
  
  return <EditWarehouseWrapper warehouseId={id} />
}

export const metadata = {
  title: 'Editar Almacén - Gestión de Inventario',
  description: 'Editar información del almacén'
}