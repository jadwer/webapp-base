/**
 * INVENTORY MOVEMENT FORM
 * Alta y edicion de movimientos. Las opciones de tipo, referencia y estado
 * son exactamente las que valida InventoryMovementRequest.
 */

'use client'

import React, { memo, useCallback, useMemo, useState } from 'react'
import { DetailSection, PageHeader } from '@lwm/ui'
import { ProductSearchSelect } from '@lwm/products'
import type {
  InventoryMovement,
  InventoryMovementParsed,
  CreateMovementData,
  UpdateMovementData,
  WarehouseParsed,
} from '../types'
import { useProductBatches, useWarehouseLocationOptions } from '../hooks'
import { MOVEMENT_STATUS, MOVEMENT_TYPE } from '../utils/labels'
import { formatDate, formatMoney, formatQty, toNumber } from '../utils/format'
import { apiErrorList } from '../utils/listing'

export type MovementType = 'entry' | 'exit' | 'transfer' | 'adjustment'

export interface MovementFormDefaults {
  movementType?: MovementType
  productId?: string
  warehouseId?: string
  locationId?: string
}

/** Lo que entrega el formulario; el wrapper agrega userId al crear */
export type MovementFormData = Omit<CreateMovementData, 'userId'>

interface InventoryMovementFormProps {
  movement?: InventoryMovement | InventoryMovementParsed
  onSubmit: (data: MovementFormData | UpdateMovementData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  warehouses: WarehouseParsed[]
  /** Prellenado desde la URL (?type=&productId=&warehouseId=&locationId=) */
  defaults?: MovementFormDefaults
  backHref?: string
}

// InventoryMovementRequest: referenceType in purchase,sale,transfer,adjustment,manual
const REFERENCE_TYPES = [
  { value: 'manual', label: 'Manual' },
  { value: 'purchase', label: 'Compra' },
  { value: 'sale', label: 'Venta' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'adjustment', label: 'Ajuste' },
]

const REFERENCE_FOR_TYPE: Record<MovementType, string> = {
  entry: 'manual',
  exit: 'manual',
  transfer: 'transfer',
  adjustment: 'adjustment',
}

const isMovementType = (value: unknown): value is MovementType =>
  typeof value === 'string' && value in MOVEMENT_TYPE

const toLocalDateTime = (value?: string) => {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

const parseJson = (value: string) => (value.trim() ? JSON.parse(value) : undefined)

const optionalId = (value: unknown) => (value == null || value === '' ? '' : String(value))

export const InventoryMovementForm = memo<InventoryMovementFormProps>(({
  movement,
  onSubmit,
  onCancel,
  isLoading = false,
  warehouses,
  defaults,
  backHref = '/dashboard/inventory/movements',
}) => {
  const initialType: MovementType = isMovementType(movement?.movementType)
    ? movement.movementType
    : isMovementType(defaults?.movementType)
      ? defaults.movementType
      : 'entry'

  const [formData, setFormData] = useState({
    movementType: initialType,
    referenceType: movement?.referenceType || REFERENCE_FOR_TYPE[initialType],
    referenceId: movement?.referenceId?.toString() || '',
    movementDate: toLocalDateTime(movement?.movementDate),
    description: movement?.description || '',
    quantity: movement?.quantity != null ? String(toNumber(movement.quantity)) : '',
    unitCost: movement?.unitCost != null ? String(toNumber(movement.unitCost)) : '',
    status: movement?.status || 'pending',
    productId: optionalId(movement?.productId ?? movement?.product?.id ?? defaults?.productId),
    warehouseId: optionalId(movement?.warehouseId ?? movement?.warehouse?.id ?? defaults?.warehouseId),
    locationId: optionalId(movement?.locationId ?? movement?.location?.id ?? defaults?.locationId),
    destinationWarehouseId: optionalId(movement?.destinationWarehouseId),
    destinationLocationId: optionalId(movement?.destinationLocationId),
    batchInfo: movement?.batchInfo && Object.keys(movement.batchInfo).length > 0
      ? JSON.stringify(movement.batchInfo, null, 2)
      : '',
    metadata: movement?.metadata && Object.keys(movement.metadata).length > 0
      ? JSON.stringify(movement.metadata, null, 2)
      : '',
    selectedBatchId: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitErrors, setSubmitErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { locations, isLoading: isLoadingLocations } = useWarehouseLocationOptions(formData.warehouseId)
  const { locations: destinationLocations, isLoading: isLoadingDestination } =
    useWarehouseLocationOptions(formData.movementType === 'transfer' ? formData.destinationWarehouseId : null)

  const { productBatches: availableBatches, isLoading: isBatchesLoading } = useProductBatches({
    filters: {
      productId: formData.productId,
      status: 'active',
      ...(formData.warehouseId ? { warehouseId: formData.warehouseId } : {}),
    },
    pageSize: 100,
    enabled: Boolean(formData.productId),
  })

  // Si la ubicacion actual quedo inactiva sigue apareciendo en la edicion
  const locationOptions = useMemo(() => {
    const current = movement?.location
    if (current && String(current.id) === formData.locationId && !locations.some((l) => l.id === String(current.id))) {
      return [{ id: String(current.id), name: current.name, code: current.code }, ...locations]
    }
    return locations
  }, [locations, movement?.location, formData.locationId])

  const setField = useCallback((field: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'warehouseId') {
        next.locationId = ''
        next.selectedBatchId = ''
      }
      if (field === 'destinationWarehouseId') next.destinationLocationId = ''
      if (field === 'productId') next.selectedBatchId = ''
      if (field === 'movementType' && isMovementType(value) && !movement) {
        next.referenceType = REFERENCE_FOR_TYPE[value]
      }
      return next
    })
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev))
  }, [movement])

