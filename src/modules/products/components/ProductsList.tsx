'use client'

import React from 'react'
import clsx from 'clsx'
import { Button } from '@/ui/components/base'
import StatusBadge from './StatusBadge'
import { formatPrice } from '../utils'
import type { Product } from '../types'

interface ProductsListProps {
  products: Product[]
  isLoading?: boolean
  showImages?: boolean
  showPricing?: boolean
  showStatus?: boolean
  showDescription?: boolean
  showActions?: boolean
  maxDescriptionLength?: number
  imageSize?: number
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
  onSelect?: (product: Product) => void
  className?: string
}

interface ProductListItemProps {
  product: Product
  showImages?: boolean
  showPricing?: boolean
  showStatus?: boolean
  showDescription?: boolean
  showActions?: boolean
  maxDescriptionLength?: number
  imageSize?: number
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
  onSelect?: (product: Product) => void
}

const ProductListItem: React.FC<ProductListItemProps> = ({
  product,
  showImages = true,
  showPricing = true,
  showStatus = true,
  showDescription = false,
  showActions = true,
  maxDescriptionLength = 60,
  imageSize = 60,
  onEdit,
  onDelete,
  onView,
  onSelect
}) => {
  const truncateText = (text: string | null | undefined, maxLength: number) => {
    if (!text) return ''
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  const getProductStatus = (): 'active' | 'inactive' | 'out_of_stock' => {
    return 'active'
  }

  return (
    <div 
      className={clsx(
        'list-group-item list-group-item-action d-flex align-items-start gap-3 py-3',
        onSelect && 'cursor-pointer'
      )}
      onClick={onSelect ? () => onSelect(product) : undefined}
    >
      {/* Product Image */}
      {showImages && (
        <div className="flex-shrink-0 position-relative">
          {product.imgPath ? (
            <img 
              src={product.imgPath} 
              alt={product.name}
              className="rounded"
              style={{ 
                width: imageSize, 
                height: imageSize, 
                objectFit: 'cover'
              }}
            />
          ) : (
            <div 
              className="d-flex align-items-center justify-content-center bg-light text-muted rounded"
              style={{ width: imageSize, height: imageSize }}
            >
              <i className="bi bi-image" />
            </div>
          )}
          
          {/* Status Indicator */}
          {showStatus && (
            <div className="position-absolute top-0 end-0 translate-middle">
              <StatusBadge status={getProductStatus()} />
            </div>
          )}
        </div>
      )}

      {/* Product Info */}
      <div className="flex-grow-1 min-w-0">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <h6 className="mb-0 text-truncate pe-2" title={product.name}>
            {product.name}
          </h6>
          
          {/* Price */}
          {showPricing && (
            <div className="text-end flex-shrink-0">
              <div className="fw-bold text-primary">
                {formatPrice(product.price)}
              </div>
              {product.iva && (
                <small className="badge bg-info text-dark">IVA</small>
              )}
            </div>
          )}
        </div>

        {/* SKU and Meta info */}
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          {product.sku && (
            <span className="badge bg-dark">
              <i className="bi bi-upc-scan me-1" />
              {product.sku}
            </span>
          )}
          
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
          
          {product.unit && (
            <small className="text-muted">
              <i className="bi bi-rulers me-1" />
              {product.unit.name}
            </small>
          )}
        </div>

        {/* Description */}
        {showDescription && product.description && (
          <p className="text-muted small mb-2">
            {truncateText(product.description, maxDescriptionLength)}
          </p>
        )}

        {/* Additional Info */}
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-2">
            {showPricing && product.cost && (
              <small className="text-muted">
                Costo: {formatPrice(product.cost)}
              </small>
            )}
            
            {product.datasheetPath && (
              <a
                href={product.datasheetPath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none small"
                onClick={(e) => e.stopPropagation()}
              >
                <i className="bi bi-file-earmark-pdf me-1" />
                PDF
              </a>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="btn-group btn-group-sm">
              {onView && (
                <Button
                  size="small"
                  variant="secondary"
                  buttonStyle="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    onView(product)
                  }}
                  title="Ver producto"
                >
                  <i className="bi bi-eye" />
                </Button>
              )}
              
              {onEdit && (
                <Button
                  size="small"
                  variant="primary"
                  buttonStyle="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(product)
                  }}
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
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(product)
                  }}
                  title="Eliminar producto"
                >
                  <i className="bi bi-trash" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const ProductsList: React.FC<ProductsListProps> = ({
  products,
  isLoading = false,
  showImages = true,
  showPricing = true,
  showStatus = true,
  showDescription = false,
  showActions = true,
  maxDescriptionLength = 60,
  imageSize = 60,
  onEdit,
  onDelete,
  onView,
  onSelect,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={clsx('list-group', className)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="list-group-item d-flex align-items-start gap-3 py-3">
            {showImages && (
              <div 
                className="bg-light animate-pulse rounded flex-shrink-0"
                style={{ width: imageSize, height: imageSize }}
              />
            )}
            <div className="flex-grow-1">
              <div className="bg-light animate-pulse rounded mb-2" style={{ height: 18 }} />
              <div className="bg-light animate-pulse rounded mb-2" style={{ height: 14, width: '60%' }} />
              <div className="bg-light animate-pulse rounded" style={{ height: 12, width: '40%' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className={clsx('text-center py-5', className)}>
        <i className="bi bi-list display-1 text-muted mb-3" />
        <h3 className="text-muted">No hay productos</h3>
        <p className="text-muted">No se encontraron productos para mostrar.</p>
      </div>
    )
  }

  return (
    <div className={clsx('list-group list-group-flush', className)}>
      {products.map((product) => (
        <ProductListItem
          key={product.id}
          product={product}
          showImages={showImages}
          showPricing={showPricing}
          showStatus={showStatus}
          showDescription={showDescription}
          showActions={showActions}
          maxDescriptionLength={maxDescriptionLength}
          imageSize={imageSize}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export default ProductsList