import { Role, Permission } from '../types/role'

/**
 * Transformador para convertir respuestas JSON:API a nuestros tipos
 */
export class JsonApiTransformer {
  
  /**
   * Transforma la respuesta de roles de JSON:API a nuestro formato
   */
  static transformRolesResponse(jsonApiResponse: any): Role[] {
    if (!jsonApiResponse?.data) return []

    const { data, included = [] } = jsonApiResponse

    // Crear un mapa de permisos incluidos para fácil acceso
    const permissionsMap = this.createPermissionsMap(included)

    return data.map((roleData: any) => this.transformRole(roleData, permissionsMap))
  }

  /**
   * Crea un mapa de permisos a partir de los datos incluidos
   */
  static createPermissionsMap(included: any[]): Map<string, Permission> {
    const permissionsMap = new Map<string, Permission>()
    included
      .filter((item: any) => item.type === 'permissions')
      .forEach((permission: any) => {
        permissionsMap.set(permission.id, this.transformPermission(permission))
      })
    return permissionsMap
  }

  /**
   * Transforma un rol individual
   */
  static transformRole(roleData: any, permissionsMap?: Map<string, Permission>): Role {
    const { id, attributes, relationships } = roleData

    // Obtener permisos del rol
    let permissions: Permission[] = []
    if (relationships?.permissions?.data && permissionsMap) {
      permissions = relationships.permissions.data
        .map((permRef: any) => permissionsMap.get(permRef.id))
        .filter(Boolean)
    }

    return {
      id: parseInt(id),
      name: attributes.name,
      description: attributes.description || '',
      guard_name: attributes.guard_name,
      created_at: attributes.createdAt,
      updated_at: attributes.updatedAt,
      permissions
    }
  }

  /**
   * Transforma un permiso individual
   */
  static transformPermission(permissionData: any): Permission {
    const { id, attributes } = permissionData

    return {
      id: parseInt(id),
      name: attributes.name,
      guard_name: attributes.guard_name,
      created_at: attributes.createdAt,
      updated_at: attributes.updatedAt
    }
  }

  /**
   * Transforma la respuesta de permisos de JSON:API a nuestro formato
   */
  static transformPermissionsResponse(jsonApiResponse: any): Permission[] {
    if (!jsonApiResponse?.data) return []

    return jsonApiResponse.data.map((permissionData: any) => 
      this.transformPermission(permissionData)
    )
  }

  /**
   * Transforma una respuesta de un solo rol
   */
  static transformSingleRoleResponse(jsonApiResponse: any): Role {
    if (!jsonApiResponse?.data) throw new Error('Invalid role response')

    const { data, included = [] } = jsonApiResponse

    // Crear mapa de permisos
    const permissionsMap = new Map<string, Permission>()
    included
      .filter((item: any) => item.type === 'permissions')
      .forEach((permission: any) => {
        permissionsMap.set(permission.id, this.transformPermission(permission))
      })

    return this.transformRole(data, permissionsMap)
  }
}
