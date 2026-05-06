'use client'

import React, { useState } from 'react'
import { Button, Input } from '@/ui/components/base'
import type { CampaignFormData, CampaignType, CampaignStatus } from '../types'

interface CampaignFormProps {
  initialData?: Partial<CampaignFormData>
  onSubmit: (data: CampaignFormData) => Promise<void>
  onCancel: () => void
}

const TYPE_OPTIONS: { value: CampaignType; label: string }[] = [
  { value: 'email', label: 'Email Marketing' },
  { value: 'social_media', label: 'Redes Sociales' },
  { value: 'event', label: 'Evento' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'direct_mail', label: 'Correo Directo' },
  { value: 'telemarketing', label: 'Telemarketing' },
]

const STATUS_OPTIONS: { value: CampaignStatus; label: string }[] = [
  { value: 'planning', label: 'Planeacion' },
  { value: 'active', label: 'Activa' },
  { value: 'paused', label: 'Pausada' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
]

export default function CampaignForm({ initialData, onSubmit, onCancel }: CampaignFormProps) {
  const [formData, setFormData] = useState<Partial<CampaignFormData>>({
    name: '',
    type: 'email',
    status: 'planning',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    budget: 0,
    actualCost: 0,
    expectedRevenue: 0,
    actualRevenue: 0,
    targetAudience: '',
    description: '',
    userId: 1,
    ...initialData,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido'
    }
    if (!formData.type) {
      newErrors.type = 'El tipo es requerido'
    }
    if (!formData.status) {
      newErrors.status = 'El estado es requerido'
    }
    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida'
    }
    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la de inicio'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData as CampaignFormData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof CampaignFormData, value: string | number) => {
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
            label="Nombre de la Campana *"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ej: Campana de Navidad 2024"
            errorText={errors.name}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Tipo *</label>
          <select
            className={`form-select ${errors.type ? 'is-invalid' : ''}`}
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            {TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.type && <div className="invalid-feedback">{errors.type}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label">Estado *</label>
          <select
            className={`form-select ${errors.status ? 'is-invalid' : ''}`}
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.status && <div className="invalid-feedback">{errors.status}</div>}
        </div>

        <div className="col-md-6">
          <Input
            label="Fecha de Inicio *"
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            errorText={errors.startDate}
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Fecha de Fin"
            type="date"
            value={formData.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            errorText={errors.endDate}
          />
        </div>

        <div className="col-12">
          <hr className="my-3" />
          <h6 className="text-muted mb-3">
            <i className="bi bi-currency-dollar me-2" />
            Informacion Financiera
          </h6>
        </div>

        <div className="col-md-6">
          <Input
            label="Presupuesto"
            type="number"
            value={formData.budget?.toString() || '0'}
            onChange={(e) => handleChange('budget', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Costo Real"
            type="number"
            value={formData.actualCost?.toString() || '0'}
            onChange={(e) => handleChange('actualCost', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Ingreso Esperado"
            type="number"
            value={formData.expectedRevenue?.toString() || '0'}
            onChange={(e) => handleChange('expectedRevenue', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Ingreso Real"
            type="number"
            value={formData.actualRevenue?.toString() || '0'}
            onChange={(e) => handleChange('actualRevenue', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div className="col-12">
          <hr className="my-3" />
        </div>

        <div className="col-12">
          <Input
            label="Audiencia Objetivo"
            value={formData.targetAudience || ''}
            onChange={(e) => handleChange('targetAudience', e.target.value)}
            placeholder="Ej: Empresas medianas del sector tecnologico"
          />
        </div>

        <div className="col-12">
          <label className="form-label">Descripcion</label>
          <textarea
            className="form-control"
            rows={3}
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Descripcion de la campana..."
          />
        </div>

        <div className="col-12 d-flex justify-content-end gap-2 mt-4">
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Campana'}
          </Button>
        </div>
      </div>
    </form>
  )
}
