/**
 * ACCOUNT FORM INTEGRATION TESTS
 * Integration tests for AccountForm component
 * Testing user interactions, validation, and form submission
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AccountForm } from '../../components/AccountForm'
import { createMockAccount } from '../utils/test-utils'
import type { AccountForm as AccountFormData } from '../../types'

describe('AccountForm Integration Tests', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render all form fields', () => {
      // Act
      render(<AccountForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      // Assert
      expect(screen.getByLabelText(/código/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/nombre de la cuenta/i)).toBeInTheDocument()
      expect(screen.getByText(/tipo de cuenta/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/nivel/i)).toBeInTheDocument()
      expect(screen.getByText(/moneda/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
    })

    it('should render with default values', () => {
      // Act
      render(<AccountForm onSubmit={mockOnSubmit} />)

      // Assert
      const codeInput = screen.getByLabelText(/código/i) as HTMLInputElement
      const nameInput = screen.getByLabelText(/nombre de la cuenta/i) as HTMLInputElement
      const levelInput = screen.getByLabelText(/nivel/i) as HTMLInputElement

      expect(codeInput.value).toBe('')
      expect(nameInput.value).toBe('')
      expect(levelInput.value).toBe('1')
    })

    it('should render with provided account data', () => {
      // Arrange
      const mockAccount = createMockAccount({
        code: '1000',
        name: 'Caja General',
        level: 1,
      })

      // Act
      render(<AccountForm account={mockAccount} onSubmit={mockOnSubmit} />)

      // Assert
      const codeInput = screen.getByLabelText(/código/i) as HTMLInputElement
      const nameInput = screen.getByLabelText(/nombre de la cuenta/i) as HTMLInputElement

      expect(codeInput.value).toBe('1000')
      expect(nameInput.value).toBe('Caja General')
    })
  })

  describe('Form Validation', () => {
    it('should show error when code is empty', async () => {
      // Arrange
      render(<AccountForm onSubmit={mockOnSubmit} />)
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

      // Act
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/el código es requerido/i)).toBeInTheDocument()
      })
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should show error when name is empty', async () => {
      // Arrange
      render(<AccountForm onSubmit={mockOnSubmit} />)
      const codeInput = screen.getByLabelText(/código/i)
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

      // Act
      fireEvent.change(codeInput, { target: { value: '1000' } })
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument()
      })
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should show error when code exceeds 255 characters', async () => {
      // Arrange
      render(<AccountForm onSubmit={mockOnSubmit} />)
      const codeInput = screen.getByLabelText(/código/i)
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i })
      const longCode = 'A'.repeat(256)

      // Act
      fireEvent.change(codeInput, { target: { value: longCode } })
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/el código no puede exceder 255 caracteres/i)).toBeInTheDocument()
      })
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should show error when level is out of range', async () => {
      // Arrange
      render(<AccountForm onSubmit={mockOnSubmit} />)
      const codeInput = screen.getByLabelText(/código/i)
      const nameInput = screen.getByLabelText(/nombre/i)
      const levelInput = screen.getByLabelText(/nivel/i)
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

      // Act
      fireEvent.change(codeInput, { target: { value: '1000' } })
      fireEvent.change(nameInput, { target: { value: 'Test Account' } })
      fireEvent.change(levelInput, { target: { value: '11' } })
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/el nivel debe estar entre 1 y 10/i)).toBeInTheDocument()
      })
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should clear errors when user corrects input', async () => {
      // Arrange
      render(<AccountForm onSubmit={mockOnSubmit} />)
      const codeInput = screen.getByLabelText(/código/i)
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

      // Act - trigger error
      fireEvent.click(submitButton)
      await waitFor(() => {
        expect(screen.getByText(/el código es requerido/i)).toBeInTheDocument()
      })

      // Act - correct input
      fireEvent.change(codeInput, { target: { value: '1000' } })

      // Assert
      await waitFor(() => {
        expect(screen.queryByText(/el código es requerido/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('User Interactions', () => {
    it('should update form fields when user types', () => {
      // Arrange
      render(<AccountForm onSubmit={mockOnSubmit} />)
      const codeInput = screen.getByLabelText(/código/i) as HTMLInputElement
      const nameInput = screen.getByLabelText(/nombre de la cuenta/i) as HTMLInputElement

      // Act
      fireEvent.change(codeInput, { target: { value: '1000' } })
      fireEvent.change(nameInput, { target: { value: 'Caja General' } })

      // Assert
      expect(codeInput.value).toBe('1000')
      expect(nameInput.value).toBe('Caja General')
    })

    it('should call onCancel when cancel button is clicked', () => {
      // Arrange
      render(<AccountForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })

      // Act
      fireEvent.click(cancelButton)

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should disable form when loading', () => {
      // Arrange
      render(<AccountForm onSubmit={mockOnSubmit} isLoading={true} />)

      // Assert
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i }) as HTMLButtonElement
      expect(submitButton.disabled).toBe(true)
    })
  })

  describe('Form Submission', () => {
    it('should submit valid form data', async () => {
      // Arrange
      mockOnSubmit.mockResolvedValue(undefined)
      render(<AccountForm onSubmit={mockOnSubmit} />)

      const codeInput = screen.getByLabelText(/código/i)
      const nameInput = screen.getByLabelText(/nombre/i)
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

      // Act
      fireEvent.change(codeInput, { target: { value: '1000' } })
      fireEvent.change(nameInput, { target: { value: 'Caja General' } })
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
      })

      const submittedData = mockOnSubmit.mock.calls[0][0] as AccountFormData
      expect(submittedData.code).toBe('1000')
      expect(submittedData.name).toBe('Caja General')
      expect(submittedData.accountType).toBe('asset')
      expect(submittedData.level).toBe(1)
      expect(submittedData.isPostable).toBe(true)
      expect(submittedData.status).toBe('active')
    })

    it('should submit with all fields populated', async () => {
      // Arrange
      mockOnSubmit.mockResolvedValue(undefined)
      render(<AccountForm onSubmit={mockOnSubmit} />)

      const codeInput = screen.getByLabelText(/código/i)
      const nameInput = screen.getByLabelText(/nombre de la cuenta/i)
      const accountTypeSelects = screen.getAllByRole('combobox')
      const accountTypeSelect = accountTypeSelects[0] // First select is account type
      const levelInput = screen.getByLabelText(/nivel/i)
      const currencySelect = accountTypeSelects[1] // Second select is currency
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

      // Act
      fireEvent.change(codeInput, { target: { value: '2000' } })
      fireEvent.change(nameInput, { target: { value: 'Proveedores' } })
      fireEvent.change(accountTypeSelect, { target: { value: 'liability' } })
      fireEvent.change(levelInput, { target: { value: '2' } })
      fireEvent.change(currencySelect, { target: { value: 'USD' } })
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
      })

      const submittedData = mockOnSubmit.mock.calls[0][0] as AccountFormData
      expect(submittedData.code).toBe('2000')
      expect(submittedData.name).toBe('Proveedores')
      expect(submittedData.accountType).toBe('liability')
      expect(submittedData.level).toBe(2)
      expect(submittedData.currency).toBe('USD')
    })

    it('should update existing account when editing', async () => {
      // Arrange
      const mockAccount = createMockAccount({
        id: '1',
        code: '1000',
        name: 'Caja General',
        level: 1,
      })
      mockOnSubmit.mockResolvedValue(undefined)
      render(<AccountForm account={mockAccount} onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/nombre de la cuenta/i)
      const submitButton = screen.getByRole('button', { name: /actualizar cuenta/i })

      // Act
      fireEvent.change(nameInput, { target: { value: 'Caja General Updated' } })
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
      })

      const submittedData = mockOnSubmit.mock.calls[0][0] as AccountFormData
      expect(submittedData.code).toBe('1000')
      expect(submittedData.name).toBe('Caja General Updated')
    })
  })

  describe('Edge Cases', () => {
    it('should handle form submission error', async () => {
      // Arrange
      const errorMessage = 'Failed to save account'
      mockOnSubmit.mockRejectedValue(new Error(errorMessage))
      render(<AccountForm onSubmit={mockOnSubmit} />)

      const codeInput = screen.getByLabelText(/código/i)
      const nameInput = screen.getByLabelText(/nombre/i)
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

      // Act
      fireEvent.change(codeInput, { target: { value: '1000' } })
      fireEvent.change(nameInput, { target: { value: 'Test' } })
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle rapid form updates', async () => {
      // Arrange
      render(<AccountForm onSubmit={mockOnSubmit} />)
      const codeInput = screen.getByLabelText(/código/i) as HTMLInputElement

      // Act - rapid typing
      fireEvent.change(codeInput, { target: { value: '1' } })
      fireEvent.change(codeInput, { target: { value: '10' } })
      fireEvent.change(codeInput, { target: { value: '100' } })
      fireEvent.change(codeInput, { target: { value: '1000' } })

      // Assert
      expect(codeInput.value).toBe('1000')
    })

    it('should reset to initial values when account prop changes', async () => {
      // Arrange
      const initialAccount = createMockAccount({ code: '1000', name: 'Initial' })
      const { rerender } = render(
        <AccountForm account={initialAccount} onSubmit={mockOnSubmit} />
      )

      const nameInput = screen.getByLabelText(/nombre de la cuenta/i) as HTMLInputElement
      expect(nameInput.value).toBe('Initial')

      // Act - update account prop
      const updatedAccount = createMockAccount({ code: '2000', name: 'Updated' })
      rerender(<AccountForm account={updatedAccount} onSubmit={mockOnSubmit} />)

      // Assert
      await waitFor(() => {
        expect(nameInput.value).toBe('Updated')
      })
    })
  })
})
