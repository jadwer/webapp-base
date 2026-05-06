/**
 * Budget Form Component
 *
 * Form for creating and editing budgets.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/ui/components/base/Button'
import { Input } from '@/ui/components/base/Input'
import type { BudgetFormData, BudgetType, BudgetPeriodType, ParsedBudget } from '../types'
import { BUDGET_TYPE_OPTIONS, BUDGET_PERIOD_TYPE_OPTIONS } from '../types'

interface BudgetFormProps {
  initialData?: ParsedBudget | null
  onSubmit: (data: BudgetFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  isEdit?: boolean
}

const getDefaultFormData = (): BudgetFormData => ({
  name: '',
  code: '',
  description: '',
  budgetType: 'general',
  periodType: 'annual',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
  budgetedAmount: 0,
  warningThreshold: 80,
  criticalThreshold: 95,
  hardLimit: false,
  allowOvercommit: false,
  isActive: true,
})

export const BudgetForm: React.FC<BudgetFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<BudgetFormData>(getDefaultFormData())
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        code: initialData.code,
        description: initialData.description || '',
        budgetType: initialData.budgetType,
        departmentCode: initialData.departmentCode || undefined,
        categoryId: initialData.categoryId || undefined,
        projectCode: initialData.projectCode || undefined,
        contactId: initialData.contactId || undefined,
        periodType: initialData.periodType,
        startDate: initialData.startDate?.split('T')[0] || '',
        endDate: initialData.endDate?.split('T')[0] || '',
        fiscalYear: initialData.fiscalYear || undefined,
        budgetedAmount: initialData.budgetedAmount,
        warningThreshold: initialData.warningThreshold || 80,
        criticalThreshold: initialData.criticalThreshold || 95,
        hardLimit: initialData.hardLimit || false,
        allowOvercommit: initialData.allowOvercommit || false,
        isActive: initialData.isActive !== false,
      })
    }
  }, [initialData])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (!formData.code.trim()) {
      newErrors.code = 'El codigo es requerido'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de fin es requerida'
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio'
    }

    if (formData.budgetedAmount <= 0) {
      newErrors.budgetedAmount = 'El monto presupuestado debe ser mayor a 0'
    }

    if ((formData.warningThreshold || 0) >= (formData.criticalThreshold || 100)) {
      newErrors.warningThreshold = 'El umbral de advertencia debe ser menor al umbral critico'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    await onSubmit(formData)
  }

  const handleChange = (field: keyof BudgetFormData, value: string | number | boolean | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Auto-generate code from name
  const handleNameChange = (name: string) => {
    handleChange('name', name)
    if (!isEdit && !formData.code) {
      const code = name
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 20)
      handleChange('code', code)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        {/* Basic Info */}
        <div className="col-12">
          <h6 className="text-muted mb-3">Informacion Basica</h6>
        </div>

        <div className="col-md-8">
          <Input
            label="Nombre del Presupuesto"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            errorText={errors.name}
            required
            placeholder="Ej: Presupuesto Marketing Q1 2025"
          />
        </div>

        <div className="col-md-4">
          <Input
            label="Codigo"
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
            errorText={errors.code}
            required
            placeholder="Ej: MKTG-Q1-2025"
            maxLength={30}
          />
        </div>

        <div className="col-12">
          <Input
            label="Descripcion"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Descripcion opcional del presupuesto"
          />
        </div>

        {/* Type and Period */}
        <div className="col-12 mt-4">
          <h6 className="text-muted mb-3">Tipo y Periodo</h6>
        </div>

        <div className="col-md-6">
          <label className="form-label">Tipo de Presupuesto <span className="text-danger">*</span></label>
          <select
            className="form-select"
            value={formData.budgetType}
            onChange={(e) => handleChange('budgetType', e.target.value as BudgetType)}
          >
            {BUDGET_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Tipo de Periodo <span className="text-danger">*</span></label>
          <select
            className="form-select"
            value={formData.periodType}
            onChange={(e) => handleChange('periodType', e.target.value as BudgetPeriodType)}
          >
            {BUDGET_PERIOD_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Conditional fields based on budget type */}
        {formData.budgetType === 'department' && (
          <div className="col-md-6">
            <Input
              label="Codigo de Departamento"
              value={formData.departmentCode || ''}
              onChange={(e) => handleChange('departmentCode', e.target.value)}
              placeholder="Ej: DEPT-001"
            />
          </div>
        )}

        {formData.budgetType === 'project' && (
          <div className="col-md-6">
            <Input
              label="Codigo de Proyecto"
              value={formData.projectCode || ''}
              onChange={(e) => handleChange('projectCode', e.target.value)}
              placeholder="Ej: PROJ-2025-001"
            />
          </div>
        )}

        {/* Dates */}
        <div className="col-md-4">
          <Input
            type="date"
            label="Fecha de Inicio"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            errorText={errors.startDate}
            required
          />
        </div>

        <div className="col-md-4">
          <Input
            type="date"
            label="Fecha de Fin"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            errorText={errors.endDate}
            required
          />
        </div>

        <div className="col-md-4">
          <Input
            type="number"
            label="Ano Fiscal"
            value={formData.fiscalYear?.toString() || ''}
            onChange={(e) => handleChange('fiscalYear', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Ej: 2025"
          />
        </div>

        {/* Amounts */}
        <div className="col-12 mt-4">
          <h6 className="text-muted mb-3">Montos y Umbrales</h6>
        </div>

        <div className="col-md-4">
          <Input
            type="number"
            label="Monto Presupuestado"
            value={formData.budgetedAmount.toString()}
            onChange={(e) => handleChange('budgetedAmount', parseFloat(e.target.value) || 0)}
            errorText={errors.budgetedAmount}
            required
            min={0}
            step={0.01}
            leftIcon="bi-currency-dollar"
          />
        </div>

        <div className="col-md-4">
          <Input
            type="number"
            label="Umbral de Advertencia (%)"
            value={(formData.warningThreshold || 80).toString()}
            onChange={(e) => handleChange('warningThreshold', parseInt(e.target.value) || 80)}
            errorText={errors.warningThreshold}
            min={0}
            max={100}
            helpText="Porcentaje para mostrar advertencia"
          />
        </div>

        <div className="col-md-4">
          <Input
            type="number"
            label="Umbral Critico (%)"
            value={(formData.criticalThreshold || 95).toString()}
            onChange={(e) => handleChange('criticalThreshold', parseInt(e.target.value) || 95)}
            min={0}
            max={100}
            helpText="Porcentaje para mostrar alerta critica"
          />
        </div>

        {/* Options */}
        <div className="col-12 mt-4">
          <h6 className="text-muted mb-3">Opciones</h6>
        </div>

        <div className="col-md-4">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="hardLimit"
              checked={formData.hardLimit || false}
              onChange={(e) => handleChange('hardLimit', e.target.checked)}
            />
            <label className="form-check-label" htmlFor="hardLimit">
              Limite Estricto
            </label>
          </div>
          <small className="text-muted">No permitir exceder el presupuesto</small>
        </div>

        <div className="col-md-4">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="allowOvercommit"
              checked={formData.allowOvercommit || false}
              onChange={(e) => handleChange('allowOvercommit', e.target.checked)}
            />
            <label className="form-check-label" htmlFor="allowOvercommit">
              Permitir Sobrecompromiso
            </label>
          </div>
          <small className="text-muted">Permitir comprometer mas del disponible</small>
        </div>

        <div className="col-md-4">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="isActive"
              checked={formData.isActive !== false}
              onChange={(e) => handleChange('isActive', e.target.checked)}
            />
            <label className="form-check-label" htmlFor="isActive">
              Activo
            </label>
          </div>
          <small className="text-muted">Presupuesto habilitado para uso</small>
        </div>

        {/* Actions */}
        <div className="col-12 mt-4">
          <hr />
          <div className="d-flex justify-content-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  {isEdit ? 'Guardando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <i className={`bi ${isEdit ? 'bi-check-lg' : 'bi-plus-lg'} me-2`} />
                  {isEdit ? 'Guardar Cambios' : 'Crear Presupuesto'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default BudgetForm
