import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { PurchaseOrdersTable } from '../../components/PurchaseOrdersTable'
import type { PurchaseOrder } from '../../types'

describe('PurchaseOrdersTable fechas', () => {
  it('muestra la fecha de la orden sin correrla un dia (ISO medianoche)', () => {
    const order = {
      id: '1',
      orderNumber: 'OC-1',
      orderDate: '2026-10-25T00:00:00.000000Z',
      status: 'pending',
      totalAmount: 100,
    } as unknown as PurchaseOrder
    const { container } = render(<PurchaseOrdersTable purchaseOrders={[order]} />)
    expect(container.textContent).toContain('25 oct 2026')
    expect(container.textContent).not.toContain('24 oct 2026')
  })
})
