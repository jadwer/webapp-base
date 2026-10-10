'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DetailSection, PageHeader, toast } from '@lwm/ui'
import { ProductSearchSelect } from '@lwm/products'
import { useProductConversionsMutations, useProductConversion } from '../hooks/useProductConversions'
import { FormStateCard } from './FormStateCard'
import { apiErrorList } from '../utils/listing'
import { useProductUnit } from '../hooks/useProductUnit'
import { SOURCE_UNIT, contentUnitOptions, factorFromContent, roundFactor } from '../utils/fractionation'
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
    wholeUnits: false,
    isActive: true,
    notes: '',
  })
  // Ayudante "contenido por pieza": calcula el factor sin hacer la division a mano
  const [content, setContent] = useState('')
  const [contentUnit, setContentUnit] = useState(SOURCE_UNIT)
  const { unit: sourceUnit } = useProductUnit(formData.sourceProductId || null)
  const { unit: destinationUnit } = useProductUnit(formData.destinationProductId || null)
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
        wholeUnits: conversion.wholeUnits === true,
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
    else if (roundFactor(Number(formData.conversionFactor)) !== Number(formData.conversionFactor)) {
      missing.push('El factor de conversión admite hasta 6 decimales')
    }
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
          wholeUnits: formData.wholeUnits,
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
          wholeUnits: formData.wholeUnits,
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
  const sourceUnitLabel = sourceUnit?.name || 'unidad origen'
  const destinationUnitLabel = destinationUnit?.name || 'unidades destino'
  const unitOptions = contentUnitOptions(sourceUnit)
  const helperFactor = factorFromContent(Number(content), contentUnit, sourceUnit?.code)
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
                  {sourceUnit && (
                    <div className="form-text" data-testid="source-unit">
                      Unidad: {sourceUnit.name} ({sourceUnit.code})
                    </div>
                  )}
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
                  {destinationUnit && (
                    <div className="form-text" data-testid="destination-unit">
                      Unidad: {destinationUnit.name} ({destinationUnit.code})
                    </div>
                  )}
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
                    step="0.000001"
                    min="0.000001"
                    placeholder="10"
                    disabled={isSubmitting}
                  />
                  <div className="form-text">
                    {destinationUnitLabel} por cada {sourceUnitLabel} (hasta 6 decimales)
                  </div>
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
                <div className="col-12">
                  <div className="border rounded p-3" data-testid="content-helper">
                    <div className="fw-semibold mb-2">
                      <i className="bi bi-magic me-1" />
                      Calcular el factor por contenido de cada pieza
                    </div>
                    <div className="row g-2 align-items-end">
                      <div className="col-sm-4">
                        <label htmlFor="conversion-content" className="form-label small mb-1">Contenido por pieza</label>
                        <input
                          id="conversion-content"
                          type="number"
                          className="form-control"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          min="0"
                          step="any"
                          placeholder="25"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="col-sm-4">
                        <label htmlFor="conversion-content-unit" className="form-label small mb-1">Unidad del contenido</label>
                        <select
                          id="conversion-content-unit"
                          className="form-select"
                          value={contentUnit}
                          onChange={(e) => setContentUnit(e.target.value)}
                          disabled={isSubmitting}
                        >
                          {unitOptions.map((o) => (
                            <option key={o.code} value={o.code}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-sm-4">
                        <button
                          type="button"
                          className="btn btn-outline-primary w-100"
                          disabled={isSubmitting || helperFactor === null}
                          onClick={() => helperFactor !== null && setFormData((prev) => ({ ...prev, conversionFactor: String(helperFactor) }))}
                        >
                          {helperFactor !== null ? `Usar factor ${helperFactor}` : 'Usar factor'}
                        </button>
                      </div>
                    </div>
                    <div className="form-text">
                      Ejemplo: granel en litros y pieza de 25 ml da factor 40. Si capturas en la unidad del origen
                      (por ejemplo 3.785 L por galón) se usa el inverso.
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={formData.wholeUnits}
                      onChange={(e) => setFormData((prev) => ({ ...prev, wholeUnits: e.target.checked }))}
                      id="conversion-wholeUnits"
                      disabled={isSubmitting}
                    />
                    <label className="form-check-label" htmlFor="conversion-wholeUnits">
                      Solo piezas completas
                    </label>
                  </div>
                  <div className="form-text">
                    Redondea lo producido hacia abajo y solo saca del granel lo necesario para esas piezas; el sobrante se queda en el granel.
                  </div>
                </div>
                {factor > 0 && (
                  <div className="col-12">
                    <div className="alert alert-info mb-0">
                      <i className="bi bi-calculator me-2" />
                      1 {sourceUnitLabel} = {factor} {destinationUnitLabel}
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
