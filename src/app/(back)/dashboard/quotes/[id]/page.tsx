'use client'

import { use, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  useQuote,
  useQuoteItems,
  useQuoteMutations,
  QuoteStatusBadge,
  QuoteItemsTable,
  QUOTE_STATUS_CONFIG,
  canEditQuote
} from '@/modules/quotes'
import { quoteService } from '@/modules/quotes/services/quoteService'
import { toast } from '@/lib/toast'
import { ConfirmModal, ConfirmModalHandle } from '@/ui/components/base'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function QuoteDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const mutations = useQuoteMutations()
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const { data: quote, isLoading: quoteLoading, error: quoteError, mutate: refetch } = useQuote(id)
  const { data: items = [], mutate: refetchItems } = useQuoteItems(id)

  const [rejectReason, setRejectReason] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editingEta, setEditingEta] = useState('')
  const [editingNotes, setEditingNotes] = useState('')
  const [pdfLoading, setPdfLoading] = useState<'download' | 'preview' | null>(null)

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

  const handleAction = async (action: 'send' | 'accept' | 'cancel' | 'duplicate') => {
    if (!quote) return

    try {
      switch (action) {
        case 'send':
          await mutations.send.mutateAsync(quote.id)
          toast.success('Cotizacion enviada al cliente')
          break
        case 'accept':
          await mutations.accept.mutateAsync(quote.id)
          toast.success('Cotizacion marcada como aceptada')
          break
        case 'cancel':
          await mutations.cancel.mutateAsync(quote.id)
          toast.success('Cotizacion cancelada')
          break
        case 'duplicate':
          const result = await mutations.duplicate.mutateAsync(quote.id)
          toast.success('Cotizacion duplicada')
          router.push(`/dashboard/quotes/${result.data.id}`)
          return
      }
      refetch()
    } catch {
      toast.error('Error al ejecutar la accion')
    }
  }

  const handleConvert = async () => {
    if (!quote) return

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
      const result = await mutations.convert.mutateAsync({ id: quote.id })
      const orderNumber = result.data.salesOrder?.attributes?.orderNumber || result.data.salesOrder?.attributes?.order_number || ''
      const salesOrderId = result.data.salesOrder?.id
      toast.success(`Orden de venta ${orderNumber} creada`)
      if (salesOrderId) {
        router.push(`/dashboard/sales/${salesOrderId}`)
      } else {
        refetch()
      }
    } catch {
      toast.error('Error al convertir la cotizacion')
    }
  }

  const handleReject = async () => {
    if (!quote) return

    try {
      await mutations.reject.mutateAsync({
        id: quote.id,
        data: rejectReason ? { reason: rejectReason } : undefined
      })
      toast.success('Cotizacion marcada como rechazada')
      setRejectReason('')
      refetch()
    } catch {
      toast.error('Error al rechazar la cotizacion')
    }
  }

  const handleStartEdit = () => {
    if (!quote) return
    setEditingEta(quote.estimatedEta ?? '')
    setEditingNotes(quote.notes ?? '')
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!quote) return

    try {
      await mutations.update.mutateAsync({
        id: quote.id,
        data: {
          estimatedEta: editingEta || undefined,
          notes: editingNotes || undefined
        }
      })
      toast.success('Cotizacion actualizada')
      setIsEditing(false)
      refetch()
    } catch {
      toast.error('Error al actualizar la cotizacion')
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

  const handleGeneratePurchaseOrder = async () => {
    if (!quote) return

    const confirmed = await confirmModalRef.current?.confirm(
      'Se creara una orden de compra para los productos de esta cotizacion que no estan en stock.',
      {
        title: 'Generar Orden de Compra',
        confirmText: 'Generar OC',
        cancelText: 'Cancelar',
        confirmVariant: 'primary'
      }
    )

    if (!confirmed) return

    try {
      const result = await quoteService.generatePurchaseOrder(quote.id)
      toast.success(result.message || 'Orden de compra generada')
      refetch()
    } catch {
      toast.error('Error al generar la orden de compra')
    }
  }

  if (quoteLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando cotizacion...</span>
          </div>
        </div>
      </div>
    )
  }

  if (quoteError || !quote) {
    return (
      <div className="container-fluid py-4">
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-file-earmark-x display-4 text-muted mb-3 d-block"></i>
            <h5>Cotizacion no encontrada</h5>
            <p className="text-muted">La cotizacion que buscas no existe o fue eliminada.</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => router.push('/dashboard/quotes')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Volver a cotizaciones
            </button>
          </div>
        </div>
      </div>
    )
  }

  const statusConfig = QUOTE_STATUS_CONFIG[quote.status]
  const isExpired = quote.validUntil && new Date(quote.validUntil) < new Date()

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
          <button
            className="btn btn-outline-secondary"
            onClick={() => router.push('/dashboard/quotes')}
          >
            <i className="bi bi-arrow-left"></i>
          </button>
          <div>
            <h1 className="h3 mb-1">{quote.quoteNumber}</h1>
            <QuoteStatusBadge status={quote.status} />
            <small className="text-muted ms-2">Creada el {formatDate(quote.createdAt)}</small>
          </div>
        </div>
        <div className="btn-group flex-wrap">
          {statusConfig.canAccept && (
            <button
              className="btn btn-outline-success"
              onClick={() => handleAction('accept')}
              disabled={mutations.accept.isPending}
            >
              <i className="bi bi-check-lg me-1"></i>
              Aceptar
            </button>
          )}
          {statusConfig.canReject && (
            <button
              className="btn btn-outline-danger"
              data-bs-toggle="modal"
              data-bs-target="#rejectModal"
            >
              <i className="bi bi-x-lg me-1"></i>
              Rechazar
            </button>
          )}
          <button
            className="btn btn-outline-secondary"
            onClick={() => handleAction('duplicate')}
          >
            <i className="bi bi-copy me-1"></i>
            Duplicar
          </button>
          {statusConfig.canCancel && (
            <button
              className="btn btn-outline-warning"
              onClick={() => handleAction('cancel')}
              disabled={mutations.cancel.isPending}
            >
              <i className="bi bi-x-circle me-1"></i>
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="row">
        {/* Main Content */}
        <div className="col-lg-8">
          {/* Quote Info Card */}
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bi bi-file-earmark-text me-2"></i>
                Informacion de la Cotizacion
              </h5>
              {canEditQuote(quote) && !isEditing && (
                <button className="btn btn-sm btn-outline-primary" onClick={handleStartEdit}>
                  <i className="bi bi-pencil me-1"></i>
                  Editar
                </button>
              )}
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-person text-muted me-3 fs-5"></i>
                    <div>
                      <small className="text-muted d-block">Cliente</small>
                      <strong>{quote.contact?.name || `Contact #${quote.contactId}`}</strong>
                      {quote.contact?.email && (
                        <small className="text-muted d-block">{quote.contact.email}</small>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-calendar text-muted me-3 fs-5"></i>
                    <div>
                      <small className="text-muted d-block">Fecha de Cotizacion</small>
                      <strong>{formatDate(quote.quoteDate)}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-clock text-muted me-3 fs-5"></i>
                    <div>
                      <small className="text-muted d-block">Vigencia</small>
                      <strong className={isExpired && quote.status === 'sent' ? 'text-danger' : ''}>
                        {formatDate(quote.validUntil)}
                        {isExpired && quote.status === 'sent' && ' (Vencida)'}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-truck text-muted me-3 fs-5"></i>
                    <div>
                      <small className="text-muted d-block">Tiempo de Entrega (ETA)</small>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editingEta}
                          onChange={(e) => setEditingEta(e.target.value)}
                          placeholder="Ej: 2-3 semanas"
                        />
                      ) : (
                        <strong>{quote.estimatedEta || 'No especificado'}</strong>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {(quote.notes || isEditing) && (
                <>
                  <hr />
                  <div>
                    <label className="form-label small text-muted">Notas</label>
                    {isEditing ? (
                      <textarea
                        className="form-control"
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        placeholder="Notas para el cliente..."
                        rows={3}
                      />
                    ) : (
                      <p className="mb-0">{quote.notes}</p>
                    )}
                  </div>
                </>
              )}

              {isEditing && (
                <div className="d-flex gap-2 justify-content-end mt-3">
                  <button className="btn btn-outline-secondary" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveEdit}
                    disabled={mutations.update.isPending}
                  >
                    {mutations.update.isPending ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-box-seam me-2"></i>
                Productos ({items.length})
              </h5>
            </div>
            <div className="card-body p-0">
              <QuoteItemsTable
                items={items}
                quoteId={id}
                currency={quote.currency}
                editable={canEditQuote(quote)}
                onItemsChanged={() => {
                  refetchItems()
                  refetch()
                }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Totals Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-calculator me-2"></i>
                Resumen
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>{formatCurrency(quote.subtotalAmount, quote.currency)}</span>
              </div>
              {quote.discountAmount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Descuento</span>
                  <span>-{formatCurrency(quote.discountAmount, quote.currency)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between mb-2">
                <span>IVA</span>
                <span>{formatCurrency(quote.taxAmount, quote.currency)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(quote.totalAmount, quote.currency)}</span>
              </div>
              <small className="text-muted d-block text-end mt-2">
                {quote.itemsCount} producto(s), {quote.totalQuantity} unidades
              </small>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="card-title mb-0">Historial</h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Creada</span>
                <span>{formatDate(quote.createdAt)}</span>
              </div>
              {quote.sentAt && (
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Enviada</span>
                  <span>{formatDate(quote.sentAt)}</span>
                </div>
              )}
              {quote.acceptedAt && (
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Aceptada</span>
                  <span>{formatDate(quote.acceptedAt)}</span>
                </div>
              )}
              {quote.rejectedAt && (
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Rechazada</span>
                  <span>{formatDate(quote.rejectedAt)}</span>
                </div>
              )}
              {quote.convertedAt && (
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Convertida</span>
                  <span>{formatDate(quote.convertedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Converted Order Reference */}
          {quote.salesOrderId && (
            <div className="card mb-4 border-success">
              <div className="card-header bg-success bg-opacity-10">
                <h6 className="card-title mb-0 text-success">
                  <i className="bi bi-check-circle me-2"></i>
                  Orden de Venta Generada
                </h6>
              </div>
              <div className="card-body">
                <button
                  className="btn btn-outline-success w-100"
                  onClick={() => router.push(`/dashboard/sales/${quote.salesOrderId}`)}
                >
                  <i className="bi bi-receipt me-2"></i>
                  Ver Orden #{quote.salesOrder?.orderNumber || quote.salesOrderId}
                </button>
              </div>
            </div>
          )}

          {/* PDF Actions Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="bi bi-file-earmark-pdf me-2"></i>
                Documento PDF
              </h6>
            </div>
            <div className="card-body d-grid gap-2">
              <button
                className="btn btn-outline-primary"
                onClick={handlePreviewPdf}
                disabled={pdfLoading === 'preview'}
              >
                <i className="bi bi-eye me-2"></i>
                {pdfLoading === 'preview' ? 'Generando...' : 'Vista previa PDF'}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleDownloadPdf}
                disabled={pdfLoading === 'download'}
              >
                <i className="bi bi-download me-2"></i>
                {pdfLoading === 'download' ? 'Descargando...' : 'Descargar PDF'}
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => handleAction('send')}
                disabled={mutations.send.isPending || !['draft', 'sent'].includes(quote.status)}
              >
                <i className="bi bi-envelope me-2"></i>
                {mutations.send.isPending ? 'Enviando...' : 'Enviar por correo'}
              </button>
            </div>
          </div>

          {/* Actions Card */}
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">Acciones</h6>
            </div>
            <div className="card-body d-grid gap-2">
              {statusConfig.canConvert && (
                <button
                  className="btn btn-success btn-lg"
                  onClick={handleConvert}
                  disabled={mutations.convert.isPending}
                >
                  <i className="bi bi-cart-check me-2"></i>
                  {mutations.convert.isPending ? 'Generando...' : 'Generar Pedido'}
                </button>
              )}
              {quote.status === 'accepted' && !quote.purchaseOrderId && (
                <button
                  className="btn btn-outline-warning"
                  onClick={handleGeneratePurchaseOrder}
                >
                  <i className="bi bi-box-seam me-2"></i>
                  Generar Orden de Compra
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <div className="modal fade" id="rejectModal" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Rechazar Cotizacion</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <p className="text-muted">
                Marcar esta cotizacion como rechazada. Opcionalmente puedes agregar una razon.
              </p>
              <label className="form-label">Razon del rechazo (opcional)</label>
              <textarea
                className="form-control"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ej: Cliente encontro mejor precio..."
                rows={3}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleReject}
                disabled={mutations.reject.isPending}
                data-bs-dismiss="modal"
              >
                {mutations.reject.isPending ? 'Rechazando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}
