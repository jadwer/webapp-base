/**
 * Wishlist Service
 *
 * Service layer for wishlist operations.
 */

import axiosClient from '@/lib/axiosClient';

export interface Wishlist {
  id: string;
  userId: number;
  name: string;
  isPublic: boolean;
  shareToken: string | null;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  wishlistId: number;
  productId: number;
  productVariantId: number | null;
  addedAt: string;
  notes: string | null;
}

interface JsonApiWishlist {
  id: string;
  type: string;
  attributes: Record<string, unknown>;
}

interface JsonApiWishlistItem {
  id: string;
  type: string;
  attributes: Record<string, unknown>;
}

export const wishlistService = {
  // ===== WISHLISTS =====

  /**
   * Get user wishlists
   */
  async getAll(): Promise<Wishlist[]> {
    const response = await axiosClient.get('/api/v1/wishlists', {
      params: { 'filter[user_id]': 'current' }
    });

    return (response.data.data || []).map((item: JsonApiWishlist) => this.transformWishlistFromAPI(item));
  },

  /**
   * Get wishlist by ID
   */
  async getById(id: string): Promise<Wishlist> {
    const response = await axiosClient.get(`/api/v1/wishlists/${id}`, {
      params: { include: 'items,items.product' }
    });

    return this.transformWishlistFromAPI(response.data.data);
  },

  /**
   * Create a new wishlist
   */
  async create(data: { name: string; isPublic?: boolean }): Promise<Wishlist> {
    const response = await axiosClient.post('/api/v1/wishlists', {
      data: {
        type: 'wishlists',
        attributes: {
          name: data.name,
          isPublic: data.isPublic || false
        }
      }
    });

    return this.transformWishlistFromAPI(response.data.data);
  },

  /**
   * Update wishlist
   */
  async update(id: string, data: { name?: string; isPublic?: boolean }): Promise<Wishlist> {
    const response = await axiosClient.patch(`/api/v1/wishlists/${id}`, {
      data: {
        type: 'wishlists',
        id,
        attributes: data
      }
    });

    return this.transformWishlistFromAPI(response.data.data);
  },

  /**
   * Delete wishlist
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/wishlists/${id}`);
  },

  // ===== WISHLIST ITEMS =====

  /**
   * Get items for a wishlist
   */
  async getItems(wishlistId: string): Promise<WishlistItem[]> {
    const response = await axiosClient.get('/api/v1/wishlist-items', {
      params: {
        'filter[wishlist_id]': wishlistId,
        include: 'product'
      }
    });

    return (response.data.data || []).map((item: JsonApiWishlistItem) => this.transformItemFromAPI(item));
  },

  /**
   * Add item to wishlist
   */
  async addItem(wishlistId: number, productId: number, notes?: string): Promise<WishlistItem> {
    const response = await axiosClient.post('/api/v1/wishlist-items', {
      data: {
        type: 'wishlist-items',
        attributes: {
          wishlistId,
          productId,
          notes
        }
      }
    });

    return this.transformItemFromAPI(response.data.data);
  },

  /**
   * Remove item from wishlist
   */
  async removeItem(id: string): Promise<void> {
    await axiosClient.delete(`/api/v1/wishlist-items/${id}`);
  },

  /**
   * Move item to cart
   */
  async moveToCart(itemId: string): Promise<void> {
    await axiosClient.post(`/api/v1/wishlist-items/${itemId}/move-to-cart`);
  },

  // ===== TRANSFORMERS =====

  transformWishlistFromAPI(item: JsonApiWishlist): Wishlist {
    const attrs = item.attributes;
    return {
      id: item.id,
      userId: (attrs.userId || attrs.user_id) as number,
      name: attrs.name as string,
      isPublic: (attrs.isPublic || attrs.is_public || false) as boolean,
      shareToken: (attrs.shareToken || attrs.share_token) as string | null,
      createdAt: (attrs.createdAt || attrs.created_at) as string
    };
  },

  transformItemFromAPI(item: JsonApiWishlistItem): WishlistItem {
    const attrs = item.attributes;
    return {
      id: item.id,
      wishlistId: (attrs.wishlistId || attrs.wishlist_id) as number,
      productId: (attrs.productId || attrs.product_id) as number,
      productVariantId: (attrs.productVariantId || attrs.product_variant_id) as number | null,
      addedAt: (attrs.addedAt || attrs.added_at) as string,
      notes: attrs.notes as string | null
    };
  }
};
