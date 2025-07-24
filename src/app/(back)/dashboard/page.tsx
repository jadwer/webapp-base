'use client'

import RoleBasedDemo from '@/ui/components/RoleBasedDemo'

export default function DashboardPage() {
  return (
    <main>

      <h2 className="mb-4">Panel de Control</h2>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-people-fill display-5 text-primary me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">Usuarios</h5>
                <p className="card-text text-muted small">Gestión de roles y usuarios activos</p>
                <span className="badge bg-primary">42 activos</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-window-stack display-5 text-success me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">Page Builder</h5>
                <p className="card-text text-muted small">Editor visual y contenido publicado</p>
                <span className="badge bg-success">17 páginas publicadas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-shield-lock-fill display-5 text-warning me-3" aria-hidden="true"></i>
              <div>
                <h5 className="card-title mb-1">Permisos</h5>
                <p className="card-text text-muted small">Control de acceso por rol</p>
                <span className="badge bg-warning text-dark">24 permisos definidos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo del sistema de roles */}
      <div className="mt-5">
        <RoleBasedDemo />
      </div>
    </main>
  )
}
