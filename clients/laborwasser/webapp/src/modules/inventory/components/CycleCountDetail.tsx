/**
 * CycleCount Detail Component
 *
 * Displays detailed information about a cycle count.
 */

'use client'

import React from 'react'
import { CycleCountStatusBadge, ABCClassBadge, VarianceBadge } from './CycleCountStatusBadge'
import { Button } from '@/ui/components/base/Button'
import type { ParsedCycleCount } from '../types'

interface CycleCountDetailProps {
  cycleCount: ParsedCycleCount
  onEdit?: () => void
  onStartCount?: () => void
  onRecordCount?: () => void
  onCancelCount?: () => void
  isLoading?: boolean
}

export const CycleCountDetail: React.FC<CycleCountDetailProps> = ({
  cycleCount,
  onEdit,
  onStartCount,
  onRecordCount,
  onCancelCount,
  isLoading = false
}) => {
  // Format date for display
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format datetime for display
  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Check if count is overdue
  const isOverdue = () => {
    if (cycleCount.status !== 'scheduled') return false
    const scheduled = new Date(cycleCount.scheduledDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return scheduled < today
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">
            Conteo: {cycleCount.countNumber}
            {isOverdue() && <span className="badge bg-danger ms-2">Vencido</span>}
          </h5>
        </div>
        <div className="d-flex gap-2">
          {cycleCount.status === 'scheduled' && (
            <>
              <Button variant="warning" size="small" onClick={onStartCount} disabled={isLoading}>
                <i className="bi bi-play-fill me-1" />
                Iniciar Conteo
              </Button>
              <Button variant="secondary" size="small" onClick={onEdit} disabled={isLoading}>
                <i className="bi bi-pencil me-1" />
                Editar
              </Button>
            </>
          )}
          {cycleCount.status === 'in_progress' && (
            <Button variant="success" size="small" onClick={onRecordCount} disabled={isLoading}>
              <i className="bi bi-check2-square me-1" />
              Registrar Resultado
            </Button>
          )}
          {(cycleCount.status === 'scheduled' || cycleCount.status === 'in_progress') && (
            <Button variant="danger" size="small" onClick={onCancelCount} disabled={isLoading}>
              <i className="bi bi-x-lg me-1" />
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="card-body">
        <div className="row g-4">
          {/* Status Section */}
          <div className="col-md-6">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-subtitle mb-3 text-muted">Estado del Conteo</h6>
                <div className="d-flex gap-3 align-items-center mb-3">
                  <CycleCountStatusBadge status={cycleCount.status} size="large" />
                  <ABCClassBadge abcClass={cycleCount.abcClass} showDescription size="large" />
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <small className="text-muted d-block">Fecha Programada</small>
                    <strong>{formatDate(cycleCount.scheduledDate)}</strong>
                  </div>
                  {cycleCount.completedDate && (
                    <div className="col-6">
                      <small className="text-muted d-block">Fecha Completado</small>
                      <strong>{formatDate(cycleCount.completedDate)}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Section */}
          <div className="col-md-6">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-subtitle mb-3 text-muted">Producto</h6>
                {cycleCount.product ? (
                  <>
                    <h5 className="mb-1">{cycleCount.product.name}</h5>
                    <p className="text-muted mb-0">
                      <i className="bi bi-upc me-1" />
                      SKU: {cycleCount.product.sku}
                    </p>
                  </>
                ) : (
                  <p className="text-muted mb-0">Producto no especificado</p>
                )}
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="col-md-6">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-subtitle mb-3 text-muted">Ubicacion</h6>
                {cycleCount.warehouse ? (
                  <>
                    <p className="mb-1">
                      <i className="bi bi-building me-2" />
                      <strong>Almacen:</strong> {cycleCount.warehouse.name} ({cycleCount.warehouse.code})
                    </p>
                    {cycleCount.warehouseLocation && (
                      <p className="mb-0">
                        <i className="bi bi-geo-alt me-2" />
                        <strong>Ubicacion:</strong> {cycleCount.warehouseLocation.name} (
                        {cycleCount.warehouseLocation.code})
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-muted mb-0">Ubicacion no especificada</p>
                )}
              </div>
            </div>
          </div>

          {/* Quantities Section */}
          <div className="col-md-6">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-subtitle mb-3 text-muted">Cantidades</h6>
                <div className="row g-2">
                  <div className="col-4">
                    <small className="text-muted d-block">Sistema</small>
                    <h4 className="mb-0">{cycleCount.systemQuantity?.toFixed(2) ?? '-'}</h4>
                  </div>
                  <div className="col-4">
                    <small className="text-muted d-block">Contada</small>
                    <h4 className="mb-0">
                      {cycleCount.status === 'completed' ? cycleCount.countedQuantity?.toFixed(2) ?? '-' : '-'}
                    </h4>
                  </div>
                  <div className="col-4">
                    <small className="text-muted d-block">Variacion</small>
                    {cycleCount.status === 'completed' ? (
                      <VarianceBadge
                        hasVariance={cycleCount.hasVariance}
                        varianceQuantity={cycleCount.varianceQuantity}
                        variancePercentage={cycleCount.variancePercentage}
                      />
                    ) : (
                      <h4 className="mb-0">-</h4>
                    )}
                  </div>
                </div>
                {cycleCount.varianceValue !== null && cycleCount.varianceValue !== undefined && (
                  <div className="mt-3 pt-3 border-top">
                    <small className="text-muted d-block">Valor de Variacion</small>
                    <h5 className={`mb-0 ${cycleCount.varianceValue < 0 ? 'text-danger' : 'text-warning'}`}>
                      ${Math.abs(cycleCount.varianceValue).toFixed(2)}
                      {cycleCount.varianceValue < 0 ? ' (Faltante)' : ' (Sobrante)'}
                    </h5>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personnel Section */}
          <div className="col-md-6">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-subtitle mb-3 text-muted">Personal</h6>
                <div className="row g-2">
                  <div className="col-6">
                    <small className="text-muted d-block">Asignado a</small>
                    {cycleCount.assignedTo ? (
                      <>
                        <strong>{cycleCount.assignedTo.name}</strong>
                        <br />
                        <small className="text-muted">{cycleCount.assignedTo.email}</small>
                      </>
                    ) : (
                      <span className="text-muted">Sin asignar</span>
                    )}
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Contado por</small>
                    {cycleCount.countedBy ? (
                      <>
                        <strong>{cycleCount.countedBy.name}</strong>
                        <br />
                        <small className="text-muted">{cycleCount.countedBy.email}</small>
                      </>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {cycleCount.notes && (
            <div className="col-md-6">
              <div className="card bg-light">
                <div className="card-body">
                  <h6 className="card-subtitle mb-3 text-muted">Notas</h6>
                  <p className="mb-0">{cycleCount.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata Section */}
          <div className="col-12">
            <div className="border-top pt-3 mt-3">
              <small className="text-muted">
                <i className="bi bi-clock me-1" />
                Creado: {formatDateTime(cycleCount.createdAt)} | Actualizado: {formatDateTime(cycleCount.updatedAt)}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
