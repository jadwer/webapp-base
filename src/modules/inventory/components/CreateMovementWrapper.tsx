'use client'

import { InventoryMovementForm } from './InventoryMovementForm'
import { useInventoryMovementsMutations } from '../hooks'
import { useWarehouses, useLocations } from '../hooks'
import { useProducts } from '@/modules/products'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import type { CreateMovementData, UpdateMovementData } from '../types'

export const CreateMovementWrapper = () => {
  const navigation = useNavigationProgress()
  const { createMovement } = useInventoryMovementsMutations()
  
  // Cargar datos para los selects
  const { warehouses, isLoading: isLoadingWarehouses } = useWarehouses()
  const { locations, isLoading: isLoadingLocations } = useLocations()
  const { products, isLoading: isLoadingProducts } = useProducts()
  
  const isLoading = isLoadingWarehouses || isLoadingLocations || isLoadingProducts
  
  const handleSubmit = async (data: CreateMovementData | UpdateMovementData) => {
    try {
      await createMovement(data as CreateMovementData)
      
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
            Movimiento creado correctamente
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      
      // Navigate to movements list after brief delay
      setTimeout(() => {
        document.body.removeChild(toastElement)
        navigation.push('/dashboard/inventory/movements')
      }, 2000)
      
    } catch (error) {
      console.error('Error creating movement:', error)
      throw error // Let form handle the error display
    }
  }
  
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
                <p className="mt-3 text-muted">Cargando datos del formulario...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <InventoryMovementForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      warehouses={warehouses}
      products={products}
      locations={locations}
    />
  )
}