'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { UnitForm } from './UnitForm'
import { useUnit, useUnitMutations } from '../hooks'
import { useToast } from '@/ui/hooks/useToast'
import type { CreateUnitData, UpdateUnitData } from '../types'

interface UnitFormWrapperProps {
  unitId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export const UnitFormWrapper: React.FC<UnitFormWrapperProps> = ({
  unitId,
  onSuccess,
  onCancel
}) => {
  // console.log('🔄 UnitFormWrapper render', { unitId })
  
  const router = useRouter()
  const toast = useToast()
  const { unit, isLoading: unitLoading, error: unitError } = useUnit(unitId)
  const { createUnit, updateUnit, isLoading: mutationLoading } = useUnitMutations()

  const handleSubmit = async (formData: CreateUnitData | UpdateUnitData) => {
    try {
      if (unitId && unit) {
        // console.log('📝 Updating unit:', unitId, formData)
        await updateUnit(unitId, formData as UpdateUnitData)
        toast.success('Unidad actualizada exitosamente')
      } else {
        // console.log('🆕 Creating unit:', formData)
        await createUnit(formData as CreateUnitData)
        toast.success('Unidad creada exitosamente')
      }
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard/products/units')
      }
    } catch (error) {
      console.error('❌ Error en UnitForm:', error)
      toast.error(unitId ? 'Error al actualizar la unidad' : 'Error al crear la unidad')
    }
  }

  // Loading state for existing unit
  if (unitId && unitLoading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="placeholder-glow">
            <div className="placeholder col-4 mb-3" style={{ height: '2rem' }}></div>
            <div className="placeholder col-12 mb-3"></div>
            <div className="placeholder col-8 mb-3"></div>
            <div className="placeholder col-6"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state for existing unit
  if (unitId && unitError) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-danger d-flex align-items-start">
            <i className="bi bi-exclamation-triangle-fill me-2 mt-1" />
            <div>
              <strong>Error al cargar la unidad</strong>
              <div className="small mt-1">
                {unitError.message || 'No se pudo obtener la información de la unidad'}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Unit not found
  if (unitId && !unit && !unitLoading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="display-1 text-muted mb-4">
            <i className="bi bi-rulers" />
          </div>
          <h3 className="text-muted mb-2">Unidad no encontrada</h3>
          <p className="text-muted mb-4">La unidad que buscas no existe o ha sido eliminada</p>
        </div>
      </div>
    )
  }

  return (
    <UnitForm
      unit={unit}
      isLoading={mutationLoading}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  )
}

export default UnitFormWrapper