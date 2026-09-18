import { describe, it, expect } from 'vitest'
import { categoryPath, isCleanCategorySlug } from '@/lib/seo/categoryPath'

describe('categoryPath', () => {
  it('usa /productos/categoria/<slug> con slug limpio y ?categoryId= sin el', () => {
    expect(categoryPath({ id: '3', slug: 'cristaleria' })).toBe('/productos/categoria/cristaleria')
    expect(categoryPath({ id: '3', slug: null })).toBe('/productos?categoryId=3')
    expect(categoryPath({ id: 3, slug: 'Quimicos,Sales Y Solventes (reactivos)' })).toBe('/productos?categoryId=3')
  })

  it('agrega la pagina solo a partir de la 2', () => {
    expect(categoryPath({ id: '3', slug: 'cristaleria' }, 1)).toBe('/productos/categoria/cristaleria')
    expect(categoryPath({ id: '3', slug: 'cristaleria' }, 2)).toBe('/productos/categoria/cristaleria?page=2')
    expect(categoryPath({ id: '3', slug: null }, 2)).toBe('/productos?categoryId=3&page=2')
  })

  it('isCleanCategorySlug', () => {
    expect(isCleanCategorySlug('osmosis-inversa')).toBe(true)
    expect(isCleanCategorySlug('Cuartos limpios')).toBe(false)
    expect(isCleanCategorySlug('')).toBe(false)
    expect(isCleanCategorySlug(undefined)).toBe(false)
  })
})
