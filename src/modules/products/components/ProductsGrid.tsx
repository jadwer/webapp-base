'use client'

import React from 'react'
import clsx from 'clsx'
import { Button } from '@/ui/components/base'
import StatusBadge from './StatusBadge'
import { formatPrice } from '../utils'
import type { Product } from '../types'

interface ProductsGridProps {
  products: Product[]
  isLoading?: boolean
  columns?: 2 | 3 | 4 | 6
  showActions?: boolean
  showPricing?: boolean
  showStatus?: boolean
  showDescription?: boolean
  maxDescriptionLength?: number
  imageHeight?: number
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
  onAddToCart?: (product: Product) => void
  className?: string
}

interface ProductGridCardProps {
  product: Product
  showActions?: boolean
  showPricing?: boolean
  showStatus?: boolean
  showDescription?: boolean
  maxDescriptionLength?: number
  imageHeight?: number
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
  onAddToCart?: (product: Product) => void
}

const ProductGridCard: React.FC<ProductGridCardProps> = ({
  product,
  showActions = true,
  showPricing = true,
  showStatus = true,
  showDescription = true,
  maxDescriptionLength = 80,
  imageHeight = 200,
  onEdit,
  onDelete,
  onView,
  onAddToCart
}) => {
  const truncateText = (text: string | null | undefined, maxLength: number) => {
    if (!text) return ''
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  const getProductStatus = (): 'active' | 'inactive' | 'out_of_stock' => {
    return 'active'
  }

  return (
    <div className="card h-100 product-grid-card">
      {/* Image Section */}
      <div className="position-relative overflow-hidden">
        {product.imgPath ? (
          <img 
            src={product.imgPath} 
            alt={product.name}
            className="card-img-top"
            style={{ 
              height: imageHeight, 
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          />
        ) : (
          <div 
            className="d-flex align-items-center justify-content-center bg-light text-muted"
            style={{ height: imageHeight }}
          >
            <i className="bi bi-image display-4" />
          </div>
        )}
        
        {/* Status Badge */}
        {showStatus && (
          <div className="position-absolute top-0 end-0 p-2">
            <StatusBadge status={getProductStatus()} />
          </div>
        )}

        {/* SKU Badge */}
        {product.sku && (
          <div className="position-absolute top-0 start-0 p-2">
            <span className="badge bg-dark bg-opacity-75 text-white">
              {product.sku}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="card-body d-flex flex-column">
        {/* Product Name */}
        <h5 className="card-title mb-2" title={product.name}>
          {truncateText(product.name, 50)}
        </h5>
        
        {/* Category and Brand */}
        <div className="mb-2">
          <div className="d-flex flex-wrap gap-1 mb-1">
            {product.category && (
              <span className="badge bg-secondary">
                {product.category.name}
              </span>
            )}
            {product.brand && (
              <span className="badge bg-primary">
                {product.brand.name}
              </span>
            )}
          </div>
          {product.unit && (
            <small className="text-muted">
              <i className="bi bi-rulers me-1" />
              {product.unit.name}
            </small>
          )}
        </div>

        {/* Description */}
        {showDescription && product.description && (
          <p className="card-text text-muted small mb-2">
            {truncateText(product.description, maxDescriptionLength)}
          </p>
        )}

        {/* Pricing */}
        {showPricing && (
          <div className="mt-auto mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-bold text-primary fs-5">
                  {formatPrice(product.price)}
                </div>
                {product.cost && (
                  <small className="text-muted">
                    Costo: {formatPrice(product.cost)}
                  </small>
                )}
              </div>
              {product.iva && (
                <span className="badge bg-info text-dark">IVA</span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-auto">
            <div className="d-flex gap-1">
              {/* Primary Action (Add to Cart / View) */}
              {onAddToCart ? (
                <Button
                  size="small"
                  variant="primary"
                  onClick={() => onAddToCart(product)}
                  className="flex-fill"
                >
                  <i className="bi bi-cart-plus me-1" />
                  Agregar
                </Button>
              ) : onView ? (
                <Button
                  size="small"
                  variant="primary"
                  buttonStyle="outline"
                  onClick={() => onView(product)}
                  className="flex-fill"
                >
                  <i className="bi bi-eye me-1" />
                  Ver
                </Button>
              ) : null}
              
              {/* Admin Actions */}
              {onEdit && (
                <Button
                  size="small"
                  variant="secondary"
                  buttonStyle="outline"
                  onClick={() => onEdit(product)}
                  title="Editar producto"
                >
                  <i className="bi bi-pencil" />
                </Button>
              )}
              
              {onDelete && (
                <Button
                  size="small"
                  variant="danger"
                  buttonStyle="outline"
                  onClick={() => onDelete(product)}
                  title="Eliminar producto"
                >
                  <i className="bi bi-trash" />
                </Button>
              )}
            </div>

            {/* Additional Info Links */}
            {product.datasheetPath && (
              <div className="mt-2">
                <a
                  href={product.datasheetPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-info w-100"
                >
                  <i className="bi bi-file-earmark-pdf me-1" />
                  Hoja de datos
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  isLoading = false,
  columns = 4,
  showActions = true,
  showPricing = true,
  showStatus = true,
  showDescription = true,
  maxDescriptionLength = 80,
  imageHeight = 200,
  onEdit,
  onDelete,
  onView,
  onAddToCart,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={clsx('row g-3', className)}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className={`col-md-${12 / columns}`}>
            <div className="card h-100">
              <div 
                className="bg-light animate-pulse"
                style={{ height: imageHeight }}
              />
              <div className="card-body">
                <div className="bg-light animate-pulse rounded mb-2" style={{ height: 20 }} />
                <div className="bg-light animate-pulse rounded mb-2" style={{ height: 16 }} />
                <div className="bg-light animate-pulse rounded" style={{ height: 14 }} />
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
        <i className="bi bi-grid display-1 text-muted mb-3" />
        <h3 className="text-muted">No hay productos</h3>
        <p className="text-muted">No se encontraron productos para mostrar.</p>
      </div>
    )
  }

  return (
    <div className={clsx('row g-3', className)}>
      {products.map((product) => (
        <div key={product.id} className={`col-md-${12 / columns} col-sm-6`}>
          <ProductGridCard
            product={product}
            showActions={showActions}
            showPricing={showPricing}
            showStatus={showStatus}
            showDescription={showDescription}
            maxDescriptionLength={maxDescriptionLength}
            imageHeight={imageHeight}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            onAddToCart={onAddToCart}
          />
        </div>
      ))}
    </div>
  )
}

export default ProductsGrid