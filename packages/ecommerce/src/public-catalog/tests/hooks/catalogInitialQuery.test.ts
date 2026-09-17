/**
 * La consulta inicial del controller y la clave de SWR deben ser identicas
 * entre servidor y cliente: es el contrato del prerender (SEO Bloque 1).
 */

import { describe, it, expect } from 'vitest'
import { catalogInitialQuery, CATALOG_PRODUCTS_INCLUDE } from '../../services/catalogQuery'
import { createProductsKey } from '../../hooks/usePublicProducts'

describe('catalogInitialQuery', () => {
  it('defaults: pagina 1 de 24, orden name asc, isActive primero', () => {
    const q = catalogInitialQuery()
    expect(q).toEqual({
      filters: { isActive: true },
      sort: [{ field: 'name', direction: 'asc' }],
      pagination: { page: 1, size: 24 },
      include: CATALOG_PRODUCTS_INCLUDE
    })
  })

  it('los filtros undefined no alteran la clave (misma clave con o sin search: undefined)', () => {
    const a = catalogInitialQuery({ initialFilters: { search: undefined, categoryId: undefined } })
    const b = catalogInitialQuery({})
    expect(createProductsKey(a.filters, a.sort, a.pagination, a.include))
      .toBe(createProductsKey(b.filters, b.sort, b.pagination, b.include))
  })

  it('la clave cambia con categoria, orden o tamano de pagina', () => {
    const base = catalogInitialQuery()
    const key = (q: ReturnType<typeof catalogInitialQuery>) => createProductsKey(q.filters, q.sort, q.pagination, q.include)
    expect(key(catalogInitialQuery({ initialFilters: { categoryId: '1' } }))).not.toBe(key(base))
    expect(key(catalogInitialQuery({ initialSortField: 'price' }))).not.toBe(key(base))
    expect(key(catalogInitialQuery({ initialPageSize: 12 }))).not.toBe(key(base))
  })

  it('el orden de las llaves es determinista: isActive, luego iniciales', () => {
    const q = catalogInitialQuery({ initialFilters: { search: 'x', categoryId: '2' } })
    expect(Object.keys(q.filters)).toEqual(['isActive', 'search', 'categoryId'])
  })
})
