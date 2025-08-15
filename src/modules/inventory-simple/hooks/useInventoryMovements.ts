'use client'

/**
 * INVENTORY MOVEMENTS HOOKS
 * SWR hooks + mutations para inventory-movements
 * Patrón basado en el éxito del módulo Products
 */

import { useCallback } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { inventoryMovementsService } from '../services'
import type {
  InventoryMovement,
  CreateMovementData,
  UpdateMovementData,
  MovementFilters,
  MovementSortOptions,
  PaginationParams
} from '../types'

/**
 * Hook principal para obtener movimientos con filtros
 */
export const useInventoryMovements = (params: {
  filters?: MovementFilters
  sort?: MovementSortOptions
  pagination?: PaginationParams
  include?: string[]
} = {}) => {
  const key = ['inventory-movements', params]
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => inventoryMovementsService.getAll(params),
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  )
  
  return {
    movements: data?.data || [],
    meta: data?.meta,
    links: data?.links,
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook para obtener movimiento específico por ID
 */
export const useInventoryMovement = (id: string | null, include?: string[]) => {
  const key = id ? ['inventory-movements', id, include] : null
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => inventoryMovementsService.getById(id!, include),
    {
      revalidateOnFocus: false,
    }
  )
  
  return {
    movement: data?.data,
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook para mutations de movimientos
 */
export const useInventoryMovementsMutations = () => {
  const { mutate } = useSWRConfig()
  
  const createMovement = useCallback(async (data: CreateMovementData) => {
    try {
      const result = await inventoryMovementsService.create(data)
      
      // Invalidar cache de movements y entidades relacionadas
      mutate(key => Array.isArray(key) && key[0] === 'inventory-movements')
      
      // Invalidar stock relacionado (movements afectan stock)
      if (data.productId && data.warehouseId) {
        mutate(['stocks', 'product', data.productId])
        mutate(['warehouses', data.warehouseId, 'stock'])
      }
      if (data.locationId) {
        mutate(['warehouse-locations', data.locationId, 'stock'])
      }
      
      return result
    } catch (error) {
      console.error('Error creating inventory movement:', error)
      throw error
    }
  }, [mutate])
  
  const updateMovement = useCallback(async (id: string, data: UpdateMovementData) => {
    try {
      const result = await inventoryMovementsService.update(id, data)
      
      // Invalidar cache específico de movement y lista general
      mutate(['inventory-movements', id])
      mutate(key => Array.isArray(key) && key[0] === 'inventory-movements')
      
      return result
    } catch (error) {
      console.error('Error updating inventory movement:', error)
      throw error
    }
  }, [mutate])
  
  const deleteMovement = useCallback(async (id: string) => {
    try {
      await inventoryMovementsService.delete(id)
      
      // Invalidar cache
      mutate(['inventory-movements', id])
      mutate(key => Array.isArray(key) && key[0] === 'inventory-movements')
      
    } catch (error) {
      console.error('Error deleting inventory movement:', error)
      throw error
    }
  }, [mutate])
  
  return {
    createMovement,
    updateMovement,
    deleteMovement
  }
}

/**
 * Hook para obtener movimientos por producto
 */
export const useMovementsByProduct = (productId: string | null, include?: string[]) => {
  const key = productId ? ['inventory-movements', 'product', productId, include] : null
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => inventoryMovementsService.getByProduct(productId!, include),
    {
      revalidateOnFocus: false,
    }
  )
  
  return {
    movementsByProduct: data?.data || [],
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook para obtener movimientos por warehouse
 */
export const useMovementsByWarehouse = (warehouseId: string | null, include?: string[]) => {
  const key = warehouseId ? ['inventory-movements', 'warehouse', warehouseId, include] : null
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => inventoryMovementsService.getByWarehouse(warehouseId!, include),
    {
      revalidateOnFocus: false,
    }
  )
  
  return {
    movementsByWarehouse: data?.data || [],
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook para obtener movimientos de entrada
 */
export const useEntryMovements = (include?: string[]) => {
  const key = ['inventory-movements', 'entries', include]
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => inventoryMovementsService.getEntries(include),
    {
      revalidateOnFocus: false,
    }
  )
  
  return {
    entryMovements: data?.data || [],
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}

/**
 * Hook para obtener movimientos de salida
 */
export const useExitMovements = (include?: string[]) => {
  const key = ['inventory-movements', 'exits', include]
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => inventoryMovementsService.getExits(include),
    {
      revalidateOnFocus: false,
    }
  )
  
  return {
    exitMovements: data?.data || [],
    included: data?.included,
    isLoading,
    error,
    mutate
  }
}