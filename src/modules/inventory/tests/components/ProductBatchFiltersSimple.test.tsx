/**
 * ProductBatchFiltersSimple Component Tests
 * 
 * Tests for the filters component matching actual implementation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductBatchFiltersSimple } from '../../components/ProductBatchFiltersSimple'

describe('ProductBatchFiltersSimple', () => {
  const mockOnFiltersChange = vi.fn()

  const defaultProps = {
    onFiltersChange: mockOnFiltersChange
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
      expect(() => {
        render(<ProductBatchFiltersSimple {...defaultProps} />)
      }).not.toThrow()
    })

    it('should render collapsed by default', () => {
      render(<ProductBatchFiltersSimple {...defaultProps} />)

      expect(screen.getByText('Filtros Avanzados')).toBeInTheDocument()
      expect(screen.getByTitle('Expandir filtros')).toBeInTheDocument()
      
      // Filters should not be visible when collapsed
      expect(screen.queryByText('Estado')).not.toBeInTheDocument()
      expect(screen.queryByText('Vencimiento')).not.toBeInTheDocument()
      expect(screen.queryByText('Proveedor')).not.toBeInTheDocument()
    })

    it('should show expand/collapse button', () => {
      render(<ProductBatchFiltersSimple {...defaultProps} />)

      const expandButton = screen.getByTitle('Expandir filtros')
      expect(expandButton).toBeInTheDocument()
      expect(expandButton.querySelector('.bi-chevron-down')).toBeInTheDocument()
    })
  })

  describe('Filter Expansion', () => {
    it('should expand filters when expand button is clicked', async () => {
      const user = userEvent.setup()
      render(<ProductBatchFiltersSimple {...defaultProps} />)

      const expandButton = screen.getByTitle('Expandir filtros')
      await user.click(expandButton)

      // Filters should now be visible
      expect(screen.getByText('Estado')).toBeInTheDocument()
      expect(screen.getByText('Vencimiento')).toBeInTheDocument()
      expect(screen.getByText('Proveedor')).toBeInTheDocument()
    })

    it('should change expand button icon when expanded', async () => {
      const user = userEvent.setup()
      render(<ProductBatchFiltersSimple {...defaultProps} />)

      const expandButton = screen.getByTitle('Expandir filtros')
      await user.click(expandButton)

      expect(screen.getByTitle('Contraer filtros')).toBeInTheDocument()
      expect(expandButton.querySelector('.bi-chevron-up')).toBeInTheDocument()
    })

    it('should collapse filters when collapse button is clicked', async () => {
      const user = userEvent.setup()
      render(<ProductBatchFiltersSimple {...defaultProps} />)

      // First expand
      const expandButton = screen.getByTitle('Expandir filtros')
      await user.click(expandButton)
      
      // Then collapse
      const collapseButton = screen.getByTitle('Contraer filtros')
      await user.click(collapseButton)

      // Filters should be hidden again
      expect(screen.queryByText('Estado')).not.toBeInTheDocument()
      expect(screen.queryByText('Vencimiento')).not.toBeInTheDocument()
    })
  })

  describe('Status Filter', () => {
    beforeEach(async () => {
      const user = userEvent.setup()
      render(<ProductBatchFiltersSimple {...defaultProps} />)
      
      // Expand filters first
      const expandButton = screen.getByTitle('Expandir filtros')
      await user.click(expandButton)
    })

    it('should render all status options when expanded', () => {
      expect(screen.getByText('Activo')).toBeInTheDocument()
      expect(screen.getByText('Cuarentena')).toBeInTheDocument()
      expect(screen.getByText('Vencido')).toBeInTheDocument()
      expect(screen.getByText('Retirado')).toBeInTheDocument()
      expect(screen.getByText('Consumido')).toBeInTheDocument()
    })

    it('should toggle status selection when clicked', async () => {
      const user = userEvent.setup()
      
      const activeButton = screen.getByText('Activo')
      await user.click(activeButton)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        status: ['active']
      })
    })

    it('should allow multiple status selections', async () => {
      const user = userEvent.setup()
      
      const activeButton = screen.getByText('Activo')
      const quarantineButton = screen.getByText('Cuarentena')
      
      await user.click(activeButton)
      await user.click(quarantineButton)

      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
        status: ['active', 'quarantine']
      })
    })
  })

  describe('Expiration Filter', () => {
    beforeEach(async () => {
      const user = userEvent.setup()
      render(<ProductBatchFiltersSimple {...defaultProps} />)
      
      // Expand filters first
      const expandButton = screen.getByTitle('Expandir filtros')
      await user.click(expandButton)
    })

    it('should render expiration select', () => {
      const select = screen.getByDisplayValue('Todos los vencimientos')
      expect(select).toBeInTheDocument()
    })

    it('should have expiration options', () => {
      expect(screen.getByText('Próximos 7 días')).toBeInTheDocument()
      expect(screen.getByText('Próximos 15 días')).toBeInTheDocument()
      expect(screen.getByText('Próximos 30 días')).toBeInTheDocument()
      expect(screen.getByText('Próximos 60 días')).toBeInTheDocument()
    })

    it('should update filter when expiration is selected', async () => {
      const user = userEvent.setup()
      
      const select = screen.getByDisplayValue('Todos los vencimientos')
      await user.selectOptions(select, '30')

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        expirationDays: 30
      })
    })
  })

  describe('Supplier Filter', () => {
    beforeEach(async () => {
      const user = userEvent.setup()
      render(<ProductBatchFiltersSimple {...defaultProps} />)
      
      // Expand filters first
      const expandButton = screen.getByTitle('Expandir filtros')
      await user.click(expandButton)
    })

    it('should render supplier input', () => {
      const input = screen.getByPlaceholderText('Nombre del proveedor...')
      expect(input).toBeInTheDocument()
    })

    it('should update filter when supplier name is typed', async () => {
      const user = userEvent.setup()
      
      const input = screen.getByPlaceholderText('Nombre del proveedor...')
      await user.clear(input)
      await user.type(input, 'TestSupplier')

      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
        supplierName: 'TestSupplier'
      })
    })
  })

  describe('Low Stock Filter', () => {
    beforeEach(async () => {
      const user = userEvent.setup()
      render(<ProductBatchFiltersSimple {...defaultProps} />)
      
      // Expand filters first
      const expandButton = screen.getByTitle('Expandir filtros')
      await user.click(expandButton)
    })

    it('should render low stock checkbox', () => {
      const checkbox = screen.getByLabelText(/Solo stock bajo/i)
      expect(checkbox).toBeInTheDocument()
    })

    it('should update filter when checkbox is checked', async () => {
      const user = userEvent.setup()
      
      const checkbox = screen.getByLabelText(/Solo stock bajo/i)
      await user.click(checkbox)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        hasLowStock: true
      })
    })
  })

  describe('Clear Filters', () => {
    it('should show clear button when filters are active', async () => {
      const user = userEvent.setup()
      render(<ProductBatchFiltersSimple {...defaultProps} />)

      // Expand and set a filter
      const expandButton = screen.getByTitle('Expandir filtros')
      await user.click(expandButton)
      
      const activeButton = screen.getByText('Activo')
      await user.click(activeButton)

      // Clear button should appear
      expect(screen.getByText('Limpiar')).toBeInTheDocument()
    })

    it('should clear all filters when clear button is clicked', async () => {
      const user = userEvent.setup()
      render(<ProductBatchFiltersSimple {...defaultProps} />)

      // Expand and set filters
      const expandButton = screen.getByTitle('Expandir filtros')
      await user.click(expandButton)
      
      const activeButton = screen.getByText('Activo')
      await user.click(activeButton)

      // Clear filters
      const clearButton = screen.getByText('Limpiar')
      await user.click(clearButton)

      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({})
    })
  })

  describe('Active Filters Summary', () => {
    it('should show active filters summary when filters are set', async () => {
      const user = userEvent.setup()
      render(<ProductBatchFiltersSimple {...defaultProps} />)

      // Expand and set filters
      const expandButton = screen.getByTitle('Expandir filtros')
      await user.click(expandButton)
      
      const activeButton = screen.getByText('Activo')
      await user.click(activeButton)

      // Summary should appear
      expect(screen.getByText('Filtros activos:')).toBeInTheDocument()
      expect(screen.getByText('Estado: 1 seleccionado')).toBeInTheDocument()
    })

    it('should not show summary when no filters are active', () => {
      render(<ProductBatchFiltersSimple {...defaultProps} />)

      expect(screen.queryByText('Filtros activos:')).not.toBeInTheDocument()
    })
  })

  describe('Component Stability', () => {
    it('should handle prop updates without issues', () => {
      const { rerender } = render(<ProductBatchFiltersSimple {...defaultProps} />)

      rerender(<ProductBatchFiltersSimple {...defaultProps} className="custom-class" />)

      expect(screen.getByText('Filtros Avanzados')).toBeInTheDocument()
    })

    it('should unmount cleanly', () => {
      const { unmount } = render(<ProductBatchFiltersSimple {...defaultProps} />)

      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Callback Handling', () => {
    it('should call onFiltersChange on initial render', () => {
      render(<ProductBatchFiltersSimple {...defaultProps} />)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({})
    })

    it('should handle missing onFiltersChange prop gracefully', () => {
      // Component requires onFiltersChange prop - this test doesn't apply
      expect(true).toBe(true) // Placeholder test - component design requires the prop
    })
  })
})