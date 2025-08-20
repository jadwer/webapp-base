'use client'

export default function SalesCustomersPage() {
  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-person-heart me-3"></i>
                Clientes de Ventas
              </h1>
              <p className="text-muted">
                Análisis del comportamiento y desempeño de clientes
              </p>
            </div>
            <a 
              href="/dashboard/contacts" 
              className="btn btn-outline-primary"
            >
              <i className="bi bi-person-plus me-2"></i>
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
                <i className="bi bi-person-heart me-2"></i>
                Top Clientes (últimos 90 días)
              </h5>
              <div className="badge bg-primary">
                45 clientes
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Total Compras</th>
                      <th>Órdenes</th>
                      <th>Promedio por Orden</th>
                      <th>Última Compra</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                               style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
                            A
                          </div>
                          <div>
                            <div className="fw-bold">Acme Corporation</div>
                            <small className="text-muted">acme@example.com</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-bold text-success">
                          $8,450.00
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          12
                        </span>
                      </td>
                      <td>
                        $704.17
                      </td>
                      <td>
                        <small className="text-muted">
                          2025-01-15
                        </small>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                               style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
                            T
                          </div>
                          <div>
                            <div className="fw-bold">TechSolutions Ltd</div>
                            <small className="text-muted">tech@solutions.com</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-bold text-success">
                          $6,230.00
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          8
                        </span>
                      </td>
                      <td>
                        $778.75
                      </td>
                      <td>
                        <small className="text-muted">
                          2025-01-10
                        </small>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="text-center py-3">
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
    </div>
  )
}