'use client'

import React, { useState } from 'react'
import { Card, LwSurface, LwPageTitle, LwResultModal } from '@lwm/ui'
import { useNavigationProgress } from '@lwm/ui'
import { useProduct, useProductMutations } from '../hooks'
import ProductForm from '../components/ProductForm'
import type { CreateProductData, UpdateProductData } from '../types'
import { parseJsonApiErrors } from '../utils/errorHandling'

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
  // Modal de exito del Figma ("Producto registrado" / "Producto actualizado")
  const [savedId, setSavedId] = useState<string | null>(null)

  const { product, isLoading: isLoadingProduct, error: loadError } = useProduct(
    productId, 
    ['unit', 'category', 'brand', 'currency']
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

        // La fila primaria de la galeria la crea el backend al guardar el
        // producto con imgPath (ProductObserver, P1 granel 2026-10-10). Antes
        // se espejaba aqui con un catch mudo y, con el observer, duplicaria la fila.
      }

      setSavedId(result.data.id)
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

  const finish = () => {
    const id = savedId
    setSavedId(null)
    if (!id) return
    if (onSuccess) onSuccess(id)
    else navigation.push(isEditing ? `/dashboard/products/${id}` : '/dashboard/products')
  }

  return (
    <div className={className}>
      <LwSurface>
      <LwPageTitle
        title={isEditing ? 'Editar producto:' : 'Crear nuevo producto'}
        highlight={isEditing ? product?.name : undefined}
        subtitle={isEditing ? 'Comencemos verificando sus datos' : 'Comencemos ingresando sus datos'}
        actions={
          <button type="button" className="btn btn-outline-secondary" onClick={handleCancel} disabled={isSubmitting}>
            <i className="bi bi-arrow-left me-1" aria-hidden="true" /> Volver
          </button>
        }
      />

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
          <strong>
            {loadError ? 'Error al cargar el producto' : 'Error al guardar el producto'}
          </strong>
          {mutationError && (() => {
            const errors = parseJsonApiErrors(mutationError)
            return errors.length > 0 ? (
              <ul className="mb-0 mt-2">
                {errors.map((err, i) => (
                  // Solo el detail del backend: ya nombra el campo en espanol.
                  // El pointer (price, sku) es el atributo de la API y no se
                  // muestra al usuario (regla 9).
                  <li key={i}>{err.message}</li>
                ))}
              </ul>
            ) : (
              <div className="mt-1">{mutationError.message}</div>
            )
          })()}
          {loadError && <div className="mt-1">{loadError.message}</div>}
        </div>
      )}

      {(!isEditing || (isEditing && product)) && (
        <ProductForm
          product={product}
          isLoading={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
      </LwSurface>

      <LwResultModal
        open={savedId !== null}
        tone="success"
        title={isEditing ? 'Producto actualizado' : 'Producto registrado'}
        message={isEditing ? 'El producto fue editado con éxito' : 'El producto fue registrado con éxito'}
        confirmLabel="Confirmar"
        onConfirm={finish}
      />
    </div>
  )
}

export default ProductFormTemplate
