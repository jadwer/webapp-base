/**
 * My Orders Service Tests (Customer Portal)
 *
 * Regresion bug E2E: "Mis Pedidos" usaba el endpoint admin
 * sales-orders?filter[contact_email]= que devuelve 403 para customers
 * (requiere sales-orders.index). El portal debe usar /api/v1/my-orders,
 * que resuelve el contacto del usuario autenticado en el backend.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { axiosClient as axios } from '@lwm/auth'
import { myOrdersService } from '../../services'

// Mock axios client
vi.mock('@lwm/auth', async () => {
  const actual = await vi.importActual<typeof import('@lwm/auth')>('@lwm/auth')
  return {
    ...actual,
    axiosClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  }
})

// Respuesta real del CustomerOrderController@index: Eloquent snake_case, NO JSON:API
const mockMyOrdersIndexResponse = {
  data: [
    {
      id: 12,
      contact_id: 5,
      order_number: 'OV-2026-012',
      status: 'confirmed',
      order_date: '2026-07-01T00:00:00.000000Z',
      subtotal: 1000,
      tax_amount: 160,
      total_amount: 1160,
      created_at: '2026-07-01T10:00:00.000000Z',
      items: [
        { id: 1, product_id: 3, quantity: 2, unit_price: 500, total: 1000, product: { id: 3, name: 'Producto', sku: 'TEST-003' } },
      ],
    },
  ],
  meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
}

describe('myOrdersService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('calls the portal endpoint /api/v1/my-orders (not the admin sales-orders)', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockMyOrdersIndexResponse })

      const result = await myOrdersService.getAll()

      expect(axios.get).toHaveBeenCalledWith('/api/v1/my-orders')
      const calledUrl = vi.mocked(axios.get).mock.calls[0][0] as string
      expect(calledUrl).not.toContain('sales-orders')
      expect(calledUrl).not.toContain('filter[contact_email]')
      expect(result).toEqual(mockMyOrdersIndexResponse)
    })

    it('passes plain query params supported by the controller', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockMyOrdersIndexResponse })

      await myOrdersService.getAll({ status: 'confirmed', perPage: 5, page: 2 })

      const calledUrl = decodeURIComponent(vi.mocked(axios.get).mock.calls[0][0] as string)
      expect(calledUrl).toContain('/api/v1/my-orders?')
      expect(calledUrl).toContain('status=confirmed')
      expect(calledUrl).toContain('per_page=5')
      expect(calledUrl).toContain('page=2')
    })

    it('returns the plain Eloquent shape (snake_case, no JSON:API attributes)', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockMyOrdersIndexResponse })

      const result = await myOrdersService.getAll()

      const order = result.data[0]
      expect(order.order_number).toBe('OV-2026-012')
      expect(order.total_amount).toBe(1160)
      expect(Array.isArray(order.items)).toBe(true)
      expect(order.items[0].product.sku).toBe('TEST-003')
      expect(result.meta.total).toBe(1)
    })
  })

  describe('getById', () => {
    it('calls /api/v1/my-orders/{id} and returns the detail envelope', async () => {
      const detailResponse = {
        data: {
          order: mockMyOrdersIndexResponse.data[0],
          status_history: [],
          can_cancel: true,
          available_actions: ['cancel', 'download_invoice'],
        },
      }
      vi.mocked(axios.get).mockResolvedValue({ data: detailResponse })

      const result = await myOrdersService.getById('12')

      expect(axios.get).toHaveBeenCalledWith('/api/v1/my-orders/12')
      expect(result.data.order.order_number).toBe('OV-2026-012')
      expect(result.data.can_cancel).toBe(true)
    })
  })

  describe('cancel', () => {
    it('posts to /api/v1/my-orders/{id}/cancel', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { message: 'Order cancelled successfully' } })

      await myOrdersService.cancel('12')

      expect(axios.post).toHaveBeenCalledWith('/api/v1/my-orders/12/cancel')
    })
  })

  describe('requestReturn', () => {
    it('posts to /api/v1/my-orders/{id}/return with reason', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { message: 'ok' } })

      const payload = { reason: 'Producto danado', items: [] }
      await myOrdersService.requestReturn('12', payload)

      expect(axios.post).toHaveBeenCalledWith('/api/v1/my-orders/12/return', payload)
    })
  })
})
