'use client'

import React from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Button } from '@/ui/components/base'
import { StatusBadge } from './StatusBadge'
import type { Product } from '../types'

interface ProductsTableVirtualizedProps {
  products: Product[]
  isLoading?: boolean
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  onView?: (product: Product) => void
}

const ProductRow = React.memo<{
  product: Product
  style: React.CSSProperties
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  onView?: (product: Product) => void
}>(({ product, style, onEdit, onDelete, onView }) => (
  <div 
    style={style} 
    className="d-flex align-items-center border-bottom bg-white hover-bg-light transition-all"
  >
    {/* Image */}
    <div className="flex-shrink-0 me-3" style={{ width: '60px' }}>
      <img
        src={product.image || '/images/product-placeholder.jpg'}
        alt={product.name}
        className="rounded border"
        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          if (target.src.includes('product-placeholder.jpg')) return // Prevent infinite loop
          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNSAyMEMyNi42NTY5IDIwIDI4IDIxLjM0MzEgMjggMjNDMjggMjQuNjU2OSAyNi42NTY5IDI2IDI1IDI2QzIzLjM0MzEgMjYgMjIgMjQuNjU2OSAyMiAyM0MyMiAyMS4zNDMxIDIzLjM0MzEgMjAgMjUgMjBaIiBmaWxsPSIjOUIxQjI2Ii8+CjxwYXRoIGQ9Ik0xOCAzMEwzMiAzMEMzMi41NTIzIDMwIDMzIDI5LjU1MjMgMzMgMjlDMzMgMjguNDQ3NyAzMi41NTIzIDI4IDMyIDI4TDE4IDI4QzE3LjQ0NzcgMjggMTcgMjguNDQ3NyAxNyAyOUMxNyAyOS41NTIzIDE3LjQ0NzcgMzAgMTggMzBaIiBmaWxsPSIjOUIxQjI2Ii8+Cjwvc3ZnPgo='
        }}
      />
    </div>

    {/* Name & SKU */}
    <div className="flex-fill me-3" style={{ minWidth: '200px' }}>
      <div className="fw-bold text-dark mb-1">{product.name}</div>
      <div className="small text-muted">SKU: {product.sku}</div>
      <div className="small text-info">
        {product.category?.name} • {product.brand?.name}
      </div>
    </div>

    {/* Price */}
    <div className="text-end me-3" style={{ width: '120px' }}>
      <div className="fw-bold text-success">
        ${product.price?.toFixed(2)}
        <span className="small text-muted ms-1">+IVA</span>
      </div>
      <div className="small text-muted">Costo: ${product.cost?.toFixed(2)}</div>
    </div>

    {/* Stock */}
    <div className="text-center me-3" style={{ width: '80px' }}>
      <div className="fw-bold">{product.stock || 0}</div>
      <div className="small text-muted">{product.unit?.name}</div>
    </div>

    {/* Status */}
    <div className="me-3" style={{ width: '100px' }}>
      <StatusBadge status={product.status || 'active'} />
    </div>

    {/* Actions */}
    <div className="d-flex gap-1" style={{ width: '140px' }}>
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
))

ProductRow.displayName = 'ProductRow'

export const ProductsTableVirtualized = React.memo<ProductsTableVirtualizedProps>(({ 
  products, 
  isLoading = false,
  onEdit,
  onDelete,
  onView 
}) => {
  console.log('🔄 ProductsTableVirtualized render:', products.length, 'products')

  const parentRef = React.useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Height per row
    overscan: 10, // Render extra rows for smooth scrolling
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
          <i className="bi bi-box-seam display-1 text-muted mb-3"></i>
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
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0 me-3" style={{ width: '60px' }}>
            <small className="fw-bold text-uppercase text-muted">Imagen</small>
          </div>
          <div className="flex-fill me-3" style={{ minWidth: '200px' }}>
            <small className="fw-bold text-uppercase text-muted">Producto</small>
          </div>
          <div className="text-center me-3" style={{ width: '120px' }}>
            <small className="fw-bold text-uppercase text-muted">Precio</small>
          </div>
          <div className="text-center me-3" style={{ width: '80px' }}>
            <small className="fw-bold text-uppercase text-muted">Stock</small>
          </div>
          <div className="me-3" style={{ width: '100px' }}>
            <small className="fw-bold text-uppercase text-muted">Estado</small>
          </div>
          <div className="text-center" style={{ width: '140px' }}>
            <small className="fw-bold text-uppercase text-muted">Acciones</small>
          </div>
        </div>
      </div>

      {/* Virtualized Content */}
      <div 
        ref={parentRef}
        style={{
          height: '600px', // Fixed height for virtualization
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
            const product = products[virtualRow.index]
            return (
              <ProductRow
                key={product.id}
                product={product}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  padding: '12px 16px'
                }}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
              />
            )
          })}
        </div>
      </div>

      {/* Footer with count */}
      <div className="card-footer bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Mostrando {products.length} productos
          </small>
          <small className="text-muted">
            <i className="bi bi-lightning me-1"></i>
            Tabla virtualizada para máximo rendimiento
          </small>
        </div>
      </div>
    </div>
  )
})

ProductsTableVirtualized.displayName = 'ProductsTableVirtualized'

export default ProductsTableVirtualized