/**
 * usersService tests (v2).
 * Patron AAA con mock de axiosClient (barrel @lwm/auth).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { axiosClient } from '@lwm/auth'
import { usersService, DEFAULT_PAGE_SIZE } from '../../services/usersService'
import type { UserFormData } from '../../types/user'

vi.mock('@lwm/auth', () => ({
  axiosClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const jsonApiUser = (id: string, roleIds: string[] = []) => ({
  id,
  type: 'users',
  attributes: {
    name: `Usuario ${id}`,
    email: `user${id}@example.com`,
    status: 'active',
    emailVerifiedAt: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
    deletedAt: null,
  },
  relationships: {
    roles: { data: roleIds.map((rid) => ({ type: 'roles', id: rid })) },
  },
})

const jsonApiRole = (id: string, name: string) => ({
  id,
  type: 'roles',
  attributes: { name },
})

describe('usersService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUsers', () => {
    it('siempre manda paginacion e include=roles', async () => {
      // Arrange
      vi.mocked(axiosClient.get).mockResolvedValue({
        data: { data: [], included: [], meta: {} },
      })

      // Act
      await usersService.getUsers()

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/users', {
        params: {
          include: 'roles',
          'page[number]': 1,
          'page[size]': DEFAULT_PAGE_SIZE,
        },
      })
    })

    it('serializa filtros de busqueda, rol, estado y trashed', async () => {
      // Arrange
      vi.mocked(axiosClient.get).mockResolvedValue({
        data: { data: [], included: [], meta: {} },
      })

      // Act
      await usersService.getUsers(
        { search: 'gabino', role: 'admin', status: 'inactive', trashed: 'with' },
        3,
        10
      )

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/users', {
        params: {
          include: 'roles',
          'page[number]': 3,
          'page[size]': 10,
          'filter[search]': 'gabino',
          'filter[role]': 'admin',
          'filter[status]': 'inactive',
          'filter[trashed]': 'with',
        },
      })
    })

    it('transforma usuarios con sus roles del included y devuelve meta', async () => {
      // Arrange
      vi.mocked(axiosClient.get).mockResolvedValue({
        data: {
          data: [jsonApiUser('1', ['10', '20']), jsonApiUser('2')],
          included: [jsonApiRole('10', 'admin'), jsonApiRole('20', 'tech')],
          meta: { page: { currentPage: 1, lastPage: 4, total: 62, perPage: 20 } },
        },
      })

      // Act
      const result = await usersService.getUsers()

      // Assert
      expect(result.users).toHaveLength(2)
      expect(result.users[0].roles).toEqual([
        { id: '10', name: 'admin' },
        { id: '20', name: 'tech' },
      ])
      expect(result.users[1].roles).toEqual([])
      expect(result.users[0].name).toBe('Usuario 1')
      expect(result.users[0].email).toBe('user1@example.com')
      expect(result.meta.page?.total).toBe(62)
      expect(result.meta.page?.lastPage).toBe(4)
    })
  })

  describe('getUser', () => {
    it('pide include=roles y transforma el detalle', async () => {
      // Arrange
      vi.mocked(axiosClient.get).mockResolvedValue({
        data: {
          data: jsonApiUser('5', ['10']),
          included: [jsonApiRole('10', 'customer')],
        },
      })

      // Act
      const user = await usersService.getUser('5')

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/users/5', {
        params: { include: 'roles' },
      })
      expect(user.id).toBe('5')
      expect(user.roles).toEqual([{ id: '10', name: 'customer' }])
    })
  })

  describe('createUser', () => {
    it('manda attributes con password y relationship roles multi-rol', async () => {
      // Arrange
      vi.mocked(axiosClient.post).mockResolvedValue({
        data: { data: jsonApiUser('9', ['10']), included: [jsonApiRole('10', 'admin')] },
      })
      const formData: UserFormData = {
        name: 'Nuevo Usuario',
        email: 'nuevo@example.com',
        status: 'active',
        password: 'Secreta123!',
        passwordConfirmation: 'Secreta123!',
        roleIds: ['10', '20'],
      }

      // Act
      await usersService.createUser(formData)

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/users', {
        data: {
          type: 'users',
          attributes: {
            name: 'Nuevo Usuario',
            email: 'nuevo@example.com',
            status: 'active',
            password: 'Secreta123!',
            password_confirmation: 'Secreta123!',
          },
          relationships: {
            roles: {
              data: [
                { type: 'roles', id: '10' },
                { type: 'roles', id: '20' },
              ],
            },
          },
        },
      })
    })
  })

  describe('updateUser', () => {
    it('omite password del payload cuando viene vacio (no cambia)', async () => {
      // Arrange
      vi.mocked(axiosClient.patch).mockResolvedValue({
        data: { data: jsonApiUser('5', []) },
      })
      const formData: UserFormData = {
        name: 'Editado',
        email: 'editado@example.com',
        status: 'inactive',
        password: undefined,
        passwordConfirmation: undefined,
        roleIds: ['30'],
      }

      // Act
      await usersService.updateUser('5', formData)

      // Assert
      expect(axiosClient.patch).toHaveBeenCalledWith('/api/v1/users/5', {
        data: {
          type: 'users',
          id: '5',
          attributes: {
            name: 'Editado',
            email: 'editado@example.com',
            status: 'inactive',
          },
          relationships: {
            roles: { data: [{ type: 'roles', id: '30' }] },
          },
        },
      })
    })
  })

  describe('deleteUser', () => {
    it('hace DELETE al recurso (soft delete)', async () => {
      // Arrange
      vi.mocked(axiosClient.delete).mockResolvedValue({ data: null })

      // Act
      await usersService.deleteUser('7')

      // Assert
      expect(axiosClient.delete).toHaveBeenCalledWith('/api/v1/users/7')
    })
  })

  describe('restoreUser', () => {
    it('hace POST al endpoint custom y devuelve la respuesta simple', async () => {
      // Arrange
      vi.mocked(axiosClient.post).mockResolvedValue({
        data: {
          message: 'Usuario restaurado exitosamente',
          data: { id: 5, name: 'Test User', email: 'test@example.com' },
        },
      })

      // Act
      const result = await usersService.restoreUser('5')

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/users/5/restore')
      expect(result.message).toBe('Usuario restaurado exitosamente')
      expect(result.data.id).toBe(5)
    })
  })
})
