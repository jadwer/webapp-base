'use client'

import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import { Button } from '@/ui/components/base'
import { formatPrice } from '../utils'
import type { Product } from '../types'

interface ProductsCompactProps {
  products: Product[]
  isLoading?: boolean
  selectable?: boolean
  selectedProducts?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  showPricing?: boolean
  showImages?: boolean
  showCheckboxes?: boolean
  onQuickAction?: (action: 'add' | 'remove' | 'view', product: Product) => void
  maxItems?: number
  className?: string
}

interface ProductCompactRowProps {
  product: Product
  isSelected?: boolean
  onSelect?: (productId: string, selected: boolean) => void
  showPricing?: boolean
  showImages?: boolean
  showCheckboxes?: boolean
  onQuickAction?: (action: 'add' | 'remove' | 'view', product: Product) => void
}

const ProductCompactRow: React.FC<ProductCompactRowProps> = ({
  product,
  isSelected = false,
  onSelect,
  showPricing = true,
  showImages = true,
  showCheckboxes = true,
  onQuickAction
}) => {
  return (
    <tr className={clsx(isSelected && 'table-active', 'align-middle')}>
      {/* Selection Checkbox */}
      {showCheckboxes && (
        <td style={{ width: '40px' }}>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect?.(product.id, e.target.checked)}
            />
          </div>
        </td>
      )}

      {/* Product Image */}
      {showImages && (
        <td style={{ width: '50px' }}>
          {product.imgPath ? (
            <img 
              src={product.imgPath} 
              alt={product.name}
              className="rounded"
              style={{ width: 40, height: 40, objectFit: 'cover' }}
            />
          ) : (
            <div 
              className="d-flex align-items-center justify-content-center bg-light text-muted rounded"
              style={{ width: 40, height: 40 }}
            >
              <i className="bi bi-image" />
            </div>
          )}
        </td>
      )}

      {/* Product Name */}
      <td>
        <div>
          <div className="fw-medium text-truncate" style={{ maxWidth: '200px' }} title={product.name}>
            {product.name}
          </div>
          {product.sku && (
            <small className="text-muted">
              <i className="bi bi-upc-scan me-1" />
              {product.sku}
            </small>
          )}
        </div>
      </td>

      {/* Category */}
      <td style={{ width: '120px' }}>
        {product.category ? (
          <span className="badge bg-secondary">
            {product.category.name}
          </span>
        ) : (
          <span className="text-muted">-</span>
        )}
      </td>

      {/* Brand */}
      <td style={{ width: '120px' }}>
        {product.brand ? (
          <span className="badge bg-primary">
            {product.brand.name}
          </span>
        ) : (
          <span className="text-muted">-</span>
        )}
      </td>

      {/* Unit */}
      <td style={{ width: '80px' }}>
        {product.unit ? (
          <small className="text-muted">{product.unit.name}</small>
        ) : (
          <span className="text-muted">-</span>
        )}
      </td>

      {/* Price */}
      {showPricing && (
        <td style={{ width: '100px' }} className="text-end">
          <div className="fw-bold text-primary">
            {formatPrice(product.price)}
          </div>
          {product.iva && (
            <small className="badge bg-info text-dark">IVA</small>
          )}
        </td>
      )}

      {/* Quick Actions */}
      <td style={{ width: '120px' }}>
        <div className="btn-group btn-group-sm">
          {onQuickAction && (
            <>
              <Button
                size="small"
                variant="secondary"
                buttonStyle="outline"
                onClick={() => onQuickAction('view', product)}
                title="Ver producto"
              >
                <i className="bi bi-eye" />
              </Button>
              
              <Button
                size="small"
                variant="success"
                buttonStyle="outline"
                onClick={() => onQuickAction('add', product)}
                title="Agregar"
              >
                <i className="bi bi-plus-lg" />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

export const ProductsCompact: React.FC<ProductsCompactProps> = ({
  products,
  isLoading = false,
  selectable = true,
  selectedProducts = [],
  onSelectionChange,
  showPricing = true,
  showImages = true,
  showCheckboxes = true,
  onQuickAction,
  maxItems,
  className = ''
}) => {
  const [localSelection, setLocalSelection] = useState<string[]>(selectedProducts)
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null)
  
  const displayProducts = maxItems ? products.slice(0, maxItems) : products
  const hasMore = maxItems && products.length > maxItems

  const handleSelect = (productId: string, selected: boolean) => {
    let newSelection: string[]
    
    if (selected) {
      newSelection = [...localSelection, productId]
    } else {
      newSelection = localSelection.filter(id => id !== productId)
    }
    
    setLocalSelection(newSelection)
    onSelectionChange?.(newSelection)
  }

  const handleSelectAll = () => {
    const allIds = displayProducts.map(p => p.id)
    const newSelection = localSelection.length === allIds.length ? [] : allIds
    setLocalSelection(newSelection)
    onSelectionChange?.(newSelection)
  }

  // Handle indeterminate state for select all checkbox
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const isIndeterminate = localSelection.length > 0 && localSelection.length < displayProducts.length
      selectAllCheckboxRef.current.indeterminate = isIndeterminate
    }
  }, [localSelection.length, displayProducts.length])

  if (isLoading) {
    return (
      <div className={clsx('table-responsive', className)}>
        <table className="table table-sm">
          <thead>
            <tr>
              {showCheckboxes && <th style={{ width: '40px' }}></th>}
              {showImages && <th style={{ width: '50px' }}></th>}
              <th>Producto</th>
              <th>Categoría</th>
              <th>Marca</th>
              <th>Unidad</th>
              {showPricing && <th>Precio</th>}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                {showCheckboxes && (
                  <td>
                    <div className="bg-light animate-pulse rounded" style={{ width: 16, height: 16 }} />
                  </td>
                )}
                {showImages && (
                  <td>
                    <div className="bg-light animate-pulse rounded" style={{ width: 40, height: 40 }} />
                  </td>
                )}
                <td>
                  <div className="bg-light animate-pulse rounded mb-1" style={{ height: 16, width: '80%' }} />
                  <div className="bg-light animate-pulse rounded" style={{ height: 12, width: '60%' }} />
                </td>
                <td>
                  <div className="bg-light animate-pulse rounded" style={{ height: 20, width: '70%' }} />
                </td>
                <td>
                  <div className="bg-light animate-pulse rounded" style={{ height: 20, width: '70%' }} />
                </td>
                <td>
                  <div className="bg-light animate-pulse rounded" style={{ height: 14, width: '50%' }} />
                </td>
                {showPricing && (
                  <td>
                    <div className="bg-light animate-pulse rounded" style={{ height: 16, width: '80%' }} />
                  </td>
                )}
                <td>
                  <div className="d-flex gap-1">
                    <div className="bg-light animate-pulse rounded" style={{ width: 32, height: 24 }} />
                    <div className="bg-light animate-pulse rounded" style={{ width: 32, height: 24 }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className={clsx('text-center py-4', className)}>
        <i className="bi bi-table display-4 text-muted mb-3" />
        <h5 className="text-muted">No hay productos</h5>
        <p className="text-muted">No se encontraron productos para mostrar.</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="table-responsive">
        <table className="table table-sm table-hover">
          <thead className="table-light">
            <tr>
              {/* Select All Checkbox */}
              {showCheckboxes && (
                <th style={{ width: '40px' }}>
                  <div className="form-check">
                    <input
                      ref={selectAllCheckboxRef}
                      className="form-check-input"
                      type="checkbox"
                      checked={localSelection.length === displayProducts.length && displayProducts.length > 0}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
              )}
              
              {showImages && <th style={{ width: '50px' }}></th>}
              <th>Producto</th>
              <th style={{ width: '120px' }}>Categoría</th>
              <th style={{ width: '120px' }}>Marca</th>
              <th style={{ width: '80px' }}>Unidad</th>
              {showPricing && <th style={{ width: '100px' }} className="text-end">Precio</th>}
              <th style={{ width: '120px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayProducts.map((product) => (
              <ProductCompactRow
                key={product.id}
                product={product}
                isSelected={localSelection.includes(product.id)}
                onSelect={selectable ? handleSelect : undefined}
                showPricing={showPricing}
                showImages={showImages}
                showCheckboxes={showCheckboxes}
                onQuickAction={onQuickAction}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Selection Summary */}
      {selectable && localSelection.length > 0 && (
        <div className="mt-2">
          <small className="text-muted">
            <i className="bi bi-check2-square me-1" />
            {localSelection.length} productos seleccionados
            {hasMore && ` de ${products.length} total`}
          </small>
        </div>
      )}

      {/* Show More Indicator */}
      {hasMore && (
        <div className="mt-2 text-center">
          <small className="text-muted">
            Mostrando {displayProducts.length} de {products.length} productos
          </small>
        </div>
      )}
    </div>
  )
}

export default ProductsCompact