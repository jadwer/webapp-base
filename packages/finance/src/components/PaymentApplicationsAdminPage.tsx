'use client'

/**
 * Payment Applications Administration Page
 * Manage applications of payments to invoices
 * Features: Search, filters by payment/invoice, pagination, create/edit/delete
 */

import React, { useState, useRef } from 'react'
import { usePaymentApplications, usePaymentApplicationMutations } from '../hooks'
import { PaymentApplication } from '../types'
import { ConfirmModal, type ConfirmModalHandle, formatDateOnly } from '@lwm/ui'

interface PaymentApplicationsAdminPageProps {
  onEdit?: (application: PaymentApplication) => void
  onView?: (application: PaymentApplication) => void
}

export const PaymentApplicationsAdminPage: React.FC<PaymentApplicationsAdminPageProps> = ({
  onEdit,
  onView
}) => {
  const [filterPaymentId, setFilterPaymentId] = useState('')
  const [filterInvoiceId, setFilterInvoiceId] = useState('')
  const [page, setPage] = useState(1)
  const confirmModalRef = useRef<ConfirmModalHandle>(null)

  // Build filters
  // Filtros declarados en PaymentApplicationSchema (no hay filtro search).
  const filters: Record<string, unknown> = {}
  if (filterPaymentId) filters.payment_id = filterPaymentId
  if (filterInvoiceId) filters.ar_invoice_id = filterInvoiceId

  // Fetch data
  const { applications, isLoading, error, meta } = usePaymentApplications({
    filters,
    pagination: { page, size: 20 }
  })

  const { deleteApplication } = usePaymentApplicationMutations()

  const handleDeleteClick = async (application: PaymentApplication) => {
    if (!confirmModalRef.current) return

    const confirmed = await confirmModalRef.current.confirm(
      `¿Está seguro que desea eliminar esta aplicación de pago? Esta acción no se puede deshacer.`
    )

    if (confirmed) {
      try {
        await deleteApplication(application.id)
        showToast('Aplicación de pago eliminada correctamente', 'success')
      } catch (error: unknown) {
        const axiosError = error as Record<string, unknown>
        const response = axiosError.response as Record<string, unknown> | undefined
        const data = response?.data as Record<string, unknown> | undefined
        const errors = data?.errors as Array<Record<string, unknown>> | undefined
        showToast(
          (errors?.[0]?.detail as string) || 'Error al eliminar aplicación de pago',
          'error'
        )
      }
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div')
    toast.className = `alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed top-0 end-0 m-3`
    toast.style.zIndex = '9999'
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 4000)
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(parseFloat(amount))
  }

  // applicationDate es fecha sin hora
  const formatDate = (dateString: string) =>
    formatDateOnly(dateString, 'es-MX', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Aplicaciones de Pago</h2>
          <p className="text-muted mb-0">
            Gestiona las aplicaciones de pagos a facturas
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => window.location.href = '/dashboard/finance/payment-applications/create'}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Nueva Aplicación
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-5">
              <label className="form-label">ID de Pago</label>
              <input
                type="text"
                className="form-control"
                placeholder="ID del pago"
                value={filterPaymentId}
                onChange={(e) => {
                  setFilterPaymentId(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div className="col-md-5">
              <label className="form-label">ID de Factura</label>
              <input
                type="text"
                className="form-control"
                placeholder="ID de factura por cobrar"
                value={filterInvoiceId}
                onChange={(e) => {
                  setFilterInvoiceId(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setFilterPaymentId('')
                  setFilterInvoiceId('')
                  setPage(1)
                }}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body">
          {error && (
            <div className="alert alert-danger">
              Error al cargar aplicaciones: {error.message}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1 d-block mb-3"></i>
              <p>No se encontraron aplicaciones de pago</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Fecha</th>
                      <th>Pago</th>
                      <th>Factura</th>
                      <th>Tipo</th>
                      <th>Monto</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((application) => (
                      <tr key={application.id}>
                        <td>
                          <span className="text-muted">
                            {formatDate(application.applicationDate || application.createdAt)}
                          </span>
                        </td>
                        <td>
                          <code className="text-primary">
                            {application.paymentNumber || `#${application.paymentId}`}
                          </code>
                        </td>
                        <td>
                          <code className="text-dark">
                            {application.invoiceNumber ||
                             `AR #${application.arInvoiceId}`}
                          </code>
                        </td>
                        <td>
                          <span className="badge bg-success">
                            <i className="bi bi-arrow-down-circle me-1"></i>
                            Cobro (AR)
                          </span>
                        </td>
                        <td>
                          <strong>{formatCurrency(String(application.amount || 0))}</strong>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm float-end">
                            {onView && (
                              <button
                                aria-label="Ver detalles"
                                className="btn btn-outline-primary"
                                onClick={() => onView(application)}
                                title="Ver detalles"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                            )}
                            {onEdit && (
                              <button
                                aria-label="Editar"
                                className="btn btn-outline-secondary"
                                onClick={() => onEdit(application)}
                                title="Editar"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                            )}
                            <button
                              aria-label="Eliminar"
                              className="btn btn-outline-danger"
                              onClick={() => handleDeleteClick(application)}
                              title="Eliminar"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta && meta.page && (
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <div className="text-muted">
                    Mostrando {applications.length} de {meta.page.total || 0} registros
                  </div>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          Anterior
                        </button>
                      </li>
                      <li className="page-item active">
                        <span className="page-link">{page}</span>
                      </li>
                      <li className={`page-item ${applications.length < 20 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage(p => p + 1)}
                          disabled={applications.length < 20}
                        >
                          Siguiente
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal ref={confirmModalRef} />
    </div>
  )
}
