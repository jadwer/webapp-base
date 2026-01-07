/**
 * BUDGETS ADMIN PAGE
 *
 * Pagina de gestion de presupuestos.
 * Incluye metricas, filtros, acciones rapidas y tabla con operaciones CRUD.
 */

'use client'

import React, { useState, useCallback, useRef } from 'react'
import { useBudgets, useBudgetSummary, useBudgetMutations } from '../hooks'
import { BudgetsTable } from './BudgetsTable'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import ConfirmModal from '@/ui/components/base/ConfirmModal'
import type { ConfirmModalHandle } from '@/ui/components/base/ConfirmModal'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import type { BudgetFilters, BudgetType, BudgetPeriodType, ParsedBudget } from '../types'
import { BUDGET_TYPE_OPTIONS, BUDGET_PERIOD_TYPE_OPTIONS } from '../types'

export const BudgetsAdminPage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<BudgetType | null>(null)
  const [periodFilter, setPeriodFilter] = useState<BudgetPeriodType | null>(null)
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null)
  const [statusFilter, setStatusFilter] = useState<'warning' | 'critical' | null>(null)
  const pageSize = 20
  const navigation = useNavigationProgress()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  // Fetch budget summary for metrics
  const { summary, isLoading: summaryLoading } = useBudgetSummary()

  // Mutations hook
  const { deleteBudget, isLoading: isMutating } = useBudgetMutations()

  // Build filters
  const filters: BudgetFilters = {
    ...(typeFilter && { budgetType: typeFilter }),
    ...(periodFilter && { periodType: periodFilter }),
    ...(activeFilter !== null && { isActive: activeFilter }),
    ...(statusFilter === 'warning' && { overWarning: true }),
    ...(statusFilter === 'critical' && { overCritical: true }),
  }

  // Hooks con paginacion real del backend
  const { budgets, meta, isLoading, error, mutate } = useBudgets({
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    page: currentPage,
    pageSize: pageSize,
    sort: { field: 'name', direction: 'asc' },
  })

  // Paginacion desde meta structure
  const totalPages = meta?.lastPage || 1
  const totalItems = meta?.total || 0

  // Reset to page 1 when filters change
  const handleTypeFilter = (type: BudgetType | null) => {
    setTypeFilter(type)
    setCurrentPage(1)
  }

  const handlePeriodFilter = (period: BudgetPeriodType | null) => {
    setPeriodFilter(period)
    setCurrentPage(1)
  }

  const handleActiveFilter = (active: boolean | null) => {
    setActiveFilter(active)
    setCurrentPage(1)
  }

  const handleStatusFilter = (status: 'warning' | 'critical' | null) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setTypeFilter(null)
    setPeriodFilter(null)
    setActiveFilter(null)
    setStatusFilter(null)
    setCurrentPage(1)
  }

  // Action handlers
  const handleEdit = useCallback(
    (budget: ParsedBudget) => {
      navigation.push(`/dashboard/purchase/budgets/${budget.id}/edit`)
    },
    [navigation]
  )

  const handleView = useCallback(
    (budget: ParsedBudget) => {
      navigation.push(`/dashboard/purchase/budgets/${budget.id}`)
    },
    [navigation]
  )

  const handleDelete = useCallback(
    async (budgetId: string) => {
      try {
        await deleteBudget(budgetId)
        mutate()
      } catch (error) {
        console.error('Error deleting budget:', error)
      }
    },
    [deleteBudget, mutate]
  )

  const hasFilters = typeFilter || periodFilter || activeFilter !== null || statusFilter

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '$0.00'
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
          <h1 className="h3 mb-0">Presupuestos</h1>
          <p className="text-muted mb-0">Gestion y control de presupuestos de compras</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => navigation.push('/dashboard/purchase/budgets/create')}>
            <i className="bi bi-plus-lg me-2" />
            Nuevo Presupuesto
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
                  <h3 className="mb-0">{summaryLoading ? '--' : summary?.totalBudgets || 0}</h3>
                </div>
                <i className="bi bi-wallet2" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div
            className="card border-0 bg-success text-white"
            style={{ cursor: 'pointer' }}
            onClick={() => handleActiveFilter(true)}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Activos</h6>
                  <h3 className="mb-0">{summaryLoading ? '--' : summary?.activeBudgets || 0}</h3>
                </div>
                <i className="bi bi-check-circle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div
            className="card border-0 bg-warning text-white"
            style={{ cursor: 'pointer' }}
            onClick={() => handleStatusFilter('warning')}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">En Advertencia</h6>
                  <h3 className="mb-0">{summaryLoading ? '--' : summary?.budgetsOverWarning || 0}</h3>
                </div>
                <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div
            className="card border-0 bg-danger text-white"
            style={{ cursor: 'pointer' }}
            onClick={() => handleStatusFilter('critical')}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Criticos</h6>
                  <h3 className="mb-0">{summaryLoading ? '--' : summary?.budgetsOverCritical || 0}</h3>
                </div>
                <i className="bi bi-exclamation-circle" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div className="card border-0 bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Presupuestado</h6>
                  <h3 className="mb-0 small">{summaryLoading ? '--' : formatCurrency(summary?.totalBudgeted)}</h3>
                </div>
                <i className="bi bi-cash-stack" style={{ fontSize: '2rem', opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2">
          <div className="card border-0 bg-secondary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white-50">Disponible</h6>
                  <h3 className="mb-0 small">{summaryLoading ? '--' : formatCurrency(summary?.totalAvailable)}</h3>
                </div>
                <i className="bi bi-piggy-bank" style={{ fontSize: '2rem', opacity: 0.7 }} />
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

                {/* Type Filter */}
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={typeFilter || ''}
                  onChange={(e) => handleTypeFilter(e.target.value ? (e.target.value as BudgetType) : null)}
                >
                  <option value="">Todos los tipos</option>
                  {BUDGET_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Period Filter */}
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={periodFilter || ''}
                  onChange={(e) => handlePeriodFilter(e.target.value ? (e.target.value as BudgetPeriodType) : null)}
                >
                  <option value="">Todos los periodos</option>
                  {BUDGET_PERIOD_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <Button
                  variant={activeFilter === true ? 'success' : 'secondary'}
                  size="small"
                  onClick={() => handleActiveFilter(activeFilter === true ? null : true)}
                >
                  <i className="bi bi-check-circle me-1" />
                  Activos
                </Button>

                <Button
                  variant={activeFilter === false ? 'secondary' : 'secondary'}
                  size="small"
                  buttonStyle={activeFilter === false ? 'filled' : 'outline'}
                  onClick={() => handleActiveFilter(activeFilter === false ? null : false)}
                >
                  <i className="bi bi-x-circle me-1" />
                  Inactivos
                </Button>

                <Button
                  variant={statusFilter === 'warning' ? 'warning' : 'secondary'}
                  size="small"
                  onClick={() => handleStatusFilter(statusFilter === 'warning' ? null : 'warning')}
                >
                  <i className="bi bi-exclamation-triangle me-1" />
                  Advertencia
                </Button>

                <Button
                  variant={statusFilter === 'critical' ? 'danger' : 'secondary'}
                  size="small"
                  onClick={() => handleStatusFilter(statusFilter === 'critical' ? null : 'critical')}
                >
                  <i className="bi bi-exclamation-circle me-1" />
                  Criticos
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
          <strong>Error:</strong> {error.message || 'Error al cargar los presupuestos'}
        </Alert>
      )}

      {/* Alerts for critical situations */}
      {summary && summary.budgetsOverCritical > 0 && (
        <Alert variant="danger" className="mb-3">
          <i className="bi bi-exclamation-circle me-2" />
          <strong>Atencion:</strong> Tienes {summary.budgetsOverCritical} presupuestos en estado critico.
        </Alert>
      )}

      {summary && summary.budgetsOverWarning > 0 && summary.budgetsOverCritical === 0 && (
        <Alert variant="warning" className="mb-3">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Aviso:</strong> Tienes {summary.budgetsOverWarning} presupuestos con advertencia de uso.
        </Alert>
      )}

      {/* Content */}
      <div className="card">
        <div className="card-body p-0">
          <BudgetsTable
            budgets={budgets}
            isLoading={isLoading || isMutating}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top">
              <div className="text-muted">
                Mostrando {budgets.length} de {totalItems} presupuestos
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

export default BudgetsAdminPage
