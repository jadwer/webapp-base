/**
 * Reports Index Page - Main landing page for reports
 */

'use client'

import Link from 'next/link'

export const ReportsIndexPage = () => {
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-file-bar-graph me-3" />
                Reportes
              </h1>
              <p className="text-muted">
                Reportes financieros, de antigüedad y gerenciales generados dinámicamente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="row g-4">
        {/* Financial Statements */}
        <div className="col-12 col-md-4">
          <div className="card h-100 border-primary">
            <div className="card-body">
              <div className="d-flex align-items-start mb-3">
                <div className="bg-primary bg-opacity-10 rounded p-3 me-3">
                  <i className="bi bi-file-earmark-text text-primary" style={{ fontSize: '2rem' }} />
                </div>
                <div>
                  <h5 className="card-title mb-1">Estados Financieros</h5>
                  <p className="text-muted small mb-0">
                    Balance General, Estado de Resultados, Flujo de Efectivo
                  </p>
                </div>
              </div>
              <div className="mb-3">
                <ul className="list-unstyled mb-0 small">
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2" />
                    Balance General (Balance Sheet)
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2" />
                    Estado de Resultados (Income Statement)
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2" />
                    Flujo de Efectivo (Cash Flow)
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2" />
                    Balanza de Comprobación (Trial Balance)
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/reports/financial-statements"
                className="btn btn-outline-primary w-100"
              >
                Ver Estados Financieros
              </Link>
            </div>
          </div>
        </div>

        {/* Aging Reports */}
        <div className="col-12 col-md-4">
          <div className="card h-100 border-warning">
            <div className="card-body">
              <div className="d-flex align-items-start mb-3">
                <div className="bg-warning bg-opacity-10 rounded p-3 me-3">
                  <i className="bi bi-clock-history text-warning" style={{ fontSize: '2rem' }} />
                </div>
                <div>
                  <h5 className="card-title mb-1">Reportes de Antigüedad</h5>
                  <p className="text-muted small mb-0">
                    Cuentas por Cobrar y Pagar con análisis de vencimientos
                  </p>
                </div>
              </div>
              <div className="mb-3">
                <ul className="list-unstyled mb-0 small">
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2" />
                    Antigüedad de Cuentas por Cobrar (AR)
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2" />
                    Antigüedad de Cuentas por Pagar (AP)
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-info-circle text-info me-2" />
                    Análisis por periodos (0-30, 31-60, 61-90, 90+)
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-info-circle text-info me-2" />
                    Desglose por cliente/proveedor
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/reports/aging-reports"
                className="btn btn-outline-warning w-100"
              >
                Ver Reportes de Antigüedad
              </Link>
            </div>
          </div>
        </div>

        {/* Management Reports */}
        <div className="col-12 col-md-4">
          <div className="card h-100 border-success">
            <div className="card-body">
              <div className="d-flex align-items-start mb-3">
                <div className="bg-success bg-opacity-10 rounded p-3 me-3">
                  <i className="bi bi-graph-up text-success" style={{ fontSize: '2rem' }} />
                </div>
                <div>
                  <h5 className="card-title mb-1">Reportes Gerenciales</h5>
                  <p className="text-muted small mb-0">
                    Análisis de ventas y compras por cliente y producto
                  </p>
                </div>
              </div>
              <div className="mb-3">
                <ul className="list-unstyled mb-0 small">
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2" />
                    Ventas por Cliente
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2" />
                    Ventas por Producto
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2" />
                    Compras por Proveedor
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2" />
                    Compras por Producto
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/reports/management-reports"
                className="btn btn-outline-success w-100"
              >
                Ver Reportes Gerenciales
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-info d-flex align-items-center" role="alert">
            <i className="bi bi-info-circle me-3" style={{ fontSize: '1.5rem' }} />
            <div>
              <strong>Nota:</strong> Todos los reportes son de <strong>solo lectura</strong> y se generan
              dinámicamente basados en datos de los módulos de Contabilidad, Finanzas, Ventas y Compras.
              Seleccione el rango de fechas y moneda para personalizar cada reporte.
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="row mt-4 g-3">
        <div className="col-12 col-md-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center py-4">
              <i className="bi bi-calendar-range text-primary" style={{ fontSize: '2rem' }} />
              <h6 className="mt-3 mb-2">Filtros de Fecha</h6>
              <p className="text-muted small mb-0">
                Personaliza el periodo de análisis
              </p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center py-4">
              <i className="bi bi-currency-dollar text-success" style={{ fontSize: '2rem' }} />
              <h6 className="mt-3 mb-2">Multi-Moneda</h6>
              <p className="text-muted small mb-0">
                Reportes en USD, MXN y más
              </p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center py-4">
              <i className="bi bi-download text-info" style={{ fontSize: '2rem' }} />
              <h6 className="mt-3 mb-2">Exportación</h6>
              <p className="text-muted small mb-0">
                Descarga en CSV o PDF
              </p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center py-4">
              <i className="bi bi-lightning text-warning" style={{ fontSize: '2rem' }} />
              <h6 className="mt-3 mb-2">Tiempo Real</h6>
              <p className="text-muted small mb-0">
                Datos actualizados al momento
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
