// src/modules/auth/tests/components/AuthenticatedLayout.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import AuthenticatedLayout from '../../components/AuthenticatedLayout'
import { useAuth } from '../../lib/auth'
import { useRouter } from 'next/navigation'
import { mockUser } from '../utils/test-utils'

// ============================================
// MOCKS
// ============================================

vi.mock('../../lib/auth')
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// ============================================
// SETUP
// ============================================

describe('AuthenticatedLayout', () => {
  const mockReplace = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock useRouter
    vi.mocked(useRouter).mockReturnValue({
      replace: mockReplace,
      push: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    } as any)

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/dashboard',
      },
      writable: true,
    })
  })

  // ============================================
  // LOADING STATE TESTS
  // ============================================

  it('should show loading spinner while checking authentication', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      forgotPassword: vi.fn(),
      resendEmailVerification: vi.fn(),
      error: null,
    })

    render(
      <AuthenticatedLayout>
        <div>Protected Content</div>
      </AuthenticatedLayout>
    )

    expect(screen.getByText(/cargando sesión\.\.\./i)).toBeInTheDocument()
    expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument()
  })

  // ============================================
  // UNAUTHENTICATED TESTS
  // ============================================

  it('should redirect to login when not authenticated', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      forgotPassword: vi.fn(),
      resendEmailVerification: vi.fn(),
      error: null,
    })

    render(
      <AuthenticatedLayout>
        <div>Protected Content</div>
      </AuthenticatedLayout>
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login?redirect=')
      )
    })
  })

  it('should preserve redirect URL when redirecting to login', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/dashboard/settings',
      },
      writable: true,
    })

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      forgotPassword: vi.fn(),
      resendEmailVerification: vi.fn(),
      error: null,
    })

    render(
      <AuthenticatedLayout>
        <div>Protected Content</div>
      </AuthenticatedLayout>
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent('/dashboard/settings'))
      )
    })
  })

  // ============================================
  // AUTHENTICATED TESTS
  // ============================================

  it('should render children when authenticated', async () => {
    const testUser = mockUser()

    vi.mocked(useAuth).mockReturnValue({
      user: testUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      forgotPassword: vi.fn(),
      resendEmailVerification: vi.fn(),
      error: null,
    })

    render(
      <AuthenticatedLayout>
        <div>Protected Content</div>
      </AuthenticatedLayout>
    )

    await waitFor(() => {
      expect(screen.getByText(/protected content/i)).toBeInTheDocument()
    })

    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('should not show loading spinner when authenticated', async () => {
    const testUser = mockUser()

    vi.mocked(useAuth).mockReturnValue({
      user: testUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      forgotPassword: vi.fn(),
      resendEmailVerification: vi.fn(),
      error: null,
    })

    render(
      <AuthenticatedLayout>
        <div>Protected Content</div>
      </AuthenticatedLayout>
    )

    await waitFor(() => {
      expect(screen.queryByText(/cargando sesión\.\.\./i)).not.toBeInTheDocument()
    })
  })
})
