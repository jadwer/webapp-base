'use client'

export default function OrganizationPage() {
  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-2">
            <i className="bi bi-building me-3" />
            Organización
          </h1>
          <p className="text-muted">
            Estructura organizacional: departamentos y puestos
          </p>
        </div>
      </div>

      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2" />
        <strong>Próximamente:</strong> Gestión completa de la estructura organizacional con jerarquías de departamentos y catálogo de puestos.
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-diagram-3 me-2" />
                Departamentos
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted">
                Organiza tu empresa en departamentos con managers asignados
              </p>
              <ul className="list-unstyled mb-3 small">
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2" />
                  Jerarquía de departamentos
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2" />
                  Asignación de managers
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2" />
                  Contador de empleados por departamento
                </li>
              </ul>
              <button className="btn btn-primary w-100" disabled>
                Gestionar Departamentos
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-briefcase me-2" />
                Puestos
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted">
                Define los puestos disponibles en la organización
              </p>
              <ul className="list-unstyled mb-3 small">
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2" />
                  Catálogo de puestos
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2" />
                  Asociación a departamentos
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2" />
                  Descripción de responsabilidades
                </li>
              </ul>
              <button className="btn btn-success w-100" disabled>
                Gestionar Puestos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
