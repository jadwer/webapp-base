'use client'

import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useOffers } from '@/modules/catalog'

export default function CatalogOffersPage() {
  const navigation = useNavigationProgress()
  const { offers, metrics, isLoading, error } = useOffers()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

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
                Productos con descuentos (precio mayor al costo)
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
              <button 
                className="btn btn-success"
                onClick={() => navigation.push('/dashboard/products')}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Gestionar Productos
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-info">
              <div className="d-flex align-items-center">
                <div className="spinner-border text-info me-3" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <div>Cargando ofertas...</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Error al cargar ofertas. Por favor, inténtelo más tarde.
            </div>
          </div>
        </div>
      )}

      {/* Métricas de ofertas - DATOS REALES */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-success">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-white-50">Ofertas Activas</h6>
                  <h4 className="mb-0">{metrics.activeOffers}</h4>
                  {isLoading && <div className="spinner-border spinner-border-sm text-light mt-1"></div>}
                </div>
                <i className="bi bi-check-circle display-6"></i>
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
                  <h4 className="mb-0">{metrics.productsOnOffer}</h4>
                  {isLoading && <div className="spinner-border spinner-border-sm text-light mt-1"></div>}
                </div>
                <i className="bi bi-box display-6"></i>
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
                  <h4 className="mb-0">{formatCurrency(metrics.totalDiscount)}</h4>
                  {isLoading && <div className="spinner-border spinner-border-sm text-light mt-1"></div>}
                </div>
                <i className="bi bi-currency-dollar display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-white-50">Descuento Promedio</h6>
                  <h4 className="mb-0">{formatCurrency(metrics.averageDiscount)}</h4>
                  {isLoading && <div className="spinner-border spinner-border-sm text-light mt-1"></div>}
                </div>
                <i className="bi bi-percent display-6"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Ofertas */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-list me-2"></i>
                Productos en Oferta
              </h5>
            </div>
            <div className="card-body">
              {offers.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Precio Original</th>
                        <th>Precio de Costo</th>
                        <th>Descuento</th>
                        <th>% Descuento</th>
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offers.map((offer) => (
                        <tr key={offer.id}>
                          <td>
                            <div>
                              <strong>{offer.name}</strong>
                              {offer.sku && (
                                <div>
                                  <small className="text-muted">SKU: {offer.sku}</small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {offer.category ? (
                              <span className="badge bg-light text-dark">
                                {offer.category.name}
                              </span>
                            ) : (
                              <span className="text-muted">Sin categoría</span>
                            )}
                          </td>
                          <td>
                            <strong className="text-muted">
                              {formatCurrency(offer.price)}
                            </strong>
                          </td>
                          <td>
                            <span className="text-success">
                              {formatCurrency(offer.cost || 0)}
                            </span>
                          </td>
                          <td>
                            <strong className="text-primary">
                              {formatCurrency(offer.discount)}
                            </strong>
                          </td>
                          <td>
                            <span className="badge bg-success">
                              {offer.discountPercent.toFixed(1)}%
                            </span>
                          </td>
                          <td className="text-end">
                            <button 
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => navigation.push(`/dashboard/products/${offer.id}`)}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => navigation.push(`/dashboard/products/${offer.id}/edit`)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : !isLoading ? (
                <div className="text-center py-5">
                  <i className="bi bi-percent display-1 text-muted mb-3"></i>
                  <h5>No hay ofertas activas</h5>
                  <p className="text-muted mb-4">
                    Para crear ofertas, edita productos y configura un precio mayor al costo.
                    <br />
                    Las ofertas se detectan automáticamente cuando precio {'>'} costo.
                  </p>
                  <button 
                    className="btn btn-success"
                    onClick={() => navigation.push('/dashboard/products')}
                  >
                    <i className="bi bi-box-seam me-2"></i>
                    Gestionar Productos
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Cómo funciona:</strong> Las ofertas se detectan automáticamente cuando un producto tiene un precio mayor a su costo. 
            El descuento se calcula como la diferencia entre precio y costo. Para gestionar ofertas, 
            edita los precios de los productos en el módulo de productos.
          </div>
        </div>
      </div>
    </div>
  )
}