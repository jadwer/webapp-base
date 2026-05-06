/**
 * INVENTORY UI STORE
 * Simple Zustand store para UI state del módulo inventory
 * Patrón basado en el éxito del módulo Products - NO re-renders
 */

import { create } from 'zustand'
import type {
  WarehouseFilters,
  LocationFilters,
  StockFilters,
  MovementFilters,
  WarehouseSortOptions,
  LocationSortOptions,
  StockSortOptions,
  MovementSortOptions,
  PaginationParams
} from '../types'

/**
 * UI State para manejo de filtros, paginación y view modes
 * CLAVE: Separado del server state (SWR) para zero re-renders
 */
interface InventoryUIState {
  // =================
  // WAREHOUSE STATE
  // =================
  warehouseFilters: WarehouseFilters
  warehouseSort: WarehouseSortOptions | null
  warehousePagination: PaginationParams
  warehouseViewMode: 'table' | 'grid'
  warehouseSelectedIds: string[]
  
  setWarehouseFilters: (filters: WarehouseFilters) => void
  setWarehouseSort: (sort: WarehouseSortOptions | null) => void
  setWarehousePagination: (pagination: PaginationParams) => void
  setWarehouseViewMode: (mode: 'table' | 'grid') => void
  setWarehouseSelectedIds: (ids: string[]) => void
  clearWarehouseFilters: () => void
  
  // =================
  // LOCATION STATE
  // =================
  locationFilters: LocationFilters
  locationSort: LocationSortOptions | null
  locationPagination: PaginationParams
  locationViewMode: 'table' | 'grid'
  locationSelectedIds: string[]
  
  setLocationFilters: (filters: LocationFilters) => void
  setLocationSort: (sort: LocationSortOptions | null) => void
  setLocationPagination: (pagination: PaginationParams) => void
  setLocationViewMode: (mode: 'table' | 'grid') => void
  setLocationSelectedIds: (ids: string[]) => void
  clearLocationFilters: () => void
  
  // =================
  // STOCK STATE
  // =================
  stockFilters: StockFilters
  stockSort: StockSortOptions | null
  stockPagination: PaginationParams
  stockViewMode: 'table' | 'grid'
  stockSelectedIds: string[]
  
  setStockFilters: (filters: StockFilters) => void
  setStockSort: (sort: StockSortOptions | null) => void
  setStockPagination: (pagination: PaginationParams) => void
  setStockViewMode: (mode: 'table' | 'grid') => void
  setStockSelectedIds: (ids: string[]) => void
  clearStockFilters: () => void
  
  // =================
  // MOVEMENT STATE
  // =================
  movementFilters: MovementFilters
  movementSort: MovementSortOptions | null
  movementPagination: PaginationParams
  movementViewMode: 'table' | 'grid'
  movementSelectedIds: string[]
  
  setMovementFilters: (filters: MovementFilters) => void
  setMovementSort: (sort: MovementSortOptions | null) => void
  setMovementPagination: (pagination: PaginationParams) => void
  setMovementViewMode: (mode: 'table' | 'grid') => void
  setMovementSelectedIds: (ids: string[]) => void
  clearMovementFilters: () => void
  
  // =================
  // GLOBAL ACTIONS
  // =================
  clearAllFilters: () => void
}

/**
 * Zustand store con initial state simple
 */
