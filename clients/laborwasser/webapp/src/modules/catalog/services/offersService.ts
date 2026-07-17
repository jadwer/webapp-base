/**
 * CATALOG MODULE - OFFERS SERVICE
 * Service layer for offers management
 * Offers are derived from products (price > cost)
 */

import { productService } from '@/modules/products'
import type {
  Offer,
  OffersMetrics,
  OffersFilters,
  ProductForOffer
} from '../types'
import { productToOffer, productToProductForOffer } from '../types'

/**
 * Cuantos productos se revisan para derivar ofertas. La oferta se calcula en el
 * cliente (precio > costo) porque el backend no expone ese filtro, asi que hay
 * que acotar la consulta: pedir el catalogo completo (39k+ productos) hacia que
 * PHP devolviera 500 y el navegador lo reportaba como un error de CORS
 * enganoso. Si algun dia el backend expone filter[on_offer], esto se sustituye
 * por una consulta filtrada y paginada de verdad.
 */
const OFFERS_SCAN_LIMIT = 500

/**
 * Get all offers (products where price > cost)
 */
async function getAll(filters?: OffersFilters): Promise<{ data: Offer[]; meta: { total: number } }> {
  try {
    const response = await productService.getProducts({
      page: { number: 1, size: OFFERS_SCAN_LIMIT },
      include: ['unit', 'category', 'brand']
    })

    const products = response.data || []
    let offers: Offer[] = []

    // Transform products to offers
    for (const product of products) {
      const offer = productToOffer(product)
      if (offer) {
        offers.push(offer)
      }
    }

    // Apply filters
    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        offers = offers.filter(offer =>
          offer.name.toLowerCase().includes(searchLower) ||
          (offer.sku && offer.sku.toLowerCase().includes(searchLower))
        )
      }

      if (filters.categoryId) {
        offers = offers.filter(offer => offer.category?.id === filters.categoryId)
      }

      if (filters.brandId) {
        offers = offers.filter(offer => offer.brand?.id === filters.brandId)
      }

      if (filters.minDiscount !== undefined) {
        offers = offers.filter(offer => offer.discountPercent >= filters.minDiscount!)
      }

      if (filters.maxDiscount !== undefined) {
        offers = offers.filter(offer => offer.discountPercent <= filters.maxDiscount!)
      }
    }

    // Sort by discount percent descending (best offers first)
    offers.sort((a, b) => b.discountPercent - a.discountPercent)

    return {
      data: offers,
      meta: { total: offers.length }
    }
  } catch (error) {
    console.error('Error fetching offers:', error)
    throw error
  }
}

/**
 * Get a single offer by product ID
 */
async function getById(productId: string): Promise<{ data: Offer | null }> {
  try {
    const response = await productService.getProduct(productId, ['unit', 'category', 'brand'])

    if (!response.data) {
      return { data: null }
    }

    const offer = productToOffer(response.data)
    return { data: offer }
  } catch (error) {
    console.error('Error fetching offer:', error)
    throw error
  }
}

/**
 * Get products available for creating offers.
 * Paginado por la misma razon que getAll: pedir el catalogo entero tumba al
 * backend. El buscador acota del lado del servidor cuando hay termino.
 */
async function getProductsForOffer(search?: string): Promise<{ data: ProductForOffer[] }> {
  try {
    const response = await productService.getProducts({
      page: { number: 1, size: OFFERS_SCAN_LIMIT },
      include: ['category', 'brand'],
      ...(search && { filters: { name: search } })
    })

    const products = response.data || []
    const productsForOffer = products.map(productToProductForOffer)

    // Sort: products without offers first, then by name
    productsForOffer.sort((a, b) => {
      if (a.hasOffer !== b.hasOffer) {
        return a.hasOffer ? 1 : -1
      }
      return a.name.localeCompare(b.name)
    })

    return { data: productsForOffer }
  } catch (error) {
    console.error('Error fetching products for offer:', error)
    throw error
  }
}

