/**
 * Aging Reports Page - AR and AP Aging Reports
 */

'use client'

import React, { useState } from 'react'
import { useARAgingReport, useAPAgingReport } from '../hooks'

export const AgingReportsPage = () => {
  // Today's date for defaults
  const today = new Date().toISOString().split('T')[0]

  // Filters
  const [asOfDate, setAsOfDate] = useState(today)
  const [currency, setCurrency] = useState('USD')

  // Fetch reports
  const { arAgingReport, isLoading: loadingAR, error: errorAR } = useARAgingReport({ asOfDate, currency })
  const { apAgingReport, isLoading: loadingAP, error: errorAP } = useAPAgingReport({ asOfDate, currency })

  const formatCurrency = (amount: number) => {
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
                <i className="bi bi-clock-history me-3" />
                Reportes de Antigüedad
              </h1>
              <p className="text-muted">
                Análisis de Cuentas por Cobrar y Cuentas por Pagar por periodos de vencimiento
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label htmlFor="asOfDate" className="form-label small text-muted mb-1">
                Fecha de Corte
              </label>
              <input
                id="asOfDate"
                type="date"
                className="form-control"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="currency" className="form-label small text-muted mb-1">
                Moneda
              </label>
              <select
                id="currency"
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD - Dólar</option>
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* AR Aging Report */}
      <div className="card mb-4">
        <div className="card-header bg-warning text-white">
          <h5 className="mb-0">
            <i className="bi bi-receipt me-2" />
            Antigüedad de Cuentas por Cobrar (AR)
          </h5>
        </div>
        <div className="card-body">
          {errorAR && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2" />
              Error al cargar el reporte AR
            </div>
          )}
          {loadingAR && (
            <div className="text-center py-4">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted mt-2">Generando reporte de antigüedad AR...</p>
            </div>
          )}
          {arAgingReport && (
            <div>
              {/* Summary Cards */}
              <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                  <div className="card border-success">
                    <div className="card-body py-2">
                      <div className="small text-muted">0-30 días</div>
                      <div className="h5 mb-0 text-success">{formatCurrency(arAgingReport.summary.current)}</div>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-warning">
                    <div className="card-body py-2">
                      <div className="small text-muted">31-60 días</div>
                      <div className="h5 mb-0 text-warning">{formatCurrency(arAgingReport.summary.days30)}</div>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-danger">
                    <div className="card-body py-2">
                      <div className="small text-muted">61-90 días</div>
                      <div className="h5 mb-0 text-danger">{formatCurrency(arAgingReport.summary.days60)}</div>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-dark">
                    <div className="card-body py-2">
                      <div className="small text-muted">90+ días</div>
                      <div className="h5 mb-0 text-dark">{formatCurrency(arAgingReport.summary.days90Plus)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="alert alert-info d-flex justify-content-between align-items-center mb-4">
                <strong>Total por Cobrar:</strong>
                <span className="h4 mb-0">{formatCurrency(arAgingReport.summary.total)}</span>
              </div>

              {/* Customer Details Table */}
              {arAgingReport.customers.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Cliente</th>
                        <th className="text-end">0-30 días</th>
                        <th className="text-end">31-60 días</th>
                        <th className="text-end">61-90 días</th>
                        <th className="text-end">90+ días</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arAgingReport.customers.map((customer) => (
                        <tr key={customer.contactId}>
                          <td>{customer.contactName}</td>
                          <td className="text-end text-success">{formatCurrency(customer.current)}</td>
                          <td className="text-end text-warning">{formatCurrency(customer.days30)}</td>
                          <td className="text-end text-danger">{formatCurrency(customer.days60)}</td>
                          <td className="text-end text-dark">{formatCurrency(customer.days90Plus)}</td>
                          <td className="text-end"><strong>{formatCurrency(customer.total)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-inbox display-4 d-block mb-3" />
                  No hay cuentas por cobrar en este periodo
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AP Aging Report */}
      <div className="card mb-4">
        <div className="card-header bg-danger text-white">
          <h5 className="mb-0">
            <i className="bi bi-receipt me-2" />
            Antigüedad de Cuentas por Pagar (AP)
          </h5>
        </div>
        <div className="card-body">
          {errorAP && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2" />
              Error al cargar el reporte AP
            </div>
          )}
          {loadingAP && (
            <div className="text-center py-4">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted mt-2">Generando reporte de antigüedad AP...</p>
            </div>
          )}
          {apAgingReport && (
            <div>
              {/* Summary Cards */}
              <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                  <div className="card border-success">
                    <div className="card-body py-2">
                      <div className="small text-muted">0-30 días</div>
                      <div className="h5 mb-0 text-success">{formatCurrency(apAgingReport.summary.current)}</div>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-warning">
                    <div className="card-body py-2">
                      <div className="small text-muted">31-60 días</div>
                      <div className="h5 mb-0 text-warning">{formatCurrency(apAgingReport.summary.days30)}</div>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-danger">
                    <div className="card-body py-2">
                      <div className="small text-muted">61-90 días</div>
                      <div className="h5 mb-0 text-danger">{formatCurrency(apAgingReport.summary.days60)}</div>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-dark">
                    <div className="card-body py-2">
                      <div className="small text-muted">90+ días</div>
                      <div className="h5 mb-0 text-dark">{formatCurrency(apAgingReport.summary.days90Plus)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="alert alert-warning d-flex justify-content-between align-items-center mb-4">
                <strong>Total por Pagar:</strong>
                <span className="h4 mb-0">{formatCurrency(apAgingReport.summary.total)}</span>
              </div>

              {/* Supplier Details Table */}
              {apAgingReport.suppliers.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Proveedor</th>
                        <th className="text-end">0-30 días</th>
                        <th className="text-end">31-60 días</th>
                        <th className="text-end">61-90 días</th>
                        <th className="text-end">90+ días</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apAgingReport.suppliers.map((supplier) => (
                        <tr key={supplier.contactId}>
                          <td>{supplier.contactName}</td>
                          <td className="text-end text-success">{formatCurrency(supplier.current)}</td>
                          <td className="text-end text-warning">{formatCurrency(supplier.days30)}</td>
                          <td className="text-end text-danger">{formatCurrency(supplier.days60)}</td>
                          <td className="text-end text-dark">{formatCurrency(supplier.days90Plus)}</td>
                          <td className="text-end"><strong>{formatCurrency(supplier.total)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-inbox display-4 d-block mb-3" />
                  No hay cuentas por pagar en este periodo
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
