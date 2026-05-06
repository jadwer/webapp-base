/**
 * CREATE BANK TRANSACTION PAGE
 * Pagina para crear una nueva transaccion bancaria
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CreateBankTransactionWrapper } from '@/modules/finance'

export const metadata: Metadata = {
  title: 'Nueva Transaccion Bancaria - Finance',
  description: 'Registrar una nueva transaccion bancaria'
}

export default function CreateBankTransactionPage() {
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
      <CreateBankTransactionWrapper />
    </Suspense>
  )
}
