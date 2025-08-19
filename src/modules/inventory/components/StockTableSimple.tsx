/**
 * STOCK TABLE SIMPLE
 * Tabla simple para mostrar stock con estructura JSON:API y relationships
 * Siguiendo patrón exitoso de WarehousesTableSimple
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { formatCurrency, formatQuantity } from '@/lib/formatters'
import type { Stock } from '../types'

interface StockTableSimpleProps {
  stock?: Stock[]
  isLoading?: boolean
  onEdit?: (stock: Stock) => void
  onAdjust?: (stock: Stock) => void
}

export const StockTableSimple = ({
  stock = [],
  isLoading = false,
  onEdit: _unused, // eslint-disable-line @typescript-eslint/no-unused-vars
  onAdjust
}: StockTableSimpleProps) => {
  // Debug logs
  console.log('📊 [StockTableSimple] Debug info:', {
    stockReceived: stock,
    stockLength: stock?.length,
    firstStock: stock?.[0],
    firstStockKeys: stock?.[0] ? Object.keys(stock[0]) : null,
    isLoading
  })

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('es-ES')
    } catch {
      return '-'
    }
  }


  const getStockStatusColor = (quantity: number, reorderPoint?: number) => {
    if (quantity === 0) return 'danger'
    if (reorderPoint && quantity <= reorderPoint) return 'warning'
    return 'success'
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="text-muted mt-2">Cargando stock...</p>
      </div>
    )
  }

  if (!stock || stock.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-boxes text-muted mb-3" style={{ fontSize: '3rem' }} />
        <h4 className="text-muted">No hay stock</h4>
        <p className="text-muted">No se encontraron productos en stock para mostrar.</p>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col">Producto</th>
            <th scope="col">Ubicación</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Disponible</th>
            <th scope="col">Valor</th>
            <th scope="col">Estado</th>
            <th scope="col">Actualizado</th>
            <th scope="col" style={{ width: '150px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {stock.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="fw-semibold">
                  {item.product?.name || 'Producto sin datos'}
                </div>
                {item.product?.sku && (
                  <small className="text-muted">SKU: {item.product.sku}</small>
                )}
              </td>
              <td>
                <div>
                  <span className="fw-semibold">
                    {item.warehouse?.name || 'Almacén sin datos'}
                  </span>
                </div>
                {item.location?.name && (
                  <small className="text-muted">{item.location.name}</small>
                )}
              </td>
              <td>
                <div className="d-flex flex-column">
                  <span className="fw-semibold">{formatQuantity(item.quantity)}</span>
                  {parseFloat(String(item.reservedQuantity || '0')) > 0 && (
                    <small className="text-warning">
                      {formatQuantity(item.reservedQuantity)} reservado
                    </small>
                  )}
                </div>
              </td>
              <td>
                <span className={`badge bg-${getStockStatusColor(parseFloat(String(item.availableQuantity || '0')), parseFloat(String(item.reorderPoint || '0')))}`}>
                  {formatQuantity(item.availableQuantity)}
                </span>
              </td>
              <td>
                <div className="d-flex flex-column">
                  <span>{formatCurrency(parseFloat(String(item.totalValue || '0')))}</span>
                  {item.unitCost && (
                    <small className="text-muted">
                      {formatCurrency(parseFloat(String(item.unitCost || '0')))} / unidad
                    </small>
                  )}
                </div>
              </td>
              <td>
                <span className={`badge bg-${item.status === 'available' ? 'success' : 'secondary'}`}>
                  {item.status === 'available' ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <small className="text-muted">
                  {formatDate(item.updatedAt)}
                </small>
              </td>
              <td>
                <div className="btn-group btn-group-sm" role="group">
                  <Link
                    href={`/dashboard/inventory/stock/${item.id}`}
                    className="btn btn-outline-info"
                    title="Ver detalles"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-eye" />
                  </Link>
                  <Link
                    href={`/dashboard/inventory/stock/${item.id}/edit`}
                    className="btn btn-outline-primary"
                    title="Editar stock"
                  >
                    <i className="bi bi-pencil" />
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline-warning"
                    onClick={() => onAdjust?.(item)}
                    title="Ajuste de stock"
                  >
                    <i className="bi bi-plus-minus" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}