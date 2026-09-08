/**
 * useUsers hook tests (SWR + paginacion server-side).
 * El service se mockea por ruta relativa (misma instancia que el SUT).
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { useUsers } from '../../hooks/useUsers'
import { usersService } from '../../services/usersService'
import type { User } from '../../types/user'

vi.mock('../../services/usersService', () => ({
  DEFAULT_PAGE_SIZE: 20,
  usersService: {
    getUsers: vi.fn(),
    getUser: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    restoreUser: vi.fn(),
  },
}))

const mockUser = (id: string): User => ({
  id,
  name: `Usuario ${id}`,
  email: `user${id}@example.com`,
  status: 'active',
  roles: [{ id: '1', name: 'admin' }],
  emailVerifiedAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
})

// Cache SWR aislada por test para que las keys no se contaminen.
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
)

describe('useUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devuelve usuarios y meta tras cargar', async () => {
    // Arrange
    vi.mocked(usersService.getUsers).mockResolvedValue({
      users: [mockUser('1'), mockUser('2')],
      meta: { page: { currentPage: 1, lastPage: 3, total: 41, perPage: 20 } },
    })

    // Act
    const { result } = renderHook(() => useUsers({}, 1), { wrapper })

    // Assert
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.users).toHaveLength(2)
    expect(result.current.users[0].name).toBe('Usuario 1')
    expect(result.current.meta.page?.total).toBe(41)
    expect(usersService.getUsers).toHaveBeenCalledWith({}, 1, 20)
  })

  it('pasa filtros y pagina al service', async () => {
    // Arrange
    vi.mocked(usersService.getUsers).mockResolvedValue({ users: [], meta: {} })
    const filters = { search: 'ana', role: 'tech', trashed: 'with' as const }

    // Act
    const { result } = renderHook(() => useUsers(filters, 2, 10), { wrapper })

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(usersService.getUsers).toHaveBeenCalledWith(filters, 2, 10)
  })

  it('refetch al cambiar de pagina (key serializada por filtros+pagina)', async () => {
    // Arrange
    vi.mocked(usersService.getUsers).mockResolvedValue({ users: [], meta: {} })

    // Act
    const { result, rerender } = renderHook(
      ({ page }: { page: number }) => useUsers({}, page),
      { wrapper, initialProps: { page: 1 } }
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    rerender({ page: 2 })

    // Assert
    await waitFor(() =>
      expect(usersService.getUsers).toHaveBeenCalledWith({}, 2, 20)
    )
  })

  it('expone el error cuando el service falla', async () => {
    // Arrange
    const failure = new Error('Network down')
    vi.mocked(usersService.getUsers).mockRejectedValue(failure)

    // Act
    const { result } = renderHook(() => useUsers({}, 1), { wrapper })

    // Assert
    await waitFor(() => expect(result.current.error).toBe(failure))
    expect(result.current.users).toEqual([])
  })
})
