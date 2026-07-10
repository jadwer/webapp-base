/**
 * QuoteSendButton Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { forwardRef, useImperativeHandle } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QuoteSendButton } from '../../quotes/components/QuoteSendButton'
import { useQuoteMutations } from '../../quotes/hooks'
import { createMockQuote } from '../../quotes/tests/utils/test-utils'

// Mock the quotes hooks module (relative import used inside QuoteSendButton)
vi.mock('../../quotes/hooks', () => ({
  useQuoteMutations: vi.fn(),
}))

// Test-controlled confirm() result, consumed by the mocked ConfirmModal below
let confirmResult = true

// Mock @lwm/ui: ConfirmModal exposes a real ref (via forwardRef) that
// resolves confirm() with the test-controlled result; toast is a spy.
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

describe('QuoteSendButton', () => {
  const mockSend = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    confirmResult = true
    vi.mocked(useQuoteMutations).mockReturnValue({
      send: { mutateAsync: mockSend, isPending: false },
    } as unknown as ReturnType<typeof useQuoteMutations>)
  })

  it('renders enabled for draft status', () => {
    const quote = createMockQuote({ status: 'draft' })
    render(<QuoteSendButton quote={quote} />)

    const button = screen.getByRole('button', { name: /enviar/i })
    expect(button).not.toBeDisabled()
  })

  it('renders enabled for sent status (resend)', () => {
    const quote = createMockQuote({ status: 'sent' })
    render(<QuoteSendButton quote={quote} />)

    expect(screen.getByRole('button', { name: /enviar/i })).not.toBeDisabled()
  })

  it('disables the button for non-sendable statuses', () => {
    const quote = createMockQuote({ status: 'accepted' })
    render(<QuoteSendButton quote={quote} />)

    expect(screen.getByRole('button', { name: /enviar/i })).toBeDisabled()
  })

  it('calls send mutation and shows success toast on confirm', async () => {
    mockSend.mockResolvedValue({ data: createMockQuote(), message: 'ok' })
    const quote = createMockQuote({ status: 'draft', id: '42' })
    const onSent = vi.fn()

    render(<QuoteSendButton quote={quote} onSent={onSent} />)
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    await waitFor(() => expect(mockSend).toHaveBeenCalledWith('42'))
    expect(toast.success).toHaveBeenCalled()
    expect(onSent).toHaveBeenCalled()
  })

  it('does not send when confirmation is rejected', async () => {
    confirmResult = false
    const quote = createMockQuote({ status: 'draft' })

    render(<QuoteSendButton quote={quote} />)
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    await waitFor(() => expect(mockSend).not.toHaveBeenCalled())
  })

  it('shows a 422 error message when the quote cannot be sent', async () => {
    mockSend.mockRejectedValue({
      response: { status: 422, data: { message: 'La cotizacion ya fue enviada' } },
    })
    const quote = createMockQuote({ status: 'draft' })

    render(<QuoteSendButton quote={quote} />)
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('La cotizacion ya fue enviada'))
  })
})
