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
      
      // Invalidate the specific product detail (useProduct keys with
      // ['product', id, include?]; match by predicate so the include slot
      // is irrelevant) and the products list.
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'product' && key[1] === id,
        undefined,
        { revalidate: true }
      )
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

      // Invalidate the specific product detail and the products list
      // (predicate match so the include slot of the SWR key is ignored).
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'product' && key[1] === id,
        undefined,
        { revalidate: false }
      )
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