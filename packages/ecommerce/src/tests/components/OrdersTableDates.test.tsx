import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { OrdersTable } from '../../components/OrdersTable'
import type { EcommerceOrder } from '../../types'

describe('OrdersTable fechas', () => {
  it('muestra orderDate sin correrla un dia (ISO medianoche)', () => {
    const order = {
      id: '1',
      orderNumber: 'OV-1',
      orderDate: '2026-10-25T00:00:00.000000Z',
      status: 'pending',
      paymentStatus: 'pending',
      totalAmount: 100,
    } as unknown as EcommerceOrder
    const { container } = render(
      <OrdersTable orders={[order]} onView={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />
    )
    expect(container.textContent).toContain('25 oct 2026')
    expect(container.textContent).not.toContain('24 oct 2026')
  })
})
