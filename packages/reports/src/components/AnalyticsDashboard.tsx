/**
 * AnalyticsDashboard Component
 *
 * Main analytics dashboard with KPIs and charts
 */

'use client'

import { useAnalyticsDashboard, useAnalyticsKpis } from '../hooks'
import { KPICard } from './KPICard'

export function AnalyticsDashboard() {
  const { dashboard, isLoading: isDashboardLoading } = useAnalyticsDashboard()
  const { kpis, isLoading: isKpisLoading } = useAnalyticsKpis()

  const isLoading = isDashboardLoading || isKpisLoading

  return (
    <div className="analytics-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Dashboard de Analytics</h4>
        <div className="text-muted small">
          Ultima actualizacion: {new Date().toLocaleString('es-MX')}
        </div>
      </div>

      {/* KPIs Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <KPICard
            title="Ventas Totales"
            value={kpis?.totalSales || 0}
            format="currency"
            trend={kpis?.salesTrend || 'neutral'}
            trendValue={kpis?.salesTrendValue}
            icon="bi-currency-dollar"
            color="success"
            isLoading={isLoading}
          />
        </div>
        <div className="col-md-3">
          <KPICard
            title="Ordenes"
            value={kpis?.totalOrders || 0}
            format="number"
            trend={kpis?.ordersTrend || 'neutral'}
            trendValue={kpis?.ordersTrendValue}
            icon="bi-cart"
            color="primary"
            isLoading={isLoading}
          />
        </div>
        <div className="col-md-3">
          <KPICard
            title="Clientes Nuevos"
            value={kpis?.newCustomers || 0}
            format="number"
            trend={kpis?.customersTrend || 'neutral'}
            trendValue={kpis?.customersTrendValue}
            icon="bi-people"
            color="info"
            isLoading={isLoading}
          />
        </div>
        <div className="col-md-3">
          <KPICard
            title="Ticket Promedio"
            value={kpis?.averageOrderValue || 0}
            format="currency"
            trend={kpis?.aovTrend || 'neutral'}
            trendValue={kpis?.aovTrendValue}
            icon="bi-receipt"
            color="warning"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="row g-3">
        <div className="col-md-8">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0">Ventas por Periodo</h6>
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : dashboard?.salesByPeriod ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Periodo</th>
                        <th className="text-end">Ventas</th>
                        <th className="text-end">Ordenes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.salesByPeriod.map((item: { period: string; sales: number; orders: number }) => (
                        <tr key={item.period}>
                          <td>{item.period}</td>
                          <td className="text-end">
                            {new Intl.NumberFormat('es-MX', {
                              style: 'currency',
                              currency: 'MXN',
                            }).format(item.sales)}
                          </td>
                          <td className="text-end">{item.orders}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0">Top Productos</h6>
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="placeholder-glow">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="d-flex justify-content-between mb-2">
                      <span className="placeholder col-6" />
                      <span className="placeholder col-3" />
                    </div>
                  ))}
                </div>
              ) : dashboard?.topProducts?.length > 0 ? (
                <ul className="list-unstyled mb-0">
                  {dashboard.topProducts.map((product: { name: string; sales: number }) => (
                    <li key={product.name} className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-truncate" style={{ maxWidth: '150px' }}>
                        {product.name}
                      </span>
                      <span className="text-muted">
                        {new Intl.NumberFormat('es-MX', {
                          style: 'currency',
                          currency: 'MXN',
                        }).format(product.sales)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-muted py-3">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="row g-3 mt-3">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Ventas por Categoria</h6>
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm" />
                </div>
              ) : dashboard?.salesByCategory?.length > 0 ? (
                <div>
                  {dashboard.salesByCategory.map((cat: { category: string; sales: number; percentage: number }) => (
                    <div key={cat.category} className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span>{cat.category}</span>
                        <span>
                          {new Intl.NumberFormat('es-MX', {
                            style: 'currency',
                            currency: 'MXN',
                          }).format(cat.sales)}
                        </span>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-3">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Resumen Rapido</h6>
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm" />
                </div>
              ) : (
                <div className="row g-3">
                  <div className="col-6">
                    <div className="text-muted small">Productos Activos</div>
                    <div className="h5 mb-0">{dashboard?.activeProducts || 0}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted small">Clientes Activos</div>
                    <div className="h5 mb-0">{dashboard?.activeCustomers || 0}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted small">Ordenes Pendientes</div>
                    <div className="h5 mb-0">{dashboard?.pendingOrders || 0}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted small">Inventario Bajo</div>
                    <div className="h5 mb-0 text-warning">{dashboard?.lowStockProducts || 0}</div>
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

export default AnalyticsDashboard
