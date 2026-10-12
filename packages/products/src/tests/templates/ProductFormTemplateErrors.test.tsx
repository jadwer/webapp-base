/**
 * El 422 del producto se muestra con el detail del backend en espanol, sin
 * anteponer el atributo de la API ("price: ...") (regla 9, E2E granel).
 */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const mutationError = {
  message: 'Request failed with status code 422',
  response: {
    status: 422,
    data: {
      errors: [
        {
          status: '422',
          detail: 'El precio de venta debe ser mayor a 0 con precio fijo.',
          source: { pointer: '/data/attributes/price' },
        },
      ],
    },
  },
}

vi.mock('@lwm/ui', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({ children }: { children: React.ReactNode }) => <button type="button">{children}</button>,
  useNavigationProgress: () => ({ push: vi.fn(), back: vi.fn() }),
}))
vi.mock('../../hooks', () => ({
  useProduct: () => ({ product: null, isLoading: false, error: null }),
  useProductMutations: () => ({ createProduct: vi.fn(), updateProduct: vi.fn(), error: mutationError }),
}))
vi.mock('../../components/ProductForm', () => ({ default: () => null }))

import { ProductFormTemplate } from '../../templates/ProductFormTemplate.html'

describe('ProductFormTemplate errores de guardado', () => {
  it('muestra el detail en espanol sin el nombre del campo en ingles', () => {
    render(<ProductFormTemplate />)
    expect(screen.getByText('El precio de venta debe ser mayor a 0 con precio fijo.')).toBeInTheDocument()
    const alert = screen.getByRole('alert')
    expect(alert.textContent).not.toContain('price:')
    expect(alert.textContent).not.toMatch(/\bprice\b/)
  })
})
