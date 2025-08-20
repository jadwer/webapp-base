'use client'

import { useState } from 'react'
import { usePurchaseReports } from '@/modules/purchase'
import { formatCurrency } from '@/lib/formatters'

export default function PurchaseReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  
  // Calcular fechas según el período seleccionado - incluir datos históricos
  const getDateRange = (period: string) => {
    const endDate = new Date().toISOString().split('T')[0] // Hoy
    let startDate = new Date()
    
    switch (period) {
      case '30days':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90days':
        startDate.setDate(startDate.getDate() - 90)
        break
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      case 'all':
        // Para datos históricos - las órdenes son de 1980s/1990s
        return {
          startDate: '1980-01-01',
          endDate
        }
      default:
        startDate.setDate(startDate.getDate() - 30)
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate
    }
  }
  
  const { startDate, endDate } = getDateRange(selectedPeriod)
  const { reports, isLoading: reportsLoading, error: reportsError } = usePurchaseReports(startDate, endDate)

  const isLoading = reportsLoading
  const hasError = reportsError

  // Default metrics when loading or no data - usar nueva estructura de la API
  const metrics = {
    totalPurchases: reports?.totalAmount || 0,
    totalOrders: reports?.totalOrders || 0,
    receivedOrders: reports?.completedOrders || 0,
    pendingOrders: reports?.pendingOrders || 0,
    averageOrderValue: reports?.averageOrderValue || 0
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
  }

  if (hasError) {
    console.error('Purchase reports error:', reportsError)
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-graph-up me-3"></i>
                Reportes de Compras
              </h1>
              <p className="text-muted">
                Análisis y métricas del proceso de compras
              </p>
            </div>
            <div className="btn-group">
              <button 
                className={`btn btn-outline-primary ${selectedPeriod === '30days' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('30days')}
                disabled={isLoading}
              >
                30 días
              </button>
              <button 
                className={`btn btn-outline-primary ${selectedPeriod === '90days' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('90days')}
                disabled={isLoading}
              >
                90 días
              </button>
              <button 
                className={`btn btn-outline-primary ${selectedPeriod === '1year' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('1year')}
                disabled={isLoading}
              >
                1 año
              </button>
              <button 
                className={`btn btn-outline-primary ${selectedPeriod === 'all' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('all')}
                disabled={isLoading}
              >
                Todos
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
              Cargando reportes de compras...
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
          <div className="card text-white bg-info">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-white-50">Compras del Período</h6>
                  <h3 className="mb-0">{formatCurrency(metrics.totalPurchases)}</h3>
                  {isLoading && <div className="spinner-border spinner-border-sm text-light"></div>}
                </div>
                <div className="ms-3">
                  <i className="bi bi-cart-plus display-6"></i>
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
          <div className="card text-white bg-warning">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-white-50">Órdenes Pendientes</h6>
                  <h3 className="mb-0">{metrics.pendingOrders.toLocaleString()}</h3>
                  {isLoading && <div className="spinner-border spinner-border-sm text-light"></div>}
                </div>
                <div className="ms-3">
                  <i className="bi bi-clock display-6"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card text-white bg-primary">
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
                Análisis del Período ({selectedPeriod === '30days' ? '30 días' : selectedPeriod === '90days' ? '90 días' : selectedPeriod === '1year' ? '1 año' : 'Todos los datos'})
              </h5>
            </div>
            <div className="card-body">
              {reports ? (
                <div>
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className="text-center">
                        <h6 className="text-muted">Total de Compras</h6>
                        <h4 className="text-info">{formatCurrency(reports.totalAmount || 0)}</h4>
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
                        <h4 className="text-primary">
                          {startDate} - {endDate}
                        </h4>
                      </div>
                    </div>
                  </div>
                  
                  {/* Compras por Estado */}
                  {reports.byStatus && reports.byStatus.length > 0 && (
                    <div className="mb-4">
                      <h6 className="mb-3">Compras por Estado</h6>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Estado</th>
                              <th>Cantidad</th>
                              <th>Monto Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reports.byStatus.map((status: any, index: number) => (
                              <tr key={index}>
                                <td>
                                  <span className="badge bg-secondary">{status.status}</span>
                                </td>
                                <td>{status.count}</td>
                                <td>{formatCurrency(parseFloat(status.total_amount))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* Por Proveedor */}
                  {reports.bySupplier && reports.bySupplier.length > 0 && (
                    <div>
                      <h6 className="mb-3">Por Proveedor</h6>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Proveedor</th>
                              <th>Órdenes</th>
                              <th>Monto Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reports.bySupplier.slice(0, 5).map((supplier: any, index: number) => (
                              <tr key={index}>
                                <td>
                                  <strong>{supplier.supplier_name || 'N/A'}</strong>
                                </td>
                                <td>{supplier.orders_count}</td>
                                <td>{formatCurrency(parseFloat(supplier.total_amount))}</td>
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
                  <i className="bi bi-graph-down-arrow display-1 text-info mb-3"></i>
                  <h5>Reportes de Compras</h5>
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