import { describe, it, expect, vi, beforeEach } from 'vitest'
import { axiosClient } from '@lwm/auth'
import { getAllUsers, restoreUser } from '../../services/usersService'

vi.mock('@lwm/auth', async () => {
  const actual = await vi.importActual<typeof import('@lwm/auth')>('@lwm/auth')
  return {
    ...actual,
    axiosClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  }
})

describe('usersService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllUsers', () => {
    it('should fetch users without trashed filter by default', async () => {
      vi.mocked(axiosClient.get).mockResolvedValue({
        data: { data: [], included: [] }
      })

      await getAllUsers()

      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/users?include=roles')
    })

    it('should add trashed filter when provided', async () => {
      vi.mocked(axiosClient.get).mockResolvedValue({
        data: { data: [], included: [] }
      })

      await getAllUsers({ trashed: 'with' })

      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/users?include=roles&filter[trashed]=with')
    })

    it('should add trashed=only filter', async () => {
      vi.mocked(axiosClient.get).mockResolvedValue({
        data: { data: [], included: [] }
      })

      await getAllUsers({ trashed: 'only' })

      expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/users?include=roles&filter[trashed]=only')
    })
  })

  describe('restoreUser', () => {
    it('should call restore endpoint', async () => {
      vi.mocked(axiosClient.post).mockResolvedValue({
        data: {
          message: 'Usuario restaurado exitosamente',
          data: { id: 5, name: 'Test User', email: 'test@example.com' }
        }
      })

      const result = await restoreUser('5')

      expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/users/5/restore')
      expect(result.message).toBe('Usuario restaurado exitosamente')
      expect(result.data.id).toBe(5)
    })
  })
})
