'use client'

export default function LeavesPage() {
  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-2">
            <i className="bi bi-calendar-check me-3" />
            Permisos y Vacaciones
          </h1>
          <p className="text-muted">
            Gestión de solicitudes de permisos con auto-cálculo de días
          </p>
        </div>
      </div>

      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2" />
        <strong>Próximamente:</strong> Sistema completo de solicitud y aprobación de permisos y vacaciones.
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-plus-circle me-2" />
                Nueva Solicitud
              </h5>
              <p className="text-muted small">
                Solicitar vacaciones o permisos
              </p>
              <button className="btn btn-primary w-100" disabled>
                Solicitar Permiso
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-clock-history me-2" />
                Pendientes
              </h5>
              <p className="text-muted small">
                Revisar solicitudes pendientes de aprobación
              </p>
              <button className="btn btn-outline-warning w-100" disabled>
                Ver Pendientes
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-list-check me-2" />
                Tipos de Permiso
              </h5>
              <p className="text-muted small">
                Catálogo de tipos de permiso disponibles
              </p>
              <button className="btn btn-outline-primary w-100" disabled>
                Ver Catálogo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
