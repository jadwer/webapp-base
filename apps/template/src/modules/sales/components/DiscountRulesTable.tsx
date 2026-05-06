/**
 * DiscountRules Table Component
 *
 * Table for displaying discount rules with actions.
 */

'use client'

import React, { useState, useRef } from 'react'
import clsx from 'clsx'
import { Button } from '@/ui/components/base/Button'
import ConfirmModal from '@/ui/components/base/ConfirmModal'
import type { ConfirmModalHandle } from '@/ui/components/base/ConfirmModal'
import { DiscountRuleStatusBadge } from './DiscountRuleStatusBadge'
import type { ParsedDiscountRule } from '../types'
import { DISCOUNT_TYPE_CONFIG, APPLIES_TO_CONFIG } from '../types'

interface DiscountRulesTableProps {
  discountRules: ParsedDiscountRule[]
  isLoading?: boolean
  onEdit?: (rule: ParsedDiscountRule) => void
  onDelete?: (ruleId: string) => Promise<void>
  onView?: (rule: ParsedDiscountRule) => void
  onToggleActive?: (ruleId: string, isActive: boolean) => Promise<void>
  className?: string
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

export const DiscountRulesTable: React.FC<DiscountRulesTableProps> = ({
  discountRules,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
  onToggleActive
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const setRuleLoading = (ruleId: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [ruleId]: loading }))
  }

  const handleDelete = async (rule: ParsedDiscountRule) => {
    if (!onDelete || !confirmModalRef.current) return

    const confirmed = await confirmModalRef.current.confirm(
      `Esta seguro de que quiere eliminar la regla de descuento "${rule.name}"? Esta accion no se puede deshacer.`,
      {
        title: 'Eliminar Regla de Descuento',
        confirmVariant: 'danger',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    )

    if (confirmed) {
      setRuleLoading(rule.id, true)
      try {
        await onDelete(rule.id)
      } finally {
        setRuleLoading(rule.id, false)
      }
    }
  }

  const handleToggleActive = async (rule: ParsedDiscountRule) => {
    if (!onToggleActive || !confirmModalRef.current) return

    const newStatus = !rule.isActive
    const action = newStatus ? 'activar' : 'desactivar'

    const confirmed = await confirmModalRef.current.confirm(
      `Deseas ${action} la regla de descuento "${rule.name}"?`,
      {
        title: `${newStatus ? 'Activar' : 'Desactivar'} Regla`,
        confirmVariant: newStatus ? 'success' : 'warning',
        confirmText: newStatus ? 'Activar' : 'Desactivar',
        cancelText: 'Cancelar'
      }
    )

    if (confirmed) {
      setRuleLoading(rule.id, true)
      try {
        await onToggleActive(rule.id, newStatus)
      } finally {
        setRuleLoading(rule.id, false)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando reglas de descuento...</span>
        </div>
      </div>
    )
  }

  if (discountRules.length === 0) {
    return (
      <div className="text-center p-5">
        <i className="bi bi-percent display-1 text-muted mb-3"></i>
        <h5 className="text-muted">No hay reglas de descuento</h5>
        <p className="text-muted">Crea tu primera regla de descuento para comenzar</p>
      </div>
    )
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th scope="col">Codigo</th>
              <th scope="col">Nombre</th>
              <th scope="col">Tipo</th>
              <th scope="col">Descuento</th>
              <th scope="col">Aplica a</th>
              <th scope="col">Vigencia</th>
              <th scope="col">Uso</th>
              <th scope="col">Estado</th>
              <th scope="col" className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {discountRules.map(rule => {
              const isRuleLoading = loadingStates[rule.id] || false
              const typeConfig = DISCOUNT_TYPE_CONFIG[rule.discountType]
              const appliesToConfig = APPLIES_TO_CONFIG[rule.appliesTo]

              return (
                <tr key={rule.id} className={clsx({ 'opacity-50': isRuleLoading })}>
                  <td>
                    <div className="fw-medium font-monospace">{rule.code}</div>
                    <small className="text-muted">Prioridad: {rule.priority}</small>
                  </td>
                  <td>
                    <div className="fw-medium">{rule.name}</div>
                    {rule.description && (
                      <small className="text-muted d-block text-truncate" style={{ maxWidth: '200px' }}>
                        {rule.description}
                      </small>
                    )}
                  </td>
                  <td>
                    <span className={clsx('badge', typeConfig?.badgeClass || 'bg-secondary')}>
                      {typeConfig?.label || rule.discountType}
                    </span>
                  </td>
                  <td>
                    <span className="fw-bold text-success">{rule.discountDisplay}</span>
                    {rule.maxDiscountAmount && (
                      <small className="d-block text-muted">
                        Max: ${rule.maxDiscountAmount.toFixed(2)}
                      </small>
                    )}
                  </td>
                  <td>
                    <span className={clsx('badge', appliesToConfig?.badgeClass || 'bg-secondary')}>
                      {appliesToConfig?.label || rule.appliesTo}
                    </span>
                  </td>
                  <td>
                    <div>
                      {rule.startDate && (
                        <small className="d-block">
                          <i className="bi bi-calendar-event me-1" />
                          Desde: {formatDate(rule.startDate)}
                        </small>
                      )}
                      {rule.endDate && (
                        <small className={clsx('d-block', { 'text-danger': rule.isExpired })}>
                          <i className="bi bi-calendar-x me-1" />
                          Hasta: {formatDate(rule.endDate)}
                        </small>
                      )}
                      {!rule.startDate && !rule.endDate && (
                        <small className="text-muted">Sin fecha limite</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <span className="fw-medium">{rule.currentUsage || 0}</span>
                      {rule.usageLimit ? (
                        <span className="text-muted"> / {rule.usageLimit}</span>
                      ) : (
                        <span className="text-muted"> (sin limite)</span>
                      )}
                    </div>
                    {rule.usageRemaining !== null && rule.usageRemaining !== undefined && rule.usageLimit && (
                      <small className={clsx({ 'text-danger': rule.usageRemaining <= 5 })}>
                        Restante: {rule.usageRemaining}
                      </small>
                    )}
                  </td>
                  <td>
                    <DiscountRuleStatusBadge rule={rule} />
                  </td>
                  <td>
                    <div className="d-flex justify-content-end gap-1">
                      {onToggleActive && (
                        <Button
                          size="small"
                          variant={rule.isActive ? 'warning' : 'success'}
                          buttonStyle="outline"
                          title={rule.isActive ? 'Desactivar' : 'Activar'}
                          onClick={() => handleToggleActive(rule)}
                          disabled={isRuleLoading}
                        >
                          <i className={clsx('bi', rule.isActive ? 'bi-pause' : 'bi-play')} />
                        </Button>
                      )}

                      {onView && (
                        <Button
                          size="small"
                          variant="secondary"
                          buttonStyle="outline"
                          title="Ver regla"
                          onClick={() => onView(rule)}
                          disabled={isRuleLoading}
                        >
                          <i className="bi bi-eye" />
                        </Button>
                      )}

                      {onEdit && (
                        <Button
                          size="small"
                          variant="primary"
                          buttonStyle="outline"
                          title="Editar regla"
                          onClick={() => onEdit(rule)}
                          disabled={isRuleLoading}
                        >
                          <i className="bi bi-pencil" />
                        </Button>
                      )}

                      {onDelete && (
                        <Button
                          size="small"
                          variant="danger"
                          buttonStyle="outline"
                          title="Eliminar regla"
                          onClick={() => handleDelete(rule)}
                          disabled={isRuleLoading}
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

export default DiscountRulesTable
