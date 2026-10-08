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

vi.mock('../../hooks/useWarehouses', () => ({
  useWarehouses: vi.fn(() => ({ warehouses: [], meta: undefined, isLoading: false, error: null })),
}))

vi.mock('../../hooks/useInventoryCounts', () => ({
  useLotAlerts: vi.fn(() => ({
    expiring: [],
    expiringCount: 4,
    expiredCount: 2,
    isLoading: false,
    error: null,
  })),
}))

vi.mock('@lwm/ui', async () => {
  const actual = await vi.importActual<typeof import('@lwm/ui')>('@lwm/ui')
  return {
    ...actual,
    useNavigationProgress: () => ({
      push: vi.fn(),
      back: vi.fn()
    })
  }
})

describe('Simple Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render admin page successfully', () => {
    render(<ProductBatchesAdminPageReal />)
    
    expect(screen.getByRole('heading', { name: 'Lotes de productos' })).toBeInTheDocument()
  })

  it('should display product batch data', () => {
    render(<ProductBatchesAdminPageReal />)
    
    expect(screen.getByText('BATCH-001')).toBeInTheDocument()
  })

  it('should show lot alert counts from the backend', () => {
    render(<ProductBatchesAdminPageReal />)

    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should render without errors', () => {
    expect(() => {
      render(<ProductBatchesAdminPageReal />)
    }).not.toThrow()
  })
})