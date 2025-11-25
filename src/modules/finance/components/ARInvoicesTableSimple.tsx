/**
 * AR INVOICES TABLE SIMPLE
 * Simple table to display AR invoices with JSON:API structure
 * Following successful pattern from AP invoices with AR-specific fields
 */

'use client'

import React from 'react'
import type { ARInvoice } from '../types'

interface ARInvoicesTableSimpleProps {
  arInvoices?: ARInvoice[]
  isLoading?: boolean
  onView?: (id: string) => void
  onEdit?: (id: string) => void
}

export const ARInvoicesTableSimple = ({
  arInvoices = [],
  isLoading = false,
  onView,
  onEdit
}: ARInvoicesTableSimpleProps) => {
  // Debug logs
  console.log('📊 [ARInvoicesTableSimple] Debug info:', {
    arInvoicesReceived: arInvoices,
    arInvoicesLength: arInvoices?.length,
    firstInvoice: arInvoices?.[0],
    isLoading
  })

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('es-ES')
    } catch {
      return '-'
    }
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
    const statusConfig = {
      draft: { class: 'badge bg-secondary', text: 'Borrador' },
      sent: { class: 'badge bg-primary', text: 'Enviada' },
      paid: { class: 'badge bg-success', text: 'Cobrada' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { class: 'badge bg-light text-dark', text: status }
    
    return (
      <span className={config.class}>
        {config.text}
      </span>
    )
  }

  const getPriorityBadge = (dueDate: string, status: string) => {
    if (status === 'paid') return null
    
    const due = new Date(dueDate)
    const today = new Date()
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return <span className="badge bg-danger ms-1">Vencida</span>
    }
    if (diffDays <= 7) {
      return <span className="badge bg-warning ms-1">Por vencer</span>
    }
    return null
  }

  const getCollectionPercentage = (total: number, collected: number) => {
    if (total === 0) return 0
    return Math.round((collected / total) * 100)
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

  if (!arInvoices || arInvoices.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-receipt text-muted mb-3" style={{ fontSize: '3rem' }} />
        <h4 className="text-muted">No hay facturas</h4>
        <p className="text-muted">No se encontraron facturas de clientes para mostrar.</p>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th>Número</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Vencimiento</th>
            <th>Total</th>
            <th>Cobrado</th>
            <th>Saldo</th>
            <th>Estado</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {arInvoices.map((invoice) => {
            const totalNumber = typeof invoice.totalAmount === 'string' ? parseFloat(invoice.totalAmount) : invoice.totalAmount
            const collectionPercentage = getCollectionPercentage(totalNumber, invoice.paidAmount)
            
            return (
              <tr key={invoice.id}>
                <td>
                  <strong>{invoice.invoiceNumber}</strong>
                </td>
                <td>
                  <span className={invoice.contactName?.startsWith('Cliente ID:') ? 'text-muted' : 'text-dark'}>
                    {invoice.contactName || `Cliente ID: ${invoice.contactId}`}
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
                  {invoice.paidAmount > 0 ? (
                    <>
                      <strong className="text-success">
                        {formatCurrency(invoice.paidAmount)}
                      </strong>
                      <div className="small text-muted">
                        {collectionPercentage}% cobrado
                      </div>
                    </>
                  ) : (
                    <span className="text-muted">Sin cobros</span>
                  )}
                </td>
                <td>
                  {invoice.status === 'paid' ? (
                    <span className="text-success">Cobrada</span>
                  ) : (
                    <strong className="text-primary">
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
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => onView?.(invoice.id)}
                        title="Ver factura"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                    )}
                    {onEdit && invoice.status === 'draft' && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => onEdit(invoice.id)}
                        title="Editar factura"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                    )}
                    {invoice.status === 'sent' && (invoice.totalAmount - invoice.paidAmount) > 0 && (
                      <button
                        type="button"
                        className="btn btn-outline-success"
                        onClick={() => onView?.(invoice.id)}
                        title="Cobrar factura"
                      >
                        <i className="bi bi-wallet2"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}