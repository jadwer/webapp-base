/**
 * PRODUCT BATCH TABLE SIMPLE
 * Tabla simple para mostrar lotes de productos con estructura JSON:API
 * Siguiendo patrón exitoso de MovementsTableSimple
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { formatCurrency, formatQuantity } from '@/lib/formatters'
import type { ProductBatch, ParsedProductBatch } from '../types'

interface ProductBatchTableSimpleProps {
  productBatches?: (ProductBatch | ParsedProductBatch)[]
  isLoading?: boolean
  _onView?: (productBatch: ProductBatch | ParsedProductBatch) => void
}

export const ProductBatchTableSimple = ({
  productBatches = [],
  isLoading = false,
  _onView // eslint-disable-line @typescript-eslint/no-unused-vars
}: ProductBatchTableSimpleProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return '-'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'success', label: 'Activo' }
      case 'quarantine':
        return { color: 'warning', label: 'Cuarentena' }
      case 'expired':
        return { color: 'danger', label: 'Vencido' }
      case 'recalled':
        return { color: 'danger', label: 'Retirado' }
      case 'consumed':
        return { color: 'secondary', label: 'Consumido' }
      default:
        return { color: 'secondary', label: status }
    }
  }

  const getDaysUntilExpiration = (expirationDate: string) => {
    if (!expirationDate) return null
    try {
      const now = new Date()
      const expiry = new Date(expirationDate)
      const diffTime = expiry.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return null
    }
  }

  const getExpirationWarning = (expirationDate: string) => {
    const days = getDaysUntilExpiration(expirationDate)
    if (days === null) return null

    if (days < 0) {
      return { color: 'danger', text: `Vencido hace ${Math.abs(days)} días` }
    } else if (days <= 7) {
      return { color: 'danger', text: `Vence en ${days} días` }
    } else if (days <= 30) {
      return { color: 'warning', text: `Vence en ${days} días` }
    }
    return null
  }

  const getQuantityWarning = (currentQuantity: number, initialQuantity: number) => {
    if (!currentQuantity || !initialQuantity) return null
    
    const percentage = (currentQuantity / initialQuantity) * 100
    if (percentage <= 10) {
      return { color: 'danger', text: 'Stock crítico' }
    } else if (percentage <= 25) {
      return { color: 'warning', text: 'Stock bajo' }
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="text-muted mt-2">Cargando lotes de productos...</p>
      </div>
    )
  }

  if (!productBatches || productBatches.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-box text-muted mb-3" style={{ fontSize: '3rem' }} />
        <h4 className="text-muted">No hay lotes</h4>
        <p className="text-muted">No se encontraron lotes de productos para mostrar.</p>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col">Lote</th>
            <th scope="col">Producto</th>
            <th scope="col">Fechas</th>
            <th scope="col">Cantidades</th>
            <th scope="col">Ubicación</th>
            <th scope="col">Costo</th>
            <th scope="col">Estado</th>
            <th scope="col" style={{ width: '150px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productBatches.map((batch) => {
            const statusBadge = getStatusBadge(batch.status || 'active')
            const expirationWarning = getExpirationWarning(batch.expirationDate || '')
            const quantityWarning = getQuantityWarning(
              batch.currentQuantity || 0, 
              batch.initialQuantity || 0
            )

            return (
              <tr key={batch.id}>
                <td>
                  <div className="fw-semibold">{batch.batchNumber}</div>
                  {batch.lotNumber && (
                    <small className="text-muted">LOT: {batch.lotNumber}</small>
                  )}
                </td>
                <td>
                  <div className="fw-semibold">
                    {batch.product?.name || 'Producto sin datos'}
                  </div>
                  {batch.product?.sku && (
                    <small className="text-muted">SKU: {batch.product.sku}</small>
                  )}
                </td>
                <td>
                  <div className="d-flex flex-column">
                    <small className="text-muted">
                      Fab: {formatDate(batch.manufacturingDate)}
                    </small>
                    <small className={expirationWarning ? `text-${expirationWarning.color}` : 'text-muted'}>
                      Exp: {formatDate(batch.expirationDate)}
                    </small>
                    {expirationWarning && (
                      <small className={`text-${expirationWarning.color} fw-semibold`}>
                        {expirationWarning.text}
                      </small>
                    )}
                  </div>
                </td>
                <td>
                  <div className="d-flex flex-column">
                    <span>
                      {formatQuantity(batch.currentQuantity || 0)} / {formatQuantity(batch.initialQuantity || 0)}
                    </span>
                    {quantityWarning && (
                      <small className={`text-${quantityWarning.color} fw-semibold`}>
                        <i className="bi bi-exclamation-triangle me-1" />
                        {quantityWarning.text}
                      </small>
                    )}
                  </div>
                </td>
                <td>
                  <div>
                    <span className="fw-semibold">
                      {batch.warehouse?.name || 'Almacén sin datos'}
                    </span>
                  </div>
                  {batch.warehouseLocation?.name && (
                    <small className="text-muted">{batch.warehouseLocation.name}</small>
                  )}
                </td>
                <td>
                  <div className="d-flex flex-column">
                    <span>{formatCurrency(batch.unitCost || 0)}</span>
                    <small className="text-muted">
                      Total: {formatCurrency((batch.currentQuantity || 0) * (batch.unitCost || 0))}
                    </small>
                  </div>
                </td>
                <td>
                  <span className={`badge bg-${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
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
                      className="btn btn-outline-info"
                      title="Ver detalles"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="bi bi-eye" />
                    </Link>
                    <Link
                      href={`/dashboard/inventory/product-batch/${batch.id}/edit`}
                      className="btn btn-outline-primary"
                      title="Editar lote"
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