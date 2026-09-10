/**
 * FILTER BAR TESTS
 * Unit tests for FilterBar component
 * Testing search, status filtering, and clear functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterBar } from '../../components/FilterBar'

describe('FilterBar', () => {
  let mockOnSearchChange: ReturnType<typeof vi.fn>
  let mockOnStatusFilterChange: ReturnType<typeof vi.fn>

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' }
  ]

  beforeEach(() => {
    mockOnSearchChange = vi.fn()
    mockOnStatusFilterChange = vi.fn()
    vi.clearAllMocks()
  })

  // ===== RENDERING TESTS =====

  describe('Rendering', () => {
    it('should render search input', () => {
      // Arrange & Act
      render(
        <FilterBar
          searchTerm=""
          onSearchChange={mockOnSearchChange}
        />
      )

      // Assert
      expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument()
    })

    it('should render with custom placeholder', () => {
      // Arrange & Act
      render(
        <FilterBar
          searchTerm=""
          onSearchChange={mockOnSearchChange}
          placeholder="Buscar cuentas..."
        />
      )

      // Assert
      expect(screen.getByPlaceholderText(/buscar cuentas/i)).toBeInTheDocument()
    })

    it('should render search icon', () => {
      // Arrange & Act
      const { container } = render(
        <FilterBar
          searchTerm=""
          onSearchChange={mockOnSearchChange}
        />
      )

      // Assert
      const searchIcon = container.querySelector('.bi-search')
      expect(searchIcon).toBeInTheDocument()
    })

    it('should not render status filter when statusOptions is empty', () => {
      // Arrange & Act
      render(
        <FilterBar
          searchTerm=""
          onSearchChange={mockOnSearchChange}
          onStatusFilterChange={mockOnStatusFilterChange}
        />
      )

      // Assert
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    })

    it('should render status filter when statusOptions provided', () => {
      // Arrange & Act
      render(
        <FilterBar
          searchTerm=""
          onSearchChange={mockOnSearchChange}
          onStatusFilterChange={mockOnStatusFilterChange}
          statusOptions={statusOptions}
        />
      )

      // Assert
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should render all status options', () => {
      // Arrange & Act
      render(
        <FilterBar
          searchTerm=""
          onSearchChange={mockOnSearchChange}
          onStatusFilterChange={mockOnStatusFilterChange}
          statusOptions={statusOptions}
        />
      )

      // Assert
      expect(screen.getByRole('option', { name: 'Todos' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Activo' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Inactivo' })).toBeInTheDocument()
    })

    it('should not render clear search button when searchTerm is empty', () => {
      // Arrange & Act
      render(
        <FilterBar
          searchTerm=""
          onSearchChange={mockOnSearchChange}
        />
      )

      // Assert
      expect(screen.queryByTitle(/limpiar búsqueda/i)).not.toBeInTheDocument()
    })

    it('should render clear search button when searchTerm has value', () => {
      // Arrange & Act
      render(
        <FilterBar
          searchTerm="test"
          onSearchChange={mockOnSearchChange}
        />
      )

      // Assert
      expect(screen.getByTitle(/limpiar búsqueda/i)).toBeInTheDocument()
    })

    it('should not render clear filters button when no filters active', () => {
      // Arrange & Act
      render(
        <FilterBar
          searchTerm=""
          onSearchChange={mockOnSearchChange}
          statusFilter=""
          onStatusFilterChange={mockOnStatusFilterChange}
          statusOptions={statusOptions}
        />
      )

      // Assert
      expect(screen.queryByText(/limpiar filtros/i)).not.toBeInTheDocument()
    })

    it('should render clear filters button when search term active', () => {
      // Arrange & Act
      render(
        <FilterBar
          searchTerm="test"
          onSearchChange={mockOnSearchChange}
        />
      )

      // Assert
      expect(screen.getByText(/limpiar filtros/i)).toBeInTheDocument()
    })

    it('should render clear filters button when status filter active', () => {
      // Arrange & Act
      render(
        <FilterBar
          searchTerm=""
          onSearchChange={mockOnSearchChange}
          statusFilter="active"
          onStatusFilterChange={mockOnStatusFilterChange}
          statusOptions={statusOptions}
        />
      )

      // Assert
      expect(screen.getByText(/limpiar filtros/i)).toBeInTheDocument()
    })
  })

  // ===== SEARCH INTERACTION TESTS =====

  describe('Search Interactions', () => {
    it('should call onSearchChange when typing in search input', () => {
      // Arrange
      render(
        <FilterBar
          searchTerm=""
          onSearchChange={mockOnSearchChange}
        />
      )
      const searchInput = screen.getByPlaceholderText(/buscar/i)

      // Act
      fireEvent.change(searchInput, { target: { value: 'test search' } })

      // Assert
      expect(mockOnSearchChange).toHaveBeenCalledWith('test search')
    })

    it('should display current search term in input', () => {
      // Arrange & Act
      render(
        <FilterBar
          searchTerm="current search"
          onSearchChange={mockOnSearchChange}
        />
      )
      const searchInput = screen.getByPlaceholderText(/buscar/i) as HTMLInputElement

      // Assert
      expect(searchInput.value).toBe('current search')
    })

    it('should call onSearchChange with empty string when clear search button clicked', () => {
      // Arrange
      render(
        <FilterBar
          searchTerm="test"
          onSearchChange={mockOnSearchChange}
        />
      )
      const clearButton = screen.getByTitle(/limpiar búsqueda/i)

      // Act
      fireEvent.click(clearButton)

      // Assert
      expect(mockOnSearchChange).toHaveBeenCalledWith('')
    })
  })

  // ===== STATUS FILTER INTERACTION TESTS =====

  describe('Status Filter Interactions', () => {
    it('should call onStatusFilterChange when status select changes', () => {
      // Arrange
      render(
        <FilterBar
          searchTerm=""
          onSearchChange={mockOnSearchChange}
          onStatusFilterChange={mockOnStatusFilterChange}
          statusOptions={statusOptions}
          statusFilter=""
        />
      )
      const statusSelect = screen.getByRole('combobox')

      // Act
      fireEvent.change(statusSelect, { target: { value: 'active' } })

      // Assert
      expect(mockOnStatusFilterChange).toHaveBeenCalledWith('active')
    })

    it('should display current status filter value', () => {
      // Arrange & Act
      render(
        <FilterBar
          searchTerm=""
          onSearchChange={mockOnSearchChange}
          onStatusFilterChange={mockOnStatusFilterChange}
          statusOptions={statusOptions}
          statusFilter="active"
        />
      )
      const statusSelect = screen.getByRole('combobox') as HTMLSelectElement

      // Assert
      expect(statusSelect.value).toBe('active')
    })
  })

  // ===== CLEAR ALL FILTERS TESTS =====

  describe('Clear All Filters', () => {
    it('should clear search term when clear filters button clicked', () => {
      // Arrange
      render(
        <FilterBar
          searchTerm="test"
          onSearchChange={mockOnSearchChange}
        />
      )
      const clearButton = screen.getByText(/limpiar filtros/i)

      // Act
      fireEvent.click(clearButton)

      // Assert
      expect(mockOnSearchChange).toHaveBeenCalledWith('')
    })

    it('should clear both search and status filter when clear filters button clicked', () => {
      // Arrange
      render(
        <FilterBar
          searchTerm="test"
          onSearchChange={mockOnSearchChange}
          statusFilter="active"
          onStatusFilterChange={mockOnStatusFilterChange}
          statusOptions={statusOptions}
        />
      )
      const clearButton = screen.getByText(/limpiar filtros/i)

      // Act
      fireEvent.click(clearButton)

      // Assert
      expect(mockOnSearchChange).toHaveBeenCalledWith('')
      expect(mockOnStatusFilterChange).toHaveBeenCalledWith('')
    })

    it('should only clear search when status filter callback not provided', () => {
      // Arrange
      render(
        <FilterBar
          searchTerm="test"
          onSearchChange={mockOnSearchChange}
        />
      )
      const clearButton = screen.getByText(/limpiar filtros/i)

      // Act
      fireEvent.click(clearButton)

      // Assert
      expect(mockOnSearchChange).toHaveBeenCalledWith('')
      expect(mockOnStatusFilterChange).not.toHaveBeenCalled()
    })
  })

  // ===== EDGE CASES =====

  describe('Edge Cases', () => {
    it('should handle empty string in status options', () => {
      // Arrange & Act
      render(
        <FilterBar
          searchTerm=""
          onSearchChange={mockOnSearchChange}
          onStatusFilterChange={mockOnStatusFilterChange}
          statusOptions={[{ value: '', label: 'All' }]}
        />
      )

      // Assert
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /all/i })).toBeInTheDocument()
    })

    it('should handle multiple rapid search changes', () => {
      // Arrange
      render(
        <FilterBar
          searchTerm=""
          onSearchChange={mockOnSearchChange}
        />
      )
      const searchInput = screen.getByPlaceholderText(/buscar/i)

      // Act
      fireEvent.change(searchInput, { target: { value: 'a' } })
      fireEvent.change(searchInput, { target: { value: 'ab' } })
      fireEvent.change(searchInput, { target: { value: 'abc' } })

      // Assert
      expect(mockOnSearchChange).toHaveBeenCalledTimes(3)
      expect(mockOnSearchChange).toHaveBeenLastCalledWith('abc')
    })

    it('should not crash when statusOptions is undefined', () => {
      // Arrange & Act
      const { container } = render(
        <FilterBar
          searchTerm=""
          onSearchChange={mockOnSearchChange}
          onStatusFilterChange={mockOnStatusFilterChange}
        />
      )

      // Assert - Should not render status filter
      expect(container.querySelector('.form-select')).not.toBeInTheDocument()
    })
  })
})
