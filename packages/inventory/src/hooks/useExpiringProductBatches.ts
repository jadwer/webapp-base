/**
 * USE EXPIRING PRODUCT BATCHES HOOK
 * Hook específico para obtener lotes próximos a vencer
 * Usado para alertas y dashboard metrics
 */

import { useMemo } from 'react'
import { useProductBatches } from './useProductBatches'
import type { ProductBatchFilters } from '../types'

export interface UseExpiringProductBatchesOptions {
  days?: number // Días antes del vencimiento (default: 30)
  enabled?: boolean
}

/**
 * Hook para obtener lotes próximos a vencer
 * Útil para dashboard metrics y alertas de vencimiento
 */
export function useExpiringProductBatches(options: UseExpiringProductBatchesOptions = {}) {
  const { days = 30, enabled = true } = options

  // Calcular fechas
  const { expiresAfter, expiresBefore } = useMemo(() => {
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + days)

    return {
      expiresAfter: today.toISOString().split('T')[0],
      expiresBefore: futureDate.toISOString().split('T')[0]
    }
  }, [days])

  // Filtros para lotes próximos a vencer
  const filters: ProductBatchFilters = useMemo(() => ({
    status: ['active'], // Solo lotes activos
    expiresAfter,
    expiresBefore
  }), [expiresAfter, expiresBefore])

  // Usar el hook base con filtros específicos
  const {
    productBatches: expiringBatches,
    isLoading,
    error,
    meta
  } = useProductBatches({
    filters,
    sort: { field: 'expirationDate', direction: 'asc' }, // Los que vencen primero
    page: 1,
    pageSize: 50, // Suficiente para mostrar en dashboard
    enabled
  })

  // Estadísticas adicionales
  const stats = useMemo(() => {
    if (!expiringBatches.length) {
      return {
        total: 0,
        critical: 0, // Vencen en menos de 7 días
        warning: 0,  // Vencen en 7-15 días
        info: 0      // Vencen en 15-30 días
      }
    }

    const today = new Date()
    const critical = new Date()
    critical.setDate(today.getDate() + 7)
    const warning = new Date()
    warning.setDate(today.getDate() + 15)

    return expiringBatches.reduce((acc, batch) => {
      acc.total++
      
      if (batch.expirationDate) {
        const expDate = new Date(batch.expirationDate)
        
        if (expDate <= critical) {
          acc.critical++
        } else if (expDate <= warning) {
          acc.warning++
        } else {
          acc.info++
        }
      }
      
      return acc
    }, { total: 0, critical: 0, warning: 0, info: 0 })
  }, [expiringBatches])

  return {
    expiringBatches,
    isLoading,
    error,
    meta,
    stats,
    // Métodos de utilidad
    hasCriticalBatches: stats.critical > 0,
    hasWarningBatches: stats.warning > 0,
    totalExpiring: stats.total
  }
}