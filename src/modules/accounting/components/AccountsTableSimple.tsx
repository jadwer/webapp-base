/**
 * ACCOUNTS TABLE SIMPLE
 * Simple table to display Chart of Accounts with JSON:API structure
 * Following successful pattern from finance module
 */

'use client'

import React from 'react'
import type { Account } from '../types'

interface AccountsTableSimpleProps {
  accounts?: Account[]
  isLoading?: boolean
  onView?: (id: string) => void
  onEdit?: (id: string) => void
}

export const AccountsTableSimple = ({
  accounts = [],
  isLoading = false,
  onView,
  onEdit
}: AccountsTableSimpleProps) => {
  // Debug logs
  console.log('📊 [AccountsTableSimple] Debug info:', {
    accountsReceived: accounts,
    accountsLength: accounts?.length,
    firstAccount: accounts?.[0],
    isLoading
  })

  const getAccountTypeBadge = (accountType: string) => {
    const typeConfig = {
      asset: { class: 'badge bg-success', text: 'Activo', icon: 'bi-building' },
      liability: { class: 'badge bg-danger', text: 'Pasivo', icon: 'bi-credit-card' },
      equity: { class: 'badge bg-primary', text: 'Capital', icon: 'bi-bank' },
      revenue: { class: 'badge bg-info', text: 'Ingreso', icon: 'bi-arrow-down-circle' },
      expense: { class: 'badge bg-warning text-dark', text: 'Gasto', icon: 'bi-arrow-up-circle' }
    }
    
    const config = typeConfig[accountType as keyof typeof typeConfig] || 
                   { class: 'badge bg-light text-dark', text: accountType, icon: 'bi-question-circle' }
    
    return (
      <span className={config.class}>
        <i className={`${config.icon} me-1`}></i>
        {config.text}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { class: 'badge bg-success', text: 'Activa' },
      inactive: { class: 'badge bg-secondary', text: 'Inactiva' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { class: 'badge bg-light text-dark', text: status }
    
    return (
      <span className={config.class}>
        {config.text}
      </span>
    )
  }

  const getLevelIndentation = (level: number) => {
    // Limit indentation to max 5 levels for better UX
    const effectiveLevel = Math.min(level - 1, 5)
    return '—'.repeat(Math.max(0, effectiveLevel))
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="text-muted mt-2">Cargando catálogo de cuentas...</p>
      </div>
    )
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-list-columns-reverse text-muted mb-3" style={{ fontSize: '3rem' }} />
        <h4 className="text-muted">No hay cuentas</h4>
        <p className="text-muted">No se encontraron cuentas contables para mostrar.</p>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Nivel</th>
            <th>Moneda</th>
            <th>Movimiento</th>
            <th>Estado</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr key={account.id}>
              <td>
                <code className="bg-light px-2 py-1 rounded">
                  {account.code}
                </code>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <span className="text-muted me-2">
                    {getLevelIndentation(account.level)}
                  </span>
                  <strong>{account.name}</strong>
                </div>
                {account.level > 1 && account.parentId && (
                  <div className="small text-muted">
                    Subcuenta de: {account.parentId}
                  </div>
                )}
              </td>
              <td>
                {getAccountTypeBadge(account.accountType)}
              </td>
              <td>
                <span className="badge bg-light text-dark">
                  Nivel {account.level}
                </span>
              </td>
              <td>
                <span className="text-muted">{account.currency}</span>
              </td>
              <td>
                {account.isPostable ? (
                  <span className="badge bg-success">
                    <i className="bi bi-check-circle me-1"></i>
                    Sí
                  </span>
                ) : (
                  <span className="badge bg-secondary">
                    <i className="bi bi-dash-circle me-1"></i>
                    No
                  </span>
                )}
              </td>
              <td>
                {getStatusBadge(account.status)}
              </td>
              <td className="text-end">
                <div className="btn-group btn-group-sm">
                  {onView && (
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => onView(account.id)}
                      title="Ver cuenta"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                  )}
                  {onEdit && account.status === 'active' && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => onEdit(account.id)}
                      title="Editar cuenta"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Footer */}
      <div className="p-3 bg-light border-top">
        <div className="row text-center">
          <div className="col-md-3">
            <small className="text-muted">Total de cuentas:</small>
            <div className="fw-bold">{accounts.length}</div>
          </div>
          <div className="col-md-3">
            <small className="text-muted">Cuentas de movimiento:</small>
            <div className="fw-bold text-success">
              {accounts.filter(acc => acc.isPostable).length}
            </div>
          </div>
          <div className="col-md-3">
            <small className="text-muted">Cuentas activas:</small>
            <div className="fw-bold text-primary">
              {accounts.filter(acc => acc.status === 'active').length}
            </div>
          </div>
          <div className="col-md-3">
            <small className="text-muted">Niveles máximo:</small>
            <div className="fw-bold">
              {Math.max(...accounts.map(acc => acc.level), 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}