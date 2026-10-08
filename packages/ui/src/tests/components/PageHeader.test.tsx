import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageHeader } from '../../components/patterns'

describe('PageHeader', () => {
  it('renderiza titulo, subtitulo e icono', () => {
    const { container } = render(<PageHeader title="Almacenes" subtitle="Gestion de almacenes" icon="bi-building" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Almacenes' })).toHaveClass('h3', 'mb-1')
    expect(screen.getByText('Gestion de almacenes')).toHaveClass('text-muted', 'mb-0')
    expect(container.querySelector('i.bi-building')).not.toBeNull()
    expect(container.firstChild).toHaveClass('mb-4', 'd-flex', 'justify-content-between')
  })

  it('muestra enlace Volver cuando hay backHref', () => {
    render(<PageHeader title="Detalle" backHref="/dashboard/inventory" />)
    const back = screen.getByRole('link', { name: /Volver/ })
    expect(back).toHaveAttribute('href', '/dashboard/inventory')
  })

  it('respeta backLabel, badges, acciones y className', () => {
    const { container } = render(
      <PageHeader
        title="Lote"
        backHref="/x"
        backLabel="Regresar"
        badges={<span className="badge bg-success">Activo</span>}
        actions={<button type="button">Editar</button>}
        className="mb-2"
      />,
    )
    expect(screen.getByRole('link', { name: /Regresar/ })).toBeInTheDocument()
    expect(screen.getByText('Activo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('mb-2')
    expect(container.firstChild).not.toHaveClass('mb-4')
  })

  it('no pinta bloque derecho sin acciones ni backHref', () => {
    render(<PageHeader title="Solo titulo" />)
    expect(screen.queryByRole('link')).toBeNull()
  })
})
