/**
 * AP INVOICES TABLE SIMPLE
 * Simple table to display AP invoices with JSON:API structure
 * Following successful pattern from inventory module
 */

'use client'

import React from 'react'
import type { APInvoice } from '../types'
import { INVOICE_STATUS_LABELS } from '../types'
import { isInvoiceClosed, isInvoiceOpen } from '../utils/invoiceStatus'
import { formatDateOnly, diffDaysDateOnly, todayDateInput } from '@lwm/ui'

interface APInvoicesTableSimpleProps {
  apInvoices?: APInvoice[]
  isLoading?: boolean
  onView?: (id: string) => void
  onEdit?: (id: string) => void
}

export const APInvoicesTableSimple = ({
  apInvoices = [],
  isLoading = false,
  onView,
  onEdit
}: APInvoicesTableSimpleProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    // invoiceDate y dueDate son fechas sin hora
    return formatDateOnly(dateString)
  }

  const formatCurrency = (amount?: string | number) => {
    if (amount === undefined || amount === null || amount === '') return '-'
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return '-'
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(numAmount)
  }

  const getStatusBadge = (status: string) => {
    const badgeClass: Record<string, string> = {
      draft: 'badge bg-secondary',
      pending: 'badge bg-info text-dark',
      posted: 'badge bg-primary',
      partial: 'badge bg-warning text-dark',
      paid: 'badge bg-success',
    }
    const config = {
      class: badgeClass[status] || 'badge bg-light text-dark',
      text: INVOICE_STATUS_LABELS[status as keyof typeof INVOICE_STATUS_LABELS] || status,
    }
    
    return (
      <span className={config.class}>
        {config.text}
      </span>
    )
  }

  const getPriorityBadge = (dueDate: string, status: string) => {
    if (status === 'draft' || isInvoiceClosed(status)) return null
    
    const diffDays = diffDaysDateOnly(todayDateInput(), dueDate) ?? 0
    
    if (diffDays < 0) {
      return <span className="badge bg-danger ms-1">Vencida</span>
    }
    if (diffDays <= 7) {
      return <span className="badge bg-warning ms-1">Por vencer</span>
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="text-muted mt-2">Cargando facturas...</p>
      </div>
    )
  }

  if (!apInvoices || apInvoices.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-receipt text-muted mb-3" style={{ fontSize: '3rem' }} />
        <h4 className="text-muted">No hay facturas</h4>
        <p className="text-muted">No se encontraron facturas de proveedores para mostrar.</p>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th>Número</th>
            <th>Proveedor</th>
            <th>Fecha</th>
            <th>Vencimiento</th>
            <th>Total</th>
            <th>Saldo</th>
            <th>Estado</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {apInvoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>
                <strong>{invoice.invoiceNumber}</strong>
              </td>
              <td>
                <span className={invoice.contactName?.startsWith('Proveedor ID:') ? 'text-muted' : 'text-dark'}>
                  {invoice.contactName || `Proveedor ID: ${invoice.contactId}`}
                </span>
              </td>
              <td>{formatDate(invoice.invoiceDate)}</td>
              <td>
                {formatDate(invoice.dueDate)}
                {getPriorityBadge(invoice.dueDate, invoice.status)}
              </td>
              <td>
                <strong>{formatCurrency(invoice.totalAmount)}</strong>
                <div className="small text-muted">
                  {invoice.currency}
                </div>
              </td>
              <td>
                {invoice.status === 'paid' ? (
                  <span className="text-success">Pagada</span>
                ) : (
                  <strong className="text-danger">
                    {formatCurrency(invoice.totalAmount - invoice.paidAmount)}
                  </strong>
                )}
              </td>
              <td>
                {getStatusBadge(invoice.status)}
              </td>
              <td className="text-end">
                <div className="btn-group btn-group-sm">
                  {onView && (
                    <button
                      aria-label="Ver factura"
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => onView(invoice.id)}
                      title="Ver factura"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                  )}
                  {onEdit && invoice.status === 'draft' && (
                    <button
                      aria-label="Editar factura"
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => onEdit(invoice.id)}
                      title="Editar factura"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                  )}
                  {isInvoiceOpen(invoice) && (
                    <button
                      aria-label="Pagar factura"
                      type="button"
                      className="btn btn-outline-success"
                      onClick={() => onView?.(invoice.id)}
                      title="Pagar factura"
                    >
                      <i className="bi bi-credit-card"></i>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}