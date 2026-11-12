'use client'

import { use, useState, useRef, useEffect, useMemo, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  useQuote,
  useQuoteItems,
  useQuoteMutations,
  QuoteItemsTable,
  QuoteSendModal,
  QuoteRejectModal,
  GenerateSaleModal,
  GenerateOrderModal,
  QUOTE_STATUS_TONE,
  QUOTE_STATUS_LABEL,
  exportQuoteItemsCsv,
  QUOTE_STATUS_CONFIG,
  canEditQuote,
  formatDateOnly
} from '@/modules/quotes'
import type { PaymentMethod } from '@/modules/quotes'
import { quoteService } from '@/modules/quotes'
import { extractApiErrorMessage } from '@/modules/products'
import { useSalesOrderBillingMutations } from '@/modules/billing'
import { useSuppliers } from '@/modules/contacts'
import { toast } from '@/lib/toast'
import { ConfirmModal, ConfirmModalHandle } from '@/ui/components/base'
import { useAuth } from '@/modules/auth'
import { isAdmin } from '@/lib/permissions'
import { isPastDateOnly, LwSurface, LwPageTitle, LwStatusPill, LwActionMenu, LwTableWrap, type LwActionMenuItem } from '@lwm/ui'
import { useUsers } from '@lwm/permissions'
import { GuidePanel, type GuideAction } from '@lwm/guide'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function QuoteDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const mutations = useQuoteMutations()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)
  const { prefacturaFromOrder } = useSalesOrderBillingMutations()

  const { user } = useAuth()
  const userIsAdmin = isAdmin(user ?? null)

  const { data: quote, isLoading: quoteLoading, error: quoteError, mutate: refetch } = useQuote(id)
  const { data: items = [], mutate: refetchItems } = useQuoteItems(id)

  const searchParams = useSearchParams()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingValidUntil, setEditingValidUntil] = useState('')
  const [editingTerms, setEditingTerms] = useState('')
  const [editingSeller, setEditingSeller] = useState('')
  const [editingEta, setEditingEta] = useState('')
  const [editingNotes, setEditingNotes] = useState('')
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<'' | PaymentMethod>('')
  const [editingCreditDays, setEditingCreditDays] = useState('')
  const [pdfLoading, setPdfLoading] = useState<'download' | 'preview' | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  // Fase A: modal de conversion abierto (venta directa vs pedido)
  const [convertModalType, setConvertModalType] = useState<'sale' | 'order' | null>(null)
  // Generar Orden de Compra: el backend exige proveedor (supplier_id), asi que
  // el modal pide seleccionar un proveedor antes de disparar la llamada.
  const [poModalOpen, setPoModalOpen] = useState(false)
  const [poSupplierId, setPoSupplierId] = useState('')
  const [poError, setPoError] = useState('')
  const [poSubmitting, setPoSubmitting] = useState(false)
  // Flujo guiado (F4): la barra enruta cada accion al manejador de esta pagina.
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const { contacts: suppliers = [], isLoading: suppliersLoading } = useSuppliers()
  const { users = [] } = useUsers({}, 1, 200)
  const sellers = useMemo(
    () => users.filter((u) => !u.roles?.some((r) => ['customer', 'cliente', 'guest'].includes(r.name))),
    [users]
  )

  const formatCurrency = (amount: number, currency: string = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency
    }).format(amount)
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const handleAction = async (action: 'accept' | 'cancel' | 'duplicate' | 'recalculate-taxes') => {
    if (!quote) return

    try {
      switch (action) {
        case 'accept':
          await mutations.accept.mutateAsync(quote.id)
          toast.success('Cotización marcada como aceptada')
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
        case 'recalculate-taxes': {
          const recalculated = await mutations.recalculateTaxes.mutateAsync(quote.id)
          toast.success(recalculated.message)
          break
        }
      }
      refetch()
    } catch (err) {
      // Regla 7: rechazo del backend con su detalle, nunca toast generico
      toast.error(extractApiErrorMessage(err, 'Error al ejecutar la acción'))
    }
  }

  const handleConverted = (salesOrderId: string) => {
    setConvertModalType(null)
    router.push(`/dashboard/sales/${salesOrderId}`)
  }

  const handleReject = async (reason: string) => {
    if (!quote) return

    try {
      await mutations.reject.mutateAsync({
        id: quote.id,
        data: reason ? { reason } : undefined
      })
      toast.success('Cotización marcada como rechazada')
      setRejectOpen(false)
      refetch()
    } catch (err) {
      toast.error(extractApiErrorMessage(err, 'Error al rechazar la cotización'))
    }
  }

  const handleStartEdit = () => {
    if (!quote) return
    setEditingEta(quote.estimatedEta ?? '')
    setEditingNotes(quote.notes ?? '')
    setEditingPaymentMethod(quote.paymentMethod ?? '')
    setEditingCreditDays(quote.creditDays != null ? String(quote.creditDays) : '')
    setEditingValidUntil(quote.validUntil ? quote.validUntil.slice(0, 10) : '')
    setEditingTerms(quote.termsAndConditions ?? '')
    setEditingSeller(quote.assignedTo != null ? String(quote.assignedTo) : '')
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!quote) return

    if (editingCreditDays !== '') {
      const days = Number(editingCreditDays)
      if (!Number.isFinite(days) || days < 0) {
        toast.error('Días de crédito inválidos')
        return
      }
    }

    try {
      await mutations.update.mutateAsync({
        id: quote.id,
        data: {
          estimatedEta: editingEta || undefined,
          notes: editingNotes || undefined,
          paymentMethod: editingPaymentMethod === '' ? null : editingPaymentMethod,
          creditDays: editingCreditDays === '' ? null : Number(editingCreditDays),
          validUntil: editingValidUntil || undefined,
          termsAndConditions: editingTerms || undefined,
          assignedTo: editingSeller === '' ? null : Number(editingSeller)
        }
      })
      toast.success('Cotización actualizada')
      setIsEditing(false)
      refetch()
    } catch (err) {
      toast.error(extractApiErrorMessage(err, 'Error al actualizar la cotización'))
    }
  }

  const handleDownloadPdf = async () => {
    if (!quote) return
    setPdfLoading('download')
    try {
      await quoteService.downloadPdf(quote.id)
      toast.success('PDF descargado')
    } catch {
      toast.error('Error al descargar el PDF')
    } finally {
      setPdfLoading(null)
    }
  }

  const handlePreviewPdf = async () => {
    if (!quote) return
    setPdfLoading('preview')
    try {
      await quoteService.previewPdf(quote.id)
    } catch {
      toast.error('Error al generar vista previa del PDF')
    } finally {
      setPdfLoading(null)
    }
  }

  // Prefactura de la orden generada (disponible tras convertir la cotizacion)
  const handlePrefactura = async () => {
    if (!quote?.salesOrderId) return
    setActionLoading('prefactura')
    try {
      const blob = await prefacturaFromOrder(String(quote.salesOrderId))
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch {
      toast.error('Error al generar la prefactura')
    } finally {
      setActionLoading(null)
    }
  }

  // Exportar partidas CSV (client-side, desde los items ya cargados)
  const handleExportCsv = () => {
    if (!quote) return
    if (items.length === 0) {
      toast.error('La cotización no tiene partidas para exportar')
      return
    }
    exportQuoteItemsCsv(quote.quoteNumber, items)
    toast.success('Partidas exportadas')
  }

  const handleOpenPurchaseOrderModal = () => {
    setPoSupplierId('')
    setPoError('')
    setPoModalOpen(true)
  }

  const handleGeneratePurchaseOrder = async () => {
    if (!quote) return
    if (!poSupplierId) {
      setPoError('Selecciona un proveedor')
      return
    }
    setPoError('')
    setPoSubmitting(true)
    try {
      const result = await quoteService.generatePurchaseOrder(quote.id, poSupplierId)
      toast.success(result.message || 'Orden de compra generada')
      setPoModalOpen(false)
      refetch()
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { message?: string; error?: string } } }
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Error al generar la orden de compra'
      )
    } finally {
      setPoSubmitting(false)
    }
  }

  // Abrir directo en edicion desde el lapiz del listado (?editar=1)
  useEffect(() => {
    if (quote && searchParams.get('editar') === '1' && canEditQuote(quote, userIsAdmin) && !isEditing) {
      handleStartEdit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote?.id])

  if (quoteLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando cotización...</span>
          </div>
        </div>
      </div>
    )
  }

  if (quoteError || !quote) {
    return (
      <div className="container-fluid py-4">
        <LwSurface className="text-center py-5">
          <i className="bi bi-file-earmark-x display-4 text-muted mb-3 d-block"></i>
          <h2 className="h5">Cotización no encontrada</h2>
          <p className="text-muted">La cotización que buscas no existe o fue eliminada.</p>
          <button className="btn btn-primary mt-3" onClick={() => router.push('/dashboard/quotes')}>
            <i className="bi bi-arrow-left me-2"></i>
            Volver a cotizaciones
          </button>
        </LwSurface>
      </div>
    )
  }

  const statusConfig = QUOTE_STATUS_CONFIG[quote.status]
  const isExpired = quote.validUntil && isPastDateOnly(quote.validUntil)
  const editable = canEditQuote(quote, userIsAdmin)
  const dateLong = (d?: string | null) => (d ? formatDateOnly(d, 'es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '')
  const paymentLabel = quote.paymentMethod === 'PUE' ? 'PUE - Pago en una exhibición' : quote.paymentMethod === 'PPD' ? 'PPD - Pago en parcialidades o diferido' : 'No especificado'
  const statusLine = (() => {
    const who = quote.contact?.name || `Cliente #${quote.contactId}`
    switch (quote.status) {
      case 'draft': return `Borrador para ${who}, creada el ${dateLong(quote.createdAt)}`
      case 'sent': return `Enviada a ${who}${quote.sentAt ? ` el ${dateLong(quote.sentAt)}` : ''}`
      case 'accepted': return `Aceptada por ${who}${quote.acceptedAt ? ` el ${dateLong(quote.acceptedAt)}` : ''}; lista para convertir`
      case 'converted': return `Convertida en pedido${quote.convertedAt ? ` el ${dateLong(quote.convertedAt)}` : ''}`
      case 'rejected': return `Rechazada por ${who}${quote.rejectedAt ? ` el ${dateLong(quote.rejectedAt)}` : ''}`
      case 'expired': return `Vencida; duplícala para renovar la vigencia`
      case 'cancelled': return `Cancelada`
      default: return who
    }
  })()

  // La barra de la guia no inventa formularios (D10): cada accion abre el modal
  // o el manejador que ya existe en esta pagina. Devuelve true si la tomo.
  const handleGuideAction = (action: GuideAction): boolean => {
    switch (action.key) {
      case 'sales::guide.quote.send':
        setSendModalOpen(true)
        return true
      case 'sales::guide.quote.accept':
      case 'sales::guide.quote.accept_direct':
        void handleAction('accept')
        return true
      case 'sales::guide.quote.reject':
        setRejectOpen(true)
        return true
      case 'sales::guide.quote.convert':
        setConvertModalType('order')
        return true
      case 'sales::guide.quote.cancel':
        void handleAction('cancel')
        return true
      case 'sales::guide.quote.duplicate':
        void handleAction('duplicate')
        return true
      case 'sales::guide.quote.confirm_price':
        if (!isEditing && editable) handleStartEdit()
        document.getElementById('quote-items')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        toast.info('Captura el precio de venta en las partidas con precio por confirmar.')
        return true
      default:
        return false
    }
  }

  // "Operaciones": todas las acciones del documento, segun su estado (nada se esconde
  // sin decir por que: lo que no aplica queda deshabilitado con su motivo).
  const operations: LwActionMenuItem[] = [
    ...(statusConfig.canAccept
      ? [{ key: 'accept', label: quote.status === 'draft' ? 'Marcar aceptada (teléfono o mostrador)' : 'Marcar aceptada', icon: 'bi-check-circle', onSelect: () => void handleAction('accept') }]
      : []),
    ...(statusConfig.canReject ? [{ key: 'reject', label: 'Rechazar', icon: 'bi-x-circle', onSelect: () => setRejectOpen(true) }] : []),
    {
      key: 'generate-order',
      label: 'Generar pedido',
      icon: 'bi-clipboard-check',
      onSelect: () => setConvertModalType('order'),
      disabled: !statusConfig.canConvert,
      hint: statusConfig.canConvert ? undefined : 'Solo cotizaciones aceptadas.',
      divider: true,
    },
    {
      key: 'generate-sale',
      label: 'Generar venta directa',
      icon: 'bi-cash-coin',
      onSelect: () => setConvertModalType('sale'),
      disabled: !statusConfig.canConvert,
      hint: statusConfig.canConvert ? undefined : 'Solo cotizaciones aceptadas; requiere existencia.',
    },
    {
      key: 'purchase-order',
      label: 'Generar orden de compra',
      icon: 'bi-box-seam',
      onSelect: handleOpenPurchaseOrderModal,
      disabled: quote.status !== 'accepted' || !!quote.purchaseOrderId,
      hint: quote.purchaseOrderId ? 'Ya tiene orden de compra.' : quote.status !== 'accepted' ? 'Solo cotizaciones aceptadas.' : undefined,
    },
    {
      key: 'prefactura',
      label: 'Prefactura',
      icon: 'bi-file-earmark-medical',
      onSelect: () => void handlePrefactura(),
      disabled: !quote.salesOrderId || actionLoading === 'prefactura',
      hint: quote.salesOrderId ? undefined : 'Disponible cuando haya pedido generado.',
    },
    {
      key: 'send',
      label: 'Enviar al cliente',
      icon: 'bi-send',
      onSelect: () => setSendModalOpen(true),
      disabled: !statusConfig.canSend,
      hint: statusConfig.canSend ? undefined : 'Solo borradores con partidas.',
      divider: true,
    },
    { key: 'duplicate', label: 'Duplicar', icon: 'bi-copy', onSelect: () => void handleAction('duplicate') },
    {
      key: 'recalculate-taxes',
      label: 'Recalcular impuestos',
      icon: 'bi-percent',
      onSelect: () => void handleAction('recalculate-taxes'),
      disabled: quote.status !== 'draft',
      hint: quote.status === 'draft' ? undefined : 'Solo cotizaciones en borrador.',
    },
    { key: 'export-csv', label: 'Exportar partidas CSV', icon: 'bi-filetype-csv', onSelect: handleExportCsv },
    ...(statusConfig.canCancel
      ? [{ key: 'cancel', label: 'Cancelar cotización', icon: 'bi-slash-circle', danger: true, divider: true, onSelect: () => void handleAction('cancel') }]
      : []),
  ]

  const field = (label: string, value: ReactNode, col = 'col-md-3') => (
    <div className={col}>
      <label className="form-label">{label}</label>
      <div className="form-control" style={{ background: '#f6f7f9' }}>{value || <span className="text-muted">No especificado</span>}</div>
    </div>
  )

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <LwPageTitle
          title={isEditing ? 'Editar cotización:' : 'Consulta cotización:'}
          highlight={quote.quoteNumber}
          subtitle={
            <span className="d-inline-flex align-items-center gap-2 flex-wrap">
              <LwStatusPill tone={QUOTE_STATUS_TONE[quote.status] ?? 'neutral'}>{QUOTE_STATUS_LABEL[quote.status] ?? quote.status}</LwStatusPill>
              {isEditing ? 'Cambia vigencia, condiciones o partidas' : statusLine}
            </span>
          }
          actions={
            <>
              <button aria-label="Volver" className="btn btn-outline-primary" onClick={() => router.push('/dashboard/quotes')}>
                <i className="bi bi-arrow-left me-1"></i> Volver
              </button>
              {editable && !isEditing ? (
                <button className="btn btn-outline-primary" onClick={handleStartEdit}>
                  <i className="bi bi-pencil me-1"></i> Editar
                </button>
              ) : null}
              <LwActionMenu
                items={operations}
                triggerClassName="btn btn-primary"
                trigger={<span>{actionLoading === 'prefactura' ? 'Generando...' : 'Operaciones'} <i className="bi bi-chevron-down ms-1" aria-hidden="true" /></span>}
              />
            </>
          }
        />

        <GuidePanel
          type="quotes"
          id={quote.id}
          revision={`${quote.status}:${quote.updatedAt}`}
          onAction={handleGuideAction}
          onDone={() => {
            refetch()
            refetchItems()
          }}
        />

        <h2 className="h5 mb-3">Información general</h2>
        <div className="row g-3 mb-4">
          {field('Cliente', quote.contact?.name || `Cliente #${quote.contactId}`, 'col-md-4')}
          {field('Correo', quote.contact?.email, 'col-md-4')}
          {field('Fecha de cotización', dateLong(quote.quoteDate), 'col-md-2')}
          {isEditing ? (
            <div className="col-md-2">
              <label className="form-label" htmlFor="q-seller">Vendedor</label>
              <select id="q-seller" className="form-select" value={editingSeller} onChange={(e) => setEditingSeller(e.target.value)}>
                <option value="">Sin asignar</option>
                {quote.assignedTo != null && !sellers.some((u) => String(u.id) === String(quote.assignedTo)) ? (
                  <option value={String(quote.assignedTo)}>{quote.assignedUserName || `Usuario #${quote.assignedTo}`}</option>
                ) : null}
                {sellers.map((u) => (
                  <option key={u.id} value={String(u.id)}>{u.name}</option>
                ))}
              </select>
            </div>
          ) : (
            field('Vendedor', quote.assignedUserName, 'col-md-2')
          )}

          {isEditing ? (
            <>
              <div className="col-md-3">
                <label className="form-label" htmlFor="q-valid">Vigencia</label>
                <input id="q-valid" type="date" className="form-control" value={editingValidUntil} onChange={(e) => setEditingValidUntil(e.target.value)} />
                <div className="form-text">La cotización vence automáticamente después de esta fecha.</div>
              </div>
              <div className="col-md-3">
                <label className="form-label" htmlFor="q-eta">Tiempo de entrega</label>
                <input id="q-eta" type="text" className="form-control" value={editingEta} onChange={(e) => setEditingEta(e.target.value)} placeholder="Ej.: 2 a 3 semanas" />
              </div>
              <div className="col-md-3">
                <label className="form-label" htmlFor="q-payment">Método de pago</label>
                <select id="q-payment" className="form-select" value={editingPaymentMethod} onChange={(e) => setEditingPaymentMethod(e.target.value as '' | PaymentMethod)}>
                  <option value="">Sin especificar</option>
                  <option value="PUE">PUE - Pago en una exhibición</option>
                  <option value="PPD">PPD - Pago en parcialidades o diferido</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label" htmlFor="q-credit">Días de crédito</label>
                <input id="q-credit" type="number" min={0} step={1} className="form-control" value={editingCreditDays} onChange={(e) => setEditingCreditDays(e.target.value)} placeholder="30" />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="q-notes">Notas para el cliente</label>
                <textarea id="q-notes" className="form-control" rows={3} value={editingNotes} onChange={(e) => setEditingNotes(e.target.value)} placeholder="Notas visibles para el cliente" />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="q-terms">Términos y condiciones</label>
                <textarea id="q-terms" className="form-control" rows={3} value={editingTerms} onChange={(e) => setEditingTerms(e.target.value)} placeholder="Términos y condiciones de la cotización" />
              </div>
            </>
          ) : (
            <>
              {field('Vigencia', <span className={isExpired && quote.status === 'sent' ? 'text-danger' : undefined}>{dateLong(quote.validUntil)}{isExpired && quote.status === 'sent' ? ' (vencida)' : ''}</span>)}
              {field('Tiempo de entrega', quote.estimatedEta)}
              {field('Método de pago', paymentLabel)}
              {field('Días de crédito', quote.creditDays != null ? `${quote.creditDays} días` : 'No especificado (30 por omisión)')}
              {field('Notas para el cliente', quote.notes, 'col-md-6')}
              {field('Términos y condiciones', quote.termsAndConditions, 'col-md-6')}
            </>
          )}
        </div>

        <div className="row g-3" id="quote-items">
          <div className="col-lg-9">
            <h2 className="h5 mb-3">Productos ({items.length})</h2>
            <LwTableWrap>
              <QuoteItemsTable
                items={items}
                quoteId={id}
                currency={quote.currency}
                editable={editable}
                onItemsChanged={() => {
                  refetchItems()
                  refetch()
                }}
              />
            </LwTableWrap>
          </div>
          <div className="col-lg-3">
            <div className="card mt-lg-5">
              <div className="card-body">
                <h3 className="h6 mb-3">Resumen de cotización</h3>
                <div className="d-flex justify-content-between small mb-2">
                  <span>Subtotal</span>
                  <span>{formatCurrency(quote.subtotalAmount, quote.currency)}</span>
                </div>
                {quote.discountAmount > 0 ? (
                  <div className="d-flex justify-content-between small mb-2 text-success">
                    <span>Descuento</span>
                    <span>-{formatCurrency(quote.discountAmount, quote.currency)}</span>
                  </div>
                ) : null}
                <div className="d-flex justify-content-between small mb-2">
                  <span>IVA</span>
                  <span>{formatCurrency(quote.taxAmount, quote.currency)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between align-items-baseline">
                  <span>Total:</span>
                  <span className="fs-5" style={{ color: 'var(--brand-primary, #8ac905)' }}>{formatCurrency(quote.totalAmount, quote.currency)}</span>
                </div>
                <div className="small text-muted text-end mt-1">{quote.itemsCount} producto(s), {quote.totalQuantity} unidades</div>
                {quote.salesOrderId ? (
                  <button className="btn btn-outline-success w-100 mt-3" onClick={() => router.push(`/dashboard/sales/${quote.salesOrderId}`)}>
                    <i className="bi bi-receipt me-1"></i> Ver pedido {quote.salesOrder?.orderNumber || `#${quote.salesOrderId}`}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4 flex-wrap">
          {isEditing ? (
            <>
              <button className="btn btn-outline-primary" onClick={() => setIsEditing(false)} disabled={mutations.update.isPending}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveEdit} disabled={mutations.update.isPending}>
                {mutations.update.isPending ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-outline-primary" onClick={handlePreviewPdf} disabled={pdfLoading === 'preview'}>
                {pdfLoading === 'preview' ? 'Generando...' : 'Vista previa PDF'}
              </button>
              <button className="btn btn-primary" onClick={handleDownloadPdf} disabled={pdfLoading === 'download'}>
                {pdfLoading === 'download' ? 'Descargando...' : 'Descargar PDF'}
              </button>
            </>
          )}
        </div>
      </LwSurface>

      <QuoteRejectModal
        quote={rejectOpen ? quote : null}
        busy={mutations.reject.isPending}
        onClose={() => setRejectOpen(false)}
        onConfirm={(reason) => void handleReject(reason)}
      />

      <QuoteSendModal
        quote={quote}
        show={sendModalOpen}
        onHide={() => setSendModalOpen(false)}
        onSent={() => {
          setSendModalOpen(false)
          refetch()
        }}
      />

      {/* Modales de conversion (Fase A: venta directa vs pedido) */}
      <GenerateSaleModal
        quote={quote}
        isOpen={convertModalType === 'sale'}
        onClose={() => setConvertModalType(null)}
        onConverted={handleConverted}
      />
      <GenerateOrderModal
        quote={quote}
        isOpen={convertModalType === 'order'}
        onClose={() => setConvertModalType(null)}
        onConverted={handleConverted}
      />
      {/* Modal Generar Orden de Compra: requiere seleccionar proveedor */}
      {poModalOpen && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-box-seam me-2"></i>
                  Generar Orden de Compra
                </h5>
                <button
                  aria-label="Cerrar"
                  type="button"
                  className="btn-close"
                  onClick={() => setPoModalOpen(false)}
                  disabled={poSubmitting}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-muted small">
                  Se creara una orden de compra para los productos de esta cotización.
                  Selecciona el proveedor al que se solicitara el material.
                </p>
                <label className="form-label" htmlFor="po-supplier">
                  Proveedor <span className="text-danger">*</span>
                </label>
                <select
                  id="po-supplier"
                  className={`form-select${poError ? ' is-invalid' : ''}`}
                  value={poSupplierId}
                  onChange={(e) => {
                    setPoSupplierId(e.target.value)
                    if (poError) setPoError('')
                  }}
                  disabled={poSubmitting || suppliersLoading}
                >
                  <option value="">
                    {suppliersLoading ? 'Cargando proveedores...' : 'Selecciona un proveedor'}
                  </option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.displayName || supplier.name}
                    </option>
                  ))}
                </select>
                {poError && <div className="invalid-feedback d-block">{poError}</div>}
                {!suppliersLoading && suppliers.length === 0 && (
                  <div className="form-text text-warning">
                    No hay proveedores registrados. Registra un contacto tipo proveedor primero.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setPoModalOpen(false)}
                  disabled={poSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGeneratePurchaseOrder}
                  disabled={poSubmitting || suppliersLoading || !poSupplierId}
                >
                  {poSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Generando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-seam me-2"></i>
                      Generar OC
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}
