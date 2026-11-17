/**
 * Editor de orden de compra (rediseno 2026-11-17): sin campo Estatus, validacion en
 * espanol antes de llamar a la API y total sin IVA.
 */
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const createWithItems = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }))
vi.mock('next/link', () => ({ default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }))
vi.mock('@lwm/auth', () => ({ BranchSelect: () => <div data-testid="branch" /> }))
vi.mock('@lwm/products', () => ({ ProductSearchSelect: () => <div data-testid="product-search" /> }))
vi.mock('../../hooks', () => ({
  usePurchaseContacts: () => ({ contacts: [{ id: '7', attributes: { name: 'Proveedor Uno' } }], isLoading: false }),
  usePurchaseOrderMutations: () => ({ createPurchaseOrderWithItems: createWithItems, updatePurchaseOrder: vi.fn() }),
  usePurchaseOrderItemMutations: () => ({ createPurchaseOrderItem: vi.fn(), updatePurchaseOrderItem: vi.fn(), deletePurchaseOrderItem: vi.fn() }),
}))

import { PurchaseOrderEditor } from '../../components/PurchaseOrderEditor'

describe('PurchaseOrderEditor', () => {
  beforeEach(() => createWithItems.mockReset())

  it('no ofrece el campo Estatus ni IVA', () => {
    render(<PurchaseOrderEditor />)
    expect(screen.getByRole('heading', { name: /Crear nueva orden de compra/ })).toBeTruthy()
    expect(screen.queryByLabelText(/Estatus/)).toBeNull()
    expect(screen.queryByText(/^IVA$/)).toBeNull()
    expect(screen.getByText('El IVA se registra con la factura del proveedor.')).toBeTruthy()
  })

  it('valida proveedor y productos en espanol sin llamar a la API', () => {
    render(<PurchaseOrderEditor />)
    fireEvent.click(screen.getByRole('button', { name: 'Crear orden' }))
    expect(screen.getByText('Elige el proveedor.')).toBeTruthy()
    expect(screen.getByText('Agrega al menos un producto.')).toBeTruthy()
    expect(createWithItems).not.toHaveBeenCalled()
  })

  it('una orden recibida ya no se edita', () => {
    render(<PurchaseOrderEditor purchaseOrder={{ id: '5', orderNumber: 'OC-5', status: 'received', contactId: 7, orderDate: '2026-11-17', totalAmount: 10, notes: null, apInvoiceId: null, invoicingStatus: null, invoicingNotes: null, createdAt: '', updatedAt: '' }} />)
    expect(screen.getByText(/ya no cambia sus datos ni sus partidas/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).toBeNull()
  })
})
