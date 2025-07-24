'use client'

import { useState } from 'react'
import { Role } from '../types/role'
import { useRoles } from '../hooks/useRoles'
import { useRoleActions } from '../hooks/useRoles'
import StatusMessage from '@/ui/StatusMessage'
import { Skeleton } from '@/ui/Skeleton'
import { RoleForm } from './RoleForm'

interface RolesTableProps {
  onRoleSelect?: (role: Role) => void
  selectedRole?: Role | null
}

export function RolesTable({ onRoleSelect, selectedRole }: RolesTableProps) {
  const { roles, isLoading, error } = useRoles(['permissions'])
  const { deleteRole } = useRoleActions()
  
  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    role: Role | null
  }>({ isOpen: false, role: null })

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este rol?')) {
      try {
        await deleteRole(id)
        // Ya no necesitamos mutate manual, useRoleActions lo hace automáticamente
      } catch (error) {
        console.error('Error eliminando rol:', error)
        alert('Error al eliminar el rol')
      }
    }
  }

  const handleEdit = (role: Role) => {
    setEditModal({ isOpen: true, role })
  }

  const handleEditSuccess = () => {
    // Ya no necesitamos mutate manual, useRoleActions lo hace automáticamente
    setEditModal({ isOpen: false, role: null })
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body">
          <Skeleton className="mb-3 placeholder" />
          <Skeleton className="placeholder" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <StatusMessage
        type="danger"
        message="No se pudieron cargar los roles. Intenta recargar la página."
      />
    )
  }

  return (
    <>
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="bi bi-people-fill me-2"></i>
            Roles ({roles.length})
          </h5>
        </div>
        
        <div className="card-body p-0">
          {roles.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-people display-1 text-muted"></i>
              <h5 className="mt-3 text-muted">No hay roles configurados</h5>
              <p className="text-muted">Los roles aparecerán aquí una vez que sean creados.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Guard</th>
                    <th>Permisos</th>
                    <th>Creado</th>
                    <th style={{ width: '120px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr
                      key={role.id}
                      className={selectedRole?.id === role.id ? 'table-active' : ''}
                      style={{ cursor: onRoleSelect ? 'pointer' : 'default' }}
                      onClick={() => onRoleSelect?.(role)}
                    >
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <div className="avatar avatar-sm bg-primary bg-gradient">
                              <i className="bi bi-shield-fill-check"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-0">{role.name}</h6>
                            {role.description && (
                              <small className="text-muted">{role.description}</small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary">{role.guard_name}</span>
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {role.permissions?.length || 0} permisos
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(role.created_at).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(role)
                            }}
                            title="Editar rol"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(role.id)
                            }}
                            title="Eliminar rol"
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
          )}
        </div>
      </div>

      {/* Modal para editar rol */}
      {editModal.isOpen && editModal.role && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar rol</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditModal({ isOpen: false, role: null })}
                ></button>
              </div>
              <div className="modal-body">
                <RoleForm
                  role={editModal.role}
                  onSuccess={handleEditSuccess}
                  onCancel={() => setEditModal({ isOpen: false, role: null })}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
