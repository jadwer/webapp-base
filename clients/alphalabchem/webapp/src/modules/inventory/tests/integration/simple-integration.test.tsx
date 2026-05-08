/**
 * @vitest-environment happy-dom
 * Simple Integration Tests
 * Basic integration tests that verify core functionality works
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductBatchesAdminPageReal } from '../../components/ProductBatchesAdminPageReal'
import { createMockProductBatch } from '../utils/test-utils'

// Simple mocks for integration
vi.mock('../../hooks/useProductBatches', () => ({
  useProductBatches: vi.fn(() => ({
    productBatches: [
      createMockProductBatch({ 
        id: '1', 
        batchNumber: 'BATCH-001',
        status: 'active'
      })
    ],
    meta: { total: 1, currentPage: 1, lastPage: 1, perPage: 20 },
    isLoading: false,
    error: null
  }))
}))

vi.mock('@/ui/hooks/useNavigationProgress', () => ({
  useNavigationProgress: () => ({
    push: vi.fn(),
    back: vi.fn()
  })
}))

describe('Simple Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render admin page successfully', () => {
    render(<ProductBatchesAdminPageReal />)
    
    expect(screen.getByText('Lotes de Productos')).toBeInTheDocument()
  })

  it('should display product batch data', () => {
    render(<ProductBatchesAdminPageReal />)
    
    expect(screen.getByText('BATCH-001')).toBeInTheDocument()
  })

  it('should show correct total count', () => {
    render(<ProductBatchesAdminPageReal />)
    
    // Should display total count somewhere in the UI
    const elements = screen.getAllByText('1')
    expect(elements.length).toBeGreaterThan(0)
  })

  it('should render without errors', () => {
    expect(() => {
      render(<ProductBatchesAdminPageReal />)
    }).not.toThrow()
  })
})