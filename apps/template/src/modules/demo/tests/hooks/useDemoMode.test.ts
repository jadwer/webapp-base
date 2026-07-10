/**
 * Demo Module - useDemoMode Hook Tests
 *
 * Verifies the double check: build flag (NEXT_PUBLIC_DEMO_MODE) AND
 * backend confirmation (GET /api/v1/demo/status -> demo_mode: true).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { DemoStatus } from '../../types'

// Mock the service
vi.mock('../../services/demoService', () => ({
  demoService: { getStatus: vi.fn() },
}))

// Mock SWR with a controllable spy
const swrMock = vi.fn()
vi.mock('swr', () => ({
  default: (...args: unknown[]) => swrMock(...args),
}))

import { useDemoMode } from '../../hooks/useDemoMode'

function mockSwrReturn(data: DemoStatus | undefined, error: unknown = undefined) {
  swrMock.mockReturnValue({
    data,
    error,
    isLoading: !data && !error,
    mutate: vi.fn(),
  })
}

describe('useDemoMode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSwrReturn(undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('build flag disabled (NEXT_PUBLIC_DEMO_MODE != true)', () => {
    it('should not fetch and return isDemo false', () => {
      // Arrange
      vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false')

      // Act
      const { result } = renderHook(() => useDemoMode())

      // Assert - SWR key is null: no request made
      expect(swrMock).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object))
      expect(result.current.isDemo).toBe(false)
      expect(result.current.nextReset).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('should stay off even if the backend would report demo_mode true', () => {
      // Arrange
      vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false')
      mockSwrReturn({ demo_mode: true, next_scheduled_reset: '2026-07-13T06:00:00Z' })

      // Act
      const { result } = renderHook(() => useDemoMode())

      // Assert - build flag wins: still not demo
      expect(result.current.isDemo).toBe(false)
      expect(result.current.nextReset).toBeNull()
    })
  })

  describe('build flag enabled (NEXT_PUBLIC_DEMO_MODE = true)', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'true')
    })

    it('should fetch demo status with the demo-status key', () => {
      // Act
      renderHook(() => useDemoMode())

      // Assert
      expect(swrMock).toHaveBeenCalledWith(
        'demo-status',
        expect.any(Function),
        expect.objectContaining({
          revalidateOnFocus: false,
          refreshInterval: 5 * 60 * 1000,
          dedupingInterval: 5 * 60 * 1000,
        })
      )
    })

    it('should return isDemo true when the backend confirms demo mode', () => {
      // Arrange
      mockSwrReturn({ demo_mode: true, next_scheduled_reset: '2026-07-13T06:00:00Z' })

      // Act
      const { result } = renderHook(() => useDemoMode())

      // Assert
      expect(result.current.isDemo).toBe(true)
      expect(result.current.nextReset).toBe('2026-07-13T06:00:00Z')
    })

    it('should return isDemo false when the backend is NOT in demo mode (double check)', () => {
      // Arrange
      mockSwrReturn({ demo_mode: false, next_scheduled_reset: null })

      // Act
      const { result } = renderHook(() => useDemoMode())

      // Assert - backend says no: hide everything
      expect(result.current.isDemo).toBe(false)
      expect(result.current.nextReset).toBeNull()
    })

    it('should return isDemo false while status is still loading', () => {
      // Arrange - no data yet
      mockSwrReturn(undefined)

      // Act
      const { result } = renderHook(() => useDemoMode())

      // Assert
      expect(result.current.isDemo).toBe(false)
      expect(result.current.isLoading).toBe(true)
    })

    it('should report isError and isDemo false when the status request fails', () => {
      // Arrange
      mockSwrReturn(undefined, new Error('Network Error'))

      // Act
      const { result } = renderHook(() => useDemoMode())

      // Assert
      expect(result.current.isDemo).toBe(false)
      expect(result.current.isError).toBe(true)
    })

    it('should return null nextReset when backend sends none', () => {
      // Arrange
      mockSwrReturn({ demo_mode: true, next_scheduled_reset: null })

      // Act
      const { result } = renderHook(() => useDemoMode())

      // Assert
      expect(result.current.isDemo).toBe(true)
      expect(result.current.nextReset).toBeNull()
    })
  })
})
