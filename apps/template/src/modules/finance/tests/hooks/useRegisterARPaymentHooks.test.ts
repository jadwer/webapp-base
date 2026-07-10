/**
 * useRegisterARPayment / useFormaPagoOptions Hooks Tests
 * Tests for the AR invoice payment registration flow hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRegisterARPayment, useFormaPagoOptions } from '../../hooks'
import { arInvoicesService, satCatalogsService } from '../../services'

vi.mock('../../services', () => ({
  arInvoicesService: {
    registerPayment: vi.fn(),
  },
  satCatalogsService: {
    getFormaPago: vi.fn(),
  },
}))

vi.mock('swr', () => ({
  default: vi.fn(() => ({
    data: { data: [{ clave: '01', descripcion: 'Efectivo' }] },
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
  })),
  useSWRConfig: vi.fn(() => ({
    mutate: vi.fn(),
  })),
}))

describe('useRegisterARPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('delegates to arInvoicesService.registerPayment with the invoice id and payload', async () => {
    vi.mocked(arInvoicesService.registerPayment).mockResolvedValue({
      message: 'ok',
      invoice: { id: '1', totalAmount: 100, paidAmount: 100, balance: 0, status: 'paid' },
    } as any)

    const { result } = renderHook(() => useRegisterARPayment())
    const payload = { paymentDate: '2026-07-10', amount: 100, formaPago: '01' }
    await result.current.registerPayment('1', payload)

    expect(arInvoicesService.registerPayment).toHaveBeenCalledWith('1', payload)
  })
})

describe('useFormaPagoOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the forma de pago catalog from the SAT service', () => {
    const { result } = renderHook(() => useFormaPagoOptions())

    expect(result.current.formaPagoOptions).toEqual([{ clave: '01', descripcion: 'Efectivo' }])
    expect(result.current.isLoading).toBe(false)
  })
})
