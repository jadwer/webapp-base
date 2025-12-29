/**
 * OrderStatusBadge Component
 *
 * Displays order, payment, and shipping status badges with appropriate colors.
 */

'use client'

import React from 'react'
import type { OrderStatus, PaymentStatus, ShippingStatus } from '../types'

interface OrderStatusBadgeProps {
  status: OrderStatus | PaymentStatus | ShippingStatus
  type?: 'order' | 'payment' | 'shipping'
}

// Color mapping for different statuses
const orderStatusColors: Record<OrderStatus, string> = {
  pending: 'bg-warning text-dark',
  confirmed: 'bg-info text-white',
  processing: 'bg-primary text-white',
  shipped: 'bg-secondary text-white',
  delivered: 'bg-success text-white',
  cancelled: 'bg-danger text-white',
  refunded: 'bg-dark text-white',
}

const paymentStatusColors: Record<PaymentStatus, string> = {
  pending: 'bg-warning text-dark',
  processing: 'bg-info text-white',
  completed: 'bg-success text-white',
  failed: 'bg-danger text-white',
  refunded: 'bg-dark text-white',
  cancelled: 'bg-secondary text-white',
}

const shippingStatusColors: Record<ShippingStatus, string> = {
  pending: 'bg-warning text-dark',
  processing: 'bg-info text-white',
  shipped: 'bg-primary text-white',
  in_transit: 'bg-secondary text-white',
  delivered: 'bg-success text-white',
  returned: 'bg-danger text-white',
}

// Icon mapping for different statuses
const orderStatusIcons: Record<OrderStatus, string> = {
  pending: 'bi-clock',
  confirmed: 'bi-check-circle',
  processing: 'bi-gear',
  shipped: 'bi-truck',
  delivered: 'bi-check2-all',
  cancelled: 'bi-x-circle',
  refunded: 'bi-arrow-counterclockwise',
}

const paymentStatusIcons: Record<PaymentStatus, string> = {
  pending: 'bi-clock',
  processing: 'bi-credit-card',
  completed: 'bi-check-circle-fill',
  failed: 'bi-x-circle-fill',
  refunded: 'bi-arrow-counterclockwise',
  cancelled: 'bi-x-circle',
}

const shippingStatusIcons: Record<ShippingStatus, string> = {
  pending: 'bi-clock',
  processing: 'bi-box-seam',
  shipped: 'bi-truck',
  in_transit: 'bi-arrow-left-right',
  delivered: 'bi-house-check',
  returned: 'bi-arrow-return-left',
}

// Status labels in Spanish
const statusLabels: Record<string, string> = {
  // Order statuses
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  // Shipping statuses
  in_transit: 'En Tránsito',
  returned: 'Devuelto',
  // Payment statuses
  completed: 'Completado',
  failed: 'Fallido',
}

export const OrderStatusBadge = React.memo<OrderStatusBadgeProps>(({ status, type = 'order' }) => {
  // Select the appropriate color mapping based on type
  let colorClass: string
  let iconClass: string

  switch (type) {
    case 'payment':
      colorClass = paymentStatusColors[status as PaymentStatus] || 'bg-secondary text-white'
      iconClass = paymentStatusIcons[status as PaymentStatus] || 'bi-question-circle'
      break
    case 'shipping':
      colorClass = shippingStatusColors[status as ShippingStatus] || 'bg-secondary text-white'
      iconClass = shippingStatusIcons[status as ShippingStatus] || 'bi-question-circle'
      break
    case 'order':
    default:
      colorClass = orderStatusColors[status as OrderStatus] || 'bg-secondary text-white'
      iconClass = orderStatusIcons[status as OrderStatus] || 'bi-question-circle'
      break
  }

  const label = statusLabels[status] || status

  return (
    <span className={`badge ${colorClass} d-inline-flex align-items-center gap-1`}>
      <i className={`bi ${iconClass}`} aria-hidden="true" />
      {label}
    </span>
  )
})

OrderStatusBadge.displayName = 'OrderStatusBadge'
