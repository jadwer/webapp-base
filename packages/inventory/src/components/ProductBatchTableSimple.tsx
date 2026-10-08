/**
 * PRODUCT BATCH TABLE SIMPLE
 * Tabla de lotes con el patron de listados.
 */

'use client'

import Link from 'next/link'
import { EmptyState, StatusBadge } from '@lwm/ui'
import { BATCH_STATUS } from '../utils/labels'
import { formatDate, formatMoney, formatQty, toNumber } from '../utils/format'
import type { ProductBatch, ParsedProductBatch } from '../types'

interface ProductBatchTableSimpleProps {
  productBatches?: (ProductBatch | ParsedProductBatch)[]
  isLoading?: boolean
}

const DAY_MS = 1000 * 60 * 60 * 24

/** Aviso de vencimiento: vencido o vence en 30 dias o menos */
const expirationWarning = (expirationDate?: string | null) => {
  if (!expirationDate) return null
  const date = new Date(`${expirationDate.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.round((date.getTime() - today.getTime()) / DAY_MS)
  if (days < 0) return { color: 'danger', text: `Vencido hace ${Math.abs(days)} días` }
  if (days <= 7) return { color: 'danger', text: days === 0 ? 'Vence hoy' : `Vence en ${days} días` }
  if (days <= 30) return { color: 'warning', text: `Vence en ${days} días` }
  return null
}

export const ProductBatchTableSimple = ({ productBatches = [], isLoading = false }: ProductBatchTableSimpleProps) => {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando lotes...</span>
        </div>
      </div>
    )
  }

  if (productBatches.length === 0) {
    return (
      <EmptyState
        title="No hay lotes"
        description="No se encontraron lotes con los filtros actuales."
      />
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover mb-0">
        <thead className="table-dark">
          <tr>
            <th>Lote</th>
            <th>Producto</th>
            <th>Vencimiento</th>
            <th className="text-end">Cantidad</th>
            <th>Almacén</th>
            <th className="text-end">Costo</th>
            <th>Estado</th>
            <th style={{ width: '110px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productBatches.map((batch) => {
            const warning = expirationWarning(batch.expirationDate)
            const current = toNumber(batch.currentQuantity)
            return (
              <tr key={batch.id}>
                <td>
                  <Link
                    href={`/dashboard/inventory/product-batch/${batch.id}`}
                    className="fw-semibold text-decoration-none"
                  >
                    {batch.batchNumber}
                  </Link>
                  {batch.lotNumber && (
                    <div>
                      <small className="text-muted">LOT: {batch.lotNumber}</small>
                    </div>
                  )}
                </td>
                <td>
                  <div>{batch.product?.name || <span className="text-muted">Producto sin datos</span>}</div>
                  {batch.product?.sku && <small className="text-muted">SKU: {batch.product.sku}</small>}
                </td>
                <td className="text-nowrap">
                  <div className={warning ? `text-${warning.color}` : undefined}>
                    {formatDate(batch.expirationDate)}
                  </div>
                  {warning && <small className={`text-${warning.color} fw-semibold`}>{warning.text}</small>}
                </td>
                <td className="text-end">
                  <span className="fw-semibold">{formatQty(current)}</span>
                  <small className="text-muted"> / {formatQty(batch.initialQuantity)}</small>
                </td>
                <td>
                  <div>{batch.warehouse?.name || <span className="text-muted">-</span>}</div>
                  {batch.warehouseLocation?.name && (
                    <small className="text-muted">{batch.warehouseLocation.name}</small>
                  )}
                </td>
                <td className="text-end">
                  <div>{formatMoney(batch.unitCost)}</div>
                  <small className="text-muted">
                    Total: {formatMoney(current * toNumber(batch.unitCost))}
                  </small>
                </td>
                <td>
                  <StatusBadge status={batch.status} map={BATCH_STATUS} />
                  {batch.supplierName && (
                    <div>
                      <small className="text-muted">{batch.supplierName}</small>
                    </div>
                  )}
                </td>
                <td>
                  <div className="btn-group btn-group-sm" role="group">
                    <Link
                      href={`/dashboard/inventory/product-batch/${batch.id}`}
                      className="btn btn-outline-primary"
                      title="Ver detalle"
                    >
                      <i className="bi bi-eye" />
                    </Link>
                    <Link
                      href={`/dashboard/inventory/product-batch/${batch.id}/edit`}
                      className="btn btn-outline-secondary"
                      title="Editar"
                    >
                      <i className="bi bi-pencil" />
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
