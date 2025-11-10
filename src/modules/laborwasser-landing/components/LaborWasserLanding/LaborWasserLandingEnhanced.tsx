/**
 * ENHANCED LABOR WASSER LANDING
 * Versión mejorada que integra el módulo public-catalog
 * Con componentes avanzados y mejor rendimiento
 */

'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Header,
  Hero,
  PorQueComprar,
  NecesitasCotizacion,
  NuestrasMarcas,
  Footer,
  UltimosProductosEnhanced
} from '../'
import { PublicCatalogTemplate } from '@/modules/public-catalog'
import type { EnhancedPublicProduct } from '@/modules/public-catalog'
import styles from './LaborWasserLanding.module.scss'

export interface LaborWasserLandingEnhancedProps {
  className?: string
  showFullCatalog?: boolean
  enableProductModal?: boolean
}

// Mock data for demonstration
const mockCategories = [
  { value: '1', label: 'Reactivos Químicos', count: 45 },
  { value: '2', label: 'Equipos de Laboratorio', count: 23 },
  { value: '3', label: 'Material de Vidrio', count: 67 },
  { value: '4', label: 'Instrumentos de Medición', count: 34 },
  { value: '5', label: 'Consumibles', count: 89 }
]

const mockBrands = [
  { value: '1', label: 'LaborWasser', count: 123 },
  { value: '2', label: 'ChemTech', count: 45 },
  { value: '3', label: 'LabPro', count: 67 },
  { value: '4', label: 'Analytik', count: 23 }
]

const mockUnits = [
  { value: '1', label: 'Litros', count: 45 },
  { value: '2', label: 'Kilogramos', count: 23 },
  { value: '3', label: 'Piezas', count: 67 }
]

const priceRange = { min: 0, max: 50000, step: 100 }

