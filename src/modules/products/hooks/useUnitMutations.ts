'use client'

import { useState } from 'react'
import { mutate } from 'swr'
import { unitService } from '../services'
import { CreateUnitRequest, UpdateUnitRequest } from '../types'

export function useUnitMutations() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createUnit = async (data: CreateUnitRequest) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await unitService.createUnit(data)
      
      // Invalidate units list
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'units',
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

  const updateUnit = async (id: string, data: UpdateUnitRequest) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await unitService.updateUnit(id, data)
      
      // Invalidate specific unit and units list
      await mutate(['unit', id], response, { revalidate: false })
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'units',
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

  const deleteUnit = async (id: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await unitService.deleteUnit(id)
      
      // Invalidate specific unit and units list
      await mutate(['unit', id], undefined, { revalidate: false })
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'units',
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
    createUnit,
    updateUnit,
    deleteUnit,
    isLoading,
    error
  }
}