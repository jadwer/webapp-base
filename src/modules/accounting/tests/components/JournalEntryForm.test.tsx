/**
 * JOURNAL ENTRY FORM TESTS
 * Integration tests for JournalEntryForm component
 * Testing form rendering, validation, interactions, and submissions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { JournalEntryForm } from '../../components/JournalEntryForm'
import { createMockAccount, createMockJournalEntry } from '../utils/test-utils'
import type { JournalEntryWithLines } from '../../types'

// Mock the usePostableAccounts hook
vi.mock('../../hooks', () => ({
  usePostableAccounts: vi.fn(() => ({
    postableAccounts: [
      createMockAccount({ id: '1', code: '1000', name: 'Caja General' }),
      createMockAccount({ id: '2', code: '1100', name: 'Bancos' }),
      createMockAccount({ id: '3', code: '4000', name: 'Ventas' })
    ],
    isLoading: false
  }))
}))

describe('JournalEntryForm', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>
  let mockOnCancel: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnSubmit = vi.fn().mockResolvedValue(undefined)
    mockOnCancel = vi.fn()
    vi.clearAllMocks()
  })

  // ===== RENDERING TESTS =====

  describe('Rendering', () => {
    it('should render all form fields', () => {
      // Act
      render(<JournalEntryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      // Assert
      expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/referencia/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /crear póliza/i })).toBeInTheDocument()
    })

    it('should render initial 2 journal lines', () => {
      // Act
      render(<JournalEntryForm onSubmit={mockOnSubmit} />)

      // Assert
      const accountSelects = screen.getAllByRole('combobox')
      expect(accountSelects.length).toBeGreaterThanOrEqual(2) // At least 2 account selects
    })

    it('should render add line button', () => {
      // Act
      render(<JournalEntryForm onSubmit={mockOnSubmit} />)

      // Assert
      expect(screen.getByRole('button', { name: /agregar línea/i })).toBeInTheDocument()
    })

    it('should render totals row', () => {
      // Act
      render(<JournalEntryForm onSubmit={mockOnSubmit} />)

      // Assert
      expect(screen.getByText(/totales/i)).toBeInTheDocument()
    })

    it('should render cancel button when onCancel provided', () => {
      // Act
      render(<JournalEntryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      // Assert
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
    })

    it('should not render cancel button when onCancel not provided', () => {
      // Act
      render(<JournalEntryForm onSubmit={mockOnSubmit} />)

      // Assert
      expect(screen.queryByRole('button', { name: /cancelar/i })).not.toBeInTheDocument()
    })
  })

  // ===== FORM VALIDATION TESTS =====

  describe('Form Validation', () => {
    it('should require date field', async () => {
      // Arrange
      render(<JournalEntryForm onSubmit={mockOnSubmit} />)
      const dateInput = screen.getByLabelText(/fecha/i) as HTMLInputElement
      const submitButton = screen.getByRole('button', { name: /crear póliza/i })

      // Act
      fireEvent.change(dateInput, { target: { value: '' } })
      fireEvent.blur(dateInput)
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/la fecha es requerida/i)).toBeInTheDocument()
      })
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should require description field', async () => {
      // Arrange
      render(<JournalEntryForm onSubmit={mockOnSubmit} />)
      const descriptionInput = screen.getByLabelText(/descripción/i)
      const submitButton = screen.getByRole('button', { name: /crear póliza/i })

      // Act
      fireEvent.change(descriptionInput, { target: { value: '' } })
      fireEvent.blur(descriptionInput)
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/la descripción es requerida/i)).toBeInTheDocument()
      })
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should require at least 2 lines with accounts', async () => {
      // Arrange
      render(<JournalEntryForm onSubmit={mockOnSubmit} />)
      const descriptionInput = screen.getByLabelText(/descripción/i)
      const submitButton = screen.getByRole('button', { name: /crear póliza/i })

      // Act - Fill only description
      fireEvent.change(descriptionInput, { target: { value: 'Test Entry' } })
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/se requieren al menos 2 líneas/i)).toBeInTheDocument()
      })
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should disable submit when debits do not equal credits', () => {
      // Arrange
      render(<JournalEntryForm onSubmit={mockOnSubmit} />)
      const descriptionInput = screen.getByLabelText(/descripción/i)
      const accountSelects = screen.getAllByRole('combobox')
      const allInputs = screen.getAllByRole('spinbutton')
      const submitButton = screen.getByRole('button', { name: /crear póliza/i })

      // Act - Create unbalanced entry (debit 100, credit 50)
      fireEvent.change(descriptionInput, { target: { value: 'Test Entry' } })
      fireEvent.change(accountSelects[0], { target: { value: '1' } })
      fireEvent.change(accountSelects[1], { target: { value: '2' } })
      fireEvent.change(allInputs[0], { target: { value: '100' } }) // Debit
      fireEvent.change(allInputs[3], { target: { value: '50' } }) // Credit (unbalanced)

      // Assert - Button should be disabled due to imbalance
      expect(submitButton).toBeDisabled()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should prevent submission when line has both debit and credit', async () => {
      // Arrange
      render(<JournalEntryForm onSubmit={mockOnSubmit} />)
      const dateInput = screen.getByLabelText(/fecha/i)
      const descriptionInput = screen.getByLabelText(/descripción/i)
      const accountSelects = screen.getAllByRole('combobox')
      const allInputs = screen.getAllByRole('spinbutton')

      // Act - Create entry with line having both debit and credit (but balanced overall)
      fireEvent.change(dateInput, { target: { value: '2025-01-15' } })
      fireEvent.change(descriptionInput, { target: { value: 'Test Entry' } })
      fireEvent.change(accountSelects[0], { target: { value: '1' } })
      fireEvent.change(accountSelects[1], { target: { value: '2' } })
      fireEvent.change(allInputs[0], { target: { value: '100' } }) // Line 1 debit
      fireEvent.change(allInputs[1], { target: { value: '50' } })  // Line 1 credit (INVALID - both set)
      fireEvent.change(allInputs[2], { target: { value: '0' } })   // Line 2 debit
      fireEvent.change(allInputs[3], { target: { value: '50' } })  // Line 2 credit (to balance)

      // Now form is balanced so submit button is enabled
      const submitButton = screen.getByRole('button', { name: /crear póliza/i })
      expect(submitButton).not.toBeDisabled()

      // Try to submit
      fireEvent.click(submitButton)

      // Assert - Validation should prevent submission (errors stored internally)
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled()
      })

      // Check that inputs have error styling (is-invalid class)
      await waitFor(() => {
        const invalidInputs = allInputs.filter((input: HTMLElement) =>
          input.className.includes('is-invalid')
        )
        expect(invalidInputs.length).toBeGreaterThan(0)
      })
    })
  })

  // ===== INTERACTION TESTS =====

  describe('Interactions', () => {
    it('should add new line when add button clicked', () => {
      // Arrange
      render(<JournalEntryForm onSubmit={mockOnSubmit} />)
      const addButton = screen.getByRole('button', { name: /agregar línea/i })
      const initialSelects = screen.getAllByRole('combobox')

      // Act
      fireEvent.click(addButton)

      // Assert
      const afterSelects = screen.getAllByRole('combobox')
      expect(afterSelects.length).toBeGreaterThan(initialSelects.length)
    })

    it('should remove line when remove button clicked', () => {
      // Arrange
      render(<JournalEntryForm onSubmit={mockOnSubmit} />)
      const addButton = screen.getByRole('button', { name: /agregar línea/i })

      // Act - Add line first (to have 3 lines), then remove
      fireEvent.click(addButton)
      const removeButtons = screen.getAllByRole('button').filter(btn =>
        btn.querySelector('.bi-trash')
      )
      const selectsBefore = screen.getAllByRole('combobox')

      fireEvent.click(removeButtons[0])

      // Assert
      const selectsAfter = screen.getAllByRole('combobox')
      expect(selectsAfter.length).toBeLessThan(selectsBefore.length)
    })

    it('should not show remove button when only 2 lines exist', () => {
      // Arrange
      render(<JournalEntryForm onSubmit={mockOnSubmit} />)

      // Assert - Initially only 2 lines, no remove buttons
      const removeButtons = screen.queryAllByRole('button').filter(btn =>
        btn.querySelector('.bi-trash')
      )
      expect(removeButtons.length).toBe(0)
    })

    it('should update totals when line amounts change', () => {
      // Arrange
      render(<JournalEntryForm onSubmit={mockOnSubmit} />)
      const debitInputs = screen.getAllByRole('spinbutton')

      // Act
      fireEvent.change(debitInputs[0], { target: { value: '500' } })

      // Assert
      expect(screen.getByText(/\$500\.00/)).toBeInTheDocument()
    })

    it('should enable submit button when balance is corrected', () => {
      // Arrange
      render(<JournalEntryForm onSubmit={mockOnSubmit} />)
      const descriptionInput = screen.getByLabelText(/descripción/i)
      const accountSelects = screen.getAllByRole('combobox')
      const allInputs = screen.getAllByRole('spinbutton')
      const submitButton = screen.getByRole('button', { name: /crear póliza/i })

      // Act - Create unbalanced entry
      fireEvent.change(descriptionInput, { target: { value: 'Test' } })
      fireEvent.change(accountSelects[0], { target: { value: '1' } })
      fireEvent.change(accountSelects[1], { target: { value: '2' } })
      fireEvent.change(allInputs[0], { target: { value: '100' } }) // Debit line 1
      fireEvent.change(allInputs[3], { target: { value: '50' } }) // Credit line 2 (unbalanced)

      // Assert - Button should be disabled
      expect(submitButton).toBeDisabled()

      // Fix balance
      fireEvent.change(allInputs[3], { target: { value: '100' } })

      // Assert - Button should be enabled now
      expect(submitButton).not.toBeDisabled()
    })

    it('should call onCancel when cancel button clicked', () => {
      // Arrange
      render(<JournalEntryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })

      // Act
      fireEvent.click(cancelButton)

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })

  // ===== FORM SUBMISSION TESTS =====

  describe('Form Submission', () => {
    it('should submit valid balanced journal entry', async () => {
      // Arrange
      mockOnSubmit.mockResolvedValue(undefined)
      render(<JournalEntryForm onSubmit={mockOnSubmit} />)

      const dateInput = screen.getByLabelText(/fecha/i)
      const descriptionInput = screen.getByLabelText(/descripción/i)
      const accountSelects = screen.getAllByRole('combobox')
      const allInputs = screen.getAllByRole('spinbutton')
      const submitButton = screen.getByRole('button', { name: /crear póliza/i })

      // Act - Create balanced entry
      fireEvent.change(dateInput, { target: { value: '2025-01-15' } })
      fireEvent.change(descriptionInput, { target: { value: 'Test Journal Entry' } })
      fireEvent.change(accountSelects[0], { target: { value: '1' } })
      fireEvent.change(accountSelects[1], { target: { value: '2' } })
      fireEvent.change(allInputs[0], { target: { value: '1000' } }) // Debit
      fireEvent.change(allInputs[3], { target: { value: '1000' } }) // Credit
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
      })

      const submittedData = mockOnSubmit.mock.calls[0][0] as JournalEntryWithLines
      expect(submittedData.date).toBe('2025-01-15')
      expect(submittedData.description).toBe('Test Journal Entry')
      expect(submittedData.lines).toHaveLength(2)
    })

    it('should disable submit button when entry is unbalanced', () => {
      // Arrange
      render(<JournalEntryForm onSubmit={mockOnSubmit} />)
      const accountSelects = screen.getAllByRole('combobox')
      const allInputs = screen.getAllByRole('spinbutton')
      const submitButton = screen.getByRole('button', { name: /crear póliza/i })

      // Act - Create unbalanced entry
      fireEvent.change(accountSelects[0], { target: { value: '1' } })
      fireEvent.change(allInputs[0], { target: { value: '100' } })

      // Assert
      expect(submitButton).toBeDisabled()
    })

    it('should disable all fields when isLoading is true', () => {
      // Arrange
      render(<JournalEntryForm onSubmit={mockOnSubmit} isLoading={true} />)

      // Assert
      expect(screen.getByLabelText(/fecha/i)).toBeDisabled()
      expect(screen.getByLabelText(/descripción/i)).toBeDisabled()
      expect(screen.getByRole('button', { name: /crear póliza/i })).toBeDisabled()
    })

    it('should filter out empty lines before submission', async () => {
      // Arrange
      mockOnSubmit.mockResolvedValue(undefined)
      render(<JournalEntryForm onSubmit={mockOnSubmit} />)

      const dateInput = screen.getByLabelText(/fecha/i)
      const descriptionInput = screen.getByLabelText(/descripción/i)
      const accountSelects = screen.getAllByRole('combobox')
      const allInputs = screen.getAllByRole('spinbutton')

      // Add a third line
      const addButton = screen.getByRole('button', { name: /agregar línea/i })
      fireEvent.click(addButton)

      const accountSelectsAfter = screen.getAllByRole('combobox')
      const submitButton = screen.getByRole('button', { name: /crear póliza/i })

      // Act - Fill only first 2 lines, leave third empty
      fireEvent.change(dateInput, { target: { value: '2025-01-15' } })
      fireEvent.change(descriptionInput, { target: { value: 'Test Entry' } })
      fireEvent.change(accountSelectsAfter[0], { target: { value: '1' } })
      fireEvent.change(accountSelectsAfter[1], { target: { value: '2' } })
      // Third line remains empty
      fireEvent.change(allInputs[0], { target: { value: '500' } })
      fireEvent.change(allInputs[3], { target: { value: '500' } })
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
      })

      const submittedData = mockOnSubmit.mock.calls[0][0] as JournalEntryWithLines
      expect(submittedData.lines).toHaveLength(2) // Only 2 lines, third filtered out
    })
  })

  // ===== EDIT MODE TESTS =====

  describe('Edit Mode', () => {
    it('should pre-populate form fields when journalEntry provided', () => {
      // Arrange
      const mockEntry = createMockJournalEntry({
        date: '2025-01-10',
        description: 'Existing Entry',
        reference: 'REF-001',
        currency: 'USD',
        exchangeRate: '1.05'
      })

      // Act
      render(<JournalEntryForm journalEntry={mockEntry} onSubmit={mockOnSubmit} />)

      // Assert
      const dateInput = screen.getByLabelText(/fecha/i) as HTMLInputElement
      const descriptionInput = screen.getByLabelText(/descripción/i) as HTMLInputElement
      const referenceInput = screen.getByLabelText(/referencia/i) as HTMLInputElement

      expect(dateInput.value).toBe('2025-01-10')
      expect(descriptionInput.value).toBe('Existing Entry')
      expect(referenceInput.value).toBe('REF-001')
    })

    it('should show update button text in edit mode', () => {
      // Arrange
      const mockEntry = createMockJournalEntry()

      // Act
      render(<JournalEntryForm journalEntry={mockEntry} onSubmit={mockOnSubmit} />)

      // Assert
      expect(screen.getByRole('button', { name: /actualizar póliza/i })).toBeInTheDocument()
    })

    it('should show create button text in create mode', () => {
      // Act
      render(<JournalEntryForm onSubmit={mockOnSubmit} />)

      // Assert
      expect(screen.getByRole('button', { name: /crear póliza/i })).toBeInTheDocument()
    })
  })

  // ===== ERROR HANDLING TESTS =====

  describe('Error Handling', () => {
    it('should handle submission errors gracefully', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockOnSubmit.mockRejectedValue(new Error('Submission failed'))
      render(<JournalEntryForm onSubmit={mockOnSubmit} />)

      const dateInput = screen.getByLabelText(/fecha/i)
      const descriptionInput = screen.getByLabelText(/descripción/i)
      const accountSelects = screen.getAllByRole('combobox')
      const allInputs = screen.getAllByRole('spinbutton')
      const submitButton = screen.getByRole('button', { name: /crear póliza/i })

      // Act
      fireEvent.change(dateInput, { target: { value: '2025-01-15' } })
      fireEvent.change(descriptionInput, { target: { value: 'Test' } })
      fireEvent.change(accountSelects[0], { target: { value: '1' } })
      fireEvent.change(accountSelects[1], { target: { value: '2' } })
      fireEvent.change(allInputs[0], { target: { value: '100' } })
      fireEvent.change(allInputs[3], { target: { value: '100' } })
      fireEvent.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled()
      })

      consoleErrorSpy.mockRestore()
    })
  })
})
