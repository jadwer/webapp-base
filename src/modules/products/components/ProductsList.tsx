'use client'

import React from 'react'
import Image from 'next/image'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Button } from '@/ui/components/base'
import type { Product } from '../types'

interface ProductsListProps {
  products: Product[]
  isLoading?: boolean
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  onView?: (product: Product) => void
}

const ProductListItem = React.memo<{
  product: Product
  style: React.CSSProperties
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  onView?: (product: Product) => void
}>(({ product, style, onEdit, onDelete, onView }) => (
  <div style={style} className="d-flex align-items-center border-bottom bg-white hover-bg-light py-3 px-3">
    {/* Image */}
    <div className="flex-shrink-0 me-3">
      <Image
        src={product.imgUrl || '/images/product-placeholder.jpg'}
        alt={product.name}
        width={80}
        height={80}
        className="rounded border"
        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
      />
    </div>

    {/* Product Details */}
    <div className="flex-fill me-3">
      {/* Name and Status */}
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h6 className="fw-bold text-dark mb-0">{product.name}</h6>
          <small className="text-muted">SKU: {product.sku}</small>
        </div>
        <span className="badge bg-success rounded-pill small">Activo</span>
      </div>

      {/* Category, Brand and Unit */}
      <div className="d-flex flex-wrap gap-2 mb-2">
        <span className="badge bg-secondary">{product.category?.name}</span>
        <span className="badge bg-primary">{product.brand?.name}</span>
        <small className="text-muted align-self-center">
          <i className="bi bi-rulers me-1" />
          {product.unit?.name}
        </small>
      </div>

      {/* Price and Stock Row */}
      <div className="row g-2">
        <div className="col-sm-6">
          <div className="d-flex justify-content-between">
            <span className="text-muted small">Precio:</span>
            <div>
              <span className="fw-bold text-success">${product.price?.toFixed(2)}</span>
              <small className="text-muted ms-1">+IVA</small>
            </div>
          </div>
        </div>
        <div className="col-sm-6">
          <div className="d-flex justify-content-between">
            <span className="text-muted small">Stock:</span>
            <span className="fw-bold">{"N/A"}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Actions */}
    <div className="d-flex flex-column gap-1" style={{ width: '50px' }}>
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

ProductListItem.displayName = 'ProductListItem'

export const ProductsList = React.memo<ProductsListProps>(({
  products,
  isLoading = false,
  onEdit,
  onDelete,
  onView
}) => {
  // console.log('🔄 ProductsList render:', products.length, 'products')

  const parentRef = React.useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Height per row for list view
    overscan: 10,
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
          <i className="bi bi-list-ul display-1 text-muted mb-3"></i>
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
            <i className="bi bi-list-ul me-2 text-primary" />
            <h6 className="mb-0 fw-bold">Vista de Lista</h6>
          </div>
          <small className="text-muted">
            <i className="bi bi-lightning me-1"></i>
            Virtualizada para máximo rendimiento
          </small>
        </div>
      </div>

      {/* Virtualized List Content */}
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
              <ProductListItem
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
            Mostrando {products.length} productos en lista
          </small>
          <small className="text-muted">
            <i className="bi bi-list-ul me-1"></i>
            Detalles expandidos
          </small>
        </div>
      </div>
    </div>
  )
})

ProductsList.displayName = 'ProductsList'

export default ProductsList