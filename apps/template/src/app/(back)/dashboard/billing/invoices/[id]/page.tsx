'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useCFDIInvoice,
  useCFDIInvoicesMutations,
  PaymentComplementsSection,
  cfdiStatusBadge,
  CFDI_MOTIVOS_CANCELACION,
} from '@/modules/billing'
import { toast } from '@/lib/toast'

interface InvoiceViewPageProps {
  params: Promise<{
    id: string
  }>
}

const money = (cents?: number | null) =>
  ((cents ?? 0) / 100).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

/** Suma de traslados del concepto (impuestos JSON del backend, en centavos). */
const lineIva = (impuestos: Record<string, unknown> | null | undefined): number => {
  const traslados = (impuestos?.traslados as Array<{ importe?: number }> | undefined) ?? []
  return traslados.reduce((sum, t) => sum + (Number(t.importe) || 0), 0)
}

const formatDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : '-'

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
  const { invoice, isLoading, mutate } = useCFDIInvoice(resolvedParams.id)
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
      await mutate()
      if (result.status === 'cancelled') {
        toast.success('El SAT confirmó la cancelación')
      } else if (result.status === 'valid') {
        toast.info('El receptor rechazó la cancelación; la factura sigue vigente')
      } else {
        toast.info(`Cancelación en proceso: ${result.cancellationStatus || 'sin respuesta del SAT'}`)
      }
    } catch (err) {
      const data = (err as { response?: { data?: { error?: string; message?: string } } }).response?.data
      toast.error(data?.error || data?.message || 'Error al consultar el estatus de cancelación')
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

  const statusBadge = cfdiStatusBadge(invoice.status)

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              aria-label="Volver a facturas"
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
                <span className={`badge ${statusBadge.className} me-2`}>
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
                aria-label="Descargar prefactura en PDF"
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
            {(invoice.status === 'valid' || invoice.status === 'cancel_pending' || invoice.status === 'cancelled') && (
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
            {invoice.status === 'cancel_pending' && (
              <button
                className="btn btn-outline-info me-2"
                onClick={handleCheckCancellationStatus}
                disabled={checkingCancellation}
                title="Consultar ahora el estatus de la cancelación ante el SAT"
              >
                {checkingCancellation ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : (
                  <i className="bi bi-hourglass-split me-2" />
                )}
                Consultar estatus ahora
              </button>
            )}
            {invoice.status === 'draft' && (
              <button className="btn btn-warning" onClick={handleEdit}>
                <i className="bi bi-pencil me-2" />
                Editar
              </button>
            )}
          </div>

          {/* Resultados de validacion SAT y cancelacion */}
          {(satValidation || invoice.cancellationRequestedAt) && (
            <div className="row justify-content-center mb-4">
              <div className="col-lg-10 col-xl-8">
                {satValidation && (
                  <div className={`alert ${satValidation.valid ? 'alert-success' : 'alert-warning'} d-flex align-items-start`}>
                    <i className={`bi ${satValidation.valid ? 'bi-patch-check-fill' : 'bi-exclamation-triangle-fill'} me-2 fs-5`} />
                    <div>
                      <strong>Validación SAT: {satValidation.status}</strong>
                      <br />
                      <small>
                        UUID {satValidation.uuid || invoice.uuid || '-'} - Emisor {satValidation.rfcEmisor || invoice.companySetting?.rfc || '-'} - Receptor {satValidation.rfcReceptor || invoice.receptorRfc}
                      </small>
                    </div>
                  </div>
                )}
                {invoice.cancellationRequestedAt && (
                  <div
                    className={`alert ${
                      invoice.status === 'cancelled' ? 'alert-danger' : invoice.status === 'valid' ? 'alert-secondary' : 'alert-warning'
                    } d-flex align-items-start`}
                  >
                    <i
                      className={`bi ${
                        invoice.status === 'cancel_pending' ? 'bi-hourglass-split' : invoice.status === 'cancelled' ? 'bi-x-circle-fill' : 'bi-arrow-counterclockwise'
                      } me-2 fs-5`}
                    />
                    <div>
                      <strong>
                        {invoice.status === 'cancel_pending'
                          ? 'Se está cancelando esta factura'
                          : invoice.status === 'cancelled'
                            ? 'Factura cancelada ante el SAT'
                            : 'El receptor rechazó la cancelación'}
                      </strong>
                      <br />
                      <small>
                        Estatus SAT: {invoice.cancellationStatus || '-'} | Motivo:{' '}
                        {CFDI_MOTIVOS_CANCELACION[invoice.motivoCancelacion ?? ''] || invoice.motivoCancelacion || '-'}
                        <br />
                        Solicitada: {formatDateTime(invoice.cancellationRequestedAt)} | Última consulta:{' '}
                        {formatDateTime(invoice.cancellationCheckedAt)}
                        {invoice.status === 'cancelled' && <> | Cancelada: {formatDateTime(invoice.fechaCancelacion)}</>}
                      </small>
                      {invoice.status === 'cancel_pending' && (
                        <>
                          <br />
                          <small className="text-muted">
                            Si el SAT requiere la aceptación del receptor, este tiene 72 horas para aceptarla o rechazarla en su buzón tributario. El sistema consulta el estatus cada dos horas.
                          </small>
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
                      <p className="fs-5 mb-0">{formatDateTime(invoice.fechaEmision)}</p>
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
                  {/* Montos guardados por el backend (centavos); el IVA no se deduce de total - subtotal
                      porque eso ignoraba el descuento (E2E 23-10) */}
                  <div className="row g-4">
                    <div className="col-md-3">
                      <h6 className="text-muted mb-1">Subtotal</h6>
                      <p className="fs-4 mb-0">{money(invoice.subtotal)}</p>
                    </div>
                    <div className="col-md-3">
                      <h6 className="text-muted mb-1">Descuento</h6>
                      <p className="fs-4 mb-0">{invoice.descuento ? `-${money(invoice.descuento)}` : money(0)}</p>
                    </div>
                    <div className="col-md-3">
                      <h6 className="text-muted mb-1">IVA trasladado</h6>
                      <p className="fs-4 mb-0">{money(invoice.iva)}</p>
                    </div>
                    <div className="col-md-3">
                      <h6 className="text-muted mb-1">Total</h6>
                      <p className="fs-3 mb-0 fw-bold text-success">{money(invoice.total)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conceptos */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-list-ul me-2" />
                    Conceptos
                  </h5>
                </div>
                <div className="card-body p-0">
                  {invoice.items && invoice.items.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover mb-0">
                        <thead className="table-dark">
                          <tr>
                            <th>Descripción</th>
                            <th>Clave SAT</th>
                            <th className="text-end">Cantidad</th>
                            <th className="text-end">Precio unitario</th>
                            <th className="text-end">Descuento</th>
                            <th className="text-end">IVA</th>
                            <th className="text-end">Importe</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoice.items.map((item) => (
                            <tr key={item.id}>
                              <td>
                                {item.descripcion}
                                {item.noIdentificacion && <small className="d-block text-muted">{item.noIdentificacion}</small>}
                              </td>
                              <td>
                                {item.claveProdServ}
                                <small className="d-block text-muted">{item.claveUnidad}{item.unidad ? ` - ${item.unidad}` : ''}</small>
                              </td>
                              <td className="text-end">{item.cantidad}</td>
                              <td className="text-end">{money(item.valorUnitario)}</td>
                              <td className="text-end">{item.descuento ? money(item.descuento) : '-'}</td>
                              <td className="text-end">{item.objetoImp === '01' ? 'No objeto' : money(lineIva(item.impuestos))}</td>
                              <td className="text-end">{money(item.importe - (item.descuento || 0))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted p-4 mb-0">Sin conceptos.</p>
                  )}
                </div>
              </div>

              {/* Complementos de pago (REP) - solo para facturas PPD timbradas */}
              {invoice.metodoPago === 'PPD' &&
                (invoice.status === 'valid' ||
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
