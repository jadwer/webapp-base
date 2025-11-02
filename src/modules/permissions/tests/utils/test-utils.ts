/**
 * Test Utilities for Permissions Module
 * Mock factories and helper functions for testing
 */

import { Permission, PermissionFormData } from '../../types/permission'

/**
 * Creates a mock Permission object with optional overrides
 */
export const mockPermission = (overrides?: Partial<Permission>): Permission => ({
  id: '1',
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
      id: (index + 1).toString(),
      name: `permission-${index + 1}`,
      guard_name: index % 2 === 0 ? 'api' : 'web',
    })
  )
}

/**
 * Creates mock form data for creating/updating permissions
 */
export const mockPermissionFormData = (
  overrides?: Partial<PermissionFormData>
): PermissionFormData => ({
  name: 'test-permission',
  guard_name: 'api',
  ...overrides,
})

/**
 * Creates a mock JSON:API response for a single permission
 */
export const mockJsonApiPermissionResponse = (permission: Permission) => ({
  data: {
    id: permission.id,
    type: 'permissions',
    attributes: {
      name: permission.name,
      guard_name: permission.guard_name,
      createdAt: permission.created_at,
      updatedAt: permission.updated_at,
    },
  },
})

/**
 * Creates a mock JSON:API response for multiple permissions
 */
export const mockJsonApiPermissionsResponse = (permissions: Permission[]) => ({
  data: permissions.map((permission) => ({
    id: permission.id,
    type: 'permissions',
    attributes: {
      name: permission.name,
      guard_name: permission.guard_name,
      createdAt: permission.created_at,
      updatedAt: permission.updated_at,
    },
  })),
})

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
          detail: 'Permission not found',
        },
      ],
    },
  },
})

/**
 * Creates a mock 409 conflict error (e.g., duplicate name)
 */
export const mock409Error = (message: string = 'Permission already exists') => ({
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
