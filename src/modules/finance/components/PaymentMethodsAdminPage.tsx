'use client'

/**
 * Payment Methods Administration Page
 * Complete CRUD interface for managing payment methods
 * Features: Search, filters, pagination, create/edit/delete
 */

import React, { useState } from 'react'
import { usePaymentMethods, usePaymentMethodMutations } from '../hooks'
import { PaymentMethod } from '../types'
import ConfirmModal from '@/ui/components/base/ConfirmModal'

interface PaymentMethodsAdminPageProps {
  onEdit?: (method: PaymentMethod) => void
  onView?: (method: PaymentMethod) => void
}

export const PaymentMethodsAdminPage: React.FC<PaymentMethodsAdminPageProps> = ({
  onEdit,
  onView
}) => {
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState<boolean | null>(null)
  const [filterRequiresReference, setFilterRequiresReference] = useState<boolean | null>(null)
  const [page, setPage] = useState(1)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null)

  // Build filters
  const filters: any = {}
  if (search) filters.search = search
  if (filterActive !== null) filters.isActive = filterActive
  if (filterRequiresReference !== null) filters.requiresReference = filterRequiresReference

  // Fetch data
  const { methods, isLoading, error, meta } = usePaymentMethods({
    filters,
    pagination: { page, size: 20 }
  })

  const { deleteMethod } = usePaymentMethodMutations()

  const handleDelete = async () => {
    if (!methodToDelete) return

    try {
      await deleteMethod(methodToDelete.id)
      setShowDeleteModal(false)
      setMethodToDelete(null)
      // Show success toast
      showToast('Método de pago eliminado correctamente', 'success')
    } catch (error: any) {
      console.error('Error deleting payment method:', error)
      showToast(
        error.response?.data?.errors?.[0]?.detail || 'Error al eliminar método de pago',
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

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="badge bg-success">Activo</span>
    ) : (
      <span className="badge bg-secondary">Inactivo</span>
    )
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Métodos de Pago</h2>
          <p className="text-muted mb-0">
            Gestiona los métodos de pago disponibles en el sistema
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => window.location.href = '/dashboard/finance/payment-methods/create'}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Nuevo Método
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
                placeholder="Nombre o código..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={filterActive === null ? '' : filterActive.toString()}
                onChange={(e) => {
                  setFilterActive(e.target.value === '' ? null : e.target.value === 'true')
                  setPage(1)
                }}
              >
                <option value="">Todos</option>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Requiere Referencia</label>
              <select
                className="form-select"
                value={filterRequiresReference === null ? '' : filterRequiresReference.toString()}
                onChange={(e) => {
                  setFilterRequiresReference(e.target.value === '' ? null : e.target.value === 'true')
                  setPage(1)
                }}
              >
                <option value="">Todos</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearch('')
                  setFilterActive(null)
                  setFilterRequiresReference(null)
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
              Error al cargar métodos de pago: {error.message}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : methods.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1 d-block mb-3"></i>
              <p>No se encontraron métodos de pago</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Referencia</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {methods.map((method) => (
                      <tr key={method.id}>
                        <td>
                          <code className="text-dark">{method.code}</code>
                        </td>
                        <td>
                          <strong>{method.name}</strong>
                        </td>
                        <td>
                          <span className="text-muted">
                            {method.description || '-'}
                          </span>
                        </td>
                        <td>
                          {method.requiresReference ? (
                            <span className="badge bg-warning text-dark">
                              <i className="bi bi-check-circle me-1"></i>
                              Requerida
                            </span>
                          ) : (
                            <span className="badge bg-light text-dark">Opcional</span>
                          )}
                        </td>
                        <td>{getStatusBadge(method.isActive)}</td>
                        <td>
                          <div className="btn-group btn-group-sm float-end">
                            {onView && (
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => onView(method)}
                                title="Ver detalles"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                            )}
                            {onEdit && (
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => onEdit(method)}
                                title="Editar"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                            )}
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => {
                                setMethodToDelete(method)
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
                    Mostrando {methods.length} de {meta.page.total || 0} registros
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
                      <li className={`page-item ${methods.length < 20 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage(p => p + 1)}
                          disabled={methods.length < 20}
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
      {showDeleteModal && methodToDelete && (
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Confirmar Eliminación"
          message={`¿Está seguro que desea eliminar el método de pago "${methodToDelete.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteModal(false)
            setMethodToDelete(null)
          }}
          variant="danger"
        />
      )}
    </div>
  )
}
