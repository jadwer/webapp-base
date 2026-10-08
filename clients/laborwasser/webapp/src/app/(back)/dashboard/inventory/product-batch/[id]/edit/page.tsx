import type { Metadata } from 'next'
import { EditProductBatchWrapper } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Editar lote - Inventario',
  description: 'Modificar la información del lote de producto',
}

export default async function EditProductBatchPage({ params }: PageProps) {
  const { id } = await params
  return <EditProductBatchWrapper productBatchId={id} />
}
