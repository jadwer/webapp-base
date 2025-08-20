// useAPInvoices Hook Tests
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAPInvoices, useAPInvoiceMutations } from '../../hooks'
import { createMockAPInvoice, createMockAPIResponse, setupCommonMocks } from '../utils/test-utils'

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn(),
}))

vi.mock('swr/dist/config', () => ({
  useSWRConfig: () => ({
    mutate: vi.fn(),
  }),
}))

// Mock the services
vi.mock('../../services', () => ({
  apInvoicesService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    post: vi.fn(),
  },
}))

import useSWR from 'swr'
import { apInvoicesService } from '../../services'

describe('useAPInvoices', () => {
  beforeEach(() => {
    setupCommonMocks()
    vi.clearAllMocks()
  })

  it('should return AP invoices data when successful', async () => {
    // Arrange
    const mockInvoices = [
      createMockAPInvoice({ id: '1', invoiceNumber: 'FACT-001' }),
      createMockAPInvoice({ id: '2', invoiceNumber: 'FACT-002' }),
    ]
    const mockResponse = createMockAPIResponse(mockInvoices)

    ;(useSWR as any).mockReturnValue({
      data: mockResponse,
      error: null,
      isLoading: false,
      mutate: vi.fn(),
    })

    // Act
    const { result } = renderHook(() => useAPInvoices())

    // Assert
    expect(result.current.apInvoices).toEqual(mockInvoices)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should handle loading state', () => {
    // Arrange
    ;(useSWR as any).mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      mutate: vi.fn(),
    })

    // Act
    const { result } = renderHook(() => useAPInvoices())

    // Assert
    expect(result.current.apInvoices).toEqual([])
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('should handle error state', () => {
    // Arrange
    const mockError = new Error('API Error')
    ;(useSWR as any).mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      mutate: vi.fn(),
    })

    // Act
    const { result } = renderHook(() => useAPInvoices())

    // Assert
    expect(result.current.apInvoices).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(mockError)
  })

  it('should pass parameters to SWR correctly', () => {
    // Arrange
    const params = { search: 'FACT-001', status: 'draft' }
    ;(useSWR as any).mockReturnValue({
      data: createMockAPIResponse([]),
      error: null,
      isLoading: false,
      mutate: vi.fn(),
    })

    // Act
    renderHook(() => useAPInvoices(params))

    // Assert
    expect(useSWR).toHaveBeenCalledWith(
      ['/api/v1/a-p-invoices', params],
      expect.any(Function)
    )
  })
})

describe('useAPInvoiceMutations', () => {
  beforeEach(() => {
    setupCommonMocks()
    vi.clearAllMocks()
  })

  it('should create AP invoice successfully', async () => {
    // Arrange
    const mockInvoiceData = {
      contactId: 1,
      invoiceNumber: 'FACT-003',
      invoiceDate: '2025-08-20',
      dueDate: '2025-09-20',
      currency: 'MXN',
      subtotal: 1000,
      taxTotal: 160,
      total: 1160,
    }
    const mockCreatedInvoice = createMockAPInvoice(mockInvoiceData)
    const mockResponse = { data: mockCreatedInvoice }

    ;(apInvoicesService.create as any).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAPInvoiceMutations())

    // Act
    const createdInvoice = await result.current.createAPInvoice(mockInvoiceData)

    // Assert
    expect(apInvoicesService.create).toHaveBeenCalledWith(mockInvoiceData)
    expect(createdInvoice).toEqual(mockResponse)
  })

  it('should update AP invoice successfully', async () => {
    // Arrange
    const updateData = { invoiceNumber: 'FACT-001-UPDATED' }
    const mockUpdatedInvoice = createMockAPInvoice({ id: '1', ...updateData })
    const mockResponse = { data: mockUpdatedInvoice }

    ;(apInvoicesService.update as any).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAPInvoiceMutations())

    // Act
    const updatedInvoice = await result.current.updateAPInvoice('1', updateData)

    // Assert
    expect(apInvoicesService.update).toHaveBeenCalledWith('1', updateData)
    expect(updatedInvoice).toEqual(mockResponse)
  })

  it('should delete AP invoice successfully', async () => {
    // Arrange
    ;(apInvoicesService.delete as any).mockResolvedValue(undefined)

    const { result } = renderHook(() => useAPInvoiceMutations())

    // Act
    await result.current.deleteAPInvoice('1')

    // Assert
    expect(apInvoicesService.delete).toHaveBeenCalledWith('1')
  })

  it('should post AP invoice successfully', async () => {
    // Arrange
    const mockPostedInvoice = createMockAPInvoice({ id: '1', status: 'posted' })
    const mockResponse = { data: mockPostedInvoice }

    ;(apInvoicesService.post as any).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAPInvoiceMutations())

    // Act
    const postedInvoice = await result.current.postAPInvoice('1')

    // Assert
    expect(apInvoicesService.post).toHaveBeenCalledWith('1')
    expect(postedInvoice).toEqual(mockResponse)
    expect(postedInvoice.data.status).toBe('posted')
  })

  it('should handle mutation errors properly', async () => {
    // Arrange
    const mockError = new Error('Mutation failed')
    ;(apInvoicesService.create as any).mockRejectedValue(mockError)

    const { result } = renderHook(() => useAPInvoiceMutations())

    // Act & Assert
    await expect(result.current.createAPInvoice({
      contactId: 1,
      invoiceNumber: 'FACT-003',
      invoiceDate: '2025-08-20',
      dueDate: '2025-09-20',
      currency: 'MXN',
      subtotal: 1000,
      taxTotal: 160,
      total: 1160,
    })).rejects.toThrow('Mutation failed')
  })
})