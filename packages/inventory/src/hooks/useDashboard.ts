'use client'

/**
 * DASHBOARD HOOKS
 * Actividad reciente del dashboard de inventario (los totales viven en useInventoryCounts)
 */

import { useInventoryMovements } from './useInventoryMovements'

/**
 * Hook para obtener actividad reciente
 */
export const useRecentActivity = (limit = 10) => {
  const { movements, isLoading, error } = useInventoryMovements({
    include: ['product', 'warehouse', 'user'],
    sort: { field: 'movementDate', direction: 'desc' },
    pagination: { size: limit }
  })

  return {
    recentMovements: movements || [],
    isLoading,
    error
  }
}