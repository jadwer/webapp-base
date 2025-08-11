'use client'

import React from 'react'
import { Button, Card } from '@/ui/components/base'
import type { Product } from '../types'

interface ProductCardProps {
  product: Product
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
  className?: string
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onView,
  className
}) => {
  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return 'N/A'
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  const truncateText = (text: string | null | undefined, maxLength = 100) => {
    if (!text) return ''
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }


  return (
    <Card className={className}>
      <div className="position-relative">
        {product.imgPath && (
          <img 
            src={product.imgPath} 
            alt={product.name}
            className="card-img-top"
            style={{ height: 200, objectFit: 'cover' }}
          />
        )}
        
        <div className="position-absolute top-0 end-0 p-2">
          <span className="badge bg-success rounded-pill">Activo</span>
        </div>
      </div>

      <div className="card-body">
        <h5 className="card-title">{product.name}</h5>
        
        {product.sku && (
          <div className="mb-2">
            <small className="text-muted">SKU: </small>
            <code className="small">{product.sku}</code>
          </div>
        )}
        
        {product.description && (
          <p className="card-text text-muted">
            {truncateText(product.description)}
          </p>
        )}

        <div className="row mb-3">
          <div className="col-6">
            <div className="fw-bold text-primary">{formatPrice(product.price)}</div>
            {product.cost && (
              <small className="text-muted">Costo: {formatPrice(product.cost)}</small>
            )}
          </div>
          <div className="col-6 text-end">
            {product.iva && (
              <span className="badge bg-info text-dark">IVA</span>
            )}
          </div>
        </div>

        <div className="mb-3">
          <div className="row">
            <div className="col-12 mb-1">
              <small className="text-muted">Categoría:</small>
              <div>
                <span className="badge bg-secondary">
                  {product.category?.name || 'Sin categoría'}
                </span>
              </div>
            </div>
            <div className="col-12 mb-1">
              <small className="text-muted">Marca:</small>
              <div>
                <span className="badge bg-primary">
                  {product.brand?.name || 'Sin marca'}
                </span>
              </div>
            </div>
            <div className="col-12">
              <small className="text-muted">Unidad:</small>
              <div>
                <span className="badge bg-outline-secondary">
                  {product.unit?.name || 'Sin unidad'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-1">
          {onView && (
            <Button
              size="small"
              variant="secondary"
              buttonStyle="outline"
              title="Ver producto"
              onClick={() => onView(product)}
              className="flex-fill"
            >
              <i className="bi bi-eye me-1" />
              Ver
            </Button>
          )}
          
          {onEdit && (
            <Button
              size="small"
              variant="primary"
              buttonStyle="outline"
              title="Editar producto"
              onClick={() => onEdit(product)}
              className="flex-fill"
            >
              <i className="bi bi-pencil me-1" />
              Editar
            </Button>
          )}
          
          {onDelete && (
            <Button
              size="small"
              variant="danger"
              buttonStyle="outline"
              title="Eliminar producto"
              onClick={() => onDelete(product)}
            >
              <i className="bi bi-trash" />
            </Button>
          )}
        </div>

        {(product.datasheetPath) && (
          <div className="mt-2">
            <a
              href={product.datasheetPath}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-info w-100"
            >
              <i className="bi bi-file-earmark-pdf me-1" />
              Ver hoja de datos
            </a>
          </div>
        )}
      </div>
    </Card>
  )
}

export default ProductCard