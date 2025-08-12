'use client'

/**
 * 📍 LOCATIONS UI STORE - INVENTORY MODULE
 * Zustand store para UI state independiente de data fetching
 * 
 * Features:
 * - Zero re-renders pattern (estado independiente de SWR)
 * - Performance optimización para locations masivas
 * - Debounce automático en search
 * - Warehouse filtering prominente
 * - View modes persistentes con jerarquía
 * - Focus preservation en filtros
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { 
  WarehouseLocationFilters, 
  LocationType, 
  LocationStatus,
  PickingPriority,
  LOCATION_BUSINESS_RULES 
} from '../types'
import type { ViewMode, SortDirection } from '@/modules/products/types'

// ===== STATE INTERFACES =====

interface LocationsFiltersState {
  // Búsqueda
  search: string
  searchDebounced: string  // Valor con debounce aplicado
  
  // Filtros específicos de location
  warehouseId: string | 'all'    // Filtro principal por warehouse
  locationType: LocationType | 'all'
  status: LocationStatus | 'all'
  pickingPriority: PickingPriority | 'all'
  
  // Filtros operativos
  isActive: boolean | 'all'
  isPickable: boolean | 'all'
  isReceivable: boolean | 'all'
  isCountable: boolean | 'all'
  isRestricted: boolean | 'all'
  
  // Filtros de jerarquía
  aisle: string
  rack: string
  shelf: string
  level: string
  
  // Filtros de capacidad
  hasMaxWeight: boolean | 'all'
  hasMaxVolume: boolean | 'all'
  hasTemperature: boolean | 'all'
  minWeightCapacity: number | undefined
  maxWeightCapacity: number | undefined
  minVolumeCapacity: number | undefined
  maxVolumeCapacity: number | undefined
  
  // Filtros temporales
  hasRecentActivity: boolean | 'all'
  needsInventory: boolean | 'all'
  cycleCountGroup: string
  
  // Ordenamiento
  sortBy: 'name' | 'code' | 'warehouse' | 'type' | 'aisle' | 'status' | 'priority' | 'createdAt'
  sortDirection: SortDirection
  
  // Paginación
  page: number
  limit: number
  
  // Include relationships
  includeStock: boolean
  includeWarehouse: boolean
}

interface LocationsViewState {
  // View modes
  viewMode: ViewMode
  isCompactMode: boolean
  
  // Layout preferences
  showHierarchy: boolean       // Mostrar jerarquía visual
  showWarehouseGroups: boolean // Agrupar por warehouse
  showEmptyLocations: boolean  // Mostrar locations sin stock
  
  // Filters visibility
  isFiltersVisible: boolean
  isWarehouseSelectorVisible: boolean
  
  // Expandable states (para tree view)
  expandedWarehouses: Set<string>
  expandedAisles: Set<string>
  expandedRacks: Set<string>
}

interface LocationsSelectionState {
  selectedIds: string[]
  isAllSelected: boolean
  lastSelectedId: string | null
}

interface LocationsFocusState {
  // Focus tracking para preservar estado de inputs
  focusedField: string | null
  searchInputRef: HTMLInputElement | null
  warehouseSelectorRef: HTMLSelectElement | null
}

// ===== COMBINED STORE STATE =====

interface LocationsUIState {
  filters: LocationsFiltersState
  view: LocationsViewState
  selection: LocationsSelectionState
  focus: LocationsFocusState
  
  // ===== FILTER ACTIONS =====
  setSearch: (search: string) => void
  setWarehouseId: (warehouseId: string | 'all') => void
  setLocationType: (locationType: LocationType | 'all') => void
  setStatus: (status: LocationStatus | 'all') => void
  setPickingPriority: (priority: PickingPriority | 'all') => void
  setIsActive: (isActive: boolean | 'all') => void
  setIsPickable: (isPickable: boolean | 'all') => void
  setIsReceivable: (isReceivable: boolean | 'all') => void
  setAisle: (aisle: string) => void
  setRack: (rack: string) => void
  setShelf: (shelf: string) => void
  setSorting: (sortBy: LocationsFiltersState['sortBy'], direction: SortDirection) => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  resetFilters: () => void
  
  // ===== VIEW ACTIONS =====
  setViewMode: (mode: ViewMode) => void
  toggleCompactMode: () => void
  toggleFilters: () => void
  toggleWarehouseSelector: () => void
  setShowHierarchy: (show: boolean) => void
  setShowWarehouseGroups: (show: boolean) => void
  toggleExpandedWarehouse: (warehouseId: string) => void
  toggleExpandedAisle: (aisleId: string) => void
  toggleExpandedRack: (rackId: string) => void
  
  // ===== SELECTION ACTIONS =====
  toggleSelection: (id: string) => void
  toggleSelectAll: (allIds: string[]) => void
  clearSelection: () => void
  setSelection: (ids: string[]) => void
  
  // ===== FOCUS ACTIONS =====
  setFocus: (field: string | null) => void
  setSearchInputRef: (ref: HTMLInputElement | null) => void
  setWarehouseSelectorRef: (ref: HTMLSelectElement | null) => void
  
  // ===== COMPUTED GETTERS =====
  getApiFilters: () => WarehouseLocationFilters
  hasActiveFilters: () => boolean
  getSelectedCount: () => number
  hasSelection: () => boolean
}

// ===== DEFAULT VALUES =====

const DEFAULT_FILTERS: LocationsFiltersState = {
  search: '',
  searchDebounced: '',
  warehouseId: 'all',
  locationType: 'all',
  status: 'all',
  pickingPriority: 'all',
  isActive: 'all',
  isPickable: 'all',
  isReceivable: 'all',
  isCountable: 'all',
  isRestricted: 'all',
  aisle: '',
  rack: '',
  shelf: '',
  level: '',
  hasMaxWeight: 'all',
  hasMaxVolume: 'all',
  hasTemperature: 'all',
  minWeightCapacity: undefined,
  maxWeightCapacity: undefined,
  minVolumeCapacity: undefined,
  maxVolumeCapacity: undefined,
  hasRecentActivity: 'all',
  needsInventory: 'all',
  cycleCountGroup: '',
  sortBy: 'name',
  sortDirection: 'asc',
  page: 1,
  limit: 50, // Más locations por página por defecto
  includeStock: false,
  includeWarehouse: true, // Siempre incluir warehouse por defecto
}

const DEFAULT_VIEW: LocationsViewState = {
  viewMode: 'table',
  isCompactMode: false,
  showHierarchy: true,
  showWarehouseGroups: true,
  showEmptyLocations: true,
  isFiltersVisible: false,
  isWarehouseSelectorVisible: true,
  expandedWarehouses: new Set(),
  expandedAisles: new Set(),
  expandedRacks: new Set(),
}

const DEFAULT_SELECTION: LocationsSelectionState = {
  selectedIds: [],
  isAllSelected: false,
  lastSelectedId: null,
}

const DEFAULT_FOCUS: LocationsFocusState = {
  focusedField: null,
  searchInputRef: null,
  warehouseSelectorRef: null,
}

// ===== ZUSTAND STORE =====

export const useLocationsUIStore = create<LocationsUIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      filters: DEFAULT_FILTERS,
      view: DEFAULT_VIEW,
      selection: DEFAULT_SELECTION,
      focus: DEFAULT_FOCUS,
      
      // ===== FILTER ACTIONS =====
      
      setSearch: (search: string) => {
        set((state) => ({
          filters: { ...state.filters, search }
        }))
        
        // Debounce logic
        const timeoutId = setTimeout(() => {
          set((state) => ({
            filters: { 
              ...state.filters, 
              searchDebounced: search,
              page: 1 // Reset page on search
            }
          }))
        }, 500) // 500ms debounce para locations (más lento que warehouses)
        
        // Clear previous timeout
        if ((window as any).locationSearchTimeout) {
          clearTimeout((window as any).locationSearchTimeout)
        }
        (window as any).locationSearchTimeout = timeoutId
        
        console.log('🔍 [LocationsUIStore] Search updated:', search)
      },
      
      setWarehouseId: (warehouseId: string | 'all') => {
        set((state) => ({
          filters: { 
            ...state.filters, 
            warehouseId,
            page: 1 // Reset page on warehouse change
          }
        }))
        console.log('🏢 [LocationsUIStore] Warehouse filter:', warehouseId)
      },
      
      setLocationType: (locationType: LocationType | 'all') => {
        set((state) => ({
          filters: { 
            ...state.filters, 
            locationType,
            page: 1 
          }
        }))
        console.log('📍 [LocationsUIStore] Location type filter:', locationType)
      },
      
      setStatus: (status: LocationStatus | 'all') => {
        set((state) => ({
          filters: { 
            ...state.filters, 
            status,
            page: 1 
          }
        }))
        console.log('📊 [LocationsUIStore] Status filter:', status)
      },
      
      setPickingPriority: (pickingPriority: PickingPriority | 'all') => {
        set((state) => ({
          filters: { 
            ...state.filters, 
            pickingPriority,
            page: 1 
          }
        }))
        console.log('⚡ [LocationsUIStore] Priority filter:', pickingPriority)
      },
      
      setIsActive: (isActive: boolean | 'all') => {
        set((state) => ({
          filters: { 
            ...state.filters, 
            isActive,
            page: 1 
          }
        }))
      },
      
      setIsPickable: (isPickable: boolean | 'all') => {
        set((state) => ({
          filters: { 
            ...state.filters, 
            isPickable,
            page: 1 
          }
        }))
      },
      
      setIsReceivable: (isReceivable: boolean | 'all') => {
        set((state) => ({
          filters: { 
            ...state.filters, 
            isReceivable,
            page: 1 
          }
        }))
      },
      
      setAisle: (aisle: string) => {
        set((state) => ({
          filters: { 
            ...state.filters, 
            aisle: aisle.trim(),
            page: 1 
          }
        }))
      },
      
      setRack: (rack: string) => {
        set((state) => ({
          filters: { 
            ...state.filters, 
            rack: rack.trim(),
            page: 1 
          }
        }))
      },
      
      setShelf: (shelf: string) => {
        set((state) => ({
          filters: { 
            ...state.filters, 
            shelf: shelf.trim(),
            page: 1 
          }
        }))
      },
      
      setSorting: (sortBy: LocationsFiltersState['sortBy'], sortDirection: SortDirection) => {
        set((state) => ({
          filters: { ...state.filters, sortBy, sortDirection }
        }))
        console.log('📄 [LocationsUIStore] Sorting:', sortBy, sortDirection)
      },
      
      setPage: (page: number) => {
        set((state) => ({
          filters: { ...state.filters, page }
        }))
        console.log('📄 [LocationsUIStore] Page:', page)
      },
      
      setLimit: (limit: number) => {
        set((state) => ({
          filters: { ...state.filters, limit, page: 1 }
        }))
        console.log('📄 [LocationsUIStore] Limit:', limit)
      },
      
      resetFilters: () => {
        set({ filters: { ...DEFAULT_FILTERS, includeWarehouse: true } })
        console.log('🔄 [LocationsUIStore] Filters reset')
      },
      
      // ===== VIEW ACTIONS =====
      
      setViewMode: (viewMode: ViewMode) => {
        set((state) => ({
          view: { ...state.view, viewMode }
        }))
        console.log('👁️ [LocationsUIStore] View mode:', viewMode)
      },
      
      toggleCompactMode: () => {
        set((state) => ({
          view: { ...state.view, isCompactMode: !state.view.isCompactMode }
        }))
      },
      
      toggleFilters: () => {
        set((state) => ({
          view: { ...state.view, isFiltersVisible: !state.view.isFiltersVisible }
        }))
      },
      
      toggleWarehouseSelector: () => {
        set((state) => ({
          view: { ...state.view, isWarehouseSelectorVisible: !state.view.isWarehouseSelectorVisible }
        }))
      },
      
      setShowHierarchy: (showHierarchy: boolean) => {
        set((state) => ({
          view: { ...state.view, showHierarchy }
        }))
      },
      
      setShowWarehouseGroups: (showWarehouseGroups: boolean) => {
        set((state) => ({
          view: { ...state.view, showWarehouseGroups }
        }))
      },
      
      toggleExpandedWarehouse: (warehouseId: string) => {
        set((state) => {
          const newExpanded = new Set(state.view.expandedWarehouses)
          if (newExpanded.has(warehouseId)) {
            newExpanded.delete(warehouseId)
          } else {
            newExpanded.add(warehouseId)
          }
          return {
            view: { ...state.view, expandedWarehouses: newExpanded }
          }
        })
      },
      
      toggleExpandedAisle: (aisleId: string) => {
        set((state) => {
          const newExpanded = new Set(state.view.expandedAisles)
          if (newExpanded.has(aisleId)) {
            newExpanded.delete(aisleId)
          } else {
            newExpanded.add(aisleId)
          }
          return {
            view: { ...state.view, expandedAisles: newExpanded }
          }
        })
      },
      
      toggleExpandedRack: (rackId: string) => {
        set((state) => {
          const newExpanded = new Set(state.view.expandedRacks)
          if (newExpanded.has(rackId)) {
            newExpanded.delete(rackId)
          } else {
            newExpanded.add(rackId)
          }
          return {
            view: { ...state.view, expandedRacks: newExpanded }
          }
        })
      },
      
      // ===== SELECTION ACTIONS =====
      
      toggleSelection: (id: string) => {
        set((state) => {
          const currentSelected = state.selection.selectedIds
          const isSelected = currentSelected.includes(id)
          
          const newSelected = isSelected
            ? currentSelected.filter(selectedId => selectedId !== id)
            : [...currentSelected, id]
          
          return {
            selection: {
              ...state.selection,
              selectedIds: newSelected,
              lastSelectedId: id,
              isAllSelected: false, // Reset all selected cuando se selecciona individualmente
            }
          }
        })
      },
      
      toggleSelectAll: (allIds: string[]) => {
        const currentState = get()
        const isAllSelected = currentState.selection.isAllSelected
        
        set((state) => ({
          selection: {
            ...state.selection,
            selectedIds: isAllSelected ? [] : allIds,
            isAllSelected: !isAllSelected,
            lastSelectedId: null,
          }
        }))
      },
      
      clearSelection: () => {
        set((state) => ({
          selection: {
            ...state.selection,
            selectedIds: [],
            isAllSelected: false,
            lastSelectedId: null,
          }
        }))
      },
      
      setSelection: (selectedIds: string[]) => {
        set((state) => ({
          selection: {
            ...state.selection,
            selectedIds,
            isAllSelected: false,
            lastSelectedId: selectedIds.length > 0 ? selectedIds[selectedIds.length - 1] : null,
          }
        }))
      },
      
      // ===== FOCUS ACTIONS =====
      
      setFocus: (focusedField: string | null) => {
        set((state) => ({
          focus: { ...state.focus, focusedField }
        }))
      },
      
      setSearchInputRef: (searchInputRef: HTMLInputElement | null) => {
        set((state) => ({
          focus: { ...state.focus, searchInputRef }
        }))
      },
      
      setWarehouseSelectorRef: (warehouseSelectorRef: HTMLSelectElement | null) => {
        set((state) => ({
          focus: { ...state.focus, warehouseSelectorRef }
        }))
      },
      
      // ===== COMPUTED GETTERS =====
      
      getApiFilters: (): WarehouseLocationFilters => {
        const state = get()
        const filters: WarehouseLocationFilters = {}
        
        // Search
        if (state.filters.searchDebounced.trim()) {
          filters.search = state.filters.searchDebounced.trim()
        }
        
        // Warehouse filter (más importante)
        if (state.filters.warehouseId !== 'all') {
          filters.warehouseId = state.filters.warehouseId
        }
        
        // Filtros básicos
        if (state.filters.locationType !== 'all') {
          filters.locationType = state.filters.locationType
        }
        
        if (state.filters.status !== 'all') {
          filters.status = state.filters.status
        }
        
        if (state.filters.pickingPriority !== 'all') {
          filters.pickingPriority = state.filters.pickingPriority
        }
        
        // Filtros operativos
        if (state.filters.isActive !== 'all') {
          filters.isActive = state.filters.isActive
        }
        
        if (state.filters.isPickable !== 'all') {
          filters.isPickable = state.filters.isPickable
        }
        
        if (state.filters.isReceivable !== 'all') {
          filters.isReceivable = state.filters.isReceivable
        }
        
        // Filtros de jerarquía
        if (state.filters.aisle.trim()) {
          filters.aisle = state.filters.aisle.trim()
        }
        
        if (state.filters.rack.trim()) {
          filters.rack = state.filters.rack.trim()
        }
        
        if (state.filters.shelf.trim()) {
          filters.shelf = state.filters.shelf.trim()
        }
        
        if (state.filters.level.trim()) {
          filters.level = state.filters.level.trim()
        }
        
        // Filtros de capacidad
        if (state.filters.hasMaxWeight !== 'all') {
          filters.hasMaxWeight = state.filters.hasMaxWeight
        }
        
        if (state.filters.hasMaxVolume !== 'all') {
          filters.hasMaxVolume = state.filters.hasMaxVolume
        }
        
        if (state.filters.hasTemperature !== 'all') {
          filters.hasTemperature = state.filters.hasTemperature
        }
        
        // Filtros temporales
        if (state.filters.hasRecentActivity !== 'all') {
          filters.hasRecentActivity = state.filters.hasRecentActivity
        }
        
        if (state.filters.needsInventory !== 'all') {
          filters.needsInventory = state.filters.needsInventory
        }
        
        if (state.filters.cycleCountGroup.trim()) {
          filters.cycleCountGroup = state.filters.cycleCountGroup.trim()
        }
        
        // Ordenamiento
        filters.sortBy = state.filters.sortBy
        filters.sortDirection = state.filters.sortDirection
        
        // Paginación
        filters.page = state.filters.page
        filters.limit = state.filters.limit
        
        return filters
      },
      
      hasActiveFilters: (): boolean => {
        const state = get()
        return !!(
          state.filters.searchDebounced.trim() ||
          state.filters.warehouseId !== 'all' ||
          state.filters.locationType !== 'all' ||
          state.filters.status !== 'all' ||
          state.filters.pickingPriority !== 'all' ||
          state.filters.isActive !== 'all' ||
          state.filters.isPickable !== 'all' ||
          state.filters.isReceivable !== 'all' ||
          state.filters.aisle.trim() ||
          state.filters.rack.trim() ||
          state.filters.shelf.trim() ||
          state.filters.level.trim() ||
          state.filters.cycleCountGroup.trim()
        )
      },
      
      getSelectedCount: (): number => {
        return get().selection.selectedIds.length
      },
      
      hasSelection: (): boolean => {
        return get().selection.selectedIds.length > 0
      },
      
    }),
    {
      name: 'locations-ui-store', // Para debugging
    }
  )
)

// ===== SELECTOR HOOKS =====

/**
 * Hook selector para filters state
 * Evita re-renders innecesarios
 */
