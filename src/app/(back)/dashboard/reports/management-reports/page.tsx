'use client'

export default function ManagementReportsPage() {
  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-2">
            <i className="bi bi-graph-up me-3" />
            Reportes Gerenciales
          </h1>
          <p className="text-muted">
            Análisis de ventas y compras por cliente, proveedor y producto
          </p>
        </div>
      </div>

      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2" />
        <strong>Próximamente:</strong> Visualización completa de reportes gerenciales con análisis de ventas y compras.
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Ventas</h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-3">
                <li className="mb-2">
                  <i className="bi bi-people me-2 text-muted" />
                  Ventas por Cliente
                </li>
                <li className="mb-2">
                  <i className="bi bi-box me-2 text-muted" />
                  Ventas por Producto
                </li>
              </ul>
              <button className="btn btn-outline-success w-100" disabled>
                <i className="bi bi-file-earmark-text me-2" />
                Generar Reportes de Ventas
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Compras</h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-3">
                <li className="mb-2">
                  <i className="bi bi-truck me-2 text-muted" />
                  Compras por Proveedor
                </li>
                <li className="mb-2">
                  <i className="bi bi-box-seam me-2 text-muted" />
                  Compras por Producto
                </li>
              </ul>
              <button className="btn btn-outline-primary w-100" disabled>
                <i className="bi bi-file-earmark-text me-2" />
                Generar Reportes de Compras
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
