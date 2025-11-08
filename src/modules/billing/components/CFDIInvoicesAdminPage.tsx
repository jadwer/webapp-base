'use client'

import { useState } from 'react'
import { useCFDIInvoices, useCFDIInvoicesMutations, useCFDIWorkflow } from '../hooks'
import type { CFDIInvoicesFilters, CFDIStatus, TipoComprobante } from '../types'

export function CFDIInvoicesAdminPage() {
  const [filters, setFilters] = useState<CFDIInvoicesFilters>({})
  const { invoices, isLoading, error, mutate } = useCFDIInvoices(filters)
  const { deleteInvoice, downloadXML, downloadPDF } = useCFDIInvoicesMutations()
  const { generateXML, generatePDF, stampInvoice, cancelInvoice } = useCFDIWorkflow()

  // Calculate metrics
  const totalInvoices = invoices.length
  const draftInvoices = invoices.filter((inv) => inv.status === 'draft').length
  const stampedInvoices = invoices.filter(
    (inv) => inv.status === 'stamped' || inv.status === 'valid'
  ).length
  const cancelledInvoices = invoices.filter((inv) => inv.status === 'cancelled').length

  const handleGenerateXML = async (id: string) => {
    try {
      await generateXML(id)
      mutate()
      alert('XML generado correctamente')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al generar XML')
    }
  }

  const handleGeneratePDF = async (id: string) => {
    try {
      await generatePDF(id)
      mutate()
      alert('PDF generado correctamente')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al generar PDF')
    }
  }

  const handleStamp = async (id: string) => {
    try {
      await stampInvoice(id)
      mutate()
      alert('Factura timbrada correctamente')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al timbrar factura')
    }
  }

  const handleCancel = async (id: string) => {
    const motivo = prompt('Motivo de cancelación (01-04):')
    if (!motivo) return

    try {
      await cancelInvoice(id, { motivo })
      mutate()
      alert('Factura cancelada correctamente')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cancelar factura')
    }
  }

  const handleDownloadXML = async (id: string) => {
    try {
      const blob = await downloadXML(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CFDI-${id}.xml`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al descargar XML')
    }
  }

  const handleDownloadPDF = async (id: string) => {
    try {
      const blob = await downloadPDF(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CFDI-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al descargar PDF')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta factura CFDI?')) return

    try {
      await deleteInvoice(id)
      mutate()
      alert('Factura eliminada')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar factura')
    }
  }

  const getStatusBadgeClass = (status: CFDIStatus) => {
    switch (status) {
      case 'draft':
        return 'badge bg-secondary'
      case 'generated':
        return 'badge bg-info'
      case 'stamped':
      case 'valid':
        return 'badge bg-success'
      case 'cancelled':
        return 'badge bg-danger'
      case 'error':
        return 'badge bg-warning'
      default:
        return 'badge bg-secondary'
    }
  }

  const getTipoComprobanteLabel = (tipo: TipoComprobante) => {
    switch (tipo) {
      case 'I':
        return 'Ingreso'
      case 'E':
        return 'Egreso'
      case 'T':
        return 'Traslado'
      case 'N':
        return 'Nómina'
      case 'P':
        return 'Pago'
      default:
        return tipo
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount / 100) // Convert from cents
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          Error al cargar facturas: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-2">
            <i className="bi bi-receipt me-3" />
            Facturas CFDI
          </h1>
          <p className="text-muted">
            Gestión de Comprobantes Fiscales Digitales por Internet (CFDI 4.0)
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted mb-2">Total Facturas</h6>
              <h3 className="mb-0">{totalInvoices}</h3>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted mb-2">Borradores</h6>
              <h3 className="mb-0 text-secondary">{draftInvoices}</h3>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted mb-2">Timbradas</h6>
              <h3 className="mb-0 text-success">{stampedInvoices}</h3>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted mb-2">Canceladas</h6>
              <h3 className="mb-0 text-danger">{cancelledInvoices}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por folio, RFC, nombre..."
                value={filters.search || ''}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value || undefined })
                }
              />
            </div>
            <div className="col-12 col-md-2">
              <select
                className="form-select"
                value={filters.status || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: (e.target.value as CFDIStatus) || undefined,
                  })
                }
              >
                <option value="">Todos los estados</option>
                <option value="draft">Borrador</option>
                <option value="generated">Generado</option>
                <option value="stamped">Timbrado</option>
                <option value="valid">Válido</option>
                <option value="cancelled">Cancelado</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div className="col-12 col-md-2">
              <select
                className="form-select"
                value={filters.tipoComprobante || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    tipoComprobante: (e.target.value as TipoComprobante) || undefined,
                  })
                }
              >
                <option value="">Todos los tipos</option>
                <option value="I">Ingreso</option>
                <option value="E">Egreso</option>
                <option value="T">Traslado</option>
                <option value="N">Nómina</option>
                <option value="P">Pago</option>
              </select>
            </div>
            <div className="col-12 col-md-2">
              <input
                type="date"
                className="form-control"
                placeholder="Fecha desde"
                value={filters.dateFrom || ''}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value || undefined })
                }
              />
            </div>
            <div className="col-12 col-md-2">
              <input
                type="date"
                className="form-control"
                placeholder="Fecha hasta"
                value={filters.dateTo || ''}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value || undefined })
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No hay facturas para mostrar</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Serie-Folio</th>
                    <th>Tipo</th>
                    <th>Receptor</th>
                    <th>UUID</th>
                    <th>Total</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>
                        <strong>
                          {invoice.series}-{invoice.folio}
                        </strong>
                      </td>
                      <td>{getTipoComprobanteLabel(invoice.tipoComprobante)}</td>
                      <td>
                        <div>
                          <small className="text-muted">{invoice.receptorRfc}</small>
                          <br />
                          {invoice.receptorNombre}
                        </div>
                      </td>
                      <td>
                        <small className="font-monospace">
                          {invoice.uuid ? invoice.uuid.substring(0, 8) + '...' : '-'}
                        </small>
                      </td>
                      <td>
                        <strong>{formatCurrency(invoice.total)}</strong>
                      </td>
                      <td>
                        <small>{new Date(invoice.fechaEmision).toLocaleDateString()}</small>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(invoice.status)}>
                          {invoice.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          {invoice.status === 'draft' && (
                            <>
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleGenerateXML(invoice.id)}
                                title="Generar XML"
                              >
                                <i className="bi bi-file-earmark-code" />
                              </button>
                            </>
                          )}
                          {invoice.status === 'generated' && (
                            <>
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleGeneratePDF(invoice.id)}
                                title="Generar PDF"
                              >
                                <i className="bi bi-file-earmark-pdf" />
                              </button>
                              <button
                                className="btn btn-outline-success"
                                onClick={() => handleStamp(invoice.id)}
                                title="Timbrar"
                              >
                                <i className="bi bi-award" />
                              </button>
                            </>
                          )}
                          {(invoice.status === 'stamped' || invoice.status === 'valid') && (
                            <>
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleDownloadXML(invoice.id)}
                                title="Descargar XML"
                              >
                                <i className="bi bi-download" /> XML
                              </button>
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleDownloadPDF(invoice.id)}
                                title="Descargar PDF"
                              >
                                <i className="bi bi-download" /> PDF
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleCancel(invoice.id)}
                                title="Cancelar"
                              >
                                <i className="bi bi-x-circle" />
                              </button>
                            </>
                          )}
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(invoice.id)}
                            title="Eliminar"
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
