'use client'

export default function AgingReportsPage() {
  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-2">
            <i className="bi bi-clock-history me-3" />
            Reportes de Antigüedad
          </h1>
          <p className="text-muted">
            Cuentas por Cobrar y Cuentas por Pagar con análisis de vencimientos
          </p>
        </div>
      </div>

      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2" />
        <strong>Próximamente:</strong> Visualización completa de reportes de antigüedad AR/AP con desglose por periodos y clientes/proveedores.
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-header bg-warning text-white">
              <h5 className="mb-0">AR Aging Report</h5>
            </div>
            <div className="card-body">
              <p className="text-muted">Análisis de Cuentas por Cobrar por antigüedad (0-30, 31-60, 61-90, 90+ días)</p>
              <button className="btn btn-outline-warning" disabled>
                <i className="bi bi-file-earmark-text me-2" />
                Generar Reporte AR
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0">AP Aging Report</h5>
            </div>
            <div className="card-body">
              <p className="text-muted">Análisis de Cuentas por Pagar por antigüedad (0-30, 31-60, 61-90, 90+ días)</p>
              <button className="btn btn-outline-danger" disabled>
                <i className="bi bi-file-earmark-text me-2" />
                Generar Reporte AP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
