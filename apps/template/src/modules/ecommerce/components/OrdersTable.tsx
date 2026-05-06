/**
 * OrdersTable Component
 *
 * Displays ecommerce orders in a professional table format.
 */

'use client'

import React from 'react'
import { Button } from '@/ui/components/base'
import { OrderStatusBadge } from './OrderStatusBadge'
import type { EcommerceOrder } from '../types'

interface OrdersTableProps {
  orders: EcommerceOrder[]
  isLoading?: boolean
  onView: (order: EcommerceOrder) => void
  onEdit: (order: EcommerceOrder) => void
  onDelete: (order: EcommerceOrder) => void
}

export const OrdersTable = React.memo<OrdersTableProps>(({
  orders,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted mt-3 mb-0">Cargando órdenes...</p>
        </div>
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <i className="bi bi-inbox display-1 text-muted" />
          <h5 className="mt-3 text-muted">No hay órdenes</h5>
          <p className="text-muted">
            No se encontraron órdenes con los filtros seleccionados.
          </p>
        </div>
      </div>
    )
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="border-0">Número de Orden</th>
              <th className="border-0">Cliente</th>
              <th className="border-0">Fecha</th>
              <th className="border-0">Total</th>
              <th className="border-0">Estado</th>
              <th className="border-0">Pago</th>
              <th className="border-0">Envío</th>
              <th className="border-0 text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded p-2 me-2">
                      <i className="bi bi-receipt text-primary" />
                    </div>
                    <div>
                      <div className="fw-bold">{order.orderNumber}</div>
                      <small className="text-muted">ID: {order.id}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <div className="fw-medium">{order.customerName}</div>
                    <small className="text-muted">{order.customerEmail}</small>
                  </div>
                </td>
                <td>
                  <div className="text-nowrap">
                    {formatDate(order.orderDate)}
                  </div>
                </td>
                <td>
                  <div className="fw-bold text-success">
                    {formatCurrency(order.totalAmount)}
                  </div>
                  <small className="text-muted">
                    Subtotal: {formatCurrency(order.subtotalAmount)}
                  </small>
                </td>
                <td>
                  <OrderStatusBadge status={order.status} type="order" />
                </td>
                <td>
                  <OrderStatusBadge status={order.paymentStatus} type="payment" />
                </td>
                <td>
                  <OrderStatusBadge status={order.shippingStatus} type="shipping" />
                </td>
                <td className="text-end">
                  <div className="btn-group btn-group-sm" role="group">
                    <Button
                      variant="primary"
                      buttonStyle="outline"
                      size="small"
                      onClick={() => onView(order)}
                      title="Ver detalles"
                    >
                      <i className="bi bi-eye" />
                    </Button>
                    <Button
                      variant="secondary"
                      buttonStyle="outline"
                      size="small"
                      onClick={() => onEdit(order)}
                      title="Editar"
                    >
                      <i className="bi bi-pencil" />
                    </Button>
                    <Button
                      variant="danger"
                      buttonStyle="outline"
                      size="small"
                      onClick={() => onDelete(order)}
                      title="Eliminar"
                    >
                      <i className="bi bi-trash" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})

OrdersTable.displayName = 'OrdersTable'
