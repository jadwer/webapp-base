/**
 * Create CycleCount Wrapper Component
 *
 * Wrapper component for creating new cycle counts.
 */

'use client'

import React from 'react'
import { CycleCountForm } from './CycleCountForm'
import { useCycleCountMutations } from '../hooks/useCycleCountMutations'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { Alert } from '@/ui/components/base/Alert'
import type { CycleCountFormData } from '../types'

export const CreateCycleCountWrapper: React.FC = () => {
  const navigation = useNavigationProgress()
  const { createCycleCount, isLoading } = useCycleCountMutations()
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (data: CycleCountFormData) => {
    try {
      setError(null)
      await createCycleCount({
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
      navigation.push('/dashboard/inventory/cycle-counts')
    } catch (err) {
      console.error('Error creating cycle count:', err)
      setError(err instanceof Error ? err.message : 'Error al crear el conteo ciclico')
    }
  }

  const handleCancel = () => {
    navigation.push('/dashboard/inventory/cycle-counts')
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
              <h1 className="h3 mb-0">Nuevo Conteo Ciclico</h1>
              <p className="text-muted mb-0">Programar un nuevo conteo de inventario</p>
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
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
