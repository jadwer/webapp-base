/**
 * My Quotes Page (Customer Portal)
 *
 * Shows quotes filtered by the current user's email.
 * Route: /dashboard/my-quotes
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/modules/auth'
import { QUOTE_STATUS_TONE, QUOTE_STATUS_LABEL } from '@/modules/quotes'
import { LwSurface, LwPageTitle, LwStatusPill, LwCountPill, LwTableWrap } from '@lwm/ui'
import { quoteService } from '@/modules/quotes'
import type { Quote } from '@/modules/quotes'
import { formatDateOnly } from '@/modules/quotes'

export default function MyQuotesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !user?.email) return

    const fetchMyQuotes = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch quotes filtered by contact email (uses backend scope filter)
        const response = await quoteService.getAll(
          { contactEmail: user.email },
          { field: 'createdAt', direction: 'desc' },
          1, // page
          50, // pageSize
          ['contact']
        )

        setQuotes(response.data)
      } catch {
        setError('Error al cargar tus cotizaciones')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMyQuotes()
  }, [user?.email, authLoading])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price)
  }

  if (authLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <span className="spinner-border text-primary" role="status"></span>
          <p className="mt-3 text-muted">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <LwSurface>
      <LwPageTitle
        title="Mis cotizaciones"
        subtitle="Revisa, acepta o rechaza las cotizaciones que te enviamos"
        actions={
          <Link href="/productos" className="btn btn-primary">
            <i className="bi bi-plus-lg me-1"></i>
            Solicitar cotización
          </Link>
        }
      />

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <span className="spinner-border text-primary" role="status"></span>
            <p className="mt-3 text-muted">Cargando cotizaciones...</p>
          </div>
        </div>
      ) : quotes.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-file-earmark-text text-muted" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3">No tienes cotizaciones</h5>
            <p className="text-muted">
              Explora nuestro catálogo y solicita una cotización para los productos que necesitas.
            </p>
            <Link href="/productos" className="btn btn-primary mt-2">
              <i className="bi bi-grid-3x3-gap me-2"></i>
              Ver Catálogo
            </Link>
          </div>
        </div>
      ) : (
        <LwTableWrap>
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Fecha</th>
                    <th>Vigencia</th>
                    <th>Items</th>
                    <th className="text-end">Total</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((quote) => (
                    <tr key={quote.id}>
                      <td>
                        <strong>{quote.quoteNumber || `COT-${quote.id}`}</strong>
                      </td>
                      <td>{formatDate(quote.createdAt)}</td>
                      <td>
                        {quote.validUntil ? formatDateOnly(quote.validUntil) : '-'}
                      </td>
                      <td>
                        <LwCountPill>
                          {quote.itemsCount || 0} {quote.itemsCount === 1 ? 'Producto' : 'Productos'}
                        </LwCountPill>
                      </td>
                      <td className="text-end">
                        <strong>{formatPrice(quote.totalAmount || 0)}</strong>
                      </td>
                      <td>
                        <LwStatusPill tone={QUOTE_STATUS_TONE[quote.status] ?? 'neutral'}>{QUOTE_STATUS_LABEL[quote.status] ?? quote.status}</LwStatusPill>
                      </td>
                      <td>
                        <Link
                          href={`/dashboard/my-quotes/${quote.id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-eye me-1"></i>
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
        </LwTableWrap>
      )}

      {/* Info card */}
      <div className="card mt-4 bg-light border-0">
        <div className="card-body">
          <h6 className="card-title">
            <i className="bi bi-info-circle me-2"></i>
            Estados de cotización
          </h6>
          <div className="row mt-3">
            <div className="col-md-3 col-6 mb-2">
              <LwStatusPill tone={QUOTE_STATUS_TONE.draft}>{QUOTE_STATUS_LABEL.draft}</LwStatusPill>
              <small className="d-block text-muted mt-1">En revisión</small>
            </div>
            <div className="col-md-3 col-6 mb-2">
              <LwStatusPill tone={QUOTE_STATUS_TONE.sent}>{QUOTE_STATUS_LABEL.sent}</LwStatusPill>
              <small className="d-block text-muted mt-1">Enviada para tu aprobación</small>
            </div>
            <div className="col-md-3 col-6 mb-2">
              <LwStatusPill tone={QUOTE_STATUS_TONE.accepted}>{QUOTE_STATUS_LABEL.accepted}</LwStatusPill>
              <small className="d-block text-muted mt-1">Aceptada, en proceso</small>
            </div>
            <div className="col-md-3 col-6 mb-2">
              <LwStatusPill tone={QUOTE_STATUS_TONE.converted}>{QUOTE_STATUS_LABEL.converted}</LwStatusPill>
              <small className="d-block text-muted mt-1">Convertida en pedido</small>
            </div>
          </div>
        </div>
      </div>
      </LwSurface>
    </div>
  )
}
