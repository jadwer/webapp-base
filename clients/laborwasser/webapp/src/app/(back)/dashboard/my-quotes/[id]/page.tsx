/**
 * My Quote Detail Page (Customer Portal)
 *
 * Shows detail of a specific quote for the customer.
 * Route: /dashboard/my-quotes/[id]
 */

'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useAuth } from '@/modules/auth'
import { usePublicSettings } from '@/modules/app-config'
import { QuoteStatusBadge } from '@/modules/quotes'
import { quoteService, quoteItemService } from '@/modules/quotes'
import type { Quote, QuoteItem } from '@/modules/quotes'
import { formatDateOnly } from '@/modules/quotes'
import {
  isQuoteItemPricePending,
  formatQuoteItemQuantity,
  getPricePendingErrors,
  ACCEPT_PRICE_PENDING_MESSAGE,
  type PricePendingError,
} from '@/modules/quotes'
import { extractApiErrorMessage } from '@/modules/products'
import { toast } from '@/lib/toast'
import { isPastDateOnly } from '@lwm/ui'

interface MyQuoteDetailPageProps {
  params: Promise<{ id: string }>
}

export default function MyQuoteDetailPage({ params }: MyQuoteDetailPageProps) {
  const { id } = use(params)
  const { isLoading: authLoading } = useAuth()
  const { get } = usePublicSettings()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [items, setItems] = useState<QuoteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)
  // D9: rechazo del backend al aceptar (422 price_pending u otro error)
  const [acceptError, setAcceptError] = useState<{ message: string; pending: PricePendingError[] } | null>(null)

  useEffect(() => {
    if (authLoading) return

    const fetchQuote = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const quoteData = await quoteService.getById(id)
        setQuote(quoteData)

        // Fetch items
        const itemsData = await quoteItemService.getByQuoteId(id)
        setItems(itemsData)
      } catch (err) {
        // Detalle del API (JSON:API errors[0].detail o message) o generico
        const data = (err as { response?: { data?: { errors?: { detail?: string }[]; message?: string; error?: string } } })?.response?.data
        setError(data?.errors?.[0]?.detail || data?.error || data?.message || 'Error al cargar la cotización')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuote()
  }, [id, authLoading])

  const handleAcceptQuote = async () => {
    if (!quote) return

    setIsAccepting(true)
    setAcceptError(null)
    try {
      await quoteService.accept(quote.id)
      toast.success('Cotización aceptada exitosamente')
      // Refresh quote data
      const updatedQuote = await quoteService.getById(id)
      setQuote(updatedQuote)
    } catch (err) {
      // Regla 7: el 422 price_pending se muestra con el detalle por producto
      const pending = getPricePendingErrors(err) ?? []
      const backendMessage = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message
      const message = pending.length > 0
        ? (typeof backendMessage === 'string' && backendMessage ? backendMessage : ACCEPT_PRICE_PENDING_MESSAGE)
        : extractApiErrorMessage(err, 'No se pudo aceptar la cotización')
      setAcceptError({ message, pending })
      toast.error(message)
    } finally {
      setIsAccepting(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!quote) return

    try {
      // Fix "Unauthenticated": window.open a la URL del API iba SIN el header Bearer
      // (el token vive en localStorage, no en cookie) y el backend respondia 401 sin
      // importar el rol. Se usa el servicio autenticado con blob, igual que la vista
      // admin de cotizaciones.
      await quoteService.downloadPdf(quote.id)
      toast.success('PDF descargado')
    } catch {
      toast.error('Error al descargar el PDF')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price)
  }

  if (authLoading || isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <span className="spinner-border text-primary" role="status"></span>
          <p className="mt-3 text-muted">Cargando cotización...</p>
        </div>
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error || 'Cotización no encontrada'}
        </div>
        <Link href="/dashboard/my-quotes" className="btn btn-outline-primary">
          <i className="bi bi-arrow-left me-2"></i>
          Volver a mis cotizaciones
        </Link>
      </div>
    )
  }

  const canAccept = quote.status === 'sent'
  const isExpired = quote.validUntil && isPastDateOnly(quote.validUntil)
  // D9: con precios por confirmar el cliente no puede aceptar todavia
  const hasPendingPrices = items.some(isQuoteItemPricePending)
  const showAcceptButton = canAccept && !isExpired

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <Link href="/dashboard/my-quotes" className="text-muted text-decoration-none mb-2 d-inline-block">
            <i className="bi bi-arrow-left me-1"></i>
            Mis Cotizaciones
          </Link>
          <h1 className="h3 mb-1">
            Cotización {quote.quoteNumber || `#${quote.id}`}
          </h1>
          <div className="d-flex align-items-center gap-3">
            <QuoteStatusBadge status={quote.status} />
            {isExpired && quote.status === 'sent' && (
              <span className="badge bg-warning text-dark">
                <i className="bi bi-clock me-1"></i>
                Vencida
              </span>
            )}
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={handleDownloadPDF}
          >
            <i className="bi bi-download me-2"></i>
            Descargar PDF
          </button>

          {showAcceptButton && (
            <button
              className="btn btn-success"
              onClick={handleAcceptQuote}
              disabled={isAccepting || hasPendingPrices}
              title={hasPendingPrices ? ACCEPT_PRICE_PENDING_MESSAGE : undefined}
              aria-describedby={hasPendingPrices ? 'my-quote-accept-blocked' : undefined}
              data-testid="my-quote-accept"
            >
              {isAccepting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Aceptando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Aceptar cotización
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {showAcceptButton && hasPendingPrices && (
        <div id="my-quote-accept-blocked" className="alert alert-info" role="status" data-testid="my-quote-accept-blocked">
          <i className="bi bi-hourglass-split me-2" aria-hidden="true"></i>
          {ACCEPT_PRICE_PENDING_MESSAGE}
        </div>
      )}

      {acceptError && (
        <div className="alert alert-danger" role="alert" data-testid="my-quote-accept-error">
          <i className="bi bi-exclamation-triangle me-2" aria-hidden="true"></i>
          {acceptError.message}
          {acceptError.pending.length > 0 && (
            <ul className="mb-0 mt-2">
              {acceptError.pending.map((p) => (
                <li key={p.quoteItemId ?? p.productName}>
                  <strong>{p.productName}</strong>
                  {p.productSku ? ` (${p.productSku})` : ''}
                  {p.detail ? `: ${p.detail}` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="row">
        {/* Quote Details */}
        <div className="col-lg-8">
          {/* Items Table */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Productos ({items.length})
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Producto</th>
                      <th className="text-center">Cantidad</th>
                      <th className="text-end">Precio Unit.</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div>
                            <strong>{item.productName || `Producto ${item.productId}`}</strong>
                            {item.productSku && (
                              <small className="d-block text-muted">SKU: {item.productSku}</small>
                            )}
                            {item.notes && (
                              <small className="d-block text-info">
                                <i className="bi bi-info-circle me-1"></i>
                                {item.notes}
                              </small>
                            )}
                          </div>
                        </td>
                        <td className="text-center">
                          {formatQuoteItemQuantity(item)}
                        </td>
                        {/* P2 granel: precio sujeto a cotizacion aun sin capturar */}
                        <td className="text-end">
                          {isQuoteItemPricePending(item)
                            ? <span className="fst-italic text-warning-emphasis">Por confirmar</span>
                            : formatPrice(item.quotedPrice || item.unitPrice)}
                        </td>
                        <td className="text-end">
                          {isQuoteItemPricePending(item)
                            ? <span className="fst-italic text-warning-emphasis">Por confirmar</span>
                            : <strong>{formatPrice(item.total || (item.quantity * (item.quotedPrice || item.unitPrice)))}</strong>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {hasPendingPrices && (
                <div className="alert alert-warning small m-3" role="status" data-testid="my-quote-price-pending">
                  <i className="bi bi-info-circle me-2"></i>
                  Precio sujeto a cotización: los productos marcados &quot;Por confirmar&quot; no están incluidos en el total.
                  Te confirmaremos el precio antes de procesar tu pedido.
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-chat-text me-2"></i>
                  Notas
                </h5>
              </div>
              <div className="card-body">
                <p className="mb-0">{quote.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="col-lg-4">
          {/* Totals */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-calculator me-2"></i>
                Resumen
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatPrice(quote.subtotalAmount || 0)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>IVA (16%):</span>
                <span>{formatPrice(quote.taxAmount || 0)}</span>
              </div>
              {(quote.discountAmount || 0) > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Descuento:</span>
                  <span>-{formatPrice(quote.discountAmount || 0)}</span>
                </div>
              )}
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total:</strong>
                <strong className="fs-4 text-primary">
                  {formatPrice(quote.totalAmount || 0)}
                </strong>
              </div>
            </div>
          </div>

          {/* Quote Info */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Informacion
              </h5>
            </div>
            <div className="card-body">
              <dl className="mb-0">
                <dt className="text-muted small">Fecha de creacion</dt>
                <dd>{formatDate(quote.createdAt)}</dd>

                {quote.validUntil && (
                  <>
                    <dt className="text-muted small">Vigencia hasta</dt>
                    <dd className={isExpired ? 'text-danger' : ''}>
                      {formatDateOnly(quote.validUntil)}
                      {isExpired && ' (Vencida)'}
                    </dd>
                  </>
                )}

                {quote.estimatedEta && (
                  <>
                    <dt className="text-muted small">Tiempo de entrega estimado</dt>
                    <dd>{quote.estimatedEta}</dd>
                  </>
                )}

                {quote.termsAndConditions && (
                  <>
                    <dt className="text-muted small">Condiciones de pago</dt>
                    <dd>{quote.termsAndConditions}</dd>
                  </>
                )}
              </dl>
            </div>
          </div>

          {/* Help */}
          <div className="card bg-light border-0">
            <div className="card-body">
              <h6>
                <i className="bi bi-question-circle me-2"></i>
                Tienes dudas?
              </h6>
              <p className="small text-muted mb-2">
                Si tienes preguntas sobre esta cotización, contáctanos:
              </p>
              <a href={`mailto:${get('company.email')}`} className="btn btn-sm btn-outline-primary w-100">
                <i className="bi bi-envelope me-2"></i>
                Contactar Ventas
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
