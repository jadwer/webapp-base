/**
 * STOCK FORM
 * Alta y edicion de stock con la piel del rediseno (Figma Inventario, 2026-11-15).
 *
 * Decision de Gabino (2026-11-15): las existencias salen de los movimientos.
 * - Alta ("Registrar stock"): la cantidad y el costo se registran como una ENTRADA en
 *   Movimientos; estatus, minimo, maximo y punto de reorden se guardan en el registro.
 *   Con cantidad 0 solo se fijan esos niveles.
 * - Edicion: cantidad, reservado, disponible, costo y ultimo movimiento son de solo
 *   lectura (el backend los rechaza); para cambiarlos se registra un ajuste o una entrada.
 */

'use client'

import React, { memo, useCallback, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { DetailSection, LwSurface, LwPageTitle } from '@lwm/ui'
import { ProductSearchSelect } from '@lwm/products'
import { useWarehouseLocationOptions, useWarehouses } from '../hooks'
import { STOCK_STATUS, LAST_MOVEMENT_TYPE } from '../utils/labels'
import { formatDate, formatMoney, formatQty, toNumber } from '../utils/format'
import { apiErrorList } from '../utils/listing'
import type { Stock, CreateStockData, UpdateStockData } from '../types'

/** Lo que entrega el formulario: niveles del registro y, al crear, la entrada a registrar. */
export interface StockFormResult {
  settings: CreateStockData | UpdateStockData
  entry?: { quantity: number; unitCost: number }
}

interface StockFormProps {
  stock?: Stock
  onSubmit: (result: StockFormResult) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  backHref?: string
}


const numberText = (value: unknown) => (value == null || value === '' ? '' : String(toNumber(value)))
const optionalId = (value: unknown) => (value == null || value === '' ? '' : String(value))
const toJsonText = (value: unknown) =>
  value && typeof value === 'object' && Object.keys(value).length > 0 ? JSON.stringify(value, null, 2) : ''
const parseJson = (value: string) => (value.trim() ? JSON.parse(value) : undefined)

/** Liga al alta de movimiento con el producto, almacen y ubicacion del registro. */
export const stockMovementHref = (stock: Pick<Stock, 'productId' | 'warehouseId' | 'locationId' | 'warehouseLocationId'> & { product?: { id?: unknown }; warehouse?: { id?: unknown }; location?: { id?: unknown } }, type: 'entry' | 'adjustment') => {
  const params = new URLSearchParams({ type })
  const productId = optionalId(stock.productId ?? stock.product?.id)
  const warehouseId = optionalId(stock.warehouseId ?? stock.warehouse?.id)
  const locationId = optionalId(stock.locationId ?? stock.warehouseLocationId ?? stock.location?.id)
  if (productId) params.set('productId', productId)
  if (warehouseId) params.set('warehouseId', warehouseId)
  if (locationId) params.set('locationId', locationId)
  return `/dashboard/inventory/movements/create?${params.toString()}`
}

const ReadOnly = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <span className="form-label d-block">{label}</span>
    <div className="form-control bg-light">{children}</div>
  </div>
)

