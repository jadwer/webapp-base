/**
 * Billing Module - Payment Complement (REP) Services Tests
 *
 * Covers the Complemento de Pagos 2.0 (REP) frontend service surface:
 * - getPaymentComplements: lists tipo P CFDIs for a PPD invoice (filter[tipoComprobante]=P)
 * - emitPaymentComplement: calls the manual endpoint, snake_case -> camelCase mapping
 * - 422 handling (PUE invoice), 403 handling, idempotent 200 vs fresh 201
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axiosClient from '../../lib/axiosClient'
import { cfdiInvoicesService } from '../../services'
import { createMockAxiosError } from '../utils/test-utils'

// Mock axios client
vi.mock('../../lib/axiosClient')

// Mock transformers used by getAll (getPaymentComplements delegates to getAll)
vi.mock('../../utils/transformers', () => ({
  transformCFDIInvoicesResponse: vi.fn((data) => data),
  transformJsonApiCFDIInvoice: vi.fn((data) => data),
  transformCFDIInvoiceFormToJsonApi: vi.fn((data) => ({ type: 'cfdi_invoices', attributes: data })),
  transformCFDIItemFormToJsonApi: vi.fn((data) => ({ type: 'cfdi_items', attributes: data })),
}))

describe('Payment Complement (REP) Services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.log = vi.fn()
    console.error = vi.fn()
  })

  // ==========================================================================
  // getPaymentComplements - lists REPs (tipo P) for a PPD invoice
  // ==========================================================================

  describe('getPaymentComplements', () => {
    it('should filter cfdi-invoices by tipoComprobante=P and arInvoiceId', async () => {
      // Arrange
      const mockResponse = { data: [], meta: { total: 0 } }
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse })

      // Act
      const result = await cfdiInvoicesService.getPaymentComplements(42)

      // Assert - filter[tipoComprobante]=P is present (URL-encoded)
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5BtipoComprobante%5D=P')
      )
      // Assert - filter[arInvoiceId]=42 is present (URL-encoded)
      expect(axiosClient.get).toHaveBeenCalledWith(
        expect.stringContaining('filter%5BarInvoiceId%5D=42')
      )
      expect(result).toEqual(mockResponse)
    })

    it('should return the transformed collection of REPs', async () => {
      // Arrange
      const mockResponse = {
        data: [
          { id: '10', series: 'REP', folio: 1, tipoComprobante: 'P', montoPago: 40000 },
        ],
        meta: { total: 1 },
      }
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse })

      // Act
      const result = await cfdiInvoicesService.getPaymentComplements(7)

      // Assert
      expect(result).toEqual(mockResponse)
    })
  })

  // ==========================================================================
  // emitPaymentComplement - manual REP endpoint
  // ==========================================================================

  describe('emitPaymentComplement', () => {
    it('should POST to the ar-invoices payment-complement endpoint', async () => {
      // Arrange
      vi.mocked(axiosClient.post).mockResolvedValue({
        data: {
          message: 'Complemento de pago generado',
          data: {
            id: 55,
            series: 'REP',
            folio: 3,
            uuid: 'AAAA-BBBB',
            status: 'valid',
            tipo_comprobante: 'P',
            monto_pago: 40000,
          },
        },
      })

      // Act
      const result = await cfdiInvoicesService.emitPaymentComplement(42)

      // Assert - endpoint + empty body when no payment_id given
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/api/v1/ar-invoices/42/payment-complement',
        {}
      )
      // Assert - snake_case -> camelCase mapping and id coerced to string
      expect(result).toEqual({
        message: 'Complemento de pago generado',
        data: {
          id: '55',
          series: 'REP',
          folio: 3,
          uuid: 'AAAA-BBBB',
          status: 'valid',
          tipoComprobante: 'P',
          montoPago: 40000,
        },
      })
    })

    it('should forward payment_id when a specific abono is targeted', async () => {
      // Arrange
      vi.mocked(axiosClient.post).mockResolvedValue({
        data: {
          message: 'Complemento de pago generado',
          data: {
            id: 56,
            series: 'REP',
            folio: 4,
            status: 'valid',
            tipo_comprobante: 'P',
            monto_pago: 10000,
          },
        },
      })

      // Act
      await cfdiInvoicesService.emitPaymentComplement(42, 99)

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/api/v1/ar-invoices/42/payment-complement',
        { payment_id: 99 }
      )
    })

    it('should reject with a 422 when the invoice is PUE (no REP applicable)', async () => {
      // Arrange
      const error = createMockAxiosError(
        422,
        'No aplica complemento de pago: la factura debe ser PPD y estar timbrada (con UUID).'
      )
      vi.mocked(axiosClient.post).mockRejectedValue(error)

      // Act & Assert
      await expect(cfdiInvoicesService.emitPaymentComplement(42)).rejects.toMatchObject({
        response: { status: 422 },
      })
    })

    it('should reject with a 403 when the user lacks permission', async () => {
      // Arrange
      const error = createMockAxiosError(403, 'Forbidden')
      vi.mocked(axiosClient.post).mockRejectedValue(error)

      // Act & Assert
      await expect(cfdiInvoicesService.emitPaymentComplement(42)).rejects.toMatchObject({
        response: { status: 403 },
      })
    })

    it('should surface generic errors (500)', async () => {
      // Arrange
      const error = createMockAxiosError(500, 'Server Error')
      vi.mocked(axiosClient.post).mockRejectedValue(error)

      // Act & Assert
      await expect(cfdiInvoicesService.emitPaymentComplement(42)).rejects.toThrow()
    })
  })
})
