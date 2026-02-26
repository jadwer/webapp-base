/**
 * PUBLIC PRODUCT CARD
 * Reusable product card component for public catalog
 * Supports multiple layouts and display options
 */

'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/ui/components/base'
import type { EnhancedPublicProduct, ProductDisplayProps } from '../types/publicProduct'

interface PublicProductCardProps {
  product: EnhancedPublicProduct
  displayProps?: Partial<ProductDisplayProps>
  layout?: 'grid' | 'list' | 'compact' | 'showcase'
  onProductClick?: (product: EnhancedPublicProduct) => void
  onAddToCart?: (product: EnhancedPublicProduct) => void
  onRequestQuote?: (product: EnhancedPublicProduct) => void
  onAddToWishlist?: (product: EnhancedPublicProduct) => void
  showActions?: boolean
  className?: string
}

export const PublicProductCard: React.FC<PublicProductCardProps> = ({
  product,
  displayProps = {},
  layout = 'grid',
  onProductClick,
  onAddToCart,
  onRequestQuote,
  onAddToWishlist,
  showActions = true,
  className = ''
}) => {
  const {
    showPrice = true,
    showDescription = true,
    showUnit = true,
    showCategory = true,
    showBrand = true,
    showSku = false,
    imageSize = 'medium',
    layout: propLayout = 'vertical'
  } = displayProps

  const cardLayout = propLayout === 'horizontal' || layout === 'list' ? 'horizontal' : 'vertical'

  // Image size classes
  const imageSizeClasses = {
    small: 'ratio ratio-1x1',
    medium: 'ratio ratio-4x3',
    large: 'ratio ratio-16x9'
  }

  // Layout-specific classes
  const layoutClasses = {
    grid: 'h-100',
    list: 'mb-3',
    compact: 'mb-2',
    showcase: 'h-100 shadow-lg'
  }

  // Handle product click
  const handleProductClick = () => {
    if (onProductClick) {
      onProductClick(product)
    }
  }

  // Handle add to cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAddToCart) {
      onAddToCart(product)
    }
  }

  // Handle request quote
  const handleRequestQuote = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRequestQuote) {
      onRequestQuote(product)
    }
  }

  // Handle add to wishlist
  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAddToWishlist) {
      onAddToWishlist(product)
    }
  }

  // Render product image
  const renderImage = () => (
    <div className={imageSizeClasses[imageSize]}>
      {product.attributes.imageUrl ? (
        <Image
          src={product.attributes.imageUrl}
          alt={product.attributes.name}
          fill
          className="card-img-top object-fit-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="card-img-top d-flex align-items-center justify-content-center bg-light">
          <i className="bi bi-image text-muted" style={{ fontSize: '2rem' }} />
        </div>
      )}
    </div>
  )

  // Render product info
  const renderInfo = () => (
    <div className="card-body">
      {/* Product Name */}
      <h5 className={`card-title ${layout === 'compact' ? 'fs-6' : ''}`}>
        {product.attributes.name}
      </h5>

      {/* SKU */}
      {showSku && product.attributes.sku && (
        <div className="text-muted small mb-1">
          SKU: {product.attributes.sku}
        </div>
      )}

      {/* Category & Brand */}
      {(showCategory || showBrand) && (
        <div className="d-flex flex-wrap gap-1 mb-2" style={{ overflow: 'hidden' }}>
          {showCategory && product.category && (
            <span className="badge bg-secondary bg-opacity-10 text-secondary text-truncate" style={{ maxWidth: '100%' }}>
              <i className="bi bi-tag me-1" />
              {product.displayCategory}
            </span>
          )}
          {showBrand && product.brand && (
            <span className="badge bg-primary bg-opacity-10 text-primary text-truncate" style={{ maxWidth: '100%' }}>
              <i className="bi bi-award me-1" />
              {product.displayBrand}
            </span>
          )}
        </div>
      )}

      {/* Description */}
      {showDescription && product.attributes.description && layout !== 'compact' && (
        <p className="card-text text-muted small">
          {product.attributes.description.length > 100
            ? `${product.attributes.description.substring(0, 100)}...`
            : product.attributes.description
          }
        </p>
      )}

      {/* Price & Unit */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        {showPrice && (
          <div>
            {product.attributes.price !== null ? (
              <span className={`fw-bold ${layout === 'showcase' ? 'fs-4 text-primary' : 'fs-5'}`}>
                {product.displayPrice}
              </span>
            ) : (
              <span className="text-muted">Precio no disponible</span>
            )}
            {showUnit && product.unit && (
              <small className="text-muted ms-1">
                / {product.displayUnit}
              </small>
            )}
          </div>
        )}

        {/* Wishlist button for compact layout */}
        {layout === 'compact' && showActions && onAddToWishlist && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={handleAddToWishlist}
            title="Agregar a favoritos"
          >
            <i className="bi bi-heart" />
          </button>
        )}
      </div>

      {/* Actions */}
      {showActions && layout !== 'compact' && (
        <div className="d-flex flex-column gap-2">
          <div className="d-flex gap-2">
            {onAddToCart && product.attributes.price !== null && (
              <Button
                variant="primary"
                size={layout === 'showcase' ? 'medium' : 'small'}
                onClick={handleAddToCart}
                className="flex-grow-1"
                startIcon={<i className="bi bi-cart-plus" />}
              >
                {layout === 'showcase' ? 'Agregar al carrito' : 'Agregar'}
              </Button>
            )}

            {onAddToWishlist && (
              <Button
                variant="secondary"
                buttonStyle="outline"
                size={layout === 'showcase' ? 'medium' : 'small'}
                onClick={handleAddToWishlist}
                title="Agregar a favoritos"
              >
                <i className="bi bi-heart" />
              </Button>
            )}
          </div>
          {onRequestQuote && (
            <Button
              variant="success"
              buttonStyle="outline"
              size="small"
              onClick={handleRequestQuote}
              className="w-100"
              startIcon={<i className="bi bi-file-earmark-text" />}
            >
              Cotizar
            </Button>
          )}
        </div>
      )}
    </div>
  )

  // Render horizontal layout (for list view)
  if (cardLayout === 'horizontal') {
    return (
      <div 
        className={`card ${layoutClasses[layout]} ${className} ${onProductClick ? 'cursor-pointer' : ''}`}
        onClick={onProductClick ? handleProductClick : undefined}
      >
        <div className="row g-0">
          <div className="col-md-3 col-lg-2">
            {renderImage()}
          </div>
          <div className="col-md-9 col-lg-10">
            {renderInfo()}
          </div>
        </div>
      </div>
    )
  }

  // Render vertical layout (default)
  return (
    <div 
      className={`card ${layoutClasses[layout]} ${className} ${onProductClick ? 'cursor-pointer' : ''}`}
      onClick={onProductClick ? handleProductClick : undefined}
    >
      {renderImage()}
      {renderInfo()}
    </div>
  )
}

export default PublicProductCard