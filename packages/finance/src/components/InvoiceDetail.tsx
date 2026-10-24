'use client'

import React from 'react'
import Link from 'next/link'
import { formatDateOnly } from '@lwm/ui'
import { useAPInvoice, useARInvoice } from '../hooks'
import { INVOICE_STATUS_LABELS } from '../types'

type Kind = 'ap' | 'ar'

const COPY: Record<Kind, { title: string; party: string; list: string; order: string; orderHref: (id: number) => string }> = {
  ap: {
    title: 'Factura por pagar',
    party: 'Proveedor',
    list: '/dashboard/finance/ap-invoices',
    order: 'Orden de compra',
    orderHref: (id) => `/dashboard/purchase/${id}`,
  },
  ar: {
    title: 'Factura de cliente',
    party: 'Cliente',
    list: '/dashboard/finance/ar-invoices',
    order: 'Pedido de venta',
    orderHref: (id) => `/dashboard/sales/${id}`,
  },
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-secondary',
  pending: 'bg-warning text-dark',
  posted: 'bg-primary',
  partial: 'bg-info text-dark',
  paid: 'bg-success',
  void: 'bg-danger',
  voided: 'bg-danger',
  cancelled: 'bg-danger',
}

const money = (amount?: string | number | null) => {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (n === undefined || n === null || Number.isNaN(n)) return '-'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}

/**
 * Detalle de solo lectura de una factura de CxP o CxC. Las facturas
 * contabilizadas no se editan (inmutabilidad financiera); los cobros y pagos
 * se registran desde sus listados.
 */
export const InvoiceDetail: React.FC<{ kind: Kind; id: string }> = ({ kind, id }) => {
  const copy = COPY[kind]
  const ap = useAPInvoice(kind === 'ap' ? id : null, ['contact'])
  const ar = useARInvoice(kind === 'ar' ? id : null, ['contact'])
  const { isLoading, error } = kind === 'ap' ? ap : ar
  const invoice = kind === 'ap' ? ap.apInvoice : ar.arInvoice
  const orderId = invoice
    ? kind === 'ap'
      ? (invoice as { purchaseOrderId?: number | null }).purchaseOrderId
      : (invoice as { salesOrderId?: number | null }).salesOrderId
    : null

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <h1 className="h5">Factura no encontrada</h1>
          <p className="mb-2">
            {(error as { message?: string } | undefined)?.message ||
              'La factura no existe o no tienes permiso para verla.'}
          </p>
          <Link href={copy.list} className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1" aria-hidden="true" />
            Volver al listado
          </Link>
        </div>
      </div>
    )
  }

  const total = Number(invoice.totalAmount) || 0
  const paid = Number(invoice.paidAmount) || 0
  const status = invoice.status as string

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
        <div>
          <h1 className="h3 mb-1">
            {copy.title} {invoice.invoiceNumber}
          </h1>
          <span className={`badge ${STATUS_BADGE[status] ?? 'bg-light text-dark'}`}>
            {(INVOICE_STATUS_LABELS as Record<string, string>)[status] ?? status}
          </span>
        </div>
        <Link href={copy.list} className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1" aria-hidden="true" />
          Volver
        </Link>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h2 className="h5 mb-0">
                <i className="bi bi-info-circle me-2" aria-hidden="true" />
                Información
              </h2>
            </div>
            <div className="card-body">
              <dl className="row mb-0">
                <dt className="col-sm-4 text-muted fw-normal">{copy.party}</dt>
                <dd className="col-sm-8">
                  <Link href={`/dashboard/contacts/${invoice.contactId}`}>{invoice.contactName ?? `#${invoice.contactId}`}</Link>
                </dd>
                <dt className="col-sm-4 text-muted fw-normal">Fecha de factura</dt>
                <dd className="col-sm-8">{formatDateOnly(invoice.invoiceDate)}</dd>
                <dt className="col-sm-4 text-muted fw-normal">Vencimiento</dt>
                <dd className="col-sm-8">{formatDateOnly(invoice.dueDate)}</dd>
                <dt className="col-sm-4 text-muted fw-normal">Moneda</dt>
                <dd className="col-sm-8">{invoice.currency || 'MXN'}</dd>
                {orderId ? (
                  <>
                    <dt className="col-sm-4 text-muted fw-normal">{copy.order}</dt>
                    <dd className="col-sm-8">
                      <Link href={copy.orderHref(orderId)}>#{orderId}</Link>
                    </dd>
                  </>
                ) : null}
                {invoice.notes ? (
                  <>
                    <dt className="col-sm-4 text-muted fw-normal">Notas</dt>
                    <dd className="col-sm-8">{invoice.notes}</dd>
                  </>
                ) : null}
              </dl>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h2 className="h5 mb-0">
                <i className="bi bi-calculator me-2" aria-hidden="true" />
                Totales
              </h2>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between"><span>Subtotal</span><span>{money(invoice.subtotal)}</span></div>
              <div className="d-flex justify-content-between"><span>Impuestos</span><span>{money(invoice.taxAmount)}</span></div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span>{money(total)}</span></div>
              <div className="d-flex justify-content-between text-success"><span>{kind === 'ap' ? 'Pagado' : 'Cobrado'}</span><span>{money(paid)}</span></div>
              <div className="d-flex justify-content-between fw-bold"><span>Saldo pendiente</span><span>{money(Math.max(total - paid, 0))}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceDetail
