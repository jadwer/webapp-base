'use client'

/**
 * 📦 WAREHOUSES UI STORE - INVENTORY MODULE
 * Zustand store para UI state independiente de data fetching
 * 
 * Features:
 * - Zero re-renders pattern (estado independiente de SWR)
 * - Performance optimización para 500K+ productos
 * - Debounce automático en search
 * - View modes persistentes
 * - Focus preservation en filtros
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { WarehouseFilters, WarehouseType, WAREHOUSE_BUSINESS_RULES } from '../types'
import type { ViewMode, SortDirection } from '@/modules/products/types'

// ===== STATE INTERFACES =====

interface WarehousesFiltersState {
  // Búsqueda
  search: string
  searchDebounced: string  // Valor con debounce aplicado
  
  // Filtros específicos
  warehouseType: WarehouseType | 'all'
  isActive: boolean | 'all'
  city: string
  state: string
  country: string
  
  // Filtros de capacidad
  minCapacity: number | undefined
  maxCapacity: number | undefined
  
  // Ordenamiento
  sortBy: 'name' | 'code' | 'warehouseType' | 'city' | 'createdAt' | 'updatedAt'
  sortDirection: SortDirection
  
  // Paginación
  page: number
  limit: number
  
  // Include relationships
  includeLocations: boolean
  includeStock: boolean
}

interface WarehousesViewState {
  // Modo de vista actual
  viewMode: ViewMode
  
  // Estado de UI
  isFiltersVisible: boolean
  isCompactMode: boolean
  
  // Loading states locales (independientes de SWR)
  isSearching: boolean
  
  // Selection state para bulk operations
  selectedIds: string[]
  isAllSelected: boolean
  
  // Focus preservation
  lastFocusedInput: string | null
}

interface WarehousesUIStore extends WarehousesFiltersState, WarehousesViewState {
  // ===== FILTER ACTIONS =====
  setSearch: (search: string) => void
  setWarehouseType: (type: WarehouseType | 'all') => void
  setIsActive: (isActive: boolean | 'all') => void
  setCity: (city: string) => void
  setState: (state: string) => void
  setCountry: (country: string) => void
  setMinCapacity: (capacity: number | undefined) => void
  setMaxCapacity: (capacity: number | undefined) => void
  setSorting: (sortBy: WarehousesFiltersState['sortBy'], direction?: SortDirection) => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setIncludeLocations: (include: boolean) => void
  setIncludeStock: (include: boolean) => void
  
  // ===== VIEW ACTIONS =====
  setViewMode: (mode: ViewMode) => void
  toggleFilters: () => void
  setCompactMode: (compact: boolean) => void
  
  // ===== SELECTION ACTIONS =====
  toggleSelection: (id: string) => void
  toggleSelectAll: (allIds: string[]) => void
  clearSelection: () => void
  
  // ===== UTILITY ACTIONS =====
  resetFilters: () => void
  resetPagination: () => void
  getApiFilters: () => WarehouseFilters
  
  // ===== FOCUS MANAGEMENT =====
  setLastFocusedInput: (inputName: string | null) => void
  restoreFocus: () => void
}

// ===== DEFAULT VALUES =====

const DEFAULT_FILTERS: WarehousesFiltersState = {
  // Búsqueda
  search: '',
  searchDebounced: '',
  
  // Filtros específicos
  warehouseType: 'all',
  isActive: 'all',
  city: '',
  state: '',
  country: '',
  
  // Capacidad
  minCapacity: undefined,
  maxCapacity: undefined,
  
  // Ordenamiento
  sortBy: 'name',
  sortDirection: 'asc',
  
  // Paginación (Optimizada para 500K+ productos)
  page: 1,
  limit: WAREHOUSE_BUSINESS_RULES.DEFAULT_PAGE_SIZE,
  
  // Relationships
  includeLocations: false,
  includeStock: false,
}

const DEFAULT_VIEW: WarehousesViewState = {
  // Vista por defecto: table (más eficiente para grandes datasets)
  viewMode: 'table',
  
  // UI state
  isFiltersVisible: true,
  isCompactMode: false,
  isSearching: false,
  
  // Selection
  selectedIds: [],
  isAllSelected: false,
  
  // Focus
  lastFocusedInput: null,
}

// ===== DEBOUNCE UTILITIES =====

let searchDebounceTimeout: NodeJS.Timeout | null = null

function debounceSearch(search: string, callback: (debouncedValue: string) => void) {
  if (searchDebounceTimeout) {
    clearTimeout(searchDebounceTimeout)
  }
  
  // Performance: 500ms debounce para 500K+ productos
  searchDebounceTimeout = setTimeout(() => {
    callback(search)
  }, WAREHOUSE_BUSINESS_RULES.SEARCH_DEBOUNCE_MS)
}

// ===== STORE IMPLEMENTATION =====

export const useWarehousesUIStore = create<WarehousesUIStore>()(
  devtools(
    (set, get) => ({
      ...DEFAULT_FILTERS,
      ...DEFAULT_VIEW,
      
      // ===== FILTER ACTIONS =====
      
      setSearch: (search: string) => {
        set({ search, isSearching: true }, false, '🔍 warehouse search')
        
        // Reset page cuando cambia search
        if (search !== get().search) {
          set({ page: 1 }, false, '📄 reset page on search')
        }
        
        // Debounce para performance
        debounceSearch(search, (debouncedValue) => {
          set({ 
            searchDebounced: debouncedValue,
            isSearching: false 
          }, false, '🔍 warehouse search debounced')
        })
      },
      
      setWarehouseType: (warehouseType: WarehouseType | 'all') => {
        set({ warehouseType, page: 1 }, false, '🏢 warehouse type filter')
      },
      
      setIsActive: (isActive: boolean | 'all') => {
        set({ isActive, page: 1 }, false, '✅ active filter')
      },
      
      setCity: (city: string) => {
        set({ city, page: 1 }, false, '🏙️ city filter')
      },
      
      setState: (state: string) => {
        set({ state, page: 1 }, false, '🗺️ state filter')
      },
      
      setCountry: (country: string) => {
        set({ country, page: 1 }, false, '🌍 country filter')
      },
      
      setMinCapacity: (minCapacity: number | undefined) => {
        set({ minCapacity, page: 1 }, false, '📊 min capacity filter')
      },
      
      setMaxCapacity: (maxCapacity: number | undefined) => {
        set({ maxCapacity, page: 1 }, false, '📊 max capacity filter')
      },
      
      setSorting: (sortBy: WarehousesFiltersState['sortBy'], direction?: SortDirection) => {
        const currentSort = get()
        const newDirection = direction || (
          currentSort.sortBy === sortBy && currentSort.sortDirection === 'asc' 
            ? 'desc' 
            : 'asc'
        )
        
        set({ 
          sortBy, 
          sortDirection: newDirection,
          page: 1  // Reset page cuando cambia sorting
        }, false, `📊 sort by ${sortBy} ${newDirection}`)
      },
      
      setPage: (page: number) => {
        set({ page }, false, `📄 page ${page}`)
      },
      
      setLimit: (limit: number) => {
        // Aplicar límite máximo para performance
        const safeLimit = Math.min(limit, WAREHOUSE_BUSINESS_RULES.MAX_PAGE_SIZE)
        set({ 
          limit: safeLimit, 
          page: 1  // Reset page cuando cambia limit
        }, false, `📊 limit ${safeLimit}`)
      },
      
      setIncludeLocations: (includeLocations: boolean) => {
        set({ includeLocations }, false, '🔗 include locations')
      },
      
      setIncludeStock: (includeStock: boolean) => {
        set({ includeStock }, false, '🔗 include stock')
      },
      
      // ===== VIEW ACTIONS =====
      
      setViewMode: (viewMode: ViewMode) => {
        set({ viewMode }, false, `👁️ view mode ${viewMode}`)
        
        // Auto-adjust settings por view mode para performance
        if (viewMode === 'table' || viewMode === 'list') {
          // Modos más eficientes para datasets grandes
          set({ limit: Math.min(get().limit, 50) }, false, '⚡ adjust limit for table/list')
        }
      },
      
      toggleFilters: () => {
        set((state) => ({ 
          isFiltersVisible: !state.isFiltersVisible 
        }), false, '🔽 toggle filters')
      },
      
      setCompactMode: (isCompactMode: boolean) => {
        set({ isCompactMode }, false, `📦 compact mode ${isCompactMode}`)
      },
      
      // ===== SELECTION ACTIONS =====
      
      toggleSelection: (id: string) => {
        set((state) => {
          const selectedIds = state.selectedIds.includes(id)
            ? state.selectedIds.filter(selectedId => selectedId !== id)
            : [...state.selectedIds, id]
          
          return {
            selectedIds,
            isAllSelected: false, // Reset all selected cuando se hace toggle individual
          }
        }, false, `☑️ toggle selection ${id}`)
      },
      
      toggleSelectAll: (allIds: string[]) => {
        set((state) => {
          const isAllSelected = !state.isAllSelected
          return {
            selectedIds: isAllSelected ? [...allIds] : [],
            isAllSelected,
          }
        }, false, '☑️ toggle select all')
      },
      
      clearSelection: () => {
        set({ 
          selectedIds: [], 
          isAllSelected: false 
        }, false, '🗑️ clear selection')
      },
      
      // ===== UTILITY ACTIONS =====
      
      resetFilters: () => {
        set({
          ...DEFAULT_FILTERS,
          // Preservar configuración de paginación
          limit: get().limit,
        }, false, '🔄 reset filters')
      },
      
      resetPagination: () => {
        set({ page: 1 }, false, '🔄 reset pagination')
      },
      
      getApiFilters: (): WarehouseFilters => {
        const state = get()
        const filters: WarehouseFilters = {
          // Usar searchDebounced para API calls
          search: state.searchDebounced || undefined,
          
          // Filtros específicos (convertir 'all' a undefined)
          warehouseType: state.warehouseType !== 'all' ? state.warehouseType : undefined,
          isActive: state.isActive !== 'all' ? state.isActive : undefined,
          city: state.city || undefined,
          state: state.state || undefined,
          country: state.country || undefined,
          
          // Capacidad
          minCapacity: state.minCapacity,
          maxCapacity: state.maxCapacity,
          
          // Ordenamiento
          sortBy: state.sortBy,
          sortDirection: state.sortDirection,
          
          // Paginación
          page: state.page,
          limit: state.limit,
          
          // Include relationships
          include: [
            ...(state.includeLocations ? ['locations'] : []),
            ...(state.includeStock ? ['stock'] : []),
          ].filter(Boolean) as ('locations' | 'stock')[],
        }
        
        // Remover undefined values para cleaner API calls
        return Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => {
            if (value === undefined || value === null) return false
            if (Array.isArray(value) && value.length === 0) return false
            if (typeof value === 'string' && value.trim() === '') return false
            return true
          })
        ) as WarehouseFilters
      },
      
      // ===== FOCUS MANAGEMENT =====
      
      setLastFocusedInput: (inputName: string | null) => {
        set({ lastFocusedInput: inputName }, false, '🎯 focus tracking')
      },
      
      restoreFocus: () => {
        const { lastFocusedInput } = get()
        if (lastFocusedInput) {
          // Restore focus después de un tick para permitir que el DOM se actualice
          setTimeout(() => {
            const element = document.querySelector(`[name="${lastFocusedInput}"], [data-focus-id="${lastFocusedInput}"]`) as HTMLElement
            if (element) {
              element.focus()
            }
          }, 0)
        }
      },
    }),
    {
      name: 'warehouses-ui-store',
      // Solo incluir en devtools en desarrollo
      enabled: process.env.NODE_ENV === 'development',
    }
  )
)

// ===== SELECTOR HOOKS =====

/**
 * Hook para obtener solo filters state
 * Performance: Evita re-renders cuando cambia solo view state
 */
