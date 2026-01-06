/**
 * VIEW CYCLE COUNT PAGE
 * Pagina para ver detalle de un conteo ciclico
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ViewCycleCountWrapper } from '@/modules/inventory'

export const metadata: Metadata = {
  title: 'Detalle de Conteo - Inventory',
  description: 'Ver detalle de un conteo ciclico de inventario'
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewCycleCountPage({ params }: PageProps) {
  const { id } = await params

  return (
    <Suspense
      fallback={
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      }
    >
      <ViewCycleCountWrapper id={id} />
    </Suspense>
  )
}
