'use client'

import React from 'react'
import Image from 'next/image'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Button } from '@/ui/components/base'
import { formatPrice } from '../utils/formatting'
import type { Product } from '../types'

const COL_WIDTHS = ['70px', 'auto', '150px', '90px', '100px', '140px'] as const

interface ProductsTableVirtualizedProps {
  products: Product[]
  isLoading?: boolean
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  onView?: (product: Product) => void
}

export const ProductsTableVirtualized = React.memo<ProductsTableVirtualizedProps>(({
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
    estimateSize: () => 80,
    overscan: 10,
  })

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
          <p className="text-muted">Intenta cambiar los filtros de busqueda.</p>
        </div>
      </div>
    )
  }

  const colgroup = (
    <colgroup>
      {COL_WIDTHS.map((w, i) => <col key={i} style={w !== 'auto' ? { width: w } : undefined} />)}
    </colgroup>
  )

  return (
    <div className="card">
      <div className="table-responsive">
        <table className="table table-hover mb-0" style={{ tableLayout: 'fixed' }}>
          {colgroup}
          <thead className="table-light sticky-top">
            <tr className="text-nowrap">
              <th>Imagen</th>
              <th>Producto</th>
              <th className="text-end">Precio</th>
              <th className="text-center">Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
        </table>

        <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }} className="position-relative">
          <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
            <table className="table table-hover mb-0" style={{ tableLayout: 'fixed' }}>
              {colgroup}
              <tbody>
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const product = products[virtualItem.index]
                  return (
                    <tr
                      key={product.id}
                      data-index={virtualItem.index}
                      style={{
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        display: 'table',
                        tableLayout: 'fixed',
                      }}
                      className="hover-bg-light transition-all"
                    >
                      <td style={{ width: COL_WIDTHS[0] }}>
                        <Image
                          src={product.imgUrl || '/images/product-placeholder.svg'}
                          alt={product.name}
                          width={50}
                          height={50}
                          className="rounded border"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      </td>

                      <td>
                        <div className="fw-bold text-dark text-truncate">{product.name}</div>
                        <div className="small text-muted">SKU: {product.sku}</div>
                        <div className="small text-info text-truncate">
                          {product.category?.name} &bull; {product.brand?.name}
                        </div>
                      </td>

                      <td style={{ width: COL_WIDTHS[2] }} className="text-end">
                        <div className="fw-bold text-success">
                          {formatPrice(product.price, product.currency?.code || 'MXN')} {product.currency?.code || 'MXN'}
                          {product.iva && <span className="small text-muted ms-1">+IVA</span>}
                        </div>
                        {product.cost != null && (
                          <div className="small text-muted">Costo: {formatPrice(product.cost, product.currency?.code || 'MXN')}</div>
                        )}
                      </td>

                      <td style={{ width: COL_WIDTHS[3] }} className="text-center">
                        <div className="fw-bold">N/A</div>
                        <div className="small text-muted">{product.unit?.name}</div>
                      </td>

                      <td style={{ width: COL_WIDTHS[4] }}>
                        <span className="badge bg-success rounded-pill small">Activo</span>
                      </td>

                      <td style={{ width: COL_WIDTHS[5] }}>
                        <div className="d-flex gap-1">
                          {onView && (
                            <Button size="small" variant="primary" buttonStyle="ghost" onClick={() => onView(product)} title="Ver detalles">
                              <i className="bi bi-eye" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button size="small" variant="warning" buttonStyle="ghost" onClick={() => onEdit(product)} title="Editar">
                              <i className="bi bi-pencil" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button size="small" variant="danger" buttonStyle="ghost" onClick={() => onDelete(product.id)} title="Eliminar">
                              <i className="bi bi-trash" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card-footer bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Mostrando {products.length} productos
          </small>
          <small className="text-muted">
            <i className="bi bi-lightning me-1"></i>
            Tabla virtualizada
          </small>
        </div>
      </div>
    </div>
  )
})

ProductsTableVirtualized.displayName = 'ProductsTableVirtualized'

export default ProductsTableVirtualized