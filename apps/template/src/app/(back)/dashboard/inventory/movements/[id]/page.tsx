/**
 * VIEW MOVEMENT PAGE
 * Página para ver detalles de un movimiento de inventario
 */

import { MovementDetail } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MovementDetailPage({ params }: PageProps) {
  const { id } = await params
  
  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <MovementDetail movementId={id} />
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Detalles del Movimiento - Gestión de Inventario',
  description: 'Ver detalles completos del movimiento de inventario'
}