// src/modules/auth/tests/lib/profileApi.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getCurrentUser, changePassword } from '../../lib/profileApi'
import axiosClient from '@/lib/axiosClient'
import { mockUser, mockProfileResponse, mock422Error } from '../utils/test-utils'

// ============================================
// MOCKS
// ============================================

vi.mock('@/lib/axiosClient')

// ============================================
// SETUP
// ============================================

describe('profileApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================
  // GET CURRENT USER TESTS
  // ============================================

  describe('getCurrentUser', () => {
    it('should fetch and return user profile', async () => {
      const testUser = mockUser()
      const mockResponse = mockProfileResponse(testUser)

      vi.mocked(axiosClient.get).mockResolvedValueOnce(mockResponse)

      const user = await getCurrentUser()

      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/profile')
      // getCurrentUser returns attributes only (no id)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...userWithoutId } = testUser
      expect(user).toEqual(userWithoutId)
    })

    it('should return null if no user data in response', async () => {
      vi.mocked(axiosClient.get).mockResolvedValueOnce({
        data: {},
      })

      const user = await getCurrentUser()

      expect(user).toBeNull()
    })

    it('should handle API errors gracefully', async () => {
      vi.mocked(axiosClient.get).mockRejectedValueOnce(
        new Error('Network error')
      )

      await expect(getCurrentUser()).rejects.toThrow('Network error')
    })
  })

  // ============================================
  // CHANGE PASSWORD TESTS
  // ============================================

  describe('changePassword', () => {
    const validPayload = {
      current_password: 'old-password',
      password: 'new-password',
      password_confirmation: 'new-password',
    }

    it('should successfully change password', async () => {
      const mockResponse = {
        data: { message: 'Password updated successfully' },
      }

      vi.mocked(axiosClient.patch).mockResolvedValueOnce(mockResponse)

      const result = await changePassword(validPayload)

      expect(axiosClient.patch).toHaveBeenCalledWith(
        '/api/v1/profile/password',
        validPayload
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should parse and throw 422 validation errors', async () => {
      const error422 = mock422Error(
        'current_password',
        'Current password is incorrect'
      )

      vi.mocked(axiosClient.patch).mockRejectedValueOnce(error422)

      // parseJsonApiErrors includes the full path
      await expect(changePassword(validPayload)).rejects.toMatchObject({
        'data/attributes/current_password': ['Current password is incorrect'],
      })
    })

    it('should throw non-422 errors as-is', async () => {
      const error500 = {
        response: {
          status: 500,
          data: { message: 'Server error' },
        },
      }

      vi.mocked(axiosClient.patch).mockRejectedValueOnce(error500)

      await expect(changePassword(validPayload)).rejects.toEqual(error500)
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network error')

      vi.mocked(axiosClient.patch).mockRejectedValueOnce(networkError)

      await expect(changePassword(validPayload)).rejects.toThrow('Network error')
    })
  })
})
