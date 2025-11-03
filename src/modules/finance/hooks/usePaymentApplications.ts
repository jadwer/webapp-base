'use client'

/**
 * Payment Applications SWR Hooks
 * Data fetching hooks for payment applications using SWR
 */

import useSWR from 'swr'
import type { PaymentApplication } from '../types'
import { paymentApplicationsService } from '../services'

interface UsePaymentApplicationsOptions {
  filters?: Record<string, any>
  pagination?: { page?: number; size?: number }
  include?: string[]
  sort?: string[]
  enabled?: boolean
}

/**
 * Fetch all payment applications with optional filters and pagination
 */
export const usePaymentApplications = (options: UsePaymentApplicationsOptions = {}) => {
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

  const cacheKey = enabled ? ['/api/v1/payment-applications', queryParams] : null

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    () => paymentApplicationsService.getAll(queryParams),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    applications: data?.data || [],
    meta: data?.meta,
    links: data?.links,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Fetch a single payment application by ID
 */
export const usePaymentApplication = (id: string | null, includes: string[] = []) => {
  const cacheKey = id ? ['/api/v1/payment-applications', id, includes] : null

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    () => paymentApplicationsService.getById(id!, includes),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    application: data?.data,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Fetch payment applications for a specific payment
 */
export const usePaymentApplicationsByPayment = (paymentId: string | null) => {
  const { applications, isLoading, error, mutate } = usePaymentApplications({
    filters: paymentId ? { paymentId } : undefined,
    enabled: !!paymentId,
  })

  return {
    applicationsByPayment: applications,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Fetch payment applications for a specific AR invoice
 */
export const usePaymentApplicationsByARInvoice = (arInvoiceId: string | null) => {
  const { applications, isLoading, error, mutate } = usePaymentApplications({
    filters: arInvoiceId ? { arInvoiceId } : undefined,
    enabled: !!arInvoiceId,
  })

  return {
    applicationsByInvoice: applications,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Fetch payment applications for a specific AP invoice
 */
export const usePaymentApplicationsByAPInvoice = (apInvoiceId: string | null) => {
  const { applications, isLoading, error, mutate } = usePaymentApplications({
    filters: apInvoiceId ? { apInvoiceId } : undefined,
    enabled: !!apInvoiceId,
  })

  return {
    applicationsByInvoice: applications,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Payment Applications mutations hook
 */
export const usePaymentApplicationMutations = () => {
  const createApplication = async (data: any) => {
    return await paymentApplicationsService.create(data)
  }

  const updateApplication = async (id: string, data: any) => {
    return await paymentApplicationsService.update(id, data)
  }

  const deleteApplication = async (id: string) => {
    return await paymentApplicationsService.delete(id)
  }

  return {
    createApplication,
    updateApplication,
    deleteApplication,
  }
}
