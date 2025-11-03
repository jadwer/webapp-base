/**
 * OrderFilters Component
 *
 * Filter bar for ecommerce orders with search, status filters, and date range.
 */

'use client'

import React from 'react'
import { Input } from '@/ui/components/base'

interface OrderFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  paymentStatusFilter: string
  onPaymentStatusChange: (value: string) => void
  shippingStatusFilter: string
  onShippingStatusChange: (value: string) => void
}

export const OrderFilters = React.memo<OrderFiltersProps>(({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  paymentStatusFilter,
  onPaymentStatusChange,
  shippingStatusFilter,
  onShippingStatusChange,
}) => {
  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <div className="row g-3">
          {/* Search */}
          <div className="col-md-4">
            <Input
              type="text"
              label="Buscar"
              placeholder="Número de orden, cliente, email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              leftIcon="bi-search"
            />
          </div>

          {/* Order Status Filter */}
          <div className="col-md-3">
            <label className="form-label small text-muted">Estado de Orden</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="processing">Procesando</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
              <option value="refunded">Reembolsado</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="col-md-3">
            <label className="form-label small text-muted">Estado de Pago</label>
            <select
              className="form-select"
              value={paymentStatusFilter}
              onChange={(e) => onPaymentStatusChange(e.target.value)}
            >
              <option value="">Todos los pagos</option>
              <option value="pending">Pendiente</option>
              <option value="processing">Procesando</option>
              <option value="completed">Completado</option>
              <option value="failed">Fallido</option>
              <option value="refunded">Reembolsado</option>
            </select>
          </div>

          {/* Shipping Status Filter */}
          <div className="col-md-2">
            <label className="form-label small text-muted">Estado de Envío</label>
            <select
              className="form-select"
              value={shippingStatusFilter}
              onChange={(e) => onShippingStatusChange(e.target.value)}
            >
              <option value="">Todos los envíos</option>
              <option value="pending">Pendiente</option>
              <option value="processing">Procesando</option>
              <option value="shipped">Enviado</option>
              <option value="in_transit">En Tránsito</option>
              <option value="delivered">Entregado</option>
              <option value="returned">Devuelto</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(searchTerm || statusFilter || paymentStatusFilter || shippingStatusFilter) && (
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <small className="text-muted">Filtros activos:</small>
              {searchTerm && (
                <span className="badge bg-primary">
                  Búsqueda: {searchTerm}
                </span>
              )}
              {statusFilter && (
                <span className="badge bg-info">
                  Estado: {statusFilter}
                </span>
              )}
              {paymentStatusFilter && (
                <span className="badge bg-success">
                  Pago: {paymentStatusFilter}
                </span>
              )}
              {shippingStatusFilter && (
                <span className="badge bg-warning text-dark">
                  Envío: {shippingStatusFilter}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

OrderFilters.displayName = 'OrderFilters'
