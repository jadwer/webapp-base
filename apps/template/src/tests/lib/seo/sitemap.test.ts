import { describe, it, expect, vi } from 'vitest'
import {
  absoluteUrl,
  buildSitemap,
  categoryEntries,
  dedupeEntries,
  fetchPublicCategoryRefs,
  fetchProductChunk,
  fetchPublishedPages,
  listSitemapIds,
  normalizeHost,
  pageEntries,
  productChunkCount,
  productEntries,
  sitemapIndexXml,
  staticEntries,
  PRODUCT_CHUNK_SIZE,
  type FetchLike,
} from '@/lib/seo/sitemap'

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

function productsPayload(ids: string[], total: number, withSlug = false) {
  return {
    data: ids.map((id) => ({
      type: 'public-products',
      id,
      attributes: { sku: `SKU-${id}`, slug: withSlug ? `producto-${id}` : null, updatedAt: '2026-09-01T00:00:00.000000Z' },
    })),
    meta: { page: { total, lastPage: Math.ceil(total / PRODUCT_CHUNK_SIZE) } },
  }
}

const pagesPayload = {
  data: [
    { type: 'pages', id: '3', attributes: { slug: 'nosotros', status: 'published', updatedAt: '2026-02-25T03:05:44.000000Z' } },
    { type: 'pages', id: '4', attributes: { slug: 'borrador', status: 'draft', updatedAt: '2026-02-25T03:05:44.000000Z' } },
    { type: 'pages', id: '5', attributes: { slug: 'aviso-privacidad', status: 'published' } },
  ],
}

const source = { host: 'https://tenant.test', backendUrl: 'https://api.test', staticPaths: ['/', '/productos', '/nosotros'] }

describe('normalizeHost / absoluteUrl', () => {
  it('quita barras finales y usa fallback cuando falta', () => {
    expect(normalizeHost('https://x.com/')).toBe('https://x.com')
    expect(normalizeHost('https://x.com///')).toBe('https://x.com')
    expect(normalizeHost('  ')).toBe('http://localhost:3000')
    expect(normalizeHost(undefined, 'http://api')).toBe('http://api')
  })

  it('arma URLs absolutas con o sin barra inicial', () => {
    expect(absoluteUrl('https://x.com', '/productos')).toBe('https://x.com/productos')
    expect(absoluteUrl('https://x.com', 'productos')).toBe('https://x.com/productos')
  })
})

describe('productChunkCount', () => {
  it('calcula lotes de 5000 y tolera totales invalidos', () => {
    expect(productChunkCount(0)).toBe(0)
    expect(productChunkCount(1)).toBe(1)
    expect(productChunkCount(5000)).toBe(1)
    expect(productChunkCount(5001)).toBe(2)
    expect(productChunkCount(37396)).toBe(8)
    expect(productChunkCount(NaN)).toBe(0)
    expect(productChunkCount(-4)).toBe(0)
  })
})

describe('entries', () => {
  it('home tiene prioridad 1 y frecuencia diaria; el resto semanal', () => {
    const entries = staticEntries('https://x.com', ['/', '/productos'])
    expect(entries[0]).toMatchObject({ url: 'https://x.com/', priority: 1, changeFrequency: 'daily' })
    expect(entries[1]).toMatchObject({ url: 'https://x.com/productos', priority: 0.8, changeFrequency: 'weekly' })
  })

  it('paginas del builder viven en la raiz por slug y productos en /productos/{id}', () => {
    expect(pageEntries('https://x.com', [{ slug: 'nosotros', updatedAt: 'd' }])[0]).toMatchObject({ url: 'https://x.com/nosotros', lastModified: 'd' })
    expect(productEntries('https://x.com', [{ id: '604', updatedAt: 'd' }])[0]).toMatchObject({ url: 'https://x.com/productos/604', lastModified: 'd' })
  })

  it('dedupeEntries conserva la primera aparicion', () => {
    const out = dedupeEntries([
      { url: 'a', priority: 0.8 },
      { url: 'b' },
      { url: 'a', priority: 0.6 },
    ])
    expect(out).toHaveLength(2)
    expect(out[0].priority).toBe(0.8)
  })
})

