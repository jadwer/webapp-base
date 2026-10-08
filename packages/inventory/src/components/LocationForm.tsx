/**
 * LOCATION FORM
 * Alta y edicion de ubicaciones de almacen. Tipos desde LOCATION_TYPE
 * (WarehouseLocationRequest).
 */

'use client'

import React, { memo, useCallback, useState } from 'react'
import { DetailSection, PageHeader } from '@lwm/ui'
import { useWarehouses } from '../hooks'
import { LOCATION_TYPE } from '../utils/labels'
import { toNumber } from '../utils/format'
import { apiErrorList } from '../utils/listing'
import type { WarehouseLocationParsed, CreateLocationData, UpdateLocationData } from '../types'

interface LocationFormProps {
  location?: WarehouseLocationParsed
  onSubmit: (data: CreateLocationData | UpdateLocationData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  /** Almacen preseleccionado (?warehouseId= desde el detalle del almacen) */
  defaultWarehouseId?: string
  backHref?: string
}

const numberText = (value: unknown) => (value == null || value === '' ? '' : String(toNumber(value)))

export const LocationForm = memo<LocationFormProps>(({
  location,
  onSubmit,
  onCancel,
  isLoading = false,
  defaultWarehouseId,
  backHref = '/dashboard/inventory/locations',
}) => {
  const { warehouses } = useWarehouses({ filters: { isActive: true }, pagination: { size: 100 } })

  const [formData, setFormData] = useState({
    name: location?.name || '',
    code: location?.code || '',
    description: location?.description || '',
    locationType: location?.locationType && location.locationType in LOCATION_TYPE ? location.locationType : 'rack',
    aisle: location?.aisle || '',
    rack: location?.rack || '',
    shelf: location?.shelf || '',
    level: location?.level || '',
    position: location?.position || '',
    barcode: location?.barcode || '',
    maxWeight: numberText(location?.maxWeight),
    maxVolume: numberText(location?.maxVolume),
    dimensions: location?.dimensions || '',
    isActive: location?.isActive ?? true,
    isPickable: location?.isPickable ?? true,
    isReceivable: location?.isReceivable ?? true,
    priority: location?.priority != null ? String(location.priority) : '1',
    warehouseId: String(location?.warehouseId ?? location?.warehouse?.id ?? defaultWarehouseId ?? ''),
  })
  const [codeTouched, setCodeTouched] = useState(Boolean(location))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitErrors, setSubmitErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setField = useCallback((field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      // Codigo sugerido a partir de pasillo-rack-estante-nivel mientras no se edite a mano
      if (!codeTouched && ['aisle', 'rack', 'shelf', 'level'].includes(field)) {
        const parts = [next.aisle, next.rack, next.shelf, next.level].filter(Boolean)
        if (parts.length >= 2) next.code = parts.join('-')
      }
      return next
    })
    if (field === 'code') setCodeTouched(true)
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev))
  }, [codeTouched])

  const validateForm = useCallback((): boolean => {
    const next: Record<string, string> = {}
    if (!formData.name.trim()) next.name = 'El nombre es obligatorio'
    if (!formData.code.trim()) next.code = 'El código es obligatorio'
    if (!formData.warehouseId) next.warehouseId = 'Selecciona un almacén'
    if (formData.maxWeight !== '' && (Number.isNaN(Number(formData.maxWeight)) || Number(formData.maxWeight) < 0)) {
      next.maxWeight = 'El peso máximo no puede ser negativo'
    }
    if (formData.maxVolume !== '' && (Number.isNaN(Number(formData.maxVolume)) || Number(formData.maxVolume) < 0)) {
      next.maxVolume = 'El volumen máximo no puede ser negativo'
    }
    const priority = Number(formData.priority)
    if (formData.priority !== '' && (!Number.isInteger(priority) || priority < 1 || priority > 10)) {
      next.priority = 'La prioridad debe ser un entero entre 1 y 10'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }, [formData])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitErrors([])
    if (!validateForm()) return

    const text = (value: string) => value.trim() || undefined
    const data: CreateLocationData = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      description: text(formData.description),
      locationType: formData.locationType,
      aisle: text(formData.aisle),
      rack: text(formData.rack),
      shelf: text(formData.shelf),
      level: text(formData.level),
      position: text(formData.position),
      barcode: text(formData.barcode),
      maxWeight: formData.maxWeight === '' ? undefined : Number(formData.maxWeight),
      maxVolume: formData.maxVolume === '' ? undefined : Number(formData.maxVolume),
      dimensions: text(formData.dimensions),
      isActive: formData.isActive,
      isPickable: formData.isPickable,
      isReceivable: formData.isReceivable,
      priority: formData.priority === '' ? undefined : Number(formData.priority),
      warehouseId: formData.warehouseId,
    }

    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (err) {
      setSubmitErrors(apiErrorList(err, 'No se pudo guardar la ubicación'))
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, onSubmit, validateForm])

  const busy = isLoading || isSubmitting
  const currentWarehouse = location?.warehouse
  const warehouseOptions = currentWarehouse && !warehouses.some((w) => w.id === String(currentWarehouse.id))
    ? [currentWarehouse, ...warehouses]
    : warehouses
  const selectedWarehouse = warehouseOptions.find((w) => String(w.id) === formData.warehouseId)

  const invalid = (field: string) => (errors[field] ? ' is-invalid' : '')
  const feedback = (field: string) =>
    errors[field] ? <div className="invalid-feedback">{errors[field]}</div> : null

  const textInput = (field: keyof typeof formData, label: string, opts: { required?: boolean; placeholder?: string; type?: string; min?: string; max?: string; step?: string } = {}) => (
    <>
      <label htmlFor={`location-${field}`} className="form-label">
        {label}
        {opts.required && <span className="text-danger"> *</span>}
      </label>
      <input
        id={`location-${field}`}
        type={opts.type || 'text'}
        min={opts.min}
        max={opts.max}
        step={opts.step}
        placeholder={opts.placeholder}
        className={`form-control${invalid(field)}`}
        value={String(formData[field])}
        onChange={(e) => setField(field, e.target.value)}
        disabled={busy}
      />
      {feedback(field)}
    </>
  )

  const checkbox = (field: 'isActive' | 'isPickable' | 'isReceivable', label: string) => (
    <div className="form-check">
      <input
        type="checkbox"
        className="form-check-input"
        id={`location-${field}`}
        checked={formData[field]}
        onChange={(e) => setField(field, e.target.checked)}
        disabled={busy}
      />
      <label className="form-check-label" htmlFor={`location-${field}`}>{label}</label>
    </div>
  )

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <PageHeader
            title={location ? `Editar ubicación ${location.code || ''}`.trim() : 'Nueva ubicación'}
            subtitle={location ? 'Modifica los datos de la ubicación' : 'Agrega una ubicación dentro de un almacén'}
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
            <DetailSection title="Información general" icon="bi-info-circle">
              <div className="row g-3">
                <div className="col-md-6">{textInput('name', 'Nombre', { required: true, placeholder: 'Zona A, pasillo 1, rack 1' })}</div>
                <div className="col-md-6">
                  {textInput('code', 'Código', { required: true, placeholder: 'A-1-1' })}
                  {!errors.code && !location && <div className="form-text">Se sugiere a partir de pasillo, rack, estante y nivel.</div>}
                </div>
                <div className="col-md-6">
                  <label htmlFor="location-warehouseId" className="form-label">
                    Almacén <span className="text-danger">*</span>
                  </label>
                  <select
                    id="location-warehouseId"
                    className={`form-select${invalid('warehouseId')}`}
                    value={formData.warehouseId}
                    onChange={(e) => setField('warehouseId', e.target.value)}
                    disabled={busy}
                  >
                    <option value="">Seleccionar almacén...</option>
                    {warehouseOptions.map((warehouse) => (
                      <option key={warehouse.id} value={String(warehouse.id)}>
                        {warehouse.name}{warehouse.code ? ` (${warehouse.code})` : ''}
                      </option>
                    ))}
                  </select>
                  {feedback('warehouseId')}
                  {selectedWarehouse?.address && !errors.warehouseId && (
                    <div className="form-text">{selectedWarehouse.address}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label htmlFor="location-locationType" className="form-label">
                    Tipo de ubicación <span className="text-danger">*</span>
                  </label>
                  <select
                    id="location-locationType"
                    className="form-select"
                    value={formData.locationType}
                    onChange={(e) => setField('locationType', e.target.value)}
                    disabled={busy}
                  >
                    {Object.entries(LOCATION_TYPE).map(([value, { label }]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label htmlFor="location-description" className="form-label">Descripción</label>
                  <textarea
                    id="location-description"
                    className="form-control"
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setField('description', e.target.value)}
                    disabled={busy}
                  />
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Posición física" icon="bi-grid-3x3">
              <div className="row g-3">
                <div className="col-md-3">{textInput('aisle', 'Pasillo', { placeholder: 'A' })}</div>
                <div className="col-md-3">{textInput('rack', 'Rack', { placeholder: '1' })}</div>
                <div className="col-md-3">{textInput('shelf', 'Estante', { placeholder: '1' })}</div>
                <div className="col-md-3">{textInput('level', 'Nivel', { placeholder: '1' })}</div>
                <div className="col-md-6">{textInput('position', 'Posición', { placeholder: 'Izquierda, centro...' })}</div>
                <div className="col-md-6">{textInput('barcode', 'Código de barras')}</div>
              </div>
            </DetailSection>

            <DetailSection title="Capacidad y operación" icon="bi-sliders">
              <div className="row g-3">
                <div className="col-md-4">{textInput('maxWeight', 'Peso máximo (kg)', { type: 'number', min: '0', step: '0.01' })}</div>
                <div className="col-md-4">{textInput('maxVolume', 'Volumen máximo (m³)', { type: 'number', min: '0', step: '0.01' })}</div>
                <div className="col-md-4">{textInput('dimensions', 'Dimensiones', { placeholder: '2 m x 1 m x 3 m' })}</div>
                <div className="col-md-4">{textInput('priority', 'Prioridad (1-10)', { type: 'number', min: '1', max: '10', step: '1' })}</div>
                <div className="col-md-8">
                  <label className="form-label">Estado y capacidades</label>
                  <div className="d-flex flex-wrap gap-4">
                    {checkbox('isActive', 'Activa')}
                    {checkbox('isPickable', 'Permite picking')}
                    {checkbox('isReceivable', 'Permite recepción')}
                  </div>
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
                    {location ? 'Guardar cambios' : 'Crear ubicación'}
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

LocationForm.displayName = 'LocationForm'
