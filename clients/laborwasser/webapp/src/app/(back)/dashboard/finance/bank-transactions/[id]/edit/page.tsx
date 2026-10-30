/**
 * EDIT BANK TRANSACTION PAGE
 * Pagina para editar una transaccion bancaria existente
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { EditBankTransactionWrapper } from '@/modules/finance'

export const metadata: Metadata = {
  title: 'Editar Transacción Bancaria - Finance',
  description: 'Editar una transacción bancaria'
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditBankTransactionPage({ params }: PageProps) {
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
      <EditBankTransactionWrapper transactionId={id} />
    </Suspense>
  )
}
