/**
 * usePaymentApplications Hooks Tests
 * Tests for Payment Applications SWR hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  usePaymentApplications,
  usePaymentApplication,
  usePaymentApplicationsByPayment,
  usePaymentApplicationsByARInvoice,
  usePaymentApplicationsByAPInvoice,
  usePaymentApplicationMutations,
} from '../../hooks/usePaymentApplications'
import { paymentApplicationsService } from '../../services'
import { createMockPaymentApplication } from '../utils/test-utils'

// Mock the payment applications service
vi.mock('../../services', () => ({
  paymentApplicationsService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn((key, fetcher) => {
    if (key === null) {
      return {
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
      }
    }

    if (fetcher) {
      const data = fetcher()
      return Promise.resolve(data).then(result => ({
        data: result,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
      }))
    }

    return {
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    }
  }),
}))

describe('usePaymentApplications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('usePaymentApplications', () => {
    it('should fetch and return payment applications', async () => {
      // Arrange
      const applications = [
        createMockPaymentApplication({ id: '1' }),
        createMockPaymentApplication({ id: '2', paymentId: '2' }),
      ]
      const apiResponse = { data: applications, meta: {}, links: {} }
      vi.mocked(paymentApplicationsService.getAll).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() => usePaymentApplications())

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      expect(result.current.applications).toHaveLength(2)
      expect(paymentApplicationsService.getAll).toHaveBeenCalled()
    })

    it('should fetch payment applications with filters', async () => {
      // Arrange
      const applications = [createMockPaymentApplication({ paymentId: '5' })]
      const apiResponse = { data: applications, meta: {}, links: {} }
      vi.mocked(paymentApplicationsService.getAll).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() =>
        usePaymentApplications({ filters: { paymentId: '5' } })
      )

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      expect(result.current.applications).toHaveLength(1)
      expect(result.current.applications[0].paymentId).toBe('5')
    })

    it('should fetch payment applications with pagination', async () => {
      // Arrange
      const applications = [createMockPaymentApplication()]
      const apiResponse = {
        data: applications,
        meta: { page: { currentPage: 2, perPage: 10 } },
        links: {},
      }
      vi.mocked(paymentApplicationsService.getAll).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() =>
        usePaymentApplications({ pagination: { page: 2, size: 10 } })
      )

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      expect(result.current.meta?.page?.currentPage).toBe(2)
    })

    it('should respect enabled flag', async () => {
      // Arrange
      const applications = [createMockPaymentApplication()]
      const apiResponse = { data: applications, meta: {}, links: {} }
      vi.mocked(paymentApplicationsService.getAll).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() =>
        usePaymentApplications({ enabled: false })
      )

      // Assert
      expect(paymentApplicationsService.getAll).not.toHaveBeenCalled()
      expect(result.current.isLoading).toBe(false)
    })

    it('should return empty array when no data', async () => {
      // Arrange
      const apiResponse = { data: [], meta: {}, links: {} }
      vi.mocked(paymentApplicationsService.getAll).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() => usePaymentApplications())

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      expect(result.current.applications).toEqual([])
    })
  })

  describe('usePaymentApplication', () => {
    it('should fetch and return single payment application', async () => {
      // Arrange
      const application = createMockPaymentApplication()
      const apiResponse = { data: application }
      vi.mocked(paymentApplicationsService.getById).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() => usePaymentApplication('1'))

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      expect(result.current.application).toEqual(application)
      expect(paymentApplicationsService.getById).toHaveBeenCalledWith('1', [])
    })

    it('should fetch payment application with includes', async () => {
      // Arrange
      const application = createMockPaymentApplication()
      const apiResponse = { data: application }
      vi.mocked(paymentApplicationsService.getById).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() =>
        usePaymentApplication('1', ['arInvoice', 'payment'])
      )

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      expect(paymentApplicationsService.getById).toHaveBeenCalledWith('1', [
        'arInvoice',
        'payment',
      ])
    })

    it('should not fetch when id is null', async () => {
      // Act
      const { result } = renderHook(() => usePaymentApplication(null))

      // Assert
      expect(paymentApplicationsService.getById).not.toHaveBeenCalled()
      expect(result.current.application).toBeUndefined()
    })
  })

  describe('usePaymentApplicationsByPayment', () => {
    it('should fetch applications filtered by payment', async () => {
      // Arrange
      const applications = [createMockPaymentApplication({ paymentId: '5' })]
      const apiResponse = { data: applications, meta: {}, links: {} }
      vi.mocked(paymentApplicationsService.getAll).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() => usePaymentApplicationsByPayment('5'))

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      expect(result.current.applicationsByPayment).toHaveLength(1)
      expect(result.current.applicationsByPayment[0].paymentId).toBe('5')
    })

    it('should not fetch when paymentId is null', async () => {
      // Act
      const { result } = renderHook(() => usePaymentApplicationsByPayment(null))

      // Assert
      expect(paymentApplicationsService.getAll).not.toHaveBeenCalled()
    })
  })

  describe('usePaymentApplicationsByARInvoice', () => {
    it('should fetch applications filtered by AR invoice', async () => {
      // Arrange
      const applications = [
        createMockPaymentApplication({ arInvoiceId: '10', apInvoiceId: null }),
      ]
      const apiResponse = { data: applications, meta: {}, links: {} }
      vi.mocked(paymentApplicationsService.getAll).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() => usePaymentApplicationsByARInvoice('10'))

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      expect(result.current.applicationsByInvoice).toHaveLength(1)
      expect(result.current.applicationsByInvoice[0].arInvoiceId).toBe('10')
    })

    it('should not fetch when arInvoiceId is null', async () => {
      // Act
      const { result } = renderHook(() => usePaymentApplicationsByARInvoice(null))

      // Assert
      expect(paymentApplicationsService.getAll).not.toHaveBeenCalled()
    })
  })

  describe('usePaymentApplicationsByAPInvoice', () => {
    it('should fetch applications filtered by AP invoice', async () => {
      // Arrange
      const applications = [
        createMockPaymentApplication({ arInvoiceId: null, apInvoiceId: '15' }),
      ]
      const apiResponse = { data: applications, meta: {}, links: {} }
      vi.mocked(paymentApplicationsService.getAll).mockResolvedValue(apiResponse)

      // Act
      const { result } = renderHook(() => usePaymentApplicationsByAPInvoice('15'))

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      expect(result.current.applicationsByInvoice).toHaveLength(1)
      expect(result.current.applicationsByInvoice[0].apInvoiceId).toBe('15')
    })

    it('should not fetch when apInvoiceId is null', async () => {
      // Act
      const { result } = renderHook(() => usePaymentApplicationsByAPInvoice(null))

      // Assert
      expect(paymentApplicationsService.getAll).not.toHaveBeenCalled()
    })
  })

  describe('usePaymentApplicationMutations', () => {
    it('should create payment application', async () => {
      // Arrange
      const formData = {
        paymentId: '1',
        arInvoiceId: '1',
        apInvoiceId: null,
        amount: '500.00',
        applicationDate: '2025-08-20',
      }
      const createdApplication = createMockPaymentApplication(formData)
      vi.mocked(paymentApplicationsService.create).mockResolvedValue({
        data: createdApplication,
      })

      // Act
      const { result } = renderHook(() => usePaymentApplicationMutations())
      const created = await result.current.createApplication(formData)

      // Assert
      expect(paymentApplicationsService.create).toHaveBeenCalledWith(formData)
      expect(created.data.id).toBe('1')
    })

    it('should update payment application', async () => {
      // Arrange
      const updateData = { amount: '750.00' }
      const updatedApplication = createMockPaymentApplication({ amount: '750.00' })
      vi.mocked(paymentApplicationsService.update).mockResolvedValue({
        data: updatedApplication,
      })

      // Act
      const { result } = renderHook(() => usePaymentApplicationMutations())
      const updated = await result.current.updateApplication('1', updateData)

      // Assert
      expect(paymentApplicationsService.update).toHaveBeenCalledWith('1', updateData)
      expect(updated.data.amount).toBe('750.00')
    })

    it('should delete payment application', async () => {
      // Arrange
      vi.mocked(paymentApplicationsService.delete).mockResolvedValue(undefined)

      // Act
      const { result } = renderHook(() => usePaymentApplicationMutations())
      await result.current.deleteApplication('1')

      // Assert
      expect(paymentApplicationsService.delete).toHaveBeenCalledWith('1')
    })

    it('should handle errors on create', async () => {
      // Arrange
      const formData = {
        paymentId: '1',
        arInvoiceId: '1',
        apInvoiceId: null,
        amount: '500.00',
        applicationDate: '2025-08-20',
      }
      vi.mocked(paymentApplicationsService.create).mockRejectedValue(
        new Error('Validation failed')
      )

      // Act & Assert
      const { result } = renderHook(() => usePaymentApplicationMutations())
      await expect(result.current.createApplication(formData)).rejects.toThrow(
        'Validation failed'
      )
    })
  })
})
