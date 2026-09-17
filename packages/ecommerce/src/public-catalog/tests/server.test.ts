/**
 * Tests de los fetchers de servidor (SEO Bloque 1): construyen la misma URL
 * que el cliente, pasan revalidate a Next y devuelven datos enriquecidos.
 */

import { describe, it, expect, vi } from 'vitest'
import {
  fetchPublicCatalogServer,
  fetchPublicProductServer,
  fetchPublicCategoriesServer,
  PublicCatalogServerError
} from '../server'
import { catalogInitialQuery } from '../services/catalogQuery'

function response(body: unknown, status = 200): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as unknown as Response
}

const product = {
  id: '604',
  type: 'public-products',
  attributes: { name: 'P', sku: 'S', price: 1, iva: true, isOnSale: false, description: null, fullDescription: null, imageUrl: null, datasheetUrl: null, createdAt: '', updatedAt: '' },
  relationships: { unit: { data: null }, category: { data: null }, brand: { data: null } }
}

describe('fetchPublicCatalogServer', () => {
  it('arma la URL con la consulta inicial del controller y pide revalidate', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({
      data: [product],
      meta: { page: { currentPage: 1, lastPage: 1, perPage: 24, total: 1, from: 1, to: 1 } },
      links: { first: '', last: '', prev: null, next: null }
    }))
    const query = catalogInitialQuery({ initialFilters: { search: 'acido', categoryId: '1' } })
    const page = await fetchPublicCatalogServer(query, { backendUrl: 'https://api.test/', revalidate: 300, fetchImpl })

    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.test/api/public/v1/public-products?filter%5Bsearch%5D=acido&filter%5Bcategories%5D=1&sort=name&page%5Bnumber%5D=1&page%5Bsize%5D=24&include=unit%2Ccategory%2Cbrand%2Cimages%2Ccurrency')
    expect((init as { next: { revalidate: number } }).next).toEqual({ revalidate: 300 })
    expect(page.products[0].displayName).toBe('P')
    expect(page.meta.total).toBe(1)
  })

  it('un status no 2xx lanza PublicCatalogServerError con el status', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({}, 503))
    await expect(fetchPublicCatalogServer({}, { backendUrl: 'https://api.test', fetchImpl })).rejects.toBeInstanceOf(PublicCatalogServerError)
  })

  it('sin backendUrl ni env falla claro', async () => {
    const prev = process.env.NEXT_PUBLIC_BACKEND_URL
    delete process.env.NEXT_PUBLIC_BACKEND_URL
    await expect(fetchPublicCatalogServer({}, { fetchImpl: vi.fn() })).rejects.toThrow('NEXT_PUBLIC_BACKEND_URL')
    if (prev !== undefined) process.env.NEXT_PUBLIC_BACKEND_URL = prev
  })
})

describe('fetchPublicProductServer', () => {
  it('devuelve null en 404 y en ids no numericos sin llamar a la API', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({}, 404))
    expect(await fetchPublicProductServer('999', undefined, { backendUrl: 'https://api.test', fetchImpl })).toBeNull()
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(await fetchPublicProductServer('abc', undefined, { backendUrl: 'https://api.test', fetchImpl })).toBeNull()
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('pide el include por defecto con galeria y usa revalidate 3600 salvo override', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({ data: product }))
    const result = await fetchPublicProductServer('604', undefined, { backendUrl: 'https://api.test', fetchImpl })
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.test/api/public/v1/public-products/604?include=unit%2Ccategory%2Cbrand%2Cimages%2Ccurrency')
    expect((init as { next: { revalidate: number } }).next.revalidate).toBe(3600)
    expect(result?.displayName).toBe('P')
  })

  it('un 500 lanza error (no se confunde con "no existe")', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({}, 500))
    await expect(fetchPublicProductServer('604', undefined, { backendUrl: 'https://api.test', fetchImpl })).rejects.toBeInstanceOf(PublicCatalogServerError)
  })
})

describe('fetchPublicCategoriesServer', () => {
  it('pide categorias ordenadas por nombre y las mapea al shape del hook', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({
      data: [{ id: '1', attributes: { name: 'Reactivos', slug: 'reactivos', productsCount: 5, updatedAt: 'u' } }]
    }))
    const categories = await fetchPublicCategoriesServer(50, { backendUrl: 'https://api.test', fetchImpl })
    expect(fetchImpl.mock.calls[0][0]).toBe('https://api.test/api/public/v1/public-categories?page%5Bsize%5D=50&sort=name')
    expect(categories).toEqual([{ id: '1', name: 'Reactivos', slug: 'reactivos', description: null, productsCount: 5, updatedAt: 'u' }])
  })
})
