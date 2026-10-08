import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '../../components/patterns'

describe('EmptyState', () => {
  it('usa icono bi-inbox y clases por defecto', () => {
    const { container } = render(<EmptyState title="Sin registros" />)
    expect(container.firstChild).toHaveClass('text-center', 'py-5')
    expect(container.querySelector('i.bi-inbox.display-4')).not.toBeNull()
    expect(screen.getByText('Sin registros').tagName).toBe('H6')
  })

  it('muestra descripcion, accion e icono propio', () => {
    const { container } = render(
      <EmptyState
        icon="bi-box"
        title="Sin lotes"
        description="Crea el primero"
        action={<button type="button">Nuevo lote</button>}
      />,
    )
    expect(container.querySelector('i.bi-box')).not.toBeNull()
    expect(screen.getByText('Crea el primero')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nuevo lote' })).toBeInTheDocument()
  })
})
