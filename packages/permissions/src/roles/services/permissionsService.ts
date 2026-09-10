import { Permission } from '../types/role'
import { axiosClient as axios } from '@lwm/auth'
import { JsonApiTransformer } from '../lib/jsonApiTransformer'

export const permissionsService = {
  // Obtener todos los permisos
  async getAll(): Promise<Permission[]> {
    const response = await axios.get('/api/v1/permissions')
    return JsonApiTransformer.transformPermissionsResponse(response.data)
  },

  // Obtener un permiso por ID
  async getById(id: string | number): Promise<Permission> {
    const response = await axios.get(`/api/v1/permissions/${id}`)
    
    if (!response.data.data) {
      throw new Error('Permission not found')
    }
    
    return JsonApiTransformer.transformPermission(response.data.data)
  },

  // Obtener permisos agrupados por modulo de negocio (campo `module`
  // del catalogo backend; fallback al primer segmento del name para
  // permisos fuera de catalogo).
  async getGrouped(): Promise<Record<string, Permission[]>> {
    const permissions = await this.getAll()

    return permissions.reduce((groups, permission) => {
      const moduleName = permission.module || permission.name.split('.')[0] || 'general'

      if (!groups[moduleName]) {
        groups[moduleName] = []
      }

      groups[moduleName].push(permission)
      return groups
    }, {} as Record<string, Permission[]>)
  },

  // Buscar permisos por label legible, descripcion o nombre tecnico.
  async search(query: string): Promise<Permission[]> {
    const permissions = await this.getAll()

    if (!query.trim()) {
      return permissions
    }

    const searchTerm = query.toLowerCase()
    return permissions.filter(permission =>
      permission.name.toLowerCase().includes(searchTerm) ||
      (permission.label ?? '').toLowerCase().includes(searchTerm) ||
      (permission.description ?? '').toLowerCase().includes(searchTerm)
    )
  }
}
