'use client'

import { InventoryMovementForm } from './InventoryMovementForm'
import { useInventoryMovement, useInventoryMovementsMutations } from '../hooks'

interface EditMovementWrapperProps {
  movementId: string
}

export const EditMovementWrapper = ({ movementId }: EditMovementWrapperProps) => {
  const { movement, isLoading: isLoadingMovement, error } = useInventoryMovement(movementId, ['product', 'warehouse', 'location'])
  const { updateMovement } = useInventoryMovementsMutations()
  
  const handleSubmit = async (data: any) => {
    await updateMovement(movementId, data)
  }
  
  if (isLoadingMovement) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-muted">Cargando datos del movimiento...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-danger">
              <div className="card-body text-center py-5">
                <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
                <h4 className="mt-3 text-danger">Error al cargar el movimiento</h4>
                <p className="text-muted">{error.message || 'No se pudo cargar la información del movimiento'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!movement) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-arrow-left-right" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                <h4 className="mt-3">Movimiento no encontrado</h4>
                <p className="text-muted">El movimiento solicitado no existe o no está disponible</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Convert JSON:API format to form format  
  const movementForForm = {
    ...movement.attributes,
    id: movement.id
  }
  
  return (
    <InventoryMovementForm
      movement={movementForForm}
      onSubmit={handleSubmit}
      isEditing={true}
    />
  )
}