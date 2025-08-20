'use client'

export default function FiscalPeriodsPage() {
  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-2">
            <i className="bi bi-calendar-range me-3"></i>
            Períodos Fiscales
          </h1>
          <p className="text-muted">
            Gestión de períodos contables y ejercicios fiscales - Phase 1
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                Configuración de Períodos Fiscales
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div class="card bg-light">
                    <div class="card-body text-center">
                      <i class="bi bi-calendar-check display-4 text-primary mb-3"></i>
                      <h5>Período Actual</h5>
                      <h3 class="text-primary">2025</h3>
                      <p class="text-muted">Ejercicio Fiscal en Curso</p>
                      <div class="d-flex justify-content-between text-sm">
                        <span><strong>Inicio:</strong> 01/01/2025</span>
                        <span><strong>Fin:</strong> 31/12/2025</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title">
                        <i class="bi bi-gear me-2"></i>
                        Configuración
                      </h6>
                      <div class="mb-3">
                        <label class="form-label">Tipo de Ejercicio</label>
                        <select class="form-select" disabled>
                          <option>Anual (Enero - Diciembre)</option>
                        </select>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Moneda Base</label>
                        <select class="form-select" disabled>
                          <option>MXN - Peso Mexicano</option>
                        </select>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Método Contable</label>
                        <select class="form-select" disabled>
                          <option>Acumulativo (Devengado)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mt-4">
                <div className="col-12">
                  <h6>Períodos Disponibles</h6>
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Año</th>
                          <th>Fecha Inicio</th>
                          <th>Fecha Fin</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>2025</strong></td>
                          <td>01/01/2025</td>
                          <td>31/12/2025</td>
                          <td><span className="badge bg-success">Activo</span></td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary" disabled>
                              Configurar
                            </button>
                          </td>
                        </tr>
                        <tr className="table-secondary">
                          <td>2024</td>
                          <td>01/01/2024</td>
                          <td>31/12/2024</td>
                          <td><span className="badge bg-secondary">Cerrado</span></td>
                          <td>
                            <button className="btn btn-sm btn-outline-secondary" disabled>
                              Ver
                            </button>
                          </td>
                        </tr>
                        <tr className="table-light text-muted">
                          <td>2026</td>
                          <td>01/01/2026</td>
                          <td>31/12/2026</td>
                          <td><span className="badge bg-light text-dark">Futuro</span></td>
                          <td>
                            <button className="btn btn-sm btn-outline-secondary" disabled>
                              Planificar
                            </button>
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
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Phase 1 - Configuración Básica:</strong> 
            La gestión avanzada de períodos fiscales, cierre de ejercicios y configuraciones 
            específicas estarán disponibles en fases posteriores. Actualmente opera con 
            configuración estándar mexicana.
          </div>
        </div>
      </div>
    </div>
  )
}