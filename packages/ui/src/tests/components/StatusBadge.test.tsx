import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge, type StatusBadgeMap } from '../../components/patterns'

const MAP: StatusBadgeMap = {
  active: { label: 'Activo', variant: 'success', icon: 'bi-check' },
  quarantine: { label: 'Cuarentena', variant: 'warning' },
  info: { label: 'Info', variant: 'info' },
}

describe('StatusBadge', () => {
  it('usa label y variante del mapa', () => {
    const { container } = render(<StatusBadge status="active" map={MAP} />)
    const badge = screen.getByText('Activo')
    expect(badge).toHaveClass('badge', 'bg-success')
    expect(badge).not.toHaveClass('text-dark')
    expect(container.querySelector('i.bi-check')).not.toBeNull()
  })

  it('agrega text-dark en warning e info', () => {
    render(<><StatusBadge status="quarantine" map={MAP} /><StatusBadge status="info" map={MAP} /></>)
    expect(screen.getByText('Cuarentena')).toHaveClass('bg-warning', 'text-dark')
    expect(screen.getByText('Info')).toHaveClass('bg-info', 'text-dark')
  })

  it('valor desconocido muestra el crudo en gris', () => {
    render(<StatusBadge status="weird" map={MAP} />)
    expect(screen.getByText('weird')).toHaveClass('bg-secondary')
  })

  it('usa fallback cuando se pasa', () => {
    render(<StatusBadge status={null} map={MAP} fallback={{ label: 'Desconocido', variant: 'light' }} />)
    expect(screen.getByText('Desconocido')).toHaveClass('bg-light', 'text-dark')
  })
})
