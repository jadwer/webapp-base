'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProductSelector, OfferForm } from '@/modules/catalog/components'
import { useOffersMutations, type ProductForOffer, type Offer } from '@/modules/catalog'
import { mutate } from 'swr'

export default function CreateOfferPage() {
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState<ProductForOffer | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { createOffer } = useOffersMutations()

  const handleProductSelect = (product: ProductForOffer) => {
    setSelectedProduct(product)
    setError(null)
  }

  const handleSubmit = async (data: { price: number; cost?: number }) => {
    if (!selectedProduct) {
      setError('Por favor selecciona un producto')
      return
    }

    if (data.cost === undefined) {
      setError('El costo es requerido para crear una oferta')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await createOffer({
        productId: selectedProduct.id,
        price: data.price,
        cost: data.cost
      })

      // Invalidate offers cache
      mutate((key: unknown) => Array.isArray(key) && key[0] === 'offers')

      router.push('/dashboard/catalog/offers')
    } catch (err) {
      console.error('Error creating offer:', err)
      setError(err instanceof Error ? err.message : 'Error al crear la oferta')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (selectedProduct) {
      setSelectedProduct(null)
    } else {
      router.back()
    }
  }

  // Convert ProductForOffer to the format OfferForm expects
  const offerForForm: Offer | undefined = selectedProduct ? {
    id: selectedProduct.id,
    productId: selectedProduct.id,
    name: selectedProduct.name,
    description: null,
    sku: selectedProduct.sku,
    price: selectedProduct.price ?? 0,
    cost: selectedProduct.cost ?? 0,
    discount: 0,
    discountPercent: 0,
    isActive: true,
    imgPath: null,
    category: selectedProduct.category,
    brand: selectedProduct.brand,
    createdAt: '',
    updatedAt: ''
  } : undefined

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-link p-0 me-3 text-decoration-none"
              title="Volver"
            >
              <i className="bi bi-arrow-left fs-4 text-muted" />
            </button>
            <div>
              <h1 className="h3 mb-0 fw-bold">
                <i className="bi bi-percent text-success me-2" />
                Nueva Oferta
              </h1>
              <p className="text-muted mb-0">
                {selectedProduct
                  ? `Configurar oferta para: ${selectedProduct.name}`
                  : 'Selecciona un producto para crear una oferta'
                }
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle me-2" />
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
                aria-label="Close"
              />
            </div>
          )}

          {/* Content */}
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  {!selectedProduct ? (
                    // Step 1: Select Product
                    <>
                      <h5 className="card-title mb-4">
                        <i className="bi bi-1-circle me-2 text-primary" />
                        Seleccionar Producto
                      </h5>
                      <ProductSelector
                        onSelect={handleProductSelect}
                        onCancel={handleCancel}
                      />
                    </>
                  ) : (
                    // Step 2: Configure Offer
                    <>
                      <h5 className="card-title mb-4">
                        <i className="bi bi-2-circle me-2 text-primary" />
                        Configurar Precios
                      </h5>
                      <OfferForm
                        offer={offerForForm}
                        isLoading={isSubmitting}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="row justify-content-center mt-4">
            <div className="col-lg-8 col-xl-6">
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2" />
                <strong>Como funciona:</strong> Una oferta se crea cuando el precio de venta es mayor
                que el costo del producto. El descuento se calcula automaticamente como la diferencia
                entre precio y costo.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
