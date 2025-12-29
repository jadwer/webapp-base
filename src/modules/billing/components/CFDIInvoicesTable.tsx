'use client'

import React, { useState, useRef } from 'react'
import clsx from 'clsx'
import { Button } from '@/ui/components/base'
import ConfirmModal, { ConfirmModalHandle } from '@/ui/ConfirmModal'
import type { CFDIInvoice, CFDIStatus, TipoComprobante } from '../types'

interface CFDIInvoicesTableProps {
  invoices: CFDIInvoice[]
  isLoading?: boolean
  onView?: (invoice: CFDIInvoice) => void
  onEdit?: (invoice: CFDIInvoice) => void
  onDelete?: (invoiceId: string) => Promise<void>
  onGenerateXML?: (invoiceId: string) => Promise<void>
  onGeneratePDF?: (invoiceId: string) => Promise<void>
  onStamp?: (invoiceId: string) => Promise<void>
  onCancel?: (invoiceId: string) => Promise<void>
  onDownloadXML?: (invoiceId: string) => Promise<void>
  onDownloadPDF?: (invoiceId: string) => Promise<void>
  className?: string
}

const STATUS_BADGES: Record<CFDIStatus, { className: string; label: string }> = {
  draft: { className: 'bg-secondary', label: 'Borrador' },
  generated: { className: 'bg-info', label: 'Generado' },
  stamped: { className: 'bg-success', label: 'Timbrado' },
  valid: { className: 'bg-success', label: 'Valido' },
  cancelled: { className: 'bg-danger', label: 'Cancelado' },
  error: { className: 'bg-warning text-dark', label: 'Error' },
}

const TIPO_COMPROBANTE_LABELS: Record<TipoComprobante, string> = {
  'I': 'Ingreso',
  'E': 'Egreso',
  'T': 'Traslado',
  'N': 'Nomina',
  'P': 'Pago',
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

const formatCurrency = (amountInCents: number | null | undefined): string => {
  if (amountInCents === null || amountInCents === undefined) return '$0.00'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amountInCents / 100) // Convert from cents
}