  const handleBatchSelect = useCallback((batchId: string) => {
    const batch = availableBatches.find((b) => b.id === batchId)
    setFormData((prev) => ({
      ...prev,
      selectedBatchId: batchId,
      batchInfo: batch
        ? JSON.stringify({
            batchId: batch.id,
            batchNumber: batch.batchNumber,
            lotNumber: batch.lotNumber,
            expirationDate: batch.expirationDate,
          }, null, 2)
        : prev.batchInfo,
    }))
  }, [availableBatches])

  const validateForm = useCallback((): boolean => {
    const next: Record<string, string> = {}
    const quantity = Number(formData.quantity)

    if (!formData.productId) next.productId = 'Selecciona un producto'
    if (!formData.warehouseId) next.warehouseId = 'Selecciona un almacén'
    if (!formData.movementDate) next.movementDate = 'La fecha es obligatoria'

    if (formData.quantity === '' || Number.isNaN(quantity)) {
      next.quantity = 'Captura una cantidad válida'
    } else if (quantity === 0) {
      next.quantity = 'La cantidad no puede ser cero'
    } else if (quantity < 0 && formData.movementType !== 'adjustment') {
      next.quantity = 'La cantidad debe ser positiva (solo los ajustes aceptan negativos)'
    }

    if (formData.unitCost !== '' && (Number.isNaN(Number(formData.unitCost)) || Number(formData.unitCost) < 0)) {
      next.unitCost = 'El costo unitario no puede ser negativo'
    }

    if (formData.movementType === 'transfer') {
      if (!formData.destinationWarehouseId) {
        next.destinationWarehouseId = 'Las transferencias requieren almacén destino'
      } else if (formData.destinationWarehouseId === formData.warehouseId) {
        next.destinationWarehouseId = 'El almacén destino debe ser distinto al de origen'
      }
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
  }, [formData])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitErrors([])
    if (!validateForm()) return

    const isTransfer = formData.movementType === 'transfer'
    const data: MovementFormData = {
      movementType: formData.movementType,
      referenceType: formData.referenceType,
      referenceId: formData.referenceId ? Number(formData.referenceId) : undefined,
      movementDate: formData.movementDate,
      description: formData.description.trim() || undefined,
      quantity: Number(formData.quantity),
      // unitCost es obligatorio en el backend; vacio se manda como 0
      unitCost: formData.unitCost === '' ? 0 : Number(formData.unitCost),
      status: formData.status,
      productId: formData.productId,
      warehouseId: formData.warehouseId,
      locationId: formData.locationId || undefined,
      destinationWarehouseId: isTransfer ? formData.destinationWarehouseId || undefined : undefined,
      destinationLocationId: isTransfer ? formData.destinationLocationId || undefined : undefined,
      batchInfo: parseJson(formData.batchInfo),
      metadata: parseJson(formData.metadata),
    }

    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (err) {
      setSubmitErrors(apiErrorList(err, 'No se pudo guardar el movimiento'))
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, onSubmit, validateForm])