/**
 * Create an offer by updating product prices
 */
async function create(data: { productId: string; price: number; cost: number }): Promise<{ data: Offer | null }> {
  try {
    // Validate that price > cost
    if (data.price <= data.cost) {
      throw new Error('El precio debe ser mayor que el costo para crear una oferta')
    }

    // Update product with new prices
    const response = await productService.updateProduct(data.productId, {
      price: data.price,
      cost: data.cost
    })

    if (!response.data) {
      return { data: null }
    }

    // Fetch updated product with relationships
    const updatedProduct = await productService.getProduct(data.productId, ['unit', 'category', 'brand'])

    if (!updatedProduct.data) {
      return { data: null }
    }

    const offer = productToOffer(updatedProduct.data)
    return { data: offer }
  } catch (error) {
    console.error('Error creating offer:', error)
    throw error
  }
}

/**
 * Update an offer by updating product prices
 */
async function update(productId: string, data: { price: number; cost: number }): Promise<{ data: Offer | null }> {
  try {
    // Validate that price > cost
    if (data.price <= data.cost) {
      throw new Error('El precio debe ser mayor que el costo para mantener una oferta')
    }

    // Update product with new prices
    const response = await productService.updateProduct(productId, {
      price: data.price,
      cost: data.cost
    })

    if (!response.data) {
      return { data: null }
    }

    // Fetch updated product with relationships
    const updatedProduct = await productService.getProduct(productId, ['unit', 'category', 'brand'])

    if (!updatedProduct.data) {
      return { data: null }
    }

    const offer = productToOffer(updatedProduct.data)
    return { data: offer }
  } catch (error) {
    console.error('Error updating offer:', error)
    throw error
  }
}

/**
 * Remove an offer by setting cost = price (zero discount)
 */
async function remove(productId: string): Promise<{ success: boolean }> {
  try {
    // Get current product
    const response = await productService.getProduct(productId)

    if (!response.data) {
      throw new Error('Producto no encontrado')
    }

    const product = response.data
    const price = product.price ?? 0

    // Set cost equal to price to remove the offer
    await productService.updateProduct(productId, {
      cost: price
    })

    return { success: true }
  } catch (error) {
    console.error('Error removing offer:', error)
    throw error
  }
}

/**
 * Calculate offers metrics
 */
async function getMetrics(): Promise<OffersMetrics> {
  try {
    const { data: offers } = await getAll()

    const metrics: OffersMetrics = {
      activeOffers: offers.length,
      totalDiscount: 0,
      averageDiscount: 0,
      productsOnOffer: offers.length,
      topCategory: null,
      topBrand: null
    }

    if (offers.length === 0) {
      return metrics
    }

    // Calculate totals
    const categoryCount: Record<string, number> = {}
    const brandCount: Record<string, number> = {}

    for (const offer of offers) {
      metrics.totalDiscount += offer.discount

      if (offer.category) {
        categoryCount[offer.category.name] = (categoryCount[offer.category.name] || 0) + 1
      }

      if (offer.brand) {
        brandCount[offer.brand.name] = (brandCount[offer.brand.name] || 0) + 1
      }
    }

    metrics.averageDiscount = metrics.totalDiscount / offers.length

    // Find top category
    let maxCategoryCount = 0
    for (const [name, count] of Object.entries(categoryCount)) {
      if (count > maxCategoryCount) {
        maxCategoryCount = count
        metrics.topCategory = name
      }
    }

    // Find top brand
    let maxBrandCount = 0
    for (const [name, count] of Object.entries(brandCount)) {
      if (count > maxBrandCount) {
        maxBrandCount = count
        metrics.topBrand = name
      }
    }

    return metrics
  } catch (error) {
    console.error('Error calculating metrics:', error)
    throw error
  }
}

export const offersService = {
  getAll,
  getById,
  getProductsForOffer,
  create,
  update,
  remove,
  getMetrics
}
