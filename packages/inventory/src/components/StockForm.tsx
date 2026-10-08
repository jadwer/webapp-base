/**
 * STOCK FORM
 * Alta y edicion de registros de stock. Estados desde STOCK_STATUS
 * (StockRequest); disponible y valor total los calcula el backend.
 */

'use client'

import React, { memo, useCallback, useState } from 'react'
import { DetailSection, PageHeader } from '@lwm/ui'
import { ProductSearchSelect } from '@lwm/products'
import { useWarehouseLocationOptions, useWarehouses } from '../hooks'
import { STOCK_STATUS } from '../utils/labels'
import { formatMoney, formatQty, toNumber } from '../utils/format'
import { apiErrorList } from '../utils/listing'
import type { Stock, CreateStockData, UpdateStockData } from '../types'

interface StockFormProps {
  stock?: Stock
  onSubmit: (data: CreateStockData | UpdateStockData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  backHref?: string
}

// StockRequest: lastMovementType in in,out,adjustment,transfer
const LAST_MOVEMENT_TYPES = [
  { value: 'in', label: 'Entrada' },
  { value: 'out', label: 'Salida' },
  { value: 'adjustment', label: 'Ajuste' },
  { value: 'transfer', label: 'Transferencia' },
]

const numberText = (value: unknown) => (value == null || value === '' ? '' : String(toNumber(value)))
const optionalId = (value: unknown) => (value == null || value === '' ? '' : String(value))
const toJsonText = (value: unknown) =>
  value && typeof value === 'object' && Object.keys(value).length > 0 ? JSON.stringify(value, null, 2) : ''
const parseJson = (value: string) => (value.trim() ? JSON.parse(value) : undefined)

const toLocalDateTime = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export const StockForm = memo<StockFormProps>(({
  stock,
  onSubmit,
  onCancel,
  isLoading = false,
  backHref = '/dashboard/inventory/stock',
}) => {
  const { warehouses } = useWarehouses({ filters: { isActive: true }, pagination: { size: 100 } })

  const [formData, setFormData] = useState({
    productId: optionalId(stock?.productId ?? stock?.product?.id),
    warehouseId: optionalId(stock?.warehouseId ?? stock?.warehouse?.id),
    warehouseLocationId: optionalId(stock?.locationId ?? stock?.warehouseLocationId ?? stock?.location?.id),
    quantity: numberText(stock?.quantity) || '0',
    reservedQuantity: numberText(stock?.reservedQuantity),
    minimumStock: numberText(stock?.minimumStock),
    maximumStock: numberText(stock?.maximumStock),
    reorderPoint: numberText(stock?.reorderPoint),
    unitCost: numberText(stock?.unitCost),
    status: stock?.status && stock.status in STOCK_STATUS ? stock.status : 'active',
    lastMovementDate: toLocalDateTime(stock?.lastMovementDate),
    lastMovementType: stock?.lastMovementType || '',
    batchInfo: toJsonText(stock?.batchInfo),
    metadata: toJsonText(stock?.metadata),
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

  const quantity = toNumber(formData.quantity)
  const reserved = toNumber(formData.reservedQuantity)
  const available = Math.max(0, quantity - reserved)
  const totalValue = quantity * toNumber(formData.unitCost)

  const validateForm = useCallback((): boolean => {
    const next: Record<string, string> = {}
    const nonNegative = (field: keyof typeof formData, message: string) => {
      const raw = formData[field]
      if (raw !== '' && (Number.isNaN(Number(raw)) || Number(raw) < 0)) next[field] = message
    }

    if (!formData.productId) next.productId = 'Selecciona un producto'
    if (!formData.warehouseId) next.warehouseId = 'Selecciona un almacén'
    if (formData.quantity === '') next.quantity = 'La cantidad es obligatoria'
    nonNegative('quantity', 'La cantidad no puede ser negativa')
    nonNegative('reservedQuantity', 'La reservada no puede ser negativa')
    nonNegative('minimumStock', 'El mínimo no puede ser negativo')
    nonNegative('maximumStock', 'El máximo no puede ser negativo')
    nonNegative('reorderPoint', 'El punto de reorden no puede ser negativo')
    nonNegative('unitCost', 'El costo unitario no puede ser negativo')
    if (!next.reservedQuantity && reserved > quantity) {
      next.reservedQuantity = 'La reservada no puede exceder la cantidad total'
    }
    if (formData.minimumStock !== '' && formData.maximumStock !== '' && Number(formData.maximumStock) < Number(formData.minimumStock)) {
      next.maximumStock = 'El máximo no puede ser menor que el mínimo'
    }
    for (const field of ['batchInfo', 'metadata'] as const) {
      try {
        parseJson(formData[field])
      } catch {
        next[field] = 'JSON inválido'
      }
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }, [formData, quantity, reserved])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitErrors([])
    if (!validateForm()) return

    const optionalNumber = (value: string) => (value === '' ? undefined : Number(value))
    const data: CreateStockData = {
      productId: formData.productId,
      warehouseId: formData.warehouseId,
      warehouseLocationId: formData.warehouseLocationId || undefined,
      quantity: Number(formData.quantity),
      reservedQuantity: optionalNumber(formData.reservedQuantity),
      minimumStock: optionalNumber(formData.minimumStock),
      maximumStock: optionalNumber(formData.maximumStock),
      reorderPoint: optionalNumber(formData.reorderPoint),
      // unitCost es obligatorio al crear; vacio se manda como 0
      unitCost: formData.unitCost === '' ? 0 : Number(formData.unitCost),
      status: formData.status,
      lastMovementDate: formData.lastMovementDate || undefined,
      lastMovementType: formData.lastMovementType || undefined,
      batchInfo: parseJson(formData.batchInfo),
      metadata: parseJson(formData.metadata),
    }

    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (err) {
      setSubmitErrors(apiErrorList(err, 'No se pudo guardar el registro de stock'))
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, onSubmit, validateForm])

  const busy = isLoading || isSubmitting
  const initialProduct = stock?.product
    ? { id: String(stock.product.id), name: stock.product.name, sku: stock.product.sku }
    : null
  const warehouseOptions = stock?.warehouse && !warehouses.some((w) => w.id === String(stock.warehouse?.id))
    ? [stock.warehouse, ...warehouses]
    : warehouses

  const invalid = (field: string) => (errors[field] ? ' is-invalid' : '')
  const feedback = (field: string) =>
    errors[field] ? <div className="invalid-feedback">{errors[field]}</div> : null

  const numberInput = (field: keyof typeof formData, label: string, opts: { required?: boolean; help?: string; step?: string } = {}) => (
    <>
      <label htmlFor={`stock-${field}`} className="form-label">
        {label}
        {opts.required && <span className="text-danger"> *</span>}
      </label>
      <input
        id={`stock-${field}`}
        type="number"
        min="0"
        step={opts.step || '0.0001'}
        className={`form-control${invalid(field)}`}
        value={formData[field]}
        onChange={(e) => setField(field, e.target.value)}
        disabled={busy}
      />
      {feedback(field)}
      {opts.help && !errors[field] && <div className="form-text">{opts.help}</div>}
    </>
  )

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <PageHeader
            title={stock ? 'Editar registro de stock' : 'Nuevo registro de stock'}
            subtitle={stock
              ? 'Modifica niveles y datos del registro'
              : 'Existencia de un producto en un almacén y ubicación'}
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
            <DetailSection title="Producto y ubicación" icon="bi-geo-alt">
              <div className="row g-3">
                <div className="col-12">
                  <ProductSearchSelect
                    id="stock-productId"
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
                  <label htmlFor="stock-warehouseId" className="form-label">
                    Almacén <span className="text-danger">*</span>
                  </label>
                  <select
                    id="stock-warehouseId"
                    className={`form-select${invalid('warehouseId')}`}
                    value={formData.warehouseId}
                    onChange={(e) => setField('warehouseId', e.target.value)}
                    disabled={busy}
                  >
                    <option value="">Seleccionar almacén...</option>
                    {warehouseOptions.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}{warehouse.code ? ` (${warehouse.code})` : ''}
                      </option>
                    ))}
                  </select>
                  {feedback('warehouseId')}
                </div>
                <div className="col-md-6">
                  <label htmlFor="stock-warehouseLocationId" className="form-label">Ubicación</label>
                  <select
                    id="stock-warehouseLocationId"
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

            <DetailSection title="Cantidades" icon="bi-123">
              <div className="row g-3">
                <div className="col-md-4">{numberInput('quantity', 'Cantidad total', { required: true })}</div>
                <div className="col-md-4">{numberInput('reservedQuantity', 'Reservada', { help: 'Apartada para pedidos pendientes' })}</div>
                <div className="col-md-4">
                  <label className="form-label">Disponible</label>
                  <div className="form-control-plaintext fw-semibold">{formatQty(available)}</div>
                  <div className="form-text">Total menos reservada</div>
                </div>
                <div className="col-md-4">
                  <label htmlFor="stock-status" className="form-label">Estado</label>
                  <select
                    id="stock-status"
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setField('status', e.target.value)}
                    disabled={busy}
                  >
                    {Object.entries(STOCK_STATUS).map(([value, { label }]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Niveles de stock" icon="bi-bar-chart">
              <div className="row g-3">
                <div className="col-md-4">{numberInput('minimumStock', 'Stock mínimo', { help: 'Alerta de stock bajo' })}</div>
                <div className="col-md-4">{numberInput('maximumStock', 'Stock máximo')}</div>
                <div className="col-md-4">{numberInput('reorderPoint', 'Punto de reorden')}</div>
              </div>
            </DetailSection>

            <DetailSection title="Costo" icon="bi-currency-dollar">
              <div className="row g-3">
                <div className="col-md-6">{numberInput('unitCost', 'Costo unitario', { step: '0.01' })}</div>
                <div className="col-md-6">
                  <label className="form-label">Valor total</label>
                  <div className="form-control-plaintext fw-semibold">{formatMoney(totalValue)}</div>
                  <div className="form-text">Cantidad por costo unitario</div>
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Último movimiento e información adicional" icon="bi-info-circle">
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="stock-lastMovementDate" className="form-label">Último movimiento</label>
                  <input
                    id="stock-lastMovementDate"
                    type="datetime-local"
                    className="form-control"
                    value={formData.lastMovementDate}
                    onChange={(e) => setField('lastMovementDate', e.target.value)}
                    disabled={busy}
                  />
                  <div className="form-text">Normalmente lo actualizan los movimientos</div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="stock-lastMovementType" className="form-label">Tipo del último movimiento</label>
                  <select
                    id="stock-lastMovementType"
                    className="form-select"
                    value={formData.lastMovementType}
                    onChange={(e) => setField('lastMovementType', e.target.value)}
                    disabled={busy}
                  >
                    <option value="">Sin movimiento</option>
                    {LAST_MOVEMENT_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="stock-batchInfo" className="form-label">Información de lote (JSON)</label>
                  <textarea
                    id="stock-batchInfo"
                    className={`form-control font-monospace small${invalid('batchInfo')}`}
                    rows={4}
                    placeholder='{"batchNumber": "LOTE-001"}'
                    value={formData.batchInfo}
                    onChange={(e) => setField('batchInfo', e.target.value)}
                    disabled={busy}
                  />
                  {feedback('batchInfo')}
                </div>
                <div className="col-md-6">
                  <label htmlFor="stock-metadata" className="form-label">Metadatos (JSON)</label>
                  <textarea
                    id="stock-metadata"
                    className={`form-control font-monospace small${invalid('metadata')}`}
                    rows={4}
                    placeholder='{"notas": "..."}'
                    value={formData.metadata}
                    onChange={(e) => setField('metadata', e.target.value)}
                    disabled={busy}
                  />
                  {feedback('metadata')}
                </div>
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
                    {stock ? 'Guardar cambios' : 'Crear registro'}
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

StockForm.displayName = 'StockForm'
