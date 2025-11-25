/**
 * PUBLIC PRODUCTS CATALOG PAGE
 * Complete showcase of the public-catalog module integration
 * Enterprise-level product catalog with all features
 */

'use client'

import React, { useState, useEffect } from 'react'
import { PublicCatalogTemplate } from '@/modules/public-catalog'
import type { EnhancedPublicProduct } from '@/modules/public-catalog'
import { useCart } from '@/modules/ecommerce'
import { useToast } from '@/ui/hooks/useToast'

// Mock data for demonstration - in real app, this would come from API
const mockCategories = [
  { value: '1', label: 'Reactivos Químicos', count: 45 },
  { value: '2', label: 'Equipos de Laboratorio', count: 23 },
  { value: '3', label: 'Material de Vidrio', count: 67 },
  { value: '4', label: 'Instrumentos de Medición', count: 34 },
  { value: '5', label: 'Consumibles', count: 89 },
  { value: '6', label: 'Kits de Análisis', count: 12 }
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
  const [sessionId, setSessionId] = useState<string>('')
  const [isClient, setIsClient] = useState(false)

  // Client-side only initialization
  useEffect(() => {
    setIsClient(true)

    let storedSessionId = localStorage.getItem('ecommerce_session_id')

    if (!storedSessionId) {
      // Generate new session ID
      storedSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`
      localStorage.setItem('ecommerce_session_id', storedSessionId)
    }

    setSessionId(storedSessionId)
  }, [])

  // Initialize cart hook only on client side
  const { addProduct, cartItems } = useCart({ sessionId: isClient ? sessionId : '' })

  // Event handlers
  const handleProductClick = (product: EnhancedPublicProduct) => {
    console.log('Product clicked:', product.displayName)
    // Navigate to product detail page
    window.location.href = `/productos/${product.id}`
  }

  const handleAddToCart = async (product: EnhancedPublicProduct) => {
    if (!sessionId) {
      toast.error('Inicializando carrito...')
      return
    }

    try {
      await addProduct(parseInt(product.id), 1)
      toast.success(`${product.displayName} agregado al carrito`)

      // Optional: Show cart item count
      console.log('Cart items:', cartItems?.length || 0)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Error al agregar el producto al carrito')
    }
  }

  const handleAddToWishlist = (product: EnhancedPublicProduct) => {
    console.log('Add to wishlist:', product.displayName)
    // TODO: Implement wishlist functionality
    toast.info(`${product.displayName} agregado a favoritos`)
  }

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