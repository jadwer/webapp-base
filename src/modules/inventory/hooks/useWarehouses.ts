'use client'

/**
 * 📦 USE WAREHOUSES HOOK - INVENTORY MODULE
 * Hook principal para data fetching de warehouses con SWR
 * 
 * Features:
 * - SWR caching inteligente
 * - Performance optimización para 500K+ productos
 * - Error handling enterprise
 * - Coordinación con UI store
 * - Business rules integration
 */

import useSWR from 'swr'
import { useMemo } from 'react'
import { getWarehouses } from '../services'
import type {
  Warehouse,
  WarehouseFilters,
  PaginatedWarehousesResponse,
  WarehouseLoadingState,
  WAREHOUSE_BUSINESS_RULES,
} from '../types'

// ===== HOOK TYPES =====

interface UseWarehousesOptions {
  filters?: WarehouseFilters
  enabled?: boolean        // Permite deshabilitar la query
  refreshInterval?: number // Auto-refresh interval (default: disabled)
  revalidateOnFocus?: boolean // Revalidar al hacer focus (default: true)
  dedupingInterval?: number   // Deduping interval (default: 5000ms)
}

interface UseWarehousesReturn {
  // Data
  warehouses: Warehouse[]
  total: number
  pages: number
  currentPage: number
  
  // Loading states
  isLoading: boolean
  isError: boolean
  error: Error | null
  isEmpty: boolean
  isValidating: boolean
  
  // Pagination info
  hasNextPage: boolean
  hasPrevPage: boolean
  
  // Actions
  refresh: () => Promise<PaginatedWarehousesResponse | undefined>
  mutate: (data?: PaginatedWarehousesResponse) => Promise<PaginatedWarehousesResponse | undefined>
  
  // Utilities
  loadingState: WarehouseLoadingState
}

// ===== SWR KEY BUILDER =====

/**
 * Construye key único para SWR cache
 * Performance: Incluye todos los filtros para cache granular
 */
function buildSWRKey(filters: WarehouseFilters = {}): string {
  const baseKey = 'warehouses'
  
  // Si no hay filtros, usar key simple
  if (Object.keys(filters).length === 0) {
    return baseKey
  }
  
  // Crear key con filtros para cache granular
  const filterParts: string[] = []
  
  if (filters.search) filterParts.push(`search:${filters.search}`)
  if (filters.warehouseType) {
    const types = Array.isArray(filters.warehouseType) 
      ? filters.warehouseType.join(',') 
      : filters.warehouseType
    filterParts.push(`type:${types}`)
  }
  if (typeof filters.isActive === 'boolean') filterParts.push(`active:${filters.isActive}`)
  if (filters.city) filterParts.push(`city:${filters.city}`)
  if (filters.state) filterParts.push(`state:${filters.state}`)
  if (filters.country) filterParts.push(`country:${filters.country}`)
  if (filters.minCapacity) filterParts.push(`minCap:${filters.minCapacity}`)
  if (filters.maxCapacity) filterParts.push(`maxCap:${filters.maxCapacity}`)
  if (filters.sortBy) filterParts.push(`sort:${filters.sortBy}:${filters.sortDirection || 'asc'}`)
  if (filters.page) filterParts.push(`page:${filters.page}`)
  if (filters.limit) filterParts.push(`limit:${filters.limit}`)
  if (filters.include) filterParts.push(`include:${filters.include.join(',')}`)
  
  return filterParts.length > 0 ? `${baseKey}?${filterParts.join('&')}` : baseKey
}

// ===== MAIN HOOK =====

/**
 * Hook principal para gestión de warehouses
 * Performance optimizado para 500K+ productos
 */
export function useWarehouses(options: UseWarehousesOptions = {}): UseWarehousesReturn {
  const {
    filters = {},
    enabled = true,
    refreshInterval,
    revalidateOnFocus = true,
    dedupingInterval = 5000,
  } = options
  
  // Aplicar límites de performance para 500K+ productos
  const optimizedFilters = useMemo((): WarehouseFilters => ({
    ...filters,
    limit: Math.min(
      filters.limit || WAREHOUSE_BUSINESS_RULES.DEFAULT_PAGE_SIZE,
      WAREHOUSE_BUSINESS_RULES.MAX_PAGE_SIZE
    ),
    page: filters.page || 1,
  }), [filters])
  
  // SWR key
  const swrKey = enabled ? buildSWRKey(optimizedFilters) : null
  
  // SWR configuration optimizada para performance
  const swrConfig = useMemo(() => ({
    refreshInterval,
    revalidateOnFocus,
    dedupingInterval,
    revalidateOnReconnect: true,
    errorRetryCount: 3,
    errorRetryInterval: 1000,
    // Performance: No revalidar automáticamente para evitar requests innecesarios
    revalidateIfStale: false,
    // Cache duration extendida para performance
    focusThrottleInterval: 5000,
  }), [refreshInterval, revalidateOnFocus, dedupingInterval])
  
  // SWR hook principal
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<PaginatedWarehousesResponse>(
    swrKey,
    () => getWarehouses(optimizedFilters),
    swrConfig
  )
  
  // Computed values
  const warehouses = data?.data || []
  const pagination = data?.meta?.pagination
  const total = pagination?.total || 0
  const pages = pagination?.pages || 0
  const currentPage = pagination?.page || 1
  
  // Loading states
  const isEmpty = !isLoading && warehouses.length === 0
  const isError = !!error
  
  // Pagination helpers
  const hasNextPage = currentPage < pages
  const hasPrevPage = currentPage > 1
  
  // Refresh function
  const refresh = async () => {
    return mutate()
  }
  
  // Loading state object para compatibilidad con otros hooks
  const loadingState: WarehouseLoadingState = {
    isLoading,
    isError,
    error: error || null,
    isEmpty,
  }
  
  return {
    // Data
    warehouses,
    total,
    pages,
    currentPage,
    
    // Loading states  
    isLoading,
    isError,
    error: error || null,
    isEmpty,
    isValidating,
    
    // Pagination
    hasNextPage,
    hasPrevPage,
    
    // Actions
    refresh,
    mutate,
    
    // Utilities
    loadingState,
  }
}

