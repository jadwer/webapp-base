'use client'

import { useRef } from 'react'
import { ConfirmModal, ConfirmModalHandle } from '@lwm/ui'
import { toast } from '@lwm/ui'
import { useQuoteMutations } from '../hooks'
import type { Quote } from '../types'

interface QuoteSendButtonProps {
  quote: Quote
  onSent?: () => void
  className?: string
}

/**
 * QuoteSendButton
 *
 * Sends a quote to the customer's contact email via POST /quotes/{id}/send.
 * Only enabled for quotes in draft/sent status (resend allowed).
 * Shows a ConfirmModal that surfaces the destination email before sending.
 */
export function QuoteSendButton({ quote, onSent, className }: QuoteSendButtonProps) {
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const { send } = useQuoteMutations()

  const canSend = ['draft', 'sent'].includes(quote.status)
  const destinationEmail = quote.contact?.email

  const handleSend = async () => {
    const confirmed = await confirmModalRef.current?.confirm(
      destinationEmail
        ? `Se enviara la cotizacion ${quote.quoteNumber} al correo ${destinationEmail}.`
        : `Se enviara la cotizacion ${quote.quoteNumber}. El contacto no tiene un correo registrado; verifique antes de continuar.`,
      {
        title: 'Enviar cotizacion',
        confirmText: 'Enviar',
        cancelText: 'Cancelar',
        confirmVariant: 'primary'
      }
    )
    if (!confirmed) return

    try {
      await send.mutateAsync(quote.id)
      toast.success('Cotizacion enviada al cliente')
      onSent?.()
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { message?: string; error?: string } } }
      if (error.response?.status === 422) {
        toast.error(
          error.response.data?.message || error.response.data?.error || 'No se puede enviar la cotizacion en su estado actual'
        )
      } else {
        toast.error('Error al enviar la cotizacion')
      }
    }
  }

  return (
    <>
      <button
        type="button"
        className={className || 'btn btn-outline-secondary'}
        onClick={handleSend}
        disabled={!canSend || send.isPending}
      >
        <i className="bi bi-envelope me-2" />
        {send.isPending ? 'Enviando...' : 'Enviar'}
      </button>
      <ConfirmModal ref={confirmModalRef} />
    </>
  )
}
