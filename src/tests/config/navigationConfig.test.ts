import { describe, it, expect } from 'vitest'
import {
  adminNavigation,
  customerNavigation,
  customerExtraLinks,
} from '@/config/navigationConfig'

describe('navigationConfig', () => {
  describe('adminNavigation', () => {
    it('has audience set to admin', () => {
      expect(adminNavigation.audience).toBe('admin')
    })

    it('has 3 top links', () => {
      expect(adminNavigation.topLinks).toHaveLength(3)
    })

    it('has 19 groups', () => {
      expect(adminNavigation.groups).toHaveLength(19)
    })

    it('has 6 disabled modules', () => {
      expect(adminNavigation.disabledModules).toHaveLength(6)
    })

    it('has unique group keys', () => {
      const keys = adminNavigation.groups.map(g => g.key)
      expect(new Set(keys).size).toBe(keys.length)
    })

    it('all groups have non-empty activePathPrefixes', () => {
      for (const group of adminNavigation.groups) {
        expect(group.activePathPrefixes.length).toBeGreaterThan(0)
      }
    })

    it('all items have href, label and icon', () => {
      for (const group of adminNavigation.groups) {
        for (const item of group.items) {
          expect(item.href).toBeTruthy()
          expect(item.label).toBeTruthy()
          expect(item.icon).toBeTruthy()
        }
      }
    })

    it('all icons start with bi-', () => {
      for (const link of adminNavigation.topLinks) {
        expect(link.icon).toMatch(/^bi-/)
      }
      for (const group of adminNavigation.groups) {
        expect(group.icon).toMatch(/^bi-/)
        for (const item of group.items) {
          expect(item.icon).toMatch(/^bi-/)
        }
      }
      for (const mod of adminNavigation.disabledModules) {
        expect(mod.icon).toMatch(/^bi-/)
      }
    })

    it('all hrefs start with /dashboard', () => {
      for (const link of adminNavigation.topLinks) {
        expect(link.href).toMatch(/^\/dashboard/)
      }
      for (const group of adminNavigation.groups) {
        for (const item of group.items) {
          expect(item.href).toMatch(/^\/dashboard/)
        }
      }
    })

    it('no duplicate hrefs within any single group', () => {
      for (const group of adminNavigation.groups) {
        const hrefs = group.items.map(i => i.href)
        expect(new Set(hrefs).size).toBe(hrefs.length)
      }
    })

    it('has expected group keys', () => {
      const keys = adminNavigation.groups.map(g => g.key)
      expect(keys).toContain('products')
      expect(keys).toContain('inventory')
      expect(keys).toContain('contacts')
      expect(keys).toContain('quotes')
      expect(keys).toContain('sales')
      expect(keys).toContain('purchase')
      expect(keys).toContain('finance')
      expect(keys).toContain('accounting')
      expect(keys).toContain('reports')
      expect(keys).toContain('billing')
      expect(keys).toContain('crm')
      expect(keys).toContain('catalog')
      expect(keys).toContain('ecommerce')
      expect(keys).toContain('hr')
      expect(keys).toContain('settings')
      expect(keys).toContain('system')
      expect(keys).toContain('pageBuilder')
      expect(keys).toContain('rcrud')
    })

    it('disabled modules have key, label, icon and tooltip', () => {
      for (const mod of adminNavigation.disabledModules) {
        expect(mod.key).toBeTruthy()
        expect(mod.label).toBeTruthy()
        expect(mod.icon).toBeTruthy()
        expect(mod.tooltip).toBeTruthy()
      }
    })

    it('disabled modules have unique keys', () => {
      const keys = adminNavigation.disabledModules.map(m => m.key)
      expect(new Set(keys).size).toBe(keys.length)
    })
  })

  describe('customerNavigation', () => {
    it('has audience set to customer', () => {
      expect(customerNavigation.audience).toBe('customer')
    })

    it('has 2 top links', () => {
      expect(customerNavigation.topLinks).toHaveLength(2)
    })

    it('has myPortal group', () => {
      expect(customerNavigation.groups).toHaveLength(1)
      expect(customerNavigation.groups[0].key).toBe('myPortal')
    })

    it('myPortal has 3 items', () => {
      expect(customerNavigation.groups[0].items).toHaveLength(3)
    })

    it('has no disabled modules', () => {
      expect(customerNavigation.disabledModules).toHaveLength(0)
    })

    it('all customer items have empty permissions (no filtering needed)', () => {
      for (const link of customerNavigation.topLinks) {
        expect(link.permissions).toHaveLength(0)
      }
      for (const item of customerNavigation.groups[0].items) {
        expect(item.permissions).toHaveLength(0)
      }
    })
  })

  describe('customerExtraLinks', () => {
    it('has catalog link to /productos', () => {
      expect(customerExtraLinks).toHaveLength(1)
      expect(customerExtraLinks[0].href).toBe('/productos')
    })
  })
})
