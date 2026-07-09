/**
 * BANK TRANSACTIONS PAGE
 * Pagina principal de administracion de transacciones bancarias
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { BankTransactionsAdminPage } from '@/modules/finance'

export const metadata: Metadata = {
  title: 'Transacciones Bancarias - Finance',
  description: 'Administracion de transacciones bancarias y conciliacion'
}

export default function BankTransactionsPage() {
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
      <BankTransactionsAdminPage />
    </Suspense>
  )
}
