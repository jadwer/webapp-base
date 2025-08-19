/**
 * ProductBatchesAdminPageReal Component Tests
 * 
 * Tests for the admin page component matching actual implementation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductBatchesAdminPageReal } from '../../components/ProductBatchesAdminPageReal'
import { createMockProductBatch } from '../utils/test-utils'

// Mock hooks
vi.mock('../../hooks', () => ({
  useProductBatches
}))

// Mock navigation
const mockPush = vi.fn()
const mockBack = vi.fn()
vi.mock('@/ui/hooks/useNavigationProgress', () => ({
  useNavigationProgress: () => ({
    push: mockPush,
    back: mockBack
  })
}))

// Mock UI components
vi.mock('@/ui/components/base/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )
}))

vi.mock('@/ui/components/base/Alert', () => ({
  Alert: ({ children, variant }: any) => (
    <div data-testid={`alert-${variant}`}>
      {children}
    </div>
  )
}))

// Mock internal components
vi.mock('../../components/ProductBatchTableSimple', () => ({
  ProductBatchTableSimple: ({ productBatches, isLoading }: any) => (
    <div data-testid="table-component">
      {isLoading ? (
        <div data-testid="loading">Loading...</div>
      ) : (
        productBatches.map((batch: any) => (
          <div key={batch.id} data-testid={`batch-${batch.id}`}>
            {batch.batchNumber}
          </div>
        ))
      )}
    </div>
  )
}))

vi.mock('../../components/FilterBar', () => ({
  FilterBar: ({ onSearchChange, searchValue }: any) => (
    <div data-testid="filter-bar">
      <input 
        placeholder="Search batches..."
        value={searchValue || ''}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  )
}))

vi.mock('../../components/PaginationSimple', () => ({
  PaginationSimple: ({ currentPage, totalPages, onPageChange }: any) => (
    <div data-testid="pagination">
      <button 
        onClick={() => onPageChange(1)} 
        disabled={currentPage === 1}
      >
        First
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button 
        onClick={() => onPageChange(totalPages)} 
        disabled={currentPage === totalPages}
      >
        Last
      </button>
    </div>
  )
}))

// Get mocked functions
const { useProductBatches } = vi.hoisted(() => ({
  useProductBatches: vi.fn()
}))

describe('ProductBatchesAdminPageReal', () => {

  const mockProductBatches = [
    createMockProductBatch({
      id: '1',
      batchNumber: 'BATCH-001',
      status: 'active',
      expirationDate: '2025-12-31T00:00:00.000Z'
    }),
    createMockProductBatch({
      id: '2', 
      batchNumber: 'BATCH-002',
      status: 'expired',
      expirationDate: '2024-01-01T00:00:00.000Z'
    })
  ]

  const mockMeta = {
    total: 25,
    currentPage: 1,
    lastPage: 2,
    perPage: 20
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render successfully', () => {
      useProductBatches.mockReturnValue({
        productBatches: mockProductBatches,
        meta: mockMeta,
        isLoading: false,
        error: null
      })

      expect(() => {
        render(<ProductBatchesAdminPageReal />)
      }).not.toThrow()
    })

    it('should render page header', () => {
      useProductBatches.mockReturnValue({
        productBatches: mockProductBatches,
        meta: mockMeta,
        isLoading: false,
        error: null
      })

      render(<ProductBatchesAdminPageReal />)

      expect(screen.getByText('Lotes de Productos')).toBeInTheDocument()
    })

    it('should render filter bar', () => {
      useProductBatches.mockReturnValue({
        productBatches: mockProductBatches,
        meta: mockMeta,
        isLoading: false,
        error: null
      })

      render(<ProductBatchesAdminPageReal />)

      expect(screen.getByTestId('filter-bar')).toBeInTheDocument()
    })

    it('should render table component', () => {
      useProductBatches.mockReturnValue({
        productBatches: mockProductBatches,
        meta: mockMeta,
        isLoading: false,
        error: null
      })

      render(<ProductBatchesAdminPageReal />)

      expect(screen.getByTestId('table-component')).toBeInTheDocument()
    })

    it('should render pagination', () => {
      useProductBatches.mockReturnValue({
        productBatches: mockProductBatches,
        meta: mockMeta,
        isLoading: false,
        error: null
      })

      render(<ProductBatchesAdminPageReal />)

      expect(screen.getByTestId('pagination')).toBeInTheDocument()
    })
  })

  describe('Data Loading', () => {
    it('should display loading state', () => {
      useProductBatches.mockReturnValue({
        productBatches: [],
        meta: undefined,
        isLoading: true,
        error: null
      })

      render(<ProductBatchesAdminPageReal />)

      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('should display product batches when loaded', () => {
      useProductBatches.mockReturnValue({
        productBatches: mockProductBatches,
        meta: mockMeta,
        isLoading: false,
        error: null
      })

      render(<ProductBatchesAdminPageReal />)

      expect(screen.getByTestId('batch-1')).toBeInTheDocument()
      expect(screen.getByTestId('batch-2')).toBeInTheDocument()
      expect(screen.getByText('BATCH-001')).toBeInTheDocument()
      expect(screen.getByText('BATCH-002')).toBeInTheDocument()
    })

    it('should display error state', () => {
      const error = new Error('Failed to load batches')
      useProductBatches.mockReturnValue({
        productBatches: [],
        meta: undefined,
        isLoading: false,
        error: error
      })

      render(<ProductBatchesAdminPageReal />)

      expect(screen.getByTestId('alert-danger')).toBeInTheDocument()
      expect(screen.getByText(/Failed to load batches|Error al cargar los lotes/)).toBeInTheDocument()
    })
  })

  describe('Batch Metrics', () => {
    it('should calculate and display batch metrics', () => {
      useProductBatches.mockReturnValue({
        productBatches: mockProductBatches,
        meta: mockMeta,
        isLoading: false,
        error: null
      })

      render(<ProductBatchesAdminPageReal />)

      // Should display metrics cards
      expect(screen.getByText('Total Lotes')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument() // Total count from mockMeta
    })

    it('should calculate active batches correctly', () => {
      useProductBatches.mockReturnValue({
        productBatches: mockProductBatches,
        meta: mockMeta,
        isLoading: false,
        error: null
      })

      render(<ProductBatchesAdminPageReal />)

      expect(screen.getByText('Activos')).toBeInTheDocument()
      // Should find the card with "Activos" and check it contains "1"
      const activosCard = screen.getByText('Activos').closest('.card')
      expect(activosCard).toHaveTextContent('1')
    })
  })

  describe('Search Functionality', () => {
    it('should handle search input changes', async () => {
      const user = userEvent.setup()
      useProductBatches.mockReturnValue({
        productBatches: mockProductBatches,
        meta: mockMeta,
        isLoading: false,
        error: null
      })

      render(<ProductBatchesAdminPageReal />)

      const searchInput = screen.getByPlaceholderText('Search batches...')
      
      // Use paste instead of type to avoid character-by-character debounce triggers
      await user.click(searchInput)
      await user.paste('BATCH-001')
      
      // Wait for debounced search to trigger (300ms debounce + buffer)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Should have been called with search term
      expect(useProductBatches).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { search: 'BATCH-001' },
          page: 1,
          pageSize: 20
        })
      )
    })

    it('should clear filters when search is empty', async () => {
      const user = userEvent.setup()
      useProductBatches.mockReturnValue({
        productBatches: mockProductBatches,
        meta: mockMeta,
        isLoading: false,
        error: null
      })

      render(<ProductBatchesAdminPageReal />)

      const searchInput = screen.getByPlaceholderText('Search batches...')
      
      // Paste some text, then clear it
      await user.click(searchInput)
      await user.paste('test')
      await user.clear(searchInput)
      
      // Wait for debounced search to clear (300ms debounce + buffer)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Should have been called with undefined filters when cleared
      expect(useProductBatches).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: undefined,
          page: 1,
          pageSize: 20
        })
      )
    })
  })

  describe('Pagination', () => {
    it('should handle page changes', async () => {
      const user = userEvent.setup()
      const multiPageMeta = { ...mockMeta, lastPage: 3, currentPage: 1 }
      
      useProductBatches.mockReturnValue({
        productBatches: mockProductBatches,
        meta: multiPageMeta,
        isLoading: false,
        error: null
      })

      render(<ProductBatchesAdminPageReal />)

      const lastButton = screen.getByText('Last')
      await user.click(lastButton)

      expect(useProductBatches).toHaveBeenLastCalledWith({
        filters: undefined,
        page: 3,
        pageSize: 20
      })
    })

    it('should display correct pagination info', () => {
      const multiPageMeta = { ...mockMeta, lastPage: 5, currentPage: 3 }
      
      useProductBatches.mockReturnValue({
        productBatches: mockProductBatches,
        meta: multiPageMeta,
        isLoading: false,
        error: null
      })

      render(<ProductBatchesAdminPageReal />)

      expect(screen.getByText('Page 3 of 5')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should display empty state when no batches', () => {
      useProductBatches.mockReturnValue({
        productBatches: [],
        meta: { ...mockMeta, total: 0 },
        isLoading: false,
        error: null
      })

      render(<ProductBatchesAdminPageReal />)

      // Should show empty metrics with 0 values
      expect(screen.getByText('Total Lotes')).toBeInTheDocument()
      // All metrics should show 0 for empty state
      const metricCards = screen.getAllByText('0')
      expect(metricCards.length).toBeGreaterThan(0)
    })
  })

  describe('Create Button', () => {
    it('should render create new batch button', () => {
      useProductBatches.mockReturnValue({
        productBatches: mockProductBatches,
        meta: mockMeta,
        isLoading: false,
        error: null
      })

      render(<ProductBatchesAdminPageReal />)

      expect(screen.getByText('Nuevo Lote')).toBeInTheDocument()
    })

    it('should have correct navigation on create button click', async () => {
      const user = userEvent.setup()
      useProductBatches.mockReturnValue({
        productBatches: mockProductBatches,
        meta: mockMeta,
        isLoading: false,
        error: null
      })

      render(<ProductBatchesAdminPageReal />)

      const createButton = screen.getByText('Nuevo Lote')
      await user.click(createButton)
      
      // Verificar que se llamó push con la ruta correcta
      expect(mockPush).toHaveBeenCalledWith('/dashboard/inventory/product-batch/create')
    })
  })

  describe('Component Stability', () => {
    it('should handle prop updates without issues', () => {
      useProductBatches.mockReturnValue({
        productBatches: mockProductBatches,
        meta: mockMeta,
        isLoading: false,
        error: null
      })

      const { rerender } = render(<ProductBatchesAdminPageReal />)
      
      rerender(<ProductBatchesAdminPageReal />)

      expect(screen.getByText('Lotes de Productos')).toBeInTheDocument()
    })

    it('should unmount cleanly', () => {
      useProductBatches.mockReturnValue({
        productBatches: mockProductBatches,
        meta: mockMeta,
        isLoading: false,
        error: null
      })

      const { unmount } = render(<ProductBatchesAdminPageReal />)

      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Hook Integration', () => {
    it('should call useProductBatches with correct initial params', () => {
      useProductBatches.mockReturnValue({
        productBatches: mockProductBatches,
        meta: mockMeta,
        isLoading: false,
        error: null
      })

      render(<ProductBatchesAdminPageReal />)

      expect(useProductBatches).toHaveBeenCalledWith({
        filters: undefined,
        page: 1,
        pageSize: 20
      })
    })

    it('should handle missing meta data gracefully', () => {
      useProductBatches.mockReturnValue({
        productBatches: mockProductBatches,
        meta: undefined,
        isLoading: false,
        error: null
      })

      expect(() => {
        render(<ProductBatchesAdminPageReal />)
      }).not.toThrow()

      // When meta is undefined, pagination may not render
      // Just verify the component rendered without error
      expect(screen.getByText('Total Lotes')).toBeInTheDocument()
    })
  })
})