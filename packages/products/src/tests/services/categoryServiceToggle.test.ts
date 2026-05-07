import { describe, it, expect, vi, beforeEach } from 'vitest'
import { axiosClient as axios } from '@lwm/auth'
import { categoryService } from '../../services/categoryService'

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

describe('categoryService.toggleActive', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should toggle category active without including products', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { message: 'Categoría desactivada', category_updated: true, products_affected: 0 }
    })

    const result = await categoryService.toggleActive('1', false)

    expect(axios.post).toHaveBeenCalledWith('/api/v1/categories/1/toggle-active', {
      is_active: false,
      include_products: false
    })
    expect(result.category_updated).toBe(true)
    expect(result.products_affected).toBe(0)
  })

  it('should toggle category active with products cascade', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { message: 'Categoría y productos desactivados', category_updated: true, products_affected: 8 }
    })

    const result = await categoryService.toggleActive('5', false, true)

    expect(axios.post).toHaveBeenCalledWith('/api/v1/categories/5/toggle-active', {
      is_active: false,
      include_products: true
    })
    expect(result.products_affected).toBe(8)
  })
})
