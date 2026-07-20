/**
 * OrderFilters Component
 *
 * Filter bar for ecommerce orders with search, status filters, and date range.
 */

'use client'

import React from 'react'
import { Input } from '@lwm/ui'

interface OrderFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  paymentStatusFilter: string
  onPaymentStatusChange: (value: string) => void
  // Paquete A: el filtro de envio se retiro; no existe columna shipping_status
  // en sales_orders (el eje de envio vive en el status de la orden:
  // shipped/delivered, ya cubierto por el select de estado). Props opcionales
  // conservadas para compatibilidad, ignoradas.
  shippingStatusFilter?: string
  onShippingStatusChange?: (value: string) => void
}

export const OrderFilters = React.memo<OrderFiltersProps>(({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  paymentStatusFilter,
  onPaymentStatusChange,
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

          {/* Payment Status Filter. Paquete A: opciones alineadas a los valores
              REALES de sales_orders.payment_status (los escriben los listeners
              del webhook Stripe); los valores anteriores (completed/failed/...)
              no existian en la columna y el filtro nunca matcheaba. */}
          <div className="col-md-3">
            <label className="form-label small text-muted">Estado de Pago</label>
            <select
              className="form-select"
              value={paymentStatusFilter}
              onChange={(e) => onPaymentStatusChange(e.target.value)}
            >
              <option value="">Todos los pagos</option>
              <option value="unpaid">Sin pagar</option>
              <option value="paid">Pagada</option>
              <option value="refunded">Reembolsada</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(searchTerm || statusFilter || paymentStatusFilter) && (
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

OrderFilters.displayName = 'OrderFilters'
