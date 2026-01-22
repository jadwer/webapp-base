/**
 * ENHANCED LABOR WASSER LANDING
 * Versión mejorada que integra el módulo public-catalog
 * Con componentes avanzados y mejor rendimiento
 */

'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Header,
  Hero,
  PorQueComprar,
  NecesitasCotizacion,
  NuestrasMarcas,
  Footer,
  UltimosProductosEnhanced
} from '../'
import { PublicCatalogTemplate, useSaleProducts, useLocalCart } from '@/modules/public-catalog'
import type { EnhancedPublicProduct } from '@/modules/public-catalog'
import { useToast } from '@/ui/hooks/useToast'
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

  // Hooks for sale products and cart
  const { products: saleProducts, isLoading: saleLoading } = useSaleProducts(6)
  const { addToCart } = useLocalCart()
  const toast = useToast()

  // Helper to format prices
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price)
  }

  // Calculate discount percentage
  const getDiscountPercentage = (price: number, compareAtPrice: number | null): number | null => {
    if (!compareAtPrice || compareAtPrice <= price) return null
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
  }

  // Handle add to cart for sale products
  const handleSaleAddToCart = (product: EnhancedPublicProduct) => {
    addToCart(product, 1)
    toast.success(`${product.displayName} agregado al carrito`)
  }

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
    <div className={`laborwasser-landing ${styles.landingPage} ${className || ''}`}>
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

            {/* Productos en oferta desde la API */}
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-5">
              {saleLoading ? (
                // Loading skeleton
                [1, 2, 3].map((i) => (
                  <div key={i} className="col">
                    <div className="card h-100 shadow border-success">
                      <div className="ratio ratio-4x3 placeholder-glow">
                        <div className="placeholder bg-secondary w-100 h-100"></div>
                      </div>
                      <div className="card-body">
                        <div className="placeholder-glow">
                          <span className="placeholder col-6 mb-2"></span>
                          <span className="placeholder col-8 mb-2"></span>
                          <span className="placeholder col-4"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : saleProducts.length === 0 ? (
                // No products on sale
                <div className="col-12 text-center py-5">
                  <i className="bi bi-tag text-muted display-1 mb-3 d-block"></i>
                  <h5 className="text-muted">No hay ofertas disponibles en este momento</h5>
                  <p className="text-muted">Vuelve pronto para ver nuestras promociones</p>
                </div>
              ) : (
                // Products from API
                saleProducts.slice(0, 3).map((product) => {
                  const discount = getDiscountPercentage(
                    product.attributes.price || 0,
                    product.attributes.compareAtPrice
                  )
                  const savings = product.attributes.compareAtPrice
                    ? product.attributes.compareAtPrice - (product.attributes.price || 0)
                    : null

                  return (
                    <div key={product.id} className="col">
                      <div className="card h-100 shadow border-success position-relative">
                        {/* Discount badge */}
                        {discount && (
                          <div className="position-absolute top-0 start-0 m-2">
                            <span className="badge bg-success fs-6">-{discount}%</span>
                          </div>
                        )}
                        {/* Sale badge */}
                        <div className="position-absolute top-0 end-0 m-2">
                          <span className={`badge ${product.attributes.saleBadge === 'ÚLTIMAS PIEZAS' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                            {product.attributes.saleBadge || 'OFERTA'}
                          </span>
                        </div>
                        {/* Product image */}
                        <Link href={`/productos/${product.id}`}>
                          <div className="ratio ratio-4x3">
                            {product.attributes.imageUrl ? (
                              <Image
                                src={product.attributes.imageUrl}
                                alt={product.displayName}
                                fill
                                className="object-fit-contain p-3"
                                sizes="(max-width: 768px) 100vw, 33vw"
                              />
                            ) : (
                              <div className="d-flex align-items-center justify-content-center bg-light">
                                <i className="bi bi-box text-muted" style={{ fontSize: '4rem' }}></i>
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="card-body">
                          {/* Brand and Category badges */}
                          <div className="mb-2">
                            {product.displayBrand && (
                              <span className="badge bg-success bg-opacity-10 text-success small me-1">
                                {product.displayBrand}
                              </span>
                            )}
                            {product.displayCategory && (
                              <span className="badge bg-primary bg-opacity-10 text-primary small">
                                {product.displayCategory}
                              </span>
                            )}
                          </div>
                          {/* Product name */}
                          <h5 className="card-title">
                            <Link href={`/productos/${product.id}`} className="text-decoration-none text-dark">
                              {product.displayName}
                            </Link>
                          </h5>
                          {/* Description */}
                          <p className="card-text text-muted small">
                            {product.attributes.description?.slice(0, 80) || 'Producto de alta calidad'}
                            {(product.attributes.description?.length || 0) > 80 ? '...' : ''}
                          </p>
                          {/* Prices */}
                          <div className="mb-3">
                            <div className="d-flex align-items-center">
                              {product.attributes.compareAtPrice && (
                                <span className="text-decoration-line-through text-muted me-2">
                                  {formatPrice(product.attributes.compareAtPrice)}
                                </span>
                              )}
                              <span className="fw-bold fs-4 text-success">
                                {formatPrice(product.attributes.price || 0)}
                              </span>
                            </div>
                            {savings && savings > 0 && (
                              <small className="text-muted">Ahorra {formatPrice(savings)}</small>
                            )}
                          </div>
                          {/* Actions */}
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-success flex-grow-1"
                              onClick={() => handleSaleAddToCart(product)}
                            >
                              <i className="bi bi-cart-plus me-1"></i> Aprovechar Oferta
                            </button>
                            <Link href={`/productos/${product.id}`} className="btn btn-outline-secondary">
                              <i className="bi bi-eye"></i>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
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
                initialSortField="createdAt"
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