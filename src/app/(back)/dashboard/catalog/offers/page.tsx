'use client'

import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export default function CatalogOffersPage() {
  const navigation = useNavigationProgress()

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-percent me-3"></i>
                Ofertas Especiales
              </h1>
              <p className="text-muted">
                Administra ofertas y promociones del catálogo público
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
              <button className="btn btn-success">
                <i className="bi bi-plus-circle me-2"></i>
                Nueva Oferta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de ofertas */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-success">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-white-50">Ofertas Activas</h6>
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
                  <h6 className="text-white-50">Por Vencer</h6>
                  <h4 className="mb-0">0</h4>
                </div>
                <i className="bi bi-clock display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-white-50">Total Descuentos</h6>
                  <h4 className="mb-0">$0.00</h4>
                </div>
                <i className="bi bi-currency-dollar display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-info">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-white-50">Productos en Oferta</h6>
                  <h4 className="mb-0">0</h4>
                </div>
                <i className="bi bi-box display-6"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-percent me-2"></i>
                Gestión de Ofertas
              </h5>
            </div>
            <div className="card-body">
              <div className="text-center py-5">
                <i className="bi bi-tag display-1 text-warning mb-3"></i>
                <h5>Sistema de Ofertas</h5>
                <p className="text-muted mb-4">
                  Crea y gestiona ofertas especiales para el catálogo público.
                  <br />
                  Configura descuentos, fechas de vigencia y productos incluidos.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button className="btn btn-success">
                    <i className="bi bi-plus-circle me-2"></i>
                    Crear Oferta
                  </button>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => navigation.push('/dashboard/products')}
                  >
                    <i className="bi bi-box-seam me-2"></i>
                    Ver Productos
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