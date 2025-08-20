'use client'

import { useState } from 'react'
import { useSalesReports } from '@/modules/sales'
import { formatCurrency } from '@/lib/formatters'

export default function SalesReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(30)
  const { reports, isLoading: reportsLoading, error: reportsError } = useSalesReports(selectedPeriod)

  const isLoading = reportsLoading
  const hasError = reportsError

  // Default metrics when loading or no data - usar nueva estructura de la API
  const metrics = {
    totalSales: reports?.totalRevenue || 0,
    totalOrders: reports?.totalOrders || 0,
    averageOrderValue: reports?.averageOrderValue || 0,
    completedOrders: reports?.salesByStatus?.find((s: any) => s.status === 'delivered')?.count || 0,
    pendingOrders: reports?.salesByStatus?.filter((s: any) => ['pending', 'draft', 'processing'].includes(s.status))?.reduce((acc: number, s: any) => acc + s.count, 0) || 0,
    topCustomers: reports?.topCustomers?.length || 0
  }

  const handlePeriodChange = (period: number) => {
    setSelectedPeriod(period)
  }

  if (hasError) {
    console.error('Sales reports error:', reportsError)
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-graph-up me-3"></i>
                Reportes de Ventas
              </h1>
              <p className="text-muted">
                Análisis y métricas del desempeño de ventas
              </p>
            </div>
            <div className="btn-group">
              <button 
                className={`btn btn-outline-primary ${selectedPeriod === 30 ? 'active' : ''}`}
                onClick={() => handlePeriodChange(30)}
                disabled={isLoading}
              >
                30 días
              </button>
              <button 
                className={`btn btn-outline-primary ${selectedPeriod === 90 ? 'active' : ''}`}
                onClick={() => handlePeriodChange(90)}
                disabled={isLoading}
              >
                90 días
              </button>
              <button 
                className={`btn btn-outline-primary ${selectedPeriod === 365 ? 'active' : ''}`}
                onClick={() => handlePeriodChange(365)}
                disabled={isLoading}
              >
                1 año
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-info">
              <i className="bi bi-hourglass-split me-2"></i>
              Cargando reportes de ventas...
            </div>
          </div>
        </div>
      )}

      {hasError && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              No se pudieron cargar los reportes. Mostrando valores por defecto.
            </div>
          </div>
        </div>
      )}

      <div className="row g-4">
        <div className="col-md-6 col-xl-3">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-white-50">Ventas del Período</h6>
                  <h3 className="mb-0">{formatCurrency(metrics.totalSales)}</h3>
                  {isLoading && <div className="spinner-border spinner-border-sm text-light"></div>}
                </div>
                <div className="ms-3">
                  <i className="bi bi-graph-up display-6"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card text-white bg-success">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-white-50">Órdenes Completadas</h6>
                  <h3 className="mb-0">{metrics.completedOrders.toLocaleString()}</h3>
                  {isLoading && <div className="spinner-border spinner-border-sm text-light"></div>}
                </div>
                <div className="ms-3">
                  <i className="bi bi-check-circle display-6"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-white-50">Total de Órdenes</h6>
                  <h3 className="mb-0">{metrics.totalOrders.toLocaleString()}</h3>
                  {isLoading && <div className="spinner-border spinner-border-sm text-light"></div>}
                </div>
                <div className="ms-3">
                  <i className="bi bi-list-ol display-6"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card text-white bg-info">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-white-50">Valor Promedio</h6>
                  <h3 className="mb-0">{formatCurrency(metrics.averageOrderValue)}</h3>
                  {isLoading && <div className="spinner-border spinner-border-sm text-light"></div>}
                </div>
                <div className="ms-3">
                  <i className="bi bi-calculator display-6"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-bar-chart me-2"></i>
                Resumen del Período ({selectedPeriod} días)
              </h5>
            </div>
            <div className="card-body">
              {reports ? (
                <div>
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className="text-center">
                        <h6 className="text-muted">Total de Ventas</h6>
                        <h4 className="text-primary">{formatCurrency(reports.totalRevenue || 0)}</h4>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center">
                        <h6 className="text-muted">Promedio por Orden</h6>
                        <h4 className="text-success">
                          {formatCurrency(reports.averageOrderValue || 0)}
                        </h4>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center">
                        <h6 className="text-muted">Período</h6>
                        <h4 className="text-info">
                          {reports.periodDays} días
                        </h4>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ventas por Estado */}
                  {reports.salesByStatus && reports.salesByStatus.length > 0 && (
                    <div className="mb-4">
                      <h6 className="mb-3">Ventas por Estado</h6>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Estado</th>
                              <th>Cantidad</th>
                              <th>Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reports.salesByStatus.map((status: any, index: number) => (
                              <tr key={index}>
                                <td>
                                  <span className="badge bg-secondary">{status.status}</span>
                                </td>
                                <td>{status.count}</td>
                                <td>{formatCurrency(parseFloat(status.revenue))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* Top Customers */}
                  {reports.topCustomers && reports.topCustomers.length > 0 && (
                    <div>
                      <h6 className="mb-3">Top Customers</h6>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Cliente</th>
                              <th>Órdenes</th>
                              <th>Total Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reports.topCustomers.slice(0, 5).map((customer: any, index: number) => (
                              <tr key={index}>
                                <td>
                                  <strong>{customer.name}</strong><br/>
                                  <small className="text-muted">{customer.email}</small>
                                </td>
                                <td>{customer.total_orders}</td>
                                <td>{formatCurrency(parseFloat(customer.total_revenue))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-graph-up-arrow display-1 text-primary mb-3"></i>
                  <h5>Reportes de Ventas</h5>
                  <p className="text-muted mb-0">
                    {isLoading 
                      ? 'Cargando datos de reportes...' 
                      : 'Los datos aparecerán cuando se conecte con la API del backend.'
                    }
                  </p>
                  <div className="mt-3">
                    <span className="badge bg-success me-2">✅ Hooks implementados</span>
                    <span className="badge bg-info me-2">📊 API integrada</span>
                    {!isLoading && !hasError && (
                      <span className="badge bg-warning">📡 Datos no disponibles</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}