export const useWarehousesFilters = () => useWarehousesUIStore((state) => ({
  search: state.search,
  searchDebounced: state.searchDebounced,
  warehouseType: state.warehouseType,
  isActive: state.isActive,
  city: state.city,
  state: state.state,
  country: state.country,
  minCapacity: state.minCapacity,
  maxCapacity: state.maxCapacity,
  sortBy: state.sortBy,
  sortDirection: state.sortDirection,
  page: state.page,
  limit: state.limit,
  includeLocations: state.includeLocations,
  includeStock: state.includeStock,
  
  // Actions
  setSearch: state.setSearch,
  setWarehouseType: state.setWarehouseType,
  setIsActive: state.setIsActive,
  setCity: state.setCity,
  setState: state.setState,
  setCountry: state.setCountry,
  setMinCapacity: state.setMinCapacity,
  setMaxCapacity: state.setMaxCapacity,
  setSorting: state.setSorting,
  setPage: state.setPage,
  setLimit: state.setLimit,
  setIncludeLocations: state.setIncludeLocations,
  setIncludeStock: state.setIncludeStock,
  resetFilters: state.resetFilters,
  resetPagination: state.resetPagination,
  getApiFilters: state.getApiFilters,
}))

/**
 * Hook para obtener solo view state
 * Performance: Evita re-renders cuando cambian solo los filtros
 */
export const useWarehousesView = () => useWarehousesUIStore((state) => ({
  viewMode: state.viewMode,
  isFiltersVisible: state.isFiltersVisible,
  isCompactMode: state.isCompactMode,
  isSearching: state.isSearching,
  
  // Actions
  setViewMode: state.setViewMode,
  toggleFilters: state.toggleFilters,
  setCompactMode: state.setCompactMode,
}))

/**
 * Hook para obtener solo selection state
 * Performance: Evita re-renders cuando cambian filtros o vistas
 */
export const useWarehousesSelection = () => useWarehousesUIStore((state) => ({
  selectedIds: state.selectedIds,
  isAllSelected: state.isAllSelected,
  
  // Actions
  toggleSelection: state.toggleSelection,
  toggleSelectAll: state.toggleSelectAll,
  clearSelection: state.clearSelection,
  
  // Computed
  hasSelection: state.selectedIds.length > 0,
  selectedCount: state.selectedIds.length,
}))

/**
 * Hook para obtener solo focus management
 */
export const useWarehousesFocus = () => useWarehousesUIStore((state) => ({
  lastFocusedInput: state.lastFocusedInput,
  setLastFocusedInput: state.setLastFocusedInput,
  restoreFocus: state.restoreFocus,
}))

// ===== PERSISTENCE (OPCIONAL) =====

/**
 * Guarda view preferences en localStorage
 * Solo para preferencias de vista, no para filtros (que son sesión)
 */
export function saveWarehouseViewPreferences() {
  const { viewMode, isCompactMode, limit } = useWarehousesUIStore.getState()
  
  try {
    localStorage.setItem('warehouses-view-preferences', JSON.stringify({
      viewMode,
      isCompactMode,
      limit,
    }))
  } catch (error) {
    console.warn('Could not save warehouse view preferences:', error)
  }
}

/**
 * Carga view preferences desde localStorage
 */
export function loadWarehouseViewPreferences() {
  try {
    const saved = localStorage.getItem('warehouses-view-preferences')
    if (saved) {
      const preferences = JSON.parse(saved)
      const { setViewMode, setCompactMode, setLimit } = useWarehousesUIStore.getState()
      
      if (preferences.viewMode) setViewMode(preferences.viewMode)
      if (typeof preferences.isCompactMode === 'boolean') setCompactMode(preferences.isCompactMode)
      if (preferences.limit) setLimit(preferences.limit)
    }
  } catch (error) {
    console.warn('Could not load warehouse view preferences:', error)
  }
}

// ===== EXPORT DEFAULT =====
export default useWarehousesUIStore