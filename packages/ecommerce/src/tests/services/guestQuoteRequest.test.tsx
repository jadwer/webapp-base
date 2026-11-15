/**
 * Cotizar sin registro desde la tienda (junta 2026-11-12, J2)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@lwm/auth', async () => {
  const actual = await vi.importActual<typeof import('@lwm/auth')>('@lwm/auth')
  return { ...actual, axiosClient: { post: vi.fn() } }
})

import { axiosClient } from '@lwm/auth'
import { cartQuotePdfService, quoteRequestErrorMessage } from '../../public-catalog/services/cartQuotePdfService'
import { GuestQuoteRequestFields, EMPTY_GUEST_QUOTE, guestQuoteProblem } from '../../public-catalog/components/GuestQuoteRequestFields'

const contact = { name: 'Ana Pérez', email: 'ana@farmabiot.mx', company: 'Farmabiot', attentionTo: 'Laboratorio', phone: '' }

describe('guest quote request', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:x')
    globalThis.URL.revokeObjectURL = vi.fn()
  })

  it('valida lo minimo antes de enviar, en español', () => {
    expect(guestQuoteProblem(EMPTY_GUEST_QUOTE)).toBe('Escribe tu nombre.')
    expect(guestQuoteProblem({ ...contact, email: 'ana' })).toBe('Escribe un correo válido.')
    expect(guestQuoteProblem({ ...contact, attentionTo: ' ' })).toBe('Escribe a quién va dirigida la cotización.')
    expect(guestQuoteProblem(contact)).toBeNull()
  })

  it('manda los datos y los productos al endpoint publico y devuelve el folio', async () => {
    vi.mocked(axiosClient.post).mockResolvedValue({ data: new Blob(['%PDF']), headers: { 'x-quote-number': 'COT-26000120' } })

    const folio = await cartQuotePdfService.requestFormalQuote(contact, [{ productId: '7', quantity: 2 }])

    expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/public/quote-requests', {
      name: 'Ana Pérez', email: 'ana@farmabiot.mx', company: 'Farmabiot', attention_to: 'Laboratorio', phone: null, website: '',
      items: [{ product_id: 7, quantity: 2 }],
    }, { responseType: 'blob' })
    expect(folio).toBe('COT-26000120')
  })

  it('lee el error del backend aunque llegue como Blob', async () => {
    const blob = new Blob([JSON.stringify({ message: 'x', errors: { email: ['El campo correo debe ser una dirección de correo válida.'] } })])
    expect(await quoteRequestErrorMessage({ response: { data: blob } }, 'fallo')).toBe('El campo correo debe ser una dirección de correo válida.')
    expect(await quoteRequestErrorMessage({}, 'fallo')).toBe('fallo')
  })

  it('pinta los campos y muestra el error visible', () => {
    const onChange = vi.fn()
    render(<GuestQuoteRequestFields value={EMPTY_GUEST_QUOTE} onChange={onChange} error="Escribe tu nombre." />)
    fireEvent.change(screen.getByLabelText('Empresa *'), { target: { value: 'Farmabiot' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ company: 'Farmabiot' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Escribe tu nombre.')
  })
})
