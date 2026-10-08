import type { Metadata } from 'next'
import { CreateWarehouseWrapper } from '@/modules/inventory'

export const metadata: Metadata = {
  title: 'Nuevo almacén - Inventario',
  description: 'Registrar un almacén y asignarlo a una sucursal',
}

export default function CreateWarehousePage() {
  return <CreateWarehouseWrapper />
}
