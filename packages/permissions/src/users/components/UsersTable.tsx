'use client'

/**
 * Tabla de usuarios con la piel del rediseno: No., nombre, correo, roles con su nombre en
 * espanol, sucursal (solo multi sucursal), estatus y acciones de icono. Las filas
 * eliminadas salen con estatus "Eliminado" y la accion Restaurar.
 */

import React from 'react'
import { useBranchName } from '@lwm/auth'
import { LwTableWrap, LwStatusPill, LwIconButton, type LwTone } from '@lwm/ui'
import { roleLabel } from '../../utils/roleLabels'
import type { User, UserStatus } from '../types/user'

interface UsersTableProps {
  users: User[]
  isLoading?: boolean
  /** Desplazamiento de la pagina para numerar las filas */
  offset?: number
  emptyText?: string
  onView?: (user: User) => void
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
  onRestore?: (user: User) => void
}

const STATUS: Record<UserStatus, { tone: LwTone; label: string }> = {
  active: { tone: 'success', label: 'Activo' },
  inactive: { tone: 'warning', label: 'Inactivo' },
  banned: { tone: 'danger', label: 'Bloqueado' },
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isLoading = false,
  offset = 0,
  emptyText = 'No se encontraron usuarios',
  onView,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const branchName = useBranchName()
  const cols = branchName.multi ? 7 : 6

  return (
    <LwTableWrap>
      <table className="table mb-0 align-middle">
        <thead>
          <tr>
            <th className="text-center">No</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Roles</th>
            {branchName.multi && <th>Sucursal</th>}
            <th>Estatus</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && users.length === 0 ? (
            <tr><td colSpan={cols} className="text-center text-muted py-4">Cargando usuarios…</td></tr>
          ) : users.length === 0 ? (
            <tr><td colSpan={cols} className="text-center text-muted py-4">{emptyText}</td></tr>
          ) : users.map((user, i) => {
            const isDeleted = Boolean(user.deletedAt)
            const status = STATUS[user.status] || STATUS.inactive
            return (
              <tr key={user.id} className={isDeleted ? 'text-muted' : undefined}>
                <td className="text-center text-muted">{String(offset + i + 1).padStart(2, '0')}</td>
                <td><div className="text-truncate" style={{ maxWidth: 240 }} title={user.name}>{user.name}</div></td>
                <td><div className="text-truncate" style={{ maxWidth: 260 }} title={user.email}>{user.email}</div></td>
                <td>
                  {user.roles.length > 0 ? (
                    <div className="d-flex flex-wrap gap-1">
                      {user.roles.map((role) => <LwStatusPill key={role.id} tone="navy">{roleLabel(role.name)}</LwStatusPill>)}
                    </div>
                  ) : user.permissionTemplate ? (
                    // Rol = plantilla (2026-09-24): sin rol de sistema, permisos por usuario.
                    <LwStatusPill tone="info" title="Plantilla de permisos">{roleLabel(user.permissionTemplate)}</LwStatusPill>
                  ) : (
                    <LwStatusPill tone="neutral">Sin rol</LwStatusPill>
                  )}
                </td>
                {branchName.multi && <td className="small">{branchName.name(user.branchId)}</td>}
                <td>{isDeleted ? <LwStatusPill tone="neutral">Eliminado</LwStatusPill> : <LwStatusPill tone={status.tone}>{status.label}</LwStatusPill>}</td>
                <td className="text-center text-nowrap">
                  {isDeleted ? (
                    onRestore ? <LwIconButton icon="bi-arrow-counterclockwise" label={`Restaurar usuario ${user.name}`} onClick={() => onRestore(user)} /> : null
                  ) : (
                    <>
                      {onView ? <LwIconButton icon="bi-eye" label={`Consultar usuario ${user.name}`} onClick={() => onView(user)} /> : null}
                      {onEdit ? <LwIconButton icon="bi-pencil" label={`Editar usuario ${user.name}`} onClick={() => onEdit(user)} /> : null}
                      {onDelete ? <LwIconButton icon="bi-trash" label={`Eliminar usuario ${user.name}`} onClick={() => onDelete(user)} /> : null}
                    </>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </LwTableWrap>
  )
}
