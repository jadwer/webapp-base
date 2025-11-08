/**
 * OrderViewTabs Component
 *
 * Tabbed interface for viewing ecommerce order details.
 * Displays order information, items, and shipping details in organized tabs.
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { OrderStatusBadge } from './OrderStatusBadge'
import type { EcommerceOrder, EcommerceOrderItem } from '../types'

interface OrderViewTabsProps {
  order: EcommerceOrder
  orderItems: EcommerceOrderItem[]
  isLoadingItems?: boolean
}

export const OrderViewTabs = React.memo<OrderViewTabsProps>(({
  order,
  orderItems,
  isLoadingItems = false
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'shipping'>('details')
  const navigation = useNavigationProgress()

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row align-items-center mb-4">
        <div className="col">
          <div className="d-flex align-items-center">
            <Button
              variant="secondary"
              buttonStyle="outline"
              size="small"
              onClick={() => navigation.back()}
              className="me-3"
            >
              <i className="bi bi-arrow-left me-2" />
              Volver
            </Button>
            <div>
              <h1 className="display-6 fw-bold mb-0">
                Orden {order.orderNumber}
              </h1>
              <p className="text-muted mb-0">
                ID: {order.id} | Creada: {formatDate(order.orderDate)}
              </p>
            </div>
          </div>
        </div>
        <div className="col-auto">
          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              buttonStyle="outline"
              onClick={() => navigation.push(`/dashboard/ecommerce/orders/${order.id}/edit`)}
            >
              <i className="bi bi-pencil me-2" />
              Editar
            </Button>
            <Button
              variant="primary"
              onClick={() => window.print()}
            >
              <i className="bi bi-printer me-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="small text-muted mb-2">Estado de Orden</div>
              <OrderStatusBadge status={order.status} type="order" />
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="small text-muted mb-2">Estado de Pago</div>
              <OrderStatusBadge status={order.paymentStatus} type="payment" />
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="small text-muted mb-2">Estado de Envío</div>
              <OrderStatusBadge status={order.shippingStatus} type="shipping" />
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="small text-muted mb-2">Total</div>
              <div className="display-6 fw-bold text-success">
                {formatCurrency(order.totalAmount)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                <i className="bi bi-info-circle me-2" />
                Detalles
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'items' ? 'active' : ''}`}
                onClick={() => setActiveTab('items')}
              >
                <i className="bi bi-cart me-2" />
                Items ({orderItems.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'shipping' ? 'active' : ''}`}
                onClick={() => setActiveTab('shipping')}
              >
                <i className="bi bi-truck me-2" />
                Envío
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="row g-4">
              <div className="col-md-6">
                <h5 className="mb-3">Información del Cliente</h5>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <th className="text-muted" style={{ width: '40%' }}>Nombre:</th>
                      <td>{order.customerName}</td>
                    </tr>
                    <tr>
                      <th className="text-muted">Email:</th>
                      <td>{order.customerEmail}</td>
                    </tr>
                    <tr>
                      <th className="text-muted">Teléfono:</th>
                      <td>{order.customerPhone || '-'}</td>
                    </tr>
                    <tr>
                      <th className="text-muted">ID Cliente:</th>
                      <td>{order.customerId || 'Invitado'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="col-md-6">
                <h5 className="mb-3">Información de Pago</h5>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <th className="text-muted" style={{ width: '40%' }}>Subtotal:</th>
                      <td className="text-end">{formatCurrency(order.subtotalAmount)}</td>
                    </tr>
                    <tr>
                      <th className="text-muted">Impuestos:</th>
                      <td className="text-end">{formatCurrency(order.taxAmount)}</td>
                    </tr>
                    <tr>
                      <th className="text-muted">Envío:</th>
                      <td className="text-end">{formatCurrency(order.shippingAmount)}</td>
                    </tr>
                    <tr>
                      <th className="text-muted">Descuento:</th>
                      <td className="text-end">{formatCurrency(order.discountAmount)}</td>
                    </tr>
                    <tr className="table-active">
                      <th className="fw-bold">Total:</th>
                      <td className="text-end fw-bold text-success">{formatCurrency(order.totalAmount)}</td>
                    </tr>
                  </tbody>
                </table>

                {order.paymentMethodId && (
                  <div className="mt-3">
                    <small className="text-muted">Método de Pago: ID {order.paymentMethodId}</small>
                  </div>
                )}
                {order.paymentReference && (
                  <div>
                    <small className="text-muted">Referencia: {order.paymentReference}</small>
                  </div>
                )}
              </div>

              {order.notes && (
                <div className="col-12">
                  <h5 className="mb-3">Notas</h5>
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2" />
                    {order.notes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <div>
              {isLoadingItems ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando items...</span>
                  </div>
                </div>
              ) : orderItems.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox display-1 text-muted" />
                  <p className="text-muted mt-3">No hay items en esta orden</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th className="text-center">Cantidad</th>
                        <th className="text-end">Precio Unitario</th>
                        <th className="text-end">Descuento</th>
                        <th className="text-end">Impuesto</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {item.productImage && (
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="rounded me-3"
                                  style={{ width: 48, height: 48, objectFit: 'cover' }}
                                />
                              )}
                              <div>
                                <div className="fw-medium">{item.productName}</div>
                                <small className="text-muted">SKU: {item.productSku}</small>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-secondary">{item.quantity}</span>
                          </td>
                          <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                          <td className="text-end">{formatCurrency(item.discount || 0)}</td>
                          <td className="text-end">{formatCurrency(item.taxAmount)}</td>
                          <td className="text-end fw-bold">{formatCurrency(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === 'shipping' && (
            <div className="row g-4">
              <div className="col-md-6">
                <h5 className="mb-3">Dirección de Envío</h5>
                <div className="card bg-light border-0">
                  <div className="card-body">
                    {order.shippingAddressLine1 ? (
                      <>
                        <p className="mb-1">{order.shippingAddressLine1}</p>
                        {order.shippingAddressLine2 && (
                          <p className="mb-1">{order.shippingAddressLine2}</p>
                        )}
                        <p className="mb-1">
                          {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
                        </p>
                        <p className="mb-0">{order.shippingCountry}</p>
                      </>
                    ) : (
                      <p className="text-muted mb-0">Sin dirección de envío</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <h5 className="mb-3">Dirección de Facturación</h5>
                <div className="card bg-light border-0">
                  <div className="card-body">
                    {order.billingAddressLine1 ? (
                      <>
                        <p className="mb-1">{order.billingAddressLine1}</p>
                        {order.billingAddressLine2 && (
                          <p className="mb-1">{order.billingAddressLine2}</p>
                        )}
                        <p className="mb-1">
                          {order.billingCity}, {order.billingState} {order.billingPostalCode}
                        </p>
                        <p className="mb-0">{order.billingCountry}</p>
                      </>
                    ) : (
                      <p className="text-muted mb-0">Igual a dirección de envío</p>
                    )}
                  </div>
                </div>
              </div>

              {order.completedDate && (
                <div className="col-12">
                  <div className="alert alert-success">
                    <i className="bi bi-check-circle me-2" />
                    Orden completada el {formatDate(order.completedDate)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

OrderViewTabs.displayName = 'OrderViewTabs'
