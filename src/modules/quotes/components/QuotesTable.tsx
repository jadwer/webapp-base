'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { QuoteStatusBadge } from './QuoteStatusBadge'
import type { Quote } from '../types'
import { QUOTE_STATUS_CONFIG } from '../types'
import { useQuoteMutations } from '../hooks'
import { toast } from '@/lib/toast'
import { ConfirmModal, ConfirmModalHandle } from '@/ui/components/base'

interface QuotesTableProps {
  quotes: Quote[]
  isLoading?: boolean
  onQuoteUpdated?: () => void
}

export function QuotesTable({ quotes, isLoading, onQuoteUpdated }: QuotesTableProps) {
  const router = useRouter()
  const mutations = useQuoteMutations()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const formatCurrency = (amount: number, currency: string = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleAction = async (
    action: 'send' | 'accept' | 'reject' | 'convert' | 'cancel' | 'duplicate',
    quote: Quote
  ) => {
    setActionLoading(quote.id)

    try {
      switch (action) {
        case 'send':
          await mutations.send.mutateAsync(quote.id)
          toast.success('Cotizacion enviada')
          break
        case 'accept':
          await mutations.accept.mutateAsync(quote.id)
          toast.success('Cotizacion aceptada')
          break
        case 'reject':
          await mutations.reject.mutateAsync({ id: quote.id })
          toast.success('Cotizacion rechazada')
          break
        case 'convert':
          const result = await mutations.convert.mutateAsync({ id: quote.id })
          toast.success(`Orden de venta ${result.data.salesOrder?.attributes?.orderNumber || ''} creada`)
          break
        case 'cancel':
          await mutations.cancel.mutateAsync(quote.id)
          toast.success('Cotizacion cancelada')
          break
        case 'duplicate':
          await mutations.duplicate.mutateAsync(quote.id)
          toast.success('Cotizacion duplicada')
          break
      }
      onQuoteUpdated?.()
    } catch {
      toast.error('Error al ejecutar la accion')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (quoteId: string) => {
    const confirmed = await confirmModalRef.current?.confirm(
      'Esta accion no se puede deshacer. Se eliminara permanentemente esta cotizacion.',
      {
        title: 'Eliminar cotizacion',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmVariant: 'danger'
      }
    )

    if (!confirmed) return

    try {
      await mutations.delete.mutateAsync(quoteId)
      toast.success('Cotizacion eliminada')
      onQuoteUpdated?.()
    } catch {
      toast.error('Error al eliminar la cotizacion')
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        No hay cotizaciones para mostrar
      </div>
    )
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>No. Cotizacion</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Vigencia</th>
              <th>Items</th>
              <th className="text-end">Total</th>
              <th>Estado</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => {
              const statusConfig = QUOTE_STATUS_CONFIG[quote.status]
              const isExpired = quote.validUntil && new Date(quote.validUntil) < new Date()

              return (
                <tr key={quote.id}>
                  <td className="fw-medium">{quote.quoteNumber}</td>
                  <td>{quote.contact?.name || `Contact #${quote.contactId}`}</td>
                  <td>{formatDate(quote.quoteDate)}</td>
                  <td>
                    <span className={isExpired && quote.status === 'sent' ? 'text-danger' : ''}>
                      {formatDate(quote.validUntil)}
                    </span>
                  </td>
                  <td>{quote.itemsCount ?? 0}</td>
                  <td className="text-end fw-medium">
                    {formatCurrency(quote.totalAmount, quote.currency)}
                  </td>
                  <td>
                    <QuoteStatusBadge status={quote.status} />
                  </td>
                  <td className="text-end">
                    <div className="dropdown">
                      <button
                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                        disabled={actionLoading === quote.id}
                      >
                        {actionLoading === quote.id ? (
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                        ) : (
                          <i className="bi bi-three-dots"></i>
                        )}
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}
                          >
                            <i className="bi bi-eye me-2"></i>
                            Ver detalle
                          </button>
                        </li>

                        {statusConfig.canSend && (quote.itemsCount ?? 0) > 0 && (
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleAction('send', quote)}
                            >
                              <i className="bi bi-send me-2"></i>
                              Enviar al cliente
                            </button>
                          </li>
                        )}

                        {statusConfig.canAccept && (
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleAction('accept', quote)}
                            >
                              <i className="bi bi-check-lg me-2"></i>
                              Marcar aceptada
                            </button>
                          </li>
                        )}

                        {statusConfig.canReject && (
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleAction('reject', quote)}
                            >
                              <i className="bi bi-x-lg me-2"></i>
                              Marcar rechazada
                            </button>
                          </li>
                        )}

                        {statusConfig.canConvert && (
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleAction('convert', quote)}
                            >
                              <i className="bi bi-file-earmark-text me-2"></i>
                              Convertir a orden
                            </button>
                          </li>
                        )}

                        <li><hr className="dropdown-divider" /></li>

                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleAction('duplicate', quote)}
                          >
                            <i className="bi bi-copy me-2"></i>
                            Duplicar
                          </button>
                        </li>

                        {statusConfig.canCancel && (
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleAction('cancel', quote)}
                            >
                              <i className="bi bi-x-circle me-2"></i>
                              Cancelar
                            </button>
                          </li>
                        )}

                        {quote.status === 'draft' && (
                          <>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => handleDelete(quote.id)}
                              >
                                <i className="bi bi-trash me-2"></i>
                                Eliminar
                              </button>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal ref={confirmModalRef} />
    </>
  )
}
