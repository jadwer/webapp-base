'use client'

import { create } from 'zustand'

export type ViewMode = 'table' | 'grid' | 'list' | 'compact' | 'showcase'

export interface UnitFilters {
  search?: string
}

export interface UnitSortOptions {
  field: 'name' | 'code' | 'unitType' | 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}

interface UnitsUIState {
  // UI State - esto NO causa re-renders de datos
  filters: UnitFilters
  sort: UnitSortOptions
  currentPage: number
  viewMode: ViewMode
  
  // Acciones - solo cambian UI state
  setFilters: (filters: UnitFilters) => void
  setSort: (sort: UnitSortOptions) => void
  setPage: (page: number) => void
  setViewMode: (mode: ViewMode) => void
  clearFilters: () => void
}

export const useUnitsUIStore = create<UnitsUIState>((set) => ({
  // Estado inicial
  filters: {},
  sort: { field: 'name', direction: 'asc' },
  currentPage: 1,
  viewMode: 'table',
  
  // Acciones que NO causan re-renders porque no están en React state
  setFilters: (filters) => {
    set(() => ({
      filters,
      currentPage: 1 // Reset page when filters change
    }))
  },

  setSort: (sort) => {
    set(() => ({
      sort,
      currentPage: 1 // Reset page when sort changes
    }))
  },

  setPage: (currentPage) => {
    set({ currentPage })
  },

  setViewMode: (viewMode) => {
    set({ viewMode })
  },

  clearFilters: () => {
    set({
      filters: {},
      currentPage: 1
    })
  }
}))

// Selector hooks for specific parts (prevents unnecessary re-renders)
export const useUnitsFilters = () => useUnitsUIStore((state) => state.filters)
export const useUnitsSort = () => useUnitsUIStore((state) => state.sort) 
export const useUnitsPage = () => useUnitsUIStore((state) => state.currentPage)
export const useUnitsViewMode = () => useUnitsUIStore((state) => state.viewMode)