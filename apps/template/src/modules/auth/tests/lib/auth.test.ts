// src/modules/auth/tests/lib/auth.test.ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useAuth } from '../../lib/auth'
import axios from '@/lib/axiosClient'
import {
  mockUser,
  mockToken,
  mockLoginResponse,
  mockProfileResponse,
  mock422Error,
  mock401Error,
  mock403Error,
  mock500Error,
} from '../utils/test-utils'

// ============================================
// MOCKS
// ============================================

vi.mock('@/lib/axiosClient')
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}))

// Mock SWR to avoid SSR issues
vi.mock('swr', async () => {
  const actual = await vi.importActual('swr')
  return actual
})

// ============================================
// SETUP & TEARDOWN
// ============================================

describe('useAuth Hook', () => {
  let mockLocalStorage: Storage

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })

    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ============================================
  // LOGIN TESTS
  // ============================================

  describe('login', () => {
    it('should store token and fetch profile on successful login', async () => {
      const testUser = mockUser()
      const testToken = mockToken()

      // Mock login response
      vi.mocked(axios.post).mockResolvedValueOnce(mockLoginResponse(testToken))

      // Mock profile response
      vi.mocked(axios.get).mockResolvedValueOnce(mockProfileResponse(testUser))

      const { result } = renderHook(() => useAuth())

      const setErrors = vi.fn()
      const setStatus = vi.fn()

      let success: boolean = false
      await act(async () => {
        success = await result.current.login({
          email: 'test@example.com',
          password: 'password123',
          setErrors,
          setStatus,
        })
      })

      expect(success).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', testToken)
      expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should handle 401 errors with custom message', async () => {
      const setStatus = vi.fn()
      const setErrors = vi.fn()

      vi.mocked(axios.post).mockRejectedValueOnce(mock401Error('Invalid credentials'))

      const { result } = renderHook(() => useAuth())

      let success: boolean = true
      await act(async () => {
        success = await result.current.login({
          email: 'test@example.com',
          password: 'wrong',
          setErrors,
          setStatus,
        })
      })

      expect(success).toBe(false)
      expect(setStatus).toHaveBeenCalledWith('Invalid credentials')
    })

    it('should handle 422 validation errors', async () => {
      const setErrors = vi.fn()
      const setStatus = vi.fn()

      vi.mocked(axios.post).mockRejectedValueOnce(
        mock422Error('email', 'Email is required')
      )

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.login({
          email: '',
          password: 'test',
          setErrors,
          setStatus,
        })
      })

      expect(setErrors).toHaveBeenCalled()
    })

    it('should handle 403 forbidden errors', async () => {
      const setStatus = vi.fn()
      const setErrors = vi.fn()

      vi.mocked(axios.post).mockRejectedValueOnce(mock403Error())

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123',
          setErrors,
          setStatus,
        })
      })

      expect(setStatus).toHaveBeenCalledWith(
        'No tienes permiso para realizar esta acción'
      )
    })

    it('should handle 500 server errors', async () => {
      const setStatus = vi.fn()
      const setErrors = vi.fn()

      vi.mocked(axios.post).mockRejectedValueOnce(mock500Error())

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123',
          setErrors,
          setStatus,
        })
      })

      expect(setStatus).toHaveBeenCalledWith('Error del servidor. Intenta más tarde.')
    })

    it('should return false on any error', async () => {
      const setStatus = vi.fn()
      const setErrors = vi.fn()

      vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAuth())

      let success: boolean = true
      await act(async () => {
        success = await result.current.login({
          email: 'test@example.com',
          password: 'password123',
          setErrors,
          setStatus,
        })
      })

      expect(success).toBe(false)
      expect(setStatus).toHaveBeenCalledWith('Ocurrió un error inesperado.')
    })
  })

  // ============================================
  // LOGOUT TESTS
  // ============================================

  describe('logout', () => {
    it('should call backend logout endpoint', async () => {
      vi.mocked(axios.post).mockResolvedValueOnce({ data: { success: true } })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.logout()
      })

      expect(axios.post).toHaveBeenCalledWith('/api/auth/logout')
    })

    it('should clear localStorage even if backend logout fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.mocked(axios.post).mockRejectedValueOnce(new Error('Backend error'))

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.logout()
      })

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('access_token')
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('should clear token from localStorage', async () => {
      vi.mocked(axios.post).mockResolvedValueOnce({ data: { success: true } })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.logout()
      })

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('access_token')
    })
  })

  // ============================================
  // REGISTER TESTS
  // ============================================

  describe('register', () => {
    it('should call register endpoint with user data', async () => {
      const setErrors = vi.fn()

      vi.mocked(axios.post).mockResolvedValueOnce({ data: { success: true } })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.register({
          name: 'New User',
          email: 'new@example.com',
          password: 'password123',
          passwordConfirmation: 'password123',
          setErrors,
        })
      })

      expect(axios.post).toHaveBeenCalledWith('/api/auth/register', {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      })
    })

    it('should handle 422 validation errors on register', async () => {
      const setErrors = vi.fn()

      vi.mocked(axios.post).mockRejectedValueOnce(
        mock422Error('email', 'Email already exists')
      )

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.register({
          name: 'Test',
          email: 'existing@example.com',
          password: 'password123',
          passwordConfirmation: 'password123',
          setErrors,
        })
      })

      expect(setErrors).toHaveBeenCalled()
    })

    it('should await mutate after successful registration', async () => {
      const setErrors = vi.fn()

      vi.mocked(axios.post).mockResolvedValueOnce({ data: { success: true } })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.register({
          name: 'New User',
          email: 'new@example.com',
          password: 'password123',
          passwordConfirmation: 'password123',
          setErrors,
        })
      })

      // Verify it completes without throwing
      expect(axios.post).toHaveBeenCalled()
    })
  })

  // ============================================
  // FORGOT PASSWORD TESTS
  // ============================================

  describe('forgotPassword', () => {
    it('should call forgot password endpoint and return true on success', async () => {
      const setErrors = vi.fn()
      const setStatus = vi.fn()

      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { message: 'Si el correo esta registrado, recibiras un enlace.' },
      })

      const { result } = renderHook(() => useAuth())

      let success: boolean = false
      await act(async () => {
        success = await result.current.forgotPassword({
          email: 'test@example.com',
          setErrors,
          setStatus,
        })
      })

      expect(success).toBe(true)
      expect(axios.post).toHaveBeenCalledWith('/api/auth/forgot-password', {
        email: 'test@example.com',
      })
      expect(setStatus).toHaveBeenCalledWith('Si el correo esta registrado, recibiras un enlace.')
    })

    it('should return false on validation error', async () => {
      const setErrors = vi.fn()
      const setStatus = vi.fn()

      vi.mocked(axios.post).mockRejectedValueOnce(
        mock422Error('email', 'Email is required')
      )

      const { result } = renderHook(() => useAuth())

      let success: boolean = true
      await act(async () => {
        success = await result.current.forgotPassword({
          email: '',
          setErrors,
          setStatus,
        })
      })

      expect(success).toBe(false)
      expect(setErrors).toHaveBeenCalled()
    })
  })

  // ============================================
  // RESET PASSWORD TESTS
  // ============================================

  describe('resetPassword', () => {
    it('should call reset password endpoint and return true on success', async () => {
      const setErrors = vi.fn()
      const setStatus = vi.fn()

      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { message: 'Tu contrasena ha sido restablecida exitosamente.' },
      })

      const { result } = renderHook(() => useAuth())

      let success: boolean = false
      await act(async () => {
        success = await result.current.resetPassword({
          token: 'valid-token',
          email: 'test@example.com',
          password: 'new-password-123',
          password_confirmation: 'new-password-123',
          setErrors,
          setStatus,
        })
      })

      expect(success).toBe(true)
      expect(axios.post).toHaveBeenCalledWith('/api/auth/reset-password', {
        token: 'valid-token',
        email: 'test@example.com',
        password: 'new-password-123',
        password_confirmation: 'new-password-123',
      })
      expect(setStatus).toHaveBeenCalledWith('Tu contrasena ha sido restablecida exitosamente.')
    })

    it('should return false on invalid token', async () => {
      const setErrors = vi.fn()
      const setStatus = vi.fn()

      vi.mocked(axios.post).mockRejectedValueOnce(
        mock422Error('email', 'This password reset token is invalid.')
      )

      const { result } = renderHook(() => useAuth())

      let success: boolean = true
      await act(async () => {
        success = await result.current.resetPassword({
          token: 'invalid-token',
          email: 'test@example.com',
          password: 'new-password',
          password_confirmation: 'new-password',
          setErrors,
          setStatus,
        })
      })

      expect(success).toBe(false)
      expect(setErrors).toHaveBeenCalled()
    })
  })

  // ============================================
  // RESEND EMAIL VERIFICATION TESTS
  // ============================================

  describe('resendEmailVerification', () => {
    it('should call resend verification endpoint', async () => {
      const setStatus = vi.fn()

      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { message: 'Se ha enviado un enlace de verificacion a tu correo.' },
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.resendEmailVerification({ setStatus })
      })

      expect(axios.post).toHaveBeenCalledWith('/api/auth/email/verification-notification')
      expect(setStatus).toHaveBeenCalledWith('Se ha enviado un enlace de verificacion a tu correo.')
    })

    it('should handle errors gracefully', async () => {
      const setStatus = vi.fn()

      vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.resendEmailVerification({ setStatus })
      })

      expect(setStatus).toHaveBeenCalledWith('Error al enviar el correo de verificacion.')
    })
  })

  // ============================================
  // AUTHENTICATION STATE TESTS
  // ============================================

  describe('authentication state', () => {
    it('should return null user when no token exists', () => {
      vi.mocked(mockLocalStorage.getItem).mockReturnValue(null)

      const { result } = renderHook(() => useAuth())

      // SWR returns undefined when key is null
      expect(result.current.user).toBeUndefined()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should set isLoading to true while fetching', () => {
      vi.mocked(mockLocalStorage.getItem).mockReturnValue('test-token')

      // Mock a pending request
      vi.mocked(axios.get).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockProfileResponse(mockUser())), 1000)
          })
      )

      const { result } = renderHook(() => useAuth())

      // Initially loading
      expect(result.current.isLoading).toBe(true)
    })
  })
})
