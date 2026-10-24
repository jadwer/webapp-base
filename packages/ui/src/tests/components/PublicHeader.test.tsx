import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const settings: Record<string, string | null> = { 'company.name': 'Tu Marca', 'company.logo_path': null }
vi.mock('@lwm/app-config', () => ({
  usePublicSettings: () => ({ get: (key: string) => settings[key] ?? null }),
}))

import { PublicHeader } from '../../components/PublicHeader'

describe('PublicHeader', () => {
  it('muestra el nombre configurado de la empresa', () => {
    render(<PublicHeader />)
    expect(screen.getByRole('link', { name: 'Tu Marca, inicio' })).toBeInTheDocument()
  })

  it('pinta el carrito solo cuando se inyecta', () => {
    const { rerender } = render(<PublicHeader />)
    expect(screen.queryByTestId('cart-slot')).not.toBeInTheDocument()
    rerender(<PublicHeader cart={<span data-testid="cart-slot">carrito</span>} />)
    expect(screen.getByTestId('cart-slot')).toBeInTheDocument()
  })
  it('muestra logo y nombre, y oculta el logo si no carga', () => {
    settings['company.logo_path'] = '/images/brand/logo.png'
    const { container } = render(<PublicHeader />)
    const img = container.querySelector('header img') as HTMLImageElement
    expect(img).toBeInTheDocument()
    expect(screen.getByText('Tu Marca')).toBeInTheDocument()
    fireEvent.error(img)
    expect(container.querySelector('header img')).not.toBeInTheDocument()
    settings['company.logo_path'] = null
  })
})
