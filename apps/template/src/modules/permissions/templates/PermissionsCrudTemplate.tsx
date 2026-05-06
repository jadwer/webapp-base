'use client'

import { useState } from 'react'
import { Permission, PermissionFormData } from '../types/permission'
import { usePermissions, usePermissionActions } from '../hooks/usePermissions'
import PermissionsTable from '../components/PermissionsTable'
import PermissionModal from '../components/PermissionModal'
import SimpleConfirmModal from '../components/SimpleConfirmModal'
import SimpleToast from '../components/SimpleToast'

export default function PermissionsCrudTemplate() {
  const { permissions, isLoading, mutate } = usePermissions()
  const { create, update, remove, isSubmitting } = usePermissionActions()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [deletingPermission, setDeletingPermission] = useState<Permission | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
  }

  const handleCreate = () => {
    setEditingPermission(null)
    setIsModalOpen(true)
  }

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission)
    setIsModalOpen(true)
  }

  const handleDelete = (permission: Permission) => {
    setDeletingPermission(permission)
  }

  const handleSubmit = async (data: PermissionFormData) => {
    try {
      if (editingPermission) {
        await update(editingPermission.id!, data)
        showToast('Permiso actualizado correctamente')
      } else {
        await create(data)
        showToast('Permiso creado correctamente')
      }
      await mutate() // Refrescar la lista
    } catch (error: unknown) {
      console.error('Error al guardar permiso:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al guardar el permiso'
      showToast(errorMessage, 'error')
      throw error // Re-lanzar para que el modal maneje el error
    }
  }

  const confirmDelete = async () => {
    if (!deletingPermission) return

    try {
      await remove(deletingPermission.id!)
      showToast('Permiso eliminado correctamente')
      await mutate() // Refrescar la lista
      setDeletingPermission(null)
    } catch (error: unknown) {
      console.error('Error al eliminar permiso:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al eliminar el permiso'
      showToast(errorMessage, 'error')
    }
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-key me-2 text-primary"></i>
                Gestión de Permisos
              </h2>
              <p className="text-muted mb-0">
                Administra los permisos del sistema para controlar el acceso a las funcionalidades
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreate}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Crear Permiso
            </button>
          </div>

          {/* Estadísticas */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <i className="bi bi-key display-6 text-primary"></i>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="fw-bold h4 mb-0">
                        {isLoading ? (
                          <span className="placeholder col-3"></span>
                        ) : (
                          permissions.length
                        )}
                      </div>
                      <div className="text-muted small">Total Permisos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <i className="bi bi-shield-check display-6 text-success"></i>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="fw-bold h4 mb-0">
                        {isLoading ? (
                          <span className="placeholder col-3"></span>
                        ) : (
                          permissions.filter(p => p.guard_name === 'api').length
                        )}
                      </div>
                      <div className="text-muted small">API Permisos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <i className="bi bi-globe display-6 text-info"></i>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="fw-bold h4 mb-0">
                        {isLoading ? (
                          <span className="placeholder col-3"></span>
                        ) : (
                          permissions.filter(p => p.guard_name === 'web').length
                        )}
                      </div>
                      <div className="text-muted small">Web Permisos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de permisos */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0">Lista de Permisos</h5>
            </div>
            <div className="card-body p-0">
              <PermissionsTable
                permissions={permissions}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear/editar */}
      <PermissionModal
        isOpen={isModalOpen}
        permission={editingPermission}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Modal de confirmación para eliminar */}
      <SimpleConfirmModal
        isOpen={!!deletingPermission}
        title="Eliminar Permiso"
        message={`¿Estás seguro de que deseas eliminar el permiso "${deletingPermission?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingPermission(null)}
        isLoading={isSubmitting}
        variant="danger"
      />

      {/* Toast notifications */}
      <SimpleToast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </div>
  )
}
