/**
 * EDIT PRODUCT BATCH WRAPPER
 * Wrapper component for editing existing product batches
 * Siguiendo patrón exitoso de EditMovementWrapper
 */

'use client'

import { ProductBatchForm } from './ProductBatchForm'
import { useProductBatch, useProductBatchMutations } from '../hooks'
import { useWarehouses, useLocations } from '../hooks'
import { useProducts } from '@/modules/products'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import type { CreateProductBatchRequest, UpdateProductBatchRequest } from '../types'

interface EditProductBatchWrapperProps {
  productBatchId: string
}

export const EditProductBatchWrapper = ({ productBatchId }: EditProductBatchWrapperProps) => {
  const navigation = useNavigationProgress()
  const { productBatch, isLoading: isLoadingProductBatch, error } = useProductBatch({ id: productBatchId })
  const { updateProductBatch } = useProductBatchMutations()
  
  // Cargar datos para los selects
  const { warehouses, isLoading: isLoadingWarehouses } = useWarehouses()
  const { locations, isLoading: isLoadingLocations } = useLocations()
  const { products, isLoading: isLoadingProducts } = useProducts()
  
  const handleSubmit = async (data: CreateProductBatchRequest | UpdateProductBatchRequest) => {
    try {
      await updateProductBatch(productBatchId, data as UpdateProductBatchRequest)
      
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
            Lote de producto actualizado correctamente
          </div>
        </div>
      `
      document.body.appendChild(toastElement)
      
      // Navigate to product batch detail after brief delay
      setTimeout(() => {
        document.body.removeChild(toastElement)
        navigation.push(`/dashboard/inventory/product-batch/${productBatchId}`)
      }, 2000)
      
    } catch (error: unknown) {
      console.error('Error updating product batch:', error)
      
      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el lote'
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
    navigation.push(`/dashboard/inventory/product-batch/${productBatchId}`)
  }
  
  const isLoading = isLoadingProductBatch || isLoadingWarehouses || isLoadingLocations || isLoadingProducts
  
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
                <p className="mt-3 text-muted">Cargando datos del lote...</p>
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
                <h4 className="mt-3 text-danger">Error al cargar el lote</h4>
                <p className="text-muted">{error.message || 'No se pudo cargar la información del lote'}</p>
                <div className="mt-3">
                  <button 
                    className="btn btn-primary me-2"
                    onClick={() => navigation.push('/dashboard/inventory/product-batch')}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Volver a Lotes
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => window.location.reload()}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!productBatch) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-box" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                <h4 className="mt-3">Lote no encontrado</h4>
                <p className="text-muted">El lote solicitado no existe o no está disponible</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigation.push('/dashboard/inventory/product-batch')}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver a Lotes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // ProductBatch data already processed by JSON:API parser in hook
  const productBatchForForm = productBatch
  
  return (
    <ProductBatchForm
      productBatch={productBatchForForm}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={false}
      products={products}
      warehouses={warehouses}
      locations={locations}
    />
  )
}