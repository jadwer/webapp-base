/**
 * SAT CATALOGS SERVICE TESTS
 * Unit tests for the sat/forma-pago catalog endpoint, used to populate
 * the payment method select in RegisterPaymentModal.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { satCatalogsService } from '../../services'
import axiosClient from '@/lib/axiosClient'

vi.mock('@/lib/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockAxios = axiosClient as any

describe('SAT Catalogs Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getFormaPago', () => {
    it('should fetch the full forma-pago catalog', async () => {
      // Arrange
      const mockResponse = {
        data: [
          { clave: '01', descripcion: 'Efectivo' },
          { clave: '03', descripcion: 'Transferencia electrónica de fondos' },
        ],
      }
      mockAxios.get.mockResolvedValue({ data: mockResponse })

      // Act
      const result = await satCatalogsService.getFormaPago()

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/sat/forma-pago')
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toEqual({ clave: '01', descripcion: 'Efectivo' })
    })
  })
})
