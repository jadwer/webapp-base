/**
 * DiscountRule Form Component
 *
 * Form for creating and editing discount rules.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/ui/components/base/Button'
import { Input } from '@/ui/components/base/Input'
import type { DiscountRuleFormData, DiscountType, DiscountAppliesTo } from '../types'
import { DISCOUNT_TYPE_OPTIONS, APPLIES_TO_OPTIONS } from '../types'

interface DiscountRuleFormProps {
  initialData?: Partial<DiscountRuleFormData>
  onSubmit: (data: DiscountRuleFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  isEdit?: boolean
}

export const DiscountRuleForm: React.FC<DiscountRuleFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false
}) => {
  // Form state
  const [formData, setFormData] = useState<DiscountRuleFormData>({
    name: initialData?.name || '',
    code: initialData?.code || '',
    description: initialData?.description || '',
    discountType: initialData?.discountType || 'percentage',
    discountValue: initialData?.discountValue || 0,
    buyQuantity: initialData?.buyQuantity,
    getQuantity: initialData?.getQuantity,
    appliesTo: initialData?.appliesTo || 'order',
    minOrderAmount: initialData?.minOrderAmount,
    minQuantity: initialData?.minQuantity,
    maxDiscountAmount: initialData?.maxDiscountAmount,
    productIds: initialData?.productIds || [],
    categoryIds: initialData?.categoryIds || [],
    customerIds: initialData?.customerIds || [],
    customerClassifications: initialData?.customerClassifications || [],
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    usageLimit: initialData?.usageLimit,
    usagePerCustomer: initialData?.usagePerCustomer,
    priority: initialData?.priority || 0,
    isCombinable: initialData?.isCombinable ?? true,
    isActive: initialData?.isActive ?? true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-generate code from name if not editing
  useEffect(() => {
    if (!isEdit && formData.name && !formData.code) {
      const generatedCode = formData.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 20)
      setFormData(prev => ({ ...prev, code: generatedCode }))
    }
  }, [formData.name, isEdit, formData.code])

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : value
      }))
    }

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

  // Handle discount type change
  const handleDiscountTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as DiscountType
    setFormData(prev => ({
      ...prev,
      discountType: newType,
      // Reset buy_x_get_y specific fields if changing away from that type
      buyQuantity: newType === 'buy_x_get_y' ? prev.buyQuantity : undefined,
      getQuantity: newType === 'buy_x_get_y' ? prev.getQuantity : undefined
    }))
  }

  // Handle applies to change
  const handleAppliesToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAppliesTo = e.target.value as DiscountAppliesTo
    setFormData(prev => ({
      ...prev,
      appliesTo: newAppliesTo,
      // Reset specific fields based on applies_to
      productIds: newAppliesTo === 'product' ? prev.productIds : [],
      categoryIds: newAppliesTo === 'category' ? prev.categoryIds : []
    }))
  }

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (!formData.code?.trim()) {
      newErrors.code = 'El codigo es requerido'
    } else if (!/^[A-Z0-9_-]+$/i.test(formData.code)) {
      newErrors.code = 'El codigo solo puede contener letras, numeros, guiones y guiones bajos'
    }

    if (!formData.discountType) {
      newErrors.discountType = 'El tipo de descuento es requerido'
    }

    if (formData.discountType !== 'buy_x_get_y') {
      if (!formData.discountValue || formData.discountValue <= 0) {
        newErrors.discountValue = 'El valor del descuento debe ser mayor a 0'
      }

      if (formData.discountType === 'percentage' && formData.discountValue > 100) {
        newErrors.discountValue = 'El porcentaje no puede ser mayor a 100'
      }
    }

    if (formData.discountType === 'buy_x_get_y') {
      if (!formData.buyQuantity || formData.buyQuantity <= 0) {
        newErrors.buyQuantity = 'La cantidad a comprar es requerida'
      }
      if (!formData.getQuantity || formData.getQuantity <= 0) {
        newErrors.getQuantity = 'La cantidad a obtener es requerida'
      }
    }

    if (!formData.appliesTo) {
      newErrors.appliesTo = 'El campo "Aplica a" es requerido'
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio'
      }
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

  const isBuyXGetY = formData.discountType === 'buy_x_get_y'

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        {/* Basic Information */}
        <div className="col-12">
          <h6 className="text-muted border-bottom pb-2 mb-3">Informacion Basica</h6>
        </div>

        {/* Name */}
        <div className="col-md-6">
          <Input
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={handleChange}
            errorText={errors.name}
            required
            disabled={isLoading}
            placeholder="Ej: Descuento de Verano"
          />
        </div>

        {/* Code */}
        <div className="col-md-6">
          <Input
            label="Codigo"
            name="code"
            value={formData.code}
            onChange={handleChange}
            errorText={errors.code}
            required
            disabled={isLoading}
            placeholder="Ej: VERANO2025"
          />
          <small className="text-muted">Codigo unico para identificar la regla</small>
        </div>

        {/* Description */}
        <div className="col-12">
          <label htmlFor="description" className="form-label">
            Descripcion
          </label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            rows={2}
            value={formData.description || ''}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Descripcion opcional de la regla..."
          />
        </div>

        {/* Discount Configuration */}
        <div className="col-12 mt-4">
          <h6 className="text-muted border-bottom pb-2 mb-3">Configuracion del Descuento</h6>
        </div>

        {/* Discount Type */}
        <div className="col-md-4">
          <label htmlFor="discountType" className="form-label">
            Tipo de Descuento <span className="text-danger">*</span>
          </label>
          <select
            id="discountType"
            name="discountType"
            className={`form-select ${errors.discountType ? 'is-invalid' : ''}`}
            value={formData.discountType}
            onChange={handleDiscountTypeChange}
            disabled={isLoading}
          >
            {DISCOUNT_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.discountType && <div className="invalid-feedback">{errors.discountType}</div>}
        </div>

        {/* Discount Value (for percentage and fixed) */}
        {!isBuyXGetY && (
          <div className="col-md-4">
            <Input
              label={formData.discountType === 'percentage' ? 'Porcentaje (%)' : 'Monto ($)'}
              type="number"
              name="discountValue"
              value={formData.discountValue?.toString() || ''}
              onChange={handleNumberChange}
              errorText={errors.discountValue}
              required
              disabled={isLoading}
              min="0"
              max={formData.discountType === 'percentage' ? '100' : undefined}
              step="0.01"
            />
          </div>
        )}

        {/* Buy X Get Y fields */}
        {isBuyXGetY && (
          <>
            <div className="col-md-4">
              <Input
                label="Cantidad a Comprar"
                type="number"
                name="buyQuantity"
                value={formData.buyQuantity?.toString() || ''}
                onChange={handleNumberChange}
                errorText={errors.buyQuantity}
                required
                disabled={isLoading}
                min="1"
                step="1"
              />
            </div>
            <div className="col-md-4">
              <Input
                label="Cantidad a Obtener (gratis)"
                type="number"
                name="getQuantity"
                value={formData.getQuantity?.toString() || ''}
                onChange={handleNumberChange}
                errorText={errors.getQuantity}
                required
                disabled={isLoading}
                min="1"
                step="1"
              />
            </div>
          </>
        )}

        {/* Max Discount Amount */}
        <div className="col-md-4">
          <Input
            label="Descuento Maximo ($)"
            type="number"
            name="maxDiscountAmount"
            value={formData.maxDiscountAmount?.toString() || ''}
            onChange={handleNumberChange}
            disabled={isLoading}
            min="0"
            step="0.01"
            placeholder="Sin limite"
          />
          <small className="text-muted">Opcional: limita el descuento maximo</small>
        </div>

        {/* Applies To */}
        <div className="col-md-4">
          <label htmlFor="appliesTo" className="form-label">
            Aplica a <span className="text-danger">*</span>
          </label>
          <select
            id="appliesTo"
            name="appliesTo"
            className={`form-select ${errors.appliesTo ? 'is-invalid' : ''}`}
            value={formData.appliesTo}
            onChange={handleAppliesToChange}
            disabled={isLoading}
          >
            {APPLIES_TO_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.appliesTo && <div className="invalid-feedback">{errors.appliesTo}</div>}
        </div>

        {/* Minimum Requirements */}
        <div className="col-md-4">
          <Input
            label="Monto Minimo de Orden ($)"
            type="number"
            name="minOrderAmount"
            value={formData.minOrderAmount?.toString() || ''}
            onChange={handleNumberChange}
            disabled={isLoading}
            min="0"
            step="0.01"
            placeholder="Sin minimo"
          />
        </div>

        <div className="col-md-4">
          <Input
            label="Cantidad Minima"
            type="number"
            name="minQuantity"
            value={formData.minQuantity?.toString() || ''}
            onChange={handleNumberChange}
            disabled={isLoading}
            min="1"
            step="1"
            placeholder="Sin minimo"
          />
        </div>

        {/* Validity Period */}
        <div className="col-12 mt-4">
          <h6 className="text-muted border-bottom pb-2 mb-3">Periodo de Vigencia</h6>
        </div>

        <div className="col-md-4">
          <Input
            label="Fecha de Inicio"
            type="date"
            name="startDate"
            value={formData.startDate || ''}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="col-md-4">
          <Input
            label="Fecha de Fin"
            type="date"
            name="endDate"
            value={formData.endDate || ''}
            onChange={handleChange}
            errorText={errors.endDate}
            disabled={isLoading}
          />
        </div>

        {/* Usage Limits */}
        <div className="col-12 mt-4">
          <h6 className="text-muted border-bottom pb-2 mb-3">Limites de Uso</h6>
        </div>

        <div className="col-md-4">
          <Input
            label="Limite de Uso Total"
            type="number"
            name="usageLimit"
            value={formData.usageLimit?.toString() || ''}
            onChange={handleNumberChange}
            disabled={isLoading}
            min="1"
            step="1"
            placeholder="Sin limite"
          />
        </div>

        <div className="col-md-4">
          <Input
            label="Uso por Cliente"
            type="number"
            name="usagePerCustomer"
            value={formData.usagePerCustomer?.toString() || ''}
            onChange={handleNumberChange}
            disabled={isLoading}
            min="1"
            step="1"
            placeholder="Sin limite"
          />
        </div>

        <div className="col-md-4">
          <Input
            label="Prioridad"
            type="number"
            name="priority"
            value={formData.priority?.toString() || '0'}
            onChange={handleNumberChange}
            disabled={isLoading}
            min="0"
            step="1"
          />
          <small className="text-muted">Mayor numero = mayor prioridad</small>
        </div>

        {/* Options */}
        <div className="col-12 mt-4">
          <h6 className="text-muted border-bottom pb-2 mb-3">Opciones</h6>
        </div>

        <div className="col-md-6">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="isCombinable"
              name="isCombinable"
              checked={formData.isCombinable}
              onChange={handleChange}
              disabled={isLoading}
            />
            <label className="form-check-label" htmlFor="isCombinable">
              Combinable con otros descuentos
            </label>
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              disabled={isLoading}
            />
            <label className="form-check-label" htmlFor="isActive">
              Regla activa
            </label>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
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
            'Actualizar Regla'
          ) : (
            'Crear Regla'
          )}
        </Button>
      </div>
    </form>
  )
}

export default DiscountRuleForm
