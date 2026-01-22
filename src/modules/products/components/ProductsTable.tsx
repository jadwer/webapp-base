'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import { Button } from '@/ui/components/base'
import ConfirmModal, { ConfirmModalHandle } from '@/ui/ConfirmModal'
import { formatDate, formatPrice } from '../utils'
import type { Product } from '../types'

interface ProductsTableProps {
  products: Product[]
  isLoading?: boolean
  showActions?: boolean
  showImages?: boolean
  showStatus?: boolean
  showDescription?: boolean
  showAdvancedInfo?: boolean
  variant?: 'admin' | 'public' | 'compact'
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => Promise<void>
  onDuplicate?: (productId: string) => Promise<void>
  onView?: (product: Product) => void
  onAddToCart?: (product: Product) => void
  className?: string
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  isLoading = false,
  // showActions = true,     // TODO: Implement in future refactor
  // showImages = true,      // TODO: Implement in future refactor
  // showStatus = true,      // TODO: Implement in future refactor
  // showDescription = false,// TODO: Implement in future refactor
  // showAdvancedInfo = true,// TODO: Implement in future refactor
  // variant = 'admin',      // TODO: Implement in future refactor
  onEdit,
  onDelete,
  onDuplicate,
  onView,
  // onAddToCart,           // TODO: Implement in future refactor
  // className = ''         // TODO: Implement in future refactor
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const setProductLoading = (productId: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [productId]: loading }))
  }

  const handleDelete = async (product: Product) => {
    if (!onDelete || !confirmModalRef.current) return

    const confirmed = await confirmModalRef.current.confirm(
      `¿Estás seguro de que quieres eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`
    )

    if (confirmed) {
      setProductLoading(product.id, true)
      try {
        await onDelete(product.id)
      } finally {
        setProductLoading(product.id, false)
      }
    }
  }

  const handleDuplicate = async (product: Product) => {
    if (!onDuplicate) return
    
    setProductLoading(product.id, true)
    try {
      await onDuplicate(product.id)
    } finally {
      setProductLoading(product.id, false)
    }
  }

  const truncateText = (text: string | null | undefined, maxLength = 50) => {
    if (!text) return ''
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }


  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando productos...</span>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center p-5">
        <i className="bi bi-box-seam display-1 text-muted mb-3"></i>
        <h5 className="text-muted">No hay productos disponibles</h5>
        <p className="text-muted">Crea tu primer producto para comenzar</p>
      </div>
    )
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th scope="col">Producto</th>
              <th scope="col">SKU</th>
              <th scope="col">Precio</th>
              <th scope="col">Categoría</th>
              <th scope="col">Marca</th>
              <th scope="col">Estado</th>
              <th scope="col">Creado</th>
              <th scope="col" className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isProductLoading = loadingStates[product.id] || false
              
              return (
                <tr key={product.id} className={clsx({ 'opacity-50': isProductLoading })}>
                  <td>
                    <div className="d-flex align-items-center">
                      {product.imgUrl && (
                        <Image
                          src={product.imgUrl}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="me-3 rounded"
                          style={{ width: 40, height: 40, objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <div className="fw-medium">{truncateText(product.name)}</div>
                        {product.description && (
                          <small className="text-muted">{truncateText(product.description, 30)}</small>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    {product.sku ? (
                      <code className="small">{product.sku}</code>
                    ) : (
                      <span className="text-muted">Sin SKU</span>
                    )}
                  </td>
                  <td>
                    <div className="fw-medium">{formatPrice(product.price)}</div>
                    {product.cost && (
                      <small className="text-muted">Costo: {formatPrice(product.cost)}</small>
                    )}
                    {product.iva && (
                      <small className="badge bg-info text-dark ms-1">IVA</small>
                    )}
                  </td>
                  <td>
                    <span className="badge bg-secondary">
                      {product.category?.name || 'Sin categoría'}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-primary">
                      {product.brand?.name || 'Sin marca'}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-success rounded-pill">Activo</span>
                  </td>
                  <td className="text-muted small">
                    {formatDate(product.createdAt)}
                  </td>
                  <td>
                    <div className="d-flex justify-content-end gap-1">
                      {onView && (
                        <Button
                          size="small"
                          variant="secondary"
                          buttonStyle="outline"
                          title="Ver producto"
                          onClick={() => onView(product)}
                          disabled={isProductLoading}
                        >
                          <i className="bi bi-eye" />
                        </Button>
                      )}
                      
                      {onEdit && (
                        <Button
                          size="small"
                          variant="primary"
                          buttonStyle="outline"
                          title="Editar producto"
                          onClick={() => onEdit(product)}
                          disabled={isProductLoading}
                        >
                          <i className="bi bi-pencil" />
                        </Button>
                      )}
                      
                      {onDuplicate && (
                        <Button
                          size="small"
                          variant="secondary"
                          buttonStyle="outline"
                          title="Duplicar producto"
                          onClick={() => handleDuplicate(product)}
                          disabled={isProductLoading}
                          loading={isProductLoading}
                        >
                          <i className="bi bi-files" />
                        </Button>
                      )}
                      
                      {onDelete && (
                        <Button
                          size="small"
                          variant="danger"
                          buttonStyle="outline"
                          title="Eliminar producto"
                          onClick={() => handleDelete(product)}
                          disabled={isProductLoading}
                        >
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
      
      <ConfirmModal ref={confirmModalRef} />
    </>
  )
}

export default ProductsTable