/**
 * EDIT LOCATION PAGE
 * Página para editar una ubicación existente
 */

import { EditLocationWrapper } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditLocationPage({ params }: PageProps) {
  const { id } = await params
  
  return <EditLocationWrapper locationId={id} />
}

export const metadata = {
  title: 'Editar Ubicación - Gestión de Inventario',
  description: 'Editar información de la ubicación'
}