export const useInventoryUIStore = create<InventoryUIState>((set) => ({
  // =================
  // WAREHOUSE STATE
  // =================
  warehouseFilters: {},
  warehouseSort: null,
  warehousePagination: { page: 1, size: 20 },
  warehouseViewMode: 'table',
  warehouseSelectedIds: [],
  
  setWarehouseFilters: (filters) => {
    console.log('🔍 [Inventory-Warehouses] Filters updated:', filters)
    set({ warehouseFilters: filters })
  },
  setWarehouseSort: (sort) => {
    console.log('📊 [Inventory-Warehouses] Sort updated:', sort)
    set({ warehouseSort: sort })
  },
  setWarehousePagination: (pagination) => {
    console.log('📄 [Inventory-Warehouses] Pagination updated:', pagination)
    set({ warehousePagination: pagination })
  },
  setWarehouseViewMode: (mode) => {
    console.log('👁️ [Inventory-Warehouses] View mode:', mode)
    set({ warehouseViewMode: mode })
  },
  setWarehouseSelectedIds: (ids) => set({ warehouseSelectedIds: ids }),
  clearWarehouseFilters: () => set({ 
    warehouseFilters: {},
    warehouseSort: null,
    warehousePagination: { page: 1, size: 20 }
  }),
  
  // =================
  // LOCATION STATE
  // =================
  locationFilters: {},
  locationSort: null,
  locationPagination: { page: 1, size: 20 },
  locationViewMode: 'table',
  locationSelectedIds: [],
  
  setLocationFilters: (filters) => {
    console.log('🔍 [Inventory-Locations] Filters updated:', filters)
    set({ locationFilters: filters })
  },
  setLocationSort: (sort) => {
    console.log('📊 [Inventory-Locations] Sort updated:', sort)
    set({ locationSort: sort })
  },
  setLocationPagination: (pagination) => {
    console.log('📄 [Inventory-Locations] Pagination updated:', pagination)
    set({ locationPagination: pagination })
  },
  setLocationViewMode: (mode) => {
    console.log('👁️ [Inventory-Locations] View mode:', mode)
    set({ locationViewMode: mode })
  },
  setLocationSelectedIds: (ids) => set({ locationSelectedIds: ids }),
  clearLocationFilters: () => set({
    locationFilters: {},
    locationSort: null,
    locationPagination: { page: 1, size: 20 }
  }),
  
  // =================
  // STOCK STATE
  // =================
  stockFilters: {},
  stockSort: null,
  stockPagination: { page: 1, size: 20 },
  stockViewMode: 'table',
  stockSelectedIds: [],
  
  setStockFilters: (filters) => {
    console.log('🔍 [Inventory-Stock] Filters updated:', filters)
    set({ stockFilters: filters })
  },
  setStockSort: (sort) => {
    console.log('📊 [Inventory-Stock] Sort updated:', sort)
    set({ stockSort: sort })
  },
  setStockPagination: (pagination) => {
    console.log('📄 [Inventory-Stock] Pagination updated:', pagination)
    set({ stockPagination: pagination })
  },
  setStockViewMode: (mode) => {
    console.log('👁️ [Inventory-Stock] View mode:', mode)
    set({ stockViewMode: mode })
  },
  setStockSelectedIds: (ids) => set({ stockSelectedIds: ids }),
  clearStockFilters: () => set({
    stockFilters: {},
    stockSort: null,
    stockPagination: { page: 1, size: 20 }
  }),
  
  // =================
  // MOVEMENT STATE
  // =================
  movementFilters: {},
  movementSort: { field: 'movementDate', direction: 'desc' }, // Default: más recientes primero
  movementPagination: { page: 1, size: 20 },
  movementViewMode: 'table',
  movementSelectedIds: [],
  
  setMovementFilters: (filters) => {
    console.log('🔍 [Inventory-Movements] Filters updated:', filters)
    set({ movementFilters: filters })
  },
  setMovementSort: (sort) => {
    console.log('📊 [Inventory-Movements] Sort updated:', sort)
    set({ movementSort: sort })
  },
  setMovementPagination: (pagination) => {
    console.log('📄 [Inventory-Movements] Pagination updated:', pagination)
    set({ movementPagination: pagination })
  },
  setMovementViewMode: (mode) => {
    console.log('👁️ [Inventory-Movements] View mode:', mode)
    set({ movementViewMode: mode })
  },
  setMovementSelectedIds: (ids) => set({ movementSelectedIds: ids }),
  clearMovementFilters: () => set({
    movementFilters: {},
    movementSort: { field: 'movementDate', direction: 'desc' },
    movementPagination: { page: 1, size: 20 }
  }),
  
  // =================
  // GLOBAL ACTIONS
  // =================
  clearAllFilters: () => set({
    warehouseFilters: {},
    warehouseSort: null,
    warehousePagination: { page: 1, size: 20 },
    locationFilters: {},
    locationSort: null,
    locationPagination: { page: 1, size: 20 },
    stockFilters: {},
    stockSort: null,
    stockPagination: { page: 1, size: 20 },
    movementFilters: {},
    movementSort: { field: 'movementDate', direction: 'desc' },
    movementPagination: { page: 1, size: 20 }
  })
}))

