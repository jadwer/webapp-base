'use client'

export default function PayrollPage() {
  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-2">
            <i className="bi bi-cash-stack me-3" />
            Nómina
          </h1>
          <p className="text-muted">
            Procesamiento de nómina con integración automática a Contabilidad
          </p>
        </div>
      </div>

      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2" />
        <strong>Próximamente:</strong> Sistema completo de nómina con auto-cálculo de totales y posting automático al GL.
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-plus-circle me-2" />
                Nuevo Periodo
              </h5>
              <p className="text-muted small">
                Crear nuevo periodo de nómina (semanal, quincenal, mensual)
              </p>
              <ul className="list-unstyled mb-3 small">
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2" />
                  Auto-cálculo de totales brutos/netos
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2" />
                  Integración con asistencia para tiempo extra
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2" />
                  Posting automático a Contabilidad
                </li>
              </ul>
              <button className="btn btn-primary w-100" disabled>
                Crear Periodo de Nómina
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-file-earmark-spreadsheet me-2" />
                Periodos de Nómina
              </h5>
              <p className="text-muted small">
                Consultar histórico de periodos procesados
              </p>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="badge bg-secondary">Borrador</span>
                  <span className="badge bg-info">Procesando</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="badge bg-success">Aprobado</span>
                  <span className="badge bg-primary">Pagado</span>
                </div>
              </div>
              <button className="btn btn-outline-primary w-100" disabled>
                Ver Todos los Periodos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
