/**
 * VIEW LOCATION PAGE
 * Página para ver detalles de una ubicación
 */

import { LocationDetail } from '@/modules/inventory'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LocationDetailPage({ params }: PageProps) {
  const { id } = await params
  
  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <LocationDetail locationId={id} />
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Detalles de la Ubicación - Gestión de Inventario',
  description: 'Ver detalles completos de la ubicación'
}