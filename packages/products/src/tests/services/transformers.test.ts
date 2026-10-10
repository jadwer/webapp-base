import { describe, it, expect } from 'vitest'
import { transformJsonApiBrand, transformJsonApiCategory } from '../../utils/transformers'

describe('transformers isActive', () => {
  describe('transformJsonApiBrand', () => {
    it('should transform isActive true', () => {
      const resource = {
        id: '1',
        type: 'brands',
        attributes: { name: 'Test', isActive: true, createdAt: '', updatedAt: '' }
      }
      const result = transformJsonApiBrand(resource)
      expect(result.isActive).toBe(true)
    })

    it('should transform isActive false', () => {
      const resource = {
        id: '2',
        type: 'brands',
        attributes: { name: 'Test', isActive: false, createdAt: '', updatedAt: '' }
      }
      const result = transformJsonApiBrand(resource)
      expect(result.isActive).toBe(false)
    })

    it('should default isActive to true when undefined', () => {
      const resource = {
        id: '3',
        type: 'brands',
        attributes: { name: 'Test', createdAt: '', updatedAt: '' }
      }
      const result = transformJsonApiBrand(resource)
      expect(result.isActive).toBe(true)
    })
  })

  describe('transformJsonApiCategory', () => {
    it('should transform isActive true', () => {
      const resource = {
        id: '1',
        type: 'categories',
        attributes: { name: 'Cat', isActive: true, createdAt: '', updatedAt: '' }
      }
      const result = transformJsonApiCategory(resource)
      expect(result.isActive).toBe(true)
    })

    it('should transform isActive false', () => {
      const resource = {
        id: '2',
        type: 'categories',
        attributes: { name: 'Cat', isActive: false, createdAt: '', updatedAt: '' }
      }
      const result = transformJsonApiCategory(resource)
      expect(result.isActive).toBe(false)
    })

    it('should default isActive to true when undefined', () => {
      const resource = {
        id: '3',
        type: 'categories',
        attributes: { name: 'Cat', createdAt: '', updatedAt: '' }
      }
      const result = transformJsonApiCategory(resource)
      expect(result.isActive).toBe(true)
    })
  })
})

describe('transformJsonApiProduct pricingType (P2 granel)', () => {
  it('lee quote_only con price null y normaliza ausente a fixed', async () => {
    const { transformJsonApiProduct } = await import('../../utils/transformers')
    const quoteOnly = transformJsonApiProduct({
      id: '9', type: 'products',
      attributes: { name: 'Granel', price: null, pricingType: 'quote_only', iva: true, createdAt: '', updatedAt: '' },
    })
    expect(quoteOnly.pricingType).toBe('quote_only')
    expect(quoteOnly.price).toBeNull()

    const legacy = transformJsonApiProduct({
      id: '10', type: 'products',
      attributes: { name: 'Frasco', price: 10, iva: true, createdAt: '', updatedAt: '' },
    })
    expect(legacy.pricingType).toBe('fixed')
  })
})
