'use client'

import React, { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PublicCatalogTemplate, useLocalCart } from '@/modules/public-catalog'
import type { EnhancedPublicProduct } from '@/modules/public-catalog'
import { useToast } from '@/ui/hooks/useToast'

// Local storage key for wishlist
const WISHLIST_KEY = 'laborwasser_wishlist'

const priceRange = {
  min: 0,
  max: 50000,
  step: 100
}

export default function ProductosPage() {
  return (
    <Suspense fallback={
      <div className="container-fluid py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    }>
      <ProductosContent />
    </Suspense>
  )
}

function ProductosContent() {
  const toast = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || undefined
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

      if (typeof window !== 'undefined') {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated))
      }

      if (isInWishlist) {
        toast.info(`${product.displayName} eliminado de favoritos`)
      } else {
        toast.success(`${product.displayName} agregado a favoritos`)
      }

      return updated
    })
  }, [toast])

  const handleRequestQuote = useCallback((product: EnhancedPublicProduct) => {
    addToCart(product, 1)
    toast.info(`${product.displayName} agregado. Redirigiendo a cotización...`)
    router.push('/cart?action=quote')
  }, [addToCart, toast, router])

  return (
    <div className="container-fluid py-4">
      <h1 className="text-primary mb-4">Todos los productos</h1>

      <PublicCatalogTemplate
        initialFilters={{ search: initialSearch }}
        initialSortField="name"
        initialSortDirection="asc"
        initialViewMode="grid"
        initialPageSize={24}

        categories={[]}
        brands={[]}
        units={[]}
        priceRange={priceRange}

        onProductClick={handleProductClick}
        onAddToCart={handleAddToCart}
        onRequestQuote={handleRequestQuote}
        onAddToWishlist={handleAddToWishlist}

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

        filtersVariant="horizontal"
        paginationVariant="default"

        className="public-catalog-page"
        filtersClassName="mb-4 p-4 bg-light rounded"
        gridClassName="mb-4"
        paginationClassName="d-flex justify-content-center"

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
                href="/cart"
                className="btn btn-outline-primary btn-lg"
              >
                <i className="bi bi-calculator me-2"></i>
                Solicitar Cotización
              </a>
            </div>
          </div>
        }

        refreshInterval={300000}
        emptyMessage="No se encontraron productos que coincidan con los filtros seleccionados"
      />
    </div>
  )
}
