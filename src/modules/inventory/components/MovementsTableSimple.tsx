/**
 * MOVEMENTS TABLE SIMPLE
 * Tabla simple para mostrar movimientos de inventario con estructura JSON:API
 * Siguiendo patrón exitoso de WarehousesTableSimple
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { formatCurrency, formatQuantity } from '@/lib/formatters'
import type { InventoryMovementParsed } from '../types'

interface MovementsTableSimpleProps {
  movements?: InventoryMovementParsed[]
  isLoading?: boolean
  _onView?: (movement: InventoryMovementParsed) => void
}

export const MovementsTableSimple = ({
  movements = [],
  isLoading = false,
  _onView // eslint-disable-line @typescript-eslint/no-unused-vars
}: MovementsTableSimpleProps) => {
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
            <th scope="col" style={{ width: '150px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((movement) => (
            <tr key={movement.id}>
              <td>
                <small className="text-muted">
                  {formatDate(movement.movementDate)}
                </small>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <i className={`bi ${getMovementTypeIcon(movement.movementType)} me-2`} />
                  <span className={`badge bg-${getMovementTypeBadgeColor(movement.movementType)}`}>
                    {getMovementTypeLabel(movement.movementType)}
                  </span>
                </div>
              </td>
              <td>
                <div className="fw-semibold">
                  {movement.product?.name || 'Producto sin datos'}
                </div>
                {movement.description && (
                  <small className="text-muted">{movement.description}</small>
                )}
              </td>
              <td>
                <div className="d-flex flex-column">
                  <span className="fw-semibold">{formatQuantity(movement.quantity)}</span>
                  {movement.referenceType && (
                    <small className="text-muted">{movement.referenceType}</small>
                  )}
                </div>
              </td>
              <td>
                <div>
                  <span className="fw-semibold">
                    {movement.warehouse?.name || 'Almacén sin datos'}
                  </span>
                </div>
                {movement.location?.name && (
                  <small className="text-muted">{movement.location.name}</small>
                )}
              </td>
              <td>
                <div className="d-flex flex-column">
                  <span>{formatCurrency(parseFloat(String(movement.totalValue || '0')))}</span>
                  {movement.unitCost && (
                    <small className="text-muted">
                      {formatCurrency(parseFloat(String(movement.unitCost || '0')))} / unidad
                    </small>
                  )}
                </div>
              </td>
              <td>
                <span className={`badge bg-${movement.status === 'completed' ? 'success' : 'warning'}`}>
                  {movement.status === 'completed' ? 'Completado' : movement.status}
                </span>
              </td>
              <td>
                <div className="btn-group btn-group-sm" role="group">
                  <Link
                    href={`/dashboard/inventory/movements/${movement.id}`}
                    className="btn btn-outline-info"
                    title="Ver detalles"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-eye" />
                  </Link>
                  <Link
                    href={`/dashboard/inventory/movements/${movement.id}/edit`}
                    className="btn btn-outline-primary"
                    title="Editar movimiento"
                  >
                    <i className="bi bi-pencil" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}