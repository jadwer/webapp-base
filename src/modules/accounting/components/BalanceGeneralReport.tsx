/**
 * BALANCE GENERAL REPORT - Interfaz profesional
 * API: /api/v1/accounting/reports/balance-general ✅ FUNCIONANDO
 * Estado financiero en tiempo real con datos reales del backend
 */

'use client'

import React, { useState } from 'react'
import { useBalanceGeneral } from '../hooks/useReports'
import { Button } from '@/ui/components/base/Button'
import type { BalanceGeneralAccount } from '../services/reportsService'

export const BalanceGeneralReport = () => {
  const [endDate, setEndDate] = useState<string>('')
  const { balanceGeneral, isLoading, error } = useBalanceGeneral(endDate || undefined)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const AccountSection = ({ title, accounts, total, type }: {
    title: string;
    accounts: BalanceGeneralAccount[];
    total: number;
    type: 'assets' | 'liabilities' | 'equity';
  }) => {
    const colorClass = type === 'assets' ? 'text-success' : type === 'liabilities' ? 'text-danger' : 'text-primary'
    
    return (
      <div className="mb-4">
        <h5 className={`${colorClass} mb-3`}>
          <i className={`bi ${type === 'assets' ? 'bi-building' : type === 'liabilities' ? 'bi-credit-card' : 'bi-pie-chart'} me-2`}></i>
          {title}
        </h5>
        
        {accounts.length === 0 ? (
          <div className="text-muted text-center py-3 bg-light rounded">
            Sin cuentas registradas en esta sección
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm">
              <thead className="table-light">
                <tr>
                  <th>Código</th>
                  <th>Cuenta</th>
                  <th className="text-end">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.account_id}>
                    <td>
                      <code className="bg-light px-2 py-1 rounded small">
                        {account.account_code}
                      </code>
                    </td>
                    <td>{account.account_name}</td>
                    <td className="text-end">
                      <span className={account.balance >= 0 ? 'text-success' : 'text-danger'}>
                        {formatCurrency(account.balance)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className={`d-flex justify-content-between align-items-center p-3 bg-light rounded mt-2`}>
          <strong>Total {title}:</strong>
          <strong className={`h5 mb-0 ${colorClass}`}>
            {formatCurrency(total)}
          </strong>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Cargando Balance General...</span>
        </div>
        <p className="text-muted">Consultando estado financiero...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h5 className="alert-heading">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Error al cargar Balance General
        </h5>
        <p className="mb-0">
          No se pudo obtener la información del estado financiero. 
          Verifique la conexión con el servidor.
        </p>
      </div>
    )
  }

  if (!balanceGeneral) {
    return (
      <div className="alert alert-info">
        <h5 className="alert-heading">
          <i className="bi bi-info-circle me-2"></i>
          Sin información disponible
        </h5>
        <p className="mb-0">
          No hay datos contables registrados para generar el Balance General.
        </p>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-clipboard-data me-3 text-primary"></i>
                Balance General
              </h1>
              <p className="text-muted mb-0">
                Estado de situación financiera al {formatDate(balanceGeneral.report_date)}
              </p>
            </div>
            
            {/* Filtros */}
            <div className="d-flex gap-2">
              <input
                type="date"
                className="form-control form-control-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Fecha de corte"
              />
              <Button
                variant="primary"
                size="small"
                onClick={() => setEndDate('')}
                disabled={!endDate}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Limpiar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Status */}
      <div className="row mb-4">
        <div className="col-12">
          <div className={`alert ${balanceGeneral.totals.balanced ? 'alert-success' : 'alert-warning'}`}>
            <div className="d-flex align-items-center">
              <i className={`bi ${balanceGeneral.totals.balanced ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
              <div>
                <strong>
                  Estado del Balance: {balanceGeneral.totals.balanced ? 'Balanceado' : 'Desbalanceado'}
                </strong>
                {!balanceGeneral.totals.balanced && (
                  <div className="small mt-1">
                    Diferencia: {formatCurrency(balanceGeneral.totals.total_assets - balanceGeneral.totals.total_liabilities_equity)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Balance General Content */}
      <div className="row">
        {/* Activos */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <AccountSection
                title="ACTIVOS"
                accounts={balanceGeneral.data.assets.accounts}
                total={balanceGeneral.data.assets.total}
                type="assets"
              />
            </div>
          </div>
        </div>

        {/* Pasivos y Capital */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <AccountSection
                title="PASIVOS"
                accounts={balanceGeneral.data.liabilities.accounts}
                total={balanceGeneral.data.liabilities.total}
                type="liabilities"
              />
              
              <AccountSection
                title="CAPITAL"
                accounts={balanceGeneral.data.equity.accounts}
                total={balanceGeneral.data.equity.total}
                type="equity"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Totales Finales */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-4">
                  <div className="border-end">
                    <div className="h4 text-success mb-1">
                      {formatCurrency(balanceGeneral.totals.total_assets)}
                    </div>
                    <div className="text-muted small">Total Activos</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border-end">
                    <div className="h4 text-danger mb-1">
                      {formatCurrency(balanceGeneral.totals.total_liabilities_equity)}
                    </div>
                    <div className="text-muted small">Total Pasivos + Capital</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className={`h4 mb-1 ${balanceGeneral.totals.balanced ? 'text-success' : 'text-warning'}`}>
                    {balanceGeneral.totals.balanced ? (
                      <i className="bi bi-check-circle me-1"></i>
                    ) : (
                      <i className="bi bi-exclamation-triangle me-1"></i>
                    )}
                    {balanceGeneral.totals.balanced ? 'Balanceado' : 'Desbalanceado'}
                  </div>
                  <div className="text-muted small">Estado del Balance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}