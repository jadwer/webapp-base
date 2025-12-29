'use client'

import React, { useState } from 'react'
import { Button, Input } from '@/ui/components/base'
import type { LeadFormData, LeadStatus, LeadRating } from '../types'

interface LeadFormProps {
  initialData?: Partial<LeadFormData>
  onSubmit: (data: LeadFormData) => Promise<void>
  onCancel: () => void
}

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'Nuevo' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'qualified', label: 'Calificado' },
  { value: 'unqualified', label: 'No Calificado' },
  { value: 'converted', label: 'Convertido' },
]

const RATING_OPTIONS: { value: LeadRating; label: string }[] = [
  { value: 'hot', label: 'Caliente' },
  { value: 'warm', label: 'Tibio' },
  { value: 'cold', label: 'Frio' },
]

export default function LeadForm({ initialData, onSubmit, onCancel }: LeadFormProps) {
  const [formData, setFormData] = useState<Partial<LeadFormData>>({
    title: '',
    status: 'new',
    rating: 'warm',
    source: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    estimatedValue: 0,
    estimatedCloseDate: '',
    notes: '',
    userId: 1,
    ...initialData,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) {
      newErrors.title = 'El titulo es requerido'
    }
    if (!formData.status) {
      newErrors.status = 'El estado es requerido'
    }
    if (!formData.rating) {
      newErrors.rating = 'La calificacion es requerida'
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData as LeadFormData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof LeadFormData, value: string | number) => {
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
            label="Titulo *"
            value={formData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Ej: Oportunidad de venta - Empresa XYZ"
            errorText={errors.title}
          />
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
          <label className="form-label">Calificacion *</label>
          <select
            className={`form-select ${errors.rating ? 'is-invalid' : ''}`}
            value={formData.rating}
            onChange={(e) => handleChange('rating', e.target.value)}
          >
            {RATING_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.rating && <div className="invalid-feedback">{errors.rating}</div>}
        </div>

        <div className="col-md-6">
          <Input
            label="Empresa"
            value={formData.companyName || ''}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="Nombre de la empresa"
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Persona de Contacto"
            value={formData.contactPerson || ''}
            onChange={(e) => handleChange('contactPerson', e.target.value)}
            placeholder="Nombre del contacto"
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="email@ejemplo.com"
            errorText={errors.email}
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Telefono"
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+52 55 1234 5678"
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Fuente"
            value={formData.source || ''}
            onChange={(e) => handleChange('source', e.target.value)}
            placeholder="Ej: Web, Referido, Evento"
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Valor Estimado"
            type="number"
            value={formData.estimatedValue?.toString() || '0'}
            onChange={(e) => handleChange('estimatedValue', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Fecha Estimada de Cierre"
            type="date"
            value={formData.estimatedCloseDate || ''}
            onChange={(e) => handleChange('estimatedCloseDate', e.target.value)}
          />
        </div>

        <div className="col-12">
          <label className="form-label">Notas</label>
          <textarea
            className="form-control"
            rows={3}
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Notas adicionales..."
          />
        </div>

        <div className="col-12 d-flex justify-content-end gap-2 mt-4">
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Lead'}
          </Button>
        </div>
      </div>
    </form>
  )
}
