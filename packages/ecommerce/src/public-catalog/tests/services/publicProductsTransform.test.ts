/**
 * Tests de las transformaciones puras compartidas por cliente y servidor
 * (SEO Bloque 1).
 */

import { describe, it, expect } from 'vitest'
import {
  buildPublicProductsQueryParams,
  buildPublicProductsQueryString,
  enhancePublicProduct,
  enhancePublicProductsResponse,
  enhancePublicProductResponse,
  formatPublicPrice,
  normalizePublicProductsMeta
} from '../../services/publicProductsTransform'
import type { PublicProduct, PublicProductsResponse } from '../../types/publicProduct'

function rawProduct(id = '604'): PublicProduct {
  return {
    id,
    type: 'public-products',
    attributes: {
      name: 'Jumper 2 pos',
      sku: 'HA-001215',
      description: 'desc',
      fullDescription: 'full',
      price: 435.5,
      cost: null,
      compareAtPrice: null,
      isOnSale: false,
      saleStartsAt: null,
      saleEndsAt: null,
      saleBadge: null,
      iva: false,
      imgPath: null,
      datasheetPath: null,
      imageUrl: 'https://api.test/storage/products/HA-4',
      datasheetUrl: null,
      createdAt: '2024-12-09T19:41:22.000000Z',
      updatedAt: '2025-09-11T05:54:52.000000Z'
    },
    relationships: {
      unit: { data: { id: '1', type: 'units' } },
      category: { data: { id: '4', type: 'categories' } },
      brand: { data: { id: '3', type: 'brands' } },
      currency: { data: { id: '1', type: 'currencies' } },
      images: { data: [{ id: '9', type: 'product-images' }, { id: '8', type: 'product-images' }] }
    }
  }
}

const included: PublicProductsResponse['included'] = [
  { id: '1', type: 'units', attributes: { name: 'Pieza', abbreviation: 'PZA', description: null } },
  { id: '4', type: 'categories', attributes: { name: 'Refacciones', description: null, slug: 'refacciones', imageUrl: null } },
  { id: '3', type: 'brands', attributes: { name: 'Hach', description: null, slug: 'hach', logoUrl: null, websiteUrl: null } },
  { id: '1', type: 'currencies', attributes: { code: 'MXN', name: 'Peso', symbol: '$', exchangeRate: 1 } },
  { id: '8', type: 'product-images', attributes: { filePath: 'a', imageUrl: 'https://api.test/a', altText: null, sortOrder: 0, isPrimary: true } },
  { id: '9', type: 'product-images', attributes: { filePath: 'b', imageUrl: 'https://api.test/b', altText: null, sortOrder: 1, isPrimary: false } }
]

describe('buildPublicProductsQueryParams / QueryString', () => {
  it('manda filtros en plural, orden, paginacion e include; isActive no viaja', () => {
    const params = buildPublicProductsQueryParams(
      { isActive: true, search: 'acido', categoryId: ['1', '2'], brandId: '3', priceMin: 10, priceMax: 20, isOnSale: true, sku: 'X' },
      [{ field: 'name', direction: 'asc' }, { field: 'price', direction: 'desc' }],
      { page: 2, size: 24 },
      'unit,category,brand,images,currency'
    )
    expect(params).toEqual({
      'filter[search]': 'acido',
      'filter[categories]': '1,2',
      'filter[brands]': '3',
      'filter[price_min]': '10',
      'filter[price_max]': '20',
      'filter[is_on_sale]': '1',
      'filter[sku]': 'X',
      sort: 'name,-price',
      'page[number]': '2',
      'page[size]': '24',
      include: 'unit,category,brand,images,currency'
    })
  })

  it('el query string es estable y URL-encoded', () => {
    const qs = buildPublicProductsQueryString({ isActive: true, categoryId: '1' }, [{ field: 'name', direction: 'asc' }], { page: 1, size: 24 }, 'unit,category,brand,images,currency')
    expect(qs).toBe('filter%5Bcategories%5D=1&sort=name&page%5Bnumber%5D=1&page%5Bsize%5D=24&include=unit%2Ccategory%2Cbrand%2Cimages%2Ccurrency')
  })

  it('sin argumentos devuelve vacio', () => {
    expect(buildPublicProductsQueryParams()).toEqual({})
    expect(buildPublicProductsQueryString()).toBe('')
  })
})

describe('enhancePublicProduct', () => {
  it('resuelve unidad, categoria, marca, moneda y galeria ordenada', () => {
    const enhanced = enhancePublicProduct(rawProduct(), included)
    expect(enhanced.displayName).toBe('Jumper 2 pos')
    expect(enhanced.displayUnit).toBe('PZA')
    expect(enhanced.displayCategory).toBe('Refacciones')
    expect(enhanced.displayBrand).toBe('Hach')
    expect(enhanced.displayCurrency).toBe('MXN')
    expect(enhanced.displayPrice).toBe(formatPublicPrice(435.5, 'MXN'))
    expect(enhanced.galleryImages?.map((i) => i.id)).toEqual(['8', '9'])
  })

  it('sin included usa los textos por defecto', () => {
    const enhanced = enhancePublicProduct(rawProduct())
    expect(enhanced.displayCategory).toBe('Sin categoría')
    expect(enhanced.displayBrand).toBe('Sin marca')
    expect(enhanced.displayUnit).toBe('Sin unidad')
    expect(enhanced.galleryImages).toBeUndefined()
  })

  it('formatPublicPrice: null = no disponible', () => {
    expect(formatPublicPrice(null)).toBe('Precio no disponible')
    expect(formatPublicPrice(1234.5)).toContain('1,234.50')
  })
})

describe('respuestas completas', () => {
  it('normaliza meta.page y enriquece la coleccion', () => {
    const page = enhancePublicProductsResponse({
      data: [rawProduct('1'), rawProduct('2')],
      included,
      meta: { page: { currentPage: 1, lastPage: 8, perPage: 2, total: 16, from: 1, to: 2, path: '' } } as unknown as PublicProductsResponse['meta'],
      links: { first: 'f', last: 'l', prev: null, next: 'n' }
    })
    expect(page.products).toHaveLength(2)
    expect(page.meta.total).toBe(16)
    expect(page.links.next).toBe('n')
  })

  it('normalizePublicProductsMeta acepta meta plano o anidado', () => {
    const flat = { currentPage: 1, lastPage: 1, perPage: 24, total: 3, from: 1, to: 3, path: '' }
    expect(normalizePublicProductsMeta(flat)).toEqual(flat)
    expect(normalizePublicProductsMeta({ page: flat })).toEqual(flat)
  })

  it('enhancePublicProductResponse enriquece la ficha', () => {
    const product = enhancePublicProductResponse({ data: rawProduct(), included })
    expect(product.brand?.attributes.name).toBe('Hach')
  })
})
