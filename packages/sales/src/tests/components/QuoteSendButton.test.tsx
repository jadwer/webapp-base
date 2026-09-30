/**
 * QuoteSendButton + QuoteSendModal (destinatarios elegidos, 2026-09-30).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QuoteSendButton } from '../../quotes/components/QuoteSendButton'
import { useQuoteMutations } from '../../quotes/hooks'
import { quoteService } from '../../quotes/services'
import { createMockQuote } from '../../quotes/tests/utils/test-utils'

vi.mock('../../quotes/hooks', () => ({ useQuoteMutations: vi.fn() }))
vi.mock('../../quotes/services', () => ({ quoteService: { getRecipientOptions: vi.fn() } }))

vi.mock('@lwm/ui', async () => {
  const actual = await vi.importActual<typeof import('@lwm/ui')>('@lwm/ui')
  return {
    EmailChipsInput: actual.EmailChipsInput,
    normalizeEmails: actual.normalizeEmails,
    Modal: ({ show, title, children, footer }: { show: boolean; title?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }) =>
      show ? (
        <div role="dialog">
          <h2>{title}</h2>
          {children}
          {footer}
        </div>
      ) : null,
    toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
  }
})

import { toast } from '@lwm/ui'

const options = [
  { email: 'compras@lab.mx', label: 'Correo principal', kind: 'primary' },
  { email: 'laboratorio@lab.mx', label: 'Correo adicional', kind: 'additional' },
  { email: 'ana@lab.mx', label: 'Ana - Inventarios', kind: 'person' },
]

describe('QuoteSendButton', () => {
  const mockSend = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useQuoteMutations).mockReturnValue({
      send: { mutateAsync: mockSend, isPending: false },
    } as unknown as ReturnType<typeof useQuoteMutations>)
    vi.mocked(quoteService.getRecipientOptions).mockResolvedValue(options as never)
  })

  it('se deshabilita en estados que no se envian', () => {
    render(<QuoteSendButton quote={createMockQuote({ status: 'accepted' })} />)
    expect((screen.getByRole('button', { name: /enviar/i }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('abre el modal con el principal marcado y los demas disponibles', async () => {
    render(<QuoteSendButton quote={createMockQuote({ status: 'draft', contactId: 7 })} />)
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    await waitFor(() => expect(screen.getByText('laboratorio@lab.mx')).toBeTruthy())
    const boxes = screen.getAllByRole('checkbox') as HTMLInputElement[]
    expect(boxes.map((b) => b.checked)).toEqual([true, false, false])
    expect(quoteService.getRecipientOptions).toHaveBeenCalledWith(7)
  })

  it('manda los elegidos mas los agregados en caliente y guarda en el contacto', async () => {
    mockSend.mockResolvedValue({ meta: { recipients: ['compras@lab.mx', 'ana@lab.mx', 'calidad@lab.mx'], emailSent: true, emailError: null } })
    const onSent = vi.fn()
    render(<QuoteSendButton quote={createMockQuote({ status: 'draft', id: '42', contactId: 7 })} onSent={onSent} />)
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))
    await waitFor(() => expect(screen.getByText('ana@lab.mx')).toBeTruthy())

    fireEvent.click(screen.getAllByRole('checkbox')[2])
    fireEvent.change(screen.getByLabelText('Agregar otros correos'), { target: { value: 'Calidad@lab.mx,' } })
    fireEvent.click(screen.getByLabelText(/Guardar estos correos/))
    const sendButtons = screen.getAllByRole('button', { name: /^Enviar$/ })
    fireEvent.click(sendButtons[sendButtons.length - 1])

    await waitFor(() =>
      expect(mockSend).toHaveBeenCalledWith('42', {
        recipients: ['compras@lab.mx', 'ana@lab.mx', 'calidad@lab.mx'],
        saveToContact: true,
      })
    )
    expect(toast.success).toHaveBeenCalled()
    expect(onSent).toHaveBeenCalled()
  })

  it('avisa con detalle si la cotizacion quedo enviada sin correo', async () => {
    mockSend.mockResolvedValue({ meta: { recipients: ['compras@lab.mx'], emailSent: false, emailError: 'Mailer apagado' } })
    render(<QuoteSendButton quote={createMockQuote({ status: 'draft', contactId: 7 })} />)
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))
    await waitFor(() => expect(screen.getByText('compras@lab.mx')).toBeTruthy())
    const sendButtons = screen.getAllByRole('button', { name: /^Enviar$/ })
    fireEvent.click(sendButtons[sendButtons.length - 1])

    await waitFor(() => expect(toast.warning).toHaveBeenCalledWith(expect.stringContaining('Mailer apagado'), { duration: 0 }))
  })

  it('muestra los errores de validacion del backend en el modal', async () => {
    mockSend.mockRejectedValue({ response: { status: 422, data: { errors: { 'recipients.0': ['Captura un solo destinatario'] } } } })
    render(<QuoteSendButton quote={createMockQuote({ status: 'draft', contactId: 7 })} />)
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))
    await waitFor(() => expect(screen.getByText('compras@lab.mx')).toBeTruthy())
    const sendButtons = screen.getAllByRole('button', { name: /^Enviar$/ })
    fireEvent.click(sendButtons[sendButtons.length - 1])

    await waitFor(() => expect(screen.getByText('Captura un solo destinatario')).toBeTruthy())
  })
})
