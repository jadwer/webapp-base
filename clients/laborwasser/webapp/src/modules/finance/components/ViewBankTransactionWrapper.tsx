/**
 * ViewBankTransactionWrapper Component
 *
 * Wrapper component for viewing bank transaction details.
 */

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { Button } from '@/ui/components/base/Button'
import { useBankTransaction } from '../hooks/useBankTransaction'
import { BankTransactionStatusBadge } from './BankTransactionStatusBadge'
import { BANK_TRANSACTION_TYPE_CONFIG } from '../types'

interface ViewBankTransactionWrapperProps {
  transactionId: string
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '-'
  return amount.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  })
}

export const ViewBankTransactionWrapper: React.FC<ViewBankTransactionWrapperProps> = ({
  transactionId,
}) => {
  const router = useRouter()
  const { bankTransaction, isLoading, error } = useBankTransaction({ id: transactionId })

  const handleBack = () => {
    router.push('/dashboard/finance/bank-transactions')
  }

  const handleEdit = () => {
    router.push(`/dashboard/finance/bank-transactions/${transactionId}/edit`)
  }

  if (isLoading) {
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
        <button className="btn btn-secondary" onClick={handleBack}>
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
        <button className="btn btn-secondary" onClick={handleBack}>
          Volver
        </button>
      </div>
    )
  }

  const typeConfig = BANK_TRANSACTION_TYPE_CONFIG[bankTransaction.transactionType]

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div className="d-flex align-items-center">
          <button className="btn btn-link text-decoration-none p-0 me-3" onClick={handleBack}>
            <i className="bi bi-arrow-left fs-4" />
          </button>
          <div>
            <h1 className="h3 mb-0">Transaccion Bancaria</h1>
            <p className="text-muted mb-0">
              {bankTransaction.reference || `Transaccion #${transactionId}`}
            </p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={handleEdit}>
            <i className="bi bi-pencil me-2" />
            Editar
          </Button>
        </div>
      </div>

      <div className="row g-4">
        {/* Main Info Card */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">Informacion de la Transaccion</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="text-muted small d-block">Tipo de Transaccion</label>
                  <span className={clsx('badge', typeConfig?.badgeClass || 'bg-secondary', 'fs-6')}>
                    <i className={clsx('bi', typeConfig?.icon, 'me-1')} />
                    {typeConfig?.label || bankTransaction.transactionType}
                  </span>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small d-block">Monto</label>
                  <span
                    className={clsx(
                      'fw-bold fs-4',
                      bankTransaction.transactionType === 'credit' ? 'text-success' : 'text-danger'
                    )}
                  >
                    {bankTransaction.amountDisplay}
                  </span>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small d-block">Fecha de Transaccion</label>
                  <span className="fw-medium">{formatDate(bankTransaction.transactionDate)}</span>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small d-block">Cuenta Bancaria</label>
                  <span className="fw-medium">
                    {bankTransaction.bankAccountName || `Cuenta #${bankTransaction.bankAccountId}`}
                  </span>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small d-block">Referencia</label>
                  <span className="font-monospace">{bankTransaction.reference || '-'}</span>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small d-block">Numero de Estado de Cuenta</label>
                  <span>{bankTransaction.statementNumber || '-'}</span>
                </div>
                {bankTransaction.description && (
                  <div className="col-12">
                    <label className="text-muted small d-block">Descripcion</label>
                    <p className="mb-0">{bankTransaction.description}</p>
                  </div>
                )}
                {bankTransaction.runningBalance !== null && (
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Saldo Acumulado</label>
                    <span className="fw-medium">{formatCurrency(bankTransaction.runningBalance)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">Estado de Conciliacion</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <BankTransactionStatusBadge transaction={bankTransaction} showType />
              </div>
              {bankTransaction.reconciliationStatus === 'reconciled' && (
                <>
                  {bankTransaction.reconciledByName && (
                    <div className="mb-2">
                      <label className="text-muted small d-block">Conciliado por</label>
                      <span>{bankTransaction.reconciledByName}</span>
                    </div>
                  )}
                  {bankTransaction.reconciledAt && (
                    <div className="mb-2">
                      <label className="text-muted small d-block">Fecha de Conciliacion</label>
                      <span>{formatDateTime(bankTransaction.reconciledAt)}</span>
                    </div>
                  )}
                  {bankTransaction.reconciliationNotes && (
                    <div className="mb-2">
                      <label className="text-muted small d-block">Notas de Conciliacion</label>
                      <p className="mb-0 small">{bankTransaction.reconciliationNotes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Metadata Card */}
          <div className="card mt-3">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">Informacion del Sistema</h5>
            </div>
            <div className="card-body">
              <div className="mb-2">
                <label className="text-muted small d-block">ID</label>
                <span className="font-monospace small">{bankTransaction.id}</span>
              </div>
              <div className="mb-2">
                <label className="text-muted small d-block">Creado</label>
                <span className="small">{formatDateTime(bankTransaction.createdAt)}</span>
              </div>
              <div className="mb-2">
                <label className="text-muted small d-block">Actualizado</label>
                <span className="small">{formatDateTime(bankTransaction.updatedAt)}</span>
              </div>
              <div>
                <label className="text-muted small d-block">Estado</label>
                <span
                  className={clsx('badge', bankTransaction.isActive ? 'bg-success' : 'bg-secondary')}
                >
                  {bankTransaction.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewBankTransactionWrapper
