/**
 * Sidebar tests: comportamiento acordeon de los grupos (abrir uno
 * cierra el anterior) y auto-expand del grupo mas especifico segun el
 * pathname. Los estados abierto/cerrado se leen via aria-expanded del
 * boton de grupo.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Sidebar from '../../components/Sidebar'
import type { NavigationConfig } from '../../hooks/useNavigation'

const mockUsePathname = vi.fn(() => '/dashboard')

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
}))
vi.mock('@lwm/auth', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Admin', email: 'admin@example.com', roles: ['god'] },
    isLoading: false,
  }),
  isAdmin: () => true,
  hasAnyRole: () => false,
  hasAnyPermission: () => true,
}))
vi.mock('../../components/NavigationProgress', () => ({
  default: () => null,
}))

const config: NavigationConfig = {
  admin: {
    audience: 'admin',
    topLinks: [],
    groups: [
      {
        key: 'contacts',
        label: 'Contactos',
        icon: 'bi-person-rolodex',
        activePathPrefixes: ['/dashboard/contacts'],
        permissions: [],
        items: [
          { href: '/dashboard/contacts', label: 'Directorio', icon: 'bi-list', permissions: [] },
        ],
      },
      {
        key: 'sales',
        label: 'Ventas',
        icon: 'bi-cart-check',
        activePathPrefixes: ['/dashboard/sales', '/dashboard/contacts/customers'],
        permissions: [],
        items: [
          { href: '/dashboard/sales', label: 'Ordenes', icon: 'bi-cart', permissions: [] },
        ],
      },
    ],
    disabledModules: [],
  },
  customer: {
    audience: 'customer',
    topLinks: [],
    groups: [],
    disabledModules: [],
  },
}

const groupButton = (label: string) =>
  screen.getByRole('button', { name: new RegExp(label) })

describe('Sidebar - acordeon de grupos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue('/dashboard')
  })

  it('abrir un grupo cierra el anterior', () => {
    // Arrange
    render(<Sidebar navigationConfig={config} />)

    // Act - abrir Contactos
    fireEvent.click(groupButton('Contactos'))

    // Assert
    expect(groupButton('Contactos')).toHaveAttribute('aria-expanded', 'true')
    expect(groupButton('Ventas')).toHaveAttribute('aria-expanded', 'false')

    // Act - abrir Ventas cierra Contactos
    fireEvent.click(groupButton('Ventas'))
    expect(groupButton('Ventas')).toHaveAttribute('aria-expanded', 'true')
    expect(groupButton('Contactos')).toHaveAttribute('aria-expanded', 'false')
  })

  it('volver a pulsar el grupo abierto lo cierra (todo colapsado)', () => {
    // Arrange
    render(<Sidebar navigationConfig={config} />)

    // Act
    fireEvent.click(groupButton('Contactos'))
    fireEvent.click(groupButton('Contactos'))

    // Assert
    expect(groupButton('Contactos')).toHaveAttribute('aria-expanded', 'false')
    expect(groupButton('Ventas')).toHaveAttribute('aria-expanded', 'false')
  })

  it('auto-expande SOLO el grupo con el prefijo mas especifico del pathname', () => {
    // Arrange - /dashboard/contacts/customers matchea Contactos y Ventas;
    // gana Ventas por prefijo mas largo.
    mockUsePathname.mockReturnValue('/dashboard/contacts/customers')

    // Act
    render(<Sidebar navigationConfig={config} />)

    // Assert
    expect(groupButton('Ventas')).toHaveAttribute('aria-expanded', 'true')
    expect(groupButton('Contactos')).toHaveAttribute('aria-expanded', 'false')
  })
})
