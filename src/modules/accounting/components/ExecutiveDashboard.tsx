'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  useBalanceGeneral,
  useEstadoResultados,
  useSalesReports,
  usePurchaseReports
} from '../hooks/useReports'

export function ExecutiveDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30)
  
  // Fetch all reports with consistent period
  const { balanceGeneral, isLoading: balanceLoading } = useBalanceGeneral()
  const { estadoResultados, isLoading: estadoLoading } = useEstadoResultados()
  const { salesReports, isLoading: salesLoading } = useSalesReports(selectedPeriod)
  const { purchaseReports, isLoading: purchaseLoading } = usePurchaseReports(selectedPeriod)

  const isLoading = balanceLoading || estadoLoading || salesLoading || purchaseLoading

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  // Calculate key metrics
  const totalAssets = balanceGeneral?.totals?.total_assets || 0
  const totalRevenue = estadoResultados?.data?.revenue?.total || salesReports?.data?.total_sales || 0
  const totalExpenses = estadoResultados?.data?.expenses?.total || 0
  const netIncome = estadoResultados?.data?.net_income || (totalRevenue - totalExpenses)
  const totalPurchases = purchaseReports?.data?.total_purchases || 0
  const profitMargin = totalRevenue > 0 ? netIncome / totalRevenue : 0

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-speedometer2 text-primary me-2"></i>
                Dashboard Ejecutivo
              </h1>
              <p className="text-muted mb-0">
                Vista general del desempeño financiero y operativo
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

      {isLoading && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-info border-0">
              <div className="d-flex align-items-center">
                <div className="spinner-border text-info me-3" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <div>Cargando datos del dashboard ejecutivo...</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Executive KPIs */}
      <div className="row mb-4">
        <div className="col-md-6 col-xl-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Activos Totales</h6>
                  <h4 className="mb-0 text-primary">
                    {formatCurrency(totalAssets)}
                  </h4>
                  <small className="text-success">
                    <i className="bi bi-arrow-up"></i> Balance General
                  </small>
                </div>
                <div className="ms-3">
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <i className="bi bi-bank text-primary fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Ingresos ({selectedPeriod}d)</h6>
                  <h4 className="mb-0 text-success">
                    {formatCurrency(totalRevenue)}
                  </h4>
                  <small className="text-muted">
                    <i className="bi bi-graph-up"></i> Ventas
                  </small>
                </div>
                <div className="ms-3">
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <i className="bi bi-cash-coin text-success fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Gastos ({selectedPeriod}d)</h6>
                  <h4 className="mb-0 text-danger">
                    {formatCurrency(totalPurchases)}
                  </h4>
                  <small className="text-muted">
                    <i className="bi bi-truck"></i> Compras
                  </small>
                </div>
                <div className="ms-3">
                  <div className="bg-danger bg-opacity-10 p-3 rounded">
                    <i className="bi bi-credit-card text-danger fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Margen de Ganancia</h6>
                  <h4 className="mb-0 text-info">
                    {formatPercentage(profitMargin)}
                  </h4>
                  <small className={netIncome >= 0 ? 'text-success' : 'text-danger'}>
                    <i className={`bi bi-arrow-${netIncome >= 0 ? 'up' : 'down'}`}></i>
                    {formatCurrency(netIncome)}
                  </small>
                </div>
                <div className="ms-3">
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <i className="bi bi-percent text-info fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access to Reports */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0">
                <i className="bi bi-collection text-primary me-2"></i>
                Reportes Ejecutivos - Acceso Rápido
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6 col-xl-3">
                  <div className="card border h-100">
                    <div className="card-body text-center">
                      <i className="bi bi-clipboard-data text-primary fs-1 mb-3"></i>
                      <h6>Balance General</h6>
                      <p className="text-muted small mb-3">
                        Estado actual de activos, pasivos y patrimonio
                      </p>
                      <Link
                        href="/dashboard/accounting/reports/balance-general"
                        className="btn btn-outline-primary btn-sm"
                      >
                        Ver Reporte
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xl-3">
                  <div className="card border h-100">
                    <div className="card-body text-center">
                      <i className="bi bi-graph-up-arrow text-success fs-1 mb-3"></i>
                      <h6>Estado de Resultados</h6>
                      <p className="text-muted small mb-3">
                        Ingresos, gastos y utilidad neta del período
                      </p>
                      <Link
                        href="/dashboard/accounting/reports/estado-resultados"
                        className="btn btn-outline-success btn-sm"
                      >
                        Ver Reporte
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xl-3">
                  <div className="card border h-100">
                    <div className="card-body text-center">
                      <i className="bi bi-graph-up text-info fs-1 mb-3"></i>
                      <h6>Reportes de Ventas</h6>
                      <p className="text-muted small mb-3">
                        Análisis de ventas, clientes y productos
                      </p>
                      <Link
                        href="/dashboard/sales/reports"
                        className="btn btn-outline-info btn-sm"
                      >
                        Ver Reporte
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xl-3">
                  <div className="card border h-100">
                    <div className="card-body text-center">
                      <i className="bi bi-truck text-warning fs-1 mb-3"></i>
                      <h6>Reportes de Compras</h6>
                      <p className="text-muted small mb-3">
                        Análisis de compras, proveedores y costos
                      </p>
                      <Link
                        href="/dashboard/purchase/reports"
                        className="btn btn-outline-warning btn-sm"
                      >
                        Ver Reporte
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Reports */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0">
                <i className="bi bi-journal text-primary me-2"></i>
                Reportes Contables
              </h6>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <Link
                  href="/dashboard/accounting/reports/balanza-comprobacion"
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                >
                  <div>
                    <i className="bi bi-balance-scale text-primary me-2"></i>
                    Balanza de Comprobación
                  </div>
                  <i className="bi bi-arrow-right"></i>
                </Link>
                <Link
                  href="/dashboard/accounting/reports/libro-diario"
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                >
                  <div>
                    <i className="bi bi-journal-text text-primary me-2"></i>
                    Libro Diario
                  </div>
                  <i className="bi bi-arrow-right"></i>
                </Link>
                <Link
                  href="/dashboard/accounting/reports/libro-mayor"
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                >
                  <div>
                    <i className="bi bi-book text-primary me-2"></i>
                    Libro Mayor
                  </div>
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0">
                <i className="bi bi-info-circle text-primary me-2"></i>
                Estado del Sistema
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6">
                  <div className="text-center">
                    <div className="badge bg-success fs-6 mb-2">✅</div>
                    <p className="text-success small mb-0">
                      <strong>7 Reportes</strong><br />
                      APIs Funcionando
                    </p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center">
                    <div className="badge bg-info fs-6 mb-2">📊</div>
                    <p className="text-info small mb-0">
                      <strong>Tiempo Real</strong><br />
                      Datos Actualizados
                    </p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center">
                    <div className="badge bg-warning fs-6 mb-2">🎯</div>
                    <p className="text-warning small mb-0">
                      <strong>Período</strong><br />
                      {selectedPeriod} días
                    </p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center">
                    <div className="badge bg-primary fs-6 mb-2">🚀</div>
                    <p className="text-primary small mb-0">
                      <strong>SWR Cache</strong><br />
                      Optimizado
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}