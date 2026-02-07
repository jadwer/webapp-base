'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  useQuotes,
  useQuoteSummary,
  useExpiringSoonQuotes,
  useQuoteMutations,
  type QuoteStatus,
  type QuoteFilters,
  type Quote
} from '@/modules/quotes'
import { formatCurrency } from '@/lib/formatters'
import { toast } from '@/lib/toast'

const STATUS_CONFIG: Record<QuoteStatus, { label: string; badgeClass: string }> = {
  draft: { label: 'Borrador', badgeClass: 'bg-secondary' },
  sent: { label: 'Enviada', badgeClass: 'bg-primary' },
  accepted: { label: 'Aceptada', badgeClass: 'bg-success' },
  rejected: { label: 'Rechazada', badgeClass: 'bg-danger' },
  expired: { label: 'Expirada', badgeClass: 'bg-warning text-dark' },
  converted: { label: 'Convertida', badgeClass: 'bg-info' },
  cancelled: { label: 'Cancelada', badgeClass: 'bg-dark' }
}

export default function QuotesPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<QuoteFilters>({})
  const [searchTerm, setSearchTerm] = useState('')

  const { data: quotesResponse, isLoading: quotesLoading, mutate: refetch } = useQuotes(filters)
  const { data: summary, isLoading: summaryLoading } = useQuoteSummary()
  const { data: expiringSoonResponse } = useExpiringSoonQuotes(7)
  const mutations = useQuoteMutations()

  const quotes = quotesResponse?.data ?? []
  const expiringSoon = expiringSoonResponse?.data ?? []

  // Calculate summary totals
  const summaryData = useMemo(() => {
    if (!summary) return null
    return {
      total: summary.total || 0,
      draft: summary.draft || 0,
      sent: summary.sent || 0,
      accepted: summary.accepted || 0,
      totalValue: summary.totalValue || 0
    }
  }, [summary])

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilters({ ...filters, status: undefined })
    } else {
      setFilters({ ...filters, status: status as QuoteStatus })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ ...filters, search: searchTerm || undefined })
  }

  const handleAction = async (action: string, quote: Quote) => {
    try {
      switch (action) {
        case 'send':
          await mutations.send.mutateAsync(quote.id)
          toast.success('Cotización enviada')
          break
        case 'accept':
          await mutations.accept.mutateAsync(quote.id)
          toast.success('Cotización aceptada')
          break
        case 'reject':
          await mutations.reject.mutateAsync({ id: quote.id })
          toast.success('Cotización rechazada')
          break
        case 'convert':
          await mutations.convert.mutateAsync({ id: quote.id })
          toast.success('Cotización convertida a orden de venta')
          break
        case 'cancel':
          await mutations.cancel.mutateAsync(quote.id)
          toast.success('Cotización cancelada')
          break
        case 'duplicate':
          const result = await mutations.duplicate.mutateAsync(quote.id)
          toast.success('Cotización duplicada')
          router.push(`/dashboard/quotes/${result.data.id}`)
          return
        case 'delete':
          await mutations.delete.mutateAsync(quote.id)
          toast.success('Cotización eliminada')
          break
      }
      refetch()
    } catch (error) {
      toast.error(`Error al ${action === 'send' ? 'enviar' : action === 'delete' ? 'eliminar' : action} la cotización`)
      console.error(error)
    }
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getContactName = (quote: Quote) => {
    if (quote.contact?.name) return quote.contact.name
    return `Cliente #${quote.contactId}`
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-file-text me-3"></i>
                Cotizaciones
              </h1>
              <p className="text-muted">
                Gestiona cotizaciones, modifica precios y convierte a órdenes de venta
              </p>
            </div>
            <div>
              <button
                className="btn btn-primary"
                onClick={() => router.push('/dashboard/quotes/create')}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Nueva Cotización
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {!summaryLoading && summaryData && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card text-white bg-primary">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-white-50">Total Cotizaciones</h6>
                    <h4 className="mb-0">{summaryData.total}</h4>
                  </div>
                  <i className="bi bi-file-text display-6"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-secondary">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-white-50">Borradores</h6>
                    <h4 className="mb-0">{summaryData.draft}</h4>
                  </div>
                  <i className="bi bi-pencil display-6"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-info">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-white-50">Enviadas</h6>
                    <h4 className="mb-0">{summaryData.sent}</h4>
                  </div>
                  <i className="bi bi-send display-6"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-success">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-white-50">Valor Total Activas</h6>
                    <h4 className="mb-0">{formatCurrency(summaryData.totalValue)}</h4>
                  </div>
                  <i className="bi bi-currency-dollar display-6"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expiring Soon Alert */}
      {expiringSoon.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-warning d-flex align-items-center">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <div>
                <strong>Cotizaciones por vencer:</strong> Tienes {expiringSoon.length} cotización(es) que vencen en los próximos 7 días.
                <button
                  className="btn btn-link btn-sm p-0 ms-2"
                  onClick={() => setFilters({ ...filters, expiringWithinDays: 7 })}
                >
                  Ver todas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-5">
          <form onSubmit={handleSearch}>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por número, cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn btn-outline-secondary">
                Buscar
              </button>
            </div>
          </form>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filters.status || 'all'}
            onChange={(e) => handleStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="sent">Enviada</option>
            <option value="accepted">Aceptada</option>
            <option value="rejected">Rechazada</option>
            <option value="expired">Expirada</option>
            <option value="converted">Convertida</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
        <div className="col-md-4">
          <div className="d-flex gap-2 justify-content-end">
            {(filters.search || filters.status || filters.expiringWithinDays) && (
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setFilters({})
                  setSearchTerm('')
                }}
              >
                <i className="bi bi-x-circle me-1"></i>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Lista de Cotizaciones
                {quotes.length > 0 && (
                  <span className="badge bg-primary ms-2">{quotes.length}</span>
                )}
              </h5>
            </div>
            <div className="card-body p-0">
              {quotesLoading && (
                <div className="d-flex justify-content-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando cotizaciones...</span>
                  </div>
                </div>
              )}

              {!quotesLoading && (
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>Cotización</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Vigencia</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center text-muted py-4">
                            <i className="bi bi-inbox display-4 text-muted mb-3 d-block"></i>
                            <h6>No hay cotizaciones</h6>
                            <p className="mb-0">
                              Crea tu primera cotización haciendo clic en &quot;Nueva Cotización&quot;
                            </p>
                          </td>
                        </tr>
                      ) : (
                        quotes.map((quote) => (
                          <tr key={quote.id}>
                            <td>
                              <strong className="text-primary">{quote.quoteNumber}</strong>
                              <br />
                              <small className="text-muted">ID: {quote.id}</small>
                            </td>
                            <td>
                              <div>
                                <strong>{getContactName(quote)}</strong>
                                {quote.contact?.email && (
                                  <>
                                    <br />
                                    <small className="text-muted">{quote.contact.email}</small>
                                  </>
                                )}
                              </div>
                            </td>
                            <td>{formatDate(quote.quoteDate)}</td>
                            <td>
                              {quote.validUntil ? (
                                <span className={new Date(quote.validUntil) < new Date() ? 'text-danger' : ''}>
                                  {formatDate(quote.validUntil)}
                                </span>
                              ) : '-'}
                            </td>
                            <td>
                              <span className="badge bg-light text-dark">
                                {quote.itemsCount || 0} items
                              </span>
                            </td>
                            <td>
                              <strong className="text-success">
                                {formatCurrency(quote.totalAmount || 0)}
                              </strong>
                            </td>
                            <td>
                              <span className={`badge ${STATUS_CONFIG[quote.status]?.badgeClass || 'bg-secondary'}`}>
                                {STATUS_CONFIG[quote.status]?.label || quote.status}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}
                                  title="Ver detalle"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>

                                {/* Dropdown for more actions */}
                                <div className="btn-group btn-group-sm" role="group">
                                  <button
                                    type="button"
                                    className="btn btn-outline-secondary dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    <i className="bi bi-three-dots-vertical"></i>
                                  </button>
                                  <ul className="dropdown-menu dropdown-menu-end">
                                    {quote.status === 'draft' && (
                                      <>
                                        <li>
                                          <button
                                            className="dropdown-item"
                                            onClick={() => router.push(`/dashboard/quotes/${quote.id}/edit`)}
                                          >
                                            <i className="bi bi-pencil me-2"></i>
                                            Editar
                                          </button>
                                        </li>
                                        <li>
                                          <button
                                            className="dropdown-item"
                                            onClick={() => handleAction('send', quote)}
                                          >
                                            <i className="bi bi-send me-2"></i>
                                            Enviar al cliente
                                          </button>
                                        </li>
                                      </>
                                    )}
                                    {quote.status === 'sent' && (
                                      <>
                                        <li>
                                          <button
                                            className="dropdown-item text-success"
                                            onClick={() => handleAction('accept', quote)}
                                          >
                                            <i className="bi bi-check-circle me-2"></i>
                                            Marcar como aceptada
                                          </button>
                                        </li>
                                        <li>
                                          <button
                                            className="dropdown-item text-danger"
                                            onClick={() => handleAction('reject', quote)}
                                          >
                                            <i className="bi bi-x-circle me-2"></i>
                                            Marcar como rechazada
                                          </button>
                                        </li>
                                      </>
                                    )}
                                    {quote.status === 'accepted' && (
                                      <li>
                                        <button
                                          className="dropdown-item text-primary"
                                          onClick={() => handleAction('convert', quote)}
                                        >
                                          <i className="bi bi-arrow-right-circle me-2"></i>
                                          Convertir a orden de venta
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
                                    {['draft', 'sent'].includes(quote.status) && (
                                      <li>
                                        <button
                                          className="dropdown-item text-warning"
                                          onClick={() => handleAction('cancel', quote)}
                                        >
                                          <i className="bi bi-slash-circle me-2"></i>
                                          Cancelar
                                        </button>
                                      </li>
                                    )}
                                    {quote.status === 'draft' && (
                                      <li>
                                        <button
                                          className="dropdown-item text-danger"
                                          onClick={() => handleAction('delete', quote)}
                                        >
                                          <i className="bi bi-trash me-2"></i>
                                          Eliminar
                                        </button>
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
