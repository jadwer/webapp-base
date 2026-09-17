/**
 * productPath: un solo punto de verdad para la URL de la ficha (SEO Bloque 1b).
 */

import { describe, it, expect } from 'vitest'
import { productPath, isNumericProductSegment } from '../../utils/productPath'

describe('productPath', () => {
  it('usa el slug cuando existe', () => {
    expect(productPath({ id: '604', attributes: { slug: 'jumper-hach-ha-001215' } })).toBe('/productos/jumper-hach-ha-001215')
  })

  it('cae al id sin slug, con slug nulo o vacio, o sin attributes', () => {
    expect(productPath({ id: '604' })).toBe('/productos/604')
    expect(productPath({ id: 604, attributes: { slug: null } })).toBe('/productos/604')
    expect(productPath({ id: '604', attributes: { slug: '   ' } })).toBe('/productos/604')
  })

  it('isNumericProductSegment distingue id legado de slug', () => {
    expect(isNumericProductSegment('604')).toBe(true)
    expect(isNumericProductSegment('jumper-hach')).toBe(false)
    expect(isNumericProductSegment('604-x')).toBe(false)
    expect(isNumericProductSegment('')).toBe(false)
  })
})
