import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from '@/lib/axiosClient'
import { brandService } from '../../services/brandService'

vi.mock('@/lib/axiosClient')

describe('brandService.toggleActive', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should toggle brand active without including products', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { message: 'Marca desactivada', brand_updated: true, products_affected: 0 }
    })

    const result = await brandService.toggleActive('1', false)

    expect(axios.post).toHaveBeenCalledWith('/api/v1/brands/1/toggle-active', {
      is_active: false,
      include_products: false
    })
    expect(result.brand_updated).toBe(true)
    expect(result.products_affected).toBe(0)
  })

  it('should toggle brand active with products cascade', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { message: 'Marca y productos desactivados', brand_updated: true, products_affected: 5 }
    })

    const result = await brandService.toggleActive('2', false, true)

    expect(axios.post).toHaveBeenCalledWith('/api/v1/brands/2/toggle-active', {
      is_active: false,
      include_products: true
    })
    expect(result.products_affected).toBe(5)
  })

  it('should activate brand', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { message: 'Marca activada', brand_updated: true, products_affected: 0 }
    })

    const result = await brandService.toggleActive('3', true)

    expect(axios.post).toHaveBeenCalledWith('/api/v1/brands/3/toggle-active', {
      is_active: true,
      include_products: false
    })
    expect(result.message).toContain('activada')
  })
})
