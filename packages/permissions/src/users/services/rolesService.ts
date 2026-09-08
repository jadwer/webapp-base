/**
 * Opciones de rol para el formulario de usuarios.
 * GET /api/v1/roles (JSON:API). Solo se necesita id + name.
 */

import { axiosClient } from '@lwm/auth'
import type { UserRole } from '../types/user'

const RESOURCE = '/api/v1/roles'

export const getRoleOptions = async (): Promise<UserRole[]> => {
  const response = await axiosClient.get(RESOURCE)
  const body = response.data as {
    data?: Array<{ id: string; attributes?: { name?: string } }>
  }
  return (body.data || []).map((item) => ({
    id: String(item.id),
    name: String(item.attributes?.name ?? ''),
  }))
}
