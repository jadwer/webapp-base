/**
 * STOCK TABLE SIMPLE
 * Tabla simple para mostrar stock con estructura JSON:API y relationships
 * Siguiendo patrón exitoso de WarehousesTableSimple
 */

'use client'

import React from 'react'
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
  onEdit,
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

  const formatCurrency = (value?: number) => {
    if (value == null) return '-'
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(value)
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
            <th scope="col" width="120">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {stock.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="fw-semibold">
                  {item.attributes.product?.name || `Producto ID: ${item.attributes.productId}`}
                </div>
                {item.attributes.product?.code && (
                  <small className="text-muted">Código: {item.attributes.product.code}</small>
                )}
              </td>
              <td>
                <div>
                  <span className="fw-semibold">
                    {item.attributes.warehouse?.name || `Almacén ID: ${item.attributes.warehouseId}`}
                  </span>
                </div>
                {item.attributes.location?.name && (
                  <small className="text-muted">{item.attributes.location.name}</small>
                )}
              </td>
              <td>
                <div className="d-flex flex-column">
                  <span className="fw-semibold">{item.attributes.quantity}</span>
                  {item.attributes.reservedQuantity > 0 && (
                    <small className="text-warning">
                      {item.attributes.reservedQuantity} reservado
                    </small>
                  )}
                </div>
              </td>
              <td>
                <span className={`badge bg-${getStockStatusColor(item.attributes.availableQuantity, item.attributes.reorderPoint)}`}>
                  {item.attributes.availableQuantity}
                </span>
              </td>
              <td>
                <div className="d-flex flex-column">
                  <span>{formatCurrency(item.attributes.totalValue)}</span>
                  {item.attributes.unitCost && (
                    <small className="text-muted">
                      {formatCurrency(item.attributes.unitCost)} / unidad
                    </small>
                  )}
                </div>
              </td>
              <td>
                <span className={`badge bg-${item.attributes.status === 'active' ? 'success' : 'secondary'}`}>
                  {item.attributes.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <small className="text-muted">
                  {formatDate(item.attributes.updatedAt)}
                </small>
              </td>
              <td>
                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className="btn btn-outline-warning"
                    onClick={() => onAdjust?.(item)}
                    title="Ajuste de stock"
                  >
                    <i className="bi bi-plus-minus" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => onEdit?.(item)}
                    title="Ver detalles"
                  >
                    <i className="bi bi-eye" />
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