export const CFDIInvoicesTable: React.FC<CFDIInvoicesTableProps> = ({
  invoices,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onGenerateXML,
  onGeneratePDF,
  onStamp,
  onCancel,
  onDownloadXML,
  onDownloadPDF,
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  const setInvoiceLoading = (invoiceId: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [invoiceId]: loading }))
  }

  const handleDelete = async (invoice: CFDIInvoice) => {
    if (!onDelete || !confirmModalRef.current) return

    const confirmed = await confirmModalRef.current.confirm(
      `Esta seguro de que quiere eliminar la factura ${invoice.series}-${invoice.folio}? Esta accion no se puede deshacer.`
    )

    if (confirmed) {
      setInvoiceLoading(invoice.id, true)
      try {
        await onDelete(invoice.id)
      } finally {
        setInvoiceLoading(invoice.id, false)
      }
    }
  }

  const handleAction = async (invoiceId: string, action: (id: string) => Promise<void>) => {
    setInvoiceLoading(invoiceId, true)
    try {
      await action(invoiceId)
    } finally {
      setInvoiceLoading(invoiceId, false)
    }
  }

  const getStatusBadge = (status: CFDIStatus) => {
    const badge = STATUS_BADGES[status] || STATUS_BADGES.draft
    return (
      <span className={clsx('badge', badge.className)}>
        {badge.label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando facturas CFDI...</span>
        </div>
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center p-5">
        <i className="bi bi-receipt display-1 text-muted mb-3"></i>
        <h5 className="text-muted">No hay facturas CFDI</h5>
        <p className="text-muted">Crea tu primera factura electronica para comenzar</p>
      </div>
    )
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th scope="col">Serie-Folio</th>
              <th scope="col">Tipo</th>
              <th scope="col">Receptor</th>
              <th scope="col">UUID</th>
              <th scope="col" className="text-end">Total</th>
              <th scope="col">Fecha</th>
              <th scope="col">Estado</th>
              <th scope="col" className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              const isInvoiceLoading = loadingStates[invoice.id] || false

              return (
                <tr key={invoice.id} className={clsx({ 'opacity-50': isInvoiceLoading })}>
                  <td>
                    <div className="fw-medium">{invoice.series}-{invoice.folio}</div>
                    <small className="text-muted">ID: {invoice.id}</small>
                  </td>
                  <td>
                    <span className="badge bg-secondary">
                      {TIPO_COMPROBANTE_LABELS[invoice.tipoComprobante] || invoice.tipoComprobante}
                    </span>
                  </td>
                  <td>
                    <div>
                      <small className="text-muted">{invoice.receptorRfc}</small>
                      <div>{invoice.receptorNombre}</div>
                    </div>
                  </td>
                  <td>
                    {invoice.uuid ? (
                      <code className="small" title={invoice.uuid}>
                        {invoice.uuid.substring(0, 8)}...
                      </code>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="text-end">
                    <div className="fw-bold text-success">
                      {formatCurrency(invoice.total)}
                    </div>
                    <small className="text-muted">{invoice.moneda}</small>
                  </td>
                  <td>
                    <div>{formatDate(invoice.fechaEmision)}</div>
                    {invoice.fechaTimbrado && (
                      <small className="text-success">
                        <i className="bi bi-award me-1"></i>
                        {formatDate(invoice.fechaTimbrado)}
                      </small>
                    )}
                  </td>
                  <td>
                    {getStatusBadge(invoice.status)}
                    {invoice.errorMessage && (
                      <small className="d-block text-danger" title={invoice.errorMessage}>
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Error
                      </small>
                    )}
                  </td>
                  <td>
                    <div className="d-flex justify-content-end gap-1 flex-wrap">
                      {/* View button - always available */}
                      {onView && (
                        <Button
                          size="small"
                          variant="secondary"
                          buttonStyle="outline"
                          title="Ver factura"
                          onClick={() => onView(invoice)}
                          disabled={isInvoiceLoading}
                        >
                          <i className="bi bi-eye" />
                        </Button>
                      )}

                      {/* Draft status actions */}
                      {invoice.status === 'draft' && (
                        <>
                          {onEdit && (
                            <Button
                              size="small"
                              variant="primary"
                              buttonStyle="outline"
                              title="Editar"
                              onClick={() => onEdit(invoice)}
                              disabled={isInvoiceLoading}
                            >
                              <i className="bi bi-pencil" />
                            </Button>
                          )}
                          {onGenerateXML && (
                            <Button
                              size="small"
                              variant="primary"
                              buttonStyle="outline"
                              title="Generar XML"
                              onClick={() => handleAction(invoice.id, onGenerateXML)}
                              disabled={isInvoiceLoading}
                            >
                              <i className="bi bi-file-earmark-code" />
                            </Button>
                          )}
                        </>
                      )}

                      {/* Generated status actions */}
                      {invoice.status === 'generated' && (
                        <>
                          {onGeneratePDF && (
                            <Button
                              size="small"
                              variant="primary"
                              buttonStyle="outline"
                              title="Generar PDF"
                              onClick={() => handleAction(invoice.id, onGeneratePDF)}
                              disabled={isInvoiceLoading}
                            >
                              <i className="bi bi-file-earmark-pdf" />
                            </Button>
                          )}
                          {onStamp && (
                            <Button
                              size="small"
                              variant="success"
                              buttonStyle="outline"
                              title="Timbrar"
                              onClick={() => handleAction(invoice.id, onStamp)}
                              disabled={isInvoiceLoading}
                            >
                              <i className="bi bi-award" />
                            </Button>
                          )}
                        </>
                      )}

                      {/* Stamped/Valid status actions */}
                      {(invoice.status === 'stamped' || invoice.status === 'valid') && (
                        <>
                          {onDownloadXML && (
                            <Button
                              size="small"
                              variant="primary"
                              buttonStyle="outline"
                              title="Descargar XML"
                              onClick={() => handleAction(invoice.id, onDownloadXML)}
                              disabled={isInvoiceLoading}
                            >
                              <i className="bi bi-download" /> XML
                            </Button>
                          )}
                          {onDownloadPDF && (
                            <Button
                              size="small"
                              variant="primary"
                              buttonStyle="outline"
                              title="Descargar PDF"
                              onClick={() => handleAction(invoice.id, onDownloadPDF)}
                              disabled={isInvoiceLoading}
                            >
                              <i className="bi bi-download" /> PDF
                            </Button>
                          )}
                          {onCancel && (
                            <Button
                              size="small"
                              variant="warning"
                              buttonStyle="outline"
                              title="Cancelar CFDI"
                              onClick={() => handleAction(invoice.id, onCancel)}
                              disabled={isInvoiceLoading}
                            >
                              <i className="bi bi-x-circle" />
                            </Button>
                          )}
                        </>
                      )}

                      {/* Delete button - only for draft/error */}
                      {(invoice.status === 'draft' || invoice.status === 'error') && onDelete && (
                        <Button
                          size="small"
                          variant="danger"
                          buttonStyle="outline"
                          title="Eliminar"
                          onClick={() => handleDelete(invoice)}
                          disabled={isInvoiceLoading}
                        >
                          <i className="bi bi-trash" />
                        </Button>
                      )}
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

export default CFDIInvoicesTable
