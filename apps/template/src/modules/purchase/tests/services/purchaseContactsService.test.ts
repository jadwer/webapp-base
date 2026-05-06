/**
 * Purchase Contacts Service Tests
 * Tests for fetching contacts (suppliers) for sales orders
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '@/lib/axiosClient'
import { purchaseContactsService } from '../../services'

// Mock axios client
vi.mock('@/lib/axiosClient')

describe('purchaseContactsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all contacts without filters', async () => {
      // Arrange
      const mockContacts = {
        data: [
          {
            id: '1',
            type: 'contacts',
            attributes: {
              name: 'Contact A',
              email: 'contacta@example.com',
              is_supplier: true
            }
          },
          {
            id: '2',
            type: 'contacts',
            attributes: {
              name: 'Contact B',
              email: 'contactb@example.com',
              is_supplier: true
            }
          }
        ]
      }
      vi.mocked(axios.get).mockResolvedValue({ data: mockContacts })

      // Act
      const result = await purchaseContactsService.getAll()

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const callUrl = vi.mocked(axios.get).mock.calls[0][0] as string
      expect(callUrl).toContain('/api/v1/contacts')
      expect(result).toEqual(mockContacts)
    })

    it('should fetch contacts filtered by supplier status', async () => {
      // Arrange
      const mockContacts = {
        data: [
          {
            id: '1',
            type: 'contacts',
            attributes: {
              name: 'Supplier A',
              is_supplier: true
            }
          }
        ]
      }
      vi.mocked(axios.get).mockResolvedValue({ data: mockContacts })

      // Act
      const result = await purchaseContactsService.getAll({ 'filter[isSupplier]': '1' })

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const callUrl = vi.mocked(axios.get).mock.calls[0][0] as string
      const decodedUrl = decodeURIComponent(callUrl)
      expect(decodedUrl).toContain('filter[isSupplier]=1')
      expect(result).toEqual(mockContacts)
    })

    it('should fetch contacts with multiple filters', async () => {
      // Arrange
      const mockContacts = {
        data: [
          {
            id: '1',
            type: 'contacts',
            attributes: {
              name: 'Active Supplier',
              status: 'active',
              is_supplier: true
            }
          }
        ]
      }
      vi.mocked(axios.get).mockResolvedValue({ data: mockContacts })

      // Act
      const result = await purchaseContactsService.getAll({
        'filter[status]': 'active',
        'filter[isSupplier]': '1'
      })

      // Assert
      expect(axios.get).toHaveBeenCalled()
      const callUrl = vi.mocked(axios.get).mock.calls[0][0] as string
      const decodedUrl = decodeURIComponent(callUrl)
      expect(decodedUrl).toContain('filter[status]=active')
      expect(decodedUrl).toContain('filter[isSupplier]=1')
      expect(result).toEqual(mockContacts)
    })

    it('should handle empty contacts response', async () => {
      // Arrange
      vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } })

      // Act
      const result = await purchaseContactsService.getAll()

      // Assert
      expect(result).toEqual({ data: [] })
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const error = new Error('Failed to fetch contacts')
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(purchaseContactsService.getAll()).rejects.toThrow('Failed to fetch contacts')
    })
  })
})
