/**
 * Un cliente solo abre las rutas de su portal (24-10: Carla Cliente entraba
 * a /dashboard/ecommerce/orders y veia la gestion de ordenes).
 */
import { describe, it, expect } from 'vitest'
import { customerCanOpen, staffCanOpen } from '../../components/DashboardLayout'
import type { NavigationConfig } from '../../hooks/useNavigation'

const item = (href: string) => ({ href, label: href, icon: 'bi-x', permissions: [] })
const config = {
  admin: { audience: 'admin', topLinks: [], groups: [], disabledModules: [] },
  customer: {
    audience: 'customer',
    topLinks: [item('/dashboard'), item('/dashboard/profile')],
    groups: [{ key: 'portal', label: 'Mi Portal', icon: 'bi-x', permissions: [], items: [item('/dashboard/my-orders'), item('/dashboard/my-quotes')] }],
    disabledModules: [],
  },
  customerExtraLinks: [item('/productos')],
} as unknown as NavigationConfig

describe('customerCanOpen', () => {
  it('permite las rutas del portal y sus subrutas', () => {
    expect(customerCanOpen('/dashboard', config)).toBe(true)
    expect(customerCanOpen('/dashboard/profile', config)).toBe(true)
    expect(customerCanOpen('/dashboard/my-orders/12', config)).toBe(true)
  })

  it('bloquea las rutas de administración', () => {
    expect(customerCanOpen('/dashboard/ecommerce/orders', config)).toBe(false)
    expect(customerCanOpen('/dashboard/users', config)).toBe(false)
    expect(customerCanOpen('/dashboard/my-orders-x', config)).toBe(false)
  })
})

describe('staffCanOpen', () => {
  const menu = {
    topLinks: [item('/dashboard')],
    groups: [{ items: [item('/dashboard/quotes'), item('/dashboard/contacts')] }],
  }

  it('abre su menu, subrutas y su perfil', () => {
    expect(staffCanOpen('/dashboard', menu)).toBe(true)
    expect(staffCanOpen('/dashboard/quotes/create', menu)).toBe(true)
    expect(staffCanOpen('/dashboard/contacts/7', menu)).toBe(true)
    expect(staffCanOpen('/dashboard/profile', menu)).toBe(true)
  })

  it('no abre lo que sus permisos no cubren', () => {
    expect(staffCanOpen('/dashboard/finance/ar-invoices', menu)).toBe(false)
    expect(staffCanOpen('/dashboard/users', menu)).toBe(false)
  })
})

describe('staffCanOpen con el menu de administración completo', () => {
  const admin = {
    topLinks: [item('/dashboard')],
    groups: [{ items: [item('/dashboard/inventory'), item('/dashboard/inventory/stock'), item('/dashboard/inventory/fraccionamiento')] }],
  }
  const own = { topLinks: [item('/dashboard')], groups: [{ items: [item('/dashboard/inventory'), item('/dashboard/inventory/stock')] }] }

  it('el enlace más especifico decide', () => {
    expect(staffCanOpen('/dashboard/inventory', own, admin)).toBe(true)
    expect(staffCanOpen('/dashboard/inventory/stock/4', own, admin)).toBe(true)
    expect(staffCanOpen('/dashboard/inventory/fraccionamiento', own, admin)).toBe(false)
  })
})

