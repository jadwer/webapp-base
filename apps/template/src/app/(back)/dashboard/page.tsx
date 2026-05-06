'use client'

import React, { useState, useMemo, Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/modules/auth'
import { isAdmin } from '@/lib/permissions'
import CustomerDashboard from '@/modules/ecommerce/components/CustomerDashboard'
import {
  useBalanceGeneral,
  useEstadoResultados,
  useSalesReports,
  usePurchaseReports
} from '@/modules/accounting'
import { useCFDIInvoices } from '@/modules/billing/hooks'
import { useLeads, useOpportunities, useCampaigns } from '@/modules/crm/hooks'
import { useEcommerceOrders } from '@/modules/ecommerce/hooks'
import { useEmployees } from '@/modules/hr/hooks'
import { useSystemHealth } from '@/modules/system-health'

class DashboardErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Dashboard error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container-fluid py-5">
          <div className="alert alert-danger">
            <h5 className="alert-heading">Error en el Dashboard</h5>
            <p>Ocurrio un error al cargar el dashboard. Por favor, recarga la pagina.</p>
            <button
              className="btn btn-outline-danger"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Reintentar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin(user)) {
    return (
      <DashboardErrorBoundary>
        <CustomerDashboard />
      </DashboardErrorBoundary>
    )
  }

  return (
    <DashboardErrorBoundary>
      <AdminDashboard />
    </DashboardErrorBoundary>
  )
}

