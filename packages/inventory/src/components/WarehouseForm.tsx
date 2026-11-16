/**
 * WAREHOUSE FORM
 * Alta y edicion de almacenes con la piel del rediseno (Figma Inventario, 2026-11-15):
 * datos generales, direccion desglosada y, al crear, bloque de ubicaciones
 * ("+ Agregar ubicacion") que se dan de alta despues de guardar el almacen.
 * Tipos desde WAREHOUSE_TYPE y LOCATION_TYPE (WarehouseRequest, WarehouseLocationRequest).
 */

'use client'

import React, { memo, useCallback, useState } from 'react'
import Link from 'next/link'
import { DetailSection, LwSurface, LwPageTitle } from '@lwm/ui'
import { BranchSelect } from '@lwm/auth'
import { LOCATION_TYPE, WAREHOUSE_TYPE } from '../utils/labels'
import { toNumber } from '../utils/format'
import { apiErrorList } from '../utils/listing'
import type { WarehouseParsed, CreateWarehouseData, UpdateWarehouseData, CreateLocationData } from '../types'

/** Ubicacion capturada en el alta; el almacen aun no tiene id. */
export type LocationDraft = Omit<CreateLocationData, 'warehouseId'>

interface WarehouseFormProps {
  warehouse?: WarehouseParsed
  onSubmit: (data: CreateWarehouseData | UpdateWarehouseData, locations: LocationDraft[]) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  backHref?: string
}

const CAPACITY_UNITS = [
  { value: 'm3', label: 'Metros cúbicos (m³)' },
  { value: 'ft3', label: 'Pies cúbicos (ft³)' },
  { value: 'm2', label: 'Metros cuadrados (m²)' },
  { value: 'ft2', label: 'Pies cuadrados (ft²)' },
  { value: 'pallets', label: 'Tarimas' },
  { value: 'containers', label: 'Contenedores' },
]

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

interface LocationRow {
  key: number
  name: string
  code: string
  locationType: string
  description: string
  aisle: string
  rack: string
  shelf: string
  level: string
  position: string
  barcode: string
  maxWeight: string
  maxVolume: string
  dimensions: string
  priority: string
  isPickable: boolean
  isReceivable: boolean
}

const emptyLocation = (key: number): LocationRow => ({
  key, name: '', code: '', locationType: 'shelf', description: '', aisle: '', rack: '', shelf: '',
  level: '', position: '', barcode: '', maxWeight: '', maxVolume: '', dimensions: '', priority: '5',
  isPickable: true, isReceivable: true,
})

/** Codigo sugerido de la ubicacion: codigo del almacen + consecutivo (el backend lo exige unico). */
const suggestedCode = (warehouseCode: string, index: number) =>
  `${warehouseCode.trim() || 'ALM'}-U${String(index + 1).padStart(2, '0')}`

