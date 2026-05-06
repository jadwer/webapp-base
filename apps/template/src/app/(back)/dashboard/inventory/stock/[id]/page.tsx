/**
 * VIEW STOCK PAGE
 * Página para ver detalles de un registro de stock
 */

import { StockDetail } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function StockDetailPage({ params }: PageProps) {
  const { id } = await params
  
  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <StockDetail stockId={id} />
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Detalles del Stock - Gestión de Inventario',
  description: 'Ver detalles completos del registro de stock'
}