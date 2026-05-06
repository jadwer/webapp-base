/**
 * Roles Service Tests
 * Tests for the roles API service layer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '@/lib/axiosClient'
import { rolesService } from '../../services/rolesService'
import {
  mockRole,
  mockRoles,
  mockRoleFormData,
  mockJsonApiRoleResponse,
  mockJsonApiRolesResponse,
  mockPermissions,
  mock422Error,
  mock404Error,
  mock500Error,
} from '../utils/test-utils'

// Mock axios client
vi.mock('@/lib/axiosClient')

describe('rolesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all roles without includes', async () => {
      // Arrange
      const roles = mockRoles(3).map((r) => ({ ...r, permissions: undefined }))
      const apiResponse = mockJsonApiRolesResponse(roles)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await rolesService.getAll()

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/roles')
      expect(result).toHaveLength(3)
      expect(result[0]).toHaveProperty('name')
      expect(result[0]).toHaveProperty('guard_name')
    })

    it('should fetch all roles with permissions included', async () => {
      // Arrange
      const roles = mockRoles(2)
      const apiResponse = mockJsonApiRolesResponse(roles)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await rolesService.getAll(['permissions'])

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/roles?include=permissions')
      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('permissions')
    })

    it('should handle empty response', async () => {
      // Arrange
      vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } })

      // Act
      const result = await rolesService.getAll()

      // Assert
      expect(result).toEqual([])
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const error = mock500Error()
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(rolesService.getAll()).rejects.toEqual(error)
    })
  })

  describe('getById', () => {
    it('should fetch a single role by ID', async () => {
      // Arrange
      const role = mockRole({ id: 5 })
      const apiResponse = mockJsonApiRoleResponse(role)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await rolesService.getById(5)

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/roles/5')
      expect(result.id).toBe(5)
      expect(result.name).toBe(role.name)
    })

    it('should fetch a role with permissions included', async () => {
      // Arrange
      const role = mockRole({
        id: 1,
        permissions: mockPermissions(3),
      })
      const apiResponse = mockJsonApiRoleResponse(role)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await rolesService.getById(1, ['permissions'])

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/v1/roles/1?include=permissions')
      expect(result.permissions).toBeDefined()
      expect(result.permissions).toHaveLength(3)
    })

    it('should throw 404 error when role not found', async () => {
      // Arrange
      const error = mock404Error()
      vi.mocked(axios.get).mockRejectedValue(error)

      // Act & Assert
      await expect(rolesService.getById(999)).rejects.toEqual(error)
    })
  })

  describe('create', () => {
    it('should create a new role without permissions', async () => {
      // Arrange
      const formData = mockRoleFormData({ permissions: [] })
      const createdRole = mockRole({
        name: formData.name,
        description: formData.description,
        guard_name: formData.guard_name,
        permissions: [],
      })
      const apiResponse = {
        data: {
          data: createdRole,
        },
      }
      vi.mocked(axios.post).mockResolvedValue(apiResponse)

      // Act
      const result = await rolesService.create(formData)

      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/v1/roles', {
        data: {
          type: 'roles',
          attributes: {
            name: formData.name,
            description: formData.description,
            guard_name: formData.guard_name,
          },
        },
      })
      expect(result).toEqual(createdRole)
    })

    it('should create a new role with permissions', async () => {
      // Arrange
      const formData = mockRoleFormData({ permissions: [1, 2, 3] })
      const createdRole = mockRole({
        name: formData.name,
        permissions: mockPermissions(3),
      })
      const apiResponse = {
        data: {
          data: createdRole,
        },
      }
      vi.mocked(axios.post).mockResolvedValue(apiResponse)

      // Act
      const result = await rolesService.create(formData)

      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/v1/roles', {
        data: {
          type: 'roles',
          attributes: {
            name: formData.name,
            description: formData.description,
            guard_name: formData.guard_name,
          },
          relationships: {
            permissions: {
              data: [
                { type: 'permissions', id: '1' },
                { type: 'permissions', id: '2' },
                { type: 'permissions', id: '3' },
              ],
            },
          },
        },
      })
      expect(result).toEqual(createdRole)
    })

    it('should throw validation error on invalid data', async () => {
      // Arrange
      const formData = mockRoleFormData({ name: '' })
      const error = mock422Error('name', 'Name is required')
      vi.mocked(axios.post).mockRejectedValue(error)

      // Act & Assert
      await expect(rolesService.create(formData)).rejects.toEqual(error)
    })
  })

  describe('update', () => {
    it('should update an existing role', async () => {
      // Arrange
      const formData = mockRoleFormData({ name: 'updated-role' })
      const updatedRole = mockRole({
        id: 1,
        name: formData.name,
      })
      const apiResponse = {
        data: {
          data: updatedRole,
        },
      }
      vi.mocked(axios.patch).mockResolvedValue(apiResponse)

      // Act
      const result = await rolesService.update(1, formData)

      // Assert
      expect(axios.patch).toHaveBeenCalledWith('/api/v1/roles/1', {
        data: {
          type: 'roles',
          id: '1',
          attributes: {
            name: formData.name,
            description: formData.description,
            guard_name: formData.guard_name,
          },
          relationships: {
            permissions: {
              data: [],
            },
          },
        },
      })
      expect(result).toEqual(updatedRole)
    })

    it('should throw 404 error when updating non-existent role', async () => {
      // Arrange
      const formData = mockRoleFormData()
      const error = mock404Error()
      vi.mocked(axios.patch).mockRejectedValue(error)

      // Act & Assert
      await expect(rolesService.update(999, formData)).rejects.toEqual(error)
    })
  })

  describe('delete', () => {
    it('should delete a role', async () => {
      // Arrange
      vi.mocked(axios.delete).mockResolvedValue({ data: null })

      // Act
      await rolesService.delete(1)

      // Assert
      expect(axios.delete).toHaveBeenCalledWith('/api/v1/roles/1')
    })

    it('should throw 404 error when deleting non-existent role', async () => {
      // Arrange
      const error = mock404Error()
      vi.mocked(axios.delete).mockRejectedValue(error)

      // Act & Assert
      await expect(rolesService.delete(999)).rejects.toEqual(error)
    })
  })

  describe('getStats', () => {
    it('should return role statistics', async () => {
      // Arrange
      const roles = [
        mockRole({ id: 1, permissions: mockPermissions(2) }),
        mockRole({ id: 2, permissions: [] }),
        mockRole({ id: 3, permissions: mockPermissions(1) }),
      ]
      const apiResponse = mockJsonApiRolesResponse(roles)
      vi.mocked(axios.get).mockResolvedValue({ data: apiResponse })

      // Act
      const result = await rolesService.getStats()

      // Assert
      expect(result).toEqual({
        total: 3,
        withPermissions: 2,
        withoutPermissions: 1,
      })
    })

    it('should handle empty roles list', async () => {
      // Arrange
      vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } })

      // Act
      const result = await rolesService.getStats()

      // Assert
      expect(result).toEqual({
        total: 0,
        withPermissions: 0,
        withoutPermissions: 0,
      })
    })
  })
})
