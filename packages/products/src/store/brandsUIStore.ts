'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type ViewMode = 'table' | 'grid' | 'list' | 'compact' | 'showcase'

export interface BrandFilters {
  search?: string
}

export interface BrandSortOptions {
  field: 'name' | 'slug' | 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}

interface BrandsUIState {
  filters: BrandFilters
  sort: BrandSortOptions
  currentPage: number
  viewMode: ViewMode
  
  setFilters: (filters: BrandFilters) => void
  setSort: (sort: BrandSortOptions) => void
  setPage: (page: number) => void
  setViewMode: (mode: ViewMode) => void
  clearFilters: () => void
}

// Persistido en sessionStorage para que el buscador sobreviva a la
// navegacion cliente (abrir una marca, luego "Volver"): el listado se
// remonta y el termino de busqueda sigue activo. Se limpia al cerrar la
// pestana. Se persiste filters/sort/page/viewMode, no las acciones.
export const useBrandsUIStore = create<BrandsUIState>()(
  persist(
    (set) => ({
      filters: {},
      sort: { field: 'name', direction: 'asc' },
      currentPage: 1,
      viewMode: 'table',

      setFilters: (filters) => {
        set(() => ({ filters, currentPage: 1 }))
      },

      setSort: (sort) => {
        set(() => ({ sort, currentPage: 1 }))
      },

      setPage: (currentPage) => {
        set({ currentPage })
      },

      setViewMode: (viewMode) => {
        set({ viewMode })
      },

      clearFilters: () => {
        set({ filters: {}, currentPage: 1 })
      }
    }),
    {
      name: 'brands-ui',
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

export const useBrandsFilters = () => useBrandsUIStore((state) => state.filters)
export const useBrandsSort = () => useBrandsUIStore((state) => state.sort) 
export const useBrandsPage = () => useBrandsUIStore((state) => state.currentPage)
export const useBrandsViewMode = () => useBrandsUIStore((state) => state.viewMode)