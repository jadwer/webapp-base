/**
 * MOVEMENTS TABLE SIMPLE
 * Tabla de movimientos de inventario con el patron de listados.
 */

'use client'

import Link from 'next/link'
import { EmptyState, StatusBadge } from '@lwm/ui'
import { MOVEMENT_STATUS, MOVEMENT_TYPE } from '../utils/labels'
import { formatDate, formatMoney, formatQty, toNumber } from '../utils/format'
import type { InventoryMovementParsed } from '../types'

interface MovementsTableSimpleProps {
  movements?: InventoryMovementParsed[]
  isLoading?: boolean
}

export const MovementsTableSimple = ({ movements = [], isLoading = false }: MovementsTableSimpleProps) => {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando movimientos...</span>
        </div>
      </div>
    )
  }

  if (movements.length === 0) {
    return (
      <EmptyState
        title="No hay movimientos"
        description="No se encontraron movimientos con los filtros actuales."
      />
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover mb-0">
        <thead className="table-dark">
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Producto</th>
            <th className="text-end">Cantidad</th>
            <th>Almacén</th>
            <th className="text-end">Valor</th>
            <th>Estado</th>
            <th style={{ width: '110px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((movement) => (
            <tr key={movement.id}>
              <td className="text-nowrap">
                <small>{formatDate(movement.movementDate, { withTime: true })}</small>
              </td>
              <td>
                <StatusBadge status={movement.movementType} map={MOVEMENT_TYPE} />
              </td>
              <td>
                <Link
                  href={`/dashboard/inventory/movements/${movement.id}`}
                  className="fw-semibold text-decoration-none"
                >
                  {movement.product?.name || 'Producto sin datos'}
                </Link>
                {movement.description && (
                  <div>
                    <small className="text-muted">{movement.description}</small>
                  </div>
                )}
              </td>
              <td className="text-end fw-semibold">{formatQty(movement.quantity)}</td>
              <td>
                <div>{movement.warehouse?.name || <span className="text-muted">-</span>}</div>
                {movement.location?.name && <small className="text-muted">{movement.location.name}</small>}
              </td>
              <td className="text-end">
                <div>{formatMoney(movement.totalValue)}</div>
                {toNumber(movement.unitCost) > 0 && (
                  <small className="text-muted">{formatMoney(movement.unitCost)} / unidad</small>
                )}
              </td>
              <td>
                <StatusBadge status={movement.status} map={MOVEMENT_STATUS} />
              </td>
              <td>
                <div className="btn-group btn-group-sm" role="group">
                  <Link
                    href={`/dashboard/inventory/movements/${movement.id}`}
                    className="btn btn-outline-primary"
                    title="Ver detalle"
                  >
                    <i className="bi bi-eye" />
                  </Link>
                  <Link
                    href={`/dashboard/inventory/movements/${movement.id}/edit`}
                    className="btn btn-outline-secondary"
                    title="Editar"
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
