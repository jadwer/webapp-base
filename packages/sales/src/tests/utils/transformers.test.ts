/**
 * Tests for transformSalesOrderFormToJsonApi
 *
 * Regresion bug E2E: el PATCH/POST de sales-orders enviaba attributes en
 * snake_case (contact_id, order_number, ...) y el backend SalesOrderSchema
 * espera camelCase (contactId, orderNumber, ...), provocando 400 en cada edicion.
 */

import { describe, it, expect } from 'vitest'
import { transformSalesOrderFormToJsonApi, transformJsonApiSalesOrderItem } from '../../utils/transformers'
import { mockSalesOrderFormData } from './test-utils'

describe('transformSalesOrderFormToJsonApi', () => {
  it('emits camelCase attributes matching the backend SalesOrderSchema', () => {
    const formData = mockSalesOrderFormData({
      contactId: 7,
      orderNumber: 'SO-2026-042',
      orderDate: '2026-07-01',
      status: 'confirmed',
      notes: 'Entrega parcial',
    })

    const payload = transformSalesOrderFormToJsonApi(formData) as {
      data: { type: string; attributes: Record<string, unknown> }
    }

    expect(payload.data.type).toBe('sales-orders')
    expect(payload.data.attributes).toMatchObject({
      contactId: 7,
      orderNumber: 'SO-2026-042',
      orderDate: '2026-07-01',
      status: 'confirmed',
      notes: 'Entrega parcial',
    })
  })

  it('never emits snake_case attribute keys', () => {
    const payload = transformSalesOrderFormToJsonApi(mockSalesOrderFormData()) as {
      data: { attributes: Record<string, unknown> }
    }

    const keys = Object.keys(payload.data.attributes)
    const snakeCaseKeys = keys.filter(key => key.includes('_'))
    expect(snakeCaseKeys).toEqual([])
    expect(payload.data.attributes).not.toHaveProperty('contact_id')
    expect(payload.data.attributes).not.toHaveProperty('order_number')
    expect(payload.data.attributes).not.toHaveProperty('order_date')
    expect(payload.data.attributes).not.toHaveProperty('approved_at')
    expect(payload.data.attributes).not.toHaveProperty('delivered_at')
    expect(payload.data.attributes).not.toHaveProperty('invoicing_notes')
  })

  it('includes the resource id on update payloads', () => {
    const payload = transformSalesOrderFormToJsonApi(
      mockSalesOrderFormData(),
      'sales-orders',
      '15'
    ) as { data: { id?: string; attributes: Record<string, unknown> } }

    expect(payload.data.id).toBe('15')
    expect(payload.data.attributes.contactId).toBe(1)
  })

  it('keeps the contact relationship pointing to the selected contact', () => {
    const payload = transformSalesOrderFormToJsonApi(
      mockSalesOrderFormData({ contactId: 9 })
    ) as {
      data: { relationships: { contact: { data: { type: string; id: string } } } }
    }

    expect(payload.data.relationships.contact.data).toEqual({
      type: 'contacts',
      id: '9',
    })
  })

  it('manda currency e invoicingNotes solo con las llaves del Schema', () => {
    const payload = transformSalesOrderFormToJsonApi(
      mockSalesOrderFormData({ currency: 'usd', invoicingNotes: 'Facturar a fin de mes' })
    ) as { data: { attributes: Record<string, unknown> } }

    expect(payload.data.attributes.currency).toBe('USD')
    expect(payload.data.attributes.invoicingNotes).toBe('Facturar a fin de mes')
    expect(payload.data.attributes).not.toHaveProperty('subtotal')

    const sinMoneda = transformSalesOrderFormToJsonApi(mockSalesOrderFormData()) as {
      data: { attributes: Record<string, unknown> }
    }
    expect(sinMoneda.data.attributes).not.toHaveProperty('currency')
  })
})

describe('transformJsonApiSalesOrderItem', () => {
  it('no expone campos de facturacion que la API ya no tiene', () => {
    const item = transformJsonApiSalesOrderItem({
      id: '3',
      type: 'sales-order-items',
      attributes: { salesOrderId: 1, productId: 2, quantity: 2, unitPrice: 50, discount: 0, total: 100 },
    })

    expect(item.total).toBe(100)
    expect(item).not.toHaveProperty('arInvoiceLineId')
    expect(item).not.toHaveProperty('invoicedQuantity')
    expect(item).not.toHaveProperty('invoicedAmount')
  })
})
