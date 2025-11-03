'use client'

/**
 * Payment Applications Administration Page
 * Manage applications of payments to invoices
 * Features: Search, filters by payment/invoice, pagination, create/edit/delete
 */

import React, { useState } from 'react'
import { usePaymentApplications, usePaymentApplicationMutations } from '../hooks'
import { PaymentApplication } from '../types'
import ConfirmModal from '@/ui/components/base/ConfirmModal'

interface PaymentApplicationsAdminPageProps {
  onEdit?: (application: PaymentApplication) => void
  onView?: (application: PaymentApplication) => void
}

export const PaymentApplicationsAdminPage: React.FC<PaymentApplicationsAdminPageProps> = ({
  onEdit,
  onView
}) => {
  const [search, setSearch] = useState('')
  const [filterPaymentId, setFilterPaymentId] = useState('')
  const [filterInvoiceId, setFilterInvoiceId] = useState('')
  const [page, setPage] = useState(1)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [applicationToDelete, setApplicationToDelete] = useState<PaymentApplication | null>(null)

  // Build filters
  const filters: any = {}
  if (search) filters.search = search
  if (filterPaymentId) filters.paymentId = filterPaymentId
  if (filterInvoiceId) {
    // Could be AR or AP invoice
    filters.arInvoiceId = filterInvoiceId
    filters.apInvoiceId = filterInvoiceId
  }

  // Fetch data
  const { applications, isLoading, error, meta } = usePaymentApplications({
    filters,
    pagination: { page, size: 20 }
  })

  const { deleteApplication } = usePaymentApplicationMutations()

  const handleDelete = async () => {
    if (!applicationToDelete) return

    try {
      await deleteApplication(applicationToDelete.id)
      setShowDeleteModal(false)
      setApplicationToDelete(null)
      showToast('Aplicación de pago eliminada correctamente', 'success')
    } catch (error: any) {
      console.error('Error deleting payment application:', error)
      showToast(
        error.response?.data?.errors?.[0]?.detail || 'Error al eliminar aplicación de pago',
        'error'
      )
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

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
            <div className="col-md-4">
              <label className="form-label">Buscar</label>
              <input
                type="text"
                className="form-control"
                placeholder="Número de factura o pago..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div className="col-md-3">
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
            <div className="col-md-3">
              <label className="form-label">ID de Factura</label>
              <input
                type="text"
                className="form-control"
                placeholder="ID de factura AR/AP"
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
                  setSearch('')
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
                            {formatDate(application.applicationDate)}
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
                             (application.arInvoiceId ? `AR #${application.arInvoiceId}` : `AP #${application.apInvoiceId}`)}
                          </code>
                        </td>
                        <td>
                          {application.arInvoiceId ? (
                            <span className="badge bg-success">
                              <i className="bi bi-arrow-down-circle me-1"></i>
                              Cobro (AR)
                            </span>
                          ) : (
                            <span className="badge bg-warning text-dark">
                              <i className="bi bi-arrow-up-circle me-1"></i>
                              Pago (AP)
                            </span>
                          )}
                        </td>
                        <td>
                          <strong>{formatCurrency(application.amount)}</strong>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm float-end">
                            {onView && (
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => onView(application)}
                                title="Ver detalles"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                            )}
                            {onEdit && (
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => onEdit(application)}
                                title="Editar"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                            )}
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => {
                                setApplicationToDelete(application)
                                setShowDeleteModal(true)
                              }}
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
      {showDeleteModal && applicationToDelete && (
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Confirmar Eliminación"
          message={`¿Está seguro que desea eliminar esta aplicación de pago? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteModal(false)
            setApplicationToDelete(null)
          }}
          variant="danger"
        />
      )}
    </div>
  )
}
