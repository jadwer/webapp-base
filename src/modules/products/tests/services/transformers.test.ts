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
