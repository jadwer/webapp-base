/**
 * usePermissions Hook Tests
 * Tests for permissions SWR hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  usePermissions,
  usePermission,
  usePermissionActions,
} from '../../hooks/usePermissions'
import * as permissionsService from '../../services/permissionsService'
import {
  mockPermission,
  mockPermissions,
  mockPermissionFormData,
  mock404Error,
  mock422Error,
} from '../utils/test-utils'

// Mock the permissions service
vi.mock('../../services/permissionsService')

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and return permissions', async () => {
    // Arrange
    const permissions = mockPermissions(3)
    vi.mocked(permissionsService.getAllPermissions).mockResolvedValue(permissions)

    // Act
    const { result } = renderHook(() => usePermissions())

    // Assert - Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.permissions).toEqual([])

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert - Data loaded
    expect(result.current.permissions).toEqual(permissions)
    expect(result.current.isError).toBeUndefined()
  })

  it('should provide mutate function for revalidation', async () => {
    // Arrange
    const permissions = mockPermissions(2)
    vi.mocked(permissionsService.getAllPermissions).mockResolvedValue(permissions)

    // Act
    const { result } = renderHook(() => usePermissions())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.mutate).toBeDefined()
    expect(typeof result.current.mutate).toBe('function')
  })
})

describe('usePermission', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch a single permission by ID', async () => {
    // Arrange
    const permission = mockPermission({ id: '5' })
    vi.mocked(permissionsService.getPermission).mockResolvedValue(permission)

    // Act
    const { result } = renderHook(() => usePermission('5'))

    // Assert - Initially loading
    expect(result.current.isLoading).toBe(true)

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert - Data loaded
    expect(result.current.permission).toEqual(permission)
    expect(result.current.isError).toBeUndefined()
    expect(permissionsService.getPermission).toHaveBeenCalledWith('5')
  })

  it('should not fetch when ID is not provided', () => {
    // Act
    const { result } = renderHook(() => usePermission(''))

    // Assert
    expect(result.current.isLoading).toBe(true)
    expect(permissionsService.getPermission).not.toHaveBeenCalled()
  })
})

describe('usePermissionActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create a new permission', async () => {
      // Arrange
      const formData = mockPermissionFormData()
      const createdPermission = mockPermission({
        name: formData.name,
        guard_name: formData.guard_name,
      })
      vi.mocked(permissionsService.createPermission).mockResolvedValue(createdPermission)

      // Act
      const { result } = renderHook(() => usePermissionActions())

      expect(result.current.isSubmitting).toBe(false)

      const createdResult = await result.current.create(formData)

      // Assert - After submission
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
      })
      expect(createdResult).toEqual(createdPermission)
      expect(permissionsService.createPermission).toHaveBeenCalledWith(formData)
    })

    it('should handle creation errors and reset isSubmitting', async () => {
      // Arrange
      const formData = mockPermissionFormData()
      const error = mock422Error('name', 'Name is required')
      vi.mocked(permissionsService.createPermission).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => usePermissionActions())

      // Assert
      await expect(result.current.create(formData)).rejects.toEqual(error)

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
      })
    })
  })

  describe('update', () => {
    it('should update an existing permission', async () => {
      // Arrange
      const formData = mockPermissionFormData({ name: 'updated-permission' })
      const updatedPermission = mockPermission({
        id: '1',
        name: formData.name,
      })
      vi.mocked(permissionsService.updatePermission).mockResolvedValue(updatedPermission)

      // Act
      const { result } = renderHook(() => usePermissionActions())

      const updatedResult = await result.current.update('1', formData)

      // Assert - After submission
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
      })
      expect(updatedResult).toEqual(updatedPermission)
      expect(permissionsService.updatePermission).toHaveBeenCalledWith('1', formData)
    })

    it('should handle update errors and reset isSubmitting', async () => {
      // Arrange
      const formData = mockPermissionFormData()
      const error = mock404Error()
      vi.mocked(permissionsService.updatePermission).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => usePermissionActions())

      // Assert
      await expect(result.current.update('999', formData)).rejects.toEqual(error)

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
      })
    })
  })

  describe('remove', () => {
    it('should delete a permission', async () => {
      // Arrange
      vi.mocked(permissionsService.deletePermission).mockResolvedValue(undefined)

      // Act
      const { result } = renderHook(() => usePermissionActions())

      await result.current.remove('1')

      // Assert - After submission
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
      })
      expect(permissionsService.deletePermission).toHaveBeenCalledWith('1')
    })

    it('should handle delete errors and reset isSubmitting', async () => {
      // Arrange
      const error = mock404Error()
      vi.mocked(permissionsService.deletePermission).mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => usePermissionActions())

      // Assert
      await expect(result.current.remove('999')).rejects.toEqual(error)

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
      })
    })
  })

  describe('isSubmitting state', () => {
    it('should expose isSubmitting state', () => {
      // Act
      const { result } = renderHook(() => usePermissionActions())

      // Assert
      expect(result.current).toHaveProperty('isSubmitting')
      expect(result.current.isSubmitting).toBe(false)
    })
  })
})