// ===== HOOK PARA WAREHOUSE INDIVIDUAL =====

interface UseWarehouseOptions {
  include?: string[]       // Relationships a incluir
  enabled?: boolean        // Permite deshabilitar la query
  refreshInterval?: number
}

interface UseWarehouseReturn {
  warehouse: Warehouse | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  refresh: () => Promise<Warehouse | undefined>
  mutate: (data?: Warehouse) => Promise<Warehouse | undefined>
}

/**
 * Hook para obtener un warehouse específico por ID
 */
export function useWarehouse(id: string | null, options: UseWarehouseOptions = {}): UseWarehouseReturn {
  const {
    include = [],
    enabled = true,
    refreshInterval,
  } = options
  
  // Import warehouse service function
  const { getWarehouse } = require('../services')
  
  // SWR key
  const swrKey = enabled && id ? `warehouse:${id}${include.length > 0 ? `:${include.join(',')}` : ''}` : null
  
  // SWR hook
  const {
    data: warehouse,
    error,
    isLoading,
    mutate,
  } = useSWR<Warehouse>(
    swrKey,
    () => getWarehouse(id!, include),
    {
      refreshInterval,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      errorRetryCount: 3,
    }
  )
  
  const refresh = async () => {
    return mutate()
  }
  
  return {
    warehouse: warehouse || null,
    isLoading,
    isError: !!error,
    error: error || null,
    refresh,
    mutate,
  }
}

// ===== HOOKS AUXILIARES =====

/**
 * Hook optimizado para búsqueda con debounce
 * Performance: Evita requests excesivos durante typing
 */
export function useWarehousesSearch(searchTerm: string, additionalFilters: WarehouseFilters = {}) {
  // Debounce aplicado en el UI store, aquí solo usamos el valor final
  const filters = useMemo((): WarehouseFilters => ({
    ...additionalFilters,
    search: searchTerm.trim() || undefined,
    // Reset page cuando cambia search
    page: searchTerm !== additionalFilters.search ? 1 : additionalFilters.page,
  }), [searchTerm, additionalFilters])
  
  return useWarehouses({
    filters,
    enabled: true,
    // Menor refresh interval para búsquedas
    refreshInterval: 30000,
  })
}

/**
 * Hook para obtener opciones de warehouse para selects
 * Performance: Cache extendido, minimal data
 */
export function useWarehouseOptions(activeOnly: boolean = true) {
  const filters: WarehouseFilters = {
    isActive: activeOnly,
    // Solo campos necesarios para options
    limit: WAREHOUSE_BUSINESS_RULES.MAX_PAGE_SIZE,
    sortBy: 'name',
    sortDirection: 'asc',
  }
  
  const { warehouses, isLoading, isError } = useWarehouses({
    filters,
    refreshInterval: 60000, // Cache más largo para options
    dedupingInterval: 10000,
  })
  
  // Transform to option format
  const options = useMemo(() => 
    warehouses.map(warehouse => ({
      value: warehouse.id,
      label: `${warehouse.name} (${warehouse.code})`,
      type: warehouse.warehouseType,
      isActive: warehouse.isActive,
      city: warehouse.city,
    })),
    [warehouses]
  )
  
  return {
    options,
    isLoading,
    isError,
    warehouses, // Raw data si se necesita
  }
}

/**
 * Hook para métricas básicas de warehouses
 * Preparado para dashboard (fase posterior)
 */
export function useWarehouseMetrics() {
  const { warehouses, isLoading, isError } = useWarehouses({
    filters: {
      limit: WAREHOUSE_BUSINESS_RULES.MAX_PAGE_SIZE,
      // Include stock para métricas
      include: ['stock'],
    },
    refreshInterval: 60000, // Refresh cada minuto para métricas
  })
  
  const metrics = useMemo(() => {
    if (!warehouses.length) return null
    
    const total = warehouses.length
    const active = warehouses.filter(w => w.isActive).length
    const byType = warehouses.reduce((acc, w) => {
      acc[w.warehouseType] = (acc[w.warehouseType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Métricas básicas (se expandirán en fases posteriores)
    return {
      total,
      active,
      inactive: total - active,
      byType,
      // Placeholders para métricas futuras
      totalLocations: 0,
      totalStockValue: 0,
      lowStockAlerts: 0,
    }
  }, [warehouses])
  
  return {
    metrics,
    isLoading,
    isError,
  }
}

// ===== EXPORTS =====
export default useWarehouses