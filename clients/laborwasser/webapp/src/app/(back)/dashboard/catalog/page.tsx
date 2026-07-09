'use client'

import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export default function CatalogManagementPage() {
  const navigation = useNavigationProgress()

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-collection me-3"></i>
                Gestión de Catálogo
              </h1>
              <p className="text-muted">
                Administra productos del catálogo público y configuraciones
              </p>
            </div>
            <div className="btn-group">
              <button 
                className="btn btn-primary"
                onClick={() => navigation.push('/dashboard/products')}
              >
                <i className="bi bi-box-seam me-2"></i>
                Gestionar Productos
              </button>
              <button 
                className="btn btn-outline-primary"
                onClick={() => navigation.push('/dashboard/catalog/settings')}
              >
                <i className="bi bi-gear me-2"></i>
                Configuración
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas del catálogo */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-white-50">Productos Activos</h6>
                  <h4 className="mb-0">--</h4>
                </div>
                <i className="bi bi-box display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-white-50">Productos Destacados</h6>
                  <h4 className="mb-0">--</h4>
                </div>
                <i className="bi bi-star display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-white-50">En Oferta</h6>
                  <h4 className="mb-0">--</h4>
                </div>
                <i className="bi bi-percent display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-info">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-white-50">Categorías</h6>
                  <h4 className="mb-0">--</h4>
                </div>
                <i className="bi bi-tags display-6"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-lightning me-2"></i>
                Acciones Rápidas del Catálogo
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="d-grid">
                    <button 
                      className="btn btn-outline-primary btn-lg"
                      onClick={() => navigation.push('/dashboard/catalog/featured')}
                    >
                      <i className="bi bi-star-fill me-2"></i>
                      Productos Destacados
                    </button>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-grid">
                    <button 
                      className="btn btn-outline-success btn-lg"
                      onClick={() => navigation.push('/dashboard/catalog/offers')}
                    >
                      <i className="bi bi-percent me-2"></i>
                      Ofertas Especiales
                    </button>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-grid">
                    <button 
                      className="btn btn-outline-info btn-lg"
                      onClick={() => navigation.push('/dashboard/catalog/settings')}
                    >
                      <i className="bi bi-gear-fill me-2"></i>
                      Configuración
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Catálogo Público:</strong> Este módulo gestiona los productos visibles en el catálogo público de la empresa. 
            Los productos se sincronizan automáticamente desde el módulo de productos principal.
          </div>
        </div>
      </div>
    </div>
  )
}