'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DetailSection, PageHeader, toast } from '@lwm/ui'
import { ProductSearchSelect } from '@lwm/products'
import { useProductConversionsMutations, useProductConversion } from '../hooks/useProductConversions'
import { FormStateCard } from './FormStateCard'
import { apiErrorList } from '../utils/listing'
import type { CreateProductConversionData, UpdateProductConversionData } from '../types/productConversion'

interface ProductConversionFormProps {
  conversionId?: string
}

const LIST_HREF = '/dashboard/inventory/product-conversions'

export const ProductConversionForm = ({ conversionId }: ProductConversionFormProps) => {
  const router = useRouter()
  const isEditing = !!conversionId
  const { conversion, isLoading: isLoadingConversion, error: loadError } = useProductConversion(
    conversionId || null,
    ['sourceProduct', 'destinationProduct']
  )
  const { createConversion, updateConversion } = useProductConversionsMutations()

  const [formData, setFormData] = useState({
    sourceProductId: '',
    destinationProductId: '',
    conversionFactor: '',
    wastePercentage: '0',
    isActive: true,
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Populate form when editing
  useEffect(() => {
    if (conversion && isEditing) {
      setFormData({
        sourceProductId: String(conversion.sourceProductId || ''),
        destinationProductId: String(conversion.destinationProductId || ''),
        conversionFactor: String(conversion.conversionFactor || ''),
        wastePercentage: String(conversion.wastePercentage || '0'),
        isActive: conversion.isActive !== false,
        notes: conversion.notes || '',
      })
    }
  }, [conversion, isEditing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const missing: string[] = []
    if (!formData.sourceProductId) missing.push('Selecciona el producto origen')
    if (!formData.destinationProductId) missing.push('Selecciona el producto destino')
    if (formData.sourceProductId && formData.sourceProductId === formData.destinationProductId) {
      missing.push('El producto destino debe ser distinto al origen')
    }
    if (!(Number(formData.conversionFactor) > 0)) missing.push('El factor de conversión debe ser mayor a cero')
    const waste = Number(formData.wastePercentage)
    if (Number.isNaN(waste) || waste < 0 || waste > 100) missing.push('La merma debe estar entre 0 y 100')
    setErrors(missing)
    if (missing.length > 0) return
    setIsSubmitting(true)

    try {
      if (isEditing && conversionId) {
        const updateData: UpdateProductConversionData = {
          sourceProductId: Number(formData.sourceProductId),
          destinationProductId: Number(formData.destinationProductId),
          conversionFactor: Number(formData.conversionFactor),
          wastePercentage: Number(formData.wastePercentage),
          isActive: formData.isActive,
          notes: formData.notes || undefined,
        }
        await updateConversion(conversionId, updateData)
        toast.success('Conversión actualizada')
      } else {
        const createData: CreateProductConversionData = {
          sourceProductId: Number(formData.sourceProductId),
          destinationProductId: Number(formData.destinationProductId),
          conversionFactor: Number(formData.conversionFactor),
          wastePercentage: Number(formData.wastePercentage),
          isActive: formData.isActive,
          notes: formData.notes || undefined,
        }
        await createConversion(createData)
        toast.success('Conversión creada')
      }
      router.push(LIST_HREF)
    } catch (err) {
      setErrors(apiErrorList(err, 'No se pudo guardar la conversión'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isEditing && isLoadingConversion) {
    return <FormStateCard state="loading" title="Editar conversión" backHref={LIST_HREF} message="Cargando conversión..." />
  }
  if (isEditing && loadError) {
    return <FormStateCard state="error" title="Editar conversión" backHref={LIST_HREF} message={loadError.message || 'No se pudo cargar la conversión.'} />
  }
  if (isEditing && !conversion) {
    return <FormStateCard state="not-found" title="Editar conversión" backHref={LIST_HREF} icon="bi-arrow-repeat" message="La conversión no existe o no está disponible." />
  }

  const factor = Number(formData.conversionFactor)
  const wastePct = Number(formData.wastePercentage)
  const sourceInitial = conversion?.sourceProduct
    ? { id: String(conversion.sourceProduct.id), name: conversion.sourceProduct.name, sku: conversion.sourceProduct.sku }
    : null
  const destinationInitial = conversion?.destinationProduct
    ? { id: String(conversion.destinationProduct.id), name: conversion.destinationProduct.name, sku: conversion.destinationProduct.sku }
    : null

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <PageHeader
            title={isEditing ? 'Editar conversión' : 'Nueva conversión'}
            subtitle={isEditing ? 'Modifica la conversión entre productos' : 'Define cuántas unidades destino salen de una unidad origen'}
            backHref={LIST_HREF}
          />

          {errors.length > 0 && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2" />
              {errors.length === 1 ? errors[0] : (
                <ul className="mb-0 ps-3">{errors.map((msg) => <li key={msg}>{msg}</li>)}</ul>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <DetailSection title="Productos" icon="bi-arrow-repeat">
              <div className="row g-3">
                <div className="col-md-6">
                  <ProductSearchSelect
                    id="conversion-source"
                    className=""
                    label="Producto origen"
                    value={formData.sourceProductId}
                    initialProduct={sourceInitial}
                    onChange={(id) => setFormData((prev) => ({ ...prev, sourceProductId: id }))}
                    excludeIds={[formData.destinationProductId]}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-md-6">
                  <ProductSearchSelect
                    id="conversion-destination"
                    className=""
                    label="Producto destino"
                    value={formData.destinationProductId}
                    initialProduct={destinationInitial}
                    onChange={(id) => setFormData((prev) => ({ ...prev, destinationProductId: id }))}
                    excludeIds={[formData.sourceProductId]}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Conversión" icon="bi-calculator">
              <div className="row g-3">
                <div className="col-md-4">
                  <label htmlFor="conversion-factor" className="form-label">
                    Factor de conversión <span className="text-danger">*</span>
                  </label>
                  <input
                    id="conversion-factor"
                    type="number"
                    className="form-control"
                    value={formData.conversionFactor}
                    onChange={(e) => setFormData((prev) => ({ ...prev, conversionFactor: e.target.value }))}
                    step="0.0001"
                    min="0.0001"
                    placeholder="10"
                    disabled={isSubmitting}
                  />
                  <div className="form-text">Unidades destino por cada unidad origen</div>
                </div>
                <div className="col-md-4">
                  <label htmlFor="conversion-waste" className="form-label">Merma</label>
                  <div className="input-group">
                    <input
                      id="conversion-waste"
                      type="number"
                      className="form-control"
                      value={formData.wastePercentage}
                      onChange={(e) => setFormData((prev) => ({ ...prev, wastePercentage: e.target.value }))}
                      step="0.01"
                      min="0"
                      max="100"
                      disabled={isSubmitting}
                    />
                    <span className="input-group-text">%</span>
                  </div>
                  <div className="form-text">Pérdida esperada</div>
                </div>
                <div className="col-md-4">
                  <label className="form-label d-block">Estado</label>
                  <div className="form-check form-switch mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                      id="conversion-isActive"
                      disabled={isSubmitting}
                    />
                    <label className="form-check-label" htmlFor="conversion-isActive">
                      {formData.isActive ? 'Activa' : 'Inactiva'}
                    </label>
                  </div>
                </div>
                {factor > 0 && (
                  <div className="col-12">
                    <div className="alert alert-info mb-0">
                      <i className="bi bi-calculator me-2" />
                      1 unidad origen = {factor} unidades destino
                      {wastePct > 0 && (
                        <> (producción neta {(factor * (1 - wastePct / 100)).toFixed(4)}, merma {(factor * wastePct / 100).toFixed(4)})</>
                      )}
                    </div>
                  </div>
                )}
                <div className="col-12">
                  <label htmlFor="conversion-notes" className="form-label">Notas</label>
                  <textarea
                    id="conversion-notes"
                    className="form-control"
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </DetailSection>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => router.push(LIST_HREF)}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-1" />
                    {isEditing ? 'Guardar cambios' : 'Crear conversión'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
