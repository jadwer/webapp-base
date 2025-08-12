'use client'

/**
 * 📍 USE LOCATIONS MUTATIONS - INVENTORY MODULE
 * Hook para operaciones CRUD de warehouse locations
 * 
 * Features:
 * - Mutations optimistas con SWR
 * - Error handling enterprise con FK constraints
 * - Business rules validation para jerarquía
 * - Toast notifications integration
 * - Cache invalidation inteligente con warehouse coordination
 */

import { useMemo } from 'react'
import { mutate } from 'swr'
import { 
  createWarehouseLocation,
  updateWarehouseLocation,
  deleteWarehouseLocation 
} from '../services'
import type {
  WarehouseLocation,
  CreateWarehouseLocationData,
  UpdateWarehouseLocationData,
} from '../types'

// ===== MUTATION TYPES =====

interface MutationOptions {
  showToast?: boolean
  revalidateList?: boolean
  optimisticUpdate?: boolean
}

interface MutationState {
  isLoading: boolean
  error: Error | null
}

interface LocationMutations {
  // Create mutation
  create: {
    mutate: (data: CreateWarehouseLocationData, options?: MutationOptions) => Promise<WarehouseLocation>
    state: MutationState
  }
  
  // Update mutation
  update: {
    mutate: (data: { id: string } & UpdateWarehouseLocationData, options?: MutationOptions) => Promise<WarehouseLocation>
    state: MutationState
  }
  
  // Delete mutation
  delete: {
    mutate: (location: WarehouseLocation, options?: MutationOptions) => Promise<void>
    state: MutationState
  }
}

// ===== MAIN HOOK =====

/**
 * Hook principal para mutations de locations
 */
