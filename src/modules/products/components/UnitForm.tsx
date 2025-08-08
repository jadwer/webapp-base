'use client'

import React, { useState, useEffect } from 'react'
import { Button, Input } from '@/ui/components/base'
import type { Unit, CreateUnitData, UpdateUnitData } from '../types'

interface UnitFormProps {
  unit?: Unit
  isLoading?: boolean
  onSubmit: (data: CreateUnitData | UpdateUnitData) => Promise<void>
  onCancel?: () => void
}

export const UnitForm: React.FC<UnitFormProps> = ({
  unit,
  isLoading = false,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    unitType: unit?.unitType || '',
    code: unit?.code || '',
    name: unit?.name || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (unit) {
      setFormData({
        unitType: unit.unitType || '',
        code: unit.code || '',
        name: unit.name || ''
      })
    }
  }, [unit])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la unidad es requerido'
    }

    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido'
    } else if (formData.code.length > 10) {
      newErrors.code = 'El código no puede exceder los 10 caracteres'
    }

    if (!formData.unitType.trim()) {
      newErrors.unitType = 'El tipo de unidad es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    setTouched(allTouched)

    if (!validateForm()) return

    const submitData = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      unitType: formData.unitType.trim()
    }

    await onSubmit(submitData)
  }

  const unitTypes = [
    { value: '', label: 'Seleccione un tipo' },
    { value: 'peso', label: 'Peso' },
    { value: 'longitud', label: 'Longitud' },
    { value: 'volumen', label: 'Volumen' },
    { value: 'cantidad', label: 'Cantidad' },
    { value: 'tiempo', label: 'Tiempo' },
    { value: 'area', label: 'Área' },
    { value: 'otro', label: 'Otro' }
  ]

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <Input
              label="Nombre de la unidad"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              errorText={touched.name ? errors.name : ''}
              required
              placeholder="Ej: Kilogramo, Metro, Pieza"
              disabled={isLoading}
            />
          </div>

          <div className="mb-3">
            <Input
              label="Código"
              type="text"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              onBlur={() => handleBlur('code')}
              errorText={touched.code ? errors.code : ''}
              required
              placeholder="Ej: kg, m, pcs"
              helpText="Código corto para identificar la unidad"
              disabled={isLoading}
            />
          </div>

          <div className="mb-3">
            <Input
              label="Tipo de unidad"
              type="select"
              value={formData.unitType}
              onChange={(e) => handleInputChange('unitType', e.target.value)}
              onBlur={() => handleBlur('unitType')}
              errorText={touched.unitType ? errors.unitType : ''}
              required
              disabled={isLoading}
              options={unitTypes}
            />
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-info-circle me-2" />
                Ejemplos de unidades
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Peso:</strong> Kilogramo (kg), Gramo (g), Tonelada (ton)
              </div>
              <div className="mb-3">
                <strong>Longitud:</strong> Metro (m), Centímetro (cm), Kilómetro (km)
              </div>
              <div className="mb-3">
                <strong>Volumen:</strong> Litro (l), Mililitro (ml), Metro cúbico (m³)
              </div>
              <div className="mb-0">
                <strong>Cantidad:</strong> Pieza (pcs), Unidad (ud), Docena (doc)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            buttonStyle="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          disabled={isLoading}
        >
          <i className="bi bi-check-lg me-2" />
          {unit ? 'Actualizar unidad' : 'Crear unidad'}
        </Button>
      </div>
    </form>
  )
}

export default UnitForm