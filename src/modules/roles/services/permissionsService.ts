import { Permission } from '@/modules/roles/types/role'
import axios from '@/lib/axiosClient'
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

  // Obtener permisos agrupados por módulo/categoría
  async getGrouped(): Promise<Record<string, Permission[]>> {
    const permissions = await this.getAll()
    
    return permissions.reduce((groups, permission) => {
      // Extraer el módulo del nombre del permiso (ej: "users.create" -> "users")
      const moduleName = permission.name.split('.')[0] || 'general'
      
      if (!groups[moduleName]) {
        groups[moduleName] = []
      }
      
      groups[moduleName].push(permission)
      return groups
    }, {} as Record<string, Permission[]>)
  },

  // Buscar permisos
  async search(query: string): Promise<Permission[]> {
    const permissions = await this.getAll()
    
    if (!query.trim()) {
      return permissions
    }
    
    const searchTerm = query.toLowerCase()
    return permissions.filter(permission => 
      permission.name.toLowerCase().includes(searchTerm)
    )
  }
}