export function useLocationsMutations(): LocationMutations {
  
  // ===== CREATE MUTATION =====
  
  const createMutation = useMemo(() => {
    let isLoading = false
    let error: Error | null = null
    
    const mutateCreate = async (
      data: CreateWarehouseLocationData,
      options: MutationOptions = {}
    ): Promise<WarehouseLocation> => {
      const { showToast = true, revalidateList = true } = options
      
      isLoading = true
      error = null
      
      try {
        // Validations básicas
        if (!data.name?.trim()) {
          throw new Error('El nombre es requerido')
        }
        
        if (!data.code?.trim()) {
          throw new Error('El código es requerido')
        }
        
        if (!data.warehouseId) {
          throw new Error('El almacén es requerido')
        }
        
        // API Call
        const newLocation = await createWarehouseLocation(data)
        
        // Cache invalidation
        if (revalidateList) {
          // Revalidar lista general
          mutate(key => typeof key === 'string' && key.includes('inventory-locations'), undefined, { revalidate: true })
          
          // Revalidar lista específica del warehouse
          mutate(`inventory-locations-by-warehouse/${data.warehouseId}`, undefined, { revalidate: true })
          
          // Revalidar jerarquía del warehouse
          mutate(`inventory-location-hierarchy/${data.warehouseId}`, undefined, { revalidate: true })
        }
        
        // Success toast
        if (showToast) {
          showSuccessToast(`Ubicación "${newLocation.name}" creada exitosamente`)
        }
        
        console.log('✅ Location created successfully:', newLocation.code)
        return newLocation
        
      } catch (error: any) {
        console.error('❌ Error creating location:', error)
        
        const errorMessage = error.message || 'Error al crear ubicación'
        
        // Error toast
        if (showToast) {
          showErrorToast(errorMessage)
        }
        
        throw new Error(errorMessage)
        
      } finally {
        isLoading = false
      }
    }
    
    return {
      mutate: mutateCreate,
      state: { isLoading, error }
    }
  }, [])
  
  // ===== UPDATE MUTATION =====
  
  const updateMutation = useMemo(() => {
    let isLoading = false
    let error: Error | null = null
    
    const mutateUpdate = async (
      data: { id: string } & UpdateWarehouseLocationData,
      options: MutationOptions = {}
    ): Promise<WarehouseLocation> => {
      const { showToast = true, revalidateList = true, optimisticUpdate = false } = options
      const { id, ...updateData } = data
      
      isLoading = true
      error = null
      
      try {
        // Optimistic update si está habilitado
        if (optimisticUpdate) {
          mutate(`inventory-location/${id}`, (current: WarehouseLocation) => ({
            ...current,
            ...updateData,
            updatedAt: new Date().toISOString(),
          }), false)
        }
        
        // API Call
        const updatedLocation = await updateWarehouseLocation(id, updateData)
        
        // Cache updates
        if (revalidateList) {
          // Actualizar cache específico
          mutate(`inventory-location/${id}`, updatedLocation, false)
          
          // Revalidar listas que contengan esta location
          mutate(key => typeof key === 'string' && key.includes('inventory-locations'), undefined, { revalidate: true })
          
          // Revalidar lista del warehouse si cambió
          if (updatedLocation.warehouseId) {
            mutate(`inventory-locations-by-warehouse/${updatedLocation.warehouseId}`, undefined, { revalidate: true })
            mutate(`inventory-location-hierarchy/${updatedLocation.warehouseId}`, undefined, { revalidate: true })
          }
        }
        
        // Success toast
        if (showToast) {
          showSuccessToast(`Ubicación "${updatedLocation.name}" actualizada exitosamente`)
        }
        
        console.log('✅ Location updated successfully:', updatedLocation.code)
        return updatedLocation
        
      } catch (error: any) {
        console.error('❌ Error updating location:', error)
        
        // Revert optimistic update en caso de error
        if (optimisticUpdate) {
          mutate(`inventory-location/${id}`, undefined, { revalidate: true })
        }
        
        const errorMessage = error.message || 'Error al actualizar ubicación'
        
        // Error toast
        if (showToast) {
          showErrorToast(errorMessage)
        }
        
        throw new Error(errorMessage)
        
      } finally {
        isLoading = false
      }
    }
    
    return {
      mutate: mutateUpdate,
      state: { isLoading, error }
    }
  }, [])
  
  // ===== DELETE MUTATION =====
  
  const deleteMutation = useMemo(() => {
    let isLoading = false
    let error: Error | null = null
    
    const mutateDelete = async (
      location: WarehouseLocation,
      options: MutationOptions = {}
    ): Promise<void> => {
      const { showToast = true, revalidateList = true } = options
      
      isLoading = true
      error = null
      
      try {
        // API Call
        await deleteWarehouseLocation(location.id)
        
        // Cache invalidation
        if (revalidateList) {
          // Remover de cache específico
          mutate(`inventory-location/${location.id}`, undefined, false)
          
          // Revalidar listas
          mutate(key => typeof key === 'string' && key.includes('inventory-locations'), undefined, { revalidate: true })
          
          // Revalidar lista del warehouse
          mutate(`inventory-locations-by-warehouse/${location.warehouseId}`, undefined, { revalidate: true })
          mutate(`inventory-location-hierarchy/${location.warehouseId}`, undefined, { revalidate: true })
        }
        
        // Success toast
        if (showToast) {
          showSuccessToast(`Ubicación "${location.name}" eliminada exitosamente`)
        }
        
        console.log('✅ Location deleted successfully:', location.code)
        
      } catch (error: any) {
        console.error('❌ Error deleting location:', error)
        
        let errorMessage = error.message || 'Error al eliminar ubicación'
        
        // Manejo específico de errores FK constraint (stock asociado)
        if (error.message?.includes('stock asociado')) {
          errorMessage = `No se puede eliminar la ubicación "${location.name}" porque tiene stock asociado`
        }
        
        // Error toast
        if (showToast) {
          showErrorToast(errorMessage)
        }
        
        throw new Error(errorMessage)
        
      } finally {
        isLoading = false
      }
    }
    
    return {
      mutate: mutateDelete,
      state: { isLoading, error }
    }
  }, [])
  
  // ===== RETURN OBJECT =====
  
  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  }
}

// ===== TOAST HELPERS =====

/**
 * Muestra toast de éxito con estilos enterprise
 */
function showSuccessToast(message: string) {
  const toastDiv = document.createElement('div')
  toastDiv.className = 'position-fixed top-0 end-0 m-3 alert alert-success alert-dismissible fade show'
  toastDiv.style.zIndex = '9999'
  toastDiv.style.minWidth = '300px'
  toastDiv.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="bi bi-check-circle-fill me-2"></i>
      <div class="flex-grow-1">${message}</div>
      <button type="button" class="btn-close ms-2" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `
  
  // Agregar animación de entrada
  toastDiv.style.opacity = '0'
  toastDiv.style.transform = 'translateX(100%)'
  toastDiv.style.transition = 'all 0.3s ease'
  
  document.body.appendChild(toastDiv)
  
  // Trigger animación
  setTimeout(() => {
    toastDiv.style.opacity = '1'
    toastDiv.style.transform = 'translateX(0)'
  }, 10)
  
  // Auto-remove después de 4 segundos
  setTimeout(() => {
    if (toastDiv.parentNode) {
      toastDiv.style.opacity = '0'
      toastDiv.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (toastDiv.parentNode) {
          toastDiv.parentNode.removeChild(toastDiv)
        }
      }, 300)
    }
  }, 4000)
}

/**
 * Muestra toast de error con estilos enterprise
 */
function showErrorToast(message: string) {
  const toastDiv = document.createElement('div')
  toastDiv.className = 'position-fixed top-0 end-0 m-3 alert alert-danger alert-dismissible fade show'
  toastDiv.style.zIndex = '9999'
  toastDiv.style.minWidth = '300px'
  toastDiv.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <div class="flex-grow-1">${message}</div>
      <button type="button" class="btn-close ms-2" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `
  
  // Agregar animación de entrada
  toastDiv.style.opacity = '0'
  toastDiv.style.transform = 'translateX(100%)'
  toastDiv.style.transition = 'all 0.3s ease'
  
  document.body.appendChild(toastDiv)
  
  // Trigger animación
  setTimeout(() => {
    toastDiv.style.opacity = '1'
    toastDiv.style.transform = 'translateX(0)'
  }, 10)
  
  // Auto-remove después de 6 segundos (más tiempo para errores)
  setTimeout(() => {
    if (toastDiv.parentNode) {
      toastDiv.style.opacity = '0'
      toastDiv.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (toastDiv.parentNode) {
          toastDiv.parentNode.removeChild(toastDiv)
        }
      }, 300)
    }
  }, 6000)
}

// ===== VALIDATION HOOKS =====

/**
 * Hook para validación de código de location en tiempo real
 */
export function useLocationCodeValidation(
  code: string,
  warehouseId: string,
  excludeId?: string
) {
  // Esta lógica se movió a useLocations.ts como useLocationCodeValidation
  // Se mantiene aquí por compatibilidad, pero redirige al hook principal
  return useMemo(() => {
    // Placeholder - la lógica real está en useLocations.ts
    return {
      isAvailable: true,
      isChecking: false,
      error: null,
    }
  }, [code, warehouseId, excludeId])
}

/**
 * Hook para validación de jerarquía de location
 */
export function useLocationHierarchyValidation(data: CreateWarehouseLocationData | UpdateWarehouseLocationData) {
  return useMemo(() => {
    const errors: string[] = []
    
    // Validaciones de jerarquía básica
    if (data.locationType === 'shelf' && !data.rack) {
      errors.push('Un estante debe estar asociado a un rack')
    }
    
    if (data.locationType === 'bin' && (!data.shelf || !data.rack)) {
      errors.push('Un contenedor debe estar asociado a un estante y rack')
    }
    
    if (data.position && !data.shelf) {
      errors.push('Una posición específica requiere un estante')
    }
    
    // Validaciones de capacidad
    if (data.maxWeight && data.maxWeight <= 0) {
      errors.push('El peso máximo debe ser mayor a 0')
    }
    
    if (data.maxVolume && data.maxVolume <= 0) {
      errors.push('El volumen máximo debe ser mayor a 0')
    }
    
    // Validaciones operativas
    if (data.isPickable === false && data.isReceivable === false) {
      errors.push('Una ubicación debe ser pickable, receivable, o ambas')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    }
  }, [data])
}

// ===== DEFAULT EXPORT =====

export default useLocationsMutations