/**
 * Hooks específicos para cada entidad
 * Patrón para evitar re-renders innecesarios
 */

// Warehouse UI hooks
export const useWarehouseUIStore = () => {
  const {
    warehouseFilters,
    warehouseSort,
    warehousePagination,
    warehouseViewMode,
    warehouseSelectedIds,
    setWarehouseFilters,
    setWarehouseSort,
    setWarehousePagination,
    setWarehouseViewMode,
    setWarehouseSelectedIds,
    clearWarehouseFilters
  } = useInventoryUIStore()
  
  return {
    filters: warehouseFilters,
    sort: warehouseSort,
    pagination: warehousePagination,
    viewMode: warehouseViewMode,
    selectedIds: warehouseSelectedIds,
    setFilters: setWarehouseFilters,
    setSort: setWarehouseSort,
    setPagination: setWarehousePagination,
    setViewMode: setWarehouseViewMode,
    setSelectedIds: setWarehouseSelectedIds,
    clearFilters: clearWarehouseFilters
  }
}

// Location UI hooks
export const useLocationUIStore = () => {
  const {
    locationFilters,
    locationSort,
    locationPagination,
    locationViewMode,
    locationSelectedIds,
    setLocationFilters,
    setLocationSort,
    setLocationPagination,
    setLocationViewMode,
    setLocationSelectedIds,
    clearLocationFilters
  } = useInventoryUIStore()
  
  return {
    filters: locationFilters,
    sort: locationSort,
    pagination: locationPagination,
    viewMode: locationViewMode,
    selectedIds: locationSelectedIds,
    setFilters: setLocationFilters,
    setSort: setLocationSort,
    setPagination: setLocationPagination,
    setViewMode: setLocationViewMode,
    setSelectedIds: setLocationSelectedIds,
    clearFilters: clearLocationFilters
  }
}

// Stock UI hooks
export const useStockUIStore = () => {
  const {
    stockFilters,
    stockSort,
    stockPagination,
    stockViewMode,
    stockSelectedIds,
    setStockFilters,
    setStockSort,
    setStockPagination,
    setStockViewMode,
    setStockSelectedIds,
    clearStockFilters
  } = useInventoryUIStore()
  
  return {
    filters: stockFilters,
    sort: stockSort,
    pagination: stockPagination,
    viewMode: stockViewMode,
    selectedIds: stockSelectedIds,
    setFilters: setStockFilters,
    setSort: setStockSort,
    setPagination: setStockPagination,
    setViewMode: setStockViewMode,
    setSelectedIds: setStockSelectedIds,
    clearFilters: clearStockFilters
  }
}

// Movement UI hooks
export const useMovementUIStore = () => {
  const {
    movementFilters,
    movementSort,
    movementPagination,
    movementViewMode,
    movementSelectedIds,
    setMovementFilters,
    setMovementSort,
    setMovementPagination,
    setMovementViewMode,
    setMovementSelectedIds,
    clearMovementFilters
  } = useInventoryUIStore()
  
  return {
    filters: movementFilters,
    sort: movementSort,
    pagination: movementPagination,
    viewMode: movementViewMode,
    selectedIds: movementSelectedIds,
    setFilters: setMovementFilters,
    setSort: setMovementSort,
    setPagination: setMovementPagination,
    setViewMode: setMovementViewMode,
    setSelectedIds: setMovementSelectedIds,
    clearFilters: clearMovementFilters
  }
}