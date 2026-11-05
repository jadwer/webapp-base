/**
 * SUPPLIER INVOICE MODAL TESTS
 * Captura de la factura del proveedor sobre la CxP: IVA sugerido al 16 %,
 * payload al servicio y error del backend mostrado con detalle.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SupplierInvoiceModal } from '../../components/SupplierInvoiceModal'
import { apInvoicesService } from '../../services'
import type { APInvoice } from '../../types'

vi.mock('../../services', () => ({
  apInvoicesService: { captureSupplierInvoice: vi.fn() },
}))

const invoice = { id: '7', invoiceNumber: 'AP-7', subtotal: 1000, totalAmount: 1000, paidAmount: 0 } as unknown as APInvoice

describe('SupplierInvoiceModal', () => {
  const onClose = vi.fn()
  const onSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('suggests 16 % IVA over the received subtotal', () => {
    render(<SupplierInvoiceModal isOpen apInvoice={invoice} onClose={onClose} onSuccess={onSuccess} />)

    expect((screen.getByLabelText(/IVA de la factura/i) as HTMLInputElement).value).toBe('160.00')
    expect(screen.getByText(/Total de la factura: .*1,160\.00/)).toBeInTheDocument()
  })

  it('sends the supplier invoice and reports success', async () => {
    vi.mocked(apInvoicesService.captureSupplierInvoice).mockResolvedValue({ id: 7, subtotal: 1000, taxAmount: 160, totalAmount: 1160 })
    render(<SupplierInvoiceModal isOpen apInvoice={invoice} onClose={onClose} onSuccess={onSuccess} />)

    fireEvent.change(screen.getByLabelText(/Folio de la factura/i), { target: { value: 'A-1234' } })
    fireEvent.submit(document.getElementById('supplier-invoice-form') as HTMLFormElement)

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(apInvoicesService.captureSupplierInvoice).toHaveBeenCalledWith('7', {
      supplierInvoiceNumber: 'A-1234', supplierUuid: undefined, subtotal: 1000, taxAmount: 160,
    })
  })

  it('shows the backend message when the subtotal does not match', async () => {
    vi.mocked(apInvoicesService.captureSupplierInvoice).mockRejectedValue({
      response: { status: 422, data: { error: 'El subtotal de la factura del proveedor ($1,010.00) no coincide con lo recibido ($1,000.00).' } },
    })
    render(<SupplierInvoiceModal isOpen apInvoice={invoice} onClose={onClose} onSuccess={onSuccess} />)

    fireEvent.change(screen.getByLabelText(/Folio de la factura/i), { target: { value: 'A-1' } })
    fireEvent.submit(document.getElementById('supplier-invoice-form') as HTMLFormElement)

    expect(await screen.findByRole('alert')).toHaveTextContent('no coincide con lo recibido')
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
