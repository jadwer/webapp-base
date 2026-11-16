/**
 * Formulario de conteo ciclico con la piel del rediseno (2026-11-16). Programa el conteo
 * (almacen, ubicacion, producto, fecha, clase ABC y notas). El estatus y lo contado no se
 * capturan aqui: cambian con Iniciar, Registrar conteo y Cancelar en el detalle.
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { DetailSection, LwSurface, LwPageTitle, todayDateInput } from '@lwm/ui'
import { ProductSearchSelect } from '@lwm/products'
import { useWarehouses } from '../hooks/useWarehouses'
import { useLocations } from '../hooks/useLocations'
import type { CycleCountFormData } from '../types'
import { ABC_CLASS_OPTIONS } from '../types/cycleCount'

interface CycleCountFormProps {
  initialData?: Partial<CycleCountFormData>
  /** Etiqueta del producto al editar (evita la consulta extra) */
  initialProduct?: { id: string; name: string; sku?: string } | null
  onSubmit: (data: CycleCountFormData) => Promise<void>
  isLoading?: boolean
  isEdit?: boolean
  countNumber?: string
  backHref: string
  /** Errores del backend, con detalle */
  submitErrors?: string[]
}

export const CycleCountForm: React.FC<CycleCountFormProps> = ({
  initialData,
  initialProduct,
  onSubmit,
  isLoading = false,
  isEdit = false,
  countNumber,
  backHref,
  submitErrors = [],
}) => {
  const [formData, setFormData] = useState<CycleCountFormData>({
    warehouseId: initialData?.warehouseId || '',
    productId: initialData?.productId || '',
    scheduledDate: initialData?.scheduledDate || todayDateInput(),
    warehouseLocationId: initialData?.warehouseLocationId,
    assignedTo: initialData?.assignedTo,
    abcClass: initialData?.abcClass,
    notes: initialData?.notes,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { warehouses, isLoading: loadingWarehouses } = useWarehouses({ filters: { isActive: true }, pagination: { size: 100 } })
  const { locations, isLoading: loadingLocations } = useLocations({
    filters: formData.warehouseId ? { warehouseId: formData.warehouseId } : undefined,
    pagination: { size: 100 },
  })

  const set = <K extends keyof CycleCountFormData>(name: K, value: CycleCountFormData[K]) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as string]) setErrors((prev) => ({ ...prev, [name as string]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!formData.warehouseId) next.warehouseId = 'Elige el almacén.'
    if (!formData.productId) next.productId = 'Elige el producto.'
    if (!formData.scheduledDate) next.scheduledDate = 'Indica la fecha programada.'
    setErrors(next)
    if (Object.keys(next).length) return
    await onSubmit(formData)
  }

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <LwPageTitle
          title={isEdit ? 'Editar conteo:' : 'Nuevo conteo'}
          highlight={isEdit ? countNumber : undefined}
          subtitle={isEdit ? 'Datos del conteo programado' : 'Programa un conteo físico de un producto en un almacén'}
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
          <DetailSection title="Qué se cuenta" icon="bi-clipboard-check">
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="cc-warehouseId" className="form-label">Almacén <span className="text-danger">*</span></label>
                <select
                  id="cc-warehouseId"
                  className={`form-select ${errors.warehouseId ? 'is-invalid' : ''}`}
                  value={formData.warehouseId}
                  onChange={(e) => { set('warehouseId', e.target.value); set('warehouseLocationId', undefined) }}
                  disabled={isLoading || loadingWarehouses}
                >
                  <option value="">Elige un almacén</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}{w.code ? ` (${w.code})` : ''}</option>)}
                </select>
                {errors.warehouseId && <div className="invalid-feedback">{errors.warehouseId}</div>}
              </div>
              <div className="col-md-6">
                <label htmlFor="cc-warehouseLocationId" className="form-label">Ubicación</label>
                <select
                  id="cc-warehouseLocationId"
                  className="form-select"
                  value={formData.warehouseLocationId || ''}
                  onChange={(e) => set('warehouseLocationId', e.target.value || undefined)}
                  disabled={isLoading || loadingLocations || !formData.warehouseId}
                >
                  <option value="">Todo el almacén (sin ubicación)</option>
                  {locations.map((l) => <option key={l.id} value={l.id}>{l.name}{l.code ? ` (${l.code})` : ''}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <ProductSearchSelect
                  id="cc-productId"
                  label="Producto"
                  value={formData.productId}
                  initialProduct={initialProduct ?? undefined}
                  onChange={(id) => set('productId', id)}
                  errorText={errors.productId}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="col-md-3">
                <label htmlFor="cc-scheduledDate" className="form-label">Fecha programada <span className="text-danger">*</span></label>
                <input
                  id="cc-scheduledDate"
                  type="date"
                  className={`form-control ${errors.scheduledDate ? 'is-invalid' : ''}`}
                  value={formData.scheduledDate}
                  onChange={(e) => set('scheduledDate', e.target.value)}
                  disabled={isLoading}
                />
                {errors.scheduledDate && <div className="invalid-feedback">{errors.scheduledDate}</div>}
              </div>
              <div className="col-md-3">
                <label htmlFor="cc-abcClass" className="form-label">Clasificación ABC</label>
                <select
                  id="cc-abcClass"
                  className="form-select"
                  value={formData.abcClass || ''}
                  onChange={(e) => set('abcClass', (e.target.value || undefined) as CycleCountFormData['abcClass'])}
                  disabled={isLoading}
                >
                  <option value="">Sin clasificar</option>
                  {ABC_CLASS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="col-12">
                <label htmlFor="cc-notes" className="form-label">Notas</label>
                <textarea
                  id="cc-notes"
                  className="form-control"
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => set('notes', e.target.value || undefined)}
                  disabled={isLoading}
                  placeholder="Indicaciones para quien cuenta"
                />
              </div>
            </div>
            <p className="small text-muted mt-3 mb-0">
              La existencia en sistema y la diferencia las calcula el sistema al registrar lo contado; si lo eliges, la diferencia se ajusta en Movimientos.
            </p>
          </DetailSection>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link href={backHref} className="btn btn-outline-secondary">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
              {isEdit ? 'Guardar cambios' : 'Programar conteo'}
            </button>
          </div>
        </form>
      </LwSurface>
    </div>
  )
}
