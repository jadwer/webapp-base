'use client'

export default function PurchaseSuppliersPage() {
  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-building me-3"></i>
                Proveedores de Compras
              </h1>
              <p className="text-muted">
                Análisis del rendimiento y relaciones con proveedores
              </p>
            </div>
            <a 
              href="/dashboard/contacts" 
              className="btn btn-outline-primary"
            >
              <i className="bi bi-building-add me-2"></i>
              Gestionar Contactos
            </a>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bi bi-building me-2"></i>
                Top Proveedores (últimos 90 días)
              </h5>
              <div className="badge bg-primary">
                23 proveedores
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Proveedor</th>
                      <th>Total Comprado</th>
                      <th>Órdenes</th>
                      <th>Promedio por Orden</th>
                      <th>Última Compra</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                               style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
                            S
                          </div>
                          <div>
                            <div className="fw-bold">Supply Chain Ltd</div>
                            <small className="text-muted">supply@chain.com</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-bold text-primary">
                          $12,500.00
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          15
                        </span>
                      </td>
                      <td>
                        $833.33
                      </td>
                      <td>
                        <small className="text-muted">
                          2025-01-12
                        </small>
                      </td>
                      <td>
                        <span className="badge bg-success">
                          Activo
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                               style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
                            M
                          </div>
                          <div>
                            <div className="fw-bold">Materials Corp</div>
                            <small className="text-muted">materials@corp.com</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-bold text-primary">
                          $8,750.00
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          11
                        </span>
                      </td>
                      <td>
                        $795.45
                      </td>
                      <td>
                        <small className="text-muted">
                          2025-01-08
                        </small>
                      </td>
                      <td>
                        <span className="badge bg-success">
                          Activo
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} className="text-center py-3">
                        <div className="text-muted">
                          <i className="bi bi-info-circle me-2"></i>
                          Los datos mostrados son ejemplos. Los datos reales aparecerán cuando se conecte la API.
                        </div>
                        <div className="mt-2">
                          <span className="badge bg-success">✅ Módulo implementado</span>
                          <span className="badge bg-info ms-1">📊 Hooks listos</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="bi bi-trophy me-2"></i>
                Top 5 Proveedores por Volumen
              </h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary me-2">1</span>
                  <span className="fw-medium">Supply Chain Ltd</span>
                </div>
                <span className="text-success fw-bold">
                  $12,500.00
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary me-2">2</span>
                  <span className="fw-medium">Materials Corp</span>
                </div>
                <span className="text-success fw-bold">
                  $8,750.00
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary me-2">3</span>
                  <span className="fw-medium">Industrial Parts Inc</span>
                </div>
                <span className="text-success fw-bold">
                  $6,200.00
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="bi bi-speedometer2 me-2"></i>
                Métricas Rápidas
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6">
                  <div className="text-center">
                    <div className="h4 text-primary mb-1">
                      $812
                    </div>
                    <small className="text-muted">Promedio por Orden</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center">
                    <div className="h4 text-success mb-1">
                      156
                    </div>
                    <small className="text-muted">Total Órdenes</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}