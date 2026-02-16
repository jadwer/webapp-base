'use client'

import React from 'react'
import Image from 'next/image'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Button } from '@/ui/components/base'
import type { Product } from '../types'

interface ProductsCompactProps {
  products: Product[]
  isLoading?: boolean
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  onView?: (product: Product) => void
}

const ProductCompactRow = React.memo<{
  product: Product
  style: React.CSSProperties
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  onView?: (product: Product) => void
}>(({ product, style, onEdit, onDelete, onView }) => (
  <div style={style} className="d-flex align-items-center border-bottom bg-white hover-bg-light py-2 px-3">
    {/* Image */}
    <div className="flex-shrink-0 me-2">
      <Image
        src={product.imgUrl || '/images/product-placeholder.svg'}
        alt={product.name}
        width={32}
        height={32}
        className="rounded"
        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
      />
    </div>

    {/* Name & SKU */}
    <div className="flex-fill me-2" style={{ minWidth: '150px' }}>
      <div className="fw-bold text-dark text-truncate small">{product.name}</div>
      <small className="text-muted">SKU: {product.sku}</small>
    </div>

    {/* Category */}
    <div className="me-2" style={{ width: '80px' }}>
      <span className="badge bg-secondary text-truncate small" style={{ maxWidth: '75px' }}>
        {product.category?.name || '-'}
      </span>
    </div>

    {/* Price */}
    <div className="text-end me-2" style={{ width: '80px' }}>
      <div className="fw-bold text-success small">
        ${product.price?.toFixed(2)}
      </div>
      <small className="text-muted">+IVA</small>
    </div>

    {/* Stock */}
    <div className="text-center me-2" style={{ width: '50px' }}>
      <div className="fw-bold small">N/A</div>
      <span className="badge bg-success rounded-pill small">Activo</span>
    </div>

    {/* Actions */}
    <div className="d-flex gap-1" style={{ width: '90px' }}>
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

ProductCompactRow.displayName = 'ProductCompactRow'

export const ProductsCompact = React.memo<ProductsCompactProps>(({
  products,
  isLoading = false,
  onEdit,
  onDelete,
  onView
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Height per row for compact view
    overscan: 15,
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
          <i className="bi bi-list display-1 text-muted mb-3"></i>
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
            <i className="bi bi-list me-2 text-primary" />
            <h6 className="mb-0 fw-bold">Vista Compacta</h6>
          </div>
          <small className="text-muted">
            <i className="bi bi-lightning me-1"></i>
            Virtualizada para máximo rendimiento
          </small>
        </div>
      </div>

      {/* Header with column labels */}
      <div className="border-bottom bg-light text-muted small py-2 px-3">
        <div className="d-flex align-items-center">
          <div style={{ width: '40px' }}></div>
          <div className="flex-fill me-2" style={{ minWidth: '150px' }}>
            <strong>PRODUCTO</strong>
          </div>
          <div className="me-2" style={{ width: '80px' }}>
            <strong>CATEGORÍA</strong>
          </div>
          <div className="text-end me-2" style={{ width: '80px' }}>
            <strong>PRECIO</strong>
          </div>
          <div className="text-center me-2" style={{ width: '50px' }}>
            <strong>STOCK</strong>
          </div>
          <div style={{ width: '90px' }}>
            <strong>ACCIONES</strong>
          </div>
        </div>
      </div>

      {/* Virtualized Compact Content */}
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
            const product = products[virtualRow.index]
            return (
              <ProductCompactRow
                key={product.id}
                product={product}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`
                }}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
              />
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="card-footer bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Mostrando {products.length} productos en vista compacta
          </small>
          <small className="text-muted">
            <i className="bi bi-layers me-1"></i>
            Información esencial únicamente
          </small>
        </div>
      </div>
    </div>
  )
})

ProductsCompact.displayName = 'ProductsCompact'

export default ProductsCompact