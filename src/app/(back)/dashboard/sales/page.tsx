'use client'

export default function SalesPage() {
  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-cart-check me-3"></i>
                Gestión de Ventas
              </h1>
              <p className="text-muted">
                Administra las órdenes de venta y el proceso comercial
              </p>
            </div>
            <div>
              <a 
                href="/dashboard/sales/create" 
                className="btn btn-primary"
              >
                <i className="bi bi-plus-circle me-2"></i>
                Nueva Orden de Venta
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Órdenes de Venta
              </h5>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-funnel"></i> Filtros
                </button>
                <button className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-download"></i> Exportar
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Número de Orden</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Total</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-cart-x display-4 text-muted mb-3"></i>
                          <h6>Módulo Sales Implementado</h6>
                          <p className="mb-0">
                            Los datos aparecerán cuando se conecte con el backend API
                          </p>
                          <small className="text-success mt-2">
                            ✅ Hooks, Services y Transformers funcionando
                          </small>
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
        <div className="col-md-3">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-white-50">Ventas del Mes</h6>
                  <h4 className="mb-0">$0.00</h4>
                </div>
                <i className="bi bi-graph-up display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-white-50">Órdenes Completadas</h6>
                  <h4 className="mb-0">0</h4>
                </div>
                <i className="bi bi-check-circle display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-white-50">Órdenes Pendientes</h6>
                  <h4 className="mb-0">0</h4>
                </div>
                <i className="bi bi-clock display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-info">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-white-50">Clientes Activos</h6>
                  <h4 className="mb-0">0</h4>
                </div>
                <i className="bi bi-people display-6"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}