/**
 * WAREHOUSE FORM
 * Alta y edicion de almacenes. Tipos desde WAREHOUSE_TYPE (WarehouseRequest).
 */

'use client'

import React, { memo, useCallback, useState } from 'react'
import { DetailSection, PageHeader } from '@lwm/ui'
import { BranchSelect } from '@lwm/auth'
import { WAREHOUSE_TYPE } from '../utils/labels'
import { toNumber } from '../utils/format'
import { apiErrorList } from '../utils/listing'
import type { WarehouseParsed, CreateWarehouseData, UpdateWarehouseData } from '../types'

interface WarehouseFormProps {
  warehouse?: WarehouseParsed
  onSubmit: (data: CreateWarehouseData | UpdateWarehouseData) => Promise<void>
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
    setErrors(next)
    return Object.keys(next).length === 0
  }, [formData])

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

    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (err) {
      setSubmitErrors(apiErrorList(err, 'No se pudo guardar el almacén'))
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, onSubmit, validateForm])

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

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <PageHeader
            title={warehouse ? `Editar almacén ${warehouse.name}` : 'Nuevo almacén'}
            subtitle={warehouse ? 'Modifica los datos del almacén' : 'Registra un almacén y asígnalo a una sucursal'}
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
            <DetailSection title="Información general" icon="bi-building">
              <div className="row g-3">
                <div className="col-md-6">{textInput('name', 'Nombre', { required: true, placeholder: 'Almacén principal' })}</div>
                <div className="col-md-6">{textInput('code', 'Código', { required: true, placeholder: 'ALM-001' })}</div>
                <div className="col-md-6">{textInput('slug', 'Identificador', { required: true, placeholder: 'almacen-principal', help: 'Versión del nombre para URLs; se genera sola al crear' })}</div>
                <div className="col-md-6">
                  <label htmlFor="warehouse-warehouseType" className="form-label">
                    Tipo <span className="text-danger">*</span>
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
                <div className="col-md-6">
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
              </div>
            </DetailSection>

            <DetailSection title="Dirección" icon="bi-geo-alt">
              <div className="row g-3">
                <div className="col-12">{textInput('address', 'Calle y número')}</div>
                <div className="col-md-4">{textInput('city', 'Ciudad')}</div>
                <div className="col-md-4">{textInput('state', 'Estado')}</div>
                <div className="col-md-4">{textInput('postalCode', 'Código postal')}</div>
                <div className="col-md-6">{textInput('country', 'País')}</div>
              </div>
            </DetailSection>

            <DetailSection title="Contacto" icon="bi-person">
              <div className="row g-3">
                <div className="col-md-6">{textInput('managerName', 'Responsable')}</div>
                <div className="col-md-6">{textInput('phone', 'Teléfono', { type: 'tel' })}</div>
                <div className="col-md-6">{textInput('email', 'Correo', { type: 'email' })}</div>
              </div>
            </DetailSection>

            <DetailSection title="Capacidad y estado" icon="bi-box-seam">
              <div className="row g-3">
                <div className="col-md-6">{textInput('maxCapacity', 'Capacidad máxima', { type: 'number' })}</div>
                <div className="col-md-6">
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
                <div className="col-12">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="warehouse-isActive"
                      checked={formData.isActive}
                      onChange={(e) => setField('isActive', e.target.checked)}
                      disabled={busy}
                    />
                    <label className="form-check-label" htmlFor="warehouse-isActive">Almacén activo</label>
                    <div className="form-text">Solo los almacenes activos aparecen en movimientos, stock y lotes.</div>
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
                    {warehouse ? 'Guardar cambios' : 'Crear almacén'}
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

WarehouseForm.displayName = 'WarehouseForm'
