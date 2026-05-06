/**
 * BANK TRANSACTIONS ADMIN PAGE
 *
 * Pagina de gestion de transacciones bancarias.
 * Incluye metricas, filtros, acciones rapidas y tabla con operaciones CRUD.
 */

'use client'

import React, { useState, useCallback, useRef } from 'react'
import { useBankTransactions } from '../hooks/useBankTransactions'
import { useBankTransactionMutations } from '../hooks/useBankTransactionMutations'
import { useBankAccounts } from '../hooks'
import { BankTransactionsTable } from './BankTransactionsTable'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import ConfirmModal from '@/ui/components/base/ConfirmModal'
import type { ConfirmModalHandle } from '@/ui/components/base/ConfirmModal'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import type { BankTransactionFilters, BankTransactionType, ReconciliationStatus, ParsedBankTransaction } from '../types'

export const BankTransactionsAdminPage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<BankTransactionType | null>(null)
  const [statusFilter, setStatusFilter] = useState<ReconciliationStatus | null>(null)
  const [accountFilter, setAccountFilter] = useState<number | null>(null)
  const pageSize = 20
  const navigation = useNavigationProgress()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  // Fetch bank accounts for filter dropdown
  const { bankAccounts } = useBankAccounts()

  // Mutations hook
  const { deleteBankTransaction, reconcile, unreconcile, isLoading: isMutating } = useBankTransactionMutations()

  // Build filters
  const filters: BankTransactionFilters = {
    ...(typeFilter && { transactionType: typeFilter }),
    ...(statusFilter && { reconciliationStatus: statusFilter }),
    ...(accountFilter && { bankAccountId: accountFilter }),
  }

  // Hooks con paginacion real del backend
  const { bankTransactions, meta, isLoading, error, mutate } = useBankTransactions({
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    page: currentPage,
    pageSize: pageSize,
    sort: { field: 'transactionDate', direction: 'desc' },
  })

  // Paginacion desde meta structure
  const totalPages = meta?.lastPage || 1
  const totalItems = meta?.total || 0

  // Calculate metrics dynamically
  const transactionMetrics = React.useMemo(() => {
    return {
      total: bankTransactions.length,
      credits: bankTransactions.filter((t) => t.transactionType === 'credit').length,
      debits: bankTransactions.filter((t) => t.transactionType === 'debit').length,
      reconciled: bankTransactions.filter((t) => t.reconciliationStatus === 'reconciled').length,
      unreconciled: bankTransactions.filter((t) => t.reconciliationStatus === 'unreconciled').length,
      totalCredits: bankTransactions
        .filter((t) => t.transactionType === 'credit')
        .reduce((sum, t) => sum + t.amount, 0),
      totalDebits: bankTransactions
        .filter((t) => t.transactionType === 'debit')
        .reduce((sum, t) => sum + t.amount, 0),
    }
  }, [bankTransactions])

  // Reset to page 1 when filters change
  const handleTypeFilter = (type: BankTransactionType | null) => {
    setTypeFilter(type)
    setCurrentPage(1)
  }

  const handleStatusFilter = (status: ReconciliationStatus | null) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleAccountFilter = (accountId: number | null) => {
    setAccountFilter(accountId)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setTypeFilter(null)
    setStatusFilter(null)
    setAccountFilter(null)
    setCurrentPage(1)
  }

  // Action handlers
  const handleEdit = useCallback(
    (transaction: ParsedBankTransaction) => {
      navigation.push(`/dashboard/finance/bank-transactions/${transaction.id}/edit`)
    },
    [navigation]
  )

  const handleView = useCallback(
    (transaction: ParsedBankTransaction) => {
      navigation.push(`/dashboard/finance/bank-transactions/${transaction.id}`)
    },
    [navigation]
  )

  const handleDelete = useCallback(
    async (transactionId: string) => {
      try {
        await deleteBankTransaction(transactionId)
        mutate()
      } catch {
        // deletion failed silently
      }
    },
    [deleteBankTransaction, mutate]
  )

  const handleReconcile = useCallback(
    async (transactionId: string, notes?: string) => {
      try {
        await reconcile(transactionId, notes)
        mutate()
      } catch {
        // reconciliation failed silently
      }
    },
    [reconcile, mutate]
  )

  const handleUnreconcile = useCallback(
    async (transactionId: string) => {
      try {
        await unreconcile(transactionId)
        mutate()
      } catch {
        // unreconciliation failed silently
      }
    },
    [unreconcile, mutate]
  )

  const hasFilters = typeFilter || statusFilter || accountFilter

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
    })
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Transacciones Bancarias</h1>
          <p className="text-muted mb-0">Gestion y conciliacion de movimientos bancarios</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => navigation.push('/dashboard/finance/bank-transactions/create')}>
            <i className="bi bi-plus-lg me-2" />
            Nueva Transaccion
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-2">
          <div className="card border-0 bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Total</h6>
                  <h3 className="mb-0">{totalItems || '--'}</h3>
                </div>
                <i className="bi bi-bank" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div
            className="card border-0 bg-success text-white"
            style={{ cursor: 'pointer' }}
            onClick={() => handleTypeFilter('credit')}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Creditos</h6>
                  <h3 className="mb-0">{transactionMetrics.credits}</h3>
                  <small>{formatCurrency(transactionMetrics.totalCredits)}</small>
                </div>
                <i className="bi bi-arrow-up-circle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div
            className="card border-0 bg-danger text-white"
            style={{ cursor: 'pointer' }}
            onClick={() => handleTypeFilter('debit')}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Debitos</h6>
                  <h3 className="mb-0">{transactionMetrics.debits}</h3>
                  <small>{formatCurrency(transactionMetrics.totalDebits)}</small>
                </div>
                <i className="bi bi-arrow-down-circle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div
            className="card border-0 bg-warning text-white"
            style={{ cursor: 'pointer' }}
            onClick={() => handleStatusFilter('unreconciled')}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Sin Conciliar</h6>
                  <h3 className="mb-0">{transactionMetrics.unreconciled}</h3>
                </div>
                <i className="bi bi-exclamation-circle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div
            className="card border-0 bg-info text-white"
            style={{ cursor: 'pointer' }}
            onClick={() => handleStatusFilter('reconciled')}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Conciliadas</h6>
                  <h3 className="mb-0">{transactionMetrics.reconciled}</h3>
                </div>
                <i className="bi bi-check-circle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div className="card border-0 bg-secondary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Balance Neto</h6>
                  <h3 className="mb-0 small">
                    {formatCurrency(transactionMetrics.totalCredits - transactionMetrics.totalDebits)}
                  </h3>
                </div>
                <i className="bi bi-calculator" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body py-3">
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <span className="text-muted me-2">Filtros:</span>

                {/* Account Filter */}
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={accountFilter || ''}
                  onChange={(e) => handleAccountFilter(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Todas las cuentas</option>
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountName}
                    </option>
                  ))}
                </select>

                <Button
                  variant={typeFilter === 'credit' ? 'success' : 'secondary'}
                  size="small"
                  onClick={() => handleTypeFilter(typeFilter === 'credit' ? null : 'credit')}
                >
                  <i className="bi bi-arrow-up-circle me-1" />
                  Creditos
                </Button>

                <Button
                  variant={typeFilter === 'debit' ? 'danger' : 'secondary'}
                  size="small"
                  onClick={() => handleTypeFilter(typeFilter === 'debit' ? null : 'debit')}
                >
                  <i className="bi bi-arrow-down-circle me-1" />
                  Debitos
                </Button>

                <Button
                  variant={statusFilter === 'unreconciled' ? 'warning' : 'secondary'}
                  size="small"
                  onClick={() => handleStatusFilter(statusFilter === 'unreconciled' ? null : 'unreconciled')}
                >
                  <i className="bi bi-exclamation-circle me-1" />
                  Sin Conciliar
                </Button>

                <Button
                  variant={statusFilter === 'reconciled' ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => handleStatusFilter(statusFilter === 'reconciled' ? null : 'reconciled')}
                >
                  <i className="bi bi-check-circle me-1" />
                  Conciliadas
                </Button>

                {hasFilters && (
                  <Button variant="secondary" size="small" onClick={handleClearFilters}>
                    <i className="bi bi-x-lg me-1" />
                    Limpiar Filtros
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Error:</strong> {error.message || 'Error al cargar las transacciones bancarias'}
        </Alert>
      )}

      {/* Alerts for critical situations */}
      {transactionMetrics.unreconciled > 10 && (
        <Alert variant="warning" className="mb-3">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Atencion:</strong> Tienes {transactionMetrics.unreconciled} transacciones pendientes de conciliacion.
        </Alert>
      )}

      {/* Content */}
      <div className="card">
        <div className="card-body p-0">
          <BankTransactionsTable
            bankTransactions={bankTransactions}
            isLoading={isLoading || isMutating}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            onReconcile={handleReconcile}
            onUnreconcile={handleUnreconcile}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top">
              <div className="text-muted">
                Mostrando {bankTransactions.length} de {totalItems} transacciones
              </div>
              <nav>
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                      Primera
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </button>
                  </li>
                  <li className="page-item active">
                    <span className="page-link">
                      {currentPage} / {totalPages}
                    </span>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Ultima
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}

export default BankTransactionsAdminPage
