/**
 * QuoteConvertModal Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { forwardRef, useImperativeHandle } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QuoteConvertModal } from '../../quotes/components/QuoteConvertModal'
import { useQuoteMutations } from '../../quotes/hooks'
import { createMockQuote } from '../../quotes/tests/utils/test-utils'

// Mock the quotes hooks module (relative import used inside QuoteConvertModal)
vi.mock('../../quotes/hooks', () => ({
  useQuoteMutations: vi.fn(),
}))

// Test-controlled confirm() result, consumed by the mocked ConfirmModal below
let confirmResult = true

vi.mock('@lwm/ui', () => ({
  ConfirmModal: forwardRef((_props: unknown, ref: React.Ref<{ confirm: () => Promise<boolean> }>) => {
    useImperativeHandle(ref, () => ({
      confirm: () => Promise.resolve(confirmResult),
    }))
    return null
  }),
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { toast } from '@lwm/ui'

describe('QuoteConvertModal', () => {
  const mockConvert = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    confirmResult = true
    vi.mocked(useQuoteMutations).mockReturnValue({
      convert: { mutateAsync: mockConvert, isPending: false },
    } as unknown as ReturnType<typeof useQuoteMutations>)
  })

  it('enables the button only for accepted quotes', () => {
    const quote = createMockQuote({ status: 'accepted' })
    render(<QuoteConvertModal quote={quote} onConverted={vi.fn()} />)

    expect(screen.getByRole('button', { name: /convertir a orden/i })).not.toBeDisabled()
  })

  it('disables the button for non-accepted quotes', () => {
    const quote = createMockQuote({ status: 'draft' })
    render(<QuoteConvertModal quote={quote} onConverted={vi.fn()} />)

    expect(screen.getByRole('button', { name: /convertir a orden/i })).toBeDisabled()
  })

  it('converts the quote and redirects via onConverted with the new order id', async () => {
    mockConvert.mockResolvedValue({
      data: {
        quote: createMockQuote({ status: 'converted' }),
        salesOrder: { type: 'sales-orders', id: '99', attributes: { orderNumber: 'OV-000099' } },
      },
      message: 'ok',
    })
    const quote = createMockQuote({ status: 'accepted', id: '7' })
    const onConverted = vi.fn()

    render(<QuoteConvertModal quote={quote} onConverted={onConverted} />)
    fireEvent.click(screen.getByRole('button', { name: /convertir a orden/i }))

    await waitFor(() => expect(mockConvert).toHaveBeenCalledWith({ id: '7' }))
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('OV-000099'))
    expect(onConverted).toHaveBeenCalledWith('99')
  })

  it('does not convert when confirmation is rejected', async () => {
    confirmResult = false
    const quote = createMockQuote({ status: 'accepted' })

    render(<QuoteConvertModal quote={quote} onConverted={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /convertir a orden/i }))

    await waitFor(() => expect(mockConvert).not.toHaveBeenCalled())
  })

  it('shows a 422 error message when the quote is not convertible', async () => {
    mockConvert.mockRejectedValue({
      response: { status: 422, data: { message: 'La cotizacion no esta aceptada' } },
    })
    const quote = createMockQuote({ status: 'accepted' })
    const onConverted = vi.fn()

    render(<QuoteConvertModal quote={quote} onConverted={onConverted} />)
    fireEvent.click(screen.getByRole('button', { name: /convertir a orden/i }))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('La cotizacion no esta aceptada'))
    expect(onConverted).not.toHaveBeenCalled()
  })
})
