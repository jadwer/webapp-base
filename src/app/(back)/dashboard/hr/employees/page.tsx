'use client'

export default function EmployeesPage() {
  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-2">
            <i className="bi bi-people me-3" />
            Empleados
          </h1>
          <p className="text-muted">
            Gestión completa de empleados, departamentos y puestos
          </p>
        </div>
      </div>

      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2" />
        <strong>Próximamente:</strong> Interfaz completa de gestión de empleados con CRUD, asignación de departamentos y puestos.
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-person-plus me-2" />
                Nuevo Empleado
              </h5>
              <p className="text-muted small">Alta de nuevos empleados con código único</p>
              <button className="btn btn-primary w-100" disabled>
                Agregar Empleado
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-diagram-3 me-2" />
                Departamentos
              </h5>
              <p className="text-muted small">Gestión de estructura organizacional</p>
              <button className="btn btn-outline-primary w-100" disabled>
                Ver Departamentos
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-briefcase me-2" />
                Puestos
              </h5>
              <p className="text-muted small">Catálogo de puestos disponibles</p>
              <button className="btn btn-outline-primary w-100" disabled>
                Ver Puestos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
