'use client'

/**
 * 📦 USE WAREHOUSES MUTATIONS - INVENTORY MODULE
 * Hook para operaciones CRUD de warehouses
 * 
 * Features:
 * - Mutations optimistas con SWR
 * - Error handling enterprise con FK constraints
 * - Business rules validation
 * - Toast notifications integration
 * - Cache invalidation inteligente
 */

import { useMemo } from 'react'
import { mutate } from 'swr'
import { 
  createWarehouse,
  updateWarehouse, 
  deleteWarehouse,
  checkWarehouseCodeAvailable,
  checkWarehouseSlugAvailable,
  generateSlugFromName,
} from '../services'
import { parseJsonApiErrors } from '@/modules/products/utils/errorHandling'
import type {
  Warehouse,
  CreateWarehouseData,
  UpdateWarehouseData,
  PaginatedWarehousesResponse,
} from '../types'

// ===== MUTATION TYPES =====

interface MutationOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  showToast?: boolean  // Default: true
  optimistic?: boolean // Default: true para mejor UX
}

interface CreateMutationOptions extends MutationOptions {
  // Opciones específicas para creación
  autoGenerateSlug?: boolean  // Default: true
  redirectOnSuccess?: boolean // Default: false
}

interface UpdateMutationOptions extends MutationOptions {
  // Opciones específicas para actualización
  revalidateList?: boolean // Default: true
}

