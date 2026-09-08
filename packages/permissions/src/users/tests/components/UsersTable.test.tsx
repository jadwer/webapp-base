/**
 * UsersTable tests: badges multi-rol y fila eliminada con Restaurar.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UsersTable } from '../../components/UsersTable'
import type { User } from '../../types/user'

const baseUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  name: 'Gabino Ramírez',
  email: 'gabino@example.com',
  status: 'active',
  roles: [],
  emailVerifiedAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
  ...overrides,
})

describe('UsersTable', () => {
  it('renderiza multiples roles como badges', () => {
    // Arrange
    const user = baseUser({
      roles: [
        { id: '1', name: 'admin' },
        { id: '2', name: 'tech' },
        { id: '3', name: 'customer' },
      ],
    })

    // Act
    render(<UsersTable users={[user]} />)

    // Assert
    expect(screen.getByText('admin')).toBeInTheDocument()
    expect(screen.getByText('tech')).toBeInTheDocument()
    expect(screen.getByText('customer')).toBeInTheDocument()
    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  it('muestra "Sin rol" cuando el usuario no tiene roles', () => {
    // Arrange + Act
    render(<UsersTable users={[baseUser()]} />)

    // Assert
    expect(screen.getByText('Sin rol')).toBeInTheDocument()
  })

  it('fila eliminada: atenuada, badge Eliminado y boton Restaurar en vez de acciones', () => {
    // Arrange
    const onRestore = vi.fn()
    const onDelete = vi.fn()
    const deleted = baseUser({
      id: '9',
      name: 'Usuario Borrado',
      deletedAt: '2026-08-01T00:00:00Z',
    })

    // Act
    render(
      <UsersTable
        users={[deleted]}
        onRestore={onRestore}
        onDelete={onDelete}
        onView={vi.fn()}
        onEdit={vi.fn()}
      />
    )

    // Assert - fila atenuada con Restaurar y sin Eliminar
    const row = screen.getByText('Usuario Borrado').closest('tr') as HTMLTableRowElement
    expect(row.className).toContain('opacity-50')
    expect(screen.getByText('Eliminado')).toBeInTheDocument()
    const restoreButton = screen.getByRole('button', { name: /Restaurar/ })
    expect(restoreButton).toBeInTheDocument()
    expect(screen.queryByTitle('Eliminar')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Editar')).not.toBeInTheDocument()

    // Act - restaurar
    fireEvent.click(restoreButton)

    // Assert
    expect(onRestore).toHaveBeenCalledWith(deleted)
  })

  it('estado banned se muestra como Bloqueado en rojo', () => {
    // Arrange + Act
    render(<UsersTable users={[baseUser({ status: 'banned' })]} />)

    // Assert
    const badge = screen.getByText('Bloqueado')
    expect(badge.className).toContain('bg-danger')
  })

  it('muestra estado vacio cuando no hay usuarios', () => {
    // Arrange + Act
    render(<UsersTable users={[]} />)

    // Assert
    expect(screen.getByText('No se encontraron usuarios')).toBeInTheDocument()
  })
})
