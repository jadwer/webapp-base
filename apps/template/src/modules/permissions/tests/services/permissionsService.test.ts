/**
 * Permissions Service Tests
 * Tests for the permissions API service layer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axiosClient from '@/lib/axiosClient'
import {
  getAllPermissions,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
} from '../../services/permissionsService'
import {
  mockPermission,
  mockPermissions,
  mockPermissionFormData,
  mockJsonApiPermissionResponse,
  mockJsonApiPermissionsResponse,
  mock422Error,
  mock404Error,
  mock409Error,
  mock500Error,
} from '../utils/test-utils'

// Mock axios client
vi.mock('@/lib/axiosClient')

describe('permissionsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllPermissions', () => {
    it('should fetch all permissions and transform response', async () => {
      // Arrange
      const permissions = mockPermissions(3)
      const apiResponse = mockJsonApiPermissionsResponse(permissions)
      vi.mocked(axiosClient.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await getAllPermissions()

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/permissions')
      expect(result).toEqual(permissions)
      expect(result).toHaveLength(3)
    })

    it('should transform camelCase API response to snake_case', async () => {
      // Arrange
      const permission = mockPermission()
      const apiResponse = mockJsonApiPermissionsResponse([permission])
      vi.mocked(axiosClient.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await getAllPermissions()

      // Assert
      expect(result[0]).toHaveProperty('created_at')
      expect(result[0]).toHaveProperty('updated_at')
      expect(result[0]).toHaveProperty('guard_name')
    })

    it('should handle empty response', async () => {
      // Arrange
      vi.mocked(axiosClient.get).mockResolvedValue({ data: { data: [] } })

      // Act
      const result = await getAllPermissions()

      // Assert
      expect(result).toEqual([])
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const error = mock500Error()
      vi.mocked(axiosClient.get).mockRejectedValue(error)

      // Act & Assert
      await expect(getAllPermissions()).rejects.toEqual(error)
    })
  })

  describe('getPermission', () => {
    it('should fetch a single permission by ID', async () => {
      // Arrange
      const permission = mockPermission({ id: '5' })
      const apiResponse = mockJsonApiPermissionResponse(permission)
      vi.mocked(axiosClient.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await getPermission('5')

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/permissions/5')
      expect(result).toEqual(permission)
    })

    it('should transform camelCase to snake_case', async () => {
      // Arrange
      const permission = mockPermission()
      const apiResponse = mockJsonApiPermissionResponse(permission)
      vi.mocked(axiosClient.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await getPermission('1')

      // Assert
      expect(result).toHaveProperty('created_at')
      expect(result).toHaveProperty('updated_at')
      expect(result).toHaveProperty('guard_name')
    })

    it('should throw 404 error when permission not found', async () => {
      // Arrange
      const error = mock404Error()
      vi.mocked(axiosClient.get).mockRejectedValue(error)

      // Act & Assert
      await expect(getPermission('999')).rejects.toEqual(error)
    })
  })

  describe('createPermission', () => {
    it('should create a new permission', async () => {
      // Arrange
      const formData = mockPermissionFormData()
      const createdPermission = mockPermission({
        name: formData.name,
        guard_name: formData.guard_name,
      })
      const apiResponse = mockJsonApiPermissionResponse(createdPermission)
      vi.mocked(axiosClient.post).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await createPermission(formData)

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/permissions', {
        data: {
          type: 'permissions',
          attributes: formData,
        },
      })
      expect(result).toEqual(createdPermission)
    })

    it('should throw validation error on invalid data', async () => {
      // Arrange
      const formData = mockPermissionFormData({ name: '' })
      const error = mock422Error('name', 'Name is required')
      vi.mocked(axiosClient.post).mockRejectedValue(error)

      // Act & Assert
      await expect(createPermission(formData)).rejects.toEqual(error)
    })

    it('should throw conflict error on duplicate name', async () => {
      // Arrange
      const formData = mockPermissionFormData()
      const error = mock409Error('Permission with this name already exists')
      vi.mocked(axiosClient.post).mockRejectedValue(error)

      // Act & Assert
      await expect(createPermission(formData)).rejects.toEqual(error)
    })
  })

  describe('updatePermission', () => {
    it('should update an existing permission', async () => {
      // Arrange
      const formData = mockPermissionFormData({ name: 'updated-permission' })
      const updatedPermission = mockPermission({
        id: '1',
        name: formData.name,
        guard_name: formData.guard_name,
      })
      const apiResponse = mockJsonApiPermissionResponse(updatedPermission)
      vi.mocked(axiosClient.patch).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await updatePermission('1', formData)

      // Assert
      expect(axiosClient.patch).toHaveBeenCalledWith('/api/v1/permissions/1', {
        data: {
          id: '1',
          type: 'permissions',
          attributes: formData,
        },
      })
      expect(result).toEqual(updatedPermission)
    })

    it('should throw 404 error when updating non-existent permission', async () => {
      // Arrange
      const formData = mockPermissionFormData()
      const error = mock404Error()
      vi.mocked(axiosClient.patch).mockRejectedValue(error)

      // Act & Assert
      await expect(updatePermission('999', formData)).rejects.toEqual(error)
    })

    it('should throw validation error on invalid update data', async () => {
      // Arrange
      const formData = mockPermissionFormData({ guard_name: 'invalid' })
      const error = mock422Error('guard_name', 'Invalid guard name')
      vi.mocked(axiosClient.patch).mockRejectedValue(error)

      // Act & Assert
      await expect(updatePermission('1', formData)).rejects.toEqual(error)
    })
  })

  describe('deletePermission', () => {
    it('should delete a permission', async () => {
      // Arrange
      vi.mocked(axiosClient.delete).mockResolvedValue({ data: null })

      // Act
      await deletePermission('1')

      // Assert
      expect(axiosClient.delete).toHaveBeenCalledWith('/api/v1/permissions/1')
    })

    it('should throw 404 error when deleting non-existent permission', async () => {
      // Arrange
      const error = mock404Error()
      vi.mocked(axiosClient.delete).mockRejectedValue(error)

      // Act & Assert
      await expect(deletePermission('999')).rejects.toEqual(error)
    })

    it('should throw 409 error when permission is in use', async () => {
      // Arrange
      const error = mock409Error('Cannot delete permission that is assigned to roles')
      vi.mocked(axiosClient.delete).mockRejectedValue(error)

      // Act & Assert
      await expect(deletePermission('1')).rejects.toEqual(error)
    })
  })
})
