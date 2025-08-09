'use client'

import React from 'react'
import clsx from 'clsx'
import { Button } from '@/ui/components/base'
import StatusBadge from './StatusBadge'
import { formatPrice } from '../utils'
import type { Product } from '../types'

interface ProductsShowcaseProps {
  products: Product[]
  isLoading?: boolean
  layout?: 'hero' | 'featured' | 'carousel'
  showPricing?: boolean
  showDescription?: boolean
  showActions?: boolean
  heroImageHeight?: number
  featuredImageHeight?: number
  maxDescriptionLength?: number
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
  onAddToCart?: (product: Product) => void
  onLearnMore?: (product: Product) => void
  className?: string
}

interface ProductShowcaseCardProps {
  product: Product
  isHero?: boolean
  showPricing?: boolean
  showDescription?: boolean
  showActions?: boolean
  imageHeight?: number
  maxDescriptionLength?: number
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
  onAddToCart?: (product: Product) => void
  onLearnMore?: (product: Product) => void
}

const ProductShowcaseCard: React.FC<ProductShowcaseCardProps> = ({
  product,
  isHero = false,
  showPricing = true,
  showDescription = true,
  showActions = true,
  imageHeight = 300,
  maxDescriptionLength = 150,
  onEdit,
  onDelete,
  onView,
  onAddToCart,
  onLearnMore
}) => {
  const truncateText = (text: string | null | undefined, maxLength: number) => {
    if (!text) return ''
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  const getProductStatus = (): 'active' | 'inactive' | 'out_of_stock' => {
    return 'active'
  }

  const cardClasses = clsx(
    'card border-0 shadow-lg showcase-card',
    isHero && 'hero-card',
    'h-100'
  )

  return (
    <div className={cardClasses}>
      {/* Product Image */}
      <div className="position-relative overflow-hidden">
        {product.imgPath ? (
          <img 
            src={product.imgPath} 
            alt={product.name}
            className="card-img-top"
            style={{ 
              height: imageHeight, 
              objectFit: 'cover',
              transition: 'transform 0.5s ease'
            }}
          />
        ) : (
          <div 
            className="d-flex align-items-center justify-content-center bg-gradient text-white"
            style={{ 
              height: imageHeight,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            <div className="text-center">
              <i className="bi bi-image display-1 mb-3" />
              <h4>{product.name}</h4>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="position-absolute top-0 end-0 m-3">
          <StatusBadge status={getProductStatus()} />
        </div>

        {/* Category Badge */}
        {product.category && (
          <div className="position-absolute top-0 start-0 m-3">
            <span className="badge bg-dark bg-opacity-75 text-white px-3 py-2">
              {product.category.name}
            </span>
          </div>
        )}

        {/* Overlay for hero cards */}
        {isHero && (
          <div className="position-absolute bottom-0 start-0 end-0 bg-gradient-to-t from-dark to-transparent p-4">
            <h2 className="text-white mb-2">{product.name}</h2>
            {product.sku && (
              <p className="text-white-50 mb-0">
                <small>SKU: {product.sku}</small>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Card Body */}
      {!isHero && (
        <div className="card-body d-flex flex-column text-center">
          {/* Product Name */}
          <h3 className="card-title h4 mb-3">{product.name}</h3>
          
          {/* SKU */}
          {product.sku && (
            <p className="text-muted mb-3">
              <small>
                <i className="bi bi-upc-scan me-2" />
                SKU: {product.sku}
              </small>
            </p>
          )}

          {/* Brand and Unit */}
          <div className="d-flex justify-content-center gap-2 mb-3">
            {product.brand && (
              <span className="badge bg-primary fs-6 px-3 py-2">
                {product.brand.name}
              </span>
            )}
            {product.unit && (
              <span className="badge bg-outline-secondary fs-6 px-3 py-2">
                {product.unit.name}
              </span>
            )}
          </div>

          {/* Description */}
          {showDescription && product.description && (
            <p className="card-text text-muted mb-4 flex-grow-1">
              {truncateText(product.description, maxDescriptionLength)}
            </p>
          )}

          {/* Pricing */}
          {showPricing && (
            <div className="mb-4">
              <div className="display-6 fw-bold text-primary mb-2">
                {formatPrice(product.price)}
              </div>
              {product.cost && (
                <small className="text-muted">
                  Costo: {formatPrice(product.cost)}
                </small>
              )}
              <div className="mt-2">
                {product.iva && (
                  <span className="badge bg-info text-dark me-2">IVA Incluido</span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="mt-auto">
              <div className="d-grid gap-2">
                {/* Primary Action */}
                {onAddToCart ? (
                  <Button
                    size="large"
                    variant="primary"
                    onClick={() => onAddToCart(product)}
                  >
                    <i className="bi bi-cart-plus me-2" />
                    Agregar al Carrito
                  </Button>
                ) : onLearnMore ? (
                  <Button
                    size="large"
                    variant="primary"
                    onClick={() => onLearnMore(product)}
                  >
                    <i className="bi bi-arrow-right me-2" />
                    Ver Detalles
                  </Button>
                ) : null}

                {/* Secondary Actions */}
                <div className="d-flex gap-2 mt-2">
                  {onView && (
                    <Button
                      size="small"
                      variant="secondary"
                      buttonStyle="outline"
                      onClick={() => onView(product)}
                      className="flex-fill"
                    >
                      <i className="bi bi-eye me-1" />
                      Ver
                    </Button>
                  )}
                  
                  {onEdit && (
                    <Button
                      size="small"
                      variant="warning"
                      buttonStyle="outline"
                      onClick={() => onEdit(product)}
                      className="flex-fill"
                    >
                      <i className="bi bi-pencil me-1" />
                      Editar
                    </Button>
                  )}
                  
                  {onDelete && (
                    <Button
                      size="small"
                      variant="danger"
                      buttonStyle="outline"
                      onClick={() => onDelete(product)}
                    >
                      <i className="bi bi-trash" />
                    </Button>
                  )}
                </div>

                {/* Additional Links */}
                {product.datasheetPath && (
                  <div className="mt-3">
                    <a
                      href={product.datasheetPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-info btn-sm w-100"
                    >
                      <i className="bi bi-file-earmark-pdf me-2" />
                      Descargar Hoja de Datos
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export const ProductsShowcase: React.FC<ProductsShowcaseProps> = ({
  products,
  isLoading = false,
  layout = 'featured',
  showPricing = true,
  showDescription = true,
  showActions = true,
  heroImageHeight = 500,
  featuredImageHeight = 300,
  maxDescriptionLength = 150,
  onEdit,
  onDelete,
  onView,
  onAddToCart,
  onLearnMore,
  className = ''
}) => {
  if (isLoading) {
    const skeletonCount = layout === 'hero' ? 1 : layout === 'featured' ? 3 : 4
    return (
      <div className={clsx('row g-4', className)}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} className={layout === 'hero' ? 'col-12' : 'col-md-6 col-lg-4'}>
            <div className="card border-0 shadow-lg h-100">
              <div 
                className="bg-light animate-pulse"
                style={{ height: layout === 'hero' ? heroImageHeight : featuredImageHeight }}
              />
              <div className="card-body text-center">
                <div className="bg-light animate-pulse rounded mb-3 mx-auto" style={{ height: 28, width: '70%' }} />
                <div className="bg-light animate-pulse rounded mb-3 mx-auto" style={{ height: 16, width: '40%' }} />
                <div className="bg-light animate-pulse rounded mb-4 mx-auto" style={{ height: 20, width: '60%' }} />
                <div className="bg-light animate-pulse rounded mx-auto" style={{ height: 40, width: '80%' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className={clsx('text-center py-5', className)}>
        <i className="bi bi-star display-1 text-muted mb-3" />
        <h3 className="text-muted">No hay productos destacados</h3>
        <p className="text-muted">No se encontraron productos para mostrar en el showcase.</p>
      </div>
    )
  }

  const getColumnClass = () => {
    switch (layout) {
      case 'hero':
        return 'col-12'
      case 'featured':
        return 'col-md-6 col-lg-4'
      case 'carousel':
        return 'col-md-6 col-xl-3'
      default:
        return 'col-md-6 col-lg-4'
    }
  }

  const getImageHeight = () => {
    return layout === 'hero' ? heroImageHeight : featuredImageHeight
  }

  return (
    <div className={clsx('row g-4', className)}>
      {products.map((product, index) => (
        <div key={product.id} className={getColumnClass()}>
          <ProductShowcaseCard
            product={product}
            isHero={layout === 'hero' && index === 0}
            showPricing={showPricing}
            showDescription={showDescription}
            showActions={showActions}
            imageHeight={getImageHeight()}
            maxDescriptionLength={maxDescriptionLength}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            onAddToCart={onAddToCart}
            onLearnMore={onLearnMore}
          />
        </div>
      ))}
    </div>
  )
}

export default ProductsShowcase