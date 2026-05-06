/**
 * Billing Module - SWR Hooks
 *
 * Provides data fetching and mutations for CFDI entities
 * Includes workflow hooks for stamp, cancel, generate XML/PDF
 */

'use client'

import useSWR from 'swr'
import { useCallback } from 'react'
import type {
  CFDIInvoice,
  CFDIInvoiceFormData,
  CFDIInvoicesFilters,
  CFDIItem,
  CFDIItemFormData,
  CFDIItemsFilters,
  CompanySetting,
  CompanySettingFormData,
  CFDICancelRequest,
  CreateCFDIInvoiceData,
} from '../types'
import {
  cfdiInvoicesService,
  cfdiItemsService,
  companySettingsService,
} from '../services'

// ============================================================================
// CFDI INVOICES HOOKS
// ============================================================================

/**
 * Hook to fetch all CFDI invoices with filters
 */
export function useCFDIInvoices(filters?: CFDIInvoicesFilters) {
  const key = filters ? ['cfdi-invoices', filters] : 'cfdi-invoices'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => cfdiInvoicesService.getAll(filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    invoices: data?.data || [],
    meta: data?.meta,
    links: data?.links,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to fetch single CFDI invoice by ID
 */
export function useCFDIInvoice(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `cfdi-invoice-${id}` : null,
    () => (id ? cfdiInvoicesService.getById(id) : null),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    invoice: data || null,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook for CFDI invoices mutations (CRUD + workflow)
 */
export function useCFDIInvoicesMutations() {
  const createInvoice = useCallback(
    async (data: CFDIInvoiceFormData): Promise<CFDIInvoice> => {
      return await cfdiInvoicesService.create(data)
    },
    []
  )

  const createInvoiceWithItems = useCallback(
    async (data: CreateCFDIInvoiceData): Promise<CFDIInvoice> => {
      return await cfdiInvoicesService.createWithItems(data)
    },
    []
  )

  const updateInvoice = useCallback(
    async (id: string, data: CFDIInvoiceFormData): Promise<CFDIInvoice> => {
      return await cfdiInvoicesService.update(id, data)
    },
    []
  )

  const deleteInvoice = useCallback(async (id: string): Promise<void> => {
    await cfdiInvoicesService.delete(id)
  }, [])

  // Workflow actions
  const generateXML = useCallback(async (id: string) => {
    return await cfdiInvoicesService.generateXML(id)
  }, [])

  const generatePDF = useCallback(async (id: string) => {
    return await cfdiInvoicesService.generatePDF(id)
  }, [])

  const stampInvoice = useCallback(async (id: string) => {
    return await cfdiInvoicesService.stamp(id)
  }, [])

  const cancelInvoice = useCallback(
    async (id: string, cancelRequest: CFDICancelRequest) => {
      return await cfdiInvoicesService.cancel(id, cancelRequest)
    },
    []
  )

  const downloadXML = useCallback(async (id: string) => {
    return await cfdiInvoicesService.downloadXML(id)
  }, [])

  const downloadPDF = useCallback(async (id: string) => {
    return await cfdiInvoicesService.downloadPDF(id)
  }, [])

  const sendEmail = useCallback(async (id: string, email: string) => {
    await cfdiInvoicesService.sendEmail(id, email)
  }, [])

  return {
    createInvoice,
    createInvoiceWithItems,
    updateInvoice,
    deleteInvoice,
    generateXML,
    generatePDF,
    stampInvoice,
    cancelInvoice,
    downloadXML,
    downloadPDF,
    sendEmail,
  }
}

// ============================================================================
// CFDI ITEMS HOOKS
// ============================================================================

/**
 * Hook to fetch all CFDI items (usually filtered by cfdiInvoiceId)
 */
export function useCFDIItems(filters?: CFDIItemsFilters) {
  const key = filters ? ['cfdi-items', filters] : 'cfdi-items'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => cfdiItemsService.getAll(filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    items: data?.data || [],
    meta: data?.meta,
    links: data?.links,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to fetch single CFDI item by ID
 */
export function useCFDIItem(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `cfdi-item-${id}` : null,
    () => (id ? cfdiItemsService.getById(id) : null),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    item: data || null,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook for CFDI items mutations
 */
export function useCFDIItemsMutations() {
  const createItem = useCallback(
    async (data: CFDIItemFormData): Promise<CFDIItem> => {
      return await cfdiItemsService.create(data)
    },
    []
  )

  const updateItem = useCallback(
    async (id: string, data: CFDIItemFormData): Promise<CFDIItem> => {
      return await cfdiItemsService.update(id, data)
    },
    []
  )

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    await cfdiItemsService.delete(id)
  }, [])

  return {
    createItem,
    updateItem,
    deleteItem,
  }
}

// ============================================================================
// COMPANY SETTINGS HOOKS
// ============================================================================

/**
 * Hook to fetch all company settings
 */
export function useCompanySettings() {
  const { data, error, isLoading, mutate } = useSWR(
    'company-settings',
    () => companySettingsService.getAll(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    settings: data?.data || [],
    meta: data?.meta,
    links: data?.links,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to fetch single company setting by ID
 */
export function useCompanySetting(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `company-setting-${id}` : null,
    () => (id ? companySettingsService.getById(id) : null),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    setting: data || null,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to fetch active company setting
 */
export function useActiveCompanySetting() {
  const { data, error, isLoading, mutate } = useSWR(
    'company-setting-active',
    () => companySettingsService.getActive(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    activeSetting: data || null,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook for company settings mutations
 */
export function useCompanySettingsMutations() {
  const createSetting = useCallback(
    async (data: CompanySettingFormData): Promise<CompanySetting> => {
      return await companySettingsService.create(data)
    },
    []
  )

  const updateSetting = useCallback(
    async (id: string, data: CompanySettingFormData): Promise<CompanySetting> => {
      return await companySettingsService.update(id, data)
    },
    []
  )

  const deleteSetting = useCallback(async (id: string): Promise<void> => {
    await companySettingsService.delete(id)
  }, [])

  const testPACConnection = useCallback(
    async (id: string): Promise<{ success: boolean; message: string }> => {
      return await companySettingsService.testPACConnection(id)
    },
    []
  )

  const uploadCertificate = useCallback(async (id: string, file: File) => {
    return await companySettingsService.uploadCertificate(id, file)
  }, [])

  const uploadKey = useCallback(async (id: string, file: File, password: string) => {
    return await companySettingsService.uploadKey(id, file, password)
  }, [])

  return {
    createSetting,
    updateSetting,
    deleteSetting,
    testPACConnection,
    uploadCertificate,
    uploadKey,
  }
}

// ============================================================================
// SPECIALIZED WORKFLOW HOOKS
// ============================================================================

/**
 * Hook for CFDI complete workflow
 * Combines generate XML, PDF, and stamp in one convenient hook
 */
export function useCFDIWorkflow() {
  const { generateXML, generatePDF, stampInvoice, cancelInvoice } =
    useCFDIInvoicesMutations()

  const processInvoice = useCallback(
    async (id: string) => {
      // Step 1: Generate XML
      const xmlResult = await generateXML(id)
      if (xmlResult.status === 'error') {
        throw new Error('Failed to generate XML')
      }

      // Step 2: Generate PDF
      const pdfResult = await generatePDF(id)
      if (pdfResult.status === 'error') {
        throw new Error('Failed to generate PDF')
      }

      // Step 3: Stamp with PAC
      const stampResult = await stampInvoice(id)
      if (stampResult.status === 'error') {
        throw new Error('Failed to stamp invoice')
      }

      return stampResult
    },
    [generateXML, generatePDF, stampInvoice]
  )

  return {
    processInvoice,
    generateXML,
    generatePDF,
    stampInvoice,
    cancelInvoice,
  }
}