  const busy = isLoading || isSubmitting
  const totalValue = toNumber(formData.quantity) * toNumber(formData.unitCost)
  const isTransfer = formData.movementType === 'transfer'
  const destinationWarehouses = warehouses.filter((w) => w.id !== formData.warehouseId)
  const initialProduct = movement?.product
    ? { id: String(movement.product.id), name: movement.product.name, sku: movement.product.sku }
    : null

  const invalid = (field: string) => (errors[field] ? ' is-invalid' : '')
  const feedback = (field: string) =>
    errors[field] ? <div className="invalid-feedback">{errors[field]}</div> : null

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <PageHeader
            title={movement ? 'Editar movimiento' : 'Nuevo movimiento'}
            subtitle={movement ? 'Modifica los datos del movimiento de inventario' : 'Registra una entrada, salida, transferencia o ajuste'}
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
            <DetailSection title="Movimiento" icon="bi-arrow-left-right">
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="movementType" className="form-label">
                    Tipo de movimiento <span className="text-danger">*</span>
                  </label>
                  <select
                    id="movementType"
                    className="form-select"
                    value={formData.movementType}
                    onChange={(e) => setField('movementType', e.target.value)}
                    disabled={busy}
                  >
                    {Object.entries(MOVEMENT_TYPE).map(([value, { label }]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="status" className="form-label">Estado</label>
                  <select
                    id="status"
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setField('status', e.target.value)}
                    disabled={busy}
                  >
                    {Object.entries(MOVEMENT_STATUS).map(([value, { label }]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="movementDate" className="form-label">
                    Fecha <span className="text-danger">*</span>
                  </label>
                  <input
                    id="movementDate"
                    type="datetime-local"
                    className={`form-control${invalid('movementDate')}`}
                    value={formData.movementDate}
                    onChange={(e) => setField('movementDate', e.target.value)}
                    disabled={busy}
                  />
                  {feedback('movementDate')}
                </div>
                <div className="col-md-3">
                  <label htmlFor="referenceType" className="form-label">Referencia</label>
                  <select
                    id="referenceType"
                    className="form-select"
                    value={formData.referenceType}
                    onChange={(e) => setField('referenceType', e.target.value)}
                    disabled={busy}
                  >
                    {REFERENCE_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label htmlFor="referenceId" className="form-label">Folio de referencia</label>
                  <input
                    id="referenceId"
                    type="number"
                    min="1"
                    className="form-control"
                    value={formData.referenceId}
                    onChange={(e) => setField('referenceId', e.target.value)}
                    disabled={busy}
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="description" className="form-label">Descripción</label>
                  <textarea
                    id="description"
                    className="form-control"
                    rows={2}
                    maxLength={1000}
                    placeholder="Motivo o comentario del movimiento"
                    value={formData.description}
                    onChange={(e) => setField('description', e.target.value)}
                    disabled={busy}
                  />
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Producto y cantidad" icon="bi-box">
              <div className="row g-3">
                <div className="col-12">
                  <ProductSearchSelect
                    id="productId"
                    className=""
                    value={formData.productId}
                    initialProduct={initialProduct}
                    onChange={(id) => setField('productId', id)}
                    required
                    disabled={busy}
                    errorText={errors.productId}
                  />
                </div>
                {formData.productId && (
                  <div className="col-12">
                    <label htmlFor="selectedBatchId" className="form-label">Lote</label>
                    <select
                      id="selectedBatchId"
                      className="form-select"
                      value={formData.selectedBatchId}
                      onChange={(e) => handleBatchSelect(e.target.value)}
                      disabled={busy || isBatchesLoading}
                    >
                      <option value="">Sin lote específico</option>
                      {availableBatches.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.batchNumber}
                          {batch.lotNumber ? ` (${batch.lotNumber})` : ''}
                          {` - Existencia: ${formatQty(batch.currentQuantity)}`}
                          {batch.expirationDate ? ` - Vence: ${formatDate(batch.expirationDate)}` : ''}
                        </option>
                      ))}
                    </select>
                    <div className="form-text">
                      {isBatchesLoading
                        ? 'Cargando lotes...'
                        : availableBatches.length === 0
                          ? 'No hay lotes activos de este producto en el almacén elegido.'
                          : 'Solo lotes activos. Al elegir uno se llena la información de lote.'}
                    </div>
                  </div>
                )}
                <div className="col-md-4">
                  <label htmlFor="quantity" className="form-label">
                    Cantidad <span className="text-danger">*</span>
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    step="0.0001"
                    className={`form-control${invalid('quantity')}`}
                    value={formData.quantity}
                    onChange={(e) => setField('quantity', e.target.value)}
                    disabled={busy}
                  />
                  {feedback('quantity')}
                  {formData.movementType === 'adjustment' && !errors.quantity && (
                    <div className="form-text">Negativa para disminuir la existencia.</div>
                  )}
                </div>
                <div className="col-md-4">
                  <label htmlFor="unitCost" className="form-label">Costo unitario</label>
                  <div className="input-group has-validation">
                    <span className="input-group-text">$</span>
                    <input
                      id="unitCost"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className={`form-control${invalid('unitCost')}`}
                      value={formData.unitCost}
                      onChange={(e) => setField('unitCost', e.target.value)}
                      disabled={busy}
                    />
                    {feedback('unitCost')}
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Valor total</label>
                  <div className="form-control-plaintext fw-semibold">{formatMoney(totalValue)}</div>
                </div>
              </div>
            </DetailSection>

            <DetailSection title={isTransfer ? 'Origen' : 'Ubicación'} icon="bi-geo-alt">
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="warehouseId" className="form-label">
                    Almacén <span className="text-danger">*</span>
                  </label>
                  <select
                    id="warehouseId"
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
                  <label htmlFor="locationId" className="form-label">Ubicación</label>
                  <select
                    id="locationId"
                    className="form-select"
                    value={formData.locationId}
                    onChange={(e) => setField('locationId', e.target.value)}
                    disabled={busy || !formData.warehouseId || isLoadingLocations}
                  >
                    <option value="">
                      {!formData.warehouseId
                        ? 'Elige primero un almacén'
                        : isLoadingLocations
                          ? 'Cargando ubicaciones...'
                          : 'Sin ubicación específica'}
                    </option>
                    {locationOptions.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}{location.code ? ` (${location.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </DetailSection>

            {isTransfer && (
              <DetailSection title="Destino" icon="bi-box-arrow-right">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="destinationWarehouseId" className="form-label">
                      Almacén destino <span className="text-danger">*</span>
                    </label>
                    <select
                      id="destinationWarehouseId"
                      className={`form-select${invalid('destinationWarehouseId')}`}
                      value={formData.destinationWarehouseId}
                      onChange={(e) => setField('destinationWarehouseId', e.target.value)}
                      disabled={busy}
                    >
                      <option value="">Seleccionar almacén destino...</option>
                      {destinationWarehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}{warehouse.code ? ` (${warehouse.code})` : ''}
                        </option>
                      ))}
                    </select>
                    {feedback('destinationWarehouseId')}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="destinationLocationId" className="form-label">Ubicación destino</label>
                    <select
                      id="destinationLocationId"
                      className="form-select"
                      value={formData.destinationLocationId}
                      onChange={(e) => setField('destinationLocationId', e.target.value)}
                      disabled={busy || !formData.destinationWarehouseId || isLoadingDestination}
                    >
                      <option value="">
                        {!formData.destinationWarehouseId
                          ? 'Elige primero el almacén destino'
                          : isLoadingDestination
                            ? 'Cargando ubicaciones...'
                            : 'Sin ubicación específica'}
                      </option>
                      {destinationLocations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}{location.code ? ` (${location.code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </DetailSection>
            )}

            <DetailSection title="Información adicional (opcional)" icon="bi-info-circle">
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="batchInfo" className="form-label">Información de lote (JSON)</label>
                  <textarea
                    id="batchInfo"
                    className={`form-control font-monospace small${invalid('batchInfo')}`}
                    rows={5}
                    placeholder='{"batchNumber": "LOTE-001"}'
                    value={formData.batchInfo}
                    onChange={(e) => setField('batchInfo', e.target.value)}
                    disabled={busy}
                  />
                  {feedback('batchInfo')}
                </div>
                <div className="col-md-6">
                  <label htmlFor="metadata" className="form-label">Metadatos (JSON)</label>
                  <textarea
                    id="metadata"
                    className={`form-control font-monospace small${invalid('metadata')}`}
                    rows={5}
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
                    {movement ? 'Guardar cambios' : 'Registrar movimiento'}
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

InventoryMovementForm.displayName = 'InventoryMovementForm'
