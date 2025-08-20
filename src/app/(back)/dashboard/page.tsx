'use client'

import { useState } from 'react'
import { 
  useBalanceGeneral, 
  useEstadoResultados, 
  useSalesReports, 
  usePurchaseReports 
} from '@/modules/accounting'

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30)
  
  // Fetch real data from APIs
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-MX').format(num)
  }

  // Calculate key metrics
  const totalAssets = balanceGeneral?.totals?.total_assets || 0
  const totalRevenue = salesReports?.data?.total_sales || 0
  const totalPurchases = purchaseReports?.data?.total_purchases || 0
  const netIncome = estadoResultados?.data?.net_income || (totalRevenue - totalPurchases)
  const salesOrders = salesReports?.data?.total_orders || 0
  const purchaseOrders = purchaseReports?.data?.total_orders || 0

  return (
    <main>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-2">Panel de Control</h2>
          <p className="text-muted mb-0">Vista general del desempeño empresarial</p>
        </div>
        
        {/* Period Selector */}
        <div className="dropdown">
          <button
            className="btn btn-outline-primary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            disabled={isLoading}
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
          </ul>
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
      <div className="row g-4 mb-5">
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
                    <i className="bi bi-receipt"></i> {formatNumber(salesOrders)} órdenes
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
                    <i className="bi bi-truck"></i> {formatNumber(purchaseOrders)} órdenes
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
                    {netIncome >= 0 ? 'Ganancia' : 'Pérdida'}
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
                  <a 
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
                  </a>
                </div>

                <div className="col-md-6 col-xl-3">
                  <a 
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
                  </a>
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
            Módulos del Sistema
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
                  <a href="/dashboard/products" className="text-decoration-none">
                    Productos
                  </a>
                </h5>
                <p className="card-text text-muted small">Gestión completa de inventario</p>
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
                  <a href="/dashboard/contacts" className="text-decoration-none">
                    Contactos
                  </a>
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
                <span className="badge bg-warning">Gestión Avanzada</span>
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
                  <a href="/dashboard/sales" className="text-decoration-none">
                    Ventas
                  </a>
                </h5>
                <p className="card-text text-muted small">Órdenes de venta y clientes</p>
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
                  <a href="/dashboard/purchase" className="text-decoration-none">
                    Compras
                  </a>
                </h5>
                <p className="card-text text-muted small">Órdenes de compra y proveedores</p>
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
        {/* Row 3: Finance & Administration */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-bank display-5 text-info me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">
                  <a href="/dashboard/finance/ap-invoices" className="text-decoration-none">
                    Finanzas
                  </a>
                </h5>
                <p className="card-text text-muted small">Cuentas por pagar y cobrar</p>
                <span className="badge bg-info">Pagos & Recibos</span>
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

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-people display-5 text-secondary me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">
                  <a href="/dashboard/users" className="text-decoration-none">
                    Usuarios
                  </a>
                </h5>
                <p className="card-text text-muted small">Gestión de usuarios del sistema</p>
                <span className="badge bg-secondary">Administración</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Row 4: Content & Tools */}
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
              <i className="bi bi-grid-3x3-gap display-5 text-warning me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">
                  <a href="/dashboard/catalog" className="text-decoration-none">
                    Catálogo
                  </a>
                </h5>
                <p className="card-text text-muted small">Productos destacados y ofertas</p>
                <span className="badge bg-warning">E-commerce</span>
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
