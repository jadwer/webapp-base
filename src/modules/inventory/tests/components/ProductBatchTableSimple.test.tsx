/**
 * ProductBatchTableSimple Component Tests
 * 
 * Tests for the responsive table component matching actual implementation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductBatchTableSimple } from '../../components/ProductBatchTableSimple'
import { createMockProductBatch, createMockProduct } from '../utils/test-utils'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

// Mock Next.js Link component
vi.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ children, href, ...props }: { children: React.ReactNode, href: string }) => (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

// Mock formatters
vi.mock('@/lib/formatters', () => ({
  formatCurrency: vi.fn((value) => `$${value.toFixed(2)}`),
  formatQuantity: vi.fn((value) => value.toString())
}))

describe('ProductBatchTableSimple', () => {
  // Mock data
  const mockProduct = createMockProduct({ id: '1', name: 'Test Product', sku: 'TEST-001' })

  const mockProductBatches = [
    createMockProductBatch({
      id: '1',
      batchNumber: 'BATCH-001',
      lotNumber: 'LOT-001',
      status: 'active',
      initialQuantity: 100,
      currentQuantity: 80,
      unitCost: 10.50,
      manufacturingDate: '2025-01-01T00:00:00.000Z',
      expirationDate: '2025-12-31T00:00:00.000Z',
      supplierName: 'Test Supplier',
      product: mockProduct,
      warehouse: {
        id: '1',
        name: 'Test Warehouse',
        code: 'WH-001'
      },
      warehouseLocation: {
        id: '1',
        name: 'A-01-001',
        code: 'A01001'
      }
    }),
    createMockProductBatch({
      id: '2',
      batchNumber: 'BATCH-002',
      lotNumber: 'LOT-002',
      status: 'quarantine',
      initialQuantity: 50,
      currentQuantity: 50,
      unitCost: 8.75,
      manufacturingDate: '2025-01-05T00:00:00.000Z',
      expirationDate: '2025-06-30T00:00:00.000Z',
      supplierName: '', // No supplier name for second batch
      product: mockProduct,
      warehouse: {
        id: '1',
        name: 'Test Warehouse',
        code: 'WH-001'
      }
    })
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render successfully', () => {
      expect(() => {
        render(<ProductBatchTableSimple productBatches={mockProductBatches} />)
      }).not.toThrow()
    })

    it('should render table headers', () => {
      render(<ProductBatchTableSimple productBatches={mockProductBatches} />)

      expect(screen.getByText('Lote')).toBeInTheDocument()
      expect(screen.getByText('Producto')).toBeInTheDocument()
      expect(screen.getByText('Fechas')).toBeInTheDocument()
      expect(screen.getByText('Cantidades')).toBeInTheDocument()
      expect(screen.getByText('Ubicación')).toBeInTheDocument()
      expect(screen.getByText('Costo')).toBeInTheDocument()
      expect(screen.getByText('Estado')).toBeInTheDocument()
      expect(screen.getByText('Acciones')).toBeInTheDocument()
    })

    it('should render product batch rows', () => {
      render(<ProductBatchTableSimple productBatches={mockProductBatches} />)

      expect(screen.getByText('BATCH-001')).toBeInTheDocument()
      expect(screen.getByText('BATCH-002')).toBeInTheDocument()
      expect(screen.getAllByText('Test Product')).toHaveLength(2)
    })

    it('should display status badges', () => {
      render(<ProductBatchTableSimple productBatches={mockProductBatches} />)

      expect(screen.getByText('Activo')).toBeInTheDocument()
      expect(screen.getByText('Cuarentena')).toBeInTheDocument()
    })

    it('should show quantity information', () => {
      render(<ProductBatchTableSimple productBatches={mockProductBatches} />)

      expect(screen.getByText('80 / 100')).toBeInTheDocument()
      expect(screen.getByText('50 / 50')).toBeInTheDocument()
    })

    it('should show lot numbers', () => {
      render(<ProductBatchTableSimple productBatches={mockProductBatches} />)

      expect(screen.getByText('LOT: LOT-001')).toBeInTheDocument()
      expect(screen.getByText('LOT: LOT-002')).toBeInTheDocument()
    })

    it('should show supplier names', () => {
      render(<ProductBatchTableSimple productBatches={mockProductBatches} />)

      expect(screen.getByText('Test Supplier')).toBeInTheDocument() // Only first batch has supplier name
    })
  })

  describe('Loading State', () => {
    it('should show loading message when isLoading is true', () => {
      render(<ProductBatchTableSimple isLoading={true} />)

      expect(screen.getByText('Cargando lotes de productos...')).toBeInTheDocument()
    })

    it('should show loading spinner when isLoading is true', () => {
      render(<ProductBatchTableSimple isLoading={true} />)

      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('Cargando...')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty message when no product batches', () => {
      render(<ProductBatchTableSimple productBatches={[]} />)

      expect(screen.getByText('No hay lotes')).toBeInTheDocument()
      expect(screen.getByText('No se encontraron lotes de productos para mostrar.')).toBeInTheDocument()
    })

    it('should not show table when empty', () => {
      render(<ProductBatchTableSimple productBatches={[]} />)

      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('should format dates correctly', () => {
      render(<ProductBatchTableSimple productBatches={mockProductBatches} />)

      // Should show manufacturing and expiration labels
      expect(screen.getAllByText(/Fab:/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Exp:/).length).toBeGreaterThan(0)
    })

    it('should format costs correctly', () => {
      render(<ProductBatchTableSimple productBatches={mockProductBatches} />)

      expect(screen.getByText('$10.50')).toBeInTheDocument()
      expect(screen.getByText('$8.75')).toBeInTheDocument()
    })

    it('should show warehouse information', () => {
      render(<ProductBatchTableSimple productBatches={mockProductBatches} />)

      expect(screen.getAllByText('Test Warehouse')).toHaveLength(2)
      expect(screen.getByText('A-01-001')).toBeInTheDocument()
    })

    it('should show SKU when available', () => {
      render(<ProductBatchTableSimple productBatches={mockProductBatches} />)

      expect(screen.getAllByText('SKU: TEST-001')).toHaveLength(2)
    })
  })

  describe('Action Links', () => {
    it('should render view action links', () => {
      render(<ProductBatchTableSimple productBatches={mockProductBatches} />)

      const viewLinks = screen.getAllByTitle('Ver detalles')
      expect(viewLinks).toHaveLength(2)
      expect(viewLinks[0]).toHaveAttribute('href', '/dashboard/inventory/product-batch/1')
    })

    it('should render edit action links', () => {
      render(<ProductBatchTableSimple productBatches={mockProductBatches} />)

      const editLinks = screen.getAllByTitle('Editar lote')
      expect(editLinks).toHaveLength(2)
      expect(editLinks[0]).toHaveAttribute('href', '/dashboard/inventory/product-batch/1/edit')
    })
  })

  describe('Table Structure', () => {
    it('should render table with proper structure', () => {
      render(<ProductBatchTableSimple productBatches={mockProductBatches} />)

      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
      expect(table).toHaveClass('table', 'table-hover')

      const tableBody = screen.getAllByRole('rowgroup')[1] // Second rowgroup is tbody
      expect(tableBody).toBeInTheDocument()
      expect(tableBody.tagName.toLowerCase()).toBe('tbody')
    })

    it('should have responsive wrapper', () => {
      const { container } = render(<ProductBatchTableSimple productBatches={mockProductBatches} />)

      expect(container.querySelector('.table-responsive')).toBeInTheDocument()
    })
  })

  describe('Status Variations', () => {
    it('should handle different status types', () => {
      const batchesWithVariousStatuses = [
        createMockProductBatch({ id: '1', status: 'active', product: mockProduct }),
        createMockProductBatch({ id: '2', status: 'quarantine', product: mockProduct }),
        createMockProductBatch({ id: '3', status: 'expired', product: mockProduct }),
        createMockProductBatch({ id: '4', status: 'recalled', product: mockProduct }),
        createMockProductBatch({ id: '5', status: 'consumed', product: mockProduct })
      ]

      render(<ProductBatchTableSimple productBatches={batchesWithVariousStatuses} />)

      expect(screen.getByText('Activo')).toBeInTheDocument()
      expect(screen.getByText('Cuarentena')).toBeInTheDocument()
      expect(screen.getByText('Vencido')).toBeInTheDocument()
      expect(screen.getByText('Retirado')).toBeInTheDocument()
      expect(screen.getByText('Consumido')).toBeInTheDocument()
    })
  })

  describe('Missing Data Handling', () => {
    it('should handle missing optional data gracefully', () => {
      const batchWithMissingData = createMockProductBatch({
        id: '1',
        batchNumber: 'BATCH-001',
        lotNumber: '',
        supplierName: '',
        product: mockProduct,
        warehouse: { id: '1', name: 'Test Warehouse', code: 'WH-001' },
        warehouseLocation: undefined
      })

      expect(() => {
        render(<ProductBatchTableSimple productBatches={[batchWithMissingData]} />)
      }).not.toThrow()

      expect(screen.getByText('BATCH-001')).toBeInTheDocument()
      expect(screen.queryByText(/LOT:/)).not.toBeInTheDocument()
    })

    it('should handle missing product data', () => {
      const batchWithoutProduct = createMockProductBatch({
        id: '1',
        product: undefined,
        warehouse: { id: '1', name: 'Test Warehouse', code: 'WH-001' }
      })

      render(<ProductBatchTableSimple productBatches={[batchWithoutProduct]} />)

      expect(screen.getByText('Producto sin datos')).toBeInTheDocument()
    })

    it('should handle missing warehouse data', () => {
      const batchWithoutWarehouse = createMockProductBatch({
        id: '1',
        product: mockProduct,
        warehouse: undefined
      })

      render(<ProductBatchTableSimple productBatches={[batchWithoutWarehouse]} />)

      expect(screen.getByText('Almacén sin datos')).toBeInTheDocument()
    })
  })

  describe('Component Stability', () => {
    it('should handle prop updates without issues', () => {
      const { rerender } = render(<ProductBatchTableSimple productBatches={mockProductBatches} />)

      // Update with different data
      const newBatches = [mockProductBatches[0]]
      rerender(<ProductBatchTableSimple productBatches={newBatches} />)

      expect(screen.getByText('BATCH-001')).toBeInTheDocument()
      expect(screen.queryByText('BATCH-002')).not.toBeInTheDocument()
    })

    it('should unmount cleanly', () => {
      const { unmount } = render(<ProductBatchTableSimple productBatches={mockProductBatches} />)

      expect(() => unmount()).not.toThrow()
    })
  })
})