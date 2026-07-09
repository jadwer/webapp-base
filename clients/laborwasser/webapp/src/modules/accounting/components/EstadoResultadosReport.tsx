/**
 * ESTADO DE RESULTADOS REPORT - Utilidades y pérdidas
 * API: /api/v1/accounting/reports/estado-resultados ✅ FUNCIONANDO
 * Reporte de ingresos, gastos y utilidad neta con datos reales
 */

'use client'

import React, { useState } from 'react'
import { useEstadoResultados } from '../hooks/useReports'
import { Button } from '@/ui/components/base/Button'
import type { EstadoResultadosAccount } from '../services/reportsService'

export const EstadoResultadosReport = () => {
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  
  const { estadoResultados, isLoading, error } = useEstadoResultados(
    startDate || undefined, 
    endDate || undefined
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  const AccountSection = ({ title, accounts, total, type }: {
    title: string;
    accounts: EstadoResultadosAccount[];
    total: number;
    type: 'revenue' | 'expenses';
  }) => {
    const colorClass = type === 'revenue' ? 'text-success' : 'text-danger'

    return (
      <div className="mb-4">
        <h5 className={`${colorClass} mb-3`}>
          <i className={`bi ${type === 'revenue' ? 'bi-graph-up-arrow' : 'bi-graph-down-arrow'} me-2`}></i>
          {title}
        </h5>
        
        {accounts.length === 0 ? (
          <div className="text-muted text-center py-3 bg-light rounded">
            Sin movimientos en este período
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm">
              <thead className="table-light">
                <tr>
                  <th>Código</th>
                  <th>Cuenta</th>
                  <th className="text-end">Importe</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account, index) => (
                  <tr key={`${account.account_code}-${index}`}>
                    <td>
                      <code className="bg-light px-2 py-1 rounded small">
                        {account.account_code}
                      </code>
                    </td>
                    <td>{account.account_name}</td>
                    <td className="text-end">
                      <span className={account.balance >= 0 ? 'text-success' : 'text-danger'}>
                        {formatCurrency(Math.abs(account.balance))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className={`table-${type === 'revenue' ? 'success' : 'danger'}`}>
                  <td colSpan={2}><strong>Total {title}</strong></td>
                  <td className="text-end">
                    <strong>{formatCurrency(Math.abs(total))}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Cargando Estado de Resultados...</span>
        </div>
        <p className="text-muted">Calculando utilidades y pérdidas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h5 className="alert-heading">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Error al cargar Estado de Resultados
        </h5>
        <p className="mb-0">
          No se pudo obtener la información de ingresos y gastos.
        </p>
      </div>
    )
  }

  if (!estadoResultados?.data || !estadoResultados.data.revenue || !estadoResultados.data.expenses) {
    return (
      <div className="alert alert-info">
        <h5 className="alert-heading">
          <i className="bi bi-info-circle me-2"></i>
          Sin información disponible
        </h5>
        <p className="mb-0">
          No hay movimientos registrados para el período seleccionado.
        </p>
      </div>
    )
  }

  const netIncome = estadoResultados.data.net_income
  const isProfit = netIncome >= 0

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-graph-up me-3 text-primary"></i>
                Estado de Resultados
              </h1>
              <p className="text-muted mb-0">
                Utilidades y pérdidas del período
                {startDate && endDate && ` (${startDate} al ${endDate})`}
              </p>
            </div>
            
            {/* Filtros de fecha */}
            <div className="d-flex gap-2">
              <input
                type="date"
                className="form-control form-control-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Fecha inicio"
              />
              <input
                type="date"
                className="form-control form-control-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Fecha fin"
              />
              <Button
                variant="primary"
                size="small"
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                }}
                disabled={!startDate && !endDate}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Limpiar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Resultado Neto - Destacado */}
      <div className="row mb-4">
        <div className="col-12">
          <div className={`alert ${isProfit ? 'alert-success' : 'alert-danger'}`}>
            <div className="row align-items-center">
              <div className="col-md-8">
                <h4 className="alert-heading mb-1">
                  <i className={`bi ${isProfit ? 'bi-graph-up-arrow' : 'bi-graph-down-arrow'} me-2`}></i>
                  {isProfit ? 'UTILIDAD NETA' : 'PÉRDIDA NETA'}
                </h4>
                <p className="mb-0">
                  {isProfit ? 'La empresa generó ganancias en este período' : 'La empresa tuvo pérdidas en este período'}
                </p>
              </div>
              <div className="col-md-4 text-md-end">
                <div className="h2 mb-0">
                  {formatCurrency(Math.abs(netIncome))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del Estado de Resultados */}
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              {/* Ingresos */}
              <AccountSection
                title="INGRESOS"
                accounts={estadoResultados.data.revenue.accounts}
                total={estadoResultados.data.revenue.total}
                type="revenue"
              />

              <hr className="my-4" />

              {/* Gastos */}
              <AccountSection
                title="GASTOS"
                accounts={estadoResultados.data.expenses.accounts}
                total={estadoResultados.data.expenses.total}
                type="expenses"
              />

              <hr className="my-4" />

              {/* Resumen Final */}
              <div className="row">
                <div className="col-md-8 offset-md-4">
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <td><strong>Total Ingresos:</strong></td>
                        <td className="text-end text-success">
                          <strong>{formatCurrency(Math.abs(estadoResultados.data.revenue.total))}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Total Gastos:</strong></td>
                        <td className="text-end text-danger">
                          <strong>({formatCurrency(Math.abs(estadoResultados.data.expenses.total))})</strong>
                        </td>
                      </tr>
                      <tr className="border-top">
                        <td className="h5 mb-0">
                          <strong>{isProfit ? 'UTILIDAD NETA:' : 'PÉRDIDA NETA:'}</strong>
                        </td>
                        <td className={`text-end h5 mb-0 ${isProfit ? 'text-success' : 'text-danger'}`}>
                          <strong>{formatCurrency(Math.abs(netIncome))}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Adicionales */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <i className="bi bi-graph-up display-6 text-success mb-2"></i>
              <h5 className="card-title">Ingresos Totales</h5>
              <p className="h4 text-success mb-0">
                {formatCurrency(Math.abs(estadoResultados.data.revenue.total))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <i className="bi bi-graph-down display-6 text-danger mb-2"></i>
              <h5 className="card-title">Gastos Totales</h5>
              <p className="h4 text-danger mb-0">
                {formatCurrency(Math.abs(estadoResultados.data.expenses.total))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <i className={`bi ${isProfit ? 'bi-trophy' : 'bi-exclamation-triangle'} display-6 ${isProfit ? 'text-warning' : 'text-danger'} mb-2`}></i>
              <h5 className="card-title">Margen</h5>
              <p className={`h4 mb-0 ${isProfit ? 'text-success' : 'text-danger'}`}>
                {estadoResultados.data.revenue.total !== 0 
                  ? `${((netIncome / Math.abs(estadoResultados.data.revenue.total)) * 100).toFixed(1)}%`
                  : '0%'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}