import { Role, Permission } from '../types/role'

// Tipos para la respuesta JSON:API
interface JsonApiResource {
  id: string
  type: string
  attributes: Record<string, unknown>
  relationships?: Record<string, { data: Array<{ id: string; type: string }> }>
}

interface JsonApiCollectionResponse {
  data: JsonApiResource[]
  included?: JsonApiResource[]
}

interface JsonApiSingleResponse {
  data: JsonApiResource
  included?: JsonApiResource[]
}

/**
 * Transformador para convertir respuestas JSON:API a nuestros tipos
 */
export class JsonApiTransformer {
  
  /**
   * Transforma la respuesta de roles de JSON:API a nuestro formato
   */
  static transformRolesResponse(jsonApiResponse: JsonApiCollectionResponse): Role[] {
    if (!jsonApiResponse?.data) return []

    const { data, included = [] } = jsonApiResponse

    // Crear un mapa de permisos incluidos para fácil acceso
    const permissionsMap = this.createPermissionsMap(included)

    return data.map((roleData: JsonApiResource) => this.transformRole(roleData, permissionsMap))
  }

  /**
   * Crea un mapa de permisos a partir de los datos incluidos
   */
  static createPermissionsMap(included: JsonApiResource[]): Map<string, Permission> {
    const permissionsMap = new Map<string, Permission>()
    included
      .filter((item: JsonApiResource) => item.type === 'permissions')
      .forEach((permission: JsonApiResource) => {
        permissionsMap.set(permission.id, this.transformPermission(permission))
      })
    return permissionsMap
  }

  /**
   * Transforma un rol individual
   */
  static transformRole(roleData: JsonApiResource, permissionsMap?: Map<string, Permission>): Role {
    const { id, attributes, relationships } = roleData

    // Obtener permisos del rol
    let permissions: Permission[] = []
    if (relationships?.permissions?.data && permissionsMap) {
      permissions = relationships.permissions.data
        .map((permRef: { id: string; type: string }) => permissionsMap.get(permRef.id))
        .filter((permission): permission is Permission => permission !== undefined)
    }

    return {
      id: parseInt(id),
      name: attributes.name as string,
      description: (attributes.description as string) || '',
      guard_name: attributes.guard_name as string,
      created_at: attributes.createdAt as string,
      updated_at: attributes.updatedAt as string,
      permissions
    }
  }

  /**
   * Transforma un permiso individual
   */
  static transformPermission(permissionData: JsonApiResource): Permission {
    const { id, attributes } = permissionData

    return {
      id: parseInt(id),
      name: attributes.name as string,
      guard_name: attributes.guard_name as string,
      created_at: attributes.createdAt as string,
      updated_at: attributes.updatedAt as string
    }
  }

  /**
   * Transforma la respuesta de permisos de JSON:API a nuestro formato
   */
  static transformPermissionsResponse(jsonApiResponse: JsonApiCollectionResponse): Permission[] {
    if (!jsonApiResponse?.data) return []

    return jsonApiResponse.data.map((permissionData: JsonApiResource) => 
      this.transformPermission(permissionData)
    )
  }

  /**
   * Transforma una respuesta de un solo rol
   */
  static transformSingleRoleResponse(jsonApiResponse: JsonApiSingleResponse): Role {
    if (!jsonApiResponse?.data) throw new Error('Invalid role response')

    const { data, included = [] } = jsonApiResponse

    // Crear mapa de permisos
    const permissionsMap = new Map<string, Permission>()
    included
      .filter((item: JsonApiResource) => item.type === 'permissions')
      .forEach((permission: JsonApiResource) => {
        permissionsMap.set(permission.id, this.transformPermission(permission))
      })

    return this.transformRole(data, permissionsMap)
  }
}
