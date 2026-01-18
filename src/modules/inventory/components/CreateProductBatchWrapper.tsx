/**
 * CREATE PRODUCT BATCH WRAPPER
 * Wrapper component for creating new product batches
 * Siguiendo patrón exitoso de CreateMovementWrapper
 */

'use client'

import { ProductBatchForm } from './ProductBatchForm'
import { useProductBatchMutations } from '../hooks'
import { useWarehouses, useLocations } from '../hooks'
import { useProducts } from '@/modules/products'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import type { CreateProductBatchRequest, UpdateProductBatchRequest } from '../types'

export const CreateProductBatchWrapper = () => {
  const navigation = useNavigationProgress()
  const { createProductBatch } = useProductBatchMutations()
  
  // Cargar datos para los selects
  const { warehouses, isLoading: isLoadingWarehouses } = useWarehouses()
  const { locations, isLoading: isLoadingLocations } = useLocations()
  const { products, isLoading: isLoadingProducts } = useProducts()
  
  const isLoading = isLoadingWarehouses || isLoadingLocations || isLoadingProducts
  
  const handleSubmit = async (data: CreateProductBatchRequest | UpdateProductBatchRequest) => {
    try {
      await createProductBatch(data as CreateProductBatchRequest)
      
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
            Lote de producto creado correctamente
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      
      // Navigate to product batches list after brief delay
      setTimeout(() => {
        document.body.removeChild(toastElement)
        navigation.push('/dashboard/inventory/product-batch')
      }, 2000)
      
    } catch (error: unknown) {
      console.error('Error creating product batch:', error)
      
      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el lote'
      const toastElement = document.createElement('div')
      toastElement.className = 'position-fixed top-0 end-0 p-3'
      toastElement.style.zIndex = '9999'
      toastElement.innerHTML = `
        <div class="toast show" role="alert">
          <div class="toast-header bg-danger text-white">
            <strong class="me-auto">Error</strong>
          </div>
          <div class="toast-body">
            ${errorMessage}
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      setTimeout(() => document.body.removeChild(toastElement), 4000)
      
      throw error // Let form handle the error display
    }
  }
  
  const handleCancel = () => {
    navigation.push('/dashboard/inventory/product-batch')
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
    <ProductBatchForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={false}
      products={products}
      warehouses={warehouses}
      locations={locations}
    />
  )
}