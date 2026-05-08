/**
 * CycleCount Form Component
 *
 * Form for creating and editing cycle counts.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/ui/components/base/Button'
import { Input } from '@/ui/components/base/Input'
import { useWarehouses } from '../hooks/useWarehouses'
import { useLocations } from '../hooks/useLocations'
import type { CycleCountFormData } from '../types'
import { CYCLE_COUNT_STATUS_OPTIONS, ABC_CLASS_OPTIONS } from '../types/cycleCount'

// Import products hook from products module
import { useProducts } from '@/modules/products'

interface CycleCountFormProps {
  initialData?: Partial<CycleCountFormData>
  onSubmit: (data: CycleCountFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  isEdit?: boolean
}

export const CycleCountForm: React.FC<CycleCountFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false
}) => {
  // Form state
  const [formData, setFormData] = useState<CycleCountFormData>({
    warehouseId: initialData?.warehouseId || '',
    productId: initialData?.productId || '',
    scheduledDate: initialData?.scheduledDate || new Date().toISOString().split('T')[0],
    status: initialData?.status || 'scheduled',
    warehouseLocationId: initialData?.warehouseLocationId,
    systemQuantity: initialData?.systemQuantity,
    countedQuantity: initialData?.countedQuantity,
    assignedTo: initialData?.assignedTo,
    abcClass: initialData?.abcClass,
    notes: initialData?.notes
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch warehouses and products for selects
  const { warehouses, isLoading: loadingWarehouses } = useWarehouses({})
  const { products, isLoading: loadingProducts } = useProducts({})
  const { locations, isLoading: loadingLocations } = useLocations({
    filters: formData.warehouseId ? { warehouseId: formData.warehouseId } : undefined
  })

  // Update locations when warehouse changes
  useEffect(() => {
    if (formData.warehouseId !== initialData?.warehouseId) {
      setFormData(prev => ({ ...prev, warehouseLocationId: undefined }))
    }
  }, [formData.warehouseId, initialData?.warehouseId])

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }))
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : parseFloat(value)
    }))
  }

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.warehouseId) {
      newErrors.warehouseId = 'El almacen es requerido'
    }

    if (!formData.productId) {
      newErrors.productId = 'El producto es requerido'
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'La fecha programada es requerida'
    }

    if (!formData.status) {
      newErrors.status = 'El estado es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        {/* Warehouse Select */}
        <div className="col-md-6">
          <label htmlFor="warehouseId" className="form-label">
            Almacen <span className="text-danger">*</span>
          </label>
          <select
            id="warehouseId"
            name="warehouseId"
            className={`form-select ${errors.warehouseId ? 'is-invalid' : ''}`}
            value={formData.warehouseId}
            onChange={handleChange}
            disabled={isLoading || loadingWarehouses}
          >
            <option value="">Seleccionar almacen...</option>
            {warehouses.map(warehouse => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name} ({warehouse.code})
              </option>
            ))}
          </select>
          {errors.warehouseId && <div className="invalid-feedback">{errors.warehouseId}</div>}
        </div>

        {/* Warehouse Location Select (optional) */}
        <div className="col-md-6">
          <label htmlFor="warehouseLocationId" className="form-label">
            Ubicacion
          </label>
          <select
            id="warehouseLocationId"
            name="warehouseLocationId"
            className="form-select"
            value={formData.warehouseLocationId || ''}
            onChange={handleChange}
            disabled={isLoading || loadingLocations || !formData.warehouseId}
          >
            <option value="">Sin ubicacion especifica</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name} ({location.code})
              </option>
            ))}
          </select>
        </div>

        {/* Product Select */}
        <div className="col-md-6">
          <label htmlFor="productId" className="form-label">
            Producto <span className="text-danger">*</span>
          </label>
          <select
            id="productId"
            name="productId"
            className={`form-select ${errors.productId ? 'is-invalid' : ''}`}
            value={formData.productId}
            onChange={handleChange}
            disabled={isLoading || loadingProducts}
          >
            <option value="">Seleccionar producto...</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku})
              </option>
            ))}
          </select>
          {errors.productId && <div className="invalid-feedback">{errors.productId}</div>}
        </div>

        {/* Scheduled Date */}
        <div className="col-md-6">
          <Input
            label="Fecha Programada"
            type="date"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleChange}
            errorText={errors.scheduledDate}
            required
            disabled={isLoading}
          />
        </div>

        {/* Status */}
        <div className="col-md-4">
          <label htmlFor="status" className="form-label">
            Estado <span className="text-danger">*</span>
          </label>
          <select
            id="status"
            name="status"
            className={`form-select ${errors.status ? 'is-invalid' : ''}`}
            value={formData.status}
            onChange={handleChange}
            disabled={isLoading || (!isEdit && formData.status !== 'scheduled')}
          >
            {CYCLE_COUNT_STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.status && <div className="invalid-feedback">{errors.status}</div>}
        </div>

        {/* ABC Class */}
        <div className="col-md-4">
          <label htmlFor="abcClass" className="form-label">
            Clasificacion ABC
          </label>
          <select
            id="abcClass"
            name="abcClass"
            className="form-select"
            value={formData.abcClass || ''}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="">Sin clasificar</option>
            {ABC_CLASS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <small className="text-muted">A: Mensual, B: Trimestral, C: Anual</small>
        </div>

        {/* System Quantity */}
        <div className="col-md-4">
          <Input
            label="Cantidad Sistema"
            type="number"
            name="systemQuantity"
            value={formData.systemQuantity?.toString() || ''}
            onChange={handleNumberChange}
            disabled={isLoading}
            min="0"
            step="0.0001"
          />
        </div>

        {/* Notes */}
        <div className="col-12">
          <label htmlFor="notes" className="form-label">
            Notas
          </label>
          <textarea
            id="notes"
            name="notes"
            className="form-control"
            rows={3}
            value={formData.notes || ''}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Notas adicionales sobre el conteo..."
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Guardando...
            </>
          ) : isEdit ? (
            'Actualizar Conteo'
          ) : (
            'Programar Conteo'
          )}
        </Button>
      </div>
    </form>
  )
}
