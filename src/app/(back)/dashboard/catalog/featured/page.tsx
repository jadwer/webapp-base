'use client'

import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export default function CatalogFeaturedPage() {
  const navigation = useNavigationProgress()

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-star-fill me-3"></i>
                Productos Destacados
              </h1>
              <p className="text-muted">
                Gestiona los productos destacados que aparecen en el catálogo público
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
                <i className="bi bi-plus-circle me-2"></i>
                Destacar Producto
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-list-stars me-2"></i>
                Lista de Productos Destacados
              </h5>
            </div>
            <div className="card-body">
              <div className="text-center py-5">
                <i className="bi bi-star display-1 text-muted mb-3"></i>
                <h5>Productos Destacados</h5>
                <p className="text-muted mb-4">
                  Configura qué productos aparecerán como destacados en el catálogo público.
                  <br />
                  Esta funcionalidad se integra con el módulo de productos existente.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigation.push('/dashboard/products')}
                  >
                    <i className="bi bi-box-seam me-2"></i>
                    Ver Productos
                  </button>
                  <button className="btn btn-outline-secondary">
                    <i className="bi bi-gear me-2"></i>
                    Configurar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}