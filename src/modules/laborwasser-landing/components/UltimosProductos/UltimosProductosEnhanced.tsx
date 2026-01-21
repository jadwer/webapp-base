/**
 * ENHANCED ULTIMOS PRODUCTOS COMPONENT
 * Advanced version using the public-catalog module with all enterprise features
 * Showcases the full power of the new public catalog architecture
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/ui/components/base'
import { useToast } from '@/ui/hooks/useToast'
import {
  PublicProductsGrid,
  useFeaturedProducts,
  useLocalCart,
  type EnhancedPublicProduct,
  type ProductViewMode
} from '@/modules/public-catalog'
import styles from './UltimosProductos.module.scss'

// Local storage key for wishlist
const WISHLIST_KEY = 'laborwasser_wishlist'

interface UltimosProductosEnhancedProps {
  limit?: number
  showViewModeToggle?: boolean
  showSearchLink?: boolean
  enableProductModal?: boolean
  className?: string
}

export const UltimosProductosEnhanced: React.FC<UltimosProductosEnhancedProps> = ({
  limit = 6,
  showViewModeToggle = false,
  showSearchLink = true,
  enableProductModal = false,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<ProductViewMode>('grid')
  const [selectedProduct, setSelectedProduct] = useState<EnhancedPublicProduct | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [wishlistIds, setWishlistIds] = useState<number[]>([])
  const toast = useToast()

  // Use the enhanced public catalog hook
  const { products, isLoading, error, mutate } = useFeaturedProducts(limit, 'unit,category,brand')

  // Use localStorage cart
  const { addToCart } = useLocalCart()

  // Load wishlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(WISHLIST_KEY)
      if (saved) {
        try {
          setWishlistIds(JSON.parse(saved))
        } catch {
          setWishlistIds([])
        }
      }
    }
  }, [])

  // Handle product click
  const handleProductClick = useCallback((product: EnhancedPublicProduct) => {
    if (enableProductModal) {
      setSelectedProduct(product)
    } else {
      // Navigate to product page
      window.location.href = `/productos/${product.id}`
    }
  }, [enableProductModal])

  // Handle add to cart using localStorage
  const handleAddToCart = useCallback((product: EnhancedPublicProduct) => {
    addToCart(product, 1)
    toast.success(`${product.displayName} agregado al carrito`)
  }, [addToCart, toast])

  // Handle add to wishlist using localStorage
  const handleAddToWishlist = useCallback((product: EnhancedPublicProduct) => {
    const productId = parseInt(product.id)
    setWishlistIds(prev => {
      const isInWishlist = prev.includes(productId)
      const updated = isInWishlist
        ? prev.filter(id => id !== productId)
        : [...prev, productId]

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated))
      }

      // Show feedback with toast
      if (isInWishlist) {
        toast.info(`${product.displayName} eliminado de favoritos`)
      } else {
        toast.success(`${product.displayName} agregado a favoritos`)
      }

      return updated
    })
  }, [toast])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    mutate()
  }, [mutate])

  if (error) {
    return (
      <section className={`${styles.ultimosProductos} ${className}`}>
        <div className="container">
          <div className="alert alert-danger d-flex align-items-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <div className="flex-grow-1">
              <strong>Error al cargar productos:</strong> No se pudieron cargar los productos. 
            </div>
            <Button
              variant="secondary"
              buttonStyle="outline"
              size="small"
              onClick={handleRefresh}
              startIcon={<i className="bi bi-arrow-clockwise" />}
            >
              Reintentar
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`${styles.ultimosProductos} ${className}`}>
      <div className="container">
        {/* Header Section */}
        <div className="row">
          <div className="col-12">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>ÚLTIMOS PRODUCTOS</h2>
              <p className={styles.sectionSubtitle}>
                Descubre nuestras últimas incorporaciones al catálogo de productos
              </p>
              
              {/* Enhanced Stats */}
              <div className="d-flex flex-wrap gap-3 justify-content-center mb-3">
                <div className="badge bg-primary bg-opacity-10 text-primary fs-6 px-3 py-2">
                  <i className="bi bi-box-seam me-2" />
                  {products.length} productos destacados
                </div>
                <div className="badge bg-success bg-opacity-10 text-success fs-6 px-3 py-2">
                  <i className="bi bi-lightning me-2" />
                  Actualizados en tiempo real
                </div>
                <div className="badge bg-info bg-opacity-10 text-info fs-6 px-3 py-2">
                  <i className="bi bi-shield-check me-2" />
                  Calidad garantizada
                </div>
              </div>

              {/* View Mode Toggle */}
              {showViewModeToggle && products.length > 0 && (
                <div className="d-flex justify-content-center mb-4">
                  <div className="btn-group" role="group" aria-label="Modo de vista">
                    <button
                      type="button"
                      className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setViewMode('grid')}
                      title="Vista en grilla"
                    >
                      <i className="bi bi-grid-3x3-gap" />
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setViewMode('list')}
                      title="Vista en lista"
                    >
                      <i className="bi bi-list-ul" />
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setViewMode('cards')}
                      title="Vista en tarjetas"
                    >
                      <i className="bi bi-card-text" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid - Using Enterprise PublicProductsGrid */}
        <PublicProductsGrid
          products={products}
          viewMode={viewMode}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
          isLoading={isLoading}
          emptyMessage="Próximamente nuevos productos en el catálogo"
          className="mb-4"
        />

        {/* Action Buttons */}
        {products.length > 0 && (
          <div className="row">
            <div className="col-12 text-center">
              <div className="d-flex flex-column flex-md-row gap-3 justify-content-center align-items-center">
                {showSearchLink && (
                  <Link href="/productos">
                    <Button 
                      variant="primary" 
                      size="large"
                      className={styles.viewAllButton}
                      startIcon={<i className="bi bi-grid-3x3-gap" />}
                    >
                      Ver Catálogo Completo
                    </Button>
                  </Link>
                )}
                
                <Link href="/productos?sort=created_at&direction=desc">
                  <Button 
                    variant="secondary" 
                    buttonStyle="outline"
                    size="large"
                    startIcon={<i className="bi bi-clock-history" />}
                  >
                    Ver Todos los Nuevos
                  </Button>
                </Link>
                
                <Link href="/ofertas">
                  <Button
                    variant="success"
                    buttonStyle="outline"
                    size="large"
                    startIcon={<i className="bi bi-tag" />}
                  >
                    Ver Ofertas
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Product Modal (for future implementation) */}
        {enableProductModal && selectedProduct && (
          <div 
            className="modal fade show d-block" 
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSelectedProduct(null)}
          >
            <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
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
                  <Button
                    variant="secondary"
                    buttonStyle="outline"
                    onClick={() => setSelectedProduct(null)}
                  >
                    Cerrar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleAddToCart(selectedProduct)}
                    startIcon={<i className="bi bi-cart-plus" />}
                  >
                    Agregar al Carrito
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default UltimosProductosEnhanced