/**
 * Budgets Table Component
 *
 * Table for displaying budgets with actions.
 */

'use client'

import React, { useState, useRef } from 'react'
import clsx from 'clsx'
import { Button } from '@/ui/components/base/Button'
import ConfirmModal from '@/ui/components/base/ConfirmModal'
import type { ConfirmModalHandle } from '@/ui/components/base/ConfirmModal'
import { BudgetStatusBadge } from './BudgetStatusBadge'
import type { ParsedBudget } from '../types'
import { BUDGET_TYPE_CONFIG, BUDGET_PERIOD_TYPE_CONFIG } from '../types'

interface BudgetsTableProps {
  budgets: ParsedBudget[]
  isLoading?: boolean
  onEdit?: (budget: ParsedBudget) => void
  onDelete?: (budgetId: string) => Promise<void>
  onView?: (budget: ParsedBudget) => void
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

export const BudgetsTable: React.FC<BudgetsTableProps> = ({
  budgets,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const setBudgetLoading = (budgetId: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [budgetId]: loading }))
  }

  const handleDelete = async (budget: ParsedBudget) => {
    if (!onDelete || !confirmModalRef.current) return

    const confirmed = await confirmModalRef.current.confirm(
      `Esta seguro de que quiere eliminar el presupuesto "${budget.name}" (${budget.code})? Esta accion no se puede deshacer.`,
      {
        title: 'Eliminar Presupuesto',
        confirmVariant: 'danger',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      }
    )

    if (confirmed) {
      setBudgetLoading(budget.id, true)
      try {
        await onDelete(budget.id)
      } finally {
        setBudgetLoading(budget.id, false)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando presupuestos...</span>
        </div>
      </div>
    )
  }

  if (budgets.length === 0) {
    return (
      <div className="text-center p-5">
        <i className="bi bi-wallet2 display-1 text-muted mb-3"></i>
        <h5 className="text-muted">No hay presupuestos</h5>
        <p className="text-muted">No se encontraron presupuestos con los filtros seleccionados</p>
      </div>
    )
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th scope="col">Presupuesto</th>
              <th scope="col">Tipo</th>
              <th scope="col">Periodo</th>
              <th scope="col" className="text-end">Presupuestado</th>
              <th scope="col" className="text-end">Comprometido</th>
              <th scope="col" className="text-end">Gastado</th>
              <th scope="col" className="text-end">Disponible</th>
              <th scope="col">Estado</th>
              <th scope="col" className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((budget) => {
              const isBudgetLoading = loadingStates[budget.id] || false
              const typeConfig = BUDGET_TYPE_CONFIG[budget.budgetType]
              const periodConfig = BUDGET_PERIOD_TYPE_CONFIG[budget.periodType]

              return (
                <tr key={budget.id} className={clsx({ 'opacity-50': isBudgetLoading })}>
                  <td>
                    <div className="fw-medium">{budget.name}</div>
                    <small className="text-muted font-monospace">{budget.code}</small>
                    {!budget.isActive && (
                      <span className="badge bg-secondary ms-1">Inactivo</span>
                    )}
                  </td>
                  <td>
                    <span className={clsx('badge', typeConfig?.badgeClass || 'bg-secondary')}>
                      <i className={clsx('bi', typeConfig?.icon, 'me-1')} />
                      {typeConfig?.label || budget.budgetType}
                    </span>
                  </td>
                  <td>
                    <div>{periodConfig?.label || budget.periodType}</div>
                    <small className="text-muted">
                      {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                    </small>
                  </td>
                  <td className="text-end">
                    <span className="fw-bold">{budget.budgetedAmountDisplay}</span>
                  </td>
                  <td className="text-end">
                    <span className="text-warning">{budget.committedAmountDisplay}</span>
                  </td>
                  <td className="text-end">
                    <span className="text-danger">{budget.spentAmountDisplay}</span>
                  </td>
                  <td className="text-end">
                    <span className={clsx('fw-bold', {
                      'text-success': (budget.availableAmount || 0) > 0,
                      'text-danger': (budget.availableAmount || 0) <= 0,
                    })}>
                      {budget.availableAmountDisplay}
                    </span>
                  </td>
                  <td>
                    <BudgetStatusBadge budget={budget} />
                  </td>
                  <td>
                    <div className="d-flex justify-content-end gap-1">
                      {onView && (
                        <Button
                          size="small"
                          variant="secondary"
                          buttonStyle="outline"
                          title="Ver presupuesto"
                          onClick={() => onView(budget)}
                          disabled={isBudgetLoading}
                        >
                          <i className="bi bi-eye" />
                        </Button>
                      )}

                      {onEdit && (
                        <Button
                          size="small"
                          variant="primary"
                          buttonStyle="outline"
                          title="Editar presupuesto"
                          onClick={() => onEdit(budget)}
                          disabled={isBudgetLoading}
                        >
                          <i className="bi bi-pencil" />
                        </Button>
                      )}

                      {onDelete && (
                        <Button
                          size="small"
                          variant="danger"
                          buttonStyle="outline"
                          title="Eliminar presupuesto"
                          onClick={() => handleDelete(budget)}
                          disabled={isBudgetLoading}
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

export default BudgetsTable
