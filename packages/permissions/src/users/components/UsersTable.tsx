'use client'

/**
 * Tabla de usuarios (v2). Sin tableLayout fixed; nombre y email truncados
 * con title para que nunca se encimen. Filas soft-deleted atenuadas con
 * accion Restaurar.
 */

import React from 'react'
import type { User, UserStatus } from '../types/user'

interface UsersTableProps {
  users: User[]
  isLoading?: boolean
  onView?: (user: User) => void
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
  onRestore?: (user: User) => void
}

const STATUS_BADGES: Record<UserStatus, { variant: string; label: string }> = {
  active: { variant: 'success', label: 'Activo' },
  inactive: { variant: 'secondary', label: 'Inactivo' },
  banned: { variant: 'danger', label: 'Bloqueado' },
}

const renderStatusBadge = (status: UserStatus) => {
  const badge = STATUS_BADGES[status] || STATUS_BADGES.inactive
  return <span className={`badge bg-${badge.variant}`}>{badge.label}</span>
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onRestore,
}) => {
  if (isLoading) {
    return (
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Estado</th>
              <th style={{ width: '130px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, index) => (
              <tr key={index}>
                <td><span className="placeholder col-8"></span></td>
                <td><span className="placeholder col-10"></span></td>
                <td><span className="placeholder col-6"></span></td>
                <td><span className="placeholder col-5"></span></td>
                <td>
                  <div className="d-flex gap-1">
                    <div className="placeholder bg-secondary rounded" style={{ width: '32px', height: '32px' }}></div>
                    <div className="placeholder bg-secondary rounded" style={{ width: '32px', height: '32px' }}></div>
                    <div className="placeholder bg-secondary rounded" style={{ width: '32px', height: '32px' }}></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-people display-1 text-muted"></i>
        <h3 className="mt-3 text-muted">No se encontraron usuarios</h3>
        <p className="text-muted">
          No hay usuarios que coincidan con los filtros actuales.
          <br />
          Prueba ajustar los filtros o crear un nuevo usuario.
        </p>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Estado</th>
            <th style={{ width: '130px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isDeleted = Boolean(user.deletedAt)

            return (
              <tr key={user.id} className={isDeleted ? 'opacity-50' : undefined}>
                <td>
                  <div
                    className="text-truncate fw-semibold"
                    style={{ maxWidth: '220px' }}
                    title={user.name}
                  >
                    {user.name}
                  </div>
                  {isDeleted && (
                    <span className="badge bg-dark">Eliminado</span>
                  )}
                </td>
                <td>
                  <div
                    className="text-truncate"
                    style={{ maxWidth: '260px' }}
                    title={user.email}
                  >
                    {user.email}
                  </div>
                </td>
                <td>
                  {user.roles.length > 0 ? (
                    <div className="d-flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span key={role.id} className="badge bg-info text-dark">
                          {role.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted">Sin rol</span>
                  )}
                </td>
                <td>{renderStatusBadge(user.status)}</td>
                <td>
                  <div className="d-flex gap-1">
                    {isDeleted ? (
                      onRestore && (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => onRestore(user)}
                          title="Restaurar"
                        >
                          <i className="bi bi-arrow-counterclockwise me-1"></i>
                          Restaurar
                        </button>
                      )
                    ) : (
                      <>
                        {onView && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => onView(user)}
                            title="Ver detalles"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                        )}
                        {onEdit && (
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => onEdit(user)}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => onDelete(user)}
                            title="Eliminar"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
