/**
 * CREATE CYCLE COUNT PAGE
 * Pagina para crear un nuevo conteo ciclico
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CreateCycleCountWrapper } from '@/modules/inventory'

export const metadata: Metadata = {
  title: 'Nuevo Conteo Ciclico - Inventory',
  description: 'Programar un nuevo conteo ciclico de inventario'
}

export default function CreateCycleCountPage() {
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
      <CreateCycleCountWrapper />
    </Suspense>
  )
}
