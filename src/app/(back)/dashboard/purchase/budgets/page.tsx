/**
 * BUDGETS PAGE
 * Pagina principal de administracion de presupuestos
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { BudgetsAdminPage } from '@/modules/purchase/components'

export const metadata: Metadata = {
  title: 'Presupuestos - Purchase',
  description: 'Administracion de presupuestos de compras'
}

export default function BudgetsPage() {
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
      <BudgetsAdminPage />
    </Suspense>
  )
}
