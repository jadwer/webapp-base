'use client'

import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export default function CatalogSettingsPage() {
  const navigation = useNavigationProgress()

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-gear me-3"></i>
                Configuración del Catálogo
              </h1>
              <p className="text-muted">
                Configura la apariencia y comportamiento del catálogo público
              </p>
            </div>
            <div className="btn-group">
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigation.back()}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver
              </button>
              <button className="btn btn-primary">
                <i className="bi bi-check-circle me-2"></i>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-sliders me-2"></i>
                Configuración General
              </h5>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="catalogTitle" className="form-label">Título del Catálogo</label>
                  <input type="text" className="form-control" id="catalogTitle" defaultValue="Catálogo de Productos" />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="catalogDescription" className="form-label">Descripción</label>
                  <textarea className="form-control" id="catalogDescription" rows={3} 
                    defaultValue="Explora nuestra amplia gama de productos de alta calidad."></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="itemsPerPage" className="form-label">Productos por Página</label>
                  <select className="form-select" id="itemsPerPage" defaultValue="12">
                    <option value="6">6 productos</option>
                    <option value="12">12 productos</option>
                    <option value="24">24 productos</option>
                    <option value="48">48 productos</option>
                  </select>
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="showPrices" defaultChecked />
                    <label className="form-check-label" htmlFor="showPrices">
                      Mostrar precios en el catálogo
                    </label>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="enableFilters" defaultChecked />
                    <label className="form-check-label" htmlFor="enableFilters">
                      Habilitar filtros de productos
                    </label>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="enableSearch" defaultChecked />
                    <label className="form-check-label" htmlFor="enableSearch">
                      Habilitar búsqueda de productos
                    </label>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-palette me-2"></i>
                Apariencia
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="themeColor" className="form-label">Color Principal</label>
                <input type="color" className="form-control form-control-color" id="themeColor" defaultValue="#0d6efd" />
              </div>

              <div className="mb-3">
                <label htmlFor="layout" className="form-label">Diseño</label>
                <select className="form-select" id="layout" defaultValue="grid">
                  <option value="grid">Rejilla</option>
                  <option value="list">Lista</option>
                  <option value="cards">Tarjetas</option>
                </select>
              </div>

              <div className="mb-3">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="darkMode" />
                  <label className="form-check-label" htmlFor="darkMode">
                    Modo oscuro
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Estado del Catálogo
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="flex-grow-1">
                  <strong>Catálogo Público</strong>
                  <br />
                  <small className="text-muted">Visible para visitantes</small>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="catalogEnabled" defaultChecked />
                </div>
              </div>
              
              <hr />
              
              <div className="text-muted small">
                <i className="bi bi-clock me-1"></i>
                Última actualización: Hoy
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}