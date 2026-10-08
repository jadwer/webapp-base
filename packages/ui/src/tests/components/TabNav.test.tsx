import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TabNav } from '../../components/patterns'

const mockUsePathname = vi.fn(() => '/dashboard/inventory/warehouses')

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
}))

const LINK_TABS = [
  { key: 'warehouses', label: 'Almacenes', href: '/dashboard/inventory/warehouses' },
  { key: 'locations', label: 'Ubicaciones', href: '/dashboard/inventory/locations', count: 4 },
]

describe('TabNav', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard/inventory/warehouses')
  })

  it('modo enlace: activo por pathname exacto', () => {
    render(<TabNav tabs={LINK_TABS} />)
    expect(screen.getByRole('tab', { name: 'Almacenes' })).toHaveClass('nav-link', 'active')
    expect(screen.getByRole('tab', { name: /Ubicaciones/ })).not.toHaveClass('active')
    expect(screen.getByRole('tab', { name: /Ubicaciones/ })).toHaveAttribute('href', '/dashboard/inventory/locations')
  })

  it('modo enlace: una sub-ruta no activa la pestana', () => {
    mockUsePathname.mockReturnValue('/dashboard/inventory/warehouses/5')
    render(<TabNav tabs={LINK_TABS} />)
    expect(screen.getByRole('tab', { name: 'Almacenes' })).not.toHaveClass('active')
  })

  it('muestra contador', () => {
    render(<TabNav tabs={LINK_TABS} />)
    expect(screen.getByText('4')).toHaveClass('badge')
  })

  it('modo estado: activeKey y onChange', () => {
    const onChange = vi.fn()
    render(
      <TabNav
        tabs={[{ key: 'a', label: 'General' }, { key: 'b', label: 'Historial' }]}
        activeKey="a"
        onChange={onChange}
      />,
    )
    expect(screen.getByRole('tab', { name: 'General' })).toHaveClass('active')
    fireEvent.click(screen.getByRole('tab', { name: 'Historial' }))
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('clase por defecto nav nav-tabs mb-3', () => {
    const { container } = render(<TabNav tabs={LINK_TABS} />)
    expect(container.firstChild).toHaveClass('nav', 'nav-tabs', 'mb-3')
  })
})
