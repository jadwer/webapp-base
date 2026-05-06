import axiosClient from '@/lib/axiosClient'

export interface RecentProduct {
  id: string
  name: string
  sku: string
  description: string
  price: number
  cost: number
  imgPath: string | null
  imageUrl: string | null
  isActive: boolean
  averageRating: number
  totalReviews: number
  totalSales: number
}

interface ApiProductItem {
  type: string
  id: string
  attributes: Record<string, unknown>
}

export const productViewService = {
  /**
   * Track a product view (fire-and-forget, never blocks UX)
   */
  async trackView(productId: string, sessionId?: string): Promise<void> {
    try {
      await axiosClient.post(`/api/v1/products/${productId}/track-view`, {
        session_id: sessionId,
      })
    } catch {
      // Silently fail - tracking should not block UX
    }
  },

  /**
   * Get recently viewed products for authenticated user
   */
  async getRecentlyViewed(limit: number = 8): Promise<RecentProduct[]> {
    const response = await axiosClient.get('/api/v1/products/recently-viewed', {
      params: { limit },
    })
    const items: ApiProductItem[] = response.data?.data || []
    return items.map((item) => ({
      id: item.id,
      name: item.attributes.name as string,
      sku: item.attributes.sku as string,
      description: item.attributes.description as string,
      price: item.attributes.price as number,
      cost: item.attributes.cost as number,
      imgPath: (item.attributes.imgPath as string) || null,
      imageUrl: (item.attributes.imageUrl as string) || null,
      isActive: item.attributes.isActive as boolean,
      averageRating: item.attributes.averageRating as number,
      totalReviews: item.attributes.totalReviews as number,
      totalSales: item.attributes.totalSales as number,
    }))
  },
}
