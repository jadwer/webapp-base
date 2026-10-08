/**
 * PRODUCT BATCH FORM
 * Alta y edicion de lotes. Estados desde BATCH_STATUS (ProductBatchRequest).
 */

'use client'

import React, { memo, useCallback, useState } from 'react'
import { DetailSection, PageHeader } from '@lwm/ui'
import { ProductSearchSelect } from '@lwm/products'
import type {
  ProductBatch,
  ParsedProductBatch,
  CreateProductBatchRequest,
  UpdateProductBatchRequest,
  ProductBatchStatus,
  WarehouseParsed,
} from '../types'
import { useWarehouseLocationOptions } from '../hooks'
import { BATCH_STATUS } from '../utils/labels'
import { toNumber } from '../utils/format'
import { apiErrorList } from '../utils/listing'

interface ProductBatchFormProps {
  productBatch?: ProductBatch | ParsedProductBatch
  onSubmit: (data: CreateProductBatchRequest | UpdateProductBatchRequest) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  warehouses: WarehouseParsed[]
  backHref?: string
}

const toDateInput = (value?: string | null) => (value ? String(value).slice(0, 10) : '')

const toJsonText = (value: unknown) =>
  value && typeof value === 'object' && Object.keys(value).length > 0 ? JSON.stringify(value, null, 2) : ''

const parseJson = (value: string) => (value.trim() ? JSON.parse(value) : undefined)

const numberText = (value: unknown) => (value == null || value === '' ? '' : String(toNumber(value)))

