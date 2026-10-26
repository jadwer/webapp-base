import type { Metadata } from 'next'
import { CreateStockWrapper } from '@/modules/inventory'

export const metadata: Metadata = {
  title: 'Nuevo registro de stock - Inventario',
  description: 'Registrar la existencia de un producto en un almacén y ubicación',
}

export default function CreateStockPage() {
  return <CreateStockWrapper />
}
