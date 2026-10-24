/**
 * Un cliente solo abre las rutas de su portal (24-10: Carla Cliente entraba
 * a /dashboard/ecommerce/orders y veia la gestion de ordenes).
 */
import { describe, it, expect } from 'vitest'
import { customerCanOpen } from '../../components/DashboardLayout'
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

  it('bloquea las rutas de administracion', () => {
    expect(customerCanOpen('/dashboard/ecommerce/orders', config)).toBe(false)
    expect(customerCanOpen('/dashboard/users', config)).toBe(false)
    expect(customerCanOpen('/dashboard/my-orders-x', config)).toBe(false)
  })
})
