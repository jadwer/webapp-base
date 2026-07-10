/**
 * Demo Module - demoService Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axiosClient from '@/lib/axiosClient'
import { demoService } from '../../services/demoService'
import type { DemoStatus, DemoResetResponse } from '../../types'

// Mock axios client
vi.mock('@/lib/axiosClient')

describe('demoService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getStatus', () => {
    it('should fetch demo status from the public endpoint', async () => {
      // Arrange
      const mockStatus: DemoStatus = {
        demo_mode: true,
        next_scheduled_reset: '2026-07-13T06:00:00Z',
      }
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockStatus })

      // Act
      const result = await demoService.getStatus()

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/demo/status')
      expect(result).toEqual(mockStatus)
    })

    it('should return demo_mode false when backend is not in demo mode', async () => {
      // Arrange
      const mockStatus: DemoStatus = {
        demo_mode: false,
        next_scheduled_reset: null,
      }
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockStatus })

      // Act
      const result = await demoService.getStatus()

      // Assert
      expect(result.demo_mode).toBe(false)
      expect(result.next_scheduled_reset).toBeNull()
    })

    it('should propagate errors when fetching status fails', async () => {
      // Arrange
      const error = new Error('Network Error')
      vi.mocked(axiosClient.get).mockRejectedValue(error)

      // Act & Assert
      await expect(demoService.getStatus()).rejects.toThrow('Network Error')
    })
  })

  describe('reset', () => {
    it('should POST to the reset endpoint and return the response', async () => {
      // Arrange
      const mockResponse: DemoResetResponse = {
        message: 'Demo environment reset',
        reset_at: '2026-07-09T12:00:00Z',
      }
      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse })

      // Act
      const result = await demoService.reset()

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/demo/reset')
      expect(result).toEqual(mockResponse)
    })

    it('should propagate 429 throttle errors', async () => {
      // Arrange
      const throttleError = Object.assign(new Error('Too Many Requests'), {
        response: { status: 429 },
      })
      vi.mocked(axiosClient.post).mockRejectedValue(throttleError)

      // Act & Assert
      await expect(demoService.reset()).rejects.toMatchObject({
        response: { status: 429 },
      })
    })

    it('should propagate 401 errors when not authenticated', async () => {
      // Arrange
      const authError = Object.assign(new Error('Unauthorized'), {
        response: { status: 401 },
      })
      vi.mocked(axiosClient.post).mockRejectedValue(authError)

      // Act & Assert
      await expect(demoService.reset()).rejects.toMatchObject({
        response: { status: 401 },
      })
    })
  })
})
