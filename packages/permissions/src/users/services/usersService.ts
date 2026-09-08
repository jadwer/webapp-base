/**
 * Users service (v2). JSON:API contra /api/v1/users.
 * La lista SIEMPRE manda page[number]/page[size]: el backend no tiene
 * default de paginacion y sin esto devolveria todo el catalogo.
 */

import { axiosClient } from '@lwm/auth'
import type {
  User,
  UserRole,
  UserFilters,
  UserFormData,
  UsersListResult,
  UsersMeta,
  UserStatus,
} from '../types/user'

const RESOURCE = '/api/v1/users'
export const DEFAULT_PAGE_SIZE = 20

interface JsonApiResource {
  id: string
  type: string
  attributes: Record<string, unknown>
  relationships?: Record<string, { data?: Array<{ id: string; type: string }> | { id: string; type: string } | null }>
}

const buildRolesMap = (included?: unknown[]): Map<string, UserRole> => {
  const map = new Map<string, UserRole>()
  for (const item of (included || []) as JsonApiResource[]) {
    if (item.type === 'roles') {
      map.set(String(item.id), {
        id: String(item.id),
        name: String(item.attributes?.name ?? ''),
      })
    }
  }
  return map
}

const transformUser = (resource: JsonApiResource, rolesMap: Map<string, UserRole>): User => {
  const attrs = resource.attributes || {}
  const roleRefs = resource.relationships?.roles?.data
  const refs = Array.isArray(roleRefs) ? roleRefs : []
  const roles = refs
    .map((ref) => rolesMap.get(String(ref.id)))
    .filter((role): role is UserRole => role !== undefined)

  return {
    id: String(resource.id),
    name: (attrs.name as string) || '',
    email: (attrs.email as string) || '',
    status: (attrs.status as UserStatus) || 'active',
    roles,
    emailVerifiedAt: (attrs.emailVerifiedAt as string | null) ?? null,
    createdAt: (attrs.createdAt as string) || '',
    updatedAt: attrs.updatedAt as string | undefined,
    deletedAt: (attrs.deletedAt as string | null) ?? null,
  }
}

const buildAttributes = (data: UserFormData): Record<string, unknown> => {
  const attributes: Record<string, unknown> = {
    name: data.name,
    email: data.email,
    status: data.status,
  }
  // Password vacio al editar = no cambia (se omite del payload).
  if (data.password) {
    attributes.password = data.password
    attributes.password_confirmation = data.passwordConfirmation ?? ''
  }
  return attributes
}

const buildRolesRelationship = (roleIds: string[]) => ({
  roles: {
    data: roleIds.map((id) => ({ type: 'roles', id: String(id) })),
  },
})

export const usersService = {
  /**
   * Lista paginada con filtros. Devuelve usuarios planos + meta.page
   * (currentPage/lastPage/total en formato laravel-json-api).
   */
  getUsers: async (
    filters: UserFilters = {},
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE
  ): Promise<UsersListResult> => {
    const params: Record<string, unknown> = {
      include: 'roles',
      'page[number]': page,
      'page[size]': pageSize,
    }
    if (filters.search) params['filter[search]'] = filters.search
    if (filters.role) params['filter[role]'] = filters.role
    if (filters.status) params['filter[status]'] = filters.status
    if (filters.trashed) params['filter[trashed]'] = filters.trashed

    const response = await axiosClient.get(RESOURCE, { params })
    const body = response.data as {
      data?: JsonApiResource[]
      included?: unknown[]
      meta?: UsersMeta
    }

    const rolesMap = buildRolesMap(body.included)
    return {
      users: (body.data || []).map((item) => transformUser(item, rolesMap)),
      meta: body.meta || {},
    }
  },

  getUser: async (id: string): Promise<User> => {
    const response = await axiosClient.get(`${RESOURCE}/${id}`, {
      params: { include: 'roles' },
    })
    const body = response.data as { data: JsonApiResource; included?: unknown[] }
    return transformUser(body.data, buildRolesMap(body.included))
  },

  createUser: async (data: UserFormData): Promise<User> => {
    const response = await axiosClient.post(RESOURCE, {
      data: {
        type: 'users',
        attributes: buildAttributes(data),
        relationships: buildRolesRelationship(data.roleIds),
      },
    })
    const body = response.data as { data: JsonApiResource; included?: unknown[] }
    return transformUser(body.data, buildRolesMap(body.included))
  },

  updateUser: async (id: string, data: UserFormData): Promise<User> => {
    const response = await axiosClient.patch(`${RESOURCE}/${id}`, {
      data: {
        type: 'users',
        id: String(id),
        attributes: buildAttributes(data),
        relationships: buildRolesRelationship(data.roleIds),
      },
    })
    const body = response.data as { data: JsonApiResource; included?: unknown[] }
    return transformUser(body.data, buildRolesMap(body.included))
  },

  /** Soft delete. */
  deleteUser: async (id: string): Promise<void> => {
    await axiosClient.delete(`${RESOURCE}/${id}`)
  },

  /** Endpoint custom (NO JSON:API): respuesta JSON simple. */
  restoreUser: async (
    id: string
  ): Promise<{ message: string; data: { id: number; name: string; email: string } }> => {
    const response = await axiosClient.post(`${RESOURCE}/${id}/restore`)
    return response.data
  },
}
