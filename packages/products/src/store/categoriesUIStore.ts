'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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

// Persistido en sessionStorage para que el buscador sobreviva a la
// navegacion cliente (abrir una categoria, luego "Volver"): el listado se
// remonta y el termino de busqueda sigue activo. Se limpia al cerrar la
// pestana. Se persiste filters/sort/page/viewMode, no las acciones.
export const useCategoriesUIStore = create<CategoriesUIState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'categories-ui',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        filters: state.filters,
        sort: state.sort,
        currentPage: state.currentPage,
        viewMode: state.viewMode,
      }),
    }
  )
)

// Selector hooks for specific parts (prevents unnecessary re-renders)
export const useCategoriesFilters = () => useCategoriesUIStore((state) => state.filters)
export const useCategoriesSort = () => useCategoriesUIStore((state) => state.sort) 
export const useCategoriesPage = () => useCategoriesUIStore((state) => state.currentPage)
export const useCategoriesViewMode = () => useCategoriesUIStore((state) => state.viewMode)