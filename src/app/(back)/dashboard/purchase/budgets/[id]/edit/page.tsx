/**
 * EDIT BUDGET PAGE
 * Pagina para editar un presupuesto existente
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { EditBudgetWrapper } from '@/modules/purchase/components'

export const metadata: Metadata = {
  title: 'Editar Presupuesto - Purchase',
  description: 'Editar un presupuesto existente'
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditBudgetPage({ params }: PageProps) {
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
      <EditBudgetWrapper budgetId={id} />
    </Suspense>
  )
}
