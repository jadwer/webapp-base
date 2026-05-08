/**
 * Test Utilities for Roles Module
 * Mock factories and helper functions for testing
 */

import { Role, Permission, RoleFormData } from '../../types/role'

/**
 * Creates a mock Permission object with optional overrides
 */
export const mockPermission = (overrides?: Partial<Permission>): Permission => ({
  id: 1,
  name: 'test-permission',
  guard_name: 'api',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

/**
 * Creates a list of mock permissions
 */
export const mockPermissions = (count: number = 3): Permission[] => {
  return Array.from({ length: count }, (_, index) =>
    mockPermission({
      id: index + 1,
      name: `permission-${index + 1}`,
      guard_name: index % 2 === 0 ? 'api' : 'web',
    })
  )
}

/**
 * Creates a mock Role object with optional overrides
 */
export const mockRole = (overrides?: Partial<Role>): Role => ({
  id: 1,
  name: 'test-role',
  description: 'Test role description',
  guard_name: 'web',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  permissions: [],
  ...overrides,
})

/**
 * Creates a list of mock roles
 */
export const mockRoles = (count: number = 3): Role[] => {
  return Array.from({ length: count }, (_, index) =>
    mockRole({
      id: index + 1,
      name: `role-${index + 1}`,
      description: `Description for role ${index + 1}`,
      permissions: index % 2 === 0 ? mockPermissions(2) : [],
    })
  )
}

/**
 * Creates mock form data for creating/updating roles
 */
export const mockRoleFormData = (
  overrides?: Partial<RoleFormData>
): RoleFormData => ({
  name: 'test-role',
  description: 'Test role description',
  guard_name: 'web',
  permissions: [],
  ...overrides,
})

/**
 * Creates a mock JSON:API response for a single role
 */
export const mockJsonApiRoleResponse = (role: Role) => ({
  data: {
    id: role.id.toString(),
    type: 'roles',
    attributes: {
      name: role.name,
      description: role.description,
      guard_name: role.guard_name,
      createdAt: role.created_at,
      updatedAt: role.updated_at,
    },
    relationships: role.permissions
      ? {
          permissions: {
            data: role.permissions.map((p) => ({
              id: p.id.toString(),
              type: 'permissions',
            })),
          },
        }
      : undefined,
  },
  included: role.permissions
    ? role.permissions.map((permission) => ({
        id: permission.id.toString(),
        type: 'permissions',
        attributes: {
          name: permission.name,
          guard_name: permission.guard_name,
          createdAt: permission.created_at,
          updatedAt: permission.updated_at,
        },
      }))
    : undefined,
})

/**
 * Creates a mock JSON:API response for multiple roles
 */
export const mockJsonApiRolesResponse = (roles: Role[]) => {
  const allPermissions: Permission[] = []

  roles.forEach((role) => {
    if (role.permissions) {
      role.permissions.forEach((permission) => {
        if (!allPermissions.find((p) => p.id === permission.id)) {
          allPermissions.push(permission)
        }
      })
    }
  })

  return {
    data: roles.map((role) => ({
      id: role.id.toString(),
      type: 'roles',
      attributes: {
        name: role.name,
        description: role.description,
        guard_name: role.guard_name,
        createdAt: role.created_at,
        updatedAt: role.updated_at,
      },
      relationships: role.permissions
        ? {
            permissions: {
              data: role.permissions.map((p) => ({
                id: p.id.toString(),
                type: 'permissions',
              })),
            },
          }
        : undefined,
    })),
    included: allPermissions.map((permission) => ({
      id: permission.id.toString(),
      type: 'permissions',
      attributes: {
        name: permission.name,
        guard_name: permission.guard_name,
        createdAt: permission.created_at,
        updatedAt: permission.updated_at,
      },
    })),
  }
}

/**
 * Creates a mock 422 validation error response
 */
export const mock422Error = (field: string, message: string) => ({
  response: {
    status: 422,
    data: {
      errors: [
        {
          code: 'VALIDATION_ERROR',
          source: { pointer: `/data/attributes/${field}` },
          detail: message,
        },
      ],
    },
  },
})

/**
 * Creates a mock 404 not found error response
 */
export const mock404Error = () => ({
  response: {
    status: 404,
    data: {
      errors: [
        {
          code: 'RESOURCE_NOT_FOUND',
          detail: 'Role not found',
        },
      ],
    },
  },
})

/**
 * Creates a mock 409 conflict error (e.g., duplicate name)
 */
export const mock409Error = (message: string = 'Role already exists') => ({
  response: {
    status: 409,
    data: {
      errors: [
        {
          code: 'CONFLICT',
          detail: message,
        },
      ],
    },
  },
})

/**
 * Creates a mock 500 server error response
 */
export const mock500Error = () => ({
  response: {
    status: 500,
    data: {
      errors: [
        {
          code: 'INTERNAL_SERVER_ERROR',
          detail: 'Internal server error',
        },
      ],
    },
  },
})
