'use client'

import { useState } from 'react'
import { mutate } from 'swr'
import { categoryService } from '../services'
import { CreateCategoryRequest, UpdateCategoryRequest } from '../types'

export function useCategoryMutations() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createCategory = async (data: CreateCategoryRequest) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await categoryService.createCategory(data)
      
      // Invalidate categories list
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'categories',
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

  const updateCategory = async (id: string, data: UpdateCategoryRequest) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await categoryService.updateCategory(id, data)
      
      // Invalidate specific category and categories list
      await mutate(['category', id], response, { revalidate: false })
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'categories',
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

  const deleteCategory = async (id: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await categoryService.deleteCategory(id)
      
      // Invalidate specific category and categories list
      await mutate(['category', id], undefined, { revalidate: false })
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'categories',
        undefined,
        { revalidate: true }
      )
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    isLoading,
    error
  }
}