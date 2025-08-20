'use client'

import { useState } from 'react'
import { useLibroDiario } from '../hooks/useReports'

export function LibroDiarioReport() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    page: 1,
    perPage: 50
  })
  
  const { libroDiario, isLoading, error } = useLibroDiario(filters)

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(numAmount)
  }

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
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
                <p className="mt-3 mb-0">Cargando Libro Diario...</p>
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
                <h5 className="text-danger">Error al cargar Libro Diario</h5>
                <p className="text-muted mb-0">
                  No se pudo cargar el Libro Diario. Por favor, inténtelo más tarde.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!libroDiario) {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-info-circle text-info fs-1 mb-3"></i>
                <h5>Sin datos disponibles</h5>
                <p className="text-muted mb-0">No hay movimientos para el período seleccionado.</p>
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
                <i className="bi bi-journal-text text-primary me-2"></i>
                Libro Diario
              </h1>
              <p className="text-muted mb-0">
                Registro cronológico de asientos contables
              </p>
            </div>
            
            {/* Date Filters */}
            <div className="d-flex gap-3">
              <div>
                <label className="form-label small">Fecha Inicio</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={filters.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <label className="form-label small">Fecha Fin</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={filters.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {libroDiario.totals && (
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-muted mb-1">Total Débitos</h6>
                    <h4 className="mb-0 text-success">
                      {formatCurrency(libroDiario.totals.total_debits)}
                    </h4>
                  </div>
                  <div className="ms-3">
                    <div className="bg-success bg-opacity-10 p-3 rounded">
                      <i className="bi bi-plus-circle text-success fs-5"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-muted mb-1">Total Créditos</h6>
                    <h4 className="mb-0 text-danger">
                      {formatCurrency(libroDiario.totals.total_credits)}
                    </h4>
                  </div>
                  <div className="ms-3">
                    <div className="bg-danger bg-opacity-10 p-3 rounded">
                      <i className="bi bi-dash-circle text-danger fs-5"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-muted mb-1">Total Movimientos</h6>
                    <h4 className="mb-0 text-primary">
                      {libroDiario.data.length.toLocaleString()}
                    </h4>
                  </div>
                  <div className="ms-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                      <i className="bi bi-list-ol text-primary fs-5"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Journal Entries Table */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0">
                <i className="bi bi-table text-primary me-2"></i>
                Movimientos del Libro Diario
              </h6>
            </div>
            <div className="card-body p-0">
              {libroDiario.data.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0">Fecha</th>
                        <th className="border-0">N° Asiento</th>
                        <th className="border-0">Descripción</th>
                        <th className="border-0">Cuenta</th>
                        <th className="border-0 text-end">Débito</th>
                        <th className="border-0 text-end">Crédito</th>
                      </tr>
                    </thead>
                    <tbody>
                      {libroDiario.data.map((entry, index) => (
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
                            <div className="text-truncate" style={{ maxWidth: '200px' }}>
                              {entry.description}
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong>{entry.account_code}</strong>
                              <br />
                              <small className="text-muted">{entry.account_name}</small>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-journal-x text-muted fs-1"></i>
                  <p className="text-muted mt-3 mb-0">No hay movimientos para mostrar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {libroDiario.data.length >= filters.perPage && (
        <div className="row mt-4">
          <div className="col-12">
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${filters.page === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>
                <li className="page-item active">
                  <span className="page-link">
                    Página {filters.page}
                  </span>
                </li>
                <li className="page-item">
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(filters.page + 1)}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-light border">
            <div className="row">
              <div className="col-md-6">
                <i className="bi bi-info-circle text-primary me-2"></i>
                <strong>Libro Diario:</strong> Registro cronológico de todos los asientos contables
              </div>
              <div className="col-md-6 text-md-end">
                <i className="bi bi-clock text-muted me-2"></i>
                Mostrando {filters.perPage} registros por página
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}