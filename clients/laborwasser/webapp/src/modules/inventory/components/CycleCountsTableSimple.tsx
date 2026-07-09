/**
 * CycleCounts Table Component
 *
 * Simple table for displaying cycle counts with actions.
 */

'use client'

import React from 'react'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { CycleCountStatusBadge, ABCClassBadge, VarianceBadge } from './CycleCountStatusBadge'
import type { ParsedCycleCount } from '../types'

interface CycleCountsTableSimpleProps {
  cycleCounts: ParsedCycleCount[]
  isLoading?: boolean
  onStartCount?: (id: string) => void
  onRecordCount?: (id: string) => void
  onCancelCount?: (id: string) => void
}

export const CycleCountsTableSimple: React.FC<CycleCountsTableSimpleProps> = ({
  cycleCounts,
  isLoading = false,
  onStartCount,
  onRecordCount,
  onCancelCount
}) => {
  const navigation = useNavigationProgress()

  const handleView = (id: string) => {
    navigation.push(`/dashboard/inventory/cycle-counts/${id}`)
  }

  const handleEdit = (id: string) => {
    navigation.push(`/dashboard/inventory/cycle-counts/${id}/edit`)
  }

  // Format date for display
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Check if count is overdue
  const isOverdue = (scheduledDate: string, status: string) => {
    if (status !== 'scheduled') return false
    const scheduled = new Date(scheduledDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return scheduled < today
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando conteos ciclicos...</p>
      </div>
    )
  }

  if (!cycleCounts || cycleCounts.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-clipboard-check display-4 text-muted mb-3 d-block" />
        <h5>No hay conteos ciclicos</h5>
        <p className="text-muted">Crea un nuevo conteo ciclico para comenzar.</p>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th>No. Conteo</th>
            <th>Producto</th>
            <th>Almacen</th>
            <th>Fecha Programada</th>
            <th>Estado</th>
            <th>Clase</th>
            <th className="text-end">Qty Sistema</th>
            <th className="text-end">Qty Contada</th>
            <th>Variacion</th>
            <th>Asignado</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cycleCounts.map(count => (
            <tr
              key={count.id}
              className={isOverdue(count.scheduledDate, count.status) ? 'table-danger' : ''}
            >
              <td>
                <span className="fw-medium">{count.countNumber}</span>
                {isOverdue(count.scheduledDate, count.status) && (
                  <span className="badge bg-danger ms-2">Vencido</span>
                )}
              </td>
              <td>
                {count.product ? (
                  <div>
                    <span className="fw-medium">{count.product.name}</span>
                    <br />
                    <small className="text-muted">{count.product.sku}</small>
                  </div>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td>
                {count.warehouse ? (
                  <div>
                    <span>{count.warehouse.name}</span>
                    {count.warehouseLocation && (
                      <>
                        <br />
                        <small className="text-muted">{count.warehouseLocation.name}</small>
                      </>
                    )}
                  </div>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td>{formatDate(count.scheduledDate)}</td>
              <td>
                <CycleCountStatusBadge status={count.status} />
              </td>
              <td>
                <ABCClassBadge abcClass={count.abcClass} />
              </td>
              <td className="text-end">{count.systemQuantity?.toFixed(2) ?? '-'}</td>
              <td className="text-end">
                {count.status === 'completed' ? count.countedQuantity?.toFixed(2) ?? '-' : '-'}
              </td>
              <td>
                {count.status === 'completed' ? (
                  <VarianceBadge
                    hasVariance={count.hasVariance}
                    varianceQuantity={count.varianceQuantity}
                    variancePercentage={count.variancePercentage}
                  />
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td>
                {count.assignedTo ? (
                  <span title={count.assignedTo.email}>{count.assignedTo.name}</span>
                ) : (
                  <span className="text-muted">Sin asignar</span>
                )}
              </td>
              <td className="text-end">
                <div className="btn-group btn-group-sm">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => handleView(count.id)}
                    title="Ver detalle"
                  >
                    <i className="bi bi-eye" />
                  </button>

                  {count.status === 'scheduled' && (
                    <>
                      <button
                        type="button"
                        className="btn btn-outline-warning"
                        onClick={() => onStartCount?.(count.id)}
                        title="Iniciar conteo"
                      >
                        <i className="bi bi-play-fill" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => handleEdit(count.id)}
                        title="Editar"
                      >
                        <i className="bi bi-pencil" />
                      </button>
                    </>
                  )}

                  {count.status === 'in_progress' && (
                    <button
                      type="button"
                      className="btn btn-outline-success"
                      onClick={() => onRecordCount?.(count.id)}
                      title="Registrar conteo"
                    >
                      <i className="bi bi-check2-square" />
                    </button>
                  )}

                  {(count.status === 'scheduled' || count.status === 'in_progress') && (
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => onCancelCount?.(count.id)}
                      title="Cancelar"
                    >
                      <i className="bi bi-x-lg" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
