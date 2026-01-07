'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OfferForm } from '@/modules/catalog/components'
import { useOffer, useOffersMutations } from '@/modules/catalog'
import { mutate } from 'swr'

interface EditOfferPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditOfferPage({ params }: EditOfferPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const { offer, isLoading, error: fetchError } = useOffer(resolvedParams.id)
  const { updateOffer } = useOffersMutations()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: { price: number; cost?: number }) => {
    if (!offer) {
      setError('No se encontro la oferta')
      return
    }

    if (data.cost === undefined) {
      setError('El costo es requerido para actualizar una oferta')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await updateOffer(offer.productId, {
        price: data.price,
        cost: data.cost
      })

      // Invalidate offers cache
      mutate((key: unknown) => Array.isArray(key) && key[0] === 'offers')
      mutate(['offer', resolvedParams.id])

      router.push('/dashboard/catalog/offers')
    } catch (err) {
      console.error('Error updating offer:', err)
      setError(err instanceof Error ? err.message : 'Error al actualizar la oferta')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar la oferta
        </div>
        <button className="btn btn-secondary" onClick={handleCancel}>
          Volver
        </button>
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2" />
          Oferta no encontrada. El producto puede no tener una oferta activa (precio {'>'} costo).
        </div>
        <button className="btn btn-secondary" onClick={handleCancel}>
          Volver
        </button>
      </div>
    )
  }

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
                <i className="bi bi-pencil-square text-warning me-2" />
                Editar Oferta
              </h1>
              <p className="text-muted mb-0">Modificar precios de: {offer.name}</p>
            </div>
          </div>

          {/* Current Discount Info */}
          <div className="row justify-content-center mb-4">
            <div className="col-lg-8 col-xl-6">
              <div className="card bg-light border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Descuento Actual</h6>
                      <h4 className="mb-0 text-success">
                        ${offer.discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </h4>
                    </div>
                    <span className="badge bg-danger fs-5">
                      {offer.discountPercent.toFixed(0)}% OFF
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="row justify-content-center">
              <div className="col-lg-8 col-xl-6">
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
              </div>
            </div>
          )}

          {/* Form */}
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <OfferForm
                    offer={offer}
                    isLoading={isSubmitting}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
