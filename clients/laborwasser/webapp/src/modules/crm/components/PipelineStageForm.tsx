'use client'

import React, { useState } from 'react'
import { Button, Input } from '@/ui/components/base'
import type { PipelineStageFormData, StageType } from '../types'

interface PipelineStageFormProps {
  initialData?: Partial<PipelineStageFormData>
  onSubmit: (data: PipelineStageFormData) => Promise<void>
  onCancel: () => void
}

const STAGE_TYPE_OPTIONS: { value: StageType; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'opportunity', label: 'Oportunidad' },
]

export default function PipelineStageForm({ initialData, onSubmit, onCancel }: PipelineStageFormProps) {
  const [formData, setFormData] = useState<Partial<PipelineStageFormData>>({
    name: '',
    stageType: 'lead',
    probability: 0,
    sortOrder: 0,
    isActive: true,
    isClosedWon: false,
    isClosedLost: false,
    ...initialData,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido'
    }
    if (!formData.stageType) {
      newErrors.stageType = 'El tipo de etapa es requerido'
    }
    if (formData.probability === undefined || formData.probability < 0 || formData.probability > 100) {
      newErrors.probability = 'La probabilidad debe estar entre 0 y 100'
    }
    if (formData.sortOrder === undefined || formData.sortOrder < 0) {
      newErrors.sortOrder = 'El orden debe ser un numero positivo'
    }
    if (formData.isClosedWon && formData.isClosedLost) {
      newErrors.isClosedWon = 'No puede ser ganado y perdido a la vez'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData as PipelineStageFormData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof PipelineStageFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-12">
          <Input
            label="Nombre de la Etapa *"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ej: Contacto Inicial, Propuesta, Negociacion"
            errorText={errors.name}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Tipo de Etapa *</label>
          <select
            className={`form-select ${errors.stageType ? 'is-invalid' : ''}`}
            value={formData.stageType}
            onChange={(e) => handleChange('stageType', e.target.value)}
          >
            {STAGE_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.stageType && <div className="invalid-feedback">{errors.stageType}</div>}
        </div>

        <div className="col-md-6">
          <Input
            label="Probabilidad (%) *"
            type="number"
            min="0"
            max="100"
            value={formData.probability?.toString() || '0'}
            onChange={(e) => handleChange('probability', parseInt(e.target.value) || 0)}
            errorText={errors.probability}
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Orden de Visualizacion *"
            type="number"
            min="0"
            value={formData.sortOrder?.toString() || '0'}
            onChange={(e) => handleChange('sortOrder', parseInt(e.target.value) || 0)}
            errorText={errors.sortOrder}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label d-block">Estado</label>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
            />
            <label className="form-check-label" htmlFor="isActive">
              Etapa Activa
            </label>
          </div>
        </div>

        <div className="col-12">
          <hr className="my-3" />
          <h6 className="text-muted mb-3">
            <i className="bi bi-flag me-2" />
            Etapa de Cierre
          </h6>
        </div>

        <div className="col-md-6">
          <div className="form-check">
            <input
              className={`form-check-input ${errors.isClosedWon ? 'is-invalid' : ''}`}
              type="checkbox"
              id="isClosedWon"
              checked={formData.isClosedWon}
              onChange={(e) => {
                handleChange('isClosedWon', e.target.checked)
                if (e.target.checked) {
                  handleChange('isClosedLost', false)
                  handleChange('probability', 100)
                }
              }}
            />
            <label className="form-check-label text-success" htmlFor="isClosedWon">
              <i className="bi bi-trophy me-1" />
              Etapa Cerrada Ganada
            </label>
            {errors.isClosedWon && <div className="invalid-feedback">{errors.isClosedWon}</div>}
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="isClosedLost"
              checked={formData.isClosedLost}
              onChange={(e) => {
                handleChange('isClosedLost', e.target.checked)
                if (e.target.checked) {
                  handleChange('isClosedWon', false)
                  handleChange('probability', 0)
                }
              }}
            />
            <label className="form-check-label text-danger" htmlFor="isClosedLost">
              <i className="bi bi-x-circle me-1" />
              Etapa Cerrada Perdida
            </label>
          </div>
        </div>

        <div className="col-12 d-flex justify-content-end gap-2 mt-4">
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Etapa'}
          </Button>
        </div>
      </div>
    </form>
  )
}
