'use client'

import React from 'react'
import Image from 'next/image'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Button } from '@/ui/components/base'
import type { Product } from '../types'

interface ProductsGridProps {
  products: Product[]
  isLoading?: boolean
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  onView?: (product: Product) => void
}

const ProductCard = React.memo<{
  product: Product
  style: React.CSSProperties
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  onView?: (product: Product) => void
}>(({ product, style, onEdit, onDelete, onView }) => (
  <div style={style} className="p-2">
    <div className="card h-100 shadow-sm border-0 hover-shadow-lg transition-all">
      {/* Product Image */}
      <div className="position-relative">
        <Image
          src={product.imgUrl || '/images/product-placeholder.svg'}
          alt={product.name}
          width={200}
          height={200}
          className="card-img-top"
          style={{ height: '200px', objectFit: 'cover' }}
        />
        <div className="position-absolute top-0 end-0 m-2">
          <span className="badge bg-success rounded-pill small">Activo</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body d-flex flex-column">
        {/* Product Name */}
        <h6 className="card-title fw-bold text-dark mb-2 text-truncate" title={product.name}>
          {product.name}
        </h6>

        {/* SKU and Category */}
        <div className="mb-2">
          <small className="text-muted d-block">SKU: {product.sku}</small>
          <small className="text-info d-block text-truncate">
            {product.category?.name} • {product.brand?.name}
          </small>
        </div>

        {/* Price and Stock */}
        <div className="row g-2 mb-3">
          <div className="col-6">
            <div className="text-center">
              <div className="fw-bold text-success">
                ${product.price?.toFixed(2)}
              </div>
              <small className="text-muted">+IVA</small>
            </div>
          </div>
          <div className="col-6">
            <div className="text-center">
              <div className="fw-bold">{"N/A"}</div>
              <small className="text-muted">{product.unit?.name}</small>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto">
          <div className="d-grid gap-2">
            <div className="btn-group btn-group-sm" role="group">
              {onView && (
                <Button
                  size="small"
                  variant="primary"
                  buttonStyle="outline"
                  onClick={() => onView(product)}
                  title="Ver detalles"
                >
                  <i className="bi bi-eye" />
                </Button>
              )}
              {onEdit && (
                <Button
                  size="small"
                  variant="secondary"
                  buttonStyle="outline"
                  onClick={() => onEdit(product)}
                  title="Editar"
                >
                  <i className="bi bi-pencil" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="small"
                  variant="danger"
                  buttonStyle="outline"
                  onClick={() => onDelete(product.id)}
                  title="Eliminar"
                >
                  <i className="bi bi-trash" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
))

ProductCard.displayName = 'ProductCard'

export const ProductsGrid = React.memo<ProductsGridProps>(({
  products,
  isLoading = false,
  onEdit,
  onDelete,
  onView
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null)

  // Calculate items per row based on container width
  const itemsPerRow = 4 // Grid layout: 4 cards per row
  const cardHeight = 380 // Estimated height per card including margins

  const virtualizer = useVirtualizer({
    count: Math.ceil(products.length / itemsPerRow),
    getScrollElement: () => parentRef.current,
    estimateSize: () => cardHeight,
    overscan: 2,
  })

  const virtualItems = virtualizer.getVirtualItems()

  if (isLoading && products.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <i className="bi bi-grid-3x3 display-1 text-muted mb-3"></i>
          <h5 className="text-muted">No se encontraron productos</h5>
          <p className="text-muted">Intenta cambiar los filtros de búsqueda.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header bg-light">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <i className="bi bi-grid-3x3 me-2 text-primary" />
            <h6 className="mb-0 fw-bold">Vista de Cuadrícula</h6>
          </div>
          <small className="text-muted">
            <i className="bi bi-lightning me-1"></i>
            Virtualizada para máximo rendimiento
          </small>
        </div>
      </div>

      {/* Virtualized Grid Content */}
      <div
        ref={parentRef}
        style={{
          height: '600px',
          overflow: 'auto'
        }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative'
          }}
        >
          {virtualItems.map((virtualRow) => {
            const startIndex = virtualRow.index * itemsPerRow
            const endIndex = Math.min(startIndex + itemsPerRow, products.length)
            const rowProducts = products.slice(startIndex, endIndex)

            return (
              <div
                key={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  padding: '12px'
                }}
              >
                <div className="row g-3">
                  {rowProducts.map((product) => (
                    <div key={product.id} className="col-md-3">
                      <ProductCard
                        product={product}
                        style={{}}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onView={onView}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="card-footer bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Mostrando {products.length} productos en cuadrícula
          </small>
          <small className="text-muted">
            <i className="bi bi-grid-3x3 me-1"></i>
            4 productos por fila
          </small>
        </div>
      </div>
    </div>
  )
})

ProductsGrid.displayName = 'ProductsGrid'

export default ProductsGrid