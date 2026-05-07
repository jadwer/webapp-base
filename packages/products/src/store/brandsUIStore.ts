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
}))

export const useBrandsFilters = () => useBrandsUIStore((state) => state.filters)
export const useBrandsSort = () => useBrandsUIStore((state) => state.sort) 
export const useBrandsPage = () => useBrandsUIStore((state) => state.currentPage)
export const useBrandsViewMode = () => useBrandsUIStore((state) => state.viewMode)