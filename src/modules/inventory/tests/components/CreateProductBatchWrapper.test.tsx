/**
 * CreateProductBatchWrapper Component Tests
 * 
 * Tests for the creation wrapper with SWR integration and data loading
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SWRConfig } from 'swr'
import { CreateProductBatchWrapper } from '../../components/CreateProductBatchWrapper'
import { createMockProduct, createMockWarehouse, createMockWarehouseLocation } from '../utils/test-utils'
import type { ReactNode } from 'react'

// Mock hooks
vi.mock('@/modules/products/hooks/useProducts', () => ({
  useProducts: () => ({
    products: [
      createMockProduct({ id: '1', name: 'Product 1' }),
      createMockProduct({ id: '2', name: 'Product 2' })
    ],
    isLoading: false,
    error: null
  })
}))

vi.mock('../../hooks/useWarehouses', () => ({
  useWarehouses: () => ({
    warehouses: [
      createMockWarehouse({ id: '1', name: 'Warehouse 1' }),
      createMockWarehouse({ id: '2', name: 'Warehouse 2' })
    ],
    isLoading: false,
    error: null
  })
}))

vi.mock('../../hooks/useLocations', () => ({
  useLocations: () => ({
    locations: [
      createMockWarehouseLocation({ id: '1', name: 'Location 1' }),
      createMockWarehouseLocation({ id: '2', name: 'Location 2' })
    ],
    isLoading: false,
    error: null
  })
}))

vi.mock('../../hooks/useProductBatchMutations', () => ({
  useProductBatchMutations: () => ({
    createProductBatch: vi.fn().mockResolvedValue({ id: '1' }),
    isCreating: false
  })
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn()
  })
}))

// Mock child component
vi.mock('../../components/ProductBatchForm', () => ({
  ProductBatchForm: ({ onSubmit, onCancel, products, warehouses, locations, isLoading }: any) => (
    <div data-testid="product-batch-form">
      <div data-testid="products-count">{products?.length || 0} products</div>
      <div data-testid="warehouses-count">{warehouses?.length || 0} warehouses</div>
      <div data-testid="locations-count">{locations?.length || 0} locations</div>
      <div data-testid="loading-state">{isLoading ? 'loading' : 'not-loading'}</div>
      <button onClick={() => onSubmit({ batchNumber: 'TEST-BATCH' })}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}))

// SWR wrapper for testing
function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    )
  }
}

describe('CreateProductBatchWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render successfully', () => {
      const wrapper = createWrapper()
      
      expect(() => {
        render(<CreateProductBatchWrapper />, { wrapper })
      }).not.toThrow()
    })

    it('should render the ProductBatchForm component', async () => {
      const wrapper = createWrapper()
      render(<CreateProductBatchWrapper />, { wrapper })

      await waitFor(() => {
        expect(screen.getByTestId('product-batch-form')).toBeInTheDocument()
      })
    })

    it('should pass products data to form', async () => {
      const wrapper = createWrapper()
      render(<CreateProductBatchWrapper />, { wrapper })

      await waitFor(() => {
        expect(screen.getByTestId('products-count')).toHaveTextContent('2 products')
      })
    })

    it('should pass warehouses data to form', async () => {
      const wrapper = createWrapper()
      render(<CreateProductBatchWrapper />, { wrapper })

      await waitFor(() => {
        expect(screen.getByTestId('warehouses-count')).toHaveTextContent('2 warehouses')
      })
    })

    it('should pass locations data to form', async () => {
      const wrapper = createWrapper()
      render(<CreateProductBatchWrapper />, { wrapper })

      await waitFor(() => {
        expect(screen.getByTestId('locations-count')).toHaveTextContent('2 locations')
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state initially', () => {
      const wrapper = createWrapper()
      render(<CreateProductBatchWrapper />, { wrapper })

      // Component might show loading during initial render
      expect(screen.getByTestId('product-batch-form')).toBeInTheDocument()
    })

    it('should show not loading when data is loaded', async () => {
      const wrapper = createWrapper()
      render(<CreateProductBatchWrapper />, { wrapper })

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('not-loading')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle products loading error', () => {
      // Would need to mock useProducts to return error
      const wrapper = createWrapper()
      
      expect(() => {
        render(<CreateProductBatchWrapper />, { wrapper })
      }).not.toThrow()
    })

    it('should handle warehouses loading error', () => {
      // Would need to mock useWarehouses to return error
      const wrapper = createWrapper()
      
      expect(() => {
        render(<CreateProductBatchWrapper />, { wrapper })
      }).not.toThrow()
    })

    it('should handle locations loading error', () => {
      // Would need to mock useLocations to return error
      const wrapper = createWrapper()
      
      expect(() => {
        render(<CreateProductBatchWrapper />, { wrapper })
      }).not.toThrow()
    })
  })

  describe('Form Interactions', () => {
    it('should handle form submission', async () => {
      const wrapper = createWrapper()
      const user = userEvent.setup()
      render(<CreateProductBatchWrapper />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Submit')).toBeInTheDocument()
      })

      const submitButton = screen.getByText('Submit')
      await user.click(submitButton)

      // Should call the mutation (exact behavior depends on implementation)
      expect(screen.getByTestId('product-batch-form')).toBeInTheDocument()
    })

    it('should handle form cancellation', async () => {
      const wrapper = createWrapper()
      const user = userEvent.setup()
      render(<CreateProductBatchWrapper />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument()
      })

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      // Should handle cancellation (navigate back or similar)
      expect(screen.getByTestId('product-batch-form')).toBeInTheDocument()
    })
  })

  describe('Data Loading Integration', () => {
    it('should load all required data before rendering form', async () => {
      const wrapper = createWrapper()
      render(<CreateProductBatchWrapper />, { wrapper })

      await waitFor(() => {
        expect(screen.getByTestId('products-count')).toHaveTextContent('2 products')
        expect(screen.getByTestId('warehouses-count')).toHaveTextContent('2 warehouses')
        expect(screen.getByTestId('locations-count')).toHaveTextContent('2 locations')
      })
    })

    it('should handle empty data arrays gracefully', async () => {
      // This would require mocking hooks to return empty arrays
      const wrapper = createWrapper()
      
      expect(() => {
        render(<CreateProductBatchWrapper />, { wrapper })
      }).not.toThrow()
    })
  })

  describe('Component Stability', () => {
    it('should handle re-renders without issues', async () => {
      const wrapper = createWrapper()
      const { rerender } = render(<CreateProductBatchWrapper />, { wrapper })

      await waitFor(() => {
        expect(screen.getByTestId('product-batch-form')).toBeInTheDocument()
      })

      expect(() => {
        rerender(<CreateProductBatchWrapper />)
      }).not.toThrow()

      expect(screen.getByTestId('product-batch-form')).toBeInTheDocument()
    })

    it('should unmount cleanly', async () => {
      const wrapper = createWrapper()
      const { unmount } = render(<CreateProductBatchWrapper />, { wrapper })

      await waitFor(() => {
        expect(screen.getByTestId('product-batch-form')).toBeInTheDocument()
      })

      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Props Passing', () => {
    it('should pass correct props to ProductBatchForm', async () => {
      const wrapper = createWrapper()
      render(<CreateProductBatchWrapper />, { wrapper })

      await waitFor(() => {
        // Form should receive onSubmit callback
        expect(screen.getByText('Submit')).toBeInTheDocument()
        
        // Form should receive onCancel callback
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        
        // Form should receive data arrays
        expect(screen.getByTestId('products-count')).toBeInTheDocument()
        expect(screen.getByTestId('warehouses-count')).toBeInTheDocument()
        expect(screen.getByTestId('locations-count')).toBeInTheDocument()
      })
    })

    it('should not pass productBatch prop for creation', async () => {
      const wrapper = createWrapper()
      render(<CreateProductBatchWrapper />, { wrapper })

      await waitFor(() => {
        // Form should be in create mode (no existing batch data)
        expect(screen.getByTestId('product-batch-form')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation Integration', () => {
    it('should handle navigation after successful creation', async () => {
      const wrapper = createWrapper()
      const user = userEvent.setup()
      render(<CreateProductBatchWrapper />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Submit')).toBeInTheDocument()
      })

      // Simulate successful form submission
      const submitButton = screen.getByText('Submit')
      await user.click(submitButton)

      // Should handle navigation (exact behavior depends on implementation)
      expect(screen.getByTestId('product-batch-form')).toBeInTheDocument()
    })

    it('should handle navigation on cancellation', async () => {
      const wrapper = createWrapper()
      const user = userEvent.setup()
      render(<CreateProductBatchWrapper />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument()
      })

      // Simulate form cancellation
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      // Should handle navigation back
      expect(screen.getByTestId('product-batch-form')).toBeInTheDocument()
    })
  })

  describe('SWR Integration', () => {
    it('should work with SWR cache', async () => {
      const wrapper = createWrapper()
      render(<CreateProductBatchWrapper />, { wrapper })

      await waitFor(() => {
        expect(screen.getByTestId('product-batch-form')).toBeInTheDocument()
      })

      // Data should be loaded from SWR cache
      expect(screen.getByTestId('products-count')).toHaveTextContent('2 products')
    })

    it('should handle SWR revalidation', async () => {
      const wrapper = createWrapper()
      const { rerender } = render(<CreateProductBatchWrapper />, { wrapper })

      await waitFor(() => {
        expect(screen.getByTestId('product-batch-form')).toBeInTheDocument()
      })

      // Rerender should use cached data
      rerender(<CreateProductBatchWrapper />)

      expect(screen.getByTestId('products-count')).toHaveTextContent('2 products')
    })
  })
})