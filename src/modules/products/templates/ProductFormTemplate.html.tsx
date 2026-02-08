'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Card, Button } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { useProduct, useProductMutations } from '../hooks'
import ProductForm from '../components/ProductForm'
import type { CreateProductData, UpdateProductData } from '../types'

interface ProductFormTemplateProps {
  productId?: string
  isEditing?: boolean
  onSuccess?: (productId: string) => void
  onCancel?: () => void
  className?: string
}

export const ProductFormTemplate: React.FC<ProductFormTemplateProps> = ({
  productId,
  isEditing = false,
  onSuccess,
  onCancel,
  className
}) => {
  const navigation = useNavigationProgress()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { product, isLoading: isLoadingProduct, error: loadError } = useProduct(
    productId, 
    ['unit', 'category', 'brand']
  )
  
  const { createProduct, updateProduct, error: mutationError } = useProductMutations()

  const handleSubmit = async (data: CreateProductData | UpdateProductData) => {
    setIsSubmitting(true)
    
    try {
      let result
      
      if (isEditing && productId) {
        result = await updateProduct(productId, data as UpdateProductData)
      } else {
        result = await createProduct(data as CreateProductData)
      }
      
      if (onSuccess) {
        onSuccess(result.data.id)
      } else {
        navigation.push('/dashboard/products')
      }
    } catch {
      // Error handled by service layer
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      navigation.back()
    }
  }

  const pageTitle = isEditing ? 'Editar Producto' : 'Crear Producto'
  const pageDescription = isEditing 
    ? 'Modifica los datos del producto existente'
    : 'Completa los datos para crear un nuevo producto'

  return (
    <div className={className}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <Button
              size="small"
              variant="secondary"
              buttonStyle="ghost"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <i className="bi bi-arrow-left me-1" />
              Volver
            </Button>
          </div>
          <h1 className="h3 mb-1">{pageTitle}</h1>
          <p className="text-muted mb-0">{pageDescription}</p>
        </div>

        {isEditing && product && (
          <div className="d-flex align-items-center gap-2">
            <div className="text-end">
              <div className="fw-medium">{product.name}</div>
              {product.sku && (
                <small className="text-muted">SKU: {product.sku}</small>
              )}
            </div>
            {product.imgUrl && (
              <Image
                src={product.imgUrl}
                alt={product.name}
                width={48}
                height={48}
                className="rounded"
                style={{ width: 48, height: 48, objectFit: 'cover' }}
              />
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoadingProduct && isEditing && (
        <Card>
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Cargando producto...</span>
            </div>
            <p className="text-muted mb-0">Cargando datos del producto...</p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {(loadError || mutationError) && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          {loadError ? 'Error al cargar el producto' : 'Error al guardar el producto'}
          {loadError?.message || mutationError?.message}
        </div>
      )}

      {/* Form Card */}
      {(!isEditing || (isEditing && product)) && (
        <Card>
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-box-seam me-2" />
              {isEditing ? 'Datos del Producto' : 'Nuevo Producto'}
            </h5>
          </div>

          <div className="card-body">
            <ProductForm
              product={product}
              isLoading={isSubmitting}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        </Card>
      )}

      {/* Help Card */}
      <Card className="mt-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="bi bi-info-circle me-2" />
            Información adicional
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6 className="fw-bold">Campos obligatorios:</h6>
              <ul className="mb-0">
                <li>Nombre del producto</li>
                <li>Unidad de medida</li>
                <li>Categoría</li>
                <li>Marca</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6 className="fw-bold">Consejos:</h6>
              <ul className="mb-0">
                <li>El SKU debe ser único si se especifica</li>
                <li>Los precios deben ser números válidos</li>
                <li>Las imágenes mejoran la presentación</li>
                <li>La descripción completa ayuda a los usuarios</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ProductFormTemplate