/**
 * PUBLIC PRODUCTS GRID
 * Enterprise-level grid component for displaying products in various layouts
 * Supports Grid, List, Cards, Compact, and Showcase view modes
 */

'use client'

import React, { useMemo } from 'react'
import PublicProductCard from './PublicProductCard'
import type { 
  EnhancedPublicProduct, 
  ProductViewMode, 
  ProductDisplayProps 
} from '../types/publicProduct'

interface PublicProductsGridProps {
  products: EnhancedPublicProduct[]
  viewMode: ProductViewMode
  displayProps?: Partial<ProductDisplayProps>
  onProductClick?: (product: EnhancedPublicProduct) => void
  onAddToCart?: (product: EnhancedPublicProduct) => void
  onAddToWishlist?: (product: EnhancedPublicProduct) => void
  isLoading?: boolean
  emptyMessage?: string
  className?: string
  containerProps?: React.HTMLAttributes<HTMLDivElement>
}

export const PublicProductsGrid: React.FC<PublicProductsGridProps> = ({
  products,
  viewMode,
  displayProps = {},
  onProductClick,
  onAddToCart,
  onAddToWishlist,
  isLoading = false,
  emptyMessage = 'No se encontraron productos',
  className = '',
  containerProps = {}
}) => {
  // Determine display properties based on view mode
  const modeDisplayProps = useMemo((): Partial<ProductDisplayProps> => {
    const baseProps: Partial<ProductDisplayProps> = {
      ...displayProps
    }

    switch (viewMode) {
      case 'grid':
        return {
          ...baseProps,
          imageSize: 'medium',
          layout: 'vertical',
          showDescription: true,
          showPrice: true,
          showCategory: true,
          showBrand: true,
          showUnit: true,
          showSku: false
        }

      case 'list':
        return {
          ...baseProps,
          imageSize: 'small',
          layout: 'horizontal',
          showDescription: true,
          showPrice: true,
          showCategory: true,
          showBrand: true,
          showUnit: true,
          showSku: true
        }

      case 'cards':
        return {
          ...baseProps,
          imageSize: 'medium',
          layout: 'vertical',
          showDescription: true,
          showPrice: true,
          showCategory: true,
          showBrand: true,
          showUnit: true,
          showSku: false
        }

      case 'compact':
        return {
          ...baseProps,
          imageSize: 'small',
          layout: 'vertical',
          showDescription: false,
          showPrice: true,
          showCategory: false,
          showBrand: false,
          showUnit: true,
          showSku: false
        }

      case 'showcase':
        return {
          ...baseProps,
          imageSize: 'large',
          layout: 'vertical',
          showDescription: true,
          showPrice: true,
          showCategory: true,
          showBrand: true,
          showUnit: true,
          showSku: false
        }

      default:
        return baseProps
    }
  }, [viewMode, displayProps])

  // Determine grid classes based on view mode
  const getGridClasses = (): string => {
    switch (viewMode) {
      case 'grid':
        return 'row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-6 g-3'
      
      case 'list':
        return 'row row-cols-1 g-3'
      
      case 'cards':
        return 'row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4'
      
      case 'compact':
        return 'row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 row-cols-xl-8 g-2'
      
      case 'showcase':
        return 'row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4'
      
      default:
        return 'row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3'
    }
  }

  // Loading skeleton
  const renderLoadingSkeleton = () => {
    const skeletonCount = {
      grid: 12,
      list: 6,
      cards: 8,
      compact: 16,
      showcase: 6
    }[viewMode]

    return (
      <div className={getGridClasses()}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} className="col">
            <div className="card h-100">
              <div className={`placeholder-glow ${viewMode === 'list' ? 'row g-0' : ''}`}>
                {viewMode === 'list' ? (
                  <>
                    <div className="col-md-3 col-lg-2">
                      <div className="ratio ratio-1x1">
                        <div className="placeholder bg-secondary w-100 h-100 rounded-start"></div>
                      </div>
                    </div>
                    <div className="col-md-9 col-lg-10">
                      <div className="card-body">
                        <h5 className="card-title">
                          <span className="placeholder col-8"></span>
                        </h5>
                        <p className="card-text">
                          <span className="placeholder col-12"></span>
                          <span className="placeholder col-8"></span>
                        </p>
                        <div className="d-flex justify-content-between">
                          <span className="placeholder col-4"></span>
                          <span className="placeholder col-3"></span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`ratio ${viewMode === 'showcase' ? 'ratio-16x9' : 'ratio-4x3'}`}>
                      <div className="placeholder bg-secondary w-100 h-100 rounded-top"></div>
                    </div>
                    <div className="card-body">
                      <h5 className="card-title">
                        <span className="placeholder col-8"></span>
                      </h5>
                      {viewMode !== 'compact' && (
                        <p className="card-text">
                          <span className="placeholder col-12"></span>
                          <span className="placeholder col-6"></span>
                        </p>
                      )}
                      <div className="d-flex justify-content-between">
                        <span className="placeholder col-4"></span>
                        <span className="placeholder col-3"></span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  const renderEmptyState = () => (
    <div className="text-center py-5">
      <div className="mb-4">
        <i className="bi bi-inbox display-1 text-muted"></i>
      </div>
      <h5 className="text-muted mb-3">{emptyMessage}</h5>
      <p className="text-muted">
        Intenta ajustar los filtros o búsqueda para encontrar productos.
      </p>
    </div>
  )

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className={`public-products-grid ${className}`} {...containerProps}>
        {renderLoadingSkeleton()}
      </div>
    )
  }

  // Show empty state
  if (products.length === 0) {
    return (
      <div className={`public-products-grid ${className}`} {...containerProps}>
        {renderEmptyState()}
      </div>
    )
  }

  // Render products grid
  return (
    <div className={`public-products-grid ${className}`} {...containerProps}>
      <div className={getGridClasses()}>
        {products.map((product) => (
          <div key={product.id} className="col">
            <PublicProductCard
              product={product}
              displayProps={modeDisplayProps}
              layout={viewMode as 'grid' | 'list' | 'compact' | 'showcase'}
              onProductClick={onProductClick}
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist}
              showActions={viewMode !== 'list'} // List view has less space for actions
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default PublicProductsGrid