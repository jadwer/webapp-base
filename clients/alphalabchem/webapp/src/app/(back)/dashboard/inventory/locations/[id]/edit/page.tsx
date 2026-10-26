import type { Metadata } from 'next'
import { EditLocationWrapper } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Editar ubicación - Inventario',
  description: 'Modificar los datos de la ubicación',
}

export default async function EditLocationPage({ params }: PageProps) {
  const { id } = await params
  return <EditLocationWrapper locationId={id} />
}
