/**
 * View Budget Wrapper Component
 *
 * Wrapper component for viewing budget details.
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { useBudget } from '../hooks'
import { BudgetStatusBadge } from './BudgetStatusBadge'
import { Button } from '@/ui/components/base/Button'
import { Alert } from '@/ui/components/base/Alert'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { BUDGET_TYPE_CONFIG, BUDGET_PERIOD_TYPE_CONFIG } from '../types'
import clsx from 'clsx'

interface ViewBudgetWrapperProps {
  budgetId: string
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

export const ViewBudgetWrapper: React.FC<ViewBudgetWrapperProps> = ({ budgetId }) => {
  const navigation = useNavigationProgress()
  const { budget, isLoading, error } = useBudget({ id: budgetId })

  // Loading state
  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando presupuesto...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container-fluid py-4">
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar el presupuesto: {error.message || 'Error desconocido'}
        </Alert>
      </div>
    )
  }

  // Not found state
  if (!budget) {
    return (
      <div className="container-fluid py-4">
        <Alert variant="warning">
          <i className="bi bi-exclamation-triangle me-2" />
          No se encontro el presupuesto solicitado
        </Alert>
      </div>
    )
  }

  const typeConfig = BUDGET_TYPE_CONFIG[budget.budgetType]
  const periodConfig = BUDGET_PERIOD_TYPE_CONFIG[budget.periodType]

  // Calculate progress percentage
  const utilizationPercent = budget.utilizationPercent || 0
  const progressClass = utilizationPercent >= 100 ? 'bg-danger' :
    utilizationPercent >= (budget.criticalThreshold || 95) ? 'bg-danger' :
    utilizationPercent >= (budget.warningThreshold || 80) ? 'bg-warning' : 'bg-success'

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/dashboard/purchase/budgets">
                Presupuestos
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {budget.name}
            </li>
          </ol>
        </nav>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h1 className="h3 mb-1">{budget.name}</h1>
            <p className="text-muted mb-0">
              <span className="font-monospace">{budget.code}</span>
              {!budget.isActive && (
                <span className="badge bg-secondary ms-2">Inactivo</span>
              )}
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              buttonStyle="outline"
              onClick={() => navigation.push('/dashboard/purchase/budgets')}
            >
              <i className="bi bi-arrow-left me-2" />
              Volver
            </Button>
            <Button
              variant="primary"
              onClick={() => navigation.push(`/dashboard/purchase/budgets/${budgetId}/edit`)}
            >
              <i className="bi bi-pencil me-2" />
              Editar
            </Button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Main Info */}
        <div className="col-lg-8">
          {/* Budget Progress Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Utilizacion del Presupuesto</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Progreso</span>
                <BudgetStatusBadge budget={budget} showUtilization={true} />
              </div>
              <div className="progress mb-3" style={{ height: '20px' }}>
                <div
                  className={clsx('progress-bar', progressClass)}
                  role="progressbar"
                  style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                  aria-valuenow={utilizationPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  {utilizationPercent.toFixed(1)}%
                </div>
              </div>

              <div className="row g-3 text-center">
                <div className="col-3">
                  <div className="border rounded p-3">
                    <h4 className="mb-1 text-primary">{budget.budgetedAmountDisplay}</h4>
                    <small className="text-muted">Presupuestado</small>
                  </div>
                </div>
                <div className="col-3">
                  <div className="border rounded p-3">
                    <h4 className="mb-1 text-warning">{budget.committedAmountDisplay}</h4>
                    <small className="text-muted">Comprometido</small>
                  </div>
                </div>
                <div className="col-3">
                  <div className="border rounded p-3">
                    <h4 className="mb-1 text-danger">{budget.spentAmountDisplay}</h4>
                    <small className="text-muted">Gastado</small>
                  </div>
                </div>
                <div className="col-3">
                  <div className="border rounded p-3">
                    <h4 className={clsx('mb-1', {
                      'text-success': (budget.availableAmount || 0) > 0,
                      'text-danger': (budget.availableAmount || 0) <= 0,
                    })}>
                      {budget.availableAmountDisplay}
                    </h4>
                    <small className="text-muted">Disponible</small>
                  </div>
                </div>
              </div>

              {/* Threshold indicators */}
              <div className="mt-3 pt-3 border-top">
                <small className="text-muted d-block mb-2">Umbrales configurados:</small>
                <div className="d-flex gap-3">
                  <span className="badge bg-warning text-dark">
                    <i className="bi bi-exclamation-triangle me-1" />
                    Advertencia: {budget.warningThreshold || 80}%
                  </span>
                  <span className="badge bg-danger">
                    <i className="bi bi-exclamation-circle me-1" />
                    Critico: {budget.criticalThreshold || 95}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {budget.description && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Descripcion</h5>
              </div>
              <div className="card-body">
                <p className="mb-0">{budget.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="col-lg-4">
          {/* Type and Period */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Clasificacion</h5>
            </div>
            <div className="card-body">
              <dl className="mb-0">
                <dt className="text-muted small">Tipo de Presupuesto</dt>
                <dd>
                  <span className={clsx('badge', typeConfig?.badgeClass || 'bg-secondary')}>
                    <i className={clsx('bi', typeConfig?.icon, 'me-1')} />
                    {typeConfig?.label || budget.budgetType}
                  </span>
                </dd>

                <dt className="text-muted small mt-3">Periodo</dt>
                <dd>{periodConfig?.label || budget.periodType}</dd>

                <dt className="text-muted small mt-3">Vigencia</dt>
                <dd>
                  {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                </dd>

                {budget.fiscalYear && (
                  <>
                    <dt className="text-muted small mt-3">Ano Fiscal</dt>
                    <dd>{budget.fiscalYear}</dd>
                  </>
                )}

                {budget.departmentCode && (
                  <>
                    <dt className="text-muted small mt-3">Departamento</dt>
                    <dd className="font-monospace">{budget.departmentCode}</dd>
                  </>
                )}

                {budget.projectCode && (
                  <>
                    <dt className="text-muted small mt-3">Proyecto</dt>
                    <dd className="font-monospace">{budget.projectCode}</dd>
                  </>
                )}

                {budget.categoryName && (
                  <>
                    <dt className="text-muted small mt-3">Categoria</dt>
                    <dd>{budget.categoryName}</dd>
                  </>
                )}

                {budget.contactName && (
                  <>
                    <dt className="text-muted small mt-3">Proveedor</dt>
                    <dd>{budget.contactName}</dd>
                  </>
                )}
              </dl>
            </div>
          </div>

          {/* Options */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Configuracion</h5>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <i className={clsx('bi me-2', budget.hardLimit ? 'bi-check-circle text-success' : 'bi-x-circle text-muted')} />
                <span>Limite Estricto</span>
              </div>
              <div className="d-flex align-items-center mb-3">
                <i className={clsx('bi me-2', budget.allowOvercommit ? 'bi-check-circle text-success' : 'bi-x-circle text-muted')} />
                <span>Permite Sobrecompromiso</span>
              </div>
              <div className="d-flex align-items-center">
                <i className={clsx('bi me-2', budget.isActive ? 'bi-check-circle text-success' : 'bi-x-circle text-muted')} />
                <span>Activo</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Informacion del Registro</h5>
            </div>
            <div className="card-body">
              <dl className="mb-0">
                <dt className="text-muted small">Creado</dt>
                <dd>{formatDate(budget.createdAt)}</dd>

                <dt className="text-muted small mt-3">Actualizado</dt>
                <dd>{formatDate(budget.updatedAt)}</dd>

                <dt className="text-muted small mt-3">ID</dt>
                <dd className="font-monospace">{budget.id}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewBudgetWrapper
