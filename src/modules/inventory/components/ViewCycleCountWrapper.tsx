/**
 * View CycleCount Wrapper Component
 *
 * Wrapper component for viewing cycle count details.
 */

'use client'

import React, { useRef } from 'react'
import { CycleCountDetail } from './CycleCountDetail'
import { useCycleCount } from '../hooks/useCycleCount'
import { useCycleCountMutations } from '../hooks/useCycleCountMutations'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { Alert } from '@/ui/components/base/Alert'
import { Button } from '@/ui/components/base/Button'
import ConfirmModal from '@/ui/components/base/ConfirmModal'
import type { ConfirmModalHandle } from '@/ui/components/base/ConfirmModal'

interface ViewCycleCountWrapperProps {
  id: string
}

export const ViewCycleCountWrapper: React.FC<ViewCycleCountWrapperProps> = ({ id }) => {
  const navigation = useNavigationProgress()
  const { cycleCount, isLoading: loadingData, error: loadError } = useCycleCount({ id })
  const { startCount, cancelCount, isLoading: mutating } = useCycleCountMutations()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const handleEdit = () => {
    navigation.push(`/dashboard/inventory/cycle-counts/${id}/edit`)
  }

  const handleStartCount = async () => {
    const confirmed = await confirmModalRef.current?.confirm(
      `Deseas iniciar el conteo ${cycleCount?.countNumber}? El estado cambiara a "En Progreso".`,
      {
        title: 'Iniciar Conteo',
        confirmVariant: 'warning',
        confirmText: 'Iniciar',
        cancelText: 'Cancelar'
      }
    )
    if (confirmed) {
      try {
        await startCount(id)
      } catch {
        // Error handled by mutation hook
      }
    }
  }

  const handleRecordCount = () => {
    navigation.push(`/dashboard/inventory/cycle-counts/${id}/record`)
  }

  const handleCancelCount = async () => {
    const confirmed = await confirmModalRef.current?.confirm(
      `Estas seguro de cancelar el conteo ${cycleCount?.countNumber}? Esta accion no se puede deshacer.`,
      {
        title: 'Cancelar Conteo',
        confirmVariant: 'danger',
        confirmText: 'Cancelar Conteo',
        cancelText: 'Volver'
      }
    )
    if (confirmed) {
      try {
        await cancelCount(id, 'Cancelado por el usuario')
      } catch {
        // Error handled by mutation hook
      }
    }
  }

  const handleBack = () => {
    navigation.push('/dashboard/inventory/cycle-counts')
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
        <Button variant="secondary" onClick={handleBack}>
          <i className="bi bi-arrow-left me-2" />
          Volver a la lista
        </Button>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <button type="button" className="btn btn-link text-decoration-none p-0 me-3" onClick={handleBack}>
          <i className="bi bi-arrow-left fs-4" />
        </button>
        <div>
          <h1 className="h3 mb-0">Detalle de Conteo Ciclico</h1>
          <p className="text-muted mb-0">Informacion completa del conteo</p>
        </div>
      </div>

      {/* Detail Component */}
      <CycleCountDetail
        cycleCount={cycleCount}
        onEdit={handleEdit}
        onStartCount={handleStartCount}
        onRecordCount={handleRecordCount}
        onCancelCount={handleCancelCount}
        isLoading={mutating}
      />

      {/* Confirm Modal */}
      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}
