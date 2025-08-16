/**
 * MOVEMENTS TABLE SIMPLE
 * Tabla simple para mostrar movimientos de inventario con estructura JSON:API
 * Siguiendo patrón exitoso de WarehousesTableSimple
 */

'use client'

import React from 'react'
import type { InventoryMovement } from '../types'

interface MovementsTableSimpleProps {
  movements?: InventoryMovement[]
  isLoading?: boolean
  onView?: (movement: InventoryMovement) => void
}

export const MovementsTableSimple = ({
  movements = [],
  isLoading = false,
  onView
}: MovementsTableSimpleProps) => {
  // Debug logs
  console.log('📊 [MovementsTableSimple] Debug info:', {
    movementsReceived: movements,
    movementsLength: movements?.length,
    firstMovement: movements?.[0],
    firstMovementKeys: movements?.[0] ? Object.keys(movements[0]) : null,
    isLoading
  })

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return '-'
    }
  }

  const formatCurrency = (value?: number) => {
    if (value == null) return '-'
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(value)
  }

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'entry':
      case 'in':
        return 'bi-box-arrow-in-down text-success'
      case 'exit':
      case 'out':
        return 'bi-box-arrow-up text-danger'
      case 'transfer':
        return 'bi-arrow-left-right text-info'
      case 'adjustment':
        return 'bi-gear text-warning'
      default:
        return 'bi-arrow-left-right text-muted'
    }
  }

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'entry':
      case 'in':
        return 'Entrada'
      case 'exit':  
      case 'out':
        return 'Salida'
      case 'transfer':
        return 'Transferencia'
      case 'adjustment':
        return 'Ajuste'
      default:
        return type
    }
  }

  const getMovementTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'entry':
      case 'in':
        return 'success'
      case 'exit':
      case 'out':
        return 'danger'
      case 'transfer':
        return 'info'
      case 'adjustment':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="text-muted mt-2">Cargando movimientos...</p>
      </div>
    )
  }

  if (!movements || movements.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-arrow-left-right text-muted mb-3" style={{ fontSize: '3rem' }} />
        <h4 className="text-muted">No hay movimientos</h4>
        <p className="text-muted">No se encontraron movimientos de inventario para mostrar.</p>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">Tipo</th>
            <th scope="col">Producto</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Ubicación</th>
            <th scope="col">Valor</th>
            <th scope="col">Estado</th>
            <th scope="col" width="100">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((movement) => (
            <tr key={movement.id}>
              <td>
                <small className="text-muted">
                  {formatDate(movement.attributes.movementDate)}
                </small>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <i className={`bi ${getMovementTypeIcon(movement.attributes.movementType)} me-2`} />
                  <span className={`badge bg-${getMovementTypeBadgeColor(movement.attributes.movementType)}`}>
                    {getMovementTypeLabel(movement.attributes.movementType)}
                  </span>
                </div>
              </td>
              <td>
                <div className="fw-semibold">
                  {movement.attributes.product?.name || `Producto ID: ${movement.attributes.productId}`}
                </div>
                {movement.attributes.description && (
                  <small className="text-muted">{movement.attributes.description}</small>
                )}
              </td>
              <td>
                <div className="d-flex flex-column">
                  <span className="fw-semibold">{movement.attributes.quantity}</span>
                  {movement.attributes.referenceType && (
                    <small className="text-muted">{movement.attributes.referenceType}</small>
                  )}
                </div>
              </td>
              <td>
                <div>
                  <span className="fw-semibold">
                    {movement.attributes.warehouse?.name || `Almacén ID: ${movement.attributes.warehouseId}`}
                  </span>
                </div>
                {movement.attributes.location?.name && (
                  <small className="text-muted">{movement.attributes.location.name}</small>
                )}
              </td>
              <td>
                <div className="d-flex flex-column">
                  <span>{formatCurrency(movement.attributes.totalValue)}</span>
                  {movement.attributes.unitCost && (
                    <small className="text-muted">
                      {formatCurrency(movement.attributes.unitCost)} / unidad
                    </small>
                  )}
                </div>
              </td>
              <td>
                <span className={`badge bg-${movement.attributes.status === 'completed' ? 'success' : 'warning'}`}>
                  {movement.attributes.status === 'completed' ? 'Completado' : movement.attributes.status}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => onView?.(movement)}
                  title="Ver detalles"
                >
                  <i className="bi bi-eye" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}