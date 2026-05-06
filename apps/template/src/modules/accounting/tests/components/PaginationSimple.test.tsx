/**
 * PAGINATION SIMPLE TESTS
 * Unit tests for PaginationSimple component
 * Testing rendering, interactions, and page calculations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PaginationSimple } from '../../components/PaginationSimple'

describe('PaginationSimple', () => {
  let mockOnPageChange: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnPageChange = vi.fn()
    vi.clearAllMocks()
  })

  // ===== RENDERING TESTS =====

  describe('Rendering', () => {
    it('should not render when totalPages is 1', () => {
      // Arrange & Act
      const { container } = render(
        <PaginationSimple
          currentPage={1}
          totalPages={1}
          onPageChange={mockOnPageChange}
        />
      )

      // Assert
      expect(container.firstChild).toBeNull()
    })

    it('should not render when totalPages is 0', () => {
      // Arrange & Act
      const { container } = render(
        <PaginationSimple
          currentPage={1}
          totalPages={0}
          onPageChange={mockOnPageChange}
        />
      )

      // Assert
      expect(container.firstChild).toBeNull()
    })

    it('should render pagination when totalPages > 1', () => {
      // Arrange & Act
      render(
        <PaginationSimple
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      )

      // Assert
      expect(screen.getByLabelText(/página anterior/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página siguiente/i)).toBeInTheDocument()
    })

    it('should render page info text', () => {
      // Arrange & Act
      render(
        <PaginationSimple
          currentPage={2}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      )

      // Assert
      expect(screen.getByText(/página 2 de 5/i)).toBeInTheDocument()
    })

    it('should render all page numbers when totalPages <= maxVisiblePages', () => {
      // Arrange & Act
      render(
        <PaginationSimple
          currentPage={3}
          totalPages={5}
          onPageChange={mockOnPageChange}
          maxVisiblePages={5}
        />
      )

      // Assert
      expect(screen.getByLabelText(/página 1/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página 2/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página 3/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página 4/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página 5/i)).toBeInTheDocument()
    })

    it('should show ellipsis when there are many pages', () => {
      // Arrange & Act
      render(
        <PaginationSimple
          currentPage={5}
          totalPages={10}
          onPageChange={mockOnPageChange}
          maxVisiblePages={5}
        />
      )

      // Assert
      const ellipsis = screen.getAllByText('...')
      expect(ellipsis.length).toBeGreaterThan(0)
    })

    it('should mark current page as active', () => {
      // Arrange & Act
      render(
        <PaginationSimple
          currentPage={3}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      )

      // Assert
      const currentPageButton = screen.getByLabelText(/página 3/i)
      expect(currentPageButton).toHaveAttribute('aria-current', 'page')
    })
  })

  // ===== BUTTON STATE TESTS =====

  describe('Button States', () => {
    it('should disable previous button on first page', () => {
      // Arrange & Act
      render(
        <PaginationSimple
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      )

      // Assert
      const prevButton = screen.getByLabelText(/página anterior/i)
      expect(prevButton).toBeDisabled()
    })

    it('should enable previous button when not on first page', () => {
      // Arrange & Act
      render(
        <PaginationSimple
          currentPage={2}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      )

      // Assert
      const prevButton = screen.getByLabelText(/página anterior/i)
      expect(prevButton).not.toBeDisabled()
    })

    it('should disable next button on last page', () => {
      // Arrange & Act
      render(
        <PaginationSimple
          currentPage={5}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      )

      // Assert
      const nextButton = screen.getByLabelText(/página siguiente/i)
      expect(nextButton).toBeDisabled()
    })

    it('should enable next button when not on last page', () => {
      // Arrange & Act
      render(
        <PaginationSimple
          currentPage={3}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      )

      // Assert
      const nextButton = screen.getByLabelText(/página siguiente/i)
      expect(nextButton).not.toBeDisabled()
    })
  })

  // ===== INTERACTION TESTS =====

  describe('Interactions', () => {
    it('should call onPageChange with previous page when previous button clicked', () => {
      // Arrange
      render(
        <PaginationSimple
          currentPage={3}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      )
      const prevButton = screen.getByLabelText(/página anterior/i)

      // Act
      fireEvent.click(prevButton)

      // Assert
      expect(mockOnPageChange).toHaveBeenCalledWith(2)
    })

    it('should call onPageChange with next page when next button clicked', () => {
      // Arrange
      render(
        <PaginationSimple
          currentPage={3}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      )
      const nextButton = screen.getByLabelText(/página siguiente/i)

      // Act
      fireEvent.click(nextButton)

      // Assert
      expect(mockOnPageChange).toHaveBeenCalledWith(4)
    })

    it('should call onPageChange with specific page when page number clicked', () => {
      // Arrange
      render(
        <PaginationSimple
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      )
      const page3Button = screen.getByLabelText(/página 3/i)

      // Act
      fireEvent.click(page3Button)

      // Assert
      expect(mockOnPageChange).toHaveBeenCalledWith(3)
    })

    it('should not call onPageChange when disabled previous button clicked', () => {
      // Arrange
      render(
        <PaginationSimple
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      )
      const prevButton = screen.getByLabelText(/página anterior/i)

      // Act
      fireEvent.click(prevButton)

      // Assert
      expect(mockOnPageChange).not.toHaveBeenCalled()
    })

    it('should not call onPageChange when disabled next button clicked', () => {
      // Arrange
      render(
        <PaginationSimple
          currentPage={5}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      )
      const nextButton = screen.getByLabelText(/página siguiente/i)

      // Act
      fireEvent.click(nextButton)

      // Assert
      expect(mockOnPageChange).not.toHaveBeenCalled()
    })
  })

  // ===== VISIBLE PAGES LOGIC TESTS =====

  describe('Visible Pages Logic', () => {
    it('should show first page button when not in visible range', () => {
      // Arrange & Act
      render(
        <PaginationSimple
          currentPage={8}
          totalPages={10}
          onPageChange={mockOnPageChange}
          maxVisiblePages={5}
        />
      )

      // Assert
      const page1Buttons = screen.getAllByRole('button', { name: '1' })
      expect(page1Buttons.length).toBeGreaterThan(0)
    })

    it('should show last page button when not in visible range', () => {
      // Arrange & Act
      render(
        <PaginationSimple
          currentPage={2}
          totalPages={10}
          onPageChange={mockOnPageChange}
          maxVisiblePages={5}
        />
      )

      // Assert
      const page10Buttons = screen.getAllByRole('button', { name: '10' })
      expect(page10Buttons.length).toBeGreaterThan(0)
    })

    it('should center visible pages around current page', () => {
      // Arrange & Act
      render(
        <PaginationSimple
          currentPage={5}
          totalPages={10}
          onPageChange={mockOnPageChange}
          maxVisiblePages={5}
        />
      )

      // Assert - Should show pages 3, 4, 5, 6, 7 (centered around 5)
      expect(screen.getByLabelText(/página 3/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página 4/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página 5/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página 6/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página 7/i)).toBeInTheDocument()
    })

    it('should adjust visible pages when near the start', () => {
      // Arrange & Act
      render(
        <PaginationSimple
          currentPage={2}
          totalPages={10}
          onPageChange={mockOnPageChange}
          maxVisiblePages={5}
        />
      )

      // Assert - Should show pages 1, 2, 3, 4, 5 (adjusted to start)
      expect(screen.getByLabelText(/página 1/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página 2/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página 3/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página 4/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página 5/i)).toBeInTheDocument()
    })

    it('should adjust visible pages when near the end', () => {
      // Arrange & Act
      render(
        <PaginationSimple
          currentPage={9}
          totalPages={10}
          onPageChange={mockOnPageChange}
          maxVisiblePages={5}
        />
      )

      // Assert - Should show pages 6, 7, 8, 9, 10 (adjusted to end)
      expect(screen.getByLabelText(/página 6/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página 7/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página 8/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página 9/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página 10/i)).toBeInTheDocument()
    })

    it('should handle custom maxVisiblePages', () => {
      // Arrange & Act
      render(
        <PaginationSimple
          currentPage={5}
          totalPages={10}
          onPageChange={mockOnPageChange}
          maxVisiblePages={3}
        />
      )

      // Assert - Should show only 3 pages (4, 5, 6 centered around 5)
      expect(screen.getByLabelText(/página 4/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página 5/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página 6/i)).toBeInTheDocument()
    })
  })

  // ===== EDGE CASES =====

  describe('Edge Cases', () => {
    it('should handle totalPages of 2', () => {
      // Arrange & Act
      render(
        <PaginationSimple
          currentPage={1}
          totalPages={2}
          onPageChange={mockOnPageChange}
        />
      )

      // Assert
      expect(screen.getByLabelText(/página 1/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/página 2/i)).toBeInTheDocument()
      expect(screen.getByText(/página 1 de 2/i)).toBeInTheDocument()
    })

    it('should handle very large totalPages', () => {
      // Arrange & Act
      render(
        <PaginationSimple
          currentPage={50}
          totalPages={100}
          onPageChange={mockOnPageChange}
          maxVisiblePages={5}
        />
      )

      // Assert
      expect(screen.getByText(/página 50 de 100/i)).toBeInTheDocument()
      // Should show first page button
      const page1Buttons = screen.getAllByRole('button', { name: '1' })
      expect(page1Buttons.length).toBeGreaterThan(0)
      // Should show last page button
      const page100Buttons = screen.getAllByRole('button', { name: '100' })
      expect(page100Buttons.length).toBeGreaterThan(0)
    })

    it('should call onPageChange with first page when first page button clicked', () => {
      // Arrange
      render(
        <PaginationSimple
          currentPage={8}
          totalPages={10}
          onPageChange={mockOnPageChange}
          maxVisiblePages={5}
        />
      )
      const page1Button = screen.getAllByRole('button', { name: '1' })[0]

      // Act
      fireEvent.click(page1Button)

      // Assert
      expect(mockOnPageChange).toHaveBeenCalledWith(1)
    })

    it('should call onPageChange with last page when last page button clicked', () => {
      // Arrange
      render(
        <PaginationSimple
          currentPage={2}
          totalPages={10}
          onPageChange={mockOnPageChange}
          maxVisiblePages={5}
        />
      )
      const page10Button = screen.getAllByRole('button', { name: '10' })[0]

      // Act
      fireEvent.click(page10Button)

      // Assert
      expect(mockOnPageChange).toHaveBeenCalledWith(10)
    })
  })
})
