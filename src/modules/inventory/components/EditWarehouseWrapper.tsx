'use client'

import { WarehouseForm } from './WarehouseForm'
import { useWarehouse, useWarehousesMutations } from '../hooks'

interface EditWarehouseWrapperProps {
  warehouseId: string
}

export const EditWarehouseWrapper = ({ warehouseId }: EditWarehouseWrapperProps) => {
  const { warehouse, isLoading: isLoadingWarehouse, error } = useWarehouse(warehouseId)
  const { updateWarehouse, isLoading: isUpdating } = useWarehousesMutations()
  
  const handleSubmit = async (data: any) => {
    await updateWarehouse(warehouseId, data)
  }
  
  if (isLoadingWarehouse) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-muted">Cargando datos del almacén...</p>
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
                <h4 className="mt-3 text-danger">Error al cargar el almacén</h4>
                <p className="text-muted">{error.message || 'No se pudo cargar la información del almacén'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!warehouse) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-building" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                <h4 className="mt-3">Almacén no encontrado</h4>
                <p className="text-muted">El almacén solicitado no existe o no está disponible</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Convert JSON:API format to form format
  const warehouseForForm = {
    ...warehouse.attributes,
    id: warehouse.id
  }
  
  return (
    <WarehouseForm
      warehouse={warehouseForForm}
      onSubmit={handleSubmit}
      isLoading={isUpdating}
    />
  )
}