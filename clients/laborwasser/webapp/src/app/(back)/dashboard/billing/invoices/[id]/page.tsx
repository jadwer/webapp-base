'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCFDIInvoice, useCFDIInvoicesMutations, PaymentComplementsSection } from '@/modules/billing'
import { toast } from '@/lib/toast'

interface InvoiceViewPageProps {
  params: Promise<{
    id: string
  }>
}

const STATUS_BADGES: Record<string, { class: string; label: string }> = {
  draft: { class: 'bg-secondary', label: 'Borrador' },
  generated: { class: 'bg-info', label: 'Generado' },
  stamped: { class: 'bg-success', label: 'Timbrado' },
  valid: { class: 'bg-success', label: 'Vigente' },
  cancelled: { class: 'bg-danger', label: 'Cancelado' },
  error: { class: 'bg-warning', label: 'Error' },
}

const TIPO_LABELS: Record<string, string> = {
  I: 'Ingreso',
  E: 'Egreso',
  T: 'Traslado',
  N: 'Nomina',
  P: 'Pago',
}

export default function InvoiceViewPage({ params }: InvoiceViewPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const { invoice, isLoading } = useCFDIInvoice(resolvedParams.id)
  const { validateSAT, getCancellationStatus, downloadPrefactura, previewPrefactura } =
    useCFDIInvoicesMutations()

  const [satValidation, setSatValidation] = useState<{
    valid: boolean
    uuid: string
    status: 'Vigente' | 'Cancelado'
    fechaEmision: string
    rfcEmisor: string
    rfcReceptor: string
  } | null>(null)
  const [cancellationStatus, setCancellationStatus] = useState<{
    status: 'cancellation_pending' | 'cancelled'
    fechaCancelacion?: string
    acuse?: string
  } | null>(null)
  const [validatingSat, setValidatingSat] = useState(false)
  const [checkingCancellation, setCheckingCancellation] = useState(false)
  const [prefacturaLoading, setPrefacturaLoading] = useState<'preview' | 'download' | null>(null)

  const handleEdit = () => {
    router.push(`/dashboard/billing/invoices/${resolvedParams.id}/edit`)
  }

  const handleBack = () => {
    router.push('/dashboard/billing/invoices')
  }

  const handleValidateSAT = async () => {
    setValidatingSat(true)
    try {
      const result = await validateSAT(resolvedParams.id)
      setSatValidation(result)
      toast.success(
        result.valid ? `CFDI vigente ante el SAT (${result.status})` : `CFDI ${result.status} ante el SAT`
      )
    } catch {
      toast.error('Error al validar el CFDI con el SAT')
    } finally {
      setValidatingSat(false)
    }
  }

  const handleCheckCancellationStatus = async () => {
    setCheckingCancellation(true)
    try {
      const result = await getCancellationStatus(resolvedParams.id)
      setCancellationStatus(result)
      toast.success(
        result.status === 'cancelled'
          ? 'Cancelacion confirmada ante el SAT'
          : 'Cancelacion en proceso ante el SAT'
      )
    } catch {
      toast.error('Error al consultar el estatus de cancelacion')
    } finally {
      setCheckingCancellation(false)
    }
  }

  const handlePreviewPrefactura = () => {
    setPrefacturaLoading('preview')
    try {
      const url = previewPrefactura(resolvedParams.id)
      window.open(url, '_blank')
    } catch {
      toast.error('Error al generar la vista previa de la prefactura')
    } finally {
      setPrefacturaLoading(null)
    }
  }

  const handleDownloadPrefactura = async () => {
    setPrefacturaLoading('download')
    try {
      const blob = await downloadPrefactura(resolvedParams.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `prefactura-${resolvedParams.id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      toast.error('Error al descargar la prefactura')
    } finally {
      setPrefacturaLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2" />
          Factura no encontrada
        </div>
        <button className="btn btn-secondary" onClick={handleBack}>
          Volver a facturas
        </button>
      </div>
    )
  }

  const statusBadge = STATUS_BADGES[invoice.status] || STATUS_BADGES.draft

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              type="button"
              onClick={handleBack}
              className="btn btn-link p-0 me-3 text-decoration-none"
              title="Volver a facturas"
            >
              <i className="bi bi-arrow-left fs-4 text-muted" />
            </button>
            <div className="flex-grow-1">
              <h1 className="h3 mb-0 fw-bold">
                <i className="bi bi-file-earmark-text text-primary me-2" />
                Factura {invoice.series}-{invoice.folio}
              </h1>
              <p className="text-muted mb-0">
                <span className={`badge ${statusBadge.class} me-2`}>
                  {statusBadge.label}
                </span>
                {invoice.uuid && (
                  <small className="text-muted">UUID: {invoice.uuid}</small>
                )}
              </p>
            </div>
            <div className="btn-group me-2">
              <button
                className="btn btn-outline-secondary"
                onClick={handlePreviewPrefactura}
                disabled={prefacturaLoading === 'preview'}
                title="Ver prefactura en una pestaña nueva"
              >
                {prefacturaLoading === 'preview' ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : (
                  <i className="bi bi-file-earmark-medical me-2" />
                )}
                Prefactura
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={handleDownloadPrefactura}
                disabled={prefacturaLoading === 'download'}
                title="Descargar prefactura en PDF"
              >
                {prefacturaLoading === 'download' ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <i className="bi bi-download" />
                )}
              </button>
            </div>
            {(invoice.status === 'stamped' || invoice.status === 'valid' || invoice.status === 'cancelled') && (
              <button
                className="btn btn-outline-primary me-2"
                onClick={handleValidateSAT}
                disabled={validatingSat}
                title="Validar el CFDI directamente ante el SAT"
              >
                {validatingSat ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : (
                  <i className="bi bi-patch-check me-2" />
                )}
                Validar en SAT
              </button>
            )}
            {invoice.status === 'cancelled' && (
              <button
                className="btn btn-outline-info me-2"
                onClick={handleCheckCancellationStatus}
                disabled={checkingCancellation}
                title="Consultar estatus de cancelacion ante el SAT"
              >
                {checkingCancellation ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : (
                  <i className="bi bi-hourglass-split me-2" />
                )}
                Estatus de cancelacion
              </button>
            )}
            {invoice.status === 'draft' && (
              <button className="btn btn-warning" onClick={handleEdit}>
                <i className="bi bi-pencil me-2" />
                Editar
              </button>
            )}
          </div>

          {/* Resultados de validacion SAT / cancelacion */}
          {(satValidation || cancellationStatus) && (
            <div className="row justify-content-center mb-4">
              <div className="col-lg-10 col-xl-8">
                {satValidation && (
                  <div className={`alert ${satValidation.valid ? 'alert-success' : 'alert-warning'} d-flex align-items-start`}>
                    <i className={`bi ${satValidation.valid ? 'bi-patch-check-fill' : 'bi-exclamation-triangle-fill'} me-2 fs-5`} />
                    <div>
                      <strong>Validacion SAT: {satValidation.status}</strong>
                      <br />
                      <small>
                        UUID {satValidation.uuid} - Emision {satValidation.fechaEmision} - Emisor {satValidation.rfcEmisor} - Receptor {satValidation.rfcReceptor}
                      </small>
                    </div>
                  </div>
                )}
                {cancellationStatus && (
                  <div className={`alert ${cancellationStatus.status === 'cancelled' ? 'alert-success' : 'alert-info'} d-flex align-items-start`}>
                    <i className={`bi ${cancellationStatus.status === 'cancelled' ? 'bi-check-circle-fill' : 'bi-hourglass-split'} me-2 fs-5`} />
                    <div>
                      <strong>
                        {cancellationStatus.status === 'cancelled' ? 'Cancelacion confirmada' : 'Cancelacion pendiente'}
                      </strong>
                      {cancellationStatus.fechaCancelacion && (
                        <>
                          <br />
                          <small>Fecha de cancelacion: {cancellationStatus.fechaCancelacion}</small>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              {/* Datos Generales */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-info-circle me-2" />
                    Datos Generales
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-4">
                      <h6 className="text-muted mb-1">Tipo de Comprobante</h6>
                      <p className="fs-5 mb-0">{TIPO_LABELS[invoice.tipoComprobante] || invoice.tipoComprobante}</p>
                    </div>
                    <div className="col-md-4">
                      <h6 className="text-muted mb-1">Fecha</h6>
                      <p className="fs-5 mb-0">{new Date(invoice.fechaEmision).toLocaleDateString()}</p>
                    </div>
                    <div className="col-md-4">
                      <h6 className="text-muted mb-1">Forma de Pago</h6>
                      <p className="fs-5 mb-0">{invoice.formaPago}</p>
                    </div>
                    <div className="col-md-4">
                      <h6 className="text-muted mb-1">Metodo de Pago</h6>
                      <p className="fs-5 mb-0">{invoice.metodoPago}</p>
                    </div>
                    <div className="col-md-4">
                      <h6 className="text-muted mb-1">Uso CFDI</h6>
                      <p className="fs-5 mb-0">{invoice.receptorUsoCfdi}</p>
                    </div>
                    <div className="col-md-4">
                      <h6 className="text-muted mb-1">Moneda</h6>
                      <p className="fs-5 mb-0">{invoice.moneda}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Receptor */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-person me-2" />
                    Receptor
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <h6 className="text-muted mb-1">RFC</h6>
                      <p className="fs-5 mb-0 font-monospace">{invoice.receptorRfc}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted mb-1">Razon Social</h6>
                      <p className="fs-5 mb-0">{invoice.receptorNombre}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Totales */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-calculator me-2" />
                    Totales
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-4">
                      <h6 className="text-muted mb-1">Subtotal</h6>
                      <p className="fs-4 mb-0">${(invoice.subtotal / 100).toFixed(2)}</p>
                    </div>
                    <div className="col-md-4">
                      <h6 className="text-muted mb-1">IVA</h6>
                      <p className="fs-4 mb-0">${((invoice.total - invoice.subtotal) / 100).toFixed(2)}</p>
                    </div>
                    <div className="col-md-4">
                      <h6 className="text-muted mb-1">Total</h6>
                      <p className="fs-3 mb-0 fw-bold text-success">${(invoice.total / 100).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complementos de pago (REP) - solo para facturas PPD timbradas */}
              {invoice.metodoPago === 'PPD' &&
                (invoice.status === 'stamped' ||
                  invoice.status === 'valid' ||
                  invoice.status === 'cancelled') && (
                  <PaymentComplementsSection invoice={invoice} />
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