export const useLocationsFilters = () => 
  useLocationsUIStore((state) => ({
    // Filters data
    search: state.filters.search,
    searchDebounced: state.filters.searchDebounced,
    warehouseId: state.filters.warehouseId,
    locationType: state.filters.locationType,
    status: state.filters.status,
    pickingPriority: state.filters.pickingPriority,
    isActive: state.filters.isActive,
    isPickable: state.filters.isPickable,
    isReceivable: state.filters.isReceivable,
    aisle: state.filters.aisle,
    rack: state.filters.rack,
    shelf: state.filters.shelf,
    level: state.filters.level,
    sortBy: state.filters.sortBy,
    sortDirection: state.filters.sortDirection,
    page: state.filters.page,
    limit: state.filters.limit,
    
    // Filter actions
    setSearch: state.setSearch,
    setWarehouseId: state.setWarehouseId,
    setLocationType: state.setLocationType,
    setStatus: state.setStatus,
    setPickingPriority: state.setPickingPriority,
    setIsActive: state.setIsActive,
    setIsPickable: state.setIsPickable,
    setIsReceivable: state.setIsReceivable,
    setAisle: state.setAisle,
    setRack: state.setRack,
    setShelf: state.setShelf,
    setSorting: state.setSorting,
    setPage: state.setPage,
    setLimit: state.setLimit,
    resetFilters: state.resetFilters,
    
    // Computed getters
    getApiFilters: state.getApiFilters,
    hasActiveFilters: state.hasActiveFilters,
  }))

