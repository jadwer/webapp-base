'use client'

/**
 * PaymentComplementsSection
 *
 * Renders the "Complementos de pago" (REP, Complemento de Pagos 2.0) area inside
 * the CFDI invoice detail view. Only meaningful for PPD invoices that are already
 * stamped: it lists every REP (tipo P) emitted against the invoice and lets the
 * operator (re)emit one manually.
 *
 * Relationship model: a REP shares the same ar_invoice_id as the PPD invoice it
 * settles, so REPs are queried by filter[tipoComprobante]=P + filter[arInvoiceId].
 */

import React, { useState } from 'react'
import { toast } from '@/lib/toast'
import { usePaymentComplements, useCFDIInvoicesMutations } from '../hooks'
import type { CFDIInvoice } from '../types'

interface PaymentComplementsSectionProps {
  /** The parent PPD invoice being viewed. */
  invoice: CFDIInvoice
}

const REP_STATUS_BADGES: Record<string, { class: string; label: string }> = {
  draft: { class: 'bg-secondary', label: 'Borrador' },
  generated: { class: 'bg-info', label: 'Generado' },
  stamped: { class: 'bg-success', label: 'Timbrado' },
  valid: { class: 'bg-success', label: 'Vigente' },
  cancelled: { class: 'bg-danger', label: 'Cancelado' },
  error: { class: 'bg-warning', label: 'Error' },
}

const formatCurrency = (cents?: number): string => {
  if (cents === undefined || cents === null) return '-'
  return `$${(cents / 100).toFixed(2)}`
}

const formatDate = (value?: string): string => {
  if (!value) return '-'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString()
}

/**
 * Extract the num de parcialidad from a REP record. The backend stores it in the
 * cfdi_payment_docs rows (DoctoRelacionado), which are not exposed via JSON:API,
 * so as a best effort we read it from metadata when present.
 */
const getParcialidad = (rep: CFDIInvoice): string => {
  const meta = rep.metadata as Record<string, unknown> | undefined
  const value = meta?.num_parcialidad ?? meta?.numParcialidad
  return value !== undefined && value !== null ? String(value) : '-'
}

const getSaldoInsoluto = (rep: CFDIInvoice): number | undefined => {
  const meta = rep.metadata as Record<string, unknown> | undefined
  const value = meta?.imp_saldo_insoluto ?? meta?.impSaldoInsoluto
  return typeof value === 'number' ? value : undefined
}

export function PaymentComplementsSection({ invoice }: PaymentComplementsSectionProps) {
  const arInvoiceId = invoice.arInvoiceId
  const { complements, isLoading, mutate } = usePaymentComplements(arInvoiceId ?? null)
  const { downloadXML, downloadPDF, emitPaymentComplement } = useCFDIInvoicesMutations()

  const [emitting, setEmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleDownloadXML = async (rep: CFDIInvoice) => {
    setDownloading(`xml-${rep.id}`)
    try {
      const blob = await downloadXML(rep.id)
      triggerDownload(blob, `REP-${rep.series}-${rep.folio}.xml`)
    } catch {
      toast.error('Error al descargar el XML del complemento de pago')
    } finally {
      setDownloading(null)
    }
  }

  const handleDownloadPDF = async (rep: CFDIInvoice) => {
    setDownloading(`pdf-${rep.id}`)
    try {
      const blob = await downloadPDF(rep.id)
      triggerDownload(blob, `REP-${rep.series}-${rep.folio}.pdf`)
    } catch {
      toast.error('Error al descargar el PDF del complemento de pago')
    } finally {
      setDownloading(null)
    }
  }

  const handleEmit = async () => {
    if (arInvoiceId === undefined || arInvoiceId === null) {
      toast.error('La factura no tiene una factura AR asociada para complementar')
      setShowConfirm(false)
      return
    }
    setEmitting(true)
    try {
      const result = await emitPaymentComplement(arInvoiceId)
      toast.success(
        `Complemento de pago ${result.data.series}-${result.data.folio} emitido correctamente`
      )
      await mutate()
    } catch (error) {
      const axiosError = error as {
        response?: { status?: number; data?: { error?: string; message?: string } }
      }
      const status = axiosError.response?.status
      if (status === 422) {
        toast.error(
          axiosError.response?.data?.error ||
            'Solo se puede emitir complemento de pago para facturas PPD timbradas con pagos aplicados'
        )
      } else if (status === 403) {
        toast.error('No tienes permiso para emitir complementos de pago')
      } else {
        toast.error('Error al emitir el complemento de pago')
      }
    } finally {
      setEmitting(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-light d-flex align-items-center justify-content-between">
        <h5 className="mb-0">
          <i className="bi bi-cash-coin me-2" />
          Complementos de pago
        </h5>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => setShowConfirm(true)}
          disabled={emitting}
          title="Emitir el complemento de pago (REP) del ultimo abono registrado"
        >
          {emitting ? (
            <span className="spinner-border spinner-border-sm me-2" />
          ) : (
            <i className="bi bi-plus-circle me-2" />
          )}
          Emitir complemento de pago
        </button>
      </div>
      <div className="card-body p-4">
        {showConfirm && (
          <div className="alert alert-warning d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
            <span>
              <i className="bi bi-exclamation-triangle-fill me-2" />
              Se emitira (o reemitira) el complemento de pago del ultimo abono aplicado a esta
              factura. Continuar?
            </span>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-warning"
                onClick={handleEmit}
                disabled={emitting}
              >
                {emitting ? 'Emitiendo...' : 'Si, emitir'}
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowConfirm(false)}
                disabled={emitting}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-3">
            <span className="spinner-border spinner-border-sm text-primary me-2" />
            Cargando complementos de pago...
          </div>
        ) : complements.length === 0 ? (
          <p className="text-muted mb-0">
            <i className="bi bi-info-circle me-2" />
            Esta factura aun no tiene complementos de pago emitidos.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Folio / UUID</th>
                  <th>Fecha de pago</th>
                  <th className="text-end">Monto</th>
                  <th className="text-center">Parcialidad</th>
                  <th className="text-end">Saldo insoluto</th>
                  <th className="text-center">Estatus</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {complements.map((rep) => {
                  const badge = REP_STATUS_BADGES[rep.status] || REP_STATUS_BADGES.draft
                  const saldo = getSaldoInsoluto(rep)
                  return (
                    <tr key={rep.id}>
                      <td>
                        <div className="fw-semibold">
                          {rep.series}-{rep.folio}
                        </div>
                        {rep.uuid && (
                          <small className="text-muted font-monospace">{rep.uuid}</small>
                        )}
                      </td>
                      <td>{formatDate(rep.fechaPago || rep.fechaTimbrado || rep.fechaEmision)}</td>
                      <td className="text-end">{formatCurrency(rep.montoPago ?? rep.total)}</td>
                      <td className="text-center">{getParcialidad(rep)}</td>
                      <td className="text-end">
                        {saldo !== undefined ? formatCurrency(saldo) : '-'}
                      </td>
                      <td className="text-center">
                        <span className={`badge ${badge.class}`}>{badge.label}</span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => handleDownloadXML(rep)}
                            disabled={downloading === `xml-${rep.id}`}
                            title="Descargar XML"
                          >
                            {downloading === `xml-${rep.id}` ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              <i className="bi bi-filetype-xml" />
                            )}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => handleDownloadPDF(rep)}
                            disabled={downloading === `pdf-${rep.id}`}
                            title="Descargar PDF"
                          >
                            {downloading === `pdf-${rep.id}` ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              <i className="bi bi-filetype-pdf" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentComplementsSection
