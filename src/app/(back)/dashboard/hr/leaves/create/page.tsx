'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@/ui/components/base'
import { useEmployees, useLeaveTypes, type LeaveType, type Employee } from '@/modules/hr'

export default function CreateLeavePage() {
  const router = useRouter()
  const { employees } = useEmployees()
  const { leaveTypes } = useLeaveTypes()

  const [formData, setFormData] = useState({
    employeeId: '',
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSuccess = () => {
    router.push('/dashboard/hr/leaves')
  }

  const handleCancel = () => {
    router.back()
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.employeeId) newErrors.employeeId = 'Seleccione un empleado'
    if (!formData.leaveTypeId) newErrors.leaveTypeId = 'Seleccione un tipo de licencia'
    if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es requerida'
    if (!formData.endDate) newErrors.endDate = 'La fecha de fin es requerida'
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
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
      // TODO: Implement leave creation via service
      handleSuccess()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-link p-0 me-3 text-decoration-none"
              title="Volver"
            >
              <i className="bi bi-arrow-left fs-4 text-muted" />
            </button>
            <div>
              <h1 className="h3 mb-0 fw-bold">
                <i className="bi bi-calendar-x text-primary me-2" />
                Nueva Solicitud de Licencia
              </h1>
              <p className="text-muted mb-0">Registrar una solicitud de licencia o vacaciones</p>
            </div>
          </div>

          {/* Form */}
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label">Empleado *</label>
                        <select
                          className={`form-select ${errors.employeeId ? 'is-invalid' : ''}`}
                          value={formData.employeeId}
                          onChange={(e) => handleChange('employeeId', e.target.value)}
                        >
                          <option value="">Seleccione un empleado</option>
                          {employees?.map((emp: Employee) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.firstName} {emp.lastName}
                            </option>
                          ))}
                        </select>
                        {errors.employeeId && <div className="invalid-feedback">{errors.employeeId}</div>}
                      </div>

                      <div className="col-12">
                        <label className="form-label">Tipo de Licencia *</label>
                        <select
                          className={`form-select ${errors.leaveTypeId ? 'is-invalid' : ''}`}
                          value={formData.leaveTypeId}
                          onChange={(e) => handleChange('leaveTypeId', e.target.value)}
                        >
                          <option value="">Seleccione un tipo</option>
                          {leaveTypes?.map((lt: LeaveType) => (
                            <option key={lt.id} value={lt.id}>
                              {lt.name}
                            </option>
                          ))}
                        </select>
                        {errors.leaveTypeId && <div className="invalid-feedback">{errors.leaveTypeId}</div>}
                      </div>

                      <div className="col-md-6">
                        <Input
                          label="Fecha de Inicio *"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleChange('startDate', e.target.value)}
                          errorText={errors.startDate}
                        />
                      </div>

                      <div className="col-md-6">
                        <Input
                          label="Fecha de Fin *"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleChange('endDate', e.target.value)}
                          errorText={errors.endDate}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Motivo</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={formData.reason}
                          onChange={(e) => handleChange('reason', e.target.value)}
                          placeholder="Describa el motivo de la solicitud..."
                        />
                      </div>

                      <div className="col-12 d-flex justify-content-end gap-2 mt-4">
                        <Button variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
                          Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                          {isSubmitting ? 'Guardando...' : 'Crear Solicitud'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