/**
 * Hook selector para view state
 */
export const useLocationsView = () =>
  useLocationsUIStore((state) => ({
    // View data
    viewMode: state.view.viewMode,
    isCompactMode: state.view.isCompactMode,
    showHierarchy: state.view.showHierarchy,
    showWarehouseGroups: state.view.showWarehouseGroups,
    showEmptyLocations: state.view.showEmptyLocations,
    isFiltersVisible: state.view.isFiltersVisible,
    isWarehouseSelectorVisible: state.view.isWarehouseSelectorVisible,
    expandedWarehouses: state.view.expandedWarehouses,
    expandedAisles: state.view.expandedAisles,
    expandedRacks: state.view.expandedRacks,
    
    // View actions
    setViewMode: state.setViewMode,
    toggleCompactMode: state.toggleCompactMode,
    toggleFilters: state.toggleFilters,
    toggleWarehouseSelector: state.toggleWarehouseSelector,
    setShowHierarchy: state.setShowHierarchy,
    setShowWarehouseGroups: state.setShowWarehouseGroups,
    toggleExpandedWarehouse: state.toggleExpandedWarehouse,
    toggleExpandedAisle: state.toggleExpandedAisle,
    toggleExpandedRack: state.toggleExpandedRack,
  }))

/**
 * Hook selector para selection state
 */
