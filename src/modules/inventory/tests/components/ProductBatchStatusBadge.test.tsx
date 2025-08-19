/**
 * ProductBatchStatusBadge Component Tests
 * 
 * Tests for the status badge component with different variants
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductBatchStatusBadge } from '../../components/ProductBatchStatusBadge'
import type { ProductBatchStatus } from '../../types'

describe('ProductBatchStatusBadge', () => {
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
        render(<ProductBatchStatusBadge status="active" />)
      }).not.toThrow()
    })

    it('should render as a badge element', () => {
      render(<ProductBatchStatusBadge status="active" />)

      const badge = screen.getByRole('status')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('badge')
    })
  })

  describe('Active Status', () => {
    it('should display correct text for active status', () => {
      render(<ProductBatchStatusBadge status="active" />)

      expect(screen.getByText('Activo')).toBeInTheDocument()
    })

    it('should have correct CSS class for active status', () => {
      render(<ProductBatchStatusBadge status="active" />)

      const badge = screen.getByRole('status')
      expect(badge).toHaveClass('bg-success')
    })
  })

  describe('Quarantine Status', () => {
    it('should display correct text for quarantine status', () => {
      render(<ProductBatchStatusBadge status="quarantine" />)

      expect(screen.getByText('Cuarentena')).toBeInTheDocument()
    })

    it('should have correct CSS class for quarantine status', () => {
      render(<ProductBatchStatusBadge status="quarantine" />)

      const badge = screen.getByRole('status')
      expect(badge).toHaveClass('bg-warning')
    })
  })

  describe('Expired Status', () => {
    it('should display correct text for expired status', () => {
      render(<ProductBatchStatusBadge status="expired" />)

      expect(screen.getByText('Vencido')).toBeInTheDocument()
    })

    it('should have correct CSS class for expired status', () => {
      render(<ProductBatchStatusBadge status="expired" />)

      const badge = screen.getByRole('status')
      expect(badge).toHaveClass('bg-danger')
    })
  })

  describe('Recalled Status', () => {
    it('should display correct text for recalled status', () => {
      render(<ProductBatchStatusBadge status="recalled" />)

      expect(screen.getByText('Retirado')).toBeInTheDocument()
    })

    it('should have correct CSS class for recalled status', () => {
      render(<ProductBatchStatusBadge status="recalled" />)

      const badge = screen.getByRole('status')
      expect(badge).toHaveClass('bg-danger')
    })
  })

  describe('Consumed Status', () => {
    it('should display correct text for consumed status', () => {
      render(<ProductBatchStatusBadge status="consumed" />)

      expect(screen.getByText('Consumido')).toBeInTheDocument()
    })

    it('should have correct CSS class for consumed status', () => {
      render(<ProductBatchStatusBadge status="consumed" />)

      const badge = screen.getByRole('status')
      expect(badge).toHaveClass('bg-secondary')
    })
  })

  describe('All Status Types', () => {
    const statusTests: Array<{
      status: ProductBatchStatus
      expectedText: string
      expectedClass: string
    }> = [
      { status: 'active', expectedText: 'Activo', expectedClass: 'bg-success' },
      { status: 'quarantine', expectedText: 'Cuarentena', expectedClass: 'bg-warning' },
      { status: 'expired', expectedText: 'Vencido', expectedClass: 'bg-danger' },
      { status: 'recalled', expectedText: 'Retirado', expectedClass: 'bg-danger' },
      { status: 'consumed', expectedText: 'Consumido', expectedClass: 'bg-secondary' }
    ]

    statusTests.forEach(({ status, expectedText, expectedClass }) => {
      it(`should render ${status} status correctly`, () => {
        render(<ProductBatchStatusBadge status={status} />)

        expect(screen.getByText(expectedText)).toBeInTheDocument()
        
        const badge = screen.getByRole('status')
        expect(badge).toHaveClass(expectedClass)
      })
    })
  })

  describe('Additional Props', () => {
    it('should accept additional CSS classes', () => {
      render(<ProductBatchStatusBadge status="active" className="custom-class" />)

      const badge = screen.getByRole('status')
      expect(badge).toHaveClass('custom-class')
      expect(badge).toHaveClass('badge')
      expect(badge).toHaveClass('bg-success')
    })

    it('should accept custom styles', () => {
      const customStyle = { fontSize: '14px', margin: '5px' }
      render(<ProductBatchStatusBadge status="active" style={customStyle} />)

      const badge = screen.getByRole('status')
      expect(badge).toHaveStyle('font-size: 14px')
      expect(badge).toHaveStyle('margin: 5px')
    })

    it('should pass through additional HTML attributes', () => {
      render(<ProductBatchStatusBadge status="active" data-testid="custom-badge" title="Status badge" />)

      const badge = screen.getByTestId('custom-badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveAttribute('title', 'Status badge')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA role', () => {
      render(<ProductBatchStatusBadge status="active" />)

      const badge = screen.getByRole('status')
      expect(badge).toBeInTheDocument()
    })

    it('should have accessible text content', () => {
      render(<ProductBatchStatusBadge status="quarantine" />)

      const badge = screen.getByRole('status')
      expect(badge).toHaveAccessibleName()
      expect(badge).toHaveTextContent('Cuarentena')
    })

    it('should be readable by screen readers', () => {
      render(<ProductBatchStatusBadge status="expired" />)

      const badge = screen.getByRole('status')
      expect(badge).toHaveAttribute('role', 'status')
    })
  })

  describe('Component Stability', () => {
    it('should handle prop changes without issues', () => {
      const { rerender } = render(<ProductBatchStatusBadge status="active" />)

      expect(screen.getByText('Activo')).toBeInTheDocument()

      rerender(<ProductBatchStatusBadge status="expired" />)

      expect(screen.getByText('Vencido')).toBeInTheDocument()
      expect(screen.queryByText('Activo')).not.toBeInTheDocument()
    })

    it('should unmount cleanly', () => {
      const { unmount } = render(<ProductBatchStatusBadge status="active" />)

      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Visual Consistency', () => {
    it('should maintain consistent badge structure across all statuses', () => {
      const statuses: ProductBatchStatus[] = ['active', 'quarantine', 'expired', 'recalled', 'consumed']

      statuses.forEach(status => {
        const { unmount } = render(<ProductBatchStatusBadge status={status} />)

        const badge = screen.getByRole('status')
        expect(badge).toHaveClass('badge')
        
        unmount()
      })
    })

    it('should use Bootstrap badge classes consistently', () => {
      const statusClassMap = {
        active: 'bg-success',
        quarantine: 'bg-warning', 
        expired: 'bg-danger',
        recalled: 'bg-danger',
        consumed: 'bg-secondary'
      }

      Object.entries(statusClassMap).forEach(([status, expectedClass]) => {
        const { unmount } = render(<ProductBatchStatusBadge status={status as ProductBatchStatus} />)

        const badge = screen.getByRole('status')
        expect(badge).toHaveClass(expectedClass)
        
        unmount()
      })
    })
  })

  describe('TypeScript Compliance', () => {
    it('should only accept valid ProductBatchStatus values', () => {
      // This test ensures TypeScript compliance at compile time
      const validStatuses: ProductBatchStatus[] = ['active', 'quarantine', 'expired', 'recalled', 'consumed']
      
      validStatuses.forEach(status => {
        expect(() => {
          render(<ProductBatchStatusBadge status={status} />)
        }).not.toThrow()
      })
    })
  })

  describe('Performance', () => {
    it('should render quickly with minimal DOM operations', () => {
      const startTime = performance.now()
      
      render(<ProductBatchStatusBadge status="active" />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render in less than 10ms (generous threshold for test environment)
      expect(renderTime).toBeLessThan(10)
    })

    it('should not cause memory leaks on repeated renders', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0

      // Render and unmount multiple times
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(<ProductBatchStatusBadge status="active" />)
        unmount()
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      
      // Memory usage should not increase significantly (only if performance.memory is available)
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory
        expect(memoryIncrease).toBeLessThan(1024 * 1024) // Less than 1MB increase
      }
    })
  })
})