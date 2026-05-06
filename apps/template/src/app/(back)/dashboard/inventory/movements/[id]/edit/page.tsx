/**
 * EDIT MOVEMENT PAGE
 * Página para editar un movimiento de inventario existente
 */

import { EditMovementWrapper } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditMovementPage({ params }: PageProps) {
  const { id } = await params
  
  return <EditMovementWrapper movementId={id} />
}

export const metadata = {
  title: 'Editar Movimiento - Gestión de Inventario',
  description: 'Editar información del movimiento de inventario'
}