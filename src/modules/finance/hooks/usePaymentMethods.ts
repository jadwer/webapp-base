'use client'

/**
 * Payment Methods SWR Hooks
 * Data fetching hooks for payment methods using SWR
 */

import useSWR from 'swr'
import type { PaymentMethod } from '../types'
import { paymentMethodsService } from '../services'

interface UsePaymentMethodsOptions {
  filters?: Record<string, any>
  pagination?: { page?: number; size?: number }
  include?: string[]
  sort?: string[]
  enabled?: boolean
}

/**
 * Fetch all payment methods with optional filters and pagination
 */
export const usePaymentMethods = (options: UsePaymentMethodsOptions = {}) => {
  const { filters, pagination, include, sort, enabled = true } = options

  const queryParams: Record<string, any> = {}

  if (filters) {
    Object.keys(filters).forEach(key => {
      queryParams[`filter[${key}]`] = filters[key]
    })
  }

  if (pagination) {
    if (pagination.page) queryParams['page[number]'] = pagination.page
    if (pagination.size) queryParams['page[size]'] = pagination.size
  }

  if (include) {
    queryParams.include = include.join(',')
  }

  if (sort) {
    queryParams.sort = sort.join(',')
  }

  const cacheKey = enabled ? ['/api/v1/payment-methods', queryParams] : null

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    () => paymentMethodsService.getAll(queryParams),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    paymentMethods: data?.data || [],
    meta: data?.meta,
    links: data?.links,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Fetch a single payment method by ID
 */
export const usePaymentMethod = (id: string | null) => {
  const cacheKey = id ? ['/api/v1/payment-methods', id] : null

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    () => paymentMethodsService.getById(id!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    paymentMethod: data?.data,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Fetch only active payment methods
 */
export const useActivePaymentMethods = () => {
  const { paymentMethods, isLoading, error, mutate } = usePaymentMethods({
    filters: { isActive: true },
    sort: ['name'],
  })

  return {
    activePaymentMethods: paymentMethods,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Fetch payment methods that require reference
 */
export const usePaymentMethodsRequiringReference = () => {
  const { paymentMethods, isLoading, error, mutate } = usePaymentMethods({
    filters: { isActive: true, requiresReference: true },
  })

  return {
    paymentMethodsWithReference: paymentMethods,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Payment Methods mutations hook
 */
export const usePaymentMethodMutations = () => {
  const createPaymentMethod = async (data: any) => {
    return await paymentMethodsService.create(data)
  }

  const updatePaymentMethod = async (id: string, data: any) => {
    return await paymentMethodsService.update(id, data)
  }

  const deletePaymentMethod = async (id: string) => {
    return await paymentMethodsService.delete(id)
  }

  return {
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  }
}
