'use client'

import React from 'react'
import Image from 'next/image'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Button } from '@/ui/components/base'
import type { Product } from '../types'

interface ProductsShowcaseProps {
  products: Product[]
  isLoading?: boolean
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  onView?: (product: Product) => void
}

const ProductShowcaseCard = React.memo<{
  product: Product
  style: React.CSSProperties
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  onView?: (product: Product) => void
}>(({ product, style, onEdit, onDelete, onView }) => (
  <div style={style} className="p-3">
    <div className="card h-100 shadow-lg border-0 showcase-card overflow-hidden">
      {/* Hero Product Image */}
      <div className="position-relative">
        <Image
          src={product.imgUrl || '/images/product-placeholder.svg'}
          alt={product.name}
          width={400}
          height={400}
          className="card-img-top"
          style={{ height: '400px', objectFit: 'cover' }}
        />
        
        {/* Status and Category Overlays */}
        <div className="position-absolute top-0 end-0 m-3">
          <span className="badge bg-success rounded-pill small">Activo</span>
        </div>
        
        <div className="position-absolute top-0 start-0 m-3">
          <span className="badge bg-dark bg-opacity-75 text-white px-3 py-2">
            {product.category?.name || 'Sin categoría'}
          </span>
        </div>
        
        {/* Gradient overlay for better text readability */}
        <div className="position-absolute bottom-0 start-0 end-0" 
             style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', height: '50%' }}>
        </div>
      </div>

      {/* Card Content */}
      <div className="card-body d-flex flex-column text-center bg-white">
        {/* Product Title */}
        <h4 className="card-title fw-bold text-dark mb-3">{product.name}</h4>
        
        {/* SKU and Brand */}
        <div className="mb-3">
          <small className="text-muted d-block mb-1">SKU: {product.sku}</small>
          <div className="d-flex justify-content-center gap-2">
            <span className="badge bg-primary">{product.brand?.name || 'Sin marca'}</span>
            <span className="badge bg-secondary">{product.unit?.name || 'Sin unidad'}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted mb-4 flex-grow-1" style={{ minHeight: '60px' }}>
          {product.description || 'Producto sin descripción disponible'}
        </p>

        {/* Pricing Showcase */}
        <div className="mb-4 p-3 bg-light rounded">
          <div className="display-5 fw-bold text-primary mb-2">
            ${product.price?.toFixed(2) || '0.00'}
            <small className="text-muted fs-6 ms-2">+IVA</small>
          </div>
          <div className="row g-2 text-center">
            <div className="col-6">
              <small className="text-muted">Stock</small>
              <div className="fw-bold">{"N/A"}</div>
            </div>
            <div className="col-6">
              <small className="text-muted">Costo</small>
              <div className="fw-bold text-secondary">${product.cost?.toFixed(2) || '0.00'}</div>
            </div>
          </div>
        </div>

        {/* Premium Actions */}
        <div className="mt-auto">
          <div className="d-grid gap-2">
            <div className="btn-group" role="group">
              {onView && (
                <Button
                  size="large"
                  variant="primary"
                  onClick={() => onView(product)}
                  className="flex-fill"
                >
                  <i className="bi bi-eye me-2" />
                  Ver Detalles
                </Button>
              )}
              {onEdit && (
                <Button
                  size="large"
                  variant="warning"
                  buttonStyle="outline"
                  onClick={() => onEdit(product)}
                >
                  <i className="bi bi-pencil me-2" />
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button
                  size="large"
                  variant="danger"
                  buttonStyle="outline"
                  onClick={() => onDelete(product.id)}
                >
                  <i className="bi bi-trash me-2" />
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
))

ProductShowcaseCard.displayName = 'ProductShowcaseCard'

export const ProductsShowcase = React.memo<ProductsShowcaseProps>(({
  products,
  isLoading = false,
  onEdit,
  onDelete,
  onView
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null)

  // Showcase uses 2 cards per row for better visual impact
  const itemsPerRow = 2
  const cardHeight = 650 // Height for showcase cards with large images

  const virtualizer = useVirtualizer({
    count: Math.ceil(products.length / itemsPerRow),
    getScrollElement: () => parentRef.current,
    estimateSize: () => cardHeight,
    overscan: 1,
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
          <i className="bi bi-images display-1 text-muted mb-3"></i>
          <h5 className="text-muted">No se encontraron productos</h5>
          <p className="text-muted">Intenta cambiar los filtros de búsqueda.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header bg-dark text-white">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <i className="bi bi-images me-2 text-warning" />
            <h6 className="mb-0 fw-bold">Vista Showcase</h6>
          </div>
          <small className="text-white-50">
            <i className="bi bi-lightning me-1"></i>
            Presentación Premium
          </small>
        </div>
      </div>

      {/* Virtualized Showcase Content */}
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
                <div className="row g-4">
                  {rowProducts.map((product) => (
                    <div key={product.id} className="col-md-6">
                      <ProductShowcaseCard
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
      <div className="card-footer bg-dark text-white">
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-white-50">
            Mostrando {products.length} productos en showcase
          </small>
          <small className="text-white-50">
            <i className="bi bi-star me-1"></i>
            Visualización premium con imágenes grandes
          </small>
        </div>
      </div>
    </div>
  )
})

ProductsShowcase.displayName = 'ProductsShowcase'

export default ProductsShowcase