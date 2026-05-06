/**
 * Financial Statements Page - Balance Sheet, Income Statement, Cash Flow, Trial Balance
 */

'use client'

import React, { useState } from 'react'
import { useBalanceSheet, useIncomeStatement, useCashFlow, useTrialBalance } from '../hooks'

export const FinancialStatementsPage = () => {
  // Today's date for defaults
  const today = new Date().toISOString().split('T')[0]
  const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]

  // Filters
  const [asOfDate, setAsOfDate] = useState(today)
  const [startDate, setStartDate] = useState(firstDayOfYear)
  const [endDate, setEndDate] = useState(today)
  const [currency, setCurrency] = useState('MXN')

  // Fetch reports
  const { balanceSheet, isLoading: loadingBS, error: errorBS } = useBalanceSheet({ asOfDate, currency })
  const { incomeStatement, isLoading: loadingIS, error: errorIS } = useIncomeStatement({ startDate, endDate, currency })
  const { cashFlow, isLoading: loadingCF, error: errorCF } = useCashFlow({ startDate, endDate, currency })
  const { trialBalance, isLoading: loadingTB, error: errorTB } = useTrialBalance({ asOfDate, currency })

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '$0.00'
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-file-earmark-text me-3" />
                Estados Financieros
              </h1>
              <p className="text-muted">
                Balance General, Estado de Resultados, Flujo de Efectivo y Balanza de Comprobacion
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-3">
              <label htmlFor="asOfDate" className="form-label small text-muted mb-1">
                Fecha de Corte (Balance y Balanza)
              </label>
              <input
                id="asOfDate"
                type="date"
                className="form-control"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-3">
              <label htmlFor="startDate" className="form-label small text-muted mb-1">
                Fecha Inicio (Estado/Flujo)
              </label>
              <input
                id="startDate"
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-3">
              <label htmlFor="endDate" className="form-label small text-muted mb-1">
                Fecha Fin (Estado/Flujo)
              </label>
              <input
                id="endDate"
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-3">
              <label htmlFor="currency" className="form-label small text-muted mb-1">
                Moneda
              </label>
              <select
                id="currency"
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="USD">USD - Dolar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Sheet */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-table me-2" />
            Balance General (Balance Sheet)
          </h5>
        </div>
        <div className="card-body">
          {loadingBS && (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted mt-2">Generando balance general...</p>
            </div>
          )}
          {errorBS && (
            <div className="alert alert-warning">
              <i className="bi bi-info-circle me-2" />
              No hay datos disponibles para el balance general en este periodo
            </div>
          )}
          {!loadingBS && !errorBS && balanceSheet && (
            <div className="row">
              <div className="col-12 col-md-6">
                <h6 className="text-primary">Activos</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Total Activos</span>
                  <strong className="text-success">{formatCurrency(balanceSheet.totalAssets)}</strong>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <h6 className="text-danger">Pasivos + Capital</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Total Pasivos</span>
                  <strong className="text-danger">{formatCurrency(balanceSheet.totalLiabilities)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Total Capital</span>
                  <strong className="text-info">{formatCurrency(balanceSheet.totalEquity)}</strong>
                </div>
              </div>
              <div className="col-12 mt-3">
                <div className={`alert ${balanceSheet.balanced ? 'alert-success' : 'alert-danger'}`}>
                  <i className={`bi ${balanceSheet.balanced ? 'bi-check-circle' : 'bi-x-circle'} me-2`} />
                  Balance {balanceSheet.balanced ? 'Cuadrado' : 'Descuadrado'}
                </div>
              </div>
            </div>
          )}
          {!loadingBS && !errorBS && !balanceSheet && (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-inbox display-4 d-block mb-3" />
              No hay datos para mostrar
            </div>
          )}
        </div>
      </div>

      {/* Income Statement */}
      <div className="card mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">
            <i className="bi bi-graph-up me-2" />
            Estado de Resultados (Income Statement)
          </h5>
        </div>
        <div className="card-body">
          {loadingIS && (
            <div className="text-center py-4">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted mt-2">Generando estado de resultados...</p>
            </div>
          )}
          {errorIS && (
            <div className="alert alert-warning">
              <i className="bi bi-info-circle me-2" />
              No hay datos disponibles para el estado de resultados en este periodo
            </div>
          )}
          {!loadingIS && !errorIS && incomeStatement && (
            <div>
              <div className="row">
                <div className="col-12 col-md-6">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Utilidad Bruta</span>
                    <strong>{formatCurrency(incomeStatement.grossProfit)}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Margen Bruto</span>
                    <span className="badge bg-info">{(incomeStatement.grossProfitMargin || 0).toFixed(2)}%</span>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Utilidad Neta</span>
                    <strong className={(incomeStatement.netIncome || 0) >= 0 ? 'text-success' : 'text-danger'}>
                      {formatCurrency(incomeStatement.netIncome)}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Margen Neto</span>
                    <span className={`badge ${(incomeStatement.netProfitMargin || 0) >= 0 ? 'bg-success' : 'bg-danger'}`}>
                      {(incomeStatement.netProfitMargin || 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!loadingIS && !errorIS && !incomeStatement && (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-inbox display-4 d-block mb-3" />
              No hay datos para mostrar
            </div>
          )}
        </div>
      </div>

      {/* Cash Flow */}
      <div className="card mb-4">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">
            <i className="bi bi-cash-stack me-2" />
            Flujo de Efectivo (Cash Flow)
          </h5>
        </div>
        <div className="card-body">
          {loadingCF && (
            <div className="text-center py-4">
              <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted mt-2">Generando flujo de efectivo...</p>
            </div>
          )}
          {errorCF && (
            <div className="alert alert-warning">
              <i className="bi bi-info-circle me-2" />
              No hay datos disponibles para el flujo de efectivo en este periodo
            </div>
          )}
          {!loadingCF && !errorCF && cashFlow && (
            <div className="row">
              <div className="col-12 col-md-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Efectivo Inicial</span>
                  <strong>{formatCurrency(cashFlow.beginningCash)}</strong>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Cambio Neto</span>
                  <strong className={(cashFlow.netCashChange || 0) >= 0 ? 'text-success' : 'text-danger'}>
                    {(cashFlow.netCashChange || 0) >= 0 ? '+' : ''}{formatCurrency(cashFlow.netCashChange)}
                  </strong>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Efectivo Final</span>
                  <strong className="text-primary">{formatCurrency(cashFlow.endingCash)}</strong>
                </div>
              </div>
            </div>
          )}
          {!loadingCF && !errorCF && !cashFlow && (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-inbox display-4 d-block mb-3" />
              No hay datos para mostrar
            </div>
          )}
        </div>
      </div>

      {/* Trial Balance */}
      <div className="card mb-4">
        <div className="card-header bg-secondary text-white">
          <h5 className="mb-0">
            <i className="bi bi-calculator me-2" />
            Balanza de Comprobacion (Trial Balance)
          </h5>
        </div>
        <div className="card-body">
          {loadingTB && (
            <div className="text-center py-4">
              <div className="spinner-border text-secondary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted mt-2">Generando balanza de comprobacion...</p>
            </div>
          )}
          {errorTB && (
            <div className="alert alert-warning">
              <i className="bi bi-info-circle me-2" />
              No hay datos disponibles para la balanza de comprobacion en este periodo
            </div>
          )}
          {!loadingTB && !errorTB && trialBalance && (
            <div>
              <div className="row mb-3">
                <div className="col-12 col-md-6">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Total Cargos</span>
                    <strong>{formatCurrency(trialBalance.totalDebit)}</strong>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Total Abonos</span>
                    <strong>{formatCurrency(trialBalance.totalCredit)}</strong>
                  </div>
                </div>
              </div>
              <div className={`alert ${trialBalance.balanced ? 'alert-success' : 'alert-danger'}`}>
                <i className={`bi ${trialBalance.balanced ? 'bi-check-circle' : 'bi-x-circle'} me-2`} />
                Balanza {trialBalance.balanced ? 'Cuadrada' : 'Descuadrada'}
              </div>
            </div>
          )}
          {!loadingTB && !errorTB && !trialBalance && (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-inbox display-4 d-block mb-3" />
              No hay datos para mostrar
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
