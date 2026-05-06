'use client'

import React, { useState, useMemo } from 'react'
import { Input, Button } from '@/ui/components/base'
import { useProductsForOffer } from '../hooks/useOffers'
import type { ProductForOffer } from '../types'

interface ProductSelectorProps {
  onSelect: (product: ProductForOffer) => void
  onCancel?: () => void
  excludeProductIds?: string[]
}

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount)
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  onSelect,
  onCancel,
  excludeProductIds = []
}) => {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const { products, isLoading, error } = useProductsForOffer(debouncedSearch)

  // Filter out excluded products
  const filteredProducts = useMemo(() => {
    return products.filter(p => !excludeProductIds.includes(p.id))
  }, [products, excludeProductIds])

  return (
    <div className="product-selector">
      {/* Search Input */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Buscar producto por nombre o SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon="bi-search"
          disabled={isLoading}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar productos
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      {/* Products List */}
      {!isLoading && !error && (
        <>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-inbox display-4 d-block mb-2" />
              <p>No se encontraron productos</p>
            </div>
          ) : (
            <div className="list-group" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className="list-group-item list-group-item-action"
                  onClick={() => onSelect(product)}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center">
                        <strong>{product.name}</strong>
                        {product.hasOffer && (
                          <span className="badge bg-success ms-2">
                            Ya tiene oferta
                          </span>
                        )}
                      </div>
                      {product.sku && (
                        <small className="text-muted d-block">
                          SKU: {product.sku}
                        </small>
                      )}
                      <div className="mt-1">
                        {product.category && (
                          <span className="badge bg-secondary me-1">
                            {product.category.name}
                          </span>
                        )}
                        {product.brand && (
                          <span className="badge bg-primary">
                            {product.brand.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-muted small">Precio actual</div>
                      <div className="fw-bold">
                        {formatCurrency(product.price)}
                      </div>
                      {product.hasOffer && (
                        <span className="badge bg-danger">
                          {product.currentDiscount.toFixed(0)}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Cancel Button */}
      {onCancel && (
        <div className="mt-3 text-end">
          <Button
            variant="secondary"
            buttonStyle="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  )
}

export default ProductSelector