export const ProductBatchForm = memo<ProductBatchFormProps>(({
  productBatch,
  onSubmit,
  onCancel,
  isLoading = false,
  warehouses,
  backHref = '/dashboard/inventory/product-batch',
}) => {
  const [formData, setFormData] = useState({
    batchNumber: productBatch?.batchNumber || '',
    lotNumber: productBatch?.lotNumber || '',
    manufacturingDate: toDateInput(productBatch?.manufacturingDate),
    expirationDate: toDateInput(productBatch?.expirationDate),
    bestBeforeDate: toDateInput(productBatch?.bestBeforeDate),
    initialQuantity: numberText(productBatch?.initialQuantity),
    currentQuantity: numberText(productBatch?.currentQuantity),
    unitCost: numberText(productBatch?.unitCost),
    status: (productBatch?.status || 'active') as ProductBatchStatus,
    supplierName: productBatch?.supplierName || '',
    supplierBatch: productBatch?.supplierBatch || '',
    qualityNotes: productBatch?.qualityNotes || '',
    productId: productBatch?.product?.id ? String(productBatch.product.id) : '',
    warehouseId: productBatch?.warehouse?.id ? String(productBatch.warehouse.id) : '',
    warehouseLocationId: productBatch?.warehouseLocation?.id ? String(productBatch.warehouseLocation.id) : '',
    testResults: toJsonText(productBatch?.testResults),
    certifications: toJsonText(productBatch?.certifications),
    metadata: toJsonText(productBatch?.metadata),
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitErrors, setSubmitErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { locations, isLoading: isLoadingLocations } = useWarehouseLocationOptions(formData.warehouseId)

  const setField = useCallback((field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'warehouseId' ? { warehouseLocationId: '' } : {}),
    }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev))
  }, [])

  const validateForm = useCallback(() => {
    const next: Record<string, string> = {}
    const initial = Number(formData.initialQuantity)
    const current = Number(formData.currentQuantity)

    if (!formData.batchNumber.trim()) next.batchNumber = 'El número de lote es obligatorio'
    if (!formData.manufacturingDate) next.manufacturingDate = 'La fecha de fabricación es obligatoria'
    if (!formData.expirationDate) next.expirationDate = 'La fecha de vencimiento es obligatoria'
    if (formData.manufacturingDate && formData.expirationDate && formData.expirationDate < formData.manufacturingDate) {
      next.expirationDate = 'El vencimiento no puede ser anterior a la fabricación'
    }
    if (formData.manufacturingDate && formData.bestBeforeDate && formData.bestBeforeDate < formData.manufacturingDate) {
      next.bestBeforeDate = 'No puede ser anterior a la fabricación'
    }
    if (formData.initialQuantity === '' || Number.isNaN(initial) || initial < 0) {
      next.initialQuantity = 'Captura una cantidad inicial válida'
    }
    if (formData.currentQuantity === '' || Number.isNaN(current) || current < 0) {
      next.currentQuantity = 'Captura una cantidad actual válida'
    } else if (!Number.isNaN(initial) && current > initial) {
      next.currentQuantity = 'No puede exceder la cantidad inicial'
    }
    if (formData.unitCost !== '' && (Number.isNaN(Number(formData.unitCost)) || Number(formData.unitCost) < 0)) {
      next.unitCost = 'El costo unitario no puede ser negativo'
    }
    if (!formData.productId) next.productId = 'Selecciona un producto'
    if (!formData.warehouseId) next.warehouseId = 'Selecciona un almacén'

    for (const field of ['testResults', 'certifications', 'metadata'] as const) {
      try {
        parseJson(formData[field])
      } catch {
        next[field] = 'JSON inválido'
      }
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }, [formData])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitErrors([])
    if (!validateForm()) return

    const data: CreateProductBatchRequest | UpdateProductBatchRequest = {
      batchNumber: formData.batchNumber.trim(),
      lotNumber: formData.lotNumber.trim() || undefined,
      manufacturingDate: formData.manufacturingDate,
      expirationDate: formData.expirationDate,
      bestBeforeDate: formData.bestBeforeDate || undefined,
      initialQuantity: Number(formData.initialQuantity),
      currentQuantity: Number(formData.currentQuantity),
      unitCost: formData.unitCost === '' ? 0 : Number(formData.unitCost),
      status: formData.status,
      supplierName: formData.supplierName.trim() || undefined,
      supplierBatch: formData.supplierBatch.trim() || undefined,
      qualityNotes: formData.qualityNotes.trim() || undefined,
      productId: formData.productId,
      warehouseId: formData.warehouseId,
      warehouseLocationId: formData.warehouseLocationId || undefined,
      testResults: parseJson(formData.testResults),
      certifications: parseJson(formData.certifications),
      metadata: parseJson(formData.metadata),
    }

    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (err) {
      setSubmitErrors(apiErrorList(err, 'No se pudo guardar el lote'))
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, onSubmit])

  const busy = isLoading || isSubmitting
  const initialProduct = productBatch?.product
    ? { id: String(productBatch.product.id), name: productBatch.product.name, sku: productBatch.product.sku }
    : null

  const invalid = (field: string) => (errors[field] ? ' is-invalid' : '')
  const feedback = (field: string) =>
    errors[field] ? <div className="invalid-feedback">{errors[field]}</div> : null

  const textInput = (field: keyof typeof formData, label: string, opts: { type?: string; required?: boolean; placeholder?: string; step?: string; min?: string } = {}) => (
    <>
      <label htmlFor={`batch-${field}`} className="form-label">
        {label}
        {opts.required && <span className="text-danger"> *</span>}
      </label>
      <input
        id={`batch-${field}`}
        type={opts.type || 'text'}
        step={opts.step}
        min={opts.min}
        placeholder={opts.placeholder}
        className={`form-control${invalid(field)}`}
        value={formData[field]}
        onChange={(e) => setField(field, e.target.value)}
        disabled={busy}
      />
      {feedback(field)}
    </>
  )

  const jsonArea = (field: 'testResults' | 'certifications' | 'metadata', label: string, placeholder: string) => (
    <>
      <label htmlFor={`batch-${field}`} className="form-label">{label}</label>
      <textarea
        id={`batch-${field}`}
        className={`form-control font-monospace small${invalid(field)}`}
        rows={4}
        placeholder={placeholder}
        value={formData[field]}
        onChange={(e) => setField(field, e.target.value)}
        disabled={busy}
      />
      {feedback(field)}
    </>
  )

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <PageHeader
            title={productBatch ? `Editar lote ${productBatch.batchNumber}` : 'Nuevo lote'}
            subtitle={productBatch ? 'Modifica la información del lote' : 'Registra un lote con fabricación, vencimiento y cantidad inicial'}
            backHref={backHref}
          />

          {submitErrors.length > 0 && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2" />
              {submitErrors.length === 1 ? submitErrors[0] : (
                <ul className="mb-0 ps-3">{submitErrors.map((msg) => <li key={msg}>{msg}</li>)}</ul>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <DetailSection title="Información del lote" icon="bi-info-circle">
              <div className="row g-3">
                <div className="col-md-6">{textInput('batchNumber', 'Número de lote', { required: true, placeholder: 'LOTE-2026-001' })}</div>
                <div className="col-md-6">{textInput('lotNumber', 'Número LOT', { placeholder: 'LOT24321196' })}</div>
                <div className="col-md-4">{textInput('manufacturingDate', 'Fabricación', { type: 'date', required: true })}</div>
                <div className="col-md-4">{textInput('expirationDate', 'Vencimiento', { type: 'date', required: true })}</div>
                <div className="col-md-4">{textInput('bestBeforeDate', 'Consumir preferentemente antes de', { type: 'date' })}</div>
                <div className="col-md-6">
                  <label htmlFor="batch-status" className="form-label">Estado</label>
                  <select
                    id="batch-status"
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setField('status', e.target.value)}
                    disabled={busy}
                  >
                    {Object.entries(BATCH_STATUS).map(([value, { label }]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Producto y ubicación" icon="bi-geo-alt">
              <div className="row g-3">
                <div className="col-12">
                  <ProductSearchSelect
                    id="batch-productId"
                    className=""
                    value={formData.productId}
                    initialProduct={initialProduct}
                    onChange={(id) => setField('productId', id)}
                    required
                    disabled={busy}
                    errorText={errors.productId}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="batch-warehouseId" className="form-label">
                    Almacén <span className="text-danger">*</span>
                  </label>
                  <select
                    id="batch-warehouseId"
                    className={`form-select${invalid('warehouseId')}`}
                    value={formData.warehouseId}
                    onChange={(e) => setField('warehouseId', e.target.value)}
                    disabled={busy}
                  >
                    <option value="">Seleccionar almacén...</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}{warehouse.code ? ` (${warehouse.code})` : ''}
                      </option>
                    ))}
                  </select>
                  {feedback('warehouseId')}
                </div>
                <div className="col-md-6">
                  <label htmlFor="batch-warehouseLocationId" className="form-label">Ubicación</label>
                  <select
                    id="batch-warehouseLocationId"
                    className="form-select"
                    value={formData.warehouseLocationId}
                    onChange={(e) => setField('warehouseLocationId', e.target.value)}
                    disabled={busy || !formData.warehouseId || isLoadingLocations}
                  >
                    <option value="">
                      {!formData.warehouseId
                        ? 'Elige primero un almacén'
                        : isLoadingLocations
                          ? 'Cargando ubicaciones...'
                          : 'Sin ubicación específica'}
                    </option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}{location.code ? ` (${location.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Cantidades y costo" icon="bi-calculator">
              <div className="row g-3">
                <div className="col-md-4">{textInput('initialQuantity', 'Cantidad inicial', { type: 'number', required: true, min: '0', step: '0.0001' })}</div>
                <div className="col-md-4">{textInput('currentQuantity', 'Cantidad actual', { type: 'number', required: true, min: '0', step: '0.0001' })}</div>
                <div className="col-md-4">{textInput('unitCost', 'Costo unitario', { type: 'number', min: '0', step: '0.01', placeholder: '0.00' })}</div>
              </div>
            </DetailSection>

            <DetailSection title="Proveedor y calidad" icon="bi-truck">
              <div className="row g-3">
                <div className="col-md-6">{textInput('supplierName', 'Proveedor')}</div>
                <div className="col-md-6">{textInput('supplierBatch', 'Lote del proveedor')}</div>
                <div className="col-12">
                  <label htmlFor="batch-qualityNotes" className="form-label">Notas de calidad</label>
                  <textarea
                    id="batch-qualityNotes"
                    className="form-control"
                    rows={3}
                    placeholder="Observaciones sobre la calidad del lote"
                    value={formData.qualityNotes}
                    onChange={(e) => setField('qualityNotes', e.target.value)}
                    disabled={busy}
                  />
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Información adicional (opcional)" icon="bi-clipboard-data">
              <div className="row g-3">
                <div className="col-md-4">{jsonArea('testResults', 'Resultados de pruebas (JSON)', '{"ph": 7.2}')}</div>
                <div className="col-md-4">{jsonArea('certifications', 'Certificaciones (JSON)', '{"ISO9001": true}')}</div>
                <div className="col-md-4">{jsonArea('metadata', 'Metadatos (JSON)', '{"inspector": "..."}')}</div>
              </div>
            </DetailSection>

            <div className="d-flex justify-content-end gap-2">
              {onCancel && (
                <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={busy}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-1" />
                    {productBatch ? 'Guardar cambios' : 'Crear lote'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
})

ProductBatchForm.displayName = 'ProductBatchForm'
