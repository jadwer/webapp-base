'use client'

import { useState } from 'react'
import { useSalesOrders } from '@/modules/sales'
import { formatCurrency } from '@/lib/formatters'

export default function SalesCustomersPage() {
  const [timeRange, setTimeRange] = useState(90)
  
  // Fallback: Calculate customer stats from sales orders since dedicated API may not work properly
  const { salesOrders, isLoading, error } = useSalesOrders()

  // Calculate customer statistics from sales orders
  const customerStats = salesOrders?.reduce((acc: Record<string, Record<string, unknown>>, order) => {
    const contact = order.contact
    if (!contact) return acc

    const customerId = String(contact.id)
    if (!acc[customerId]) {
      acc[customerId] = {
        id: customerId,
        name: contact.name,
        email: contact.email,
        totalAmount: 0,
        totalOrders: 0,
        lastOrderDate: null,
        orders: []
      }
    }

    const stats = acc[customerId]
    stats.totalAmount = (stats.totalAmount as number) + (order.totalAmount || 0)
    stats.totalOrders = (stats.totalOrders as number) + 1
    ;(stats.orders as unknown[]).push(order)

    const orderDate = new Date(order.orderDate)
    if (!stats.lastOrderDate || orderDate > new Date(stats.lastOrderDate as string)) {
      stats.lastOrderDate = order.orderDate
    }

    return acc
  }, {}) || {}

  const topCustomers = Object.values(customerStats)
    .sort((a: Record<string, unknown>, b: Record<string, unknown>) => (b.totalAmount as number) - (a.totalAmount as number))
    .slice(0, 10)

  const handleTimeRangeChange = (range: number) => {
    setTimeRange(range)
  }
  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-person-heart me-3"></i>
                Clientes de Ventas
              </h1>
              <p className="text-muted">
                Análisis del comportamiento y desempeño de clientes ({timeRange} días)
              </p>
            </div>
            <div className="d-flex gap-2">
              <div className="btn-group">
                <button 
                  className={`btn btn-outline-primary ${timeRange === 30 ? 'active' : ''}`}
                  onClick={() => handleTimeRangeChange(30)}
                  disabled={isLoading}
                >
                  30 días
                </button>
                <button 
                  className={`btn btn-outline-primary ${timeRange === 90 ? 'active' : ''}`}
                  onClick={() => handleTimeRangeChange(90)}
                  disabled={isLoading}
                >
                  90 días
                </button>
                <button 
                  className={`btn btn-outline-primary ${timeRange === 365 ? 'active' : ''}`}
                  onClick={() => handleTimeRangeChange(365)}
                  disabled={isLoading}
                >
                  1 año
                </button>
              </div>
              <button
                className="btn btn-outline-primary"
                onClick={() => window.location.href = '/dashboard/contacts'}
              >
                <i className="bi bi-person-plus me-2"></i>
                Gestionar Contactos
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bi bi-person-heart me-2"></i>
                Top Clientes - Datos Reales
              </h5>
              <div className="badge bg-primary">
                {topCustomers.length} clientes
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Total Compras</th>
                      <th>Órdenes</th>
                      <th>Promedio por Orden</th>
                      <th>Última Compra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando clientes...</span>
                          </div>
                        </td>
                      </tr>
                    )}

                    {error && (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          <div className="alert alert-danger">
                            Error al cargar datos: {error.message}
                          </div>
                        </td>
                      </tr>
                    )}

                    {!isLoading && !error && topCustomers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          <div className="text-muted">
                            <i className="bi bi-info-circle me-2"></i>
                            No hay datos de clientes disponibles
                          </div>
                        </td>
                      </tr>
                    )}

                    {!isLoading && !error && topCustomers.map((customer, index: number) => (
                      <tr key={(customer.id as string) || (customer.customer_id as string)}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className={`bg-${index === 0 ? 'primary' : index === 1 ? 'success' : 'secondary'} text-white rounded-circle d-flex align-items-center justify-content-center me-3`}
                                 style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
                              {((customer.name as string) || (customer.customer_name as string))?.charAt(0).toUpperCase() || 'C'}
                            </div>
                            <div>
                              <div className="fw-bold">
                                {(customer.name as string) || (customer.customer_name as string) || (customer.contact_name as string) || ((customer.contact as Record<string, unknown>)?.name as string) || 'Cliente sin nombre'}
                              </div>
                              <small className="text-muted">
                                {(customer.email as string) || (customer.customer_email as string) || (customer.contact_email as string) || ((customer.contact as Record<string, unknown>)?.email as string) || `ID: ${customer.id || customer.customer_id || customer.contact_id}`}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="fw-bold text-success">
                            {formatCurrency(
                              (customer.totalAmount as number) ||
                              (customer.total_amount as number) ||
                              (customer.total_sales as number) ||
                              (customer.sales_total as number) ||
                              (customer.amount as number) ||
                              0
                            )}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {(customer.totalOrders as number) ||
                             (customer.total_orders as number) ||
                             (customer.order_count as number) ||
                             (customer.orders_count as number) ||
                             (customer.count as number) ||
                             0}
                          </span>
                        </td>
                        <td>
                          {formatCurrency(
                            ((customer.totalAmount as number) || (customer.total_amount as number) || (customer.total_sales as number) || (customer.sales_total as number) || (customer.amount as number) || 0) /
                            ((customer.totalOrders as number) || (customer.total_orders as number) || (customer.order_count as number) || (customer.orders_count as number) || (customer.count as number) || 1)
                          )}
                        </td>
                        <td>
                          <small className="text-muted">
                            {((customer.lastOrderDate as string) || (customer.last_order_date as string) || (customer.latest_order as string) || (customer.last_order as string))
                              ? new Date((customer.lastOrderDate as string) || (customer.last_order_date as string) || (customer.latest_order as string) || (customer.last_order as string)).toLocaleDateString('es-ES')
                              : 'N/A'}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}