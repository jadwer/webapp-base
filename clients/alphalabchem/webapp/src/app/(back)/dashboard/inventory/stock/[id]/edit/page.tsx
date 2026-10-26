import type { Metadata } from 'next'
import { EditStockWrapper } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Editar stock - Inventario',
  description: 'Modificar niveles y datos del registro de stock',
}

export default async function EditStockPage({ params }: PageProps) {
  const { id } = await params
  return <EditStockWrapper stockId={id} />
}
