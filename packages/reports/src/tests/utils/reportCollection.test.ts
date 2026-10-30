/**
 * El API de reportes responde el index como coleccion con un solo recurso;
 * el transformador debe leer data[0] (24-10: "No hay datos" con datos reales).
 */
import { describe, it, expect } from 'vitest'
import { transformSalesByCustomerResponse, transformBalanceSheetResponse } from '../../utils/transformers'

describe('respuestas de reportes como colección', () => {
  it('lee el primer recurso de data', () => {
    const r = transformSalesByCustomerResponse({
      data: [{
        type: 'sales-by-customer-reports', id: '1',
        attributes: {
          startDate: '2026-01-01', endDate: '2026-10-24', currency: 'MXN',
          salesByCustomer: [{ customer_id: 1, customer_name: 'Comercial del Centro', total_orders: 1, total_amount: 26088.8 }],
          summary: { total_customers: 1, total_orders: 1, total_sales: 26088.8 },
        },
      }],
    })
    expect(r.data.salesByCustomer).toHaveLength(1)
    expect(r.data.startDate).toBe('2026-01-01')
  })

  it('sigue aceptando un recurso único', () => {
    const r = transformBalanceSheetResponse({
      data: { type: 'balance-sheets', id: '1', attributes: { asOfDate: '2026-10-24', currency: 'MXN', totalAssets: 10 } },
    })
    expect(r.data.totalAssets).toBe(10)
  })
})