export const StockForm = memo<StockFormProps>(({
  stock,
  onSubmit,
  onCancel,
  isLoading = false,
  backHref = '/dashboard/inventory/stock',
}) => {
  const { warehouses } = useWarehouses({ filters: { isActive: true }, pagination: { size: 100 } })
  const isEdit = Boolean(stock)

  const [formData, setFormData] = useState({
    productId: optionalId(stock?.productId ?? stock?.product?.id),
    warehouseId: optionalId(stock?.warehouseId ?? stock?.warehouse?.id),
    warehouseLocationId: optionalId(stock?.locationId ?? stock?.warehouseLocationId ?? stock?.location?.id),
    entryQuantity: '',
    entryUnitCost: '',
    minimumStock: numberText(stock?.minimumStock),
    maximumStock: numberText(stock?.maximumStock),
    reorderPoint: numberText(stock?.reorderPoint),
    status: stock?.status && stock.status in STOCK_STATUS ? stock.status : 'active',
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

  const validateForm = useCallback((): boolean => {
    const next: Record<string, string> = {}
    const nonNegative = (field: keyof typeof formData, message: string) => {
      const raw = formData[field]
      if (raw !== '' && (Number.isNaN(Number(raw)) || Number(raw) < 0)) next[field] = message
    }

    if (!isEdit) {
      if (!formData.productId) next.productId = 'Selecciona un producto'
      if (!formData.warehouseId) next.warehouseId = 'Selecciona un almacén'
      nonNegative('entryQuantity', 'La cantidad no puede ser negativa')
      nonNegative('entryUnitCost', 'El costo unitario no puede ser negativo')
    }
    nonNegative('minimumStock', 'El mínimo no puede ser negativo')
    nonNegative('maximumStock', 'El máximo no puede ser negativo')
    nonNegative('reorderPoint', 'El punto de reorden no puede ser negativo')
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
  }, [formData, isEdit])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitErrors([])
    if (!validateForm()) return

    const optionalNumber = (value: string) => (value === '' ? undefined : Number(value))
    const settings: CreateStockData = {
      productId: formData.productId,
      warehouseId: formData.warehouseId,
      warehouseLocationId: formData.warehouseLocationId || undefined,
      minimumStock: optionalNumber(formData.minimumStock),
      maximumStock: optionalNumber(formData.maximumStock),
      reorderPoint: optionalNumber(formData.reorderPoint),
      status: formData.status,
      batchInfo: parseJson(formData.batchInfo),
      metadata: parseJson(formData.metadata),
    }
    const qty = toNumber(formData.entryQuantity)
    const result: StockFormResult = isEdit
      ? { settings: { minimumStock: settings.minimumStock, maximumStock: settings.maximumStock, reorderPoint: settings.reorderPoint, status: settings.status, batchInfo: settings.batchInfo, metadata: settings.metadata } }
      : { settings, entry: qty > 0 ? { quantity: qty, unitCost: toNumber(formData.entryUnitCost) } : undefined }

    setIsSubmitting(true)
    try {
      await onSubmit(result)
    } catch (err) {
      setSubmitErrors(apiErrorList(err, 'No se pudo guardar el registro de stock'))
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, isEdit, onSubmit, validateForm])

  const busy = isLoading || isSubmitting
  const initialProduct = stock?.product
    ? { id: String(stock.product.id), name: stock.product.name, sku: stock.product.sku }
    : null
  const warehouseOptions = stock?.warehouse && !warehouses.some((w) => w.id === String(stock.warehouse?.id))
    ? [stock.warehouse, ...warehouses]
    : warehouses
  const entryValue = toNumber(formData.entryQuantity) * toNumber(formData.entryUnitCost)

  const invalid = (field: string) => (errors[field] ? ' is-invalid' : '')
  const feedback = (field: string) =>
    errors[field] ? <div className="invalid-feedback">{errors[field]}</div> : null

  const numberInput = (field: keyof typeof formData, label: string, opts: { required?: boolean; help?: string; step?: string; placeholder?: string } = {}) => (
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
        placeholder={opts.placeholder ?? '0'}
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
      <LwSurface>
        <LwPageTitle
          title={isEdit ? 'Editar stock:' : 'Registrar stock'}
          highlight={isEdit && stock ? String(stock.id).padStart(3, '0') : undefined}
          subtitle={isEdit ? 'Niveles y estatus del registro; las existencias se mueven con movimientos' : 'Registra la entrada de un producto a un almacén'}
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
          <DetailSection title="Producto y ubicación" icon="bi-geo-alt">
            {isEdit && stock ? (
              <div className="row g-3">
                <div className="col-md-6">
                  <ReadOnly label="Producto">
                    {stock.product?.name ?? '—'}
                    {stock.product?.sku ? <span className="text-muted ms-2">{stock.product.sku}</span> : null}
                  </ReadOnly>
                </div>
                <div className="col-md-3"><ReadOnly label="Almacén">{stock.warehouse?.name ?? '—'}</ReadOnly></div>
                <div className="col-md-3"><ReadOnly label="Ubicación">{stock.location?.name ?? 'Sin ubicación específica'}</ReadOnly></div>
              </div>
            ) : (
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
            )}
          </DetailSection>

          {isEdit && stock ? (
            <DetailSection
              title="Existencias"
              icon="bi-123"
              headerActions={
                <div className="d-flex gap-2">
                  <Link href={stockMovementHref(stock, 'entry')} className="btn btn-sm btn-outline-success">
                    <i className="bi bi-box-arrow-in-down me-1" aria-hidden="true" /> Registrar entrada
                  </Link>
                  <Link href={stockMovementHref(stock, 'adjustment')} className="btn btn-sm btn-outline-primary">
                    <i className="bi bi-sliders me-1" aria-hidden="true" /> Ajustar existencia
                  </Link>
                </div>
              }
            >
              <div className="row g-3">
                <div className="col-md-3"><ReadOnly label="Cantidad total">{formatQty(stock.quantity)}</ReadOnly></div>
                <div className="col-md-3"><ReadOnly label="Reservado">{formatQty(stock.reservedQuantity)}</ReadOnly></div>
                <div className="col-md-3"><ReadOnly label="Disponible">{formatQty(stock.availableQuantity)}</ReadOnly></div>
                <div className="col-md-3"><ReadOnly label="Costo unitario">{formatMoney(stock.unitCost)}</ReadOnly></div>
                <div className="col-md-3"><ReadOnly label="Valor total">{formatMoney(stock.totalValue)}</ReadOnly></div>
                <div className="col-md-3"><ReadOnly label="Último movimiento">{stock.lastMovementDate ? formatDate(stock.lastMovementDate) : 'Sin movimiento'}</ReadOnly></div>
                <div className="col-md-3"><ReadOnly label="Tipo del último movimiento">{stock.lastMovementType ? LAST_MOVEMENT_TYPE[stock.lastMovementType] ?? stock.lastMovementType : 'Sin movimiento'}</ReadOnly></div>
                <div className="col-12 form-text mt-0">
                  La existencia, lo reservado y el costo se mueven con entradas, salidas y ajustes; así cuadran con el costo y la contabilidad.
                </div>
              </div>
            </DetailSection>
          ) : (
            <DetailSection title="Entrada" icon="bi-box-arrow-in-down">
              <div className="row g-3">
                <div className="col-md-4">{numberInput('entryQuantity', 'Cantidad que entra', { help: 'Se registra como una entrada en Movimientos. Déjala en 0 para solo fijar niveles.' })}</div>
                <div className="col-md-4">{numberInput('entryUnitCost', 'Costo unitario', { step: '0.01' })}</div>
                <div className="col-md-4"><ReadOnly label="Valor total">{formatMoney(entryValue)}</ReadOnly></div>
              </div>
            </DetailSection>
          )}

          <DetailSection title="Niveles y estatus" icon="bi-bar-chart">
            <div className="row g-3">
              <div className="col-md-3">
                <label htmlFor="stock-status" className="form-label">Estatus</label>
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
              <div className="col-md-3">{numberInput('minimumStock', 'Stock mínimo', { help: 'Por debajo se marca "Stock bajo"' })}</div>
              <div className="col-md-3">{numberInput('maximumStock', 'Stock máximo')}</div>
              <div className="col-md-3">{numberInput('reorderPoint', 'Punto de reorden')}</div>
            </div>
          </DetailSection>

          {isEdit ? (
            <DetailSection title="Información adicional (opcional)" icon="bi-info-circle">
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="stock-batchInfo" className="form-label">Información de lote (JSON)</label>
                  <textarea id="stock-batchInfo" className={`form-control font-monospace${invalid('batchInfo')}`} rows={4} value={formData.batchInfo} onChange={(e) => setField('batchInfo', e.target.value)} disabled={busy} />
                  {feedback('batchInfo')}
                </div>
                <div className="col-md-6">
                  <label htmlFor="stock-metadata" className="form-label">Metadatos (JSON)</label>
                  <textarea id="stock-metadata" className={`form-control font-monospace${invalid('metadata')}`} rows={4} value={formData.metadata} onChange={(e) => setField('metadata', e.target.value)} disabled={busy} />
                  {feedback('metadata')}
                </div>
              </div>
            </DetailSection>
          ) : null}

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
                  {isEdit ? 'Guardar cambios' : 'Registrar stock'}
                </>
              )}
            </button>
          </div>
        </form>
      </LwSurface>
    </div>
  )
})

StockForm.displayName = 'StockForm'
