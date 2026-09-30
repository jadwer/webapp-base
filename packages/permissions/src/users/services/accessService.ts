/**
 * Acceso por usuario (rol = plantilla, 2026-09-24). Endpoint custom del
 * backend (no JSON:API): GET/PUT /api/v1/users/{id}/access.
 */

import { axiosClient } from '@lwm/auth'

export const SYSTEM_ROLES = ['god', 'admin', 'customer'] as const
export type SystemRole = (typeof SYSTEM_ROLES)[number]

export const SYSTEM_ROLE_LABELS: Record<SystemRole, string> = {
  god: 'Superadministrador (acceso total)',
  admin: 'Administrador (acceso total)',
  customer: 'Cliente (portal del cliente)',
}

export interface UserAccess {
  userId: string
  systemRoles: string[]
  /** Roles no-sistema que aun tiene (usuarios previos al esquema de plantillas). */
  templateRoles: string[]
  permissionTemplate: string | null
  /** Permisos efectivos hoy (rol + directos): lo que muestra la pestana. */
  effectivePermissionIds: number[]
  directPermissionIds: number[]
}

export interface UserAccessPayload {
  systemRoles: string[]
  template: string | null
  permissionIds: number[]
}

export const accessService = {
  get: async (userId: string): Promise<UserAccess> => {
    const response = await axiosClient.get(`/api/v1/users/${userId}/access`)
    return (response.data as { data: UserAccess }).data
  },

  put: async (userId: string, payload: UserAccessPayload): Promise<UserAccess> => {
    const response = await axiosClient.put(`/api/v1/users/${userId}/access`, payload)
    return (response.data as { data: UserAccess }).data
  },
}
