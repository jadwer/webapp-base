import type { Metadata } from 'next'
import { EditMovementWrapper } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Editar movimiento - Inventario',
  description: 'Modificar el movimiento de inventario',
}

export default async function EditMovementPage({ params }: PageProps) {
  const { id } = await params
  return <EditMovementWrapper movementId={id} />
}
