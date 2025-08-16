'use client'

import { useState } from 'react'
import { mutate } from 'swr'
import { brandService } from '../services'
import { CreateBrandRequest, UpdateBrandRequest } from '../types'
// Removed unused imports

export function useBrandMutations() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createBrand = async (data: CreateBrandRequest) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await brandService.createBrand(data)
      
      // Invalidate brands list
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'brands',
        undefined,
        { revalidate: true }
      )
      
      return response
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateBrand = async (id: string, data: UpdateBrandRequest) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await brandService.updateBrand(id, data)
      
      // Invalidate specific brand and brands list
      await mutate(['brand', id], response, { revalidate: false })
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'brands',
        undefined,
        { revalidate: true }
      )
      
      return response
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deleteBrand = async (id: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await brandService.deleteBrand(id)
      
      // Invalidate specific brand and brands list
      await mutate(['brand', id], undefined, { revalidate: false })
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'brands',
        undefined,
        { revalidate: true }
      )
    } catch (err) {
      // Keep the original error for proper error handling
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createBrand,
    updateBrand,
    deleteBrand,
    isLoading,
    error
  }
}