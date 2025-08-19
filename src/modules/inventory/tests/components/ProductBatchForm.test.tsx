/**
 * ProductBatchForm Component Tests
 * 
 * Basic tests focusing on essential functionality and component stability
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductBatchForm } from '../../components/ProductBatchForm'
import { createMockProductBatch } from '../utils/test-utils'
import type { Product } from '@/modules/products/types'
import type { WarehouseParsed, WarehouseLocationParsed } from '../../types'

// Minimal mock data
const mockProducts: Product[] = [{
  id: '1',
  type: 'products',
  attributes: {
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test',
    sku: 'TEST001',
    barcode: '123',
    price: 99.99,
    cost: 50.00,
    taxable: true,
    trackQuantity: true,
    allowBackorder: false,
    requiresShipping: true,
    weight: 1.0,
    weightUnit: 'kg',
    dimensions: { length: 10, width: 10, height: 10 },
    dimensionsUnit: 'cm',
    metadata: '{}',
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  name: 'Test Product',
  sku: 'TEST001',
  price: 99.99
}]

const mockWarehouses: WarehouseParsed[] = [{
  id: '1',
  type: 'warehouses',
  name: 'Test Warehouse',
  slug: 'test-warehouse',
  code: 'WH001',
  warehouseType: 'main',
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
}]

const mockLocations: WarehouseLocationParsed[] = [{
  id: '1',
  type: 'warehouse-locations',
  name: 'A-01-001',
  slug: 'a-01-001',
  code: 'A01001',
  locationType: 'storage',
  zone: 'A',
  aisle: '01',
  rack: '001',
  shelf: 'A',
  bin: '01',
  warehouseId: '1',
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
}]

describe('ProductBatchForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isLoading: false,
    products: mockProducts,
    warehouses: mockWarehouses,
    locations: mockLocations
  }

  describe('Component Rendering', () => {
    it('should render successfully', () => {
      // Act & Assert - Should not throw
      expect(() => {
        render(<ProductBatchForm {...defaultProps} />)
      }).not.toThrow()
    })

    it('should render form title for create mode', () => {
      // Act
      render(<ProductBatchForm {...defaultProps} />)

      // Assert
      expect(screen.getByText('Crear Nuevo Lote')).toBeInTheDocument()
    })

    it('should render form title for edit mode', () => {
      // Arrange
      const existingBatch = createMockProductBatch({
        id: '1',
        batchNumber: 'BATCH-001'
      })

      // Act
      render(
        <ProductBatchForm 
          {...defaultProps} 
          productBatch={existingBatch}
        />
      )

      // Assert
      expect(screen.getByText('Editar Lote de Producto')).toBeInTheDocument()
    })

    it('should render basic form fields', () => {
      // Act
      render(<ProductBatchForm {...defaultProps} />)

      // Assert - Check for key field labels that we know exist
      expect(screen.getByText('Información Básica')).toBeInTheDocument()
      expect(screen.getByText('Número de Lote *')).toBeInTheDocument()
      expect(screen.getByText('Producto *')).toBeInTheDocument()
    })

    it('should render action buttons', () => {
      // Act
      render(<ProductBatchForm {...defaultProps} />)

      // Assert
      expect(screen.getByText('Crear Lote')).toBeInTheDocument()
      expect(screen.getByText('Cancelar')).toBeInTheDocument()
    })
  })

  describe('Edit Mode Functionality', () => {
    it('should populate fields with existing data', () => {
      // Arrange
      const existingBatch = createMockProductBatch({
        id: '1',
        batchNumber: 'BATCH-001',
        lotNumber: 'LOT-001'
      })

      // Act
      render(
        <ProductBatchForm 
          {...defaultProps} 
          productBatch={existingBatch}
        />
      )

      // Assert - Just verify the data was populated
      expect(screen.getByDisplayValue('BATCH-001')).toBeInTheDocument()
      expect(screen.getByDisplayValue('LOT-001')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should disable inputs when isLoading is true', () => {
      // Act
      render(<ProductBatchForm {...defaultProps} isLoading={true} />)

      // Assert - Check if a specific input is disabled
      const batchNumberInput = screen.getByRole('textbox', { name: /número de lote/i })
      expect(batchNumberInput).toBeDisabled()
    })
  })

  describe('User Interactions', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<ProductBatchForm {...defaultProps} />)

      // Act
      const cancelButton = screen.getByText('Cancelar')
      await user.click(cancelButton)

      // Assert
      expect(mockOnCancel).toHaveBeenCalledOnce()
    })
  })

  describe('Form Structure', () => {
    it('should have proper form element', () => {
      // Act
      render(<ProductBatchForm {...defaultProps} />)

      // Assert - Form element exists (querySelector since it may not have role="form")
      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    it('should have submit button with correct type', () => {
      // Act
      render(<ProductBatchForm {...defaultProps} />)

      // Assert
      const submitButton = screen.getByRole('button', { name: /crear lote/i })
      expect(submitButton).toHaveAttribute('type', 'submit')
    })
  })

  describe('Props Validation', () => {
    it('should handle empty data arrays', () => {
      // Act & Assert
      expect(() => {
        render(
          <ProductBatchForm
            onSubmit={mockOnSubmit}
            products={[]}
            warehouses={[]}
            locations={[]}
          />
        )
      }).not.toThrow()
    })

    it('should handle minimal props', () => {
      // Act & Assert
      expect(() => {
        render(
          <ProductBatchForm
            onSubmit={mockOnSubmit}
            products={mockProducts}
            warehouses={mockWarehouses}
            locations={mockLocations}
          />
        )
      }).not.toThrow()
    })
  })

  describe('Component Stability', () => {
    it('should handle re-renders without issues', () => {
      // Act
      const { rerender } = render(<ProductBatchForm {...defaultProps} />)
      
      // Re-render with different loading state
      rerender(<ProductBatchForm {...defaultProps} isLoading={true} />)
      rerender(<ProductBatchForm {...defaultProps} isLoading={false} />)

      // Assert
      expect(screen.getByText('Crear Nuevo Lote')).toBeInTheDocument()
    })

    it('should unmount cleanly', () => {
      // Act
      const { unmount } = render(<ProductBatchForm {...defaultProps} />)
      
      // Assert - Should not throw
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('should handle onSubmit errors gracefully', async () => {
      // Arrange
      mockOnSubmit.mockRejectedValueOnce(new Error('Network error'))
      const user = userEvent.setup()
      render(<ProductBatchForm {...defaultProps} />)

      // Act
      const submitButton = screen.getByText('Crear Lote')
      await user.click(submitButton)

      // Assert - Form should still be rendered
      expect(screen.getByText('Crear Nuevo Lote')).toBeInTheDocument()
    })
  })
})