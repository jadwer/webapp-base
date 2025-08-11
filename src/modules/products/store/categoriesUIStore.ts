'use client'

import { create } from 'zustand'

export type ViewMode = 'table' | 'grid' | 'list' | 'compact' | 'showcase'

export interface CategoryFilters {
  search?: string
}

export interface CategorySortOptions {
  field: 'name' | 'slug' | 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}

interface CategoriesUIState {
  // UI State - esto NO causa re-renders de datos
  filters: CategoryFilters
  sort: CategorySortOptions
  currentPage: number
  viewMode: ViewMode
  
  // Acciones - solo cambian UI state
  setFilters: (filters: CategoryFilters) => void
  setSort: (sort: CategorySortOptions) => void
  setPage: (page: number) => void
  setViewMode: (mode: ViewMode) => void
  clearFilters: () => void
}

export const useCategoriesUIStore = create<CategoriesUIState>((set) => ({
  // Estado inicial
  filters: {},
  sort: { field: 'name', direction: 'asc' },
  currentPage: 1,
  viewMode: 'table',
  
  // Acciones que NO causan re-renders porque no están en React state
  setFilters: (filters) => {
    console.log('🔍 Zustand: Setting category filters (NO RERENDER)', filters)
    set(() => ({ 
      filters,
      currentPage: 1 // Reset page when filters change
    }))
  },
  
  setSort: (sort) => {
    console.log('📊 Zustand: Setting category sort (NO RERENDER)', sort)
    set(() => ({ 
      sort,
      currentPage: 1 // Reset page when sort changes  
    }))
  },
  
  setPage: (currentPage) => {
    console.log('📄 Zustand: Setting category page (NO RERENDER)', currentPage)
    set({ currentPage })
  },
  
  setViewMode: (viewMode) => {
    console.log('👁️ Zustand: Setting category view mode', viewMode)
    set({ viewMode })
  },
  
  clearFilters: () => {
    console.log('🧹 Zustand: Clearing category filters (NO RERENDER)')
    set({ 
      filters: {},
      currentPage: 1
    })
  }
}))

// Selector hooks for specific parts (prevents unnecessary re-renders)
export const useCategoriesFilters = () => useCategoriesUIStore((state) => state.filters)
export const useCategoriesSort = () => useCategoriesUIStore((state) => state.sort) 
export const useCategoriesPage = () => useCategoriesUIStore((state) => state.currentPage)
export const useCategoriesViewMode = () => useCategoriesUIStore((state) => state.viewMode)