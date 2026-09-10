/**
 * JOURNAL ENTRIES TABLE SIMPLE
 * Simple table to display journal entries with JSON:API structure
 * Following successful pattern from finance module
 */

'use client'

import React from 'react'
import type { JournalEntry } from '../types'

interface JournalEntriesTableSimpleProps {
  journalEntries?: JournalEntry[]
  isLoading?: boolean
  onView?: (id: string) => void
  onEdit?: (id: string) => void
}

export const JournalEntriesTableSimple = ({
  journalEntries = [],
  isLoading = false,
  onView,
  onEdit
}: JournalEntriesTableSimpleProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('es-ES')
    } catch {
      return '-'
    }
  }

  const formatCurrency = (amount?: string | number) => {
    if (amount === undefined || amount === null) return '-'
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return '-'
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(numAmount)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { class: 'badge bg-secondary', text: 'Borrador', icon: 'bi-pencil' },
      posted: { class: 'badge bg-success', text: 'Contabilizado', icon: 'bi-check-circle' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { class: 'badge bg-light text-dark', text: status, icon: 'bi-question-circle' }
    
    return (
      <span className={config.class}>
        <i className={`${config.icon} me-1`}></i>
        {config.text}
      </span>
    )
  }

  const getSourceTypeBadge = (sourceType?: string) => {
    if (!sourceType) return null
    
    const sourceConfig = {
      ap_payment: { class: 'badge bg-danger', text: 'Pago AP', icon: 'bi-credit-card' },
      ar_receipt: { class: 'badge bg-success', text: 'Cobro AR', icon: 'bi-wallet2' },
      ap_invoice: { class: 'badge bg-warning text-dark', text: 'Factura AP', icon: 'bi-receipt' },
      ar_invoice: { class: 'badge bg-info', text: 'Factura AR', icon: 'bi-receipt-cutoff' },
      manual: { class: 'badge bg-primary', text: 'Manual', icon: 'bi-pencil-square' }
    }
    
    const config = sourceConfig[sourceType as keyof typeof sourceConfig] || 
                   { class: 'badge bg-light text-dark', text: sourceType, icon: 'bi-question-circle' }
    
    return (
      <span className={config.class}>
        <i className={`${config.icon} me-1`}></i>
        {config.text}
      </span>
    )
  }

  const isBalanced = (debit: number, credit: number) => {
    return Math.abs(debit - credit) < 0.01
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="text-muted mt-2">Cargando asientos contables...</p>
      </div>
    )
  }

  if (!journalEntries || journalEntries.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-journal-text text-muted mb-3" style={{ fontSize: '3rem' }} />
        <h4 className="text-muted">No hay asientos contables</h4>
        <p className="text-muted">No se encontraron asientos contables para mostrar.</p>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th>Número</th>
            <th>Fecha</th>
            <th>Descripción</th>
            <th>Origen</th>
            <th>Débito</th>
            <th>Crédito</th>
            <th>Balance</th>
            <th>Estado</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {journalEntries.map((entry) => {
            const balanced = isBalanced(entry.totalDebit, entry.totalCredit)
            
            return (
              <tr key={entry.id}>
                <td>
                  <code className="bg-light px-2 py-1 rounded">
                    {entry.number}
                  </code>
                  {entry.reference && (
                    <div className="small text-muted">
                      Ref: {entry.reference}
                    </div>
                  )}
                </td>
                <td>
                  {formatDate(entry.date)}
                  {entry.postedAt && entry.status === 'posted' && (
                    <div className="small text-muted">
                      Contabilizado: {formatDate(entry.postedAt)}
                    </div>
                  )}
                </td>
                <td>
                  <strong>{entry.description}</strong>
                  {entry.sourceId && (
                    <div className="small text-muted">
                      ID: {entry.sourceId}
                    </div>
                  )}
                </td>
                <td>
                  {getSourceTypeBadge(entry.sourceType)}
                </td>
                <td>
                  <strong className="text-success">
                    {formatCurrency(entry.totalDebit)}
                  </strong>
                </td>
                <td>
                  <strong className="text-primary">
                    {formatCurrency(entry.totalCredit)}
                  </strong>
                </td>
                <td>
                  {balanced ? (
                    <span className="badge bg-success">
                      <i className="bi bi-check-circle me-1"></i>
                      Balanceado
                    </span>
                  ) : (
                    <span className="badge bg-danger">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      Desbalanceado
                    </span>
                  )}
                </td>
                <td>
                  {getStatusBadge(entry.status)}
                </td>
                <td className="text-end">
                  <div className="btn-group btn-group-sm">
                    {onView && (
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => onView(entry.id)}
                        title="Ver asiento"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                    )}
                    {onEdit && entry.status === 'draft' && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => onEdit(entry.id)}
                        title="Editar asiento"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                    )}
                    {entry.status === 'draft' && balanced && onView && (
                      <button
                        type="button"
                        className="btn btn-outline-success"
                        onClick={() => onView(entry.id)}
                        title="Contabilizar asiento"
                      >
                        <i className="bi bi-check-circle"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Summary Footer */}
      <div className="p-3 bg-light border-top">
        <div className="row text-center">
          <div className="col-md-3">
            <small className="text-muted">Total asientos:</small>
            <div className="fw-bold">{journalEntries.length}</div>
          </div>
          <div className="col-md-3">
            <small className="text-muted">Débitos totales:</small>
            <div className="fw-bold text-success">
              {formatCurrency(journalEntries.reduce((sum, entry) => sum + (entry.totalDebit || 0), 0))}
            </div>
          </div>
          <div className="col-md-3">
            <small className="text-muted">Créditos totales:</small>
            <div className="fw-bold text-primary">
              {formatCurrency(journalEntries.reduce((sum, entry) => sum + (entry.totalCredit || 0), 0))}
            </div>
          </div>
          <div className="col-md-3">
            <small className="text-muted">Balanceados:</small>
            <div className="fw-bold text-success">
              {journalEntries.filter(entry => 
                isBalanced(entry.totalDebit, entry.totalCredit)
              ).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}