interface DeleteMutationOptions extends MutationOptions {
  // Opciones específicas para eliminación
  confirmTitle?: string
  confirmMessage?: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// ===== TOAST UTILITIES =====

/**
 * Sistema de toast notifications usando DOM directo
 * Evita problemas de React state y portal rendering
 */
function showToast(message: string, type: 'success' | 'error' = 'success') {
  // Crear elemento toast
  const toast = document.createElement('div')
  toast.className = `position-fixed top-0 end-0 m-3 alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`
  toast.style.zIndex = '9999'
  toast.style.minWidth = '300px'
  toast.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2"></i>
      <div>${message}</div>
      <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
    </div>
  `
  
  // Agregar al DOM
  document.body.appendChild(toast)
  
  // Auto-remove después de delay
  const delay = type === 'success' ? 4000 : 6000
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast)
    }
  }, delay)
  
  // Remove on click close button
  const closeBtn = toast.querySelector('.btn-close')
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    })
  }
}

// ===== ERROR HANDLING =====

/**
 * Maneja errores de warehouse con business rules específicas
 */
function handleWarehouseError(error: any): string {
  // Error handling para FK constraints
  if (error.response?.status === 409) {
    const parsedErrors = parseJsonApiErrors(error.response.data)
    const hasConstraintError = parsedErrors.some(err => 
      err.code === 'FOREIGN_KEY_CONSTRAINT' || 
      err.title?.includes('constraint') ||
      err.detail?.includes('locations')
    )
    
    if (hasConstraintError) {
      return 'No se puede eliminar el almacén porque tiene ubicaciones asociadas'
    }
  }
  
  // Error de código duplicado
  if (error.response?.status === 422) {
    const data = error.response.data
    if (data.errors?.some((err: any) => err.source?.pointer?.includes('code'))) {
      return 'El código del almacén ya está en uso'
    }
    if (data.errors?.some((err: any) => err.source?.pointer?.includes('slug'))) {
      return 'El slug del almacén ya está en uso'
    }
  }
  
  // Errores de validación general
  if (error.response?.status === 400 || error.response?.status === 422) {
    const parsedErrors = parseJsonApiErrors(error.response.data)
    if (parsedErrors.length > 0) {
      return parsedErrors.map(err => err.detail || err.title).join(', ')
    }
  }
  
  // Error genérico
  return error.message || 'Error al procesar la operación'
}

// ===== CACHE UTILITIES =====

/**
 * Invalida cache relacionado con warehouses
 */
function invalidateWarehouseCache(warehouseId?: string) {
  // Invalidar lista general
  mutate((key) => typeof key === 'string' && key.startsWith('warehouses'))
  
  // Invalidar warehouse específico si se proporciona ID
  if (warehouseId) {
    mutate((key) => typeof key === 'string' && key.startsWith(`warehouse:${warehouseId}`))
  }
  
  // Invalidar warehouse options cache
  mutate((key) => typeof key === 'string' && key.includes('warehouse') && key.includes('options'))
}

// ===== VALIDATION HELPERS =====

/**
 * Valida datos de warehouse antes de enviar
 */
async function validateWarehouseData(
  data: CreateWarehouseData | UpdateWarehouseData,
  isUpdate: boolean = false
): Promise<ValidationResult> {
  const errors: string[] = []
  
  // Validaciones básicas
  if (!data.name?.trim()) {
    errors.push('El nombre del almacén es requerido')
  }
  
  if (!data.code?.trim()) {
    errors.push('El código del almacén es requerido')
  }
  
  if (!data.warehouseType) {
    errors.push('El tipo de almacén es requerido')
  }
  
  // Validación de unicidad de código (solo en creación o si cambió el código)
  if (data.code && (!isUpdate || !('id' in data))) {
    try {
      const excludeId = isUpdate && 'id' in data ? data.id : undefined
      const codeAvailable = await checkWarehouseCodeAvailable(data.code, excludeId)
      if (!codeAvailable) {
        errors.push('El código del almacén ya está en uso')
      }
    } catch (error) {
      console.warn('Could not check code availability:', error)
    }
  }
  
  // Validación de slug si se proporciona
  if (data.slug) {
    try {
      const excludeId = isUpdate && 'id' in data ? data.id : undefined
      const slugAvailable = await checkWarehouseSlugAvailable(data.slug, excludeId)
      if (!slugAvailable) {
        errors.push('El slug del almacén ya está en uso')
      }
    } catch (error) {
      console.warn('Could not check slug availability:', error)
    }
  }
  
  // Validación de capacidad
  if (data.maxCapacity !== undefined && data.maxCapacity < 0) {
    errors.push('La capacidad máxima debe ser un número positivo')
  }
  
  // Validación de email
  if (data.email && !isValidEmail(data.email)) {
    errors.push('El formato del email no es válido')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// ===== MAIN MUTATIONS HOOK =====

/**
 * Hook principal para mutations de warehouses
 */
export function useWarehousesMutations() {
  
  // ===== CREATE MUTATION =====
  const createMutation = useMemo(() => ({
    mutate: async (data: CreateWarehouseData, options: CreateMutationOptions = {}) => {
      const {
        onSuccess,
        onError,
        showToast = true,
        optimistic = true,
        autoGenerateSlug = true,
      } = options
      
      try {
        // Generar slug automáticamente si no se proporciona
        if (autoGenerateSlug && !data.slug && data.name) {
          data.slug = generateSlugFromName(data.name)
        }
        
        // Validación antes de enviar
        const validation = await validateWarehouseData(data, false)
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '))
        }
        
        // Crear warehouse
        const newWarehouse = await createWarehouse(data)
        
        // Invalidar cache
        invalidateWarehouseCache()
        
        // Success callback
        if (onSuccess) {
          onSuccess(newWarehouse)
        }
        
        // Toast notification
        if (showToast) {
          showToast(`Almacén "${newWarehouse.name}" creado exitosamente`, 'success')
        }
        
        return newWarehouse
        
      } catch (error: any) {
        const errorMessage = handleWarehouseError(error)
        
        // Error callback
        if (onError) {
          onError(new Error(errorMessage))
        }
        
        // Toast notification
        if (showToast) {
          showToast(errorMessage, 'error')
        }
        
        throw new Error(errorMessage)
      }
    },
    isLoading: false, // Se manejará en el componente con estado local
  }), [])
  
  // ===== UPDATE MUTATION =====
  const updateMutation = useMemo(() => ({
    mutate: async (data: UpdateWarehouseData, options: UpdateMutationOptions = {}) => {
      const {
        onSuccess,
        onError,
        showToast = true,
        optimistic = true,
        revalidateList = true,
      } = options
      
      try {
        // Validación antes de enviar
        const validation = await validateWarehouseData(data, true)
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '))
        }
        
        // Actualizar warehouse
        const updatedWarehouse = await updateWarehouse(data)
        
        // Invalidar cache
        if (revalidateList) {
          invalidateWarehouseCache(data.id)
        } else {
          // Solo invalidar el warehouse específico
          mutate(`warehouse:${data.id}`)
        }
        
        // Success callback
        if (onSuccess) {
          onSuccess(updatedWarehouse)
        }
        
        // Toast notification
        if (showToast) {
          showToast(`Almacén "${updatedWarehouse.name}" actualizado exitosamente`, 'success')
        }
        
        return updatedWarehouse
        
      } catch (error: any) {
        const errorMessage = handleWarehouseError(error)
        
        // Error callback
        if (onError) {
          onError(new Error(errorMessage))
        }
        
        // Toast notification
        if (showToast) {
          showToast(errorMessage, 'error')
        }
        
        throw new Error(errorMessage)
      }
    },
    isLoading: false,
  }), [])
  
  // ===== DELETE MUTATION =====
  const deleteMutation = useMemo(() => ({
    mutate: async (warehouse: Warehouse, options: DeleteMutationOptions = {}) => {
      const {
        onSuccess,
        onError,
        showToast = true,
        optimistic = true,
      } = options
      
      try {
        // Eliminar warehouse
        await deleteWarehouse(warehouse.id)
        
        // Invalidar cache
        invalidateWarehouseCache(warehouse.id)
        
        // Success callback
        if (onSuccess) {
          onSuccess(warehouse)
        }
        
        // Toast notification
        if (showToast) {
          showToast(`Almacén "${warehouse.name}" eliminado exitosamente`, 'success')
        }
        
        return warehouse
        
      } catch (error: any) {
        const errorMessage = handleWarehouseError(error)
        
        // Error callback
        if (onError) {
          onError(new Error(errorMessage))
        }
        
        // Toast notification
        if (showToast) {
          showToast(errorMessage, 'error')
        }
        
        throw new Error(errorMessage)
      }
    },
    isLoading: false,
  }), [])
  
  // ===== BULK OPERATIONS =====
  const bulkUpdateMutation = useMemo(() => ({
    mutate: async (updates: { id: string; data: Partial<UpdateWarehouseData> }[], options: MutationOptions = {}) => {
      const {
        onSuccess,
        onError,
        showToast = true,
      } = options
      
      try {
        // Ejecutar updates en paralelo (máximo 5 a la vez para no sobrecargar)
        const batchSize = 5
        const results: Warehouse[] = []
        
        for (let i = 0; i < updates.length; i += batchSize) {
          const batch = updates.slice(i, i + batchSize)
          const batchPromises = batch.map(update => 
            updateWarehouse({ ...update.data, id: update.id })
          )
          const batchResults = await Promise.all(batchPromises)
          results.push(...batchResults)
        }
        
        // Invalidar cache completo
        invalidateWarehouseCache()
        
        // Success callback
        if (onSuccess) {
          onSuccess(results)
        }
        
        // Toast notification
        if (showToast) {
          showToast(`${results.length} almacenes actualizados exitosamente`, 'success')
        }
        
        return results
        
      } catch (error: any) {
        const errorMessage = handleWarehouseError(error)
        
        // Error callback
        if (onError) {
          onError(new Error(errorMessage))
        }
        
        // Toast notification
        if (showToast) {
          showToast(errorMessage, 'error')
        }
        
        throw new Error(errorMessage)
      }
    },
    isLoading: false,
  }), [])
  
  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
    bulkUpdate: bulkUpdateMutation,
    
    // Utilities
    validateData: validateWarehouseData,
    generateSlug: generateSlugFromName,
    invalidateCache: invalidateWarehouseCache,
  }
}

// ===== VALIDATION HOOKS =====

/**
 * Hook para validación en tiempo real de código
 */
export function useWarehouseCodeValidation(code: string, excludeId?: string) {
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Debounce para evitar requests excesivos
  useEffect(() => {
    if (!code?.trim()) {
      setIsAvailable(null)
      setError(null)
      return
    }
    
    const timeoutId = setTimeout(async () => {
      setIsChecking(true)
      setError(null)
      
      try {
        const available = await checkWarehouseCodeAvailable(code, excludeId)
        setIsAvailable(available)
      } catch (err: any) {
        setError('Error al verificar disponibilidad del código')
        setIsAvailable(null)
      } finally {
        setIsChecking(false)
      }
    }, 500) // 500ms debounce para performance
    
    return () => clearTimeout(timeoutId)
  }, [code, excludeId])
  
  return {
    isChecking,
    isAvailable,
    error,
    isValid: isAvailable === true,
    isInvalid: isAvailable === false,
  }
}

/**
 * Hook para validación en tiempo real de slug
 */
export function useWarehouseSlugValidation(slug: string, excludeId?: string) {
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Debounce para evitar requests excesivos
  useEffect(() => {
    if (!slug?.trim()) {
      setIsAvailable(null)
      setError(null)
      return
    }
    
    const timeoutId = setTimeout(async () => {
      setIsChecking(true)
      setError(null)
      
      try {
        const available = await checkWarehouseSlugAvailable(slug, excludeId)
        setIsAvailable(available)
      } catch (err: any) {
        setError('Error al verificar disponibilidad del slug')
        setIsAvailable(null)
      } finally {
        setIsChecking(false)
      }
    }, 500) // 500ms debounce para performance
    
    return () => clearTimeout(timeoutId)
  }, [slug, excludeId])
  
  return {
    isChecking,
    isAvailable,
    error,
    isValid: isAvailable === true,
    isInvalid: isAvailable === false,
  }
}

// ===== IMPORTS NECESARIOS =====
import { useState, useEffect } from 'react'

// ===== EXPORTS =====
export default useWarehousesMutations