'use client'

import { useState } from 'react'
import { mutate } from 'swr'
import { productService } from '../services'
import { CreateProductRequest, UpdateProductRequest } from '../types'

export function useProductMutations() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createProduct = async (data: CreateProductRequest) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await productService.createProduct(data)
      
      // Invalidate products list
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'products',
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

  const updateProduct = async (id: string, data: UpdateProductRequest) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await productService.updateProduct(id, data)
      
      // Invalidate specific product and products list
      await mutate(['product', id], response, { revalidate: false })
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'products',
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

  const deleteProduct = async (id: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await productService.deleteProduct(id)
      
      // Invalidate specific product and products list
      await mutate(['product', id], undefined, { revalidate: false })
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'products',
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

  const duplicateProduct = async (id: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await productService.duplicateProduct(id)
      
      // Invalidate products list
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'products',
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

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    isLoading,
    error
  }
}