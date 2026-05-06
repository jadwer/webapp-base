/**
 * VIEW WAREHOUSE PAGE
 * Página para ver detalles de un almacén
 */

import { WarehouseDetail } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WarehouseDetailPage({ params }: PageProps) {
  const { id } = await params
  
  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <WarehouseDetail warehouseId={id} />
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Detalles del Almacén - Gestión de Inventario',
  description: 'Ver detalles completos del almacén'
}