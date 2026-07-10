'use client'

import { useRef } from 'react'
import { ConfirmModal, ConfirmModalHandle } from '@lwm/ui'
import { toast } from '@lwm/ui'
import { useQuoteMutations } from '../hooks'
import type { Quote } from '../types'

interface QuoteConvertModalProps {
  quote: Quote
  /** Called with the new SalesOrder id after a successful conversion, so the caller can redirect. */
  onConverted: (salesOrderId: string) => void
  className?: string
}

/**
 * QuoteConvertModal
 *
 * Converts an accepted quote into a SalesOrder via POST /quotes/{id}/convert.
 * Only enabled for quotes in 'accepted' status. Shows a ConfirmModal before
 * converting, and surfaces a toast with the new order number on success.
 * Handles 422 (quote not convertible) with a clear message.
 */
export function QuoteConvertModal({ quote, onConverted, className }: QuoteConvertModalProps) {
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const { convert } = useQuoteMutations()

  const canConvert = quote.status === 'accepted'

  const handleConvert = async () => {
    const confirmed = await confirmModalRef.current?.confirm(
      'Esta accion creara una nueva orden de venta con los productos y precios de esta cotizacion. La cotizacion quedara marcada como "Convertida".',
      {
        title: 'Convertir a Orden de Venta',
        confirmText: 'Convertir',
        cancelText: 'Cancelar',
        confirmVariant: 'primary'
      }
    )
    if (!confirmed) return

    try {
      const result = await convert.mutateAsync({ id: quote.id })
      const salesOrderAttrs = result.data.salesOrder?.attributes
      const orderNumber =
        (salesOrderAttrs?.orderNumber as string | undefined) ||
        (salesOrderAttrs?.order_number as string | undefined) ||
        ''
      const salesOrderId = result.data.salesOrder?.id

      toast.success(orderNumber ? `Orden de venta ${orderNumber} creada` : 'Orden de venta creada')

      if (salesOrderId) {
        onConverted(salesOrderId)
      }
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { message?: string; error?: string } } }
      if (error.response?.status === 422) {
        toast.error(
          error.response.data?.message ||
            error.response.data?.error ||
            'La cotizacion no se encuentra en un estado valido para convertir'
        )
      } else {
        toast.error('Error al convertir la cotizacion')
      }
    }
  }

  return (
    <>
      <button
        type="button"
        className={className || 'btn btn-success btn-lg'}
        onClick={handleConvert}
        disabled={!canConvert || convert.isPending}
      >
        <i className="bi bi-cart-check me-2" />
        {convert.isPending ? 'Generando...' : 'Convertir a orden'}
      </button>
      <ConfirmModal ref={confirmModalRef} />
    </>
  )
}
