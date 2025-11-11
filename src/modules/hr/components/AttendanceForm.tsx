/**
 * Attendance Form Component
 *
 * Form for creating and editing attendance records with auto-calculation
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Input, Button } from '@/ui/components/base'
import { useEmployees } from '../hooks'
import type { AttendanceFormData, AttendanceStatus } from '../types'

interface AttendanceFormProps {
  initialData?: AttendanceFormData
  onSubmit: (data: AttendanceFormData) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const { employees, isLoading: loadingEmployees } = useEmployees()

  const [formData, setFormData] = useState<AttendanceFormData>({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    checkIn: initialData?.checkIn || '09:00:00',
    checkOut: initialData?.checkOut || '',
    status: initialData?.status || 'present',
    notes: initialData?.notes || '',
    employeeId: initialData?.employeeId || 0,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: keyof AttendanceFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.date) {
      newErrors.date = 'Fecha es requerida'
    }
    if (!formData.checkIn) {
      newErrors.checkIn = 'Hora de entrada es requerida'
    }
    if (!formData.employeeId || formData.employeeId === 0) {
      newErrors.employeeId = 'Empleado es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        {/* Employee */}
        <div className="col-12">
          <label className="form-label">Empleado *</label>
          <select
            className={`form-select ${errors.employeeId ? 'is-invalid' : ''}`}
            value={formData.employeeId}
            onChange={(e) => handleChange('employeeId', parseInt(e.target.value))}
            disabled={loadingEmployees || isEdit}
          >
            <option value={0}>Seleccionar empleado...</option>
            {employees.filter(e => e.status === 'active').map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.employeeCode} - {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
          {errors.employeeId && (
            <div className="invalid-feedback">{errors.employeeId}</div>
          )}
        </div>

        {/* Date */}
        <div className="col-md-4">
          <Input
            label="Fecha *"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            error={errors.date}
          />
        </div>

        {/* Check In */}
        <div className="col-md-4">
          <Input
            label="Hora de Entrada *"
            type="time"
            value={formData.checkIn}
            onChange={(e) => handleChange('checkIn', e.target.value)}
            error={errors.checkIn}
          />
        </div>

        {/* Check Out */}
        <div className="col-md-4">
          <Input
            label="Hora de Salida"
            type="time"
            value={formData.checkOut || ''}
            onChange={(e) => handleChange('checkOut', e.target.value)}
          />
          <small className="text-muted">Dejar vacío si aún no sale</small>
        </div>

        {/* Status */}
        <div className="col-md-6">
          <label className="form-label">Estado *</label>
          <select
            className="form-select"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as AttendanceStatus)}
          >
            <option value="present">Presente</option>
            <option value="absent">Ausente</option>
            <option value="late">Tarde</option>
            <option value="half_day">Medio Día</option>
          </select>
        </div>

        {/* Notes */}
        <div className="col-12">
          <label className="form-label">Notas</label>
          <textarea
            className="form-control"
            rows={3}
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Comentarios adicionales..."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button
          type="button"
          variant="secondary"
          buttonStyle="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Registrar'}
        </Button>
      </div>
    </form>
  )
}

export default AttendanceForm
