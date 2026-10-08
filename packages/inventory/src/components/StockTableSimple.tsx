/**
 * STOCK TABLE SIMPLE
 * Tabla de registros de stock con el patron de listados. Estados con
 * STOCK_STATUS (valores del backend) y columna Sucursal solo con mas de una.
 */

'use client'

import Link from 'next/link'
import { EmptyState, StatusBadge } from '@lwm/ui'
import { useBranchName } from '@lwm/auth'
import { STOCK_STATUS } from '../utils/labels'
import { formatMoney, formatQty, toNumber } from '../utils/format'
import type { Stock } from '../types'

interface StockTableSimpleProps {
  stock?: Stock[]
  isLoading?: boolean
}

/** URL del formulario de movimiento prellenado como ajuste */
export const stockAdjustHref = (item: Stock): string => {
  const params = new URLSearchParams({ type: 'adjustment' })
  const productId = item.product?.id ?? item.productId
  const warehouseId = item.warehouse?.id ?? item.warehouseId
  const locationId = item.location?.id ?? item.warehouseLocationId
  if (productId) params.set('productId', String(productId))
  if (warehouseId) params.set('warehouseId', String(warehouseId))
  if (locationId) params.set('locationId', String(locationId))
  return `/dashboard/inventory/movements/create?${params.toString()}`
}

const availabilityVariant = (item: Stock): string => {
  const available = toNumber(item.availableQuantity)
  if (available <= 0) return 'danger'
  const minimum = toNumber(item.minimumStock)
  if (minimum > 0 && toNumber(item.quantity) <= minimum) return 'warning'
  return 'success'
}

export const StockTableSimple = ({ stock = [], isLoading = false }: StockTableSimpleProps) => {
  const branchName = useBranchName()

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando stock...</span>
        </div>
      </div>
    )
  }

  if (stock.length === 0) {
    return (
      <EmptyState
        title="No hay registros de stock"
        description="No se encontraron registros con los filtros actuales."
      />
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover mb-0">
        <thead className="table-dark">
          <tr>
            <th>Producto</th>
            <th>Almacén</th>
            {branchName.multi && <th>Sucursal</th>}
            <th className="text-end">Cantidad</th>
            <th className="text-end">Disponible</th>
            <th className="text-end">Valor</th>
            <th>Estado</th>
            <th style={{ width: '140px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {stock.map((item) => {
            const reserved = toNumber(item.reservedQuantity)
            return (
              <tr key={item.id}>
                <td>
                  <Link
                    href={`/dashboard/inventory/stock/${item.id}`}
                    className="fw-semibold text-decoration-none"
                  >
                    {item.product?.name || 'Producto sin datos'}
                  </Link>
                  {item.product?.sku && (
                    <div>
                      <small className="text-muted">SKU: {item.product.sku}</small>
                    </div>
                  )}
                </td>
                <td>
                  <div>{item.warehouse?.name || <span className="text-muted">-</span>}</div>
                  {item.location?.name && <small className="text-muted">{item.location.name}</small>}
                </td>
                {branchName.multi && (
                  <td className="small">{branchName.name(item.warehouse?.branchId)}</td>
                )}
                <td className="text-end">
                  <div className="fw-semibold">{formatQty(item.quantity)}</div>
                  {reserved > 0 && (
                    <small className="text-warning">{formatQty(reserved)} reservado</small>
                  )}
                </td>
                <td className="text-end">
                  <span className={`badge bg-${availabilityVariant(item)}`}>
                    {formatQty(item.availableQuantity)}
                  </span>
                </td>
                <td className="text-end">
                  <div>{formatMoney(item.totalValue)}</div>
                  {toNumber(item.unitCost) > 0 && (
                    <small className="text-muted">{formatMoney(item.unitCost)} / unidad</small>
                  )}
                </td>
                <td>
                  <StatusBadge status={item.status} map={STOCK_STATUS} />
                </td>
                <td>
                  <div className="btn-group btn-group-sm" role="group">
                    <Link
                      aria-label="Ver detalle"
                      href={`/dashboard/inventory/stock/${item.id}`}
                      className="btn btn-outline-primary"
                      title="Ver detalle"
                    >
                      <i className="bi bi-eye" />
                    </Link>
                    <Link
                      aria-label="Editar"
                      href={`/dashboard/inventory/stock/${item.id}/edit`}
                      className="btn btn-outline-secondary"
                      title="Editar"
                    >
                      <i className="bi bi-pencil" />
                    </Link>
                    <Link aria-label="Ajustar" href={stockAdjustHref(item)} className="btn btn-outline-warning" title="Ajustar">
                      <i className="bi bi-sliders" />
                    </Link>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
