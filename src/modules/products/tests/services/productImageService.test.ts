import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '@/lib/axiosClient'
import { productImageService } from '../../services/productImageService'

vi.mock('@/lib/axiosClient')

function mockJsonApiImage(id: string, attrs: Record<string, unknown> = {}) {
  return {
    type: 'product-images',
    id,
    attributes: {
      filePath: `products/img-${id}.webp`,
      imageUrl: `http://localhost:8000/storage/products/img-${id}.webp`,
      altText: null,
      sortOrder: 0,
      isPrimary: false,
      createdAt: '2026-02-11T00:00:00Z',
      updatedAt: '2026-02-11T00:00:00Z',
      ...attrs,
    },
  }
}

describe('productImageService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getByProduct', () => {
    it('should fetch images filtered by product_id', async () => {
      const images = [mockJsonApiImage('1', { sortOrder: 0 }), mockJsonApiImage('2', { sortOrder: 1 })]
      vi.mocked(axios.get).mockResolvedValue({ data: { data: images } })

      const result = await productImageService.getByProduct('10')

      expect(axios.get).toHaveBeenCalledWith('/api/v1/product-images', {
        params: { 'filter[product_id]': '10', sort: 'sortOrder' },
      })
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('1')
      expect(result[0].filePath).toBe('products/img-1.webp')
    })

    it('should return empty array when no data', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: { data: null } })

      const result = await productImageService.getByProduct('99')

      expect(result).toEqual([])
    })
  })

  describe('create', () => {
    it('should send JSON:API payload with product relationship', async () => {
      const created = mockJsonApiImage('3', { isPrimary: true })
      vi.mocked(axios.post).mockResolvedValue({ data: { data: created } })

      const result = await productImageService.create({
        filePath: 'products/new.webp',
        productId: '5',
        sortOrder: 2,
      })

      expect(axios.post).toHaveBeenCalledWith('/api/v1/product-images', {
        data: {
          type: 'product-images',
          attributes: {
            filePath: 'products/new.webp',
            sortOrder: 2,
          },
          relationships: {
            product: { data: { type: 'products', id: '5' } },
          },
        },
      })
      expect(result.id).toBe('3')
    })
  })

  describe('update', () => {
    it('should send PATCH with updated attributes', async () => {
      const updated = mockJsonApiImage('1', { altText: 'Updated alt' })
      vi.mocked(axios.patch).mockResolvedValue({ data: { data: updated } })

      const result = await productImageService.update('1', { altText: 'Updated alt' })

      expect(axios.patch).toHaveBeenCalledWith('/api/v1/product-images/1', {
        data: {
          type: 'product-images',
          id: '1',
          attributes: { altText: 'Updated alt' },
        },
      })
      expect(result.altText).toBe('Updated alt')
    })
  })

  describe('delete', () => {
    it('should send DELETE request', async () => {
      vi.mocked(axios.delete).mockResolvedValue({})

      await productImageService.delete('7')

      expect(axios.delete).toHaveBeenCalledWith('/api/v1/product-images/7')
    })
  })

  describe('reorder', () => {
    it('should send image_ids as numbers', async () => {
      vi.mocked(axios.post).mockResolvedValue({})

      await productImageService.reorder(['3', '1', '2'])

      expect(axios.post).toHaveBeenCalledWith('/api/v1/product-images/reorder', {
        image_ids: [3, 1, 2],
      })
    })
  })

  describe('setPrimary', () => {
    it('should POST to set-primary endpoint and return transformed image', async () => {
      const primary = mockJsonApiImage('2', { isPrimary: true })
      vi.mocked(axios.post).mockResolvedValue({ data: { data: primary } })

      const result = await productImageService.setPrimary('2')

      expect(axios.post).toHaveBeenCalledWith('/api/v1/product-images/2/set-primary')
      expect(result.isPrimary).toBe(true)
    })
  })

  describe('transform handles snake_case fallback', () => {
    it('should use camelCase attributes when available', async () => {
      const image = {
        type: 'product-images',
        id: '1',
        attributes: {
          filePath: 'products/test.webp',
          imageUrl: 'http://localhost:8000/storage/products/test.webp',
          altText: 'Test',
          sortOrder: 3,
          isPrimary: true,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-02',
        },
      }
      vi.mocked(axios.get).mockResolvedValue({ data: { data: [image] } })

      const [result] = await productImageService.getByProduct('1')

      expect(result.filePath).toBe('products/test.webp')
      expect(result.sortOrder).toBe(3)
      expect(result.isPrimary).toBe(true)
    })

    it('should fall back to snake_case attributes', async () => {
      const image = {
        type: 'product-images',
        id: '1',
        attributes: {
          file_path: 'products/snake.webp',
          image_url: 'http://localhost:8000/storage/products/snake.webp',
          alt_text: 'Snake',
          sort_order: 5,
          is_primary: true,
          created_at: '2026-01-01',
          updated_at: '2026-01-02',
        },
      }
      vi.mocked(axios.get).mockResolvedValue({ data: { data: [image] } })

      const [result] = await productImageService.getByProduct('1')

      expect(result.filePath).toBe('products/snake.webp')
      expect(result.sortOrder).toBe(5)
      expect(result.isPrimary).toBe(true)
    })
  })
})
