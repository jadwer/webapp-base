/**
 * EDIT CYCLE COUNT PAGE
 * Pagina para editar un conteo ciclico existente
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { EditCycleCountWrapper } from '@/modules/inventory'

export const metadata: Metadata = {
  title: 'Editar Conteo - Inventory',
  description: 'Editar un conteo ciclico de inventario'
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditCycleCountPage({ params }: PageProps) {
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
      <EditCycleCountWrapper id={id} />
    </Suspense>
  )
}