export const LaborWasserLandingEnhanced: React.FC<LaborWasserLandingEnhancedProps> = ({ 
  className,
  showFullCatalog = false,
  enableProductModal = true
}) => {
  const [selectedProduct, setSelectedProduct] = useState<EnhancedPublicProduct | null>(null)

  // Enable smooth scrolling for the landing page
  useEffect(() => {
    const html = document.documentElement
    const originalScrollBehavior = html.style.scrollBehavior
    html.style.scrollBehavior = 'smooth'
    
    return () => {
      html.style.scrollBehavior = originalScrollBehavior
    }
  }, [])

  // Handle product interactions
  const handleProductClick = (product: EnhancedPublicProduct) => {
    if (enableProductModal) {
      setSelectedProduct(product)
    } else {
      window.location.href = `/productos/${product.id}`
    }
  }

  const handleAddToCart = (product: EnhancedPublicProduct) => {
    // console.log('Add to cart:', product.displayName)
    alert(`${product.displayName} agregado al carrito`)
  }

  const handleAddToWishlist = (product: EnhancedPublicProduct) => {
    // console.log('Add to wishlist:', product.displayName)
    alert(`${product.displayName} agregado a favoritos`)
  }

  return (
    <div className={`${styles.landingPage} ${className || ''}`}>
      {/* Header with navigation */}
      <Header />
      
      {/* Main content */}
      <main className={styles.mainContent}>
        {/* Hero section */}
        <Hero />
        
        {/* Enhanced Monthly offers section with Public Catalog */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row">
              <div className="col-12 text-center">
                <h2 className="display-5 fw-bold text-success mb-3">
                  <i className="bi bi-tag-fill me-3"></i>
                  OFERTAS DEL MES
                </h2>
                <p className="lead text-muted mb-4">
                  Aprovecha nuestras mejores promociones en productos de laboratorio
                </p>
                <div className="alert alert-success border-0 shadow-sm d-inline-block mb-4">
                  <i className="bi bi-clock me-2"></i>
                  <strong>¡Tiempo limitado!</strong> Válido hasta fin de mes
                </div>
              </div>
            </div>

            {/* Productos en oferta usando el public catalog */}
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-5">
              <div className="col">
                <div className="card h-100 shadow border-success position-relative">
                  <div className="position-absolute top-0 start-0 m-2">
                    <span className="badge bg-success fs-6">-25%</span>
                  </div>
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className="badge bg-warning text-dark">OFERTA</span>
                  </div>
                  <div className="ratio ratio-4x3">
                    <div className="d-flex align-items-center justify-content-center bg-light">
                      <i className="bi bi-flask text-success" style={{ fontSize: '4rem' }}></i>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="mb-2">
                      <span className="badge bg-success bg-opacity-10 text-success small">LaborWasser</span>
                      <span className="badge bg-primary bg-opacity-10 text-primary small">Reactivos</span>
                    </div>
                    <h5 className="card-title">Kit de Reactivos Básicos</h5>
                    <p className="card-text">
                      Conjunto completo de 12 reactivos esenciales para análisis químico básico.
                    </p>
                    <div className="mb-3">
                      <div className="d-flex align-items-center">
                        <span className="text-decoration-line-through text-muted me-2">$4,500.00</span>
                        <span className="fw-bold fs-4 text-success">$3,375.00</span>
                      </div>
                      <small className="text-muted">Ahorra $1,125.00</small>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-success flex-grow-1">
                        <i className="bi bi-cart-plus me-1"></i> Aprovechar Oferta
                      </button>
                      <button className="btn btn-outline-secondary">
                        <i className="bi bi-heart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="card h-100 shadow border-success position-relative">
                  <div className="position-absolute top-0 start-0 m-2">
                    <span className="badge bg-success fs-6">-15%</span>
                  </div>
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className="badge bg-warning text-dark">OFERTA</span>
                  </div>
                  <div className="ratio ratio-4x3">
                    <div className="d-flex align-items-center justify-content-center bg-light">
                      <i className="bi bi-thermometer text-info" style={{ fontSize: '4rem' }}></i>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="mb-2">
                      <span className="badge bg-info bg-opacity-10 text-info small">ChemTech</span>
                      <span className="badge bg-warning bg-opacity-10 text-warning small">Instrumentos</span>
                    </div>
                    <h5 className="card-title">Termómetro Digital Premium</h5>
                    <p className="card-text">
                      Precisión ±0.1°C, rango -50°C a 300°C, certificación incluida.
                    </p>
                    <div className="mb-3">
                      <div className="d-flex align-items-center">
                        <span className="text-decoration-line-through text-muted me-2">$2,890.00</span>
                        <span className="fw-bold fs-4 text-success">$2,456.50</span>
                      </div>
                      <small className="text-muted">Ahorra $433.50</small>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-success flex-grow-1">
                        <i className="bi bi-cart-plus me-1"></i> Aprovechar Oferta
                      </button>
                      <button className="btn btn-outline-secondary">
                        <i className="bi bi-heart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="card h-100 shadow border-success position-relative">
                  <div className="position-absolute top-0 start-0 m-2">
                    <span className="badge bg-success fs-6">-30%</span>
                  </div>
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className="badge bg-danger">ÚLTIMAS PIEZAS</span>
                  </div>
                  <div className="ratio ratio-4x3">
                    <div className="d-flex align-items-center justify-content-center bg-light">
                      <i className="bi bi-eyedropper text-warning" style={{ fontSize: '4rem' }}></i>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="mb-2">
                      <span className="badge bg-warning bg-opacity-10 text-warning small">LabPro</span>
                      <span className="badge bg-info bg-opacity-10 text-info small">Material</span>
                    </div>
                    <h5 className="card-title">Set Completo de Micropipetas</h5>
                    <p className="card-text">
                      4 micropipetas de diferentes volúmenes con puntas incluidas.
                    </p>
                    <div className="mb-3">
                      <div className="d-flex align-items-center">
                        <span className="text-decoration-line-through text-muted me-2">$8,750.00</span>
                        <span className="fw-bold fs-4 text-success">$6,125.00</span>
                      </div>
                      <small className="text-muted">Ahorra $2,625.00</small>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-success flex-grow-1">
                        <i className="bi bi-cart-plus me-1"></i> Aprovechar Oferta
                      </button>
                      <button className="btn btn-outline-secondary">
                        <i className="bi bi-heart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action para ofertas */}
            <div className="row">
              <div className="col-12 text-center">
                <div className="bg-white rounded-3 shadow-sm p-4">
                  <h5 className="mb-3">¿Quieres ver todas nuestras ofertas?</h5>
                  <p className="text-muted mb-4">
                    Descubre más productos con descuentos especiales y promociones exclusivas
                  </p>
                  <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                    <a href="/ofertas" className="btn btn-success btn-lg">
                      <i className="bi bi-tag me-2"></i>
                      Ver Todas las Ofertas
                    </a>
                    <a href="/newsletter" className="btn btn-outline-primary btn-lg">
                      <i className="bi bi-envelope me-2"></i>
                      Suscribirse a Ofertas
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Why buy with us section */}
        <PorQueComprar />
        
        {/* Enhanced Latest products section with Public Catalog */}
        <UltimosProductosEnhanced 
          limit={6}
          showViewModeToggle={true}
          showSearchLink={true}
          enableProductModal={enableProductModal}
          className="bg-light"
        />

        {/* Conditional Full Catalog Section */}
        {showFullCatalog && (
          <section className="py-5">
            <div className="container-fluid">
              <div className="row mb-4">
                <div className="col-12 text-center">
                  <h2 className="display-4 fw-bold text-primary mb-3">
                    <i className="bi bi-grid-3x3-gap me-3"></i>
                    Catálogo Completo
                  </h2>
                  <p className="lead text-muted mb-4">
                    Explora todos nuestros productos con filtros avanzados
                  </p>
                </div>
              </div>

              <PublicCatalogTemplate
                initialSortField="created_at"
                initialSortDirection="desc"
                initialViewMode="grid"
                initialPageSize={12}
                categories={mockCategories}
                brands={mockBrands}
                units={mockUnits}
                priceRange={priceRange}
                onProductClick={handleProductClick}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
                showFilters={true}
                showSearch={true}
                showCategoryFilter={true}
                showBrandFilter={true}
                showUnitFilter={false}
                showPriceFilter={true}
                showSorting={true}
                showViewMode={true}
                showPagination={true}
                showPageSizeSelector={false}
                filtersVariant="horizontal"
                paginationVariant="simple"
                className="public-catalog-landing"
                filtersClassName="mb-4 p-3 bg-white rounded shadow-sm"
                gridClassName="mb-4"
                headerContent={
                  <div className="alert alert-info border-0 shadow-sm">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-info-circle me-3 fs-4"></i>
                      <div>
                        <h6 className="mb-1">💼 Catálogo Empresarial</h6>
                        <p className="mb-0 small">
                          Todos nuestros productos con filtros profesionales y búsqueda en tiempo real.
                        </p>
                      </div>
                    </div>
                  </div>
                }
                emptyMessage="No se encontraron productos. Ajusta los filtros para ver más resultados."
              />
            </div>
          </section>
        )}
        
        {/* Quote request section */}
        <NecesitasCotizacion />
        
        {/* Our brands section */}
        <NuestrasMarcas />
      </main>
      
      {/* Footer */}
      <Footer />

      {/* Product Modal */}
      {enableProductModal && selectedProduct && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
          onClick={() => setSelectedProduct(null)}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedProduct.displayName}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedProduct(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="ratio ratio-1x1 mb-3">
                      {selectedProduct.attributes.imageUrl ? (
                        <Image
                          src={selectedProduct.attributes.imageUrl}
                          alt={selectedProduct.displayName}
                          fill
                          className="object-fit-cover rounded"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center bg-light rounded">
                          <i className="bi bi-image display-4 text-muted"></i>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6>Detalles del Producto</h6>
                    <ul className="list-unstyled">
                      <li><strong>Categoría:</strong> {selectedProduct.displayCategory}</li>
                      <li><strong>Marca:</strong> {selectedProduct.displayBrand}</li>
                      <li><strong>Unidad:</strong> {selectedProduct.displayUnit}</li>
                      {selectedProduct.attributes.sku && (
                        <li><strong>SKU:</strong> {selectedProduct.attributes.sku}</li>
                      )}
                      <li><strong>Precio:</strong> {selectedProduct.displayPrice}</li>
                    </ul>
                    {selectedProduct.attributes.description && (
                      <>
                        <h6>Descripción</h6>
                        <p className="text-muted">{selectedProduct.attributes.description}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedProduct(null)}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    handleAddToCart(selectedProduct)
                    setSelectedProduct(null)
                  }}
                >
                  <i className="bi bi-cart-plus me-1"></i>
                  Agregar al Carrito
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    window.location.href = `/productos/${selectedProduct.id}`
                  }}
                >
                  <i className="bi bi-eye me-1"></i>
                  Ver Detalles Completos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}