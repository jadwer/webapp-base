'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LwSurface,
  LwPageTitle,
  LwKpiCard,
  LwStatusPill,
  LwCountPill,
  LwTableWrap,
  LwIconButton,
  LwActionMenu,
  LwPagination,
  LwResultModal,
  type LwActionMenuItem,
  toast,
  formatCurrency,
  isPastDateOnly,
  formatDateOnly,
} from '@lwm/ui'
import { BranchFilter, useBranchName, useAuth, isAdmin as isAdminUser } from '@lwm/auth'
import { extractApiErrorMessage } from '@lwm/products'
import { useQuotes, useQuoteSummary, useExpiringSoonQuotes, useQuoteMutations } from '../hooks'
import { quoteService } from '../services'
import type { Quote, QuoteFilters, QuoteStatus } from '../types'
import { QuoteSendModal } from './QuoteSendModal'
import { GenerateOrderModal } from './GenerateOrderModal'
import { GenerateSaleModal } from './GenerateSaleModal'
import { QuoteRejectModal } from './QuoteRejectModal'
import { QUOTE_STATUS_LABEL, QUOTE_STATUS_TONE, quoteAbilities } from './quoteStatusUi'

const STATUS_ORDER: QuoteStatus[] = ['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted', 'cancelled']

const fmtDate = (d?: string | null) =>
  d ? formatDateOnly(d, 'es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-'

/**
 * Listado de cotizaciones del rediseno 12-11 (Figma "Rediseno Labor wasser").
 * Conserva todo lo que hacia la pantalla anterior: indicadores, busqueda,
 * estatus, sucursal, alerta de por vencer, y el menu por estado con aceptar,
 * rechazar, convertir (con su modal), enviar (con destinatarios), duplicar,
 * PDF, cancelar y eliminar (solo borrador).
 */
export function QuotesListPage() {
  const router = useRouter()
  const { user } = useAuth()
  const admin = isAdminUser(user ?? null)
  const branchName = useBranchName()
  const [filters, setFilters] = useState<QuoteFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [sendFor, setSendFor] = useState<Quote | null>(null)
  const [rejectFor, setRejectFor] = useState<Quote | null>(null)
  const [convertFor, setConvertFor] = useState<{ quote: Quote; type: 'order' | 'sale' } | null>(null)
  const [deleteFor, setDeleteFor] = useState<Quote | null>(null)
  const [busy, setBusy] = useState(false)

  const { data: quotesResponse, isLoading, mutate: refetch } = useQuotes(filters, undefined, page, perPage)
  const { data: summary, isLoading: summaryLoading } = useQuoteSummary()
  const { data: expiringResponse } = useExpiringSoonQuotes(7)
  const mutations = useQuoteMutations()

  const quotes = quotesResponse?.data ?? []
  const meta = quotesResponse?.meta
  const expiringCount = expiringResponse?.data?.length ?? 0
  const hasFilters = !!(filters.search || filters.status || filters.expiringWithinDays || filters.branchId)

  const kpis = useMemo(() => {
    const s = summary
    return {
      total: s?.total ?? 0,
      pending: (s?.draft ?? 0) + (s?.sent ?? 0),
      toConvert: s?.accepted ?? 0,
      value: s?.totalValue ?? 0,
      rate: s?.conversionRate ?? 0,
      draft: s?.draft ?? 0,
      sent: s?.sent ?? 0,
    }
  }, [summary])

  const setFilter = (next: QuoteFilters) => {
    setFilters(next)
    setPage(1)
  }

  const fail = (err: unknown, base: string) => toast.error(extractApiErrorMessage(err, base))

  const run = async (fn: () => Promise<unknown>, ok: string, base: string) => {
    setBusy(true)
    try {
      await fn()
      toast.success(ok)
      await refetch()
      return true
    } catch (err) {
      fail(err, base)
      return false
    } finally {
      setBusy(false)
    }
  }

  const menuFor = (quote: Quote): LwActionMenuItem[] => {
    const can = quoteAbilities(quote, admin)
    const items: LwActionMenuItem[] = []
    if (can.send) items.push({ key: 'send', label: 'Enviar al cliente', icon: 'bi-send', onSelect: () => setSendFor(quote) })
    if (can.accept) {
      items.push({
        key: 'accept',
        label: quote.status === 'draft' ? 'Marcar aceptada (teléfono o mostrador)' : 'Marcar aceptada',
        icon: 'bi-check-circle',
        onSelect: () => void run(() => mutations.accept.mutateAsync(quote.id), 'Cotización marcada como aceptada', 'No se pudo aceptar la cotización'),
      })
    }
    if (can.reject) items.push({ key: 'reject', label: 'Rechazar', icon: 'bi-x-circle', onSelect: () => setRejectFor(quote) })
    if (can.convert) {
      items.push({ key: 'order', label: 'Generar pedido', icon: 'bi-cart-check', onSelect: () => setConvertFor({ quote, type: 'order' }) })
      items.push({ key: 'sale', label: 'Generar venta directa', icon: 'bi-bag-check', onSelect: () => setConvertFor({ quote, type: 'sale' }) })
    }
    if (quote.salesOrderId) {
      items.push({ key: 'order-link', label: 'Ver pedido generado', icon: 'bi-box-arrow-up-right', onSelect: () => router.push(`/dashboard/sales/${quote.salesOrderId}`) })
    }
    items.push({
      key: 'duplicate',
      label: 'Duplicar',
      icon: 'bi-copy',
      divider: true,
      onSelect: async () => {
        setBusy(true)
        try {
          const result = await mutations.duplicate.mutateAsync(quote.id)
          toast.success('Cotización duplicada')
          router.push(`/dashboard/quotes/${result.data.id}`)
        } catch (err) {
          fail(err, 'No se pudo duplicar la cotización')
        } finally {
          setBusy(false)
        }
      },
    })
    items.push({
      key: 'pdf',
      label: 'Descargar PDF',
      icon: 'bi-file-earmark-pdf',
      onSelect: () => quoteService.downloadPdf(quote.id).catch((err) => fail(err, 'No se pudo descargar el PDF')),
    })
    if (can.cancel) {
      items.push({
        key: 'cancel',
        label: 'Cancelar',
        icon: 'bi-slash-circle',
        onSelect: () => void run(() => mutations.cancel.mutateAsync(quote.id), 'Cotización cancelada', 'No se pudo cancelar la cotización'),
      })
    }
    items.push({
      key: 'delete',
      label: 'Eliminar',
      icon: 'bi-trash',
      danger: true,
      disabled: !can.delete,
      hint: can.delete ? undefined : 'Solo un borrador se elimina; lo enviado se cancela.',
      onSelect: () => setDeleteFor(quote),
    })
    return items
  }

  const colSpan = branchName.multi ? 12 : 11

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <LwPageTitle title="Cotizaciones" subtitle="Administra cotizaciones, modifica precios y convierte a órdenes de venta" />

        <div className="row g-3 mb-4">
          <div className="col-6 col-lg-3">
            <LwKpiCard highlight label="Total cotizaciones" value={kpis.total} icon="bi-clipboard-data" isLoading={summaryLoading} onClick={() => setFilter({})} />
          </div>
          <div className="col-6 col-lg-3">
            <LwKpiCard
              label="Por atender"
              value={kpis.pending}
              icon="bi-pencil-square"
              hint={`${kpis.draft} borradores, ${kpis.sent} enviadas`}
              isLoading={summaryLoading}
            />
          </div>
          <div className="col-6 col-lg-3">
            <LwKpiCard
              label="Aceptadas por convertir"
              value={kpis.toConvert}
              icon="bi-check2-square"
              isLoading={summaryLoading}
              onClick={() => setFilter({ ...filters, status: 'accepted' })}
            />
          </div>
          <div className="col-6 col-lg-3">
            <LwKpiCard
              label="Valor total activas"
              value={formatCurrency(kpis.value)}
              icon="bi-currency-dollar"
              hint={`Conversión: ${kpis.rate}%`}
              isLoading={summaryLoading}
            />
          </div>
        </div>

        {expiringCount > 0 ? (
          <div className="alert alert-warning d-flex align-items-center py-2 small">
            <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
            <span>
              <strong>Por vencer:</strong> {expiringCount} cotización(es) enviadas vencen en los próximos 7 días.
            </span>
            <button type="button" className="btn btn-link btn-sm py-0 ms-2" onClick={() => setFilter({ ...filters, expiringWithinDays: 7 })}>
              Ver todas
            </button>
          </div>
        ) : null}

        <div className="row g-2 align-items-center mb-3">
          <div className="col-md-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setFilter({ ...filters, search: searchTerm.trim() || undefined })
              }}
            >
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search" aria-hidden="true" /></span>
                <input
                  type="search"
                  className="form-control border-start-0"
                  placeholder="Buscar por folio, cliente o vendedor..."
                  aria-label="Buscar cotización"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    if (e.target.value === '' && filters.search) setFilter({ ...filters, search: undefined })
                  }}
                />
              </div>
            </form>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              aria-label="Estatus"
              value={(filters.status as string) || ''}
              onChange={(e) => setFilter({ ...filters, status: (e.target.value || undefined) as QuoteStatus | undefined })}
            >
              <option value="">Todos los estatus</option>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>{QUOTE_STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>
          {branchName.multi ? (
            <div className="col-md-2">
              <BranchFilter className="form-select" value={filters.branchId ?? ''} onChange={(branchId) => setFilter({ ...filters, branchId: branchId || undefined })} />
            </div>
          ) : null}
          <div className="col d-flex justify-content-end gap-2">
            {hasFilters ? (
              <button
                type="button"
                className="btn btn-link btn-sm"
                onClick={() => {
                  setFilter({})
                  setSearchTerm('')
                }}
              >
                Limpiar filtros
              </button>
            ) : null}
            <LwActionMenu
              triggerClassName="btn btn-primary"
              trigger={<span><i className="bi bi-plus-lg me-1" aria-hidden="true" /> Nueva cotización <i className="bi bi-chevron-down ms-1" aria-hidden="true" /></span>}
              items={[
                { key: 'blank', label: 'Desde cero', icon: 'bi-file-earmark-plus', onSelect: () => router.push('/dashboard/quotes/create') },
                { key: 'cart', label: 'Desde un carrito de la tienda', icon: 'bi-cart', onSelect: () => router.push('/dashboard/quotes/create?source=cart') },
              ]}
            />
          </div>
        </div>
        {filters.expiringWithinDays ? (
          <p className="small mb-2">Mostrando solo las que vencen en los próximos {filters.expiringWithinDays} días.</p>
        ) : null}

        <LwTableWrap>
          <table className="table mb-0">
            <thead>
              <tr>
                <th>No</th>
                <th>Cotización</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                {branchName.multi ? <th>Sucursal</th> : null}
                <th>Fecha</th>
                <th>Vigencia</th>
                <th>Productos</th>
                <th>Estatus</th>
                <th className="text-end">Total</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={colSpan} className="text-center py-4">
                    <span className="spinner-border spinner-border-sm text-primary me-2" role="status" aria-hidden="true" />
                    Cargando cotizaciones...
                  </td>
                </tr>
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="text-center text-muted py-4">
                    {hasFilters ? 'Ninguna cotización coincide con los filtros.' : 'Aún no hay cotizaciones. Crea la primera con "Nueva cotización".'}
                  </td>
                </tr>
              ) : (
                quotes.map((quote, i) => {
                  const can = quoteAbilities(quote, admin)
                  const expired = quote.status === 'sent' && isPastDateOnly(quote.validUntil ?? undefined)
                  return (
                    <tr key={quote.id}>
                      <td>{String((page - 1) * perPage + i + 1).padStart(2, '0')}</td>
                      <td>
                        <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none text-nowrap text-reset" onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}>
                          {quote.quoteNumber}
                        </button>
                      </td>
                      <td>{quote.contact?.name || `Cliente #${quote.contactId}`}</td>
                      <td>{quote.assignedUserName || <span className="text-muted">Sin asignar</span>}</td>
                      {branchName.multi ? <td>{branchName.name(quote.branchId)}</td> : null}
                      <td>{fmtDate(quote.quoteDate)}</td>
                      <td className={expired ? 'text-danger' : undefined} title={expired ? 'Vigencia vencida' : undefined}>{fmtDate(quote.validUntil)}</td>
                      <td>
                        <LwCountPill>{quote.itemsCount ?? 0} {quote.itemsCount === 1 ? 'Producto' : 'Productos'}</LwCountPill>
                      </td>
                      <td>
                        <LwStatusPill tone={QUOTE_STATUS_TONE[quote.status] ?? 'neutral'}>{QUOTE_STATUS_LABEL[quote.status] ?? quote.status}</LwStatusPill>
                      </td>
                      <td className="text-end">{formatCurrency(quote.totalAmount ?? 0, quote.currency)}</td>
                      <td className="text-center text-nowrap">
                        <LwIconButton icon="bi-eye" label="Ver cotización" onClick={() => router.push(`/dashboard/quotes/${quote.id}`)} />
                        <LwIconButton
                          icon="bi-pencil"
                          label={can.edit ? 'Editar cotización' : 'No editable en este estatus'}
                          disabled={!can.edit}
                          onClick={() => router.push(`/dashboard/quotes/${quote.id}?editar=1`)}
                        />
                        <LwActionMenu items={menuFor(quote)} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </LwTableWrap>

        <LwPagination
          page={meta?.currentPage ?? page}
          lastPage={meta?.lastPage ?? 1}
          perPage={perPage}
          total={meta?.total}
          onPage={setPage}
          onPerPage={(n) => {
            setPerPage(n)
            setPage(1)
          }}
        />
      </LwSurface>

      {sendFor ? (
        <QuoteSendModal
          quote={sendFor}
          show
          onHide={() => setSendFor(null)}
          onSent={() => {
            setSendFor(null)
            void refetch()
          }}
        />
      ) : null}
      <QuoteRejectModal
        quote={rejectFor}
        busy={busy}
        onClose={() => setRejectFor(null)}
        onConfirm={async (reason) => {
          const q = rejectFor
          if (!q) return
          const ok = await run(() => mutations.reject.mutateAsync({ id: q.id, data: reason ? { reason } : undefined }), 'Cotización rechazada', 'No se pudo rechazar la cotización')
          if (ok) setRejectFor(null)
        }}
      />
      {convertFor?.type === 'order' ? (
        <GenerateOrderModal quote={convertFor.quote} isOpen onClose={() => setConvertFor(null)} onConverted={(id) => router.push(`/dashboard/sales/${id}`)} />
      ) : null}
      {convertFor?.type === 'sale' ? (
        <GenerateSaleModal quote={convertFor.quote} isOpen onClose={() => setConvertFor(null)} onConverted={(id) => router.push(`/dashboard/sales/${id}`)} />
      ) : null}
      <LwResultModal
        open={!!deleteFor}
        tone="danger"
        title="Eliminar cotización"
        message={deleteFor ? `Vas a eliminar ${deleteFor.quoteNumber}. No se podrá recuperar.` : undefined}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        busy={busy}
        onCancel={() => setDeleteFor(null)}
        onConfirm={async () => {
          const q = deleteFor
          if (!q) return
          const ok = await run(() => mutations.delete.mutateAsync(q.id), 'Cotización eliminada', 'No se pudo eliminar la cotización')
          if (ok) setDeleteFor(null)
        }}
      />
    </div>
  )
}
