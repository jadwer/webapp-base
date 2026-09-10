/**
 * EditBankTransactionWrapper Component
 *
 * Wrapper component for editing an existing bank transaction.
 */

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { BankTransactionFormComponent } from './BankTransactionForm'
import { useBankTransaction } from '../hooks/useBankTransaction'
import { useBankTransactionMutations } from '../hooks/useBankTransactionMutations'
import type { BankTransactionFormData } from '../types'

interface EditBankTransactionWrapperProps {
  transactionId: string
}

export const EditBankTransactionWrapper: React.FC<EditBankTransactionWrapperProps> = ({
  transactionId,
}) => {
  const router = useRouter()
  const { bankTransaction, isLoading: isLoadingTransaction, error } = useBankTransaction({ id: transactionId })
  const { updateBankTransaction, isLoading: isMutating } = useBankTransactionMutations()

  const handleSubmit = async (data: BankTransactionFormData) => {
    await updateBankTransaction(transactionId, {
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

  if (isLoadingTransaction) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando transaccion...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar la transaccion: {error.message}
        </div>
        <button className="btn btn-secondary" onClick={handleCancel}>
          Volver
        </button>
      </div>
    )
  }

  if (!bankTransaction) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-info-circle me-2" />
          Transaccion no encontrada
        </div>
        <button className="btn btn-secondary" onClick={handleCancel}>
          Volver
        </button>
      </div>
    )
  }

  // Map transaction to form data, converting nulls to undefined
  const initialData: Partial<BankTransactionFormData> = {
    bankAccountId: bankTransaction.bankAccountId,
    transactionDate: bankTransaction.transactionDate,
    amount: bankTransaction.amount,
    transactionType: bankTransaction.transactionType,
    reference: bankTransaction.reference ?? undefined,
    description: bankTransaction.description ?? undefined,
    reconciliationStatus: bankTransaction.reconciliationStatus,
    statementNumber: bankTransaction.statementNumber ?? undefined,
    runningBalance: bankTransaction.runningBalance ?? undefined,
    isActive: bankTransaction.isActive,
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
              <h1 className="h3 mb-0">Editar Transaccion Bancaria</h1>
              <p className="text-muted mb-0">
                {bankTransaction.reference || `Transaccion #${transactionId}`}
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <BankTransactionFormComponent
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isEdit={true}
                isLoading={isMutating}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditBankTransactionWrapper
