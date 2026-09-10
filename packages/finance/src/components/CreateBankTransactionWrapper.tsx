/**
 * CreateBankTransactionWrapper Component
 *
 * Wrapper component for creating a new bank transaction.
 */

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { BankTransactionFormComponent } from './BankTransactionForm'
import { useBankTransactionMutations } from '../hooks/useBankTransactionMutations'
import type { BankTransactionFormData } from '../types'

export const CreateBankTransactionWrapper: React.FC = () => {
  const router = useRouter()
  const { createBankTransaction, isLoading } = useBankTransactionMutations()

  const handleSubmit = async (data: BankTransactionFormData) => {
    await createBankTransaction({
      bankAccountId: data.bankAccountId,
      transactionDate: data.transactionDate,
      amount: data.amount,
      transactionType: data.transactionType,
      reference: data.reference,
      description: data.description,
      reconciliationStatus: data.reconciliationStatus,
      statementNumber: data.statementNumber,
      runningBalance: data.runningBalance,
      isActive: data.isActive,
    })
    router.push('/dashboard/finance/bank-transactions')
  }

  const handleCancel = () => {
    router.push('/dashboard/finance/bank-transactions')
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center mb-4">
            <button
              className="btn btn-link text-decoration-none p-0 me-3"
              onClick={handleCancel}
            >
              <i className="bi bi-arrow-left fs-4" />
            </button>
            <div>
              <h1 className="h3 mb-0">Nueva Transaccion Bancaria</h1>
              <p className="text-muted mb-0">Registrar un nuevo movimiento bancario</p>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <BankTransactionFormComponent
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateBankTransactionWrapper
