/**
 * BALANZA DE COMPROBACIÓN REPORT - Verificación contable
 * API: /api/v1/accounting/reports/balanza-comprobacion ✅ FUNCIONANDO
 * Reporte que muestra débitos, créditos y saldos de todas las cuentas
 */

'use client'

import React, { useState } from 'react'
import { useBalanzaComprobacion } from '../hooks/useReports'
import { Button } from '@/ui/components/base/Button'

export const BalanzaComprobacionReport = () => {
  const [endDate, setEndDate] = useState<string>('')
  const { balanzaComprobacion, isLoading, error } = useBalanzaComprobacion(endDate || undefined)

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(numAmount)
  }

  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType.toLowerCase()) {
      case 'asset':
        return 'bi-building'
      case 'liability':
        return 'bi-credit-card'
      case 'equity':
        return 'bi-pie-chart'
      case 'revenue':
        return 'bi-graph-up-arrow'
      case 'expense':
        return 'bi-graph-down-arrow'
      default:
        return 'bi-circle'
    }
  }

  const getAccountTypeName = (accountType: string) => {
    switch (accountType.toLowerCase()) {
      case 'asset':
        return 'Activo'
      case 'liability':
        return 'Pasivo'
      case 'equity':
        return 'Capital'
      case 'revenue':
        return 'Ingreso'
      case 'expense':
        return 'Gasto'
      default:
        return accountType
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Cargando Balanza de Comprobación...</span>
        </div>
        <p className="text-muted">Verificando balances contables...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h5 className="alert-heading">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Error al cargar Balanza de Comprobación
        </h5>
        <p className="mb-0">
          No se pudo obtener la información de los balances contables.
        </p>
      </div>
    )
  }

  if (!balanzaComprobacion?.data || balanzaComprobacion.data.length === 0) {
    return (
      <div className="alert alert-info">
        <h5 className="alert-heading">
          <i className="bi bi-info-circle me-2"></i>
          Sin información disponible
        </h5>
        <p className="mb-0">
          No hay movimientos contables registrados para generar la balanza.
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
                <i className="bi bi-balance-scale me-3 text-primary"></i>
                Balanza de Comprobación
              </h1>
              <p className="text-muted mb-0">
                Verificación de débitos, créditos y saldos
                {endDate && ` al ${endDate}`}
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

      {/* Estado del Balance */}
      <div className="row mb-4">
        <div className="col-12">
          <div className={`alert ${balanzaComprobacion.totals.balanced ? 'alert-success' : 'alert-warning'}`}>
            <div className="row align-items-center">
              <div className="col-md-8">
                <h5 className="alert-heading mb-1">
                  <i className={`bi ${balanzaComprobacion.totals.balanced ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                  Verificación de Balance: {balanzaComprobacion.totals.balanced ? 'CORRECTO' : 'DESBALANCEADO'}
                </h5>
                <p className="mb-0">
                  {balanzaComprobacion.totals.balanced 
                    ? 'Los débitos y créditos están balanceados correctamente'
                    : 'Existe una diferencia entre débitos y créditos que debe ser revisada'
                  }
                </p>
              </div>
              <div className="col-md-4">
                <div className="text-md-end">
                  <div className="small text-muted">Diferencia</div>
                  <div className={`h5 mb-0 ${balanzaComprobacion.totals.balanced ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(balanzaComprobacion.totals.total_debits - balanzaComprobacion.totals.total_credits)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Totales */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center border-success">
            <div className="card-body">
              <i className="bi bi-plus-circle display-6 text-success mb-2"></i>
              <h5 className="card-title">Total Débitos</h5>
              <p className="h4 text-success mb-0">
                {formatCurrency(balanzaComprobacion.totals.total_debits)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card text-center border-danger">
            <div className="card-body">
              <i className="bi bi-dash-circle display-6 text-danger mb-2"></i>
              <h5 className="card-title">Total Créditos</h5>
              <p className="h4 text-danger mb-0">
                {formatCurrency(balanzaComprobacion.totals.total_credits)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className={`card text-center border-${balanzaComprobacion.totals.balanced ? 'success' : 'warning'}`}>
            <div className="card-body">
              <i className={`bi ${balanzaComprobacion.totals.balanced ? 'bi-check-circle' : 'bi-exclamation-triangle'} display-6 text-${balanzaComprobacion.totals.balanced ? 'success' : 'warning'} mb-2`}></i>
              <h5 className="card-title">Estado</h5>
              <p className={`h5 text-${balanzaComprobacion.totals.balanced ? 'success' : 'warning'} mb-0`}>
                {balanzaComprobacion.totals.balanced ? 'Balanceado' : 'Desbalanceado'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Cuentas */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                Detalle por Cuenta
                <span className="badge bg-primary ms-2">{balanzaComprobacion.data.length} cuentas</span>
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover table-striped mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th style={{width: '100px'}}>Código</th>
                      <th>Cuenta</th>
                      <th style={{width: '100px'}}>Tipo</th>
                      <th className="text-end" style={{width: '150px'}}>Débitos</th>
                      <th className="text-end" style={{width: '150px'}}>Créditos</th>
                      <th className="text-end" style={{width: '150px'}}>Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balanzaComprobacion.data.map((account, index) => (
                      <tr key={`${account.account_code}-${index}`}>
                        <td>
                          <code className="bg-light px-2 py-1 rounded">
                            {account.account_code}
                          </code>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className={`bi ${getAccountTypeIcon(account.account_type)} me-2 text-muted`}></i>
                            {account.account_name}
                          </div>
                        </td>
                        <td>
                          <span className={`badge bg-outline-secondary`}>
                            {getAccountTypeName(account.account_type)}
                          </span>
                        </td>
                        <td className="text-end">
                          <span className="text-success">
                            {formatCurrency(parseFloat(account.debits))}
                          </span>
                        </td>
                        <td className="text-end">
                          <span className="text-danger">
                            {formatCurrency(parseFloat(account.credits))}
                          </span>
                        </td>
                        <td className="text-end">
                          <span className={`fw-bold ${account.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                            {formatCurrency(account.balance)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-dark">
                    <tr>
                      <td colSpan={3}><strong>TOTALES</strong></td>
                      <td className="text-end">
                        <strong className="text-success">
                          {formatCurrency(balanzaComprobacion.totals.total_debits)}
                        </strong>
                      </td>
                      <td className="text-end">
                        <strong className="text-danger">
                          {formatCurrency(balanzaComprobacion.totals.total_credits)}
                        </strong>
                      </td>
                      <td className="text-end">
                        <strong className={balanzaComprobacion.totals.balanced ? 'text-success' : 'text-warning'}>
                          {formatCurrency(balanzaComprobacion.totals.total_debits - balanzaComprobacion.totals.total_credits)}
                        </strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}