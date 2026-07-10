/**
 * Comisiones - Reporte por vendedor
 *
 * Tabla agregada del endpoint by-employee, con filtro de periodo.
 */

'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/formatters'
import { useCommissionsByEmployee } from '../hooks'
import { DATE_PRESETS, getPresetDates } from '@/modules/reports/utils/datePresets'

export const CommissionsByEmployeePage: React.FC = () => {
  const [datePreset, setDatePreset] = useState('thisMonth')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const { startDate, endDate } = useMemo(() => {
    if (datePreset === 'custom') {
      const today = new Date().toISOString().split('T')[0]
      return {
        startDate: customStartDate || today,
        endDate: customEndDate || today,
      }
    }
    return getPresetDates(datePreset)
  }, [datePreset, customStartDate, customEndDate])

  const { employees, isLoading, error } = useCommissionsByEmployee({ startDate, endDate })

  const summary = useMemo(() => {
    return employees.reduce(
      (acc, e) => ({
        commissionsCount: acc.commissionsCount + e.commissionsCount,
        totalBaseAmount: acc.totalBaseAmount + e.totalBaseAmount,
        totalCommissionAmount: acc.totalCommissionAmount + e.totalCommissionAmount,
        earnedAmount: acc.earnedAmount + e.earnedAmount,
        paidAmount: acc.paidAmount + e.paidAmount,
      }),
      { commissionsCount: 0, totalBaseAmount: 0, totalCommissionAmount: 0, earnedAmount: 0, paidAmount: 0 }
    )
  }, [employees])

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-bar-chart me-3" />
                Comisiones por Vendedor
              </h1>
              <p className="text-muted mb-0">
                Comisiones ganadas y pagadas agrupadas por vendedor en el periodo
              </p>
            </div>
            <Link href="/dashboard/commissions" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-1" />
              Volver a comisiones
            </Link>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-3 col-lg-2">
              <label className="form-label small text-muted mb-1">Periodo</label>
              <select className="form-select" value={datePreset} onChange={(e) => setDatePreset(e.target.value)}>
                {DATE_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            {datePreset === 'custom' && (
              <>
                <div className="col-6 col-md-2">
                  <label className="form-label small text-muted mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    className="form-control"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="col-6 col-md-2">
                  <label className="form-label small text-muted mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    className="form-control"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2" />
          Error al cargar el reporte por vendedor.
        </div>
      )}

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Comisiones por vendedor</h6>
          {employees.length > 0 && (
            <span className="badge bg-success fs-6">Total: {formatCurrency(summary.totalCommissionAmount)}</span>
          )}
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : employees.length ? (
            <div className="table-responsive">
              <table className="table table-sm table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Vendedor</th>
                    <th className="text-center">Comisiones</th>
                    <th className="text-end">Base Total</th>
                    <th className="text-end">Comision Total</th>
                    <th className="text-end">Ganada</th>
                    <th className="text-end">Pagada</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e) => (
                    <tr key={e.userId}>
                      <td>
                        <div>{e.userName || <span className="text-muted">Sin nombre</span>}</div>
                        {e.userEmail && <div className="small text-muted">{e.userEmail}</div>}
                      </td>
                      <td className="text-center">
                        <span className="badge bg-primary">{e.commissionsCount}</span>
                      </td>
                      <td className="text-end">{formatCurrency(e.totalBaseAmount)}</td>
                      <td className="text-end">
                        <strong>{formatCurrency(e.totalCommissionAmount)}</strong>
                      </td>
                      <td className="text-end text-info">{formatCurrency(e.earnedAmount)}</td>
                      <td className="text-end text-success">{formatCurrency(e.paidAmount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-light fw-bold">
                  <tr>
                    <td>Totales</td>
                    <td className="text-center">{summary.commissionsCount}</td>
                    <td className="text-end">{formatCurrency(summary.totalBaseAmount)}</td>
                    <td className="text-end">{formatCurrency(summary.totalCommissionAmount)}</td>
                    <td className="text-end text-info">{formatCurrency(summary.earnedAmount)}</td>
                    <td className="text-end text-success">{formatCurrency(summary.paidAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="alert alert-info mb-0">
              No hay comisiones en este periodo
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CommissionsByEmployeePage
