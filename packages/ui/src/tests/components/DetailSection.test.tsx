import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DetailSection } from '../../components/patterns'

describe('DetailSection', () => {
  it('renderiza card con encabezado h5 e icono', () => {
    const { container } = render(
      <DetailSection title="Informacion general" icon="bi-info-circle">
        <p>Contenido</p>
      </DetailSection>,
    )
    expect(container.firstChild).toHaveClass('card', 'mb-4')
    expect(screen.getByRole('heading', { level: 5, name: 'Informacion general' })).toBeInTheDocument()
    expect(container.querySelector('.card-header i.bi-info-circle')).not.toBeNull()
    expect(screen.getByText('Contenido').parentElement).toHaveClass('card-body')
  })

  it('acepta acciones de encabezado y clases propias', () => {
    const { container } = render(
      <DetailSection
        title="Resumen"
        headerActions={<button type="button">Editar</button>}
        className="card"
        bodyClassName="p-0"
      >
        <span>x</span>
      </DetailSection>,
    )
    expect(container.firstChild).not.toHaveClass('mb-4')
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    expect(container.querySelector('.card-body')).toHaveClass('p-0')
  })
})
