/**
 * View DiscountRule Wrapper Component
 *
 * Wrapper component for viewing a discount rule's details.
 */

'use client'

import React from 'react'
import { useDiscountRule } from '../hooks/useDiscountRule'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { Alert } from '@/ui/components/base/Alert'
import { Button } from '@/ui/components/base/Button'
import { DiscountRuleStatusBadge } from './DiscountRuleStatusBadge'
import { DISCOUNT_TYPE_CONFIG, APPLIES_TO_CONFIG } from '../types'
import clsx from 'clsx'

interface ViewDiscountRuleWrapperProps {
  ruleId: string
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount)
}

export const ViewDiscountRuleWrapper: React.FC<ViewDiscountRuleWrapperProps> = ({ ruleId }) => {
  const navigation = useNavigationProgress()
  const { discountRule, isLoading, error } = useDiscountRule({ id: ruleId })

  const handleBack = () => {
    navigation.push('/dashboard/sales/discount-rules')
  }

  const handleEdit = () => {
    navigation.push(`/dashboard/sales/discount-rules/${ruleId}/edit`)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando regla de descuento...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !discountRule) {
    return (
      <div className="container-fluid py-4">
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2" />
          {error?.message || 'No se pudo cargar la regla de descuento'}
        </Alert>
        <button className="btn btn-secondary mt-3" onClick={handleBack}>
          <i className="bi bi-arrow-left me-2" />
          Volver
        </button>
      </div>
    )
  }

  const typeConfig = DISCOUNT_TYPE_CONFIG[discountRule.discountType]
  const appliesToConfig = APPLIES_TO_CONFIG[discountRule.appliesTo]

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-8">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div className="d-flex align-items-center">
              <button
                type="button"
                className="btn btn-link text-muted p-0 me-3"
                onClick={handleBack}
              >
                <i className="bi bi-arrow-left fs-4" />
              </button>
              <div>
                <div className="d-flex align-items-center gap-3">
                  <h1 className="h3 mb-0">{discountRule.name}</h1>
                  <DiscountRuleStatusBadge rule={discountRule} />
                </div>
                <p className="text-muted mb-0">
                  Codigo: <code className="fs-6">{discountRule.code}</code>
                </p>
              </div>
            </div>
            <Button variant="primary" onClick={handleEdit}>
              <i className="bi bi-pencil me-2" />
              Editar
            </Button>
          </div>

          {/* Main Info Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2" />
                Informacion General
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label text-muted small">Tipo de Descuento</label>
                  <div>
                    <span className={clsx('badge', typeConfig?.badgeClass || 'bg-secondary')}>
                      {typeConfig?.label || discountRule.discountType}
                    </span>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted small">Valor del Descuento</label>
                  <div className="fs-4 fw-bold text-success">{discountRule.discountDisplay}</div>
                </div>

                {discountRule.discountType === 'buy_x_get_y' && (
                  <>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Cantidad a Comprar</label>
                      <div className="fs-5">{discountRule.buyQuantity || '-'}</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Cantidad a Obtener</label>
                      <div className="fs-5">{discountRule.getQuantity || '-'}</div>
                    </div>
                  </>
                )}

                <div className="col-md-6">
                  <label className="form-label text-muted small">Aplica a</label>
                  <div>
                    <span className={clsx('badge', appliesToConfig?.badgeClass || 'bg-secondary')}>
                      {appliesToConfig?.label || discountRule.appliesTo}
                    </span>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted small">Prioridad</label>
                  <div>{discountRule.priority}</div>
                </div>

                {discountRule.description && (
                  <div className="col-12">
                    <label className="form-label text-muted small">Descripcion</label>
                    <div>{discountRule.description}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conditions Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-sliders me-2" />
                Condiciones
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-4">
                  <label className="form-label text-muted small">Monto Minimo de Orden</label>
                  <div>{formatCurrency(discountRule.minOrderAmount)}</div>
                </div>

                <div className="col-md-4">
                  <label className="form-label text-muted small">Cantidad Minima</label>
                  <div>{discountRule.minQuantity || '-'}</div>
                </div>

                <div className="col-md-4">
                  <label className="form-label text-muted small">Descuento Maximo</label>
                  <div>{formatCurrency(discountRule.maxDiscountAmount)}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted small">Combinable</label>
                  <div>
                    {discountRule.isCombinable ? (
                      <span className="text-success">
                        <i className="bi bi-check-circle me-1" />
                        Si
                      </span>
                    ) : (
                      <span className="text-danger">
                        <i className="bi bi-x-circle me-1" />
                        No
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Validity Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-calendar-range me-2" />
                Vigencia
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-4">
                  <label className="form-label text-muted small">Fecha de Inicio</label>
                  <div>{formatDate(discountRule.startDate)}</div>
                </div>

                <div className="col-md-4">
                  <label className="form-label text-muted small">Fecha de Fin</label>
                  <div className={clsx({ 'text-danger': discountRule.isExpired })}>
                    {formatDate(discountRule.endDate)}
                    {discountRule.isExpired && (
                      <span className="badge bg-danger ms-2">Expirado</span>
                    )}
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label text-muted small">Estado de Validez</label>
                  <div>{discountRule.validityLabel}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2" />
                Uso
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-4">
                  <label className="form-label text-muted small">Uso Actual</label>
                  <div className="fs-4 fw-bold">{discountRule.currentUsage || 0}</div>
                </div>

                <div className="col-md-4">
                  <label className="form-label text-muted small">Limite de Uso</label>
                  <div>{discountRule.usageLimit || 'Sin limite'}</div>
                </div>

                <div className="col-md-4">
                  <label className="form-label text-muted small">Uso por Cliente</label>
                  <div>{discountRule.usagePerCustomer || 'Sin limite'}</div>
                </div>

                {discountRule.usageLimit && (
                  <div className="col-12">
                    <label className="form-label text-muted small">Progreso de Uso</label>
                    <div className="progress" style={{ height: '25px' }}>
                      <div
                        className={clsx('progress-bar', {
                          'bg-success': (discountRule.currentUsage || 0) < discountRule.usageLimit * 0.7,
                          'bg-warning': (discountRule.currentUsage || 0) >= discountRule.usageLimit * 0.7 && (discountRule.currentUsage || 0) < discountRule.usageLimit * 0.9,
                          'bg-danger': (discountRule.currentUsage || 0) >= discountRule.usageLimit * 0.9
                        })}
                        role="progressbar"
                        style={{ width: `${Math.min(100, ((discountRule.currentUsage || 0) / discountRule.usageLimit) * 100)}%` }}
                      >
                        {discountRule.currentUsage || 0} / {discountRule.usageLimit}
                      </div>
                    </div>
                    {discountRule.usageRemaining !== null && discountRule.usageRemaining !== undefined && (
                      <small className="text-muted mt-1 d-block">
                        Usos restantes: {discountRule.usageRemaining}
                      </small>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2" />
                Informacion del Sistema
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label text-muted small">Fecha de Creacion</label>
                  <div>{formatDate(discountRule.createdAt)}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted small">Ultima Actualizacion</label>
                  <div>{formatDate(discountRule.updatedAt)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewDiscountRuleWrapper
