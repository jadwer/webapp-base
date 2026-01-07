/**
 * VIEW BANK TRANSACTION PAGE
 * Pagina para ver detalles de una transaccion bancaria
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ViewBankTransactionWrapper } from '@/modules/finance'

export const metadata: Metadata = {
  title: 'Ver Transaccion Bancaria - Finance',
  description: 'Detalles de la transaccion bancaria'
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewBankTransactionPage({ params }: PageProps) {
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
      <ViewBankTransactionWrapper transactionId={id} />
    </Suspense>
  )
}
