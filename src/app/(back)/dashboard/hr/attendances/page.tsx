'use client'

export default function AttendancesPage() {
  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-2">
            <i className="bi bi-clock-history me-3" />
            Asistencia
          </h1>
          <p className="text-muted">
            Control de asistencia con auto-cálculo de horas trabajadas y tiempo extra
          </p>
        </div>
      </div>

      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2" />
        <strong>Próximamente:</strong> Registro de asistencia diaria con check-in/check-out y auto-cálculo de horas.
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-clock me-2" />
                Registrar Entrada/Salida
              </h5>
              <p className="text-muted small">
                Registro automático de horas trabajadas y tiempo extra
              </p>
              <button className="btn btn-success w-100" disabled>
                Registrar Asistencia
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-file-earmark-text me-2" />
                Reportes de Asistencia
              </h5>
              <p className="text-muted small">
                Consulta histórico de asistencia por empleado y periodo
              </p>
              <button className="btn btn-outline-success w-100" disabled>
                Ver Reportes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
