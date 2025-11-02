// src/modules/auth/tests/components/LoginForm.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '../../components/LoginForm'
import { useAuth } from '../../lib/auth'
import { useSearchParams } from 'next/navigation'

// ============================================
// MOCKS
// ============================================

vi.mock('../../lib/auth')
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}))

// ============================================
// SETUP
// ============================================

describe('LoginForm', () => {
  const mockLogin = vi.fn()
  const mockOnLoginSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock useAuth
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
      forgotPassword: vi.fn(),
      resendEmailVerification: vi.fn(),
      error: null,
    })

    // Mock useSearchParams
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn().mockReturnValue(null),
    } as any)
  })

  // ============================================
  // RENDERING TESTS
  // ============================================

  it('should render email and password inputs', () => {
    render(<LoginForm redirect="/dashboard" />)

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    // Use placeholder text to avoid ambiguity with password toggle button
    expect(screen.getByPlaceholderText(/tu contraseña/i)).toBeInTheDocument()
  })

  it('should render submit button', () => {
    render(<LoginForm redirect="/dashboard" />)

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    expect(submitButton).toBeInTheDocument()
  })

  it('should show registered success message when registered=true in URL', () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === 'registered' ? 'true' : null),
    } as any)

    render(<LoginForm redirect="/dashboard" />)

    expect(
      screen.getByText(/tu cuenta fue creada correctamente/i)
    ).toBeInTheDocument()
  })

  // ============================================
  // FORM VALIDATION TESTS
  // ============================================

  it('should show validation error for invalid email', async () => {
    render(<LoginForm redirect="/dashboard" />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/correo inválido/i)).toBeInTheDocument()
    })
  })

  it('should show validation error for short password', async () => {
    render(<LoginForm redirect="/dashboard" />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByPlaceholderText(/tu contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: '123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)
      ).toBeInTheDocument()
    })
  })

  // ============================================
  // LOGIN FUNCTIONALITY TESTS
  // ============================================

  it('should call login with correct credentials', async () => {
    mockLogin.mockResolvedValueOnce(true)

    render(<LoginForm redirect="/dashboard" onLoginSuccess={mockOnLoginSuccess} />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByPlaceholderText(/tu contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password123',
        })
      )
    })
  })

  it('should call onLoginSuccess callback on successful login', async () => {
    mockLogin.mockResolvedValueOnce(true)

    render(<LoginForm redirect="/dashboard" onLoginSuccess={mockOnLoginSuccess} />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByPlaceholderText(/tu contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalled()
    })
  })

  it('should not call onLoginSuccess on failed login', async () => {
    mockLogin.mockResolvedValueOnce(false)

    render(<LoginForm redirect="/dashboard" onLoginSuccess={mockOnLoginSuccess} />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByPlaceholderText(/tu contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrong-password' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
    })

    expect(mockOnLoginSuccess).not.toHaveBeenCalled()
  })

  // ============================================
  // LOADING STATE TESTS
  // ============================================

  it('should disable submit button while submitting', async () => {
    mockLogin.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(true), 100)
        })
    )

    render(<LoginForm redirect="/dashboard" />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByPlaceholderText(/tu contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    // Button should be disabled during submission
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })

    // Wait for submission to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('should show loading text while submitting', async () => {
    mockLogin.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(true), 100)
        })
    )

    render(<LoginForm redirect="/dashboard" />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByPlaceholderText(/tu contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    // Should show loading text
    await waitFor(() => {
      expect(screen.getByText(/iniciando sesión\.\.\./i)).toBeInTheDocument()
    })

    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.queryByText(/iniciando sesión\.\.\./i)).not.toBeInTheDocument()
    })
  })
})
