'use client'

import { useState } from 'react'
import { useSalesReports } from '../hooks/useReports'

export function SalesReports() {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30)
  
  const { salesReports, isLoading, error } = useSalesReports(selectedPeriod)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 mb-0">Cargando reportes de ventas...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-exclamation-triangle text-danger fs-1 mb-3"></i>
                <h5 className="text-danger">Error al cargar reportes</h5>
                <p className="text-muted mb-0">
                  No se pudieron cargar los reportes de ventas. Por favor, inténtelo más tarde.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!salesReports || !salesReports.data) {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-info-circle text-info fs-1 mb-3"></i>
                <h5>Sin datos disponibles</h5>
                <p className="text-muted mb-0">No hay datos de ventas para el período seleccionado.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { data } = salesReports

  // Ensure all data properties have fallback values
  const safeData = {
    total_sales: data?.total_sales ?? 0,
    total_orders: data?.total_orders ?? 0,
    average_order_value: data?.average_order_value ?? 0,
    top_customers: data?.top_customers ?? [],
    top_products: data?.top_products ?? [],
    sales_by_period: data?.sales_by_period ?? [],
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-graph-up text-primary me-2"></i>
                Reportes de Ventas
              </h1>
              <p className="text-muted mb-0">
                Análisis ejecutivo de ventas - Período: {selectedPeriod} días
              </p>
            </div>
            
            {/* Period Selector */}
            <div className="dropdown">
              <button
                className="btn btn-outline-primary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-calendar3 me-2"></i>
                {selectedPeriod} días
              </button>
              <ul className="dropdown-menu">
                <li>
                  <button 
                    className="dropdown-item" 
                    onClick={() => setSelectedPeriod(7)}
                  >
                    7 días
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item" 
                    onClick={() => setSelectedPeriod(30)}
                  >
                    30 días
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item" 
                    onClick={() => setSelectedPeriod(90)}
                  >
                    90 días
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item" 
                    onClick={() => setSelectedPeriod(365)}
                  >
                    1 año
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Ventas Totales</h6>
                  <h4 className="mb-0 text-success">
                    {formatCurrency(safeData.total_sales)}
                  </h4>
                </div>
                <div className="ms-3">
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <i className="bi bi-currency-dollar text-success fs-5"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Órdenes Totales</h6>
                  <h4 className="mb-0 text-primary">
                    {safeData.total_orders.toLocaleString()}
                  </h4>
                </div>
                <div className="ms-3">
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <i className="bi bi-receipt text-primary fs-5"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Valor Promedio</h6>
                  <h4 className="mb-0 text-info">
                    {formatCurrency(safeData.average_order_value)}
                  </h4>
                </div>
                <div className="ms-3">
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <i className="bi bi-bar-chart text-info fs-5"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Período</h6>
                  <h4 className="mb-0 text-warning">
                    {selectedPeriod} días
                  </h4>
                </div>
                <div className="ms-3">
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <i className="bi bi-calendar-check text-warning fs-5"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables Row */}
      <div className="row mb-4">
        {/* Top Customers */}
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0">
                <i className="bi bi-people text-primary me-2"></i>
                Top Clientes
              </h6>
            </div>
            <div className="card-body">
              {safeData.top_customers.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th className="text-end">Ventas</th>
                        <th className="text-end">Órdenes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeData.top_customers.map((customer, index) => (
                        <tr key={customer.customer_id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                                   style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                                {index + 1}
                              </div>
                              {customer.customer_name}
                            </div>
                          </td>
                          <td className="text-end">
                            <strong className="text-success">
                              {formatCurrency(customer.total_sales)}
                            </strong>
                          </td>
                          <td className="text-end">
                            <span className="badge bg-light text-dark">
                              {customer.total_orders}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-inbox text-muted fs-1"></i>
                  <p className="text-muted mt-2 mb-0">No hay datos de clientes</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0">
                <i className="bi bi-box-seam text-primary me-2"></i>
                Top Productos
              </h6>
            </div>
            <div className="card-body">
              {safeData.top_products.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th className="text-end">Vendido</th>
                        <th className="text-end">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeData.top_products.map((product, index) => (
                        <tr key={product.product_id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                                   style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                                {index + 1}
                              </div>
                              {product.product_name}
                            </div>
                          </td>
                          <td className="text-end">
                            <span className="badge bg-light text-dark">
                              {product.total_sold}
                            </span>
                          </td>
                          <td className="text-end">
                            <strong className="text-success">
                              {formatCurrency(product.total_revenue)}
                            </strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-inbox text-muted fs-1"></i>
                  <p className="text-muted mt-2 mb-0">No hay datos de productos</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sales by Period Chart */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0">
                <i className="bi bi-graph-up text-primary me-2"></i>
                Ventas por Período
              </h6>
            </div>
            <div className="card-body">
              {safeData.sales_by_period.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Período</th>
                        <th className="text-end">Ventas</th>
                        <th className="text-end">Órdenes</th>
                        <th className="text-end">Valor Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeData.sales_by_period.map((period, index) => {
                        const avgValue = period.total_orders > 0 
                          ? period.total_sales / period.total_orders 
                          : 0
                        return (
                          <tr key={index}>
                            <td>
                              <strong>{period.period}</strong>
                            </td>
                            <td className="text-end">
                              <strong className="text-success">
                                {formatCurrency(period.total_sales)}
                              </strong>
                            </td>
                            <td className="text-end">
                              <span className="badge bg-primary">
                                {period.total_orders}
                              </span>
                            </td>
                            <td className="text-end">
                              <span className="text-info">
                                {formatCurrency(avgValue)}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-graph-up text-muted fs-1"></i>
                  <p className="text-muted mt-2 mb-0">No hay datos por período</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}