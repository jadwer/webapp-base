/**
 * CREATE BUDGET PAGE
 * Pagina para crear un nuevo presupuesto
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CreateBudgetWrapper } from '@/modules/purchase/components'

export const metadata: Metadata = {
  title: 'Nuevo Presupuesto - Purchase',
  description: 'Crear un nuevo presupuesto de compras'
}

export default function CreateBudgetPage() {
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
      <CreateBudgetWrapper />
    </Suspense>
  )
}
