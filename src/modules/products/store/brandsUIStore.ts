'use client'

import { create } from 'zustand'

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

export const useBrandsUIStore = create<BrandsUIState>((set) => ({
  filters: {},
  sort: { field: 'name', direction: 'asc' },
  currentPage: 1,
  viewMode: 'table',
  
  setFilters: (filters) => {
    console.log('🔍 Zustand: Setting brand filters (NO RERENDER)', filters)
    set(() => ({ filters, currentPage: 1 }))
  },
  
  setSort: (sort) => {
    console.log('📊 Zustand: Setting brand sort (NO RERENDER)', sort)
    set(() => ({ sort, currentPage: 1 }))
  },
  
  setPage: (currentPage) => {
    console.log('📄 Zustand: Setting brand page (NO RERENDER)', currentPage)
    set({ currentPage })
  },
  
  setViewMode: (viewMode) => {
    console.log('👁️ Zustand: Setting brand view mode', viewMode)
    set({ viewMode })
  },
  
  clearFilters: () => {
    console.log('🧹 Zustand: Clearing brand filters (NO RERENDER)')
    set({ filters: {}, currentPage: 1 })
  }
}))

export const useBrandsFilters = () => useBrandsUIStore((state) => state.filters)
export const useBrandsSort = () => useBrandsUIStore((state) => state.sort) 
export const useBrandsPage = () => useBrandsUIStore((state) => state.currentPage)
export const useBrandsViewMode = () => useBrandsUIStore((state) => state.viewMode)