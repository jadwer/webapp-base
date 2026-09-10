'use client'

/**
 * DASHBOARD HOOKS
 * Hooks para obtener métricas y datos del dashboard de inventario
 */

import { useWarehouses } from './useWarehouses'
import { useLocations } from './useLocations'
import { useStock } from './useStock'
import { useInventoryMovements } from './useInventoryMovements'

/**
 * Hook para obtener métricas principales del dashboard
 */
export const useInventoryDashboard = () => {
  // Contadores básicos
  const { warehouses, isLoading: warehousesLoading } = useWarehouses({
    filters: { isActive: true }
  })
  
  const { locations, isLoading: locationsLoading } = useLocations({
    filters: { isActive: true },
    include: ['warehouse']
  })
  
  const { stock, isLoading: stockLoading } = useStock({
    include: ['product', 'warehouse', 'location']
  })
  
  // Movimientos recientes (sin filtro de fecha para obtener datos)
  const { movements: todayMovements, isLoading: movementsLoading } = useInventoryMovements({
    include: ['product', 'warehouse', 'user'],
    sort: { field: 'movementDate', direction: 'desc' },
    pagination: { size: 10 }
  })

  // Calcular métricas de stock (API devuelve strings, convertir a números)
  const stockMetrics = {
    totalProducts: stock?.length || 0,
    availableStock: stock?.filter(s => parseFloat(String(s.quantity || '0')) > 0)?.length || 0,
    lowStock: stock?.filter(s => {
      const quantity = parseFloat(String(s.quantity || '0'))
      const minStock = parseFloat(String(s.minimumStock || '0'))
      return minStock > 0 && quantity <= minStock
    })?.length || 0,
    outOfStock: stock?.filter(s => parseFloat(String(s.quantity || '0')) <= 0)?.length || 0
  }

  // Calcular métricas de movimientos del día
  const movementsMetrics = {
    total: todayMovements?.length || 0,
    entries: todayMovements?.filter(m => m.movementType === 'entry')?.length || 0,
    exits: todayMovements?.filter(m => m.movementType === 'exit')?.length || 0,
    transfers: todayMovements?.filter(m => m.movementType === 'transfer')?.length || 0
  }

  return {
    // Contadores principales
    metrics: {
      warehouses: warehouses?.length || 0,
      locations: locations?.length || 0,
      ...stockMetrics,
      ...movementsMetrics
    },
    
    // Estados de carga
    isLoading: warehousesLoading || locationsLoading || stockLoading || movementsLoading,
    
    // Datos raw para otros usos
    warehouses,
    locations,
    stock,
    todayMovements
  }
}

/**
 * Hook para obtener alertas de stock bajo
 */
export const useStockAlerts = () => {
  const { stock, isLoading, error } = useStock({
    include: ['product', 'warehouse', 'location']
  })

  const alerts = stock?.filter(stockItem => {
    if (!stockItem.minimumStock) return false
    const quantity = parseFloat(String(stockItem.quantity || '0'))
    const minStock = parseFloat(String(stockItem.minimumStock || '0'))
    return quantity <= minStock
  }).map(stockItem => {
    const quantity = parseFloat(String(stockItem.quantity || '0'))
    const minStock = parseFloat(String(stockItem.minimumStock || '0'))
    
    return {
      id: stockItem.id,
      type: quantity <= 0 ? 'out_of_stock' : 'low_stock',
      product: stockItem.product,
      warehouse: stockItem.warehouse,
      location: stockItem.location,
      currentQuantity: quantity,
      minimumQuantity: minStock,
      severity: quantity <= 0 ? 'critical' : 'warning'
    }
  }) || []

  return {
    alerts,
    criticalAlerts: alerts.filter(a => a.severity === 'critical'),
    warningAlerts: alerts.filter(a => a.severity === 'warning'),
    totalAlerts: alerts.length,
    isLoading,
    error
  }
}

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