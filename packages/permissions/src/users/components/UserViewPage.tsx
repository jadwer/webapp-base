'use client'

/**
 * Ficha de detalle de un usuario: datos, roles, estado, verificacion
 * de email y fechas, con acciones Editar/Volver.
 */

import React from 'react'
import { useUser } from '../hooks/useUsers'
import type { UserStatus } from '../types/user'
import { Alert, useNavigationProgress } from '@lwm/ui'

interface UserViewPageProps {
  userId: string
}

const STATUS_BADGES: Record<UserStatus, { variant: string; label: string }> = {
  active: { variant: 'success', label: 'Activo' },
  inactive: { variant: 'secondary', label: 'Inactivo' },
  banned: { variant: 'danger', label: 'Bloqueado' },
}

const formatDate = (value?: string | null): string => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const UserViewPage: React.FC<UserViewPageProps> = ({ userId }) => {
  const navigation = useNavigationProgress()
  const { user, isLoading, error } = useUser(userId)

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center py-5">
          <div className="text-center">
            <div className="spinner-border mb-3" role="status" aria-hidden="true"></div>
            <p className="text-muted">Cargando usuario...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container-fluid py-4">
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Error:</strong> {error?.message || 'No se pudo cargar el usuario'}
        </Alert>
        <button
          className="btn btn-secondary"
          onClick={() => navigation.push('/dashboard/users')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Volver
        </button>
      </div>
    )
  }

  const statusBadge = STATUS_BADGES[user.status] || STATUS_BADGES.inactive

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8 col-xl-6">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              className="btn btn-link text-muted p-0 me-3"
              onClick={() => navigation.push('/dashboard/users')}
              title="Volver a usuarios"
            >
              <i className="bi bi-arrow-left fs-4"></i>
            </button>
            <div className="flex-grow-1">
              <h1 className="h3 mb-0">Detalle de Usuario</h1>
              <p className="text-muted mb-0 text-truncate" title={user.name}>
                {user.name}
              </p>
            </div>
            {!user.deletedAt && (
              <button
                className="btn btn-warning"
                onClick={() => navigation.push(`/dashboard/users/${user.id}/edit`)}
              >
                <i className="bi bi-pencil me-2"></i>
                Editar
              </button>
            )}
          </div>

          {user.deletedAt && (
            <Alert variant="warning" className="mb-4">
              <i className="bi bi-trash me-2"></i>
              Este usuario fue eliminado el {formatDate(user.deletedAt)}. Puedes
              restaurarlo desde la lista con &quot;Mostrar eliminados&quot;.
            </Alert>
          )}

          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <dl className="row mb-0">
                <dt className="col-sm-4">Nombre</dt>
                <dd className="col-sm-8">{user.name}</dd>

                <dt className="col-sm-4">Correo electrónico</dt>
                <dd className="col-sm-8">
                  <a href={`mailto:${user.email}`} className="text-decoration-none">
                    {user.email}
                  </a>
                </dd>

                <dt className="col-sm-4">Estado</dt>
                <dd className="col-sm-8">
                  <span className={`badge bg-${statusBadge.variant}`}>
                    {statusBadge.label}
                  </span>
                </dd>

                <dt className="col-sm-4">Roles</dt>
                <dd className="col-sm-8">
                  {user.roles.length > 0 ? (
                    <div className="d-flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span key={role.id} className="badge bg-info text-dark">
                          {role.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted">Sin rol asignado</span>
                  )}
                </dd>

                <dt className="col-sm-4">Email verificado</dt>
                <dd className="col-sm-8">
                  {user.emailVerifiedAt ? (
                    <span className="text-success">
                      <i className="bi bi-patch-check me-1"></i>
                      {formatDate(user.emailVerifiedAt)}
                    </span>
                  ) : (
                    <span className="text-muted">
                      <i className="bi bi-x-circle me-1"></i>
                      Sin verificar
                    </span>
                  )}
                </dd>

                <dt className="col-sm-4">Creado</dt>
                <dd className="col-sm-8">{formatDate(user.createdAt)}</dd>

                {user.deletedAt && (
                  <>
                    <dt className="col-sm-4">Eliminado</dt>
                    <dd className="col-sm-8">{formatDate(user.deletedAt)}</dd>
                  </>
                )}
              </dl>
            </div>
          </div>

          <div className="mt-3">
            <button
              className="btn btn-secondary"
              onClick={() => navigation.push('/dashboard/users')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Volver a la lista
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
