'use client'

import { useState } from 'react'
import { useLibroMayor } from '../hooks/useReports'

export function LibroMayorReport() {
  const [filters, setFilters] = useState({
    accountId: null as number | null,
    startDate: '',
    endDate: ''
  })
  
  const { libroMayor, isLoading, error } = useLibroMayor(
    filters.accountId, 
    filters.startDate || undefined, 
    filters.endDate || undefined
  )

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(numAmount)
  }

  const handleFilterChange = (field: keyof typeof filters, value: string | number | null) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 mb-0">Cargando Libro Mayor...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-exclamation-triangle text-danger fs-1 mb-3"></i>
                <h5 className="text-danger">Error al cargar Libro Mayor</h5>
                <p className="text-muted mb-0">
                  No se pudo cargar el Libro Mayor. Por favor, inténtelo más tarde.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-book text-primary me-2"></i>
                Libro Mayor
              </h1>
              <p className="text-muted mb-0">
                Movimientos detallados por cuenta contable
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Cuenta Contable</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="ID de la cuenta"
                    value={filters.accountId || ''}
                    onChange={(e) => handleFilterChange('accountId', e.target.value ? parseInt(e.target.value) : null)}
                  />
                  <div className="form-text">
                    Ingrese el ID de la cuenta para ver sus movimientos
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Fecha Inicio</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Fecha Fin</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Selection Helper */}
      {!filters.accountId && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-info border-0">
              <div className="d-flex">
                <div className="me-3">
                  <i className="bi bi-info-circle text-info fs-4"></i>
                </div>
                <div>
                  <h6 className="alert-heading">Selecciona una cuenta</h6>
                  <p className="mb-0">
                    Para ver el Libro Mayor, primero selecciona una cuenta contable ingresando su ID en el filtro superior.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Info and Balances */}
      {libroMayor && libroMayor.account && (
        <>
          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-person-badge me-2"></i>
                    Información de la Cuenta
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h5>{libroMayor.account.code} - {libroMayor.account.name}</h5>
                      <p className="text-muted mb-0">
                        <span className="badge bg-light text-dark">
                          {libroMayor.account.type}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <div className="row">
                        <div className="col-6">
                          <h6 className="text-muted">Saldo Inicial</h6>
                          <h5 className="text-info">
                            {formatCurrency(libroMayor.opening_balance)}
                          </h5>
                        </div>
                        <div className="col-6">
                          <h6 className="text-muted">Saldo Final</h6>
                          <h5 className="text-primary">
                            {formatCurrency(libroMayor.closing_balance)}
                          </h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Movements Table */}
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                  <h6 className="mb-0">
                    <i className="bi bi-list-columns text-primary me-2"></i>
                    Movimientos de la Cuenta
                  </h6>
                </div>
                <div className="card-body p-0">
                  {libroMayor.data.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="border-0">Fecha</th>
                            <th className="border-0">N° Asiento</th>
                            <th className="border-0">Descripción</th>
                            <th className="border-0 text-end">Débito</th>
                            <th className="border-0 text-end">Crédito</th>
                            <th className="border-0 text-end">Saldo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Opening Balance Row */}
                          <tr className="table-info">
                            <td>—</td>
                            <td>—</td>
                            <td><strong>SALDO INICIAL</strong></td>
                            <td className="text-end">—</td>
                            <td className="text-end">—</td>
                            <td className="text-end">
                              <strong className="text-info">
                                {formatCurrency(libroMayor.opening_balance)}
                              </strong>
                            </td>
                          </tr>
                          {/* Movement Rows */}
                          {libroMayor.data.map((entry, index) => (
                            <tr key={index}>
                              <td>
                                <span className="badge bg-light text-dark">
                                  {new Date(entry.entry_date).toLocaleDateString('es-MX')}
                                </span>
                              </td>
                              <td>
                                <strong className="text-primary">
                                  {entry.entry_number}
                                </strong>
                              </td>
                              <td>
                                <div className="text-truncate" style={{ maxWidth: '250px' }}>
                                  {entry.description}
                                </div>
                              </td>
                              <td className="text-end">
                                {entry.debit && parseFloat(entry.debit) > 0 ? (
                                  <strong className="text-success">
                                    {formatCurrency(entry.debit)}
                                  </strong>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td className="text-end">
                                {entry.credit && parseFloat(entry.credit) > 0 ? (
                                  <strong className="text-danger">
                                    {formatCurrency(entry.credit)}
                                  </strong>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td className="text-end">
                                <strong className={entry.balance >= 0 ? 'text-primary' : 'text-danger'}>
                                  {formatCurrency(entry.balance)}
                                </strong>
                              </td>
                            </tr>
                          ))}
                          {/* Closing Balance Row */}
                          <tr className="table-primary">
                            <td>—</td>
                            <td>—</td>
                            <td><strong>SALDO FINAL</strong></td>
                            <td className="text-end">—</td>
                            <td className="text-end">—</td>
                            <td className="text-end">
                              <strong className="text-primary fs-6">
                                {formatCurrency(libroMayor.closing_balance)}
                              </strong>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-inbox text-muted fs-1"></i>
                      <p className="text-muted mt-3 mb-0">
                        No hay movimientos para la cuenta seleccionada
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="alert alert-light border">
                <div className="row">
                  <div className="col-md-6">
                    <i className="bi bi-calculator text-primary me-2"></i>
                    <strong>Resumen:</strong> 
                    {libroMayor.data.length} movimiento(s) registrado(s)
                  </div>
                  <div className="col-md-6 text-md-end">
                    <i className="bi bi-wallet2 text-muted me-2"></i>
                    <strong>Variación:</strong> 
                    <span className={libroMayor.closing_balance >= libroMayor.opening_balance ? 'text-success' : 'text-danger'}>
                      {formatCurrency(libroMayor.closing_balance - libroMayor.opening_balance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}