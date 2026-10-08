import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard } from '../../components/patterns'

describe('KpiCard', () => {
  it('muestra etiqueta, valor y hint', () => {
    render(<KpiCard label="Productos en stock" value={120} hint="Todas las sucursales" icon="bi-box" />)
    expect(screen.getByText('Productos en stock')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('Todas las sucursales')).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('muestra -- mientras carga', () => {
    render(<KpiCard label="Lotes" value={7} isLoading />)
    expect(screen.getByText('--')).toBeInTheDocument()
    expect(screen.queryByText('7')).toBeNull()
  })

  it('con href renderiza un enlace', () => {
    render(<KpiCard label="Bajo minimo" value={3} href="/dashboard/inventory/stock" variant="warning" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/dashboard/inventory/stock')
    expect(link).toHaveClass('card', 'border-warning')
  })
})
