import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RowActions } from '../../components/patterns'

describe('RowActions', () => {
  it('renderiza Ver, Editar y Eliminar con title y aria-label', () => {
    const onDelete = vi.fn()
    const { container } = render(
      <RowActions viewHref="/dashboard/inventory/warehouses/1" editHref="/dashboard/inventory/warehouses/1/edit" onDelete={onDelete} />,
    )
    expect(container.firstChild).toHaveClass('btn-group', 'btn-group-sm')

    const view = screen.getByRole('link', { name: 'Ver' })
    expect(view).toHaveAttribute('href', '/dashboard/inventory/warehouses/1')
    expect(view).toHaveAttribute('title', 'Ver')
    expect(view.querySelector('i.bi-eye')).not.toBeNull()

    const edit = screen.getByRole('link', { name: 'Editar' })
    expect(edit).toHaveAttribute('href', '/dashboard/inventory/warehouses/1/edit')
    expect(edit.querySelector('i.bi-pencil')).not.toBeNull()

    const del = screen.getByRole('button', { name: 'Eliminar' })
    expect(del).toHaveAttribute('title', 'Eliminar')
    expect(del.querySelector('i.bi-trash')).not.toBeNull()
    fireEvent.click(del)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('omite las acciones sin prop y acepta etiquetas y extra', () => {
    render(
      <RowActions
        editHref="/x/edit"
        labels={{ edit: 'Editar almacen' }}
        extra={<button type="button" aria-label="Duplicar"><i className="bi bi-copy" /></button>}
      />,
    )
    expect(screen.queryByRole('link', { name: 'Ver' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Eliminar' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Editar almacen' })).toHaveAttribute('title', 'Editar almacen')
    expect(screen.getByRole('button', { name: 'Duplicar' })).toBeInTheDocument()
  })
})
