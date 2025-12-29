'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useCFDIInvoice } from '@/modules/billing'

interface InvoiceViewPageProps {
  params: Promise<{
    id: string
  }>
}

const STATUS_BADGES: Record<string, { class: string; label: string }> = {
  draft: { class: 'bg-secondary', label: 'Borrador' },
  generated: { class: 'bg-info', label: 'Generado' },
  stamped: { class: 'bg-success', label: 'Timbrado' },
  cancelled: { class: 'bg-danger', label: 'Cancelado' },
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

  const handleEdit = () => {
    router.push(`/dashboard/billing/invoices/${resolvedParams.id}/edit`)
  }

  const handleBack = () => {
    router.push('/dashboard/billing/invoices')
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
            {invoice.status === 'draft' && (
              <button className="btn btn-warning" onClick={handleEdit}>
                <i className="bi bi-pencil me-2" />
                Editar
              </button>
            )}
          </div>

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
              <div className="card shadow-sm border-0">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