export const WarehouseForm = memo<WarehouseFormProps>(({
  warehouse,
  onSubmit,
  onCancel,
  isLoading = false,
  backHref = '/dashboard/inventory/warehouses',
}) => {
  const [formData, setFormData] = useState({
    name: warehouse?.name || '',
    slug: warehouse?.slug || '',
    description: warehouse?.description || '',
    code: warehouse?.code || '',
    warehouseType: warehouse?.warehouseType && warehouse.warehouseType in WAREHOUSE_TYPE ? warehouse.warehouseType : 'main',
    address: warehouse?.address || '',
    street: warehouse?.street || '',
    exteriorNumber: warehouse?.exteriorNumber || '',
    interiorNumber: warehouse?.interiorNumber || '',
    neighborhood: warehouse?.neighborhood || '',
    municipality: warehouse?.municipality || '',
    addressReference: warehouse?.addressReference || '',
    city: warehouse?.city || '',
    state: warehouse?.state || '',
    country: warehouse?.country || '',
    postalCode: warehouse?.postalCode || '',
    phone: warehouse?.phone || '',
    email: warehouse?.email || '',
    managerName: warehouse?.managerName || '',
    maxCapacity: warehouse?.maxCapacity != null ? String(toNumber(warehouse.maxCapacity)) : '',
    capacityUnit: warehouse?.capacityUnit || 'm3',
    isActive: warehouse?.isActive ?? true,
    branchId: warehouse?.branchId ?? null as number | null,
  })
  const [locations, setLocations] = useState<LocationRow[]>([])
  const [nextKey, setNextKey] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitErrors, setSubmitErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setField = useCallback((field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // El slug sigue al nombre solo al crear
      ...(field === 'name' && typeof value === 'string' && !warehouse ? { slug: slugify(value) } : {}),
    }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev))
  }, [warehouse])

  const validateForm = useCallback((): boolean => {
    const next: Record<string, string> = {}
    if (!formData.name.trim()) next.name = 'El nombre es obligatorio'
    if (!formData.code.trim()) next.code = 'El código es obligatorio'
    else if (formData.code.trim().length > 50) next.code = 'Máximo 50 caracteres'
    if (!formData.slug.trim()) next.slug = 'El identificador es obligatorio'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) next.email = 'Correo no válido'
    if (formData.phone && formData.phone.length > 20) next.phone = 'Máximo 20 caracteres'
    if (formData.postalCode && formData.postalCode.length > 20) next.postalCode = 'Máximo 20 caracteres'
    if (formData.maxCapacity !== '' && (Number.isNaN(Number(formData.maxCapacity)) || Number(formData.maxCapacity) < 0)) {
      next.maxCapacity = 'La capacidad no puede ser negativa'
    }
    locations.forEach((loc, i) => {
      if (!loc.name.trim()) next[`loc-${loc.key}-name`] = 'El nombre de la ubicación es obligatorio'
      const priority = Number(loc.priority)
      if (loc.priority !== '' && (!Number.isInteger(priority) || priority < 1 || priority > 10)) {
        next[`loc-${loc.key}-priority`] = 'La prioridad va de 1 a 10'
      }
      const codes = locations.map((l, j) => (l.code.trim() || suggestedCode(formData.code, j)))
      if (codes.indexOf(codes[i]) !== i) next[`loc-${loc.key}-code`] = 'Ese código ya está en otra ubicación'
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }, [formData, locations])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitErrors([])
    if (!validateForm()) return

    const text = (value: string) => value.trim() || undefined
    const data: CreateWarehouseData = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      code: formData.code.trim(),
      description: text(formData.description),
      warehouseType: formData.warehouseType,
      address: text(formData.address),
      street: text(formData.street),
      exteriorNumber: text(formData.exteriorNumber),
      interiorNumber: text(formData.interiorNumber),
      neighborhood: text(formData.neighborhood),
      municipality: text(formData.municipality),
      addressReference: text(formData.addressReference),
      city: text(formData.city),
      state: text(formData.state),
      country: text(formData.country),
      postalCode: text(formData.postalCode),
      phone: text(formData.phone),
      email: text(formData.email),
      managerName: text(formData.managerName),
      maxCapacity: formData.maxCapacity === '' ? undefined : Number(formData.maxCapacity),
      capacityUnit: formData.capacityUnit,
      isActive: formData.isActive,
      branchId: formData.branchId,
    }

    const drafts: LocationDraft[] = locations.map((loc, i) => ({
      name: loc.name.trim(),
      code: loc.code.trim() || suggestedCode(formData.code, i),
      locationType: loc.locationType,
      description: text(loc.description),
      aisle: text(loc.aisle),
      rack: text(loc.rack),
      shelf: text(loc.shelf),
      level: text(loc.level),
      position: text(loc.position),
      barcode: text(loc.barcode),
      maxWeight: loc.maxWeight === '' ? undefined : Number(loc.maxWeight),
      maxVolume: loc.maxVolume === '' ? undefined : Number(loc.maxVolume),
      dimensions: text(loc.dimensions),
      priority: loc.priority === '' ? undefined : Number(loc.priority),
      isActive: true,
      isPickable: loc.isPickable,
      isReceivable: loc.isReceivable,
    }))

    setIsSubmitting(true)
    try {
      await onSubmit(data, drafts)
    } catch (err) {
      setSubmitErrors(apiErrorList(err, 'No se pudo guardar el almacén'))
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, locations, onSubmit, validateForm])

  const busy = isLoading || isSubmitting
  const invalid = (field: string) => (errors[field] ? ' is-invalid' : '')
  const feedback = (field: string) =>
    errors[field] ? <div className="invalid-feedback">{errors[field]}</div> : null

  const textInput = (field: keyof typeof formData, label: string, opts: { required?: boolean; placeholder?: string; type?: string; help?: string } = {}) => (
    <>
      <label htmlFor={`warehouse-${field}`} className="form-label">
        {label}
        {opts.required && <span className="text-danger"> *</span>}
      </label>
      <input
        id={`warehouse-${field}`}
        type={opts.type || 'text'}
        placeholder={opts.placeholder}
        className={`form-control${invalid(field)}`}
        value={String(formData[field] ?? '')}
        onChange={(e) => setField(field, e.target.value)}
        disabled={busy}
      />
      {feedback(field)}
      {opts.help && !errors[field] && <div className="form-text">{opts.help}</div>}
    </>
  )

  const setLocation = (key: number, field: keyof LocationRow, value: string | boolean) => {
    setLocations((prev) => prev.map((loc) => (loc.key === key ? { ...loc, [field]: value } : loc)))
    const errKey = `loc-${key}-${field}`
    setErrors((prev) => (prev[errKey] ? { ...prev, [errKey]: '' } : prev))
  }
  const addLocation = () => {
    setLocations((prev) => [...prev, emptyLocation(nextKey)])
    setNextKey((k) => k + 1)
  }
  const removeLocation = (key: number) => setLocations((prev) => prev.filter((loc) => loc.key !== key))

  const locInput = (loc: LocationRow, field: keyof LocationRow, label: string, opts: { required?: boolean; type?: string; placeholder?: string } = {}) => {
    const id = `location-${loc.key}-${field}`
    const err = errors[`loc-${loc.key}-${field}`]
    return (
      <>
        <label htmlFor={id} className="form-label">
          {label}
          {opts.required && <span className="text-danger"> *</span>}
        </label>
        <input
          id={id}
          type={opts.type || 'text'}
          placeholder={opts.placeholder}
          className={`form-control${err ? ' is-invalid' : ''}`}
          value={String(loc[field] ?? '')}
          onChange={(e) => setLocation(loc.key, field, e.target.value)}
          disabled={busy}
        />
        {err ? <div className="invalid-feedback">{err}</div> : null}
      </>
    )
  }

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <LwPageTitle
          title={warehouse ? `Editar almacén ${warehouse.name}` : 'Nuevo almacén'}
          subtitle={warehouse ? 'Modifica los datos del almacén' : 'Registra un almacén, su dirección y sus ubicaciones'}
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
          <DetailSection title="Datos generales" icon="bi-building">
            <div className="row g-3">
              <div className="col-md-6">{textInput('name', 'Nombre comercial', { required: true, placeholder: 'Almacén principal' })}</div>
              <div className="col-md-3">{textInput('code', 'Código', { required: true, placeholder: 'ALM-001' })}</div>
              <div className="col-md-3">{textInput('slug', 'Identificador', { required: true, placeholder: 'almacen-principal', help: 'Se genera solo del nombre al crear' })}</div>
              <div className="col-md-4">
                <label htmlFor="warehouse-warehouseType" className="form-label">
                  Clasificación <span className="text-danger">*</span>
                </label>
                <select
                  id="warehouse-warehouseType"
                  className="form-select"
                  value={formData.warehouseType}
                  onChange={(e) => setField('warehouseType', e.target.value)}
                  disabled={busy}
                >
                  {Object.entries(WAREHOUSE_TYPE).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="warehouse-isActive" className="form-label">Estatus</label>
                <select
                  id="warehouse-isActive"
                  className="form-select"
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) => setField('isActive', e.target.value === 'true')}
                  disabled={busy}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
                <div className="form-text">Solo los almacenes activos aparecen en movimientos, stock y lotes.</div>
              </div>
              <div className="col-md-4">
                <BranchSelect
                  id="warehouse-branch"
                  value={formData.branchId ? String(formData.branchId) : ''}
                  onChange={(id) => setFormData((prev) => ({ ...prev, branchId: id ? Number(id) : null }))}
                />
              </div>
              <div className="col-12">
                <label htmlFor="warehouse-description" className="form-label">Descripción</label>
                <textarea
                  id="warehouse-description"
                  className="form-control"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setField('description', e.target.value)}
                  disabled={busy}
                />
              </div>
              <div className="col-md-4">{textInput('managerName', 'Responsable')}</div>
              <div className="col-md-4">{textInput('phone', 'Teléfono', { type: 'tel' })}</div>
              <div className="col-md-4">{textInput('email', 'Correo', { type: 'email' })}</div>
              <div className="col-md-4">{textInput('maxCapacity', 'Capacidad máxima', { type: 'number' })}</div>
              <div className="col-md-4">
                <label htmlFor="warehouse-capacityUnit" className="form-label">Unidad de capacidad</label>
                <select
                  id="warehouse-capacityUnit"
                  className="form-select"
                  value={formData.capacityUnit}
                  onChange={(e) => setField('capacityUnit', e.target.value)}
                  disabled={busy}
                >
                  {CAPACITY_UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Dirección" icon="bi-geo-alt">
            <div className="row g-3">
              <div className="col-md-3">{textInput('postalCode', 'Código postal')}</div>
              <div className="col-md-3">{textInput('country', 'País', { placeholder: 'México' })}</div>
              <div className="col-md-3">{textInput('state', 'Estado')}</div>
              <div className="col-md-3">{textInput('municipality', 'Municipio o alcaldía')}</div>
              <div className="col-md-4">{textInput('city', 'Ciudad')}</div>
              <div className="col-md-4">{textInput('neighborhood', 'Colonia')}</div>
              <div className="col-md-4">{textInput('street', 'Calle')}</div>
              <div className="col-md-3">{textInput('exteriorNumber', 'Número exterior')}</div>
              <div className="col-md-3">{textInput('interiorNumber', 'Número interior')}</div>
              <div className="col-md-6">{textInput('addressReference', 'Referencia', { placeholder: 'Entre calles, frente a...' })}</div>
              {warehouse?.address ? (
                <div className="col-12">
                  {textInput('address', 'Dirección anterior (texto libre)', { help: 'Es la dirección capturada antes del desglose; pásala a los campos de arriba y bórrala aquí.' })}
                </div>
              ) : null}
            </div>
          </DetailSection>

          {warehouse ? (
            <DetailSection title="Ubicaciones" icon="bi-grid-3x3-gap">
              <p className="mb-0">
                Este almacén tiene {warehouse.locationsCount ?? 0} ubicaciones.{' '}
                <Link href={`/dashboard/inventory/warehouses/${warehouse.id}`}>Adminístralas en la consulta del almacén</Link>, pestaña Ubicaciones.
              </p>
            </DetailSection>
          ) : (
            <DetailSection title="Ubicaciones" icon="bi-grid-3x3-gap">
              {locations.length === 0 ? (
                <p className="text-muted">Puedes agregar las ubicaciones ahora o después, desde la consulta del almacén.</p>
              ) : null}
              {locations.map((loc, i) => (
                <fieldset key={loc.key} className="border rounded p-3 mb-3" aria-label={`Ubicación ${i + 1}`}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <legend className="h6 mb-0 w-auto">Ubicación {i + 1}</legend>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeLocation(loc.key)} disabled={busy}>
                      <i className="bi bi-trash me-1" aria-hidden="true" /> Quitar
                    </button>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-4">{locInput(loc, 'name', 'Nombre', { required: true, placeholder: 'Estante A1' })}</div>
                    <div className="col-md-4">{locInput(loc, 'code', 'Código', { placeholder: suggestedCode(formData.code, i) })}</div>
                    <div className="col-md-4">
                      <label htmlFor={`location-${loc.key}-locationType`} className="form-label">
                        Tipo de ubicación <span className="text-danger">*</span>
                      </label>
                      <select
                        id={`location-${loc.key}-locationType`}
                        className="form-select"
                        value={loc.locationType}
                        onChange={(e) => setLocation(loc.key, 'locationType', e.target.value)}
                        disabled={busy}
                      >
                        {Object.entries(LOCATION_TYPE).map(([value, { label }]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">{locInput(loc, 'description', 'Descripción')}</div>
                    <div className="col-md-2">{locInput(loc, 'aisle', 'Pasillo')}</div>
                    <div className="col-md-2">{locInput(loc, 'rack', 'Rack')}</div>
                    <div className="col-md-2">{locInput(loc, 'shelf', 'Estante')}</div>
                    <div className="col-md-2">{locInput(loc, 'level', 'Nivel')}</div>
                    <div className="col-md-2">{locInput(loc, 'position', 'Posición')}</div>
                    <div className="col-md-2">{locInput(loc, 'priority', 'Prioridad (1 a 10)', { type: 'number' })}</div>
                    <div className="col-md-3">{locInput(loc, 'barcode', 'Código de barras')}</div>
                    <div className="col-md-3">{locInput(loc, 'maxWeight', 'Peso máximo (kg)', { type: 'number' })}</div>
                    <div className="col-md-3">{locInput(loc, 'maxVolume', 'Volumen máximo (m³)', { type: 'number' })}</div>
                    <div className="col-md-3">{locInput(loc, 'dimensions', 'Dimensiones', { placeholder: '120x80x200 cm' })}</div>
                    <div className="col-12 d-flex gap-4">
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id={`location-${loc.key}-isPickable`} checked={loc.isPickable} onChange={(e) => setLocation(loc.key, 'isPickable', e.target.checked)} disabled={busy} />
                        <label className="form-check-label" htmlFor={`location-${loc.key}-isPickable`}>Permite surtir (picking)</label>
                      </div>
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id={`location-${loc.key}-isReceivable`} checked={loc.isReceivable} onChange={(e) => setLocation(loc.key, 'isReceivable', e.target.checked)} disabled={busy} />
                        <label className="form-check-label" htmlFor={`location-${loc.key}-isReceivable`}>Permite recepción</label>
                      </div>
                    </div>
                  </div>
                </fieldset>
              ))}
              <button type="button" className="btn btn-outline-primary" onClick={addLocation} disabled={busy}>
                <i className="bi bi-plus-lg me-1" aria-hidden="true" /> Agregar ubicación
              </button>
            </DetailSection>
          )}

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
                  {warehouse ? 'Guardar cambios' : 'Crear almacén'}
                </>
              )}
            </button>
          </div>
        </form>
      </LwSurface>
    </div>
  )
})

WarehouseForm.displayName = 'WarehouseForm'
