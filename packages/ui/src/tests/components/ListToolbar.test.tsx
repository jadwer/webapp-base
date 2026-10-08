import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ListToolbar } from '../../components/patterns'

describe('ListToolbar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('aplica debounce de 300 ms por defecto', () => {
    const onChange = vi.fn()
    render(<ListToolbar search={{ value: '', onChange, placeholder: 'Buscar almacen' }} />)
    const input = screen.getByPlaceholderText('Buscar almacen')

    fireEvent.change(input, { target: { value: 'a' } })
    fireEvent.change(input, { target: { value: 'ab' } })
    act(() => { vi.advanceTimersByTime(299) })
    expect(onChange).not.toHaveBeenCalled()

    act(() => { vi.advanceTimersByTime(1) })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('ab')
  })

  it('respeta debounceMs personalizado', () => {
    const onChange = vi.fn()
    render(<ListToolbar search={{ value: '', onChange, debounceMs: 50 }} />)
    fireEvent.change(screen.getByPlaceholderText('Buscar...'), { target: { value: 'x' } })
    act(() => { vi.advanceTimersByTime(50) })
    expect(onChange).toHaveBeenCalledWith('x')
  })

  it('limpiar llama onChange inmediato y cancela el pendiente', () => {
    const onChange = vi.fn()
    render(<ListToolbar search={{ value: 'abc', onChange }} />)
    fireEvent.change(screen.getByDisplayValue('abc'), { target: { value: 'abcd' } })
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar busqueda' }))
    expect(onChange).toHaveBeenCalledWith('')
    act(() => { vi.advanceTimersByTime(500) })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('sin valor no muestra boton limpiar', () => {
    render(<ListToolbar search={{ value: '', onChange: vi.fn() }} />)
    expect(screen.queryByRole('button', { name: 'Limpiar busqueda' })).toBeNull()
  })

  it('sincroniza el valor externo', () => {
    const onChange = vi.fn()
    const { rerender } = render(<ListToolbar search={{ value: 'uno', onChange }} />)
    rerender(<ListToolbar search={{ value: 'dos', onChange }} />)
    expect(screen.getByDisplayValue('dos')).toBeInTheDocument()
  })

  it('renderiza children y acciones en una fila', () => {
    const { container } = render(
      <ListToolbar actions={<button type="button">Exportar</button>}>
        <select aria-label="Estado" className="form-select" />
      </ListToolbar>,
    )
    expect(container.firstChild).toHaveClass('row', 'g-2', 'mb-3')
    expect(screen.getByLabelText('Estado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Exportar' })).toBeInTheDocument()
    expect(container.querySelector('input')).toBeNull()
  })
})
