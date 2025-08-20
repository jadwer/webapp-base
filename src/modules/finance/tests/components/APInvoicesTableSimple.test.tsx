// APInvoicesTableSimple Component Tests
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { APInvoicesTableSimple } from '../../components/APInvoicesTableSimple'
import { createMockAPInvoice, setupCommonMocks } from '../utils/test-utils'

describe('APInvoicesTableSimple', () => {
  beforeEach(() => {
    setupCommonMocks()
    vi.clearAllMocks()
  })

  it('should render loading state correctly', () => {
    // Act
    render(<APInvoicesTableSimple isLoading={true} />)

    // Assert
    expect(screen.getByText('Cargando facturas...')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should render empty state when no invoices', () => {
    // Act
    render(<APInvoicesTableSimple apInvoices={[]} isLoading={false} />)

    // Assert
    expect(screen.getByText('No hay facturas')).toBeInTheDocument()
    expect(screen.getByText('No se encontraron facturas de proveedores para mostrar.')).toBeInTheDocument()
  })

  it('should render invoices table with data', () => {
    // Arrange
    const mockInvoices = [
      createMockAPInvoice({
        id: '1',
        invoiceNumber: 'FACT-001',
        status: 'draft',
        total: 1160.00,
        remainingBalance: 1160.00,
      }),
      createMockAPInvoice({
        id: '2',
        invoiceNumber: 'FACT-002',
        status: 'posted',
        total: 2000.00,
        remainingBalance: 2000.00,
      }),
    ]

    // Act
    render(<APInvoicesTableSimple apInvoices={mockInvoices} isLoading={false} />)

    // Assert
    expect(screen.getByText('FACT-001')).toBeInTheDocument()
    expect(screen.getByText('FACT-002')).toBeInTheDocument()
    expect(screen.getByText('Borrador')).toBeInTheDocument()
    expect(screen.getByText('Contabilizada')).toBeInTheDocument()
  })

  it('should display correct status badges', () => {
    // Arrange
    const mockInvoices = [
      createMockAPInvoice({ id: '1', status: 'draft' }),
      createMockAPInvoice({ id: '2', status: 'posted' }),
      createMockAPInvoice({ id: '3', status: 'paid' }),
    ]

    // Act
    render(<APInvoicesTableSimple apInvoices={mockInvoices} isLoading={false} />)

    // Assert
    expect(screen.getByText('Borrador')).toBeInTheDocument()
    expect(screen.getByText('Contabilizada')).toBeInTheDocument()
    expect(screen.getByText('Pagada')).toBeInTheDocument()
  })

  it('should format currency correctly', () => {
    // Arrange
    const mockInvoices = [
      createMockAPInvoice({
        id: '1',
        total: 1234.56,
        remainingBalance: 1234.56,
      }),
    ]

    // Act
    render(<APInvoicesTableSimple apInvoices={mockInvoices} isLoading={false} />)

    // Assert
    expect(screen.getByText('$1,234.56')).toBeInTheDocument()
  })

  it('should show overdue badge for past due invoices', () => {
    // Arrange
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 5)
    
    const mockInvoices = [
      createMockAPInvoice({
        id: '1',
        dueDate: pastDate.toISOString().split('T')[0],
        status: 'posted',
      }),
    ]

    // Act
    render(<APInvoicesTableSimple apInvoices={mockInvoices} isLoading={false} />)

    // Assert
    expect(screen.getByText('Vencida')).toBeInTheDocument()
  })

  it('should show due soon badge for invoices due within 7 days', () => {
    // Arrange
    const soonDate = new Date()
    soonDate.setDate(soonDate.getDate() + 3)
    
    const mockInvoices = [
      createMockAPInvoice({
        id: '1',
        dueDate: soonDate.toISOString().split('T')[0],
        status: 'posted',
      }),
    ]

    // Act
    render(<APInvoicesTableSimple apInvoices={mockInvoices} isLoading={false} />)

    // Assert
    expect(screen.getByText('Por vencer')).toBeInTheDocument()
  })

  it('should call onView when view button is clicked', () => {
    // Arrange
    const mockOnView = vi.fn()
    const mockInvoices = [createMockAPInvoice({ id: '1' })]

    // Act
    render(
      <APInvoicesTableSimple 
        apInvoices={mockInvoices} 
        isLoading={false} 
        onView={mockOnView}
      />
    )

    const viewButton = screen.getByTitle('Ver factura')
    fireEvent.click(viewButton)

    // Assert
    expect(mockOnView).toHaveBeenCalledWith('1')
  })

  it('should call onEdit when edit button is clicked for draft invoices', () => {
    // Arrange
    const mockOnEdit = vi.fn()
    const mockInvoices = [createMockAPInvoice({ id: '1', status: 'draft' })]

    // Act
    render(
      <APInvoicesTableSimple 
        apInvoices={mockInvoices} 
        isLoading={false} 
        onEdit={mockOnEdit}
      />
    )

    const editButton = screen.getByTitle('Editar factura')
    fireEvent.click(editButton)

    // Assert
    expect(mockOnEdit).toHaveBeenCalledWith('1')
  })

  it('should not show edit button for posted invoices', () => {
    // Arrange
    const mockOnEdit = vi.fn()
    const mockInvoices = [createMockAPInvoice({ id: '1', status: 'posted' })]

    // Act
    render(
      <APInvoicesTableSimple 
        apInvoices={mockInvoices} 
        isLoading={false} 
        onEdit={mockOnEdit}
      />
    )

    // Assert
    expect(screen.queryByTitle('Editar factura')).not.toBeInTheDocument()
  })

  it('should show pay button for posted invoices with remaining balance', () => {
    // Arrange
    const mockInvoices = [
      createMockAPInvoice({
        id: '1',
        status: 'posted',
        remainingBalance: 1000.00,
      }),
    ]

    // Act
    render(<APInvoicesTableSimple apInvoices={mockInvoices} isLoading={false} />)

    // Assert
    expect(screen.getByTitle('Pagar factura')).toBeInTheDocument()
  })

  it('should not show pay button for paid invoices', () => {
    // Arrange
    const mockInvoices = [
      createMockAPInvoice({
        id: '1',
        status: 'paid',
        remainingBalance: 0.00,
      }),
    ]

    // Act
    render(<APInvoicesTableSimple apInvoices={mockInvoices} isLoading={false} />)

    // Assert
    expect(screen.queryByTitle('Pagar factura')).not.toBeInTheDocument()
  })

  it('should format dates correctly', () => {
    // Arrange
    const mockInvoices = [
      createMockAPInvoice({
        id: '1',
        invoiceDate: '2025-08-20',
        dueDate: '2025-09-20',
      }),
    ]

    // Act
    render(<APInvoicesTableSimple apInvoices={mockInvoices} isLoading={false} />)

    // Assert
    // Check that dates are formatted (Spanish locale format)
    expect(screen.getByText('20/8/2025')).toBeInTheDocument()
    expect(screen.getByText('20/9/2025')).toBeInTheDocument()
  })

  it('should handle invalid dates gracefully', () => {
    // Arrange
    const mockInvoices = [
      createMockAPInvoice({
        id: '1',
        invoiceDate: '',
        dueDate: 'invalid-date',
      }),
    ]

    // Act
    render(<APInvoicesTableSimple apInvoices={mockInvoices} isLoading={false} />)

    // Assert
    expect(screen.getAllByText('-')).toHaveLength(2)
  })
})