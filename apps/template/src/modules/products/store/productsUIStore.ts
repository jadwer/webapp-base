'use client'

import { create } from 'zustand'
import type { ViewMode, ProductFilters, ProductSortOptions } from '../types'

interface ProductsUIState {
  // UI State - esto NO causa re-renders de datos
  filters: ProductFilters
  sort: ProductSortOptions
  currentPage: number
  viewMode: ViewMode
  
  // Acciones - solo cambian UI state
  setFilters: (filters: ProductFilters) => void
  setSort: (sort: ProductSortOptions) => void
  setPage: (page: number) => void
  setViewMode: (mode: ViewMode) => void
  clearFilters: () => void
}

export const useProductsUIStore = create<ProductsUIState>((set) => ({
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

// Selector hook for specific parts (prevents unnecessary re-renders)
export const useProductsFilters = () => useProductsUIStore((state) => state.filters)
export const useProductsSort = () => useProductsUIStore((state) => state.sort) 
export const useProductsPage = () => useProductsUIStore((state) => state.currentPage)
export const useProductsViewMode = () => useProductsUIStore((state) => state.viewMode)