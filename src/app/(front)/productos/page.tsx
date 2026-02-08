/**
 * PUBLIC PRODUCTS CATALOG PAGE
 * Complete showcase of the public-catalog module integration
 * Enterprise-level product catalog with all features
 * Uses localStorage cart for guest users (no backend required)
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { PublicCatalogTemplate, useLocalCart } from '@/modules/public-catalog'
import type { EnhancedPublicProduct } from '@/modules/public-catalog'
import { useToast } from '@/ui/hooks/useToast'

// Local storage key for wishlist
const WISHLIST_KEY = 'laborwasser_wishlist'

// Mock data for demonstration - in real app, this would come from API
const mockCategories = [
  { value: '1', label: 'Reactivos Quimicos', count: 45 },
  { value: '2', label: 'Equipos de Laboratorio', count: 23 },
  { value: '3', label: 'Material de Vidrio', count: 67 },
  { value: '4', label: 'Instrumentos de Medicion', count: 34 },
  { value: '5', label: 'Consumibles', count: 89 },
  { value: '6', label: 'Kits de Analisis', count: 12 }
]

const mockBrands = [
  { value: '1', label: 'LaborWasser', count: 123 },
  { value: '2', label: 'ChemTech', count: 45 },
  { value: '3', label: 'LabPro', count: 67 },
  { value: '4', label: 'Analytik', count: 23 },
  { value: '5', label: 'BioScience', count: 34 }
]

const mockUnits = [
  { value: '1', label: 'Litros', count: 45 },
  { value: '2', label: 'Kilogramos', count: 23 },
  { value: '3', label: 'Piezas', count: 67 },
  { value: '4', label: 'Metros', count: 12 }
]

const priceRange = {
  min: 0,
  max: 50000,
  step: 100
}

export default function ProductosPage() {
  const toast = useToast()
  // wishlistIds stored for future visual indicators (e.g., heart icon filled/empty)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [wishlistIds, setWishlistIds] = useState<number[]>([])

  // Use localStorage cart (no backend required)
  const { addToCart } = useLocalCart()

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem(WISHLIST_KEY)
    if (savedWishlist) {
      try {
        setWishlistIds(JSON.parse(savedWishlist))
      } catch {
        setWishlistIds([])
      }
    }
  }, [])

  // Event handlers
  const handleProductClick = (product: EnhancedPublicProduct) => {
    // Navigate to product detail page
    window.location.href = `/productos/${product.id}`
  }

  const handleAddToCart = useCallback((product: EnhancedPublicProduct) => {
    addToCart(product, 1)
    toast.success(`${product.displayName} agregado al carrito`)
  }, [addToCart, toast])

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

      // Show feedback
      if (isInWishlist) {
        toast.info(`${product.displayName} eliminado de favoritos`)
      } else {
        toast.success(`${product.displayName} agregado a favoritos`)
      }

      return updated
    })
  }, [toast])

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="text-center">
            <h1 className="display-4 fw-bold text-primary mb-3">
              <i className="bi bi-grid-3x3-gap me-3"></i>
              Catálogo de Productos
            </h1>
            <p className="lead text-muted mb-4">
              Explora nuestro catálogo completo de productos para laboratorio con filtros avanzados y múltiples vistas
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <div className="badge bg-primary bg-opacity-10 text-primary fs-6 px-3 py-2">
                <i className="bi bi-lightning me-2"></i>
                Búsqueda en tiempo real
              </div>
              <div className="badge bg-success bg-opacity-10 text-success fs-6 px-3 py-2">
                <i className="bi bi-funnel me-2"></i>
                Filtros avanzados
              </div>
              <div className="badge bg-info bg-opacity-10 text-info fs-6 px-3 py-2">
                <i className="bi bi-eye me-2"></i>
                5 modos de vista
              </div>
              <div className="badge bg-warning bg-opacity-10 text-warning fs-6 px-3 py-2">
                <i className="bi bi-sort-down me-2"></i>
                Ordenamiento inteligente
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Public Catalog Template - Complete Integration */}
      <PublicCatalogTemplate
        // Initial configuration
        initialSortField="name"
        initialSortDirection="asc"
        initialViewMode="grid"
        initialPageSize={24}
        
        // Filter options
        categories={mockCategories}
        brands={mockBrands}
        units={mockUnits}
        priceRange={priceRange}
        
        // Event handlers
        onProductClick={handleProductClick}
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleAddToWishlist}
        
        // Feature configuration
        showFilters={true}
        showSearch={true}
        showCategoryFilter={true}
        showBrandFilter={true}
        showUnitFilter={true}
        showPriceFilter={true}
        showSorting={true}
        showViewMode={true}
        showPagination={true}
        showPageSizeSelector={true}
        
        // Layout configuration
        filtersVariant="horizontal"
        paginationVariant="default"
        
        // Custom styling
        className="public-catalog-page"
        filtersClassName="mb-4 p-4 bg-light rounded"
        gridClassName="mb-4"
        paginationClassName="d-flex justify-content-center"
        
        // Custom content
        headerContent={
          <div className="alert alert-info border-0 shadow-sm">
            <div className="d-flex align-items-center">
              <i className="bi bi-info-circle me-3 fs-4"></i>
              <div>
                <h6 className="mb-1">🚀 Catálogo Empresarial Avanzado</h6>
                <p className="mb-0 small">
                  Este catálogo utiliza arquitectura empresarial con SWR caching, filtros avanzados, 
                  paginación inteligente y 5 modos de visualización optimizados.
                </p>
              </div>
            </div>
          </div>
        }
        
        footerContent={
          <div className="text-center py-4 border-top">
            <h5 className="mb-3">¿No encuentras lo que buscas?</h5>
            <p className="text-muted mb-3">
              Contáctanos para solicitar productos especiales o cotizaciones personalizadas
            </p>
            <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
              <a 
                href="/contacto" 
                className="btn btn-primary btn-lg"
              >
                <i className="bi bi-envelope me-2"></i>
                Contactar Ventas
              </a>
              <a 
                href="/cotizacion" 
                className="btn btn-outline-primary btn-lg"
              >
                <i className="bi bi-calculator me-2"></i>
                Solicitar Cotización
              </a>
              <a 
                href="/catalogo.pdf" 
                className="btn btn-outline-secondary btn-lg"
                target="_blank"
              >
                <i className="bi bi-file-pdf me-2"></i>
                Descargar Catálogo PDF
              </a>
            </div>
          </div>
        }
        
        // Performance optimization
        refreshInterval={300000} // 5 minutes
        
        // Custom messages
        emptyMessage="No se encontraron productos que coincidan con los filtros seleccionados"
      />

      {/* Additional Features Section */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-gear me-2"></i>
                Características del Catálogo Empresarial
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-6 col-lg-3">
                  <div className="text-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{ width: '60px', height: '60px' }}>
                      <i className="bi bi-search text-primary fs-4"></i>
                    </div>
                    <h6>Búsqueda Inteligente</h6>
                    <p className="text-muted small">
                      Búsqueda en tiempo real con debounce y filtros combinados
                    </p>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="text-center">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{ width: '60px', height: '60px' }}>
                      <i className="bi bi-lightning text-success fs-4"></i>
                    </div>
                    <h6>Alto Rendimiento</h6>
                    <p className="text-muted small">
                      SWR caching, React.memo y optimizaciones avanzadas
                    </p>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="text-center">
                    <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{ width: '60px', height: '60px' }}>
                      <i className="bi bi-eye text-info fs-4"></i>
                    </div>
                    <h6>5 Modos de Vista</h6>
                    <p className="text-muted small">
                      Grid, Lista, Tarjetas, Compacto y Vitrina
                    </p>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="text-center">
                    <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{ width: '60px', height: '60px' }}>
                      <i className="bi bi-shield-check text-warning fs-4"></i>
                    </div>
                    <h6>JSON:API 5.x</h6>
                    <p className="text-muted small">
                      Estándar empresarial con relaciones y filtros avanzados
                    </p>
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