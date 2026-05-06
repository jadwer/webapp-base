/**
 * Ecommerce Order View Page
 *
 * Displays detailed information for a specific ecommerce order.
 * Route: /dashboard/ecommerce/orders/[id]
 */

'use client'

import { use } from 'react'
import { useEcommerceOrder, useEcommerceOrderItems } from '@/modules/ecommerce'
import { OrderViewTabs } from '@/modules/ecommerce'

interface OrderViewPageProps {
  params: Promise<{ id: string }>
}

export default function OrderViewPage({ params }: OrderViewPageProps) {
  const { id } = use(params)

  // Fetch order data
  const { ecommerceOrder, isLoading, error } = useEcommerceOrder(id)

  // Fetch order items
  const {
    ecommerceOrderItems,
    isLoading: isLoadingItems
  } = useEcommerceOrderItems(ecommerceOrder ? parseInt(ecommerceOrder.id) : undefined)

  // Loading state
  if (isLoading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando orden...</span>
          </div>
          <p className="text-muted mt-3">Cargando información de la orden...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !ecommerceOrder) {
    return (
      <div className="container-fluid py-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">
            <i className="bi bi-exclamation-triangle me-2" />
            Error al cargar la orden
          </h4>
          <p className="mb-0">
            {error?.message || 'No se pudo encontrar la orden solicitada.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <OrderViewTabs
      order={ecommerceOrder}
      orderItems={ecommerceOrderItems}
      isLoadingItems={isLoadingItems}
    />
  )
}
