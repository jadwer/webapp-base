import type { Metadata } from 'next'
import { CreateProductBatchWrapper } from '@/modules/inventory'

export const metadata: Metadata = {
  title: 'Nuevo lote - Inventario',
  description: 'Registrar un lote de producto con fabricación, vencimiento y cantidad inicial',
}

export default function CreateProductBatchPage() {
  return <CreateProductBatchWrapper />
}
