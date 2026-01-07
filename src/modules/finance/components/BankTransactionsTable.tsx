/**
 * BankTransactions Table Component
 *
 * Table for displaying bank transactions with actions.
 */

'use client'

import React, { useState, useRef } from 'react'
import clsx from 'clsx'
import { Button } from '@/ui/components/base/Button'
import ConfirmModal from '@/ui/components/base/ConfirmModal'
import type { ConfirmModalHandle } from '@/ui/components/base/ConfirmModal'
import { BankTransactionStatusBadge } from './BankTransactionStatusBadge'
import type { ParsedBankTransaction } from '../types'
import { BANK_TRANSACTION_TYPE_CONFIG } from '../types'

interface BankTransactionsTableProps {
  bankTransactions: ParsedBankTransaction[]
  isLoading?: boolean
  onEdit?: (transaction: ParsedBankTransaction) => void
  onDelete?: (transactionId: string) => Promise<void>
  onView?: (transaction: ParsedBankTransaction) => void
  onReconcile?: (transactionId: string, notes?: string) => Promise<void>
  onUnreconcile?: (transactionId: string) => Promise<void>
  className?: string
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  })
}

export const BankTransactionsTable: React.FC<BankTransactionsTableProps> = ({
  bankTransactions,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
  onReconcile,
  onUnreconcile,
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const setTransactionLoading = (transactionId: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [transactionId]: loading }))
  }

  const handleDelete = async (transaction: ParsedBankTransaction) => {
    if (!onDelete || !confirmModalRef.current) return

    const confirmed = await confirmModalRef.current.confirm(
      `Esta seguro de que quiere eliminar la transaccion con referencia "${transaction.reference || 'Sin referencia'}"? Esta accion no se puede deshacer.`,
      {
        title: 'Eliminar Transaccion Bancaria',
        confirmVariant: 'danger',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      }
    )

    if (confirmed) {
      setTransactionLoading(transaction.id, true)
      try {
        await onDelete(transaction.id)
      } finally {
        setTransactionLoading(transaction.id, false)
      }
    }
  }

  const handleReconcile = async (transaction: ParsedBankTransaction) => {
    if (!onReconcile || !confirmModalRef.current) return

    const confirmed = await confirmModalRef.current.confirm(
      `Deseas marcar esta transaccion como conciliada?`,
      {
        title: 'Conciliar Transaccion',
        confirmVariant: 'success',
        confirmText: 'Conciliar',
        cancelText: 'Cancelar',
      }
    )

    if (confirmed) {
      setTransactionLoading(transaction.id, true)
      try {
        await onReconcile(transaction.id)
      } finally {
        setTransactionLoading(transaction.id, false)
      }
    }
  }

  const handleUnreconcile = async (transaction: ParsedBankTransaction) => {
    if (!onUnreconcile || !confirmModalRef.current) return

    const confirmed = await confirmModalRef.current.confirm(
      `Deseas deshacer la conciliacion de esta transaccion?`,
      {
        title: 'Deshacer Conciliacion',
        confirmVariant: 'warning',
        confirmText: 'Deshacer',
        cancelText: 'Cancelar',
      }
    )

    if (confirmed) {
      setTransactionLoading(transaction.id, true)
      try {
        await onUnreconcile(transaction.id)
      } finally {
        setTransactionLoading(transaction.id, false)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando transacciones bancarias...</span>
        </div>
      </div>
    )
  }

  if (bankTransactions.length === 0) {
    return (
      <div className="text-center p-5">
        <i className="bi bi-bank display-1 text-muted mb-3"></i>
        <h5 className="text-muted">No hay transacciones bancarias</h5>
        <p className="text-muted">No se encontraron transacciones con los filtros seleccionados</p>
      </div>
    )
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th scope="col">Fecha</th>
              <th scope="col">Tipo</th>
              <th scope="col">Referencia</th>
              <th scope="col">Descripcion</th>
              <th scope="col" className="text-end">Monto</th>
              <th scope="col">Cuenta</th>
              <th scope="col">Estado</th>
              <th scope="col" className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {bankTransactions.map((transaction) => {
              const isTransactionLoading = loadingStates[transaction.id] || false
              const typeConfig = BANK_TRANSACTION_TYPE_CONFIG[transaction.transactionType]

              return (
                <tr key={transaction.id} className={clsx({ 'opacity-50': isTransactionLoading })}>
                  <td>
                    <div className="fw-medium">{formatDate(transaction.transactionDate)}</div>
                    {transaction.statementNumber && (
                      <small className="text-muted">Estado: {transaction.statementNumber}</small>
                    )}
                  </td>
                  <td>
                    <span className={clsx('badge', typeConfig?.badgeClass || 'bg-secondary')}>
                      <i className={clsx('bi', typeConfig?.icon, 'me-1')} />
                      {typeConfig?.label || transaction.transactionType}
                    </span>
                  </td>
                  <td>
                    <div className="font-monospace">{transaction.reference || '-'}</div>
                  </td>
                  <td>
                    <div
                      className="text-truncate"
                      style={{ maxWidth: '200px' }}
                      title={transaction.description || ''}
                    >
                      {transaction.description || '-'}
                    </div>
                  </td>
                  <td className="text-end">
                    <span
                      className={clsx(
                        'fw-bold',
                        transaction.transactionType === 'credit' ? 'text-success' : 'text-danger'
                      )}
                    >
                      {transaction.amountDisplay}
                    </span>
                    {transaction.runningBalance !== null && (
                      <small className="d-block text-muted">
                        Saldo: {formatCurrency(transaction.runningBalance)}
                      </small>
                    )}
                  </td>
                  <td>
                    <div>{transaction.bankAccountName || `Cuenta #${transaction.bankAccountId}`}</div>
                  </td>
                  <td>
                    <BankTransactionStatusBadge transaction={transaction} />
                    {transaction.reconciledByName && (
                      <small className="d-block text-muted">
                        Por: {transaction.reconciledByName}
                      </small>
                    )}
                  </td>
                  <td>
                    <div className="d-flex justify-content-end gap-1">
                      {transaction.reconciliationStatus === 'unreconciled' && onReconcile && (
                        <Button
                          size="small"
                          variant="success"
                          buttonStyle="outline"
                          title="Conciliar"
                          onClick={() => handleReconcile(transaction)}
                          disabled={isTransactionLoading}
                        >
                          <i className="bi bi-check-lg" />
                        </Button>
                      )}

                      {transaction.reconciliationStatus === 'reconciled' && onUnreconcile && (
                        <Button
                          size="small"
                          variant="warning"
                          buttonStyle="outline"
                          title="Deshacer conciliacion"
                          onClick={() => handleUnreconcile(transaction)}
                          disabled={isTransactionLoading}
                        >
                          <i className="bi bi-arrow-counterclockwise" />
                        </Button>
                      )}

                      {onView && (
                        <Button
                          size="small"
                          variant="secondary"
                          buttonStyle="outline"
                          title="Ver transaccion"
                          onClick={() => onView(transaction)}
                          disabled={isTransactionLoading}
                        >
                          <i className="bi bi-eye" />
                        </Button>
                      )}

                      {onEdit && (
                        <Button
                          size="small"
                          variant="primary"
                          buttonStyle="outline"
                          title="Editar transaccion"
                          onClick={() => onEdit(transaction)}
                          disabled={isTransactionLoading}
                        >
                          <i className="bi bi-pencil" />
                        </Button>
                      )}

                      {onDelete && (
                        <Button
                          size="small"
                          variant="danger"
                          buttonStyle="outline"
                          title="Eliminar transaccion"
                          onClick={() => handleDelete(transaction)}
                          disabled={isTransactionLoading}
                        >
                          <i className="bi bi-trash" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal ref={confirmModalRef} />
    </>
  )
}

export default BankTransactionsTable
