'use client'

import { InventoryMovementForm } from './InventoryMovementForm'
import { useInventoryMovement, useInventoryMovementsMutations } from '../hooks'
import { useWarehouses, useLocations } from '../hooks'
import { useProducts } from '@/modules/products'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import type { UpdateMovementData } from '../types'

interface EditMovementWrapperProps {
  movementId: string
}

export const EditMovementWrapper = ({ movementId }: EditMovementWrapperProps) => {
  const navigation = useNavigationProgress()
  const { movement, isLoading: isLoadingMovement, error } = useInventoryMovement(movementId, ['product', 'warehouse', 'location'])
  const { updateMovement } = useInventoryMovementsMutations()
  
  // Cargar datos para los selects
  const { warehouses, isLoading: isLoadingWarehouses } = useWarehouses()
  const { locations, isLoading: isLoadingLocations } = useLocations()
  const { products, isLoading: isLoadingProducts } = useProducts()
  
  const handleSubmit = async (data: UpdateMovementData) => {
    try {
      await updateMovement(movementId, data)
      
      // Show success toast
      const toastElement = document.createElement('div')
      toastElement.className = 'position-fixed top-0 end-0 p-3'
      toastElement.style.zIndex = '9999'
      toastElement.innerHTML = `
        <div class="toast show" role="alert">
          <div class="toast-header bg-success text-white">
            <strong class="me-auto">Éxito</strong>
          </div>
          <div class="toast-body">
            Movimiento actualizado correctamente
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      
      // Navigate to movement detail after brief delay
      setTimeout(() => {
        document.body.removeChild(toastElement)
        navigation.push(`/dashboard/inventory/movements/${movementId}`)
      }, 2000)
      
    } catch (error) {
      console.error('Error updating movement:', error)
      throw error // Let form handle the error display
    }
  }
  
  const isLoading = isLoadingMovement || isLoadingWarehouses || isLoadingLocations || isLoadingProducts
  
  if (isLoading) {
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
  
  // Movement data already processed by JSON:API parser in hook
  const movementForForm = movement
  
  return (
    <InventoryMovementForm
      movement={movementForForm}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      warehouses={warehouses}
      products={products}
      locations={locations}
    />
  )
}