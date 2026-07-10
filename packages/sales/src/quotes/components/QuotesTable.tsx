'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { QuoteStatusBadge } from './QuoteStatusBadge'
import { GenerateSaleModal } from './GenerateSaleModal'
import { GenerateOrderModal } from './GenerateOrderModal'
import type { Quote } from '../types'
import { QUOTE_STATUS_CONFIG } from '../types'
import { useQuoteMutations } from '../hooks'
import { quoteService, quoteItemService } from '../services'
import { salesService } from '../../services'
import { OperationsMenu, type OperationsMenuItem } from '../../components/OperationsMenu'
import { exportQuoteItemsCsv } from '../../utils/exportCsv'
import { toast } from '@lwm/ui'
import { ConfirmModal, ConfirmModalHandle } from '@lwm/ui'

interface QuotesTableProps {
  quotes: Quote[]
  isLoading?: boolean
  onQuoteUpdated?: () => void
}

export function QuotesTable({ quotes, isLoading, onQuoteUpdated }: QuotesTableProps) {
  const router = useRouter()
  const mutations = useQuoteMutations()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  // Modal de conversion abierto: { quote, type } (Fase A: venta directa vs pedido)
  const [convertModal, setConvertModal] = useState<{ quote: Quote; type: 'sale' | 'order' } | null>(null)
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
    action: 'send' | 'accept' | 'reject' | 'cancel' | 'duplicate',
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

  const handleDownloadPdf = async (quote: Quote) => {
    setActionLoading(quote.id)
    try {
      await quoteService.downloadPdf(quote.id)
    } catch {
      toast.error('Error al descargar el PDF')
    } finally {
      setActionLoading(null)
    }
  }

  // Exportar partidas CSV (client-side): la lista no trae los items con
  // detalle, se piden bajo demanda y se arma el CSV en el navegador.
  const handleExportCsv = async (quote: Quote) => {
    setActionLoading(quote.id)
    try {
      const items = await quoteItemService.getByQuoteId(quote.id)
      if (items.length === 0) {
        toast.error('La cotizacion no tiene partidas para exportar')
        return
      }
      exportQuoteItemsCsv(quote.quoteNumber, items)
      toast.success('Partidas exportadas')
    } catch {
      toast.error('Error al exportar las partidas')
    } finally {
      setActionLoading(null)
    }
  }

  // Prefactura: disponible cuando la cotizacion ya tiene orden generada
  const handlePrefactura = async (quote: Quote) => {
    if (!quote.salesOrderId) return
    setActionLoading(quote.id)
    try {
      const blob = await salesService.orders.prefactura(String(quote.salesOrderId))
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch {
      toast.error('Error al generar la prefactura')
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

  const handleConverted = (salesOrderId: string) => {
    setConvertModal(null)
    onQuoteUpdated?.()
    router.push(`/dashboard/sales/${salesOrderId}`)
  }

  const buildMenuItems = (quote: Quote): OperationsMenuItem[] => {
    const statusConfig = QUOTE_STATUS_CONFIG[quote.status]
    const items: OperationsMenuItem[] = [
      {
        key: 'view',
        label: 'Ver detalle',
        icon: 'bi-eye',
        onClick: () => router.push(`/dashboard/quotes/${quote.id}`)
      }
    ]

    if (statusConfig.canConvert) {
      items.push(
        {
          key: 'generate-sale',
          label: 'Generar venta',
          icon: 'bi-cash-coin',
          onClick: () => setConvertModal({ quote, type: 'sale' })
        },
        {
          key: 'generate-order',
          label: 'Generar pedido',
          icon: 'bi-clipboard-check',
          onClick: () => setConvertModal({ quote, type: 'order' })
        }
      )
    }

    items.push({
      key: 'prefactura',
      label: 'Prefactura',
      icon: 'bi-file-earmark-medical',
      onClick: () => handlePrefactura(quote),
      disabled: !quote.salesOrderId,
      title: quote.salesOrderId
        ? 'Vista previa de la prefactura de la orden generada'
        : 'Disponible cuando la cotizacion tenga una orden generada'
    })

    if (statusConfig.canSend && (quote.itemsCount ?? 0) > 0) {
      items.push({
        key: 'send',
        label: 'Enviar al cliente',
        icon: 'bi-send',
        onClick: () => handleAction('send', quote)
      })
    }

    if (statusConfig.canAccept) {
      items.push({
        key: 'accept',
        label: 'Marcar aceptada',
        icon: 'bi-check-lg',
        onClick: () => handleAction('accept', quote)
      })
    }

    if (statusConfig.canReject) {
      items.push({
        key: 'reject',
        label: 'Marcar rechazada',
        icon: 'bi-x-lg',
        onClick: () => handleAction('reject', quote)
      })
    }

    items.push(
      { type: 'divider', key: 'div-docs' },
      {
        key: 'duplicate',
        label: 'Duplicar',
        icon: 'bi-copy',
        onClick: () => handleAction('duplicate', quote)
      },
      {
        key: 'export-csv',
        label: 'Exportar partidas CSV',
        icon: 'bi-filetype-csv',
        onClick: () => handleExportCsv(quote)
      },
      {
        key: 'download-pdf',
        label: 'Descargar PDF',
        icon: 'bi-file-earmark-pdf',
        onClick: () => handleDownloadPdf(quote)
      }
    )

    if (statusConfig.canCancel) {
      items.push({
        key: 'cancel',
        label: 'Cancelar',
        icon: 'bi-x-circle',
        variant: 'warning',
        onClick: () => handleAction('cancel', quote)
      })
    }

    if (quote.status === 'draft') {
      items.push(
        { type: 'divider', key: 'div-danger' },
        {
          key: 'delete',
          label: 'Eliminar',
          icon: 'bi-trash',
          variant: 'danger',
          onClick: () => handleDelete(quote.id)
        }
      )
    }

    return items
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
              <th className="text-end">Operaciones</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => {
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
                    <div className="d-inline-block">
                      <OperationsMenu
                        items={buildMenuItems(quote)}
                        buttonClassName="btn btn-sm btn-outline-secondary dropdown-toggle"
                        loading={actionLoading === quote.id}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modales de conversion (Fase A: venta directa vs pedido) */}
      {convertModal && (
        <>
          <GenerateSaleModal
            quote={convertModal.quote}
            isOpen={convertModal.type === 'sale'}
            onClose={() => setConvertModal(null)}
            onConverted={handleConverted}
          />
          <GenerateOrderModal
            quote={convertModal.quote}
            isOpen={convertModal.type === 'order'}
            onClose={() => setConvertModal(null)}
            onConverted={handleConverted}
          />
        </>
      )}

      <ConfirmModal ref={confirmModalRef} />
    </>
  )
}