export const useLocationsSelection = () =>
  useLocationsUIStore((state) => ({
    // Selection data
    selectedIds: state.selection.selectedIds,
    isAllSelected: state.selection.isAllSelected,
    lastSelectedId: state.selection.lastSelectedId,
    selectedCount: state.getSelectedCount(),
    hasSelection: state.hasSelection(),
    
    // Selection actions
    toggleSelection: state.toggleSelection,
    toggleSelectAll: state.toggleSelectAll,
    clearSelection: state.clearSelection,
    setSelection: state.setSelection,
  }))

/**
 * Hook selector para focus state
 */
export const useLocationsFocus = () =>
  useLocationsUIStore((state) => ({
    // Focus data
    focusedField: state.focus.focusedField,
    searchInputRef: state.focus.searchInputRef,
    warehouseSelectorRef: state.focus.warehouseSelectorRef,
    
    // Focus actions
    setFocus: state.setFocus,
    setSearchInputRef: state.setSearchInputRef,
    setWarehouseSelectorRef: state.setWarehouseSelectorRef,
  }))

// ===== PERSISTENCE FUNCTIONS =====

/**
 * Guarda preferencias de vista en localStorage
 */
export function saveLocationViewPreferences(): void {
  if (typeof window === 'undefined') return
  
  try {
    const state = useLocationsUIStore.getState()
    const preferences = {
      viewMode: state.view.viewMode,
      isCompactMode: state.view.isCompactMode,
      showHierarchy: state.view.showHierarchy,
      showWarehouseGroups: state.view.showWarehouseGroups,
      limit: state.filters.limit,
      includeStock: state.filters.includeStock,
    }
    
    localStorage.setItem('inventory-locations-view-preferences', JSON.stringify(preferences))
    console.log('💾 [LocationsUIStore] View preferences saved')
  } catch (error) {
    console.warn('⚠️ Failed to save location view preferences:', error)
  }
}

/**
 * Carga preferencias de vista desde localStorage
 */
export function loadLocationViewPreferences(): void {
  if (typeof window === 'undefined') return
  
  try {
    const stored = localStorage.getItem('inventory-locations-view-preferences')
    if (!stored) return
    
    const preferences = JSON.parse(stored)
    const state = useLocationsUIStore.getState()
    
    // Aplicar preferencias guardadas
    useLocationsUIStore.setState({
      view: {
        ...state.view,
        viewMode: preferences.viewMode || 'table',
        isCompactMode: preferences.isCompactMode || false,
        showHierarchy: preferences.showHierarchy ?? true,
        showWarehouseGroups: preferences.showWarehouseGroups ?? true,
      },
      filters: {
        ...state.filters,
        limit: preferences.limit || 50,
        includeStock: preferences.includeStock || false,
      }
    })
    
    console.log('📁 [LocationsUIStore] View preferences loaded')
  } catch (error) {
    console.warn('⚠️ Failed to load location view preferences:', error)
  }
}