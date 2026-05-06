'use client'

import React, { useState, useEffect } from 'react'
import { Button, Input } from '@/ui/components/base'
import type { Offer } from '../types'

interface OfferFormProps {
  offer?: Offer
  isLoading?: boolean
  onSubmit: (data: { price: number; cost?: number }) => Promise<void>
  onCancel?: () => void
}

export const OfferForm: React.FC<OfferFormProps> = ({
  offer,
  isLoading = false,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    price: offer?.price?.toString() || '',
    cost: offer?.cost?.toString() || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (offer) {
      setFormData({
        price: offer.price?.toString() || '',
        cost: offer.cost?.toString() || '',
      })
    }
  }, [offer])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    const price = parseFloat(formData.price)
    const cost = parseFloat(formData.cost)

    if (!formData.price.trim() || isNaN(price)) {
      newErrors.price = 'El precio es requerido'
    } else if (price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0'
    }

    if (formData.cost.trim() && !isNaN(cost)) {
      if (cost < 0) {
        newErrors.cost = 'El costo no puede ser negativo'
      } else if (cost >= price) {
        newErrors.cost = 'El costo debe ser menor que el precio para crear una oferta'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    setTouched(allTouched)

    if (!validateForm()) return

    const submitData = {
      price: parseFloat(formData.price),
      cost: formData.cost.trim() ? parseFloat(formData.cost) : undefined,
    }

    await onSubmit(submitData)
  }

  // Calculate discount preview
  const price = parseFloat(formData.price) || 0
  const cost = parseFloat(formData.cost) || 0
  const discount = price > cost && cost > 0 ? price - cost : 0
  const discountPercent = price > 0 && discount > 0 ? (discount / price) * 100 : 0

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      <div className="row">
        <div className="col-lg-8">
          {/* Product Info (Read-only) */}
          {offer && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-box me-2"></i>
                  Informacion del Producto
                </h5>
              </div>
              <div className="card-body">
                <dl className="row mb-0">
                  <dt className="col-sm-3">Nombre</dt>
                  <dd className="col-sm-9">{offer.name}</dd>

                  {offer.sku && (
                    <>
                      <dt className="col-sm-3">SKU</dt>
                      <dd className="col-sm-9"><code>{offer.sku}</code></dd>
                    </>
                  )}

                  {offer.description && (
                    <>
                      <dt className="col-sm-3">Descripcion</dt>
                      <dd className="col-sm-9">{offer.description}</dd>
                    </>
                  )}

                  {offer.category && (
                    <>
                      <dt className="col-sm-3">Categoria</dt>
                      <dd className="col-sm-9">
                        <span className="badge bg-secondary">{offer.category.name}</span>
                      </dd>
                    </>
                  )}

                  {offer.brand && (
                    <>
                      <dt className="col-sm-3">Marca</dt>
                      <dd className="col-sm-9">
                        <span className="badge bg-primary">{offer.brand.name}</span>
                      </dd>
                    </>
                  )}

                  {offer.unit && (
                    <>
                      <dt className="col-sm-3">Unidad</dt>
                      <dd className="col-sm-9">{offer.unit.name} ({offer.unit.abbreviation})</dd>
                    </>
                  )}
                </dl>
              </div>
            </div>
          )}

          {/* Price Settings */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-tag me-2"></i>
                Configuracion de Precios
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <Input
                    label="Precio de Venta"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    onBlur={() => handleBlur('price')}
                    errorText={touched.price ? errors.price : ''}
                    required
                    step="0.01"
                    min="0"
                    leftIcon="bi-currency-dollar"
                    helpText="Este es el precio que vera el cliente"
                    disabled={isLoading}
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label="Costo (opcional)"
                    type="number"
                    value={formData.cost}
                    onChange={(e) => handleInputChange('cost', e.target.value)}
                    onBlur={() => handleBlur('cost')}
                    errorText={touched.cost ? errors.cost : ''}
                    step="0.01"
                    min="0"
                    leftIcon="bi-currency-dollar"
                    helpText="Si el costo es menor al precio, se mostrara como oferta"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Offer Preview */}
              {discount > 0 && (
                <div className="alert alert-success mt-4 mb-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="alert-heading mb-1">
                        <i className="bi bi-check-circle me-2"></i>
                        Vista previa de la oferta
                      </h6>
                      <p className="mb-0">
                        El cliente ahorrara <strong>${discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                      </p>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-danger fs-5">
                        {discountPercent.toFixed(0)}% OFF
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* Actions Card */}
          <div className="card sticky-top" style={{ top: '1rem' }}>
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-check2-circle me-2"></i>
                Acciones
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  <i className="bi bi-check-lg me-2" />
                  {offer ? 'Actualizar Oferta' : 'Crear Oferta'}
                </Button>
                {onCancel && (
                  <Button
                    type="button"
                    variant="secondary"
                    buttonStyle="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

export default OfferForm
