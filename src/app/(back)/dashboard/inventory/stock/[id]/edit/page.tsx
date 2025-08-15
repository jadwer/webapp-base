/**
 * EDIT STOCK PAGE
 * Página para editar un registro de stock existente
 */

import { EditStockWrapper } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditStockPage({ params }: PageProps) {
  const { id } = await params
  
  return <EditStockWrapper stockId={id} />
}

export const metadata = {
  title: 'Editar Stock - Gestión de Inventario',
  description: 'Editar información del registro de stock'
}