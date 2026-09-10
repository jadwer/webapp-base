/**
 * UsersAdminPage tests: selector de usuarios por pagina (5/10/50/100)
 * y reset de pagina al cambiar el tamano.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UsersAdminPage, PAGE_SIZE_OPTIONS } from '../../components/UsersAdminPage'
import { useUsers, useUserMutations } from '../../hooks/useUsers'
import { useRoleOptions } from '../../hooks/useRoleOptions'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/dashboard/users',
}))
vi.mock('../../hooks/useUsers', () => ({
  useUsers: vi.fn(),
  useUserMutations: vi.fn(),
}))
vi.mock('../../hooks/useRoleOptions', () => ({
  useRoleOptions: vi.fn(),
}))

describe('UsersAdminPage - selector por pagina', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRoleOptions).mockReturnValue({
      roles: [],
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
    })
    vi.mocked(useUserMutations).mockReturnValue({
      createUser: vi.fn(),
      updateUser: vi.fn(),
      removeUser: vi.fn(),
      restoreUser: vi.fn(),
    })
    vi.mocked(useUsers).mockReturnValue({
      users: [],
      meta: {
        page: { currentPage: 1, lastPage: 3, perPage: 10, total: 25 },
      },
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useUsers>)
  })

  it('renderiza las opciones 5/10/50/100 con 10 por defecto', () => {
    // Arrange + Act
    render(<UsersAdminPage />)
    const select = screen.getByLabelText('Usuarios por página') as HTMLSelectElement

    // Assert
    expect(select.value).toBe('10')
    const values = Array.from(select.options).map((o) => Number(o.value))
    expect(values).toEqual(PAGE_SIZE_OPTIONS)
    expect(PAGE_SIZE_OPTIONS).toEqual([5, 10, 50, 100])
  })

  it('cambiar el tamano consulta con el nuevo page[size]', () => {
    // Arrange
    render(<UsersAdminPage />)

    // Act
    fireEvent.change(screen.getByLabelText('Usuarios por página'), {
      target: { value: '50' },
    })

    // Assert - ultima llamada al hook: pagina 1, tamano 50
    const lastCall = vi.mocked(useUsers).mock.calls.at(-1)
    expect(lastCall?.[1]).toBe(1)
    expect(lastCall?.[2]).toBe(50)
  })

  it('cambiar el tamano regresa a la pagina 1 aunque estes en otra', () => {
    // Arrange - ir a la pagina 2 via paginacion
    render(<UsersAdminPage />)
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    let lastCall = vi.mocked(useUsers).mock.calls.at(-1)
    expect(lastCall?.[1]).toBe(2)

    // Act
    fireEvent.change(screen.getByLabelText('Usuarios por página'), {
      target: { value: '100' },
    })

    // Assert
    lastCall = vi.mocked(useUsers).mock.calls.at(-1)
    expect(lastCall?.[1]).toBe(1)
    expect(lastCall?.[2]).toBe(100)
  })
})
