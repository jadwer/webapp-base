/**
 * useRoles Hooks Tests
 * Tests for roles SWR hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useRoles, useRole, useRoleActions, useRoleStats } from '../../hooks/useRoles'
import { rolesService } from '../../services/rolesService'
import {
  mockRole,
  mockRoles,
  mockRoleFormData,
  mockPermissions,
  mock404Error,
  mock422Error,
} from '../utils/test-utils'

// Mock the roles service
vi.mock('../../services/rolesService')

describe('useRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and return roles without includes', async () => {
    // Arrange
    const roles = mockRoles(3)
    vi.mocked(rolesService.getAll).mockResolvedValue(roles)

    // Act
    const { result } = renderHook(() => useRoles())

    // Assert - Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.roles).toEqual([])

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert - Data loaded
    expect(result.current.roles).toEqual(roles)
    expect(result.current.error).toBeUndefined()
    expect(rolesService.getAll).toHaveBeenCalledWith(undefined)
  })

  it('should fetch roles with permissions included', async () => {
    // Arrange
    const roles = mockRoles(2).map((r) => ({
      ...r,
      permissions: mockPermissions(3),
    }))
    vi.mocked(rolesService.getAll).mockResolvedValue(roles)

    // Act
    const { result } = renderHook(() => useRoles(['permissions']))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.roles).toEqual(roles)
    expect(result.current.roles[0].permissions).toBeDefined()
    expect(rolesService.getAll).toHaveBeenCalledWith(['permissions'])
  })

  it('should provide mutate function for revalidation', async () => {
    // Arrange
    const roles = mockRoles(2)
    vi.mocked(rolesService.getAll).mockResolvedValue(roles)

    // Act
    const { result } = renderHook(() => useRoles())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.mutate).toBeDefined()
    expect(typeof result.current.mutate).toBe('function')
  })
})

describe('useRole', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch a single role by ID', async () => {
    // Arrange
    const role = mockRole({ id: 5 })
    vi.mocked(rolesService.getById).mockResolvedValue(role)

    // Act
    const { result } = renderHook(() => useRole(5))

    // Assert - Initially loading
    expect(result.current.isLoading).toBe(true)

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert - Data loaded
    expect(result.current.role).toEqual(role)
    expect(result.current.error).toBeUndefined()
    expect(rolesService.getById).toHaveBeenCalledWith(5, undefined)
  })

  it('should fetch a role with permissions included', async () => {
    // Arrange
    const role = mockRole({
      id: 1,
      permissions: mockPermissions(3),
    })
    vi.mocked(rolesService.getById).mockResolvedValue(role)

    // Act
    const { result } = renderHook(() => useRole(1, ['permissions']))

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.role).toEqual(role)
    expect(result.current.role?.permissions).toBeDefined()
    expect(rolesService.getById).toHaveBeenCalledWith(1, ['permissions'])
  })

  it('should not fetch when ID is null', () => {
    // Act
    const { result } = renderHook(() => useRole(null))

    // Assert - SWR returns undefined for null key immediately
    expect(result.current.role).toBeUndefined()
    expect(rolesService.getById).not.toHaveBeenCalled()
  })
})

describe('useRoleActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createRole', () => {
    it('should create a new role', async () => {
      // Arrange
      const formData = mockRoleFormData()
      const createdRole = mockRole({
        name: formData.name,
        description: formData.description,
      })
      vi.mocked(rolesService.create).mockResolvedValue(createdRole)

      // Act
      const { result } = renderHook(() => useRoleActions())
      const createdResult = await result.current.createRole(formData)

      // Assert
      expect(createdResult).toEqual(createdRole)
      expect(rolesService.create).toHaveBeenCalledWith(formData)
    })

    it('should handle creation errors', async () => {
      // Arrange
      const formData = mockRoleFormData()
      const error = mock422Error('name', 'Name is required')
      vi.mocked(rolesService.create).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useRoleActions())

      // Assert
      await expect(result.current.createRole(formData)).rejects.toEqual(error)
    })
  })

  describe('updateRole', () => {
    it('should update an existing role', async () => {
      // Arrange
      const formData = mockRoleFormData({ name: 'updated-role' })
      const updatedRole = mockRole({
        id: 1,
        name: formData.name,
      })
      vi.mocked(rolesService.update).mockResolvedValue(updatedRole)

      // Act
      const { result } = renderHook(() => useRoleActions())
      const updatedResult = await result.current.updateRole(1, formData)

      // Assert
      expect(updatedResult).toEqual(updatedRole)
      expect(rolesService.update).toHaveBeenCalledWith(1, formData)
    })

    it('should handle update errors', async () => {
      // Arrange
      const formData = mockRoleFormData()
      const error = mock404Error()
      vi.mocked(rolesService.update).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useRoleActions())

      // Assert
      await expect(result.current.updateRole(999, formData)).rejects.toEqual(error)
    })
  })

  describe('deleteRole', () => {
    it('should delete a role', async () => {
      // Arrange
      vi.mocked(rolesService.delete).mockResolvedValue(undefined)

      // Act
      const { result } = renderHook(() => useRoleActions())
      await result.current.deleteRole(1)

      // Assert
      expect(rolesService.delete).toHaveBeenCalledWith(1)
    })

    it('should handle delete errors', async () => {
      // Arrange
      const error = mock404Error()
      vi.mocked(rolesService.delete).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useRoleActions())

      // Assert
      await expect(result.current.deleteRole(999)).rejects.toEqual(error)
    })
  })
})

describe('useRoleStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should calculate role statistics', async () => {
    // Arrange
    const roles = [
      mockRole({ id: 1, permissions: mockPermissions(2) }),
      mockRole({ id: 2, permissions: [] }),
      mockRole({ id: 3, permissions: mockPermissions(1) }),
      mockRole({ id: 4, permissions: undefined }),
    ]
    vi.mocked(rolesService.getAll).mockResolvedValue(roles)

    // Act
    const { result } = renderHook(() => useRoleStats())

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.stats).toEqual({
      total: 4,
      withPermissions: 2,
      withoutPermissions: 2,
    })
  })

  it('should provide mutate function', async () => {
    // Arrange
    const roles = mockRoles(2)
    vi.mocked(rolesService.getAll).mockResolvedValue(roles)

    // Act
    const { result } = renderHook(() => useRoleStats())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.mutate).toBeDefined()
    expect(typeof result.current.mutate).toBe('function')
  })
})
