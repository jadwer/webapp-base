import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '@/lib/axiosClient'
import { productBulkService } from '../../services/productService'

vi.mock('@/lib/axiosClient')

describe('productBulkService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('bulkToggleActive', () => {
    it('should send product_ids and is_active to bulk-toggle-active endpoint', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: { message: 'Productos actualizados', affected_count: 3 }
      })

      const result = await productBulkService.bulkToggleActive([1, 2, 3], false)

      expect(axios.post).toHaveBeenCalledWith('/api/v1/products/bulk-toggle-active', {
        product_ids: [1, 2, 3],
        is_active: false
      })
      expect(result.affected_count).toBe(3)
    })
  })

  describe('bulkToggleByBrand', () => {
    it('should send brand_id and is_active', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: { message: 'Productos actualizados', affected_count: 5 }
      })

      const result = await productBulkService.bulkToggleByBrand(1, true)

      expect(axios.post).toHaveBeenCalledWith('/api/v1/products/bulk-toggle-by-brand', {
        brand_id: 1,
        is_active: true
      })
      expect(result.affected_count).toBe(5)
    })
  })

  describe('bulkToggleByCategory', () => {
    it('should send category_id and is_active', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: { message: 'Productos actualizados', affected_count: 2 }
      })

      const result = await productBulkService.bulkToggleByCategory(4, false)

      expect(axios.post).toHaveBeenCalledWith('/api/v1/products/bulk-toggle-by-category', {
        category_id: 4,
        is_active: false
      })
      expect(result.affected_count).toBe(2)
    })
  })

  describe('bulkPriceUpdate', () => {
    it('should send brand_id, percentage and operation for increase', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: { message: 'Precios actualizados', affected_count: 10, operation: 'increase', percentage: 5.5 }
      })

      const result = await productBulkService.bulkPriceUpdate(1, 5.5, 'increase')

      expect(axios.post).toHaveBeenCalledWith('/api/v1/products/bulk-price-update', {
        brand_id: 1,
        percentage: 5.5,
        operation: 'increase'
      })
      expect(result.affected_count).toBe(10)
      expect(result.operation).toBe('increase')
      expect(result.percentage).toBe(5.5)
    })

    it('should send decrease operation', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: { message: 'Precios actualizados', affected_count: 3, operation: 'decrease', percentage: 10 }
      })

      const result = await productBulkService.bulkPriceUpdate(2, 10, 'decrease')

      expect(axios.post).toHaveBeenCalledWith('/api/v1/products/bulk-price-update', {
        brand_id: 2,
        percentage: 10,
        operation: 'decrease'
      })
      expect(result.operation).toBe('decrease')
    })
  })
})