function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Accounting data
  const { balanceGeneral, isLoading: balanceLoading } = useBalanceGeneral()
  const { estadoResultados, isLoading: estadoLoading } = useEstadoResultados()
  const { salesReports, isLoading: salesLoading } = useSalesReports(selectedPeriod)
  const { purchaseReports, isLoading: purchaseLoading } = usePurchaseReports(selectedPeriod)

  // Billing data
  const { invoices, isLoading: invoicesLoading } = useCFDIInvoices()

  // CRM data
  const { leads, isLoading: leadsLoading } = useLeads()
  const { opportunities, isLoading: opportunitiesLoading } = useOpportunities()
  const { campaigns, isLoading: campaignsLoading } = useCampaigns()

  // E-commerce data
  const { ecommerceOrders, isLoading: ordersLoading } = useEcommerceOrders()

  // HR data
  const { employees, isLoading: employeesLoading } = useEmployees()

  // System Health data
  const { health, isLoading: healthLoading } = useSystemHealth(60000)

  const isLoading = balanceLoading || estadoLoading || salesLoading || purchaseLoading

  const currencyFormatter = useMemo(() => new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }), [])
  const numberFormatter = useMemo(() => new Intl.NumberFormat('es-MX'), [])

  const formatCurrency = (amount: number) => currencyFormatter.format(amount)
  const formatNumber = (num: number) => numberFormatter.format(num)

  // Calculate accounting metrics
  const totalAssets = balanceGeneral?.totals?.total_assets || 0
  const totalRevenue = salesReports?.data?.total_sales || 0
  const totalPurchases = purchaseReports?.data?.total_purchases || 0
  const netIncome = estadoResultados?.data?.net_income || (totalRevenue - totalPurchases)
  const salesOrders = salesReports?.data?.total_orders || 0
  const purchaseOrders = purchaseReports?.data?.total_orders || 0

  // Calculate billing metrics
  const totalInvoices = invoices?.length || 0
  const stampedInvoices = invoices?.filter(
    (inv) => inv.status === 'stamped' || inv.status === 'valid'
  ).length || 0
  const totalInvoicedAmount = invoices
    ?.filter((inv) => inv.status === 'stamped' || inv.status === 'valid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

  // Calculate CRM metrics
  const totalLeads = leads?.length || 0
  const newLeads = leads?.filter((l) => l.status === 'new').length || 0
  const totalOpportunities = opportunities?.length || 0
  const pipelineValue = opportunities?.reduce((sum, opp) => sum + (opp.amount || 0), 0) || 0
  const activeCampaigns = campaigns?.filter((c) => c.status === 'active').length || 0

  // Calculate E-commerce metrics
  const totalEcommerceOrders = ecommerceOrders?.length || 0
  const pendingOrders = ecommerceOrders?.filter((o) => o.status === 'pending').length || 0

  // Calculate HR metrics
  const totalEmployees = employees?.length || 0
  const activeEmployees = employees?.filter((e) => e.status === 'active').length || 0

  // System health status
  const systemStatus = health?.status || 'unknown'

  return (
    <main>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-2">Panel de Control</h2>
          <p className="text-muted mb-0">Vista general del desempeno empresarial</p>
        </div>

        {/* Period Selector */}
        <div className="dropdown" style={{ position: 'relative' }}>
          <button
            className="btn btn-outline-primary dropdown-toggle"
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            disabled={isLoading}
          >
            <i className="bi bi-calendar3 me-2"></i>
            {selectedPeriod} dias
          </button>
          {dropdownOpen && (
            <ul className="dropdown-menu show" style={{ position: 'absolute', right: 0 }}>
              {[7, 30, 90].map((days) => (
                <li key={days}>
                  <button
                    className="dropdown-item"
                    onClick={() => { setSelectedPeriod(days); setDropdownOpen(false) }}
                  >
                    {days} dias
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="alert alert-info mb-4">
          <div className="d-flex align-items-center">
            <div className="spinner-border text-info me-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <div>Cargando datos del dashboard...</div>
          </div>
        </div>
      )}

      {/* Financial KPIs */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
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

        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Ventas ({selectedPeriod}d)</h6>
                  <h4 className="mb-0 text-success">
                    {formatCurrency(totalRevenue)}
                  </h4>
                  <small className="text-muted">
                    <i className="bi bi-receipt"></i> {formatNumber(salesOrders)} ordenes
                  </small>
                </div>
                <div className="ms-3">
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <i className="bi bi-graph-up text-success fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Compras ({selectedPeriod}d)</h6>
                  <h4 className="mb-0 text-danger">
                    {formatCurrency(totalPurchases)}
                  </h4>
                  <small className="text-muted">
                    <i className="bi bi-truck"></i> {formatNumber(purchaseOrders)} ordenes
                  </small>
                </div>
                <div className="ms-3">
                  <div className="bg-danger bg-opacity-10 p-3 rounded">
                    <i className="bi bi-cart-dash text-danger fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Utilidad Neta</h6>
                  <h4 className={`mb-0 ${netIncome >= 0 ? 'text-info' : 'text-warning'}`}>
                    {formatCurrency(netIncome)}
                  </h4>
                  <small className={netIncome >= 0 ? 'text-success' : 'text-danger'}>
                    <i className={`bi bi-arrow-${netIncome >= 0 ? 'up' : 'down'}`}></i>
                    {netIncome >= 0 ? 'Ganancia' : 'Perdida'}
                  </small>
                </div>
                <div className="ms-3">
                  <div className={`${netIncome >= 0 ? 'bg-info' : 'bg-warning'} bg-opacity-10 p-3 rounded`}>
                    <i className={`bi bi-${netIncome >= 0 ? 'trophy' : 'exclamation-triangle'} ${netIncome >= 0 ? 'text-info' : 'text-warning'} fs-4`}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing & CRM KPIs */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Facturas CFDI</h6>
                  <h4 className="mb-0 text-primary">
                    {invoicesLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      formatNumber(totalInvoices)
                    )}
                  </h4>
                  <small className="text-success">
                    <i className="bi bi-check-circle"></i> {stampedInvoices} timbradas
                  </small>
                </div>
                <div className="ms-3">
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <i className="bi bi-receipt-cutoff text-primary fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Leads CRM</h6>
                  <h4 className="mb-0 text-info">
                    {leadsLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      formatNumber(totalLeads)
                    )}
                  </h4>
                  <small className="text-success">
                    <i className="bi bi-plus-circle"></i> {newLeads} nuevos
                  </small>
                </div>
                <div className="ms-3">
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <i className="bi bi-person-plus text-info fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Pipeline</h6>
                  <h4 className="mb-0 text-success">
                    {opportunitiesLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      formatCurrency(pipelineValue / 100)
                    )}
                  </h4>
                  <small className="text-muted">
                    <i className="bi bi-funnel"></i> {totalOpportunities} oportunidades
                  </small>
                </div>
                <div className="ms-3">
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <i className="bi bi-funnel-fill text-success fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Campanas</h6>
                  <h4 className="mb-0 text-warning">
                    {campaignsLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      formatNumber(activeCampaigns)
                    )}
                  </h4>
                  <small className="text-muted">
                    <i className="bi bi-megaphone"></i> activas
                  </small>
                </div>
                <div className="ms-3">
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <i className="bi bi-megaphone-fill text-warning fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* E-commerce & HR KPIs */}
      <div className="row g-4 mb-5">
        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Pedidos E-commerce</h6>
                  <h4 className="mb-0 text-purple" style={{ color: '#6f42c1' }}>
                    {ordersLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      formatNumber(totalEcommerceOrders)
                    )}
                  </h4>
                  <small className="text-warning">
                    <i className="bi bi-clock"></i> {pendingOrders} pendientes
                  </small>
                </div>
                <div className="ms-3">
                  <div className="p-3 rounded" style={{ backgroundColor: 'rgba(111, 66, 193, 0.1)' }}>
                    <i className="bi bi-cart-check fs-4" style={{ color: '#6f42c1' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Empleados</h6>
                  <h4 className="mb-0 text-secondary">
                    {employeesLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      formatNumber(totalEmployees)
                    )}
                  </h4>
                  <small className="text-success">
                    <i className="bi bi-person-check"></i> {activeEmployees} activos
                  </small>
                </div>
                <div className="ms-3">
                  <div className="bg-secondary bg-opacity-10 p-3 rounded">
                    <i className="bi bi-people-fill text-secondary fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Total Facturado</h6>
                  <h4 className="mb-0 text-success">
                    {invoicesLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      formatCurrency(totalInvoicedAmount / 100)
                    )}
                  </h4>
                  <small className="text-muted">
                    <i className="bi bi-currency-dollar"></i> CFDI timbrados
                  </small>
                </div>
                <div className="ms-3">
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <i className="bi bi-cash-stack text-success fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Estado Sistema</h6>
                  <h4 className={`mb-0 ${
                    systemStatus === 'healthy' ? 'text-success' :
                    systemStatus === 'warning' ? 'text-warning' :
                    systemStatus === 'critical' ? 'text-danger' : 'text-secondary'
                  }`}>
                    {healthLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      systemStatus === 'healthy' ? 'Saludable' :
                      systemStatus === 'warning' ? 'Advertencia' :
                      systemStatus === 'critical' ? 'Critico' : 'Desconocido'
                    )}
                  </h4>
                  <small className="text-muted">
                    <i className="bi bi-heart-pulse"></i> monitoreo activo
                  </small>
                </div>
                <div className="ms-3">
                  <div className={`p-3 rounded ${
                    systemStatus === 'healthy' ? 'bg-success' :
                    systemStatus === 'warning' ? 'bg-warning' :
                    systemStatus === 'critical' ? 'bg-danger' : 'bg-secondary'
                  } bg-opacity-10`}>
                    <i className={`bi bi-heart-pulse fs-4 ${
                      systemStatus === 'healthy' ? 'text-success' :
                      systemStatus === 'warning' ? 'text-warning' :
                      systemStatus === 'critical' ? 'text-danger' : 'text-secondary'
                    }`}></i>
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
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0">
                <i className="bi bi-speedometer2 text-primary me-2"></i>
                Reportes Ejecutivos
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6 col-xl-3">
                  <a
                    href="/dashboard/accounting/reports"
                    className="card border text-decoration-none h-100"
                  >
                    <div className="card-body text-center">
                      <i className="bi bi-speedometer2 text-primary fs-1 mb-3"></i>
                      <h6 className="text-dark">Dashboard Ejecutivo</h6>
                      <p className="text-muted small mb-0">
                        Vista integral de todos los reportes
                      </p>
                    </div>
                  </a>
                </div>

                <div className="col-md-6 col-xl-3">
                  <a
                    href="/dashboard/accounting/reports/balance-general"
                    className="card border text-decoration-none h-100"
                  >
                    <div className="card-body text-center">
                      <i className="bi bi-clipboard-data text-primary fs-1 mb-3"></i>
                      <h6 className="text-dark">Balance General</h6>
                      <p className="text-muted small mb-0">
                        {formatCurrency(totalAssets)} en activos
                      </p>
                    </div>
                  </a>
                </div>

                <div className="col-md-6 col-xl-3">
                  <Link
                    href="/dashboard/sales/reports"
                    className="card border text-decoration-none h-100"
                  >
                    <div className="card-body text-center">
                      <i className="bi bi-graph-up text-success fs-1 mb-3"></i>
                      <h6 className="text-dark">Reportes de Ventas</h6>
                      <p className="text-muted small mb-0">
                        {formatCurrency(totalRevenue)} en ventas
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="col-md-6 col-xl-3">
                  <Link
                    href="/dashboard/purchase/reports"
                    className="card border text-decoration-none h-100"
                  >
                    <div className="card-body text-center">
                      <i className="bi bi-truck text-warning fs-1 mb-3"></i>
                      <h6 className="text-dark">Reportes de Compras</h6>
                      <p className="text-muted small mb-0">
                        {formatCurrency(totalPurchases)} en compras
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All System Modules */}
      <div className="row mb-4">
        <div className="col-12">
          <h5 className="mb-3">
            <i className="bi bi-grid-3x3-gap text-primary me-2"></i>
            Modulos del Sistema
          </h5>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Row 1: Core Business Modules */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-box-seam display-5 text-info me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">
                  <Link href="/dashboard/products" className="text-decoration-none">
                    Productos
                  </Link>
                </h5>
                <p className="card-text text-muted small">Gestion completa de inventario</p>
                <span className="badge bg-info">Sistema Enterprise</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-people-fill display-5 text-secondary me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">
                  <Link href="/dashboard/contacts" className="text-decoration-none">
                    Contactos
                  </Link>
                </h5>
                <p className="card-text text-muted small">Clientes, proveedores y documentos</p>
                <span className="badge bg-secondary">CRM Completo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-boxes display-5 text-warning me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">
                  <a href="/dashboard/inventory" className="text-decoration-none">
                    Inventario
                  </a>
                </h5>
                <p className="card-text text-muted small">Control de almacenes y stock</p>
                <span className="badge bg-warning">Gestion Avanzada</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Row 2: Sales & Purchase */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-cart-check display-5 text-success me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">
                  <Link href="/dashboard/sales" className="text-decoration-none">
                    Ventas
                  </Link>
                </h5>
                <p className="card-text text-muted small">Ordenes de venta y clientes</p>
                <span className="badge bg-success">Con Reportes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-cart-plus display-5 text-primary me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">
                  <Link href="/dashboard/purchase" className="text-decoration-none">
                    Compras
                  </Link>
                </h5>
                <p className="card-text text-muted small">Ordenes de compra y proveedores</p>
                <span className="badge bg-primary">Con Reportes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-calculator display-5 text-danger me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">
                  <a href="/dashboard/accounting/accounts" className="text-decoration-none">
                    Contabilidad
                  </a>
                </h5>
                <p className="card-text text-muted small">Plan contable y asientos</p>
                <span className="badge bg-danger">7 Reportes APIs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Row 3: Finance, Billing & CRM */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-bank display-5 text-info me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">
                  <Link href="/dashboard/finance/ap-invoices" className="text-decoration-none">
                    Finanzas
                  </Link>
                </h5>
                <p className="card-text text-muted small">Cuentas por pagar y cobrar</p>
                <span className="badge bg-info">Pagos y Recibos</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-receipt-cutoff display-5 text-primary me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">
                  <Link href="/dashboard/billing" className="text-decoration-none">
                    Facturacion CFDI
                  </Link>
                </h5>
                <p className="card-text text-muted small">Facturacion electronica SAT 4.0</p>
                <span className="badge bg-primary">Timbrado PAC</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-funnel display-5 text-success me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">
                  <Link href="/dashboard/crm" className="text-decoration-none">
                    CRM
                  </Link>
                </h5>
                <p className="card-text text-muted small">Leads, oportunidades, campanas</p>
                <span className="badge bg-success">Pipeline Ventas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Row 4: E-commerce, HR & Admin */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-shop display-5 me-3" aria-hidden="true" style={{ color: '#6f42c1' }}></i>
              <div>
                <h5 className="card-title mb-1">
                  <Link href="/dashboard/ecommerce" className="text-decoration-none">
                    E-commerce
                  </Link>
                </h5>
                <p className="card-text text-muted small">Pedidos, carrito, wishlist</p>
                <span className="badge" style={{ backgroundColor: '#6f42c1' }}>Tienda Online</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-person-badge display-5 text-secondary me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">
                  <Link href="/dashboard/hr" className="text-decoration-none">
                    Recursos Humanos
                  </Link>
                </h5>
                <p className="card-text text-muted small">Empleados, asistencia, nomina</p>
                <span className="badge bg-secondary">RRHH Completo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-shield-lock display-5 text-dark me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">
                  <a href="/dashboard/permission-manager" className="text-decoration-none">
                    Permisos
                  </a>
                </h5>
                <p className="card-text text-muted small">Roles y control de acceso</p>
                <span className="badge bg-dark">RCRUD System</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Row 5: Tools & System */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-window-stack display-5 text-success me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">
                  <a href="/dashboard/pages" className="text-decoration-none">
                    Page Builder
                  </a>
                </h5>
                <p className="card-text text-muted small">Editor visual de contenido</p>
                <span className="badge bg-success">GrapeJS Pro</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-heart-pulse display-5 text-danger me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">
                  <Link href="/dashboard/system-health" className="text-decoration-none">
                    Estado del Sistema
                  </Link>
                </h5>
                <p className="card-text text-muted small">Monitoreo y diagnosticos</p>
                <span className="badge bg-danger">Health Check</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-palette display-5 text-primary me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">
                  <a href="/dashboard/design-system" className="text-decoration-none">
                    Design System
                  </a>
                </h5>
                <p className="card-text text-muted small">Componentes UI y estilos</p>
                <span className="badge bg-primary">ATM-UI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
