'use client'

/**
 * Consulta de un usuario con la piel del rediseno (Figma "Diseno final - Usuarios"):
 * la ficha en solo lectura, sus permisos y las acciones Regresar y Editar usuario.
 */

import React from 'react'
import useSWR from 'swr'
import { useUser } from '../hooks/useUsers'
import { accessService, SYSTEM_ROLE_LABELS, type SystemRole } from '../services/accessService'
import { useBranches } from '@lwm/auth'
import type { UserStatus } from '../types/user'
import { Alert, useNavigationProgress, LwSurface, LwPageTitle, LwStatusPill, type LwTone } from '@lwm/ui'
import { roleLabel } from '../../utils/roleLabels'

interface UserViewPageProps {
  userId: string
}

const STATUS: Record<UserStatus, { tone: LwTone; label: string }> = {
  active: { tone: 'success', label: 'Activo' },
  inactive: { tone: 'warning', label: 'Inactivo' },
  banned: { tone: 'danger', label: 'Bloqueado' },
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
  const { branches } = useBranches()
  const { data: access } = useSWR(['user-access', userId], () => accessService.get(userId), { revalidateOnFocus: false })
  const branchName = (id: string | null) => branches.find((b) => b.id === id)?.name ?? (id ? `#${id}` : 'Matriz')

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

  const status = STATUS[user.status] || STATUS.inactive
  const template = user.permissionTemplate || access?.templateRoles[0]
  const field = (label: string, value: React.ReactNode, wide = false) => (
    <div className={wide ? 'col-12' : 'col-md-6 col-xl-4'}>
      <div className="small text-muted mb-1">{label}</div>
      <div className="border rounded px-3 py-2 bg-light-subtle" style={{ minHeight: 40 }}>{value}</div>
    </div>
  )

  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <LwPageTitle
          title="Consultar usuario:"
          highlight={user.name}
          subtitle="Consulta los datos de este usuario"
        />

        {user.deletedAt && (
          <div className="alert alert-warning" role="alert">
            Este usuario fue eliminado el {formatDate(user.deletedAt)}. Puedes restaurarlo desde la lista con
            &quot;Mostrar eliminados&quot;.
          </div>
        )}

        <div className="row g-3">
          {field('Nombre completo', user.name)}
          {field('Correo electrónico', <a href={`mailto:${user.email}`} className="text-decoration-none">{user.email}</a>)}
          {field('Estatus', user.deletedAt ? <LwStatusPill tone="neutral">Eliminado</LwStatusPill> : <LwStatusPill tone={status.tone}>{status.label}</LwStatusPill>)}
          {field('Sucursal principal', branchName(user.branchId))}
          {field('Sucursales con acceso', user.branchIds.length > 0 ? user.branchIds.map(branchName).join(', ') : <span className="text-muted">Solo la principal</span>)}
          {field('Correo verificado', user.emailVerifiedAt ? formatDate(user.emailVerifiedAt) : <span className="text-muted">Sin verificar</span>)}
          {field('Alta', formatDate(user.createdAt))}
          {user.deletedAt ? field('Eliminado', formatDate(user.deletedAt)) : null}
        </div>

        <div className="mt-4 pt-3 border-top">
          <h2 className="h5 mb-3">Permisos</h2>
          <div className="row g-3">
            {field('Roles de sistema', access && access.systemRoles.length > 0 ? (
              <span className="d-flex flex-wrap gap-1">
                {access.systemRoles.map((role) => <LwStatusPill key={role} tone="navy">{SYSTEM_ROLE_LABELS[role as SystemRole] ?? roleLabel(role)}</LwStatusPill>)}
              </span>
            ) : <span className="text-muted">Ninguno</span>)}
            {field('Plantilla de permisos', template ? roleLabel(template) : <span className="text-muted">Sin plantilla</span>)}
            {field('Permisos asignados', access ? `${access.effectivePermissionIds.length} permisos` : '—')}
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-outline-primary px-4" onClick={() => navigation.push('/dashboard/users')}>
            Regresar a usuarios
          </button>
          {!user.deletedAt && (
            <button type="button" className="btn btn-primary px-4" onClick={() => navigation.push(`/dashboard/users/${user.id}/edit`)}>
              Editar usuario
            </button>
          )}
        </div>
      </LwSurface>
    </div>
  )
}
