/**
 * Personal con rol propio (ni admin ni cliente): recibe el menu admin
 * filtrado por sus permisos. Antes se quedaba sin menu (vendedor de la
 * demo con rol "ventas", 23-10).
 */
import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { NavigationConfig } from '../../hooks/useNavigation'

const user = { id: '2', name: 'Víctor', roles: ['ventas'], perms: ['quotes.index'] }
vi.mock('@lwm/auth', () => ({
  useAuth: () => ({ user, isLoading: false }),
  isAdmin: () => false,
  hasAnyRole: (_u: unknown, roles: string[]) => roles.some((r) => user.roles.includes(r)),
  hasAnyPermission: (_u: unknown, perms: string[]) => perms.some((p) => user.perms.includes(p)),
}))

import { useNavigation } from '../../hooks/useNavigation'

const item = (href: string, permissions: string[]) => ({ href, label: href, icon: 'bi-x', permissions })
const config: NavigationConfig = {
  admin: {
    audience: 'admin',
    topLinks: [item('/dashboard', [])],
    groups: [
      { key: 'sales', label: 'Ventas', icon: 'bi-cart', permissions: [], items: [item('/dashboard/quotes', ['quotes.index'])] },
      { key: 'hr', label: 'RH', icon: 'bi-people', permissions: [], items: [item('/dashboard/hr', ['hr.employees.index'])] },
      { key: 'system', label: 'Sistema', icon: 'bi-gear', permissions: [], items: [item('/dashboard/diagnostic', [])] },
    ],
    disabledModules: [],
  },
  customer: { audience: 'customer', topLinks: [], groups: [], disabledModules: [] },
  customerExtraLinks: [],
} as unknown as NavigationConfig

describe('useNavigation - personal', () => {
  it('da el menu admin filtrado por permisos', () => {
    const { result } = renderHook(() => useNavigation(config))
    expect(result.current.isStaff).toBe(true)
    expect(result.current.isUserAdmin).toBe(false)
    expect(result.current.isCustomer).toBe(false)
    expect(result.current.groups.map((g) => g.key)).toEqual(['sales'])
    expect(result.current.topLinks.map((l) => l.href)).toEqual(['/dashboard'])
  })

  it('el cliente sigue con su portal', () => {
    user.roles = ['customer']
    const { result } = renderHook(() => useNavigation(config))
    expect(result.current.isStaff).toBe(false)
    expect(result.current.isCustomer).toBe(true)
    user.roles = ['ventas']
  })
})
