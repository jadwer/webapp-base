import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@lwm/app-config', () => ({
  usePublicSettings: () => ({ get: (key: string) => (key === 'company.name' ? 'Tu Marca' : null) }),
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
})