describe('fetchers', () => {
  it('fetchPublishedPages pide solo publicadas y descarta borradores o sin slug', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(jsonResponse(pagesPayload))
    const pages = await fetchPublishedPages('https://api.test', fetchImpl)
    expect(fetchImpl.mock.calls[0][0]).toBe('https://api.test/api/v1/pages?filter[status]=published&page[size]=100')
    expect(pages.map((p) => p.slug)).toEqual(['nosotros', 'aviso-privacidad'])
  })

  it('fetchProductChunk usa sparse fieldsets, el tamano de lote y la pagina pedida', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(jsonResponse(productsPayload(['1', '2'], 2)))
    const products = await fetchProductChunk('https://api.test', 3, fetchImpl)
    expect(fetchImpl.mock.calls[0][0]).toBe(
      'https://api.test/api/public/v1/public-products?fields[public-products]=sku,slug,updatedAt&page[size]=5000&page[number]=3',
    )
    expect(products).toEqual([
      { id: '1', slug: null, updatedAt: '2026-09-01T00:00:00.000000Z' },
      { id: '2', slug: null, updatedAt: '2026-09-01T00:00:00.000000Z' },
    ])
  })

  it('productEntries usa el slug cuando existe y el id cuando no (Bloque 1b)', () => {
    const entries = productEntries('https://x.com', [
      { id: '604', slug: 'jumper-hach-ha-001215' },
      { id: '605', slug: null },
      { id: '606', slug: '  ' },
    ])
    expect(entries.map((e) => e.url)).toEqual([
      'https://x.com/productos/jumper-hach-ha-001215',
      'https://x.com/productos/605',
      'https://x.com/productos/606',
    ])
  })

  it('un status no 2xx lanza error (no se publica un sitemap vacio en silencio)', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(jsonResponse({}, 500))
    await expect(fetchProductChunk('https://api.test', 1, fetchImpl)).rejects.toThrow('respondio 500')
  })
})

describe('listSitemapIds', () => {
  it('devuelve el id 0 mas un id por lote segun el total real', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(jsonResponse(productsPayload(['1'], 37396)))
    const ids = await listSitemapIds('https://api.test', fetchImpl)
    expect(ids).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8].map((id) => ({ id })))
    expect(fetchImpl.mock.calls[0][0]).toContain('page[size]=1')
  })

  it('sin productos solo queda el id 0', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(jsonResponse(productsPayload([], 0)))
    expect(await listSitemapIds('https://api.test', fetchImpl)).toEqual([{ id: 0 }])
  })
})

const categoriesPayload = {
  data: [
    { type: 'public-categories', id: '1', attributes: { name: 'Reactivos', slug: 'reactivos', updatedAt: '2025-08-02T23:34:41.000000Z' } },
    { type: 'public-categories', id: '4', attributes: { name: 'Refacciones', slug: 'Refacciones raras' } },
  ],
}

function fetchByUrl(): FetchLike {
  return vi.fn<FetchLike>().mockImplementation(async (url) => {
    if (url.includes('/api/v1/pages')) return jsonResponse(pagesPayload)
    if (url.includes('public-categories')) return jsonResponse(categoriesPayload)
    return jsonResponse({}, 404)
  })
}

describe('categorias', () => {
  it('fetchPublicCategoryRefs pide activas por nombre y categoryEntries apunta al filtro canonico', async () => {
    const fetchImpl = fetchByUrl()
    const refs = await fetchPublicCategoryRefs('https://api.test', fetchImpl)
    expect((fetchImpl as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe('https://api.test/api/public/v1/public-categories?page[size]=100&sort=name')
    expect(refs).toEqual([
      { id: '1', slug: 'reactivos', updatedAt: '2025-08-02T23:34:41.000000Z' },
      { id: '4', slug: 'Refacciones raras', updatedAt: undefined },
    ])
    const entries = categoryEntries('https://x.com', refs)
    expect(entries[0]).toMatchObject({ url: 'https://x.com/productos/categoria/reactivos', priority: 0.7 })
    // slug sucio (espacios, mayusculas) -> URL por id hasta que se corrija
    expect(entries[1].url).toBe('https://x.com/productos?categoryId=4')
  })
})

describe('buildSitemap', () => {
  it('id 0 = estaticas + categorias + paginas publicadas, sin duplicar una ruta estatica que tambien es pagina', async () => {
    const fetchImpl = fetchByUrl()
    const entries = await buildSitemap(0, source, fetchImpl)
    expect(entries.map((e) => e.url)).toEqual([
      'https://tenant.test/',
      'https://tenant.test/productos',
      'https://tenant.test/nosotros',
      'https://tenant.test/productos/categoria/reactivos',
      'https://tenant.test/productos?categoryId=4',
      'https://tenant.test/aviso-privacidad',
    ])
    expect(entries[2].priority).toBe(0.8)
  })

  it('id N (numero o string "N" como lo entrega Next) = lote N de productos', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(jsonResponse(productsPayload(['604', '605'], 2)))
    const entries = await buildSitemap('2', source, fetchImpl)
    expect(fetchImpl.mock.calls[0][0]).toContain('page[number]=2')
    expect(entries.map((e) => e.url)).toEqual(['https://tenant.test/productos/604', 'https://tenant.test/productos/605'])
  })

  it('id invalido no llama a la API y devuelve vacio', async () => {
    const fetchImpl = vi.fn<FetchLike>()
    expect(await buildSitemap('abc', source, fetchImpl)).toEqual([])
    expect(await buildSitemap(-1, source, fetchImpl)).toEqual([])
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})

describe('sitemapIndexXml', () => {
  it('genera un sitemapindex valido con una entrada por id', () => {
    const xml = sitemapIndexXml('https://tenant.test', [{ id: 0 }, { id: 1 }])
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(xml).toContain('<loc>https://tenant.test/sitemap/0.xml</loc>')
    expect(xml).toContain('<loc>https://tenant.test/sitemap/1.xml</loc>')
    expect((xml.match(/<sitemap>/g) ?? []).length).toBe(2)
  })
})
