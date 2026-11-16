import type { Metadata } from 'next'
import { ProductBatchesListPage } from '@/modules/inventory'

export const metadata: Metadata = {
  title: 'Lotes de productos - Inventario',
  description: 'Seguimiento de lotes por vencimiento, almacén y proveedor',
}

export default function ProductBatchPage() {
  return <ProductBatchesListPage />
}
