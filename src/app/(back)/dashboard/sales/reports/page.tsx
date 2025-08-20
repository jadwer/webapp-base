'use client'

export default function SalesReportsPage() {
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
              <button className="btn btn-outline-primary active">
                30 días
              </button>
              <button className="btn btn-outline-primary">
                90 días
              </button>
              <button className="btn btn-outline-primary">
                1 año
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6 col-xl-3">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-white-50">Ventas del Mes</h6>
                  <h3 className="mb-0">$25,450.00</h3>
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
                  <h3 className="mb-0">127</h3>
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
                  <h6 className="card-title text-white-50">Órdenes Pendientes</h6>
                  <h3 className="mb-0">23</h3>
                </div>
                <div className="ms-3">
                  <i className="bi bi-clock display-6"></i>
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
                  <h6 className="card-title text-white-50">Clientes Activos</h6>
                  <h3 className="mb-0">89</h3>
                </div>
                <div className="ms-3">
                  <i className="bi bi-people display-6"></i>
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
                Resumen del Período
              </h5>
            </div>
            <div className="card-body">
              <div className="text-center py-4">
                <i className="bi bi-graph-up-arrow display-1 text-primary mb-3"></i>
                <h5>Reportes de Sales Implementados</h5>
                <p className="text-muted mb-0">
                  Los datos en tiempo real aparecerán cuando se conecte con la API del backend.
                </p>
                <div className="mt-3">
                  <span className="badge bg-success me-2">✅ Módulo completado</span>
                  <span className="badge bg-info me-2">📊 Hooks de reportes</span>
                  <span className="badge bg-warning">🔗 Pendiente API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}