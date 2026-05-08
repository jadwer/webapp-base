'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useOffers } from '@/modules/catalog'

interface OfferViewPageProps {
  params: Promise<{
    id: string
  }>
}

export default function OfferViewPage({ params }: OfferViewPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const { offers, isLoading } = useOffers()

  const offer = offers?.find(o => o.id === resolvedParams.id)

  const handleEdit = () => {
    router.push(`/dashboard/catalog/offers/${resolvedParams.id}/edit`)
  }

  const handleBack = () => {
    router.push('/dashboard/catalog/offers')
  }

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2" />
          Oferta no encontrada
        </div>
        <button className="btn btn-secondary" onClick={handleBack}>
          Volver a ofertas
        </button>
      </div>
    )
  }

  const discountAmount = offer.price - (offer.cost ?? 0)
  const discountPercent = offer.price > 0 ? ((discountAmount / offer.price) * 100).toFixed(1) : '0'

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              type="button"
              onClick={handleBack}
              className="btn btn-link p-0 me-3 text-decoration-none"
              title="Volver a ofertas"
            >
              <i className="bi bi-arrow-left fs-4 text-muted" />
            </button>
            <div className="flex-grow-1">
              <h1 className="h3 mb-0 fw-bold">
                <i className="bi bi-percent text-success me-2" />
                {offer.name}
              </h1>
              <p className="text-muted mb-0">Detalles de la oferta</p>
            </div>
            <button className="btn btn-warning" onClick={handleEdit}>
              <i className="bi bi-pencil me-2" />
              Editar
            </button>
          </div>

          {/* Content */}
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <h6 className="text-muted mb-1">Producto</h6>
                      <p className="fs-5 mb-0">{offer.name}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted mb-1">SKU</h6>
                      <p className="fs-5 mb-0">{offer.sku || 'N/A'}</p>
                    </div>
                    <div className="col-md-4">
                      <h6 className="text-muted mb-1">Precio Original</h6>
                      <p className="fs-5 mb-0 text-decoration-line-through text-muted">
                        ${offer.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="col-md-4">
                      <h6 className="text-muted mb-1">Precio con Descuento</h6>
                      <p className="fs-5 mb-0 text-success fw-bold">
                        ${(offer.cost ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="col-md-4">
                      <h6 className="text-muted mb-1">Descuento</h6>
                      <p className="fs-5 mb-0">
                        <span className="badge bg-danger fs-6">
                          -{discountPercent}%
                        </span>
                        <span className="text-muted ms-2">
                          (${discountAmount.toFixed(2)})
                        </span>
                      </p>
                    </div>
                    {offer.category && (
                      <div className="col-md-6">
                        <h6 className="text-muted mb-1">Categoria</h6>
                        <p className="fs-5 mb-0">
                          <span className="badge bg-info">{typeof offer.category === 'object' ? offer.category?.name : offer.category}</span>
                        </p>
                      </div>
                    )}
                    {offer.brand && (
                      <div className="col-md-6">
                        <h6 className="text-muted mb-1">Marca</h6>
                        <p className="fs-5 mb-0">
                          <span className="badge bg-secondary">{typeof offer.brand === 'object' ? offer.brand?.name : offer.brand}</span>
                        </p>
                      </div>
                    )}
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
