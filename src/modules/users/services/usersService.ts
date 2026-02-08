import axiosClient from '@/lib/axiosClient'
import { User } from '../types/user'

const RESOURCE = '/api/v1/users'

// Helper para limpiar y filtrar datos antes de enviar al backend
const prepareUserAttributes = (payload: Partial<User>): Record<string, unknown> => {
  const allowedFields = ['name', 'email', 'password', 'password_confirmation', 'status']
  
  return Object.fromEntries(
    Object.entries(payload)
      .filter(([key]) => allowedFields.includes(key))
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
  )
}

// Helper para preparar la relación de roles
const prepareRoleRelationship = (roleId: string | undefined) => {
  if (!roleId) return undefined
  
  return {
    roles: {
      data: [{
        type: 'roles',
        id: roleId
      }]
    }
  }
}

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await axiosClient.get(`${RESOURCE}?include=roles`)
    
    // Crear un mapa de roles incluidos para búsqueda rápida
    const rolesMap = new Map()
    if (response.data.included) {
      response.data.included
        .filter((item: { type: string; id: string; attributes: Record<string, unknown> }) => item.type === 'roles')
        .forEach((role: { type: string; id: string; attributes: { name: string; description: string } }) => {
          rolesMap.set(role.id, {
            id: role.id,
            name: role.attributes.name,
            description: role.attributes.description
          })
        })
    }
    
    return response.data.data.map((item: { 
      id: string; 
      attributes: Omit<User, 'id' | 'roles'>
      relationships?: {
        roles?: {
          data: Array<{ id: string; type: string }>
        }
      }
    }) => {
      // Mapear los IDs de roles a objetos completos de roles
      const userRoles = item.relationships?.roles?.data?.map(roleRef => 
        rolesMap.get(roleRef.id)
      ).filter(Boolean) || []
      
      return {
        id: item.id,
        ...item.attributes,
        roles: userRoles
      }
    })
  } catch (error) {
    throw error
  }
}

export const getUser = async (id: string): Promise<User> => {
  const response = await axiosClient.get(`${RESOURCE}/${id}?include=roles`)
  
  // Crear un mapa de roles incluidos para búsqueda rápida
  const rolesMap = new Map()
  if (response.data.included) {
    response.data.included
      .filter((item: { type: string; id: string; attributes: Record<string, unknown> }) => item.type === 'roles')
      .forEach((role: { type: string; id: string; attributes: { name: string; description: string } }) => {
        rolesMap.set(role.id, {
          id: role.id,
          name: role.attributes.name,
          description: role.attributes.description
        })
      })
  }
  
  // Mapear los IDs de roles a objetos completos de roles
  const userRoles = response.data.data.relationships?.roles?.data?.map((roleRef: { id: string }) => 
    rolesMap.get(roleRef.id)
  ).filter(Boolean) || []
  
  return {
    id: response.data.data.id,
    ...response.data.data.attributes,
    roles: userRoles
  }
}

// Tipos para las peticiones JSON:API
interface JsonApiRequest {
  data: {
    id?: string
    type: string
    attributes: Record<string, unknown>
    relationships?: Record<string, {
      data: Array<{ type: string; id: string }>
    }>
  }
}

export const createUser = async (payload: Partial<User>): Promise<User> => {
  const attributes = prepareUserAttributes(payload)
  const relationships = prepareRoleRelationship(payload.role)
  
  const requestData: JsonApiRequest = {
    data: {
      type: 'users',
      attributes
    }
  }
  
  if (relationships) {
    requestData.data.relationships = relationships
  }
  
  const response = await axiosClient.post(RESOURCE, requestData)
  return {
    id: response.data.data.id,
    ...response.data.data.attributes
  }
}

export const updateUser = async (id: string, payload: Partial<User>): Promise<User> => {
  const attributes = prepareUserAttributes(payload)
  const relationships = prepareRoleRelationship(payload.role)
  
  const requestData: JsonApiRequest = {
    data: {
      id,
      type: 'users',
      attributes
    }
  }
  
  if (relationships) {
    requestData.data.relationships = relationships
  }
  
  const response = await axiosClient.patch(`${RESOURCE}/${id}`, requestData)
  return {
    id: response.data.data.id,
    ...response.data.data.attributes
  }
}

export const deleteUser = async (id: string): Promise<void> => {
  await axiosClient.delete(`${RESOURCE}/${id}`)
}

/**
 * Change user's own password
 * Requires current_password for verification
 */
export const changePassword = async (
  id: string,
  payload: {
    current_password: string
    password: string
    password_confirmation: string
  }
): Promise<void> => {
  await axiosClient.post(`${RESOURCE}/${id}/change-password`, payload)
}

/**
 * Reset user password (admin only)
 * Does not require current password
 */
export const resetPassword = async (
  id: string,
  payload: { password: string }
): Promise<void> => {
  await axiosClient.post(`${RESOURCE}/${id}/reset-password`, payload)
}

/**
 * Assign a role to user
 */
export const assignRole = async (
  userId: string,
  role: string
): Promise<void> => {
  await axiosClient.post(`${RESOURCE}/${userId}/assign-role`, { role })
}

/**
 * Remove a role from user
 */
export const removeRole = async (
  userId: string,
  role: string
): Promise<void> => {
  await axiosClient.post(`${RESOURCE}/${userId}/remove-role`, { role })
}

/**
 * Sync user roles (replace all)
 */
export const syncRoles = async (
  userId: string,
  roles: string[]
): Promise<void> => {
  await axiosClient.post(`${RESOURCE}/${userId}/sync-roles`, { roles })
}
