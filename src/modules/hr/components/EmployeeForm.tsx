/**
 * Employee Form Component
 *
 * Form for creating and editing employees with complete validation
 */

'use client'

import React, { useState } from 'react'
import { Input, Button } from '@/ui/components/base'
import { useDepartments, usePositions } from '../hooks'
import type { EmployeeFormData, EmployeeStatus } from '../types'

interface EmployeeFormProps {
  initialData?: EmployeeFormData
  onSubmit: (data: EmployeeFormData) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const { departments, isLoading: loadingDepartments } = useDepartments()
  const { positions, isLoading: loadingPositions } = usePositions()

  const [formData, setFormData] = useState<EmployeeFormData>({
    employeeCode: initialData?.employeeCode || '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    hireDate: initialData?.hireDate || new Date().toISOString().split('T')[0],
    birthDate: initialData?.birthDate || '',
    salary: initialData?.salary || 0,
    status: initialData?.status || 'active',
    terminationDate: initialData?.terminationDate || '',
    terminationReason: initialData?.terminationReason || '',
    address: initialData?.address || '',
    emergencyContactName: initialData?.emergencyContactName || '',
    emergencyContactPhone: initialData?.emergencyContactPhone || '',
    departmentId: initialData?.departmentId,
    positionId: initialData?.positionId,
    userId: initialData?.userId,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: keyof EmployeeFormData, value: string | number) => {
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

    if (!formData.employeeCode.trim()) {
      newErrors.employeeCode = 'Código de empleado es requerido'
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nombre es requerido'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Apellido es requerido'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.hireDate) {
      newErrors.hireDate = 'Fecha de contratación es requerida'
    }
    if (formData.salary <= 0) {
      newErrors.salary = 'Salario debe ser mayor a 0'
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
        {/* Employee Code */}
        <div className="col-md-6">
          <Input
            label="Código de Empleado *"
            type="text"
            value={formData.employeeCode}
            onChange={(e) => handleChange('employeeCode', e.target.value)}
            errorText={errors.employeeCode}
            disabled={isEdit}
          />
        </div>

        {/* Status */}
        <div className="col-md-6">
          <label className="form-label">Estado *</label>
          <select
            className="form-select"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as EmployeeStatus)}
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="terminated">Terminado</option>
          </select>
        </div>

        {/* First Name */}
        <div className="col-md-6">
          <Input
            label="Nombre *"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            errorText={errors.firstName}
          />
        </div>

        {/* Last Name */}
        <div className="col-md-6">
          <Input
            label="Apellido *"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            errorText={errors.lastName}
          />
        </div>

        {/* Email */}
        <div className="col-md-6">
          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            errorText={errors.email}
          />
        </div>

        {/* Phone */}
        <div className="col-md-6">
          <Input
            label="Teléfono"
            type="text"
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>

        {/* Hire Date */}
        <div className="col-md-6">
          <Input
            label="Fecha de Contratación *"
            type="date"
            value={formData.hireDate}
            onChange={(e) => handleChange('hireDate', e.target.value)}
            errorText={errors.hireDate}
          />
        </div>

        {/* Birth Date */}
        <div className="col-md-6">
          <Input
            label="Fecha de Nacimiento"
            type="date"
            value={formData.birthDate || ''}
            onChange={(e) => handleChange('birthDate', e.target.value)}
          />
        </div>

        {/* Salary */}
        <div className="col-md-6">
          <Input
            label="Salario *"
            type="number"
            value={formData.salary}
            onChange={(e) => handleChange('salary', parseFloat(e.target.value) || 0)}
            errorText={errors.salary}
            step="0.01"
          />
        </div>

        {/* Department */}
        <div className="col-md-6">
          <label className="form-label">Departamento</label>
          <select
            className="form-select"
            value={formData.departmentId || ''}
            onChange={(e) => handleChange('departmentId', e.target.value ? parseInt(e.target.value) : undefined)}
            disabled={loadingDepartments}
          >
            <option value="">Seleccionar departamento...</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Position */}
        <div className="col-md-6">
          <label className="form-label">Puesto</label>
          <select
            className="form-select"
            value={formData.positionId || ''}
            onChange={(e) => handleChange('positionId', e.target.value ? parseInt(e.target.value) : undefined)}
            disabled={loadingPositions}
          >
            <option value="">Seleccionar puesto...</option>
            {positions.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {pos.title}
              </option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div className="col-12">
          <Input
            label="Dirección"
            type="text"
            value={formData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>

        {/* Emergency Contact */}
        <div className="col-md-6">
          <Input
            label="Contacto de Emergencia"
            type="text"
            value={formData.emergencyContactName || ''}
            onChange={(e) => handleChange('emergencyContactName', e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Teléfono de Emergencia"
            type="text"
            value={formData.emergencyContactPhone || ''}
            onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
          />
        </div>

        {/* Termination fields (only show if status is terminated) */}
        {formData.status === 'terminated' && (
          <>
            <div className="col-md-6">
              <Input
                label="Fecha de Terminación"
                type="date"
                value={formData.terminationDate || ''}
                onChange={(e) => handleChange('terminationDate', e.target.value)}
              />
            </div>

            <div className="col-12">
              <label className="form-label">Razón de Terminación</label>
              <textarea
                className="form-control"
                rows={3}
                value={formData.terminationReason || ''}
                onChange={(e) => handleChange('terminationReason', e.target.value)}
              />
            </div>
          </>
        )}
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
          {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  )
}

export default EmployeeForm
