import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '../../components/base'

describe('Button iconOnly', () => {
  afterEach(() => vi.restoreAllMocks())

  it('deriva aria-label de title cuando no viene', () => {
    render(
      <Button iconOnly title="Eliminar">
        <i className="bi bi-trash" />
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Eliminar' })).toHaveAttribute('aria-label', 'Eliminar')
  })

  it('respeta aria-label explicito sobre title', () => {
    render(
      <Button iconOnly title="Borrar" aria-label="Eliminar almacen">
        <i className="bi bi-trash" />
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Eliminar almacen' })).toBeInTheDocument()
  })

  it('avisa en desarrollo si no hay aria-label ni title', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <Button iconOnly>
        <i className="bi bi-trash" />
      </Button>,
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('iconOnly'))
  })

  it('no agrega aria-label a botones con texto', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Button title="Guardar cambios">Guardar</Button>)
    expect(screen.getByRole('button', { name: 'Guardar' })).not.toHaveAttribute('aria-label')
    expect(warn).not.toHaveBeenCalled()
  })
})
