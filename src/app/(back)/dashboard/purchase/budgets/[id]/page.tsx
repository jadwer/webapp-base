/**
 * VIEW BUDGET PAGE
 * Pagina para ver detalles de un presupuesto
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ViewBudgetWrapper } from '@/modules/purchase/components'

export const metadata: Metadata = {
  title: 'Ver Presupuesto - Purchase',
  description: 'Detalles del presupuesto'
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewBudgetPage({ params }: PageProps) {
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
      <ViewBudgetWrapper budgetId={id} />
    </Suspense>
  )
}
