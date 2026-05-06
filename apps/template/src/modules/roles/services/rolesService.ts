import axios from '@/lib/axiosClient'
import { Role, RoleFormData } from '../types/role'
import { JsonApiTransformer } from '../lib/jsonApiTransformer'

export const rolesService = {
  // Obtener todos los roles
  async getAll(include?: string[]): Promise<Role[]> {
    const params = new URLSearchParams()
    if (include && include.length > 0) {
      params.append('include', include.join(','))
    }
    
    const url = `/api/v1/roles${params.toString() ? `?${params.toString()}` : ''}`
    const response = await axios.get(url)
    
    return JsonApiTransformer.transformRolesResponse(response.data)
  },

  // Obtener un rol por ID
  async getById(id: string | number, include?: string[]): Promise<Role> {
    const params = new URLSearchParams()
    if (include && include.length > 0) {
      params.append('include', include.join(','))
    }
    
    const url = `/api/v1/roles/${id}${params.toString() ? `?${params.toString()}` : ''}`
    const response = await axios.get(url)
    
    return JsonApiTransformer.transformSingleRoleResponse(response.data)
  },

  // Crear un nuevo rol
  async create(data: RoleFormData): Promise<Role> {
    const payload = {
      data: {
        type: 'roles',
        attributes: {
          name: data.name,
          description: data.description,
          guard_name: data.guard_name
        },
        ...(data.permissions && data.permissions.length > 0 && {
          relationships: {
            permissions: {
              data: data.permissions.map(permissionId => ({
                type: 'permissions',
                id: permissionId.toString()
              }))
            }
          }
        })
      }
    }

    const response = await axios.post('/api/v1/roles', payload)
    return response.data.data
  },

  // Actualizar un rol
  async update(id: string | number, data: RoleFormData): Promise<Role> {
    const payload = {
      data: {
        type: 'roles',
        id: id.toString(),
        attributes: {
          name: data.name,
          description: data.description,
          guard_name: data.guard_name
        },
        ...(data.permissions && {
          relationships: {
            permissions: {
              data: data.permissions.map(permissionId => ({
                type: 'permissions',
                id: permissionId.toString()
              }))
            }
          }
        })
      }
    }

    const response = await axios.patch(`/api/v1/roles/${id}`, payload)
    return response.data.data
  },

  // Eliminar un rol
  async delete(id: string | number): Promise<void> {
    await axios.delete(`/api/v1/roles/${id}`)
  },

  // Obtener estadísticas de roles
  async getStats(): Promise<{
    total: number
    withPermissions: number
    withoutPermissions: number
  }> {
    const roles = await this.getAll(['permissions'])

    return {
      total: roles.length,
      withPermissions: roles.filter(role => role.permissions && role.permissions.length > 0).length,
      withoutPermissions: roles.filter(role => !role.permissions || role.permissions.length === 0).length
    }
  },

  // Give permission to role
  async givePermission(roleId: string | number, permission: string): Promise<void> {
    await axios.post(`/api/v1/roles/${roleId}/give-permission`, { permission })
  },

  // Revoke permission from role
  async revokePermission(roleId: string | number, permission: string): Promise<void> {
    await axios.post(`/api/v1/roles/${roleId}/revoke-permission`, { permission })
  },

  // Sync permissions (replace all)
  async syncPermissions(roleId: string | number, permissions: string[]): Promise<void> {
    await axios.post(`/api/v1/roles/${roleId}/sync-permissions`, { permissions })
  }
}
