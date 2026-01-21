'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useFeaturedProducts, useLocalCart, type EnhancedPublicProduct } from '@/modules/public-catalog'
import { useToast } from '@/ui/hooks/useToast'
import { Button } from '@/ui/components/base'

export const OfertasPageClient: React.FC = () => {
  const [limit, setLimit] = useState(12)
  const { products, isLoading, error, mutate } = useFeaturedProducts(limit, 'unit,category,brand')
  const { addToCart } = useLocalCart()
  const toast = useToast()

  const handleAddToCart = (product: EnhancedPublicProduct) => {
    addToCart(product, 1)
    toast.success(`${product.displayName} agregado al carrito`)
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price)
  }

  const loadMore = () => {
    setLimit(prev => prev + 12)
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-5">
        <div className="col-12 text-center">
          <h1 className="display-4 fw-bold text-primary">
            <i className="bi bi-tag-fill me-3"></i>
            Ofertas y Promociones
          </h1>
          <p className="lead text-muted">
            Descubre nuestras mejores ofertas en reactivos y material de laboratorio
          </p>
          <hr className="w-25 mx-auto" />
        </div>
      </div>

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/">Inicio</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Ofertas
          </li>
        </ol>
      </nav>

      {/* Info Banner */}
      <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
        <i className="bi bi-info-circle-fill me-2 fs-4"></i>
        <div>
          <strong>Ofertas exclusivas:</strong> Estos productos tienen precios especiales por tiempo limitado.
          Los precios pueden cambiar sin previo aviso.
        </div>
      </div>

      {/* Loading State */}
      {isLoading && products.length === 0 && (
        <div className="row">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="col-12 col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="placeholder-glow">
                    <div className="placeholder bg-secondary w-100" style={{ height: '200px' }}></div>
                    <h5 className="placeholder col-8 mt-3"></h5>
                    <p className="placeholder col-6"></p>
                    <p className="placeholder col-4"></p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div className="flex-grow-1">
            <strong>Error al cargar ofertas.</strong> Por favor intenta de nuevo.
          </div>
          <Button variant="secondary" size="small" onClick={() => mutate()}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Reintentar
          </Button>
        </div>
      )}

      {/* Products Grid */}
      {!error && products.length > 0 && (
        <>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {products.map((product) => (
              <div key={product.id} className="col">
                <div className="card h-100 shadow-sm hover-shadow">
                  {/* Product Image */}
                  <Link href={`/productos/${product.id}`}>
                    <div className="position-relative" style={{ height: '200px' }}>
                      {product.attributes.imageUrl ? (
                        <Image
                          src={product.attributes.imageUrl}
                          alt={product.displayName}
                          fill
                          className="card-img-top object-fit-contain p-2"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                          <i className="bi bi-image display-4 text-muted"></i>
                        </div>
                      )}
                      {/* Offer Badge */}
                      <span className="position-absolute top-0 start-0 badge bg-danger m-2">
                        <i className="bi bi-tag-fill me-1"></i>
                        Oferta
                      </span>
                    </div>
                  </Link>

                  <div className="card-body d-flex flex-column">
                    {/* Category & Brand */}
                    <div className="d-flex gap-2 mb-2">
                      {product.displayCategory && (
                        <span className="badge bg-secondary bg-opacity-10 text-secondary">
                          {product.displayCategory}
                        </span>
                      )}
                      {product.displayBrand && (
                        <span className="badge bg-primary bg-opacity-10 text-primary">
                          {product.displayBrand}
                        </span>
                      )}
                    </div>

                    {/* Product Name */}
                    <h5 className="card-title">
                      <Link href={`/productos/${product.id}`} className="text-decoration-none text-dark">
                        {product.displayName}
                      </Link>
                    </h5>

                    {/* SKU */}
                    {product.attributes.sku && (
                      <p className="text-muted small mb-2">
                        SKU: {product.attributes.sku}
                      </p>
                    )}

                    {/* Price */}
                    <div className="mt-auto">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <span className="fs-4 fw-bold text-primary">
                          {formatPrice(product.attributes.price || 0)}
                        </span>
                        {product.displayUnit && (
                          <small className="text-muted">/ {product.displayUnit}</small>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="d-grid gap-2">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleAddToCart(product)}
                        >
                          <i className="bi bi-cart-plus me-2"></i>
                          Agregar al carrito
                        </button>
                        <Link
                          href={`/productos/${product.id}`}
                          className="btn btn-outline-secondary"
                        >
                          Ver detalles
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {products.length >= limit && (
            <div className="text-center mt-5">
              <Button
                variant="primary"
                buttonStyle="outline"
                size="large"
                onClick={loadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Cargando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-down-circle me-2"></i>
                    Ver mas ofertas
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && !error && products.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-tag display-1 text-muted mb-4 d-block"></i>
          <h3>No hay ofertas disponibles</h3>
          <p className="text-muted mb-4">
            Actualmente no tenemos ofertas activas. Visita nuestro catalogo completo.
          </p>
          <Link href="/productos">
            <Button variant="primary" size="large">
              <i className="bi bi-grid me-2"></i>
              Ver Catalogo
            </Button>
          </Link>
        </div>
      )}

      {/* CTA Section */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card bg-primary text-white">
            <div className="card-body text-center py-5">
              <h3 className="mb-3">
                <i className="bi bi-envelope-paper me-2"></i>
                No te pierdas nuestras ofertas
              </h3>
              <p className="mb-4">
                Contactanos para recibir informacion sobre nuevas ofertas y promociones exclusivas.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <a
                  href="https://wa.link/4e5cqt"
                  className="btn btn-light btn-lg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-whatsapp me-2"></i>
                  WhatsApp
                </a>
                <a
                  href="mailto:ventas@laborwasserdemexico.com"
                  className="btn btn-outline-light btn-lg"
                >
                  <i className="bi bi-envelope me-2"></i>
                  Email
                </a>
                <Link href="/productos" className="btn btn-outline-light btn-lg">
                  <i className="bi bi-grid me-2"></i>
                  Ver Catalogo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
