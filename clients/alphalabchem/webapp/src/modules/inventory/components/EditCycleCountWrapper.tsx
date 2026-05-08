/**
 * Edit CycleCount Wrapper Component
 *
 * Wrapper component for editing existing cycle counts.
 */

'use client'

import React from 'react'
import { CycleCountForm } from './CycleCountForm'
import { useCycleCount } from '../hooks/useCycleCount'
import { useCycleCountMutations } from '../hooks/useCycleCountMutations'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { Alert } from '@/ui/components/base/Alert'
import type { CycleCountFormData } from '../types'

interface EditCycleCountWrapperProps {
  id: string
}

export const EditCycleCountWrapper: React.FC<EditCycleCountWrapperProps> = ({ id }) => {
  const navigation = useNavigationProgress()
  const { cycleCount, isLoading: loadingData, error: loadError } = useCycleCount({ id })
  const { updateCycleCount, isLoading: updating } = useCycleCountMutations()
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (data: CycleCountFormData) => {
    try {
      setError(null)
      await updateCycleCount(id, {
        warehouseId: data.warehouseId,
        productId: data.productId,
        scheduledDate: data.scheduledDate,
        status: data.status,
        warehouseLocationId: data.warehouseLocationId,
        systemQuantity: data.systemQuantity,
        assignedTo: data.assignedTo,
        abcClass: data.abcClass,
        notes: data.notes
      })
      navigation.push(`/dashboard/inventory/cycle-counts/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el conteo ciclico')
    }
  }

  const handleCancel = () => {
    navigation.push(`/dashboard/inventory/cycle-counts/${id}`)
  }

  // Loading state
  if (loadingData) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-muted">Cargando datos del conteo...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (loadError || !cycleCount) {
    return (
      <div className="container-fluid py-4">
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2" />
          {loadError?.message || 'No se encontro el conteo ciclico'}
        </Alert>
      </div>
    )
  }

  // Build initial form data from loaded cycle count
  const initialData: Partial<CycleCountFormData> = {
    warehouseId: cycleCount.warehouse?.id || '',
    productId: cycleCount.product?.id || '',
    scheduledDate: cycleCount.scheduledDate,
    status: cycleCount.status,
    warehouseLocationId: cycleCount.warehouseLocation?.id,
    systemQuantity: cycleCount.systemQuantity,
    assignedTo: cycleCount.assignedTo?.id,
    abcClass: cycleCount.abcClass ?? undefined,
    notes: cycleCount.notes ?? undefined
  }

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              type="button"
              className="btn btn-link text-decoration-none p-0 me-3"
              onClick={handleCancel}
            >
              <i className="bi bi-arrow-left fs-4" />
            </button>
            <div>
              <h1 className="h3 mb-0">Editar Conteo: {cycleCount.countNumber}</h1>
              <p className="text-muted mb-0">Modificar los datos del conteo ciclico</p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="mb-4">
              <i className="bi bi-exclamation-triangle me-2" />
              {error}
            </Alert>
          )}

          {/* Form Card */}
          <div className="card">
            <div className="card-body">
              <CycleCountForm
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updating}
                isEdit
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
