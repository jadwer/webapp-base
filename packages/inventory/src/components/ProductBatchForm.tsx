/**
 * PRODUCT BATCH FORM
 * Alta y edicion de lotes con la piel del rediseno (Figma Inventario, 2026-11-15).
 * Estados desde BATCH_STATUS (ProductBatchRequest).
 *
 * Decision de Gabino (2026-11-16): las cantidades del lote salen de los movimientos.
 * Al crear, "Cantidad que entra" se registra como una entrada ligada al lote (backend).
 * Al editar, cantidades, costo, producto y almacen son de solo lectura; se cambian con una
 * entrada o un ajuste del lote en Movimientos.
 */

'use client'

import React, { memo, useCallback, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { DetailSection, LwSurface, LwPageTitle } from '@lwm/ui'
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
import { formatMoney, formatQty, toNumber } from '../utils/format'
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

/** Alta de movimiento con el lote, su producto y su almacen ya elegidos. */
export const batchMovementHref = (batch: { id: string | number; product?: { id?: unknown } | null; warehouse?: { id?: unknown } | null; warehouseLocation?: { id?: unknown } | null }, type: 'entry' | 'exit' | 'adjustment') => {
  const params = new URLSearchParams({ type, batchId: String(batch.id) })
  if (batch.product?.id != null) params.set('productId', String(batch.product.id))
  if (batch.warehouse?.id != null) params.set('warehouseId', String(batch.warehouse.id))
  if (batch.warehouseLocation?.id != null) params.set('locationId', String(batch.warehouseLocation.id))
  return `/dashboard/inventory/movements/create?${params.toString()}`
}

const ReadOnly = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <span className="form-label d-block">{label}</span>
    <div className="form-control bg-light">{children}</div>
  </div>
)

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
    const isEdit = Boolean(productBatch)

    if (!formData.batchNumber.trim()) next.batchNumber = 'El número de lote es obligatorio'
    if (!formData.manufacturingDate) next.manufacturingDate = 'La fecha de fabricación es obligatoria'
    if (!formData.expirationDate) next.expirationDate = 'La fecha de vencimiento es obligatoria'
    if (formData.manufacturingDate && formData.expirationDate && formData.expirationDate < formData.manufacturingDate) {
      next.expirationDate = 'El vencimiento no puede ser anterior a la fabricación'
    }
    if (formData.manufacturingDate && formData.bestBeforeDate && formData.bestBeforeDate < formData.manufacturingDate) {
      next.bestBeforeDate = 'No puede ser anterior a la fabricación'
    }
    if (!isEdit) {
      if (formData.initialQuantity !== '' && (Number.isNaN(initial) || initial < 0)) {
        next.initialQuantity = 'La cantidad no puede ser negativa'
      }
      if (formData.unitCost !== '' && (Number.isNaN(Number(formData.unitCost)) || Number(formData.unitCost) < 0)) {
        next.unitCost = 'El costo unitario no puede ser negativo'
      }
      if (!formData.productId) next.productId = 'Selecciona un producto'
      if (!formData.warehouseId) next.warehouseId = 'Selecciona un almacén'
    }

    for (const field of ['testResults', 'certifications', 'metadata'] as const) {
      try {
        parseJson(formData[field])
      } catch {
        next[field] = 'JSON inválido'
      }
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }, [formData, productBatch])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitErrors([])
    if (!validateForm()) return

    const common = {
      batchNumber: formData.batchNumber.trim(),
      lotNumber: formData.lotNumber.trim() || undefined,
      manufacturingDate: formData.manufacturingDate,
      expirationDate: formData.expirationDate,
      bestBeforeDate: formData.bestBeforeDate || undefined,
      status: formData.status,
      supplierName: formData.supplierName.trim() || undefined,
      supplierBatch: formData.supplierBatch.trim() || undefined,
      qualityNotes: formData.qualityNotes.trim() || undefined,
      testResults: parseJson(formData.testResults),
      certifications: parseJson(formData.certifications),
      metadata: parseJson(formData.metadata),
    }
    // Al editar no viajan cantidades, costo, producto ni almacen: los mueven los movimientos
    const data: CreateProductBatchRequest | UpdateProductBatchRequest = productBatch
      ? common
      : {
          ...common,
          initialQuantity: formData.initialQuantity === '' ? 0 : Number(formData.initialQuantity),
          unitCost: formData.unitCost === '' ? 0 : Number(formData.unitCost),
          productId: formData.productId,
          warehouseId: formData.warehouseId,
          warehouseLocationId: formData.warehouseLocationId || undefined,
        } as CreateProductBatchRequest

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
      <LwSurface>
          <LwPageTitle
            title={productBatch ? 'Editar lote:' : 'Nuevo lote'}
            highlight={productBatch?.batchNumber}
            subtitle={productBatch ? 'Datos, proveedor y calidad del lote; sus cantidades se mueven con movimientos' : 'Registra un lote con fabricación, vencimiento y lo que entra'}
            actions={
              <Link href={backHref} className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-1" aria-hidden="true" /> Volver
              </Link>
            }
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
            <DetailSection title="Datos generales" icon="bi-info-circle">
              <div className="row g-3">
                <div className="col-md-6">{textInput('batchNumber', 'Lote interno', { required: true, placeholder: 'LOTE-2026-001' })}
                  <div className="form-text">El folio con el que se identifica en el almacén.</div></div>
                <div className="col-md-6">{textInput('lotNumber', 'Lote del fabricante', { placeholder: 'LOT24321196' })}
                  <div className="form-text">El LOT impreso en el envase; con él se rastrea un retiro.</div></div>
                <div className="col-md-4">{textInput('manufacturingDate', 'Fabricación', { type: 'date', required: true })}</div>
                <div className="col-md-4">{textInput('expirationDate', 'Vencimiento', { type: 'date', required: true })}</div>
                <div className="col-md-4">{textInput('bestBeforeDate', 'Consumir preferentemente antes de', { type: 'date' })}</div>
                <div className="col-md-6">
                  <label htmlFor="batch-status" className="form-label">Estatus</label>
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

            {productBatch ? (
              <DetailSection title="Producto y ubicación" icon="bi-geo-alt">
                <div className="row g-3">
                  <div className="col-md-6">
                    <ReadOnly label="Producto">
                      {productBatch.product?.name ?? '—'}
                      {productBatch.product?.sku ? <span className="text-muted ms-2">{productBatch.product.sku}</span> : null}
                    </ReadOnly>
                  </div>
                  <div className="col-md-3"><ReadOnly label="Almacén">{productBatch.warehouse?.name ?? '—'}</ReadOnly></div>
                  <div className="col-md-3"><ReadOnly label="Ubicación">{productBatch.warehouseLocation?.name ?? 'Sin ubicación específica'}</ReadOnly></div>
                  <div className="col-12 form-text mt-0">Para llevar el lote a otro almacén registra una transferencia en Movimientos.</div>
                </div>
              </DetailSection>
            ) : (
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
            )}

            {productBatch ? (
              <DetailSection
                title="Existencias del lote"
                icon="bi-calculator"
                headerActions={
                  <div className="d-flex gap-2">
                    <Link href={batchMovementHref(productBatch, 'entry')} className="btn btn-sm btn-outline-success">
                      <i className="bi bi-box-arrow-in-down me-1" aria-hidden="true" /> Registrar entrada
                    </Link>
                    <Link href={batchMovementHref(productBatch, 'adjustment')} className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-sliders me-1" aria-hidden="true" /> Ajustar lote
                    </Link>
                  </div>
                }
              >
                <div className="row g-3">
                  <div className="col-md-2"><ReadOnly label="Inicial">{formatQty(productBatch.initialQuantity)}</ReadOnly></div>
                  <div className="col-md-2"><ReadOnly label="Actual">{formatQty(productBatch.currentQuantity)}</ReadOnly></div>
                  <div className="col-md-2"><ReadOnly label="Reservado">{formatQty(productBatch.reservedQuantity)}</ReadOnly></div>
                  <div className="col-md-2"><ReadOnly label="Disponible">{formatQty(productBatch.availableQuantity)}</ReadOnly></div>
                  <div className="col-md-2"><ReadOnly label="Costo unitario">{formatMoney(productBatch.unitCost)}</ReadOnly></div>
                  <div className="col-md-2"><ReadOnly label="Valor total">{formatMoney(productBatch.totalValue)}</ReadOnly></div>
                  <div className="col-12 form-text mt-0">Las cantidades del lote se mueven con entradas, salidas, ajustes y transferencias.</div>
                </div>
              </DetailSection>
            ) : (
              <DetailSection title="Entrada del lote" icon="bi-box-arrow-in-down">
                <div className="row g-3">
                  <div className="col-md-4">
                    {textInput('initialQuantity', 'Cantidad que entra', { type: 'number', min: '0', step: '0.0001' })}
                    <div className="form-text">Se registra como una entrada del lote en Movimientos.</div>
                  </div>
                  <div className="col-md-4">{textInput('unitCost', 'Costo unitario', { type: 'number', min: '0', step: '0.01', placeholder: '0.00' })}</div>
                  <div className="col-md-4"><ReadOnly label="Valor total">{formatMoney(toNumber(formData.initialQuantity) * toNumber(formData.unitCost))}</ReadOnly></div>
                </div>
              </DetailSection>
            )}

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

            <DetailSection title="Certificados, pruebas e información adicional" icon="bi-patch-check">
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
                    {productBatch ? 'Guardar cambios' : 'Registrar lote'}
                  </>
                )}
              </button>
            </div>
          </form>
      </LwSurface>
    </div>
  )
})

ProductBatchForm.displayName = 'ProductBatchForm'
