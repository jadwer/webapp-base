/**
 * Sucursales (multi-sucursal sprint 2): relaciones de sucursal en el
 * alta/edicion de usuario. El servicio de sucursales se prueba en @lwm/auth.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { axiosClient } from '@lwm/auth'
import { usersService } from '../../users/services/usersService'

vi.mock('@lwm/auth', () => ({
  axiosClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

describe('usersService con sucursales', () => {
  beforeEach(() => vi.clearAllMocks())

  it('manda sucursal principal y sucursales con acceso como relaciones', async () => {
    vi.mocked(axiosClient.post).mockResolvedValue({
      data: {
        data: {
          id: '9',
          type: 'users',
          attributes: { name: 'Ana', email: 'ana@example.com', status: 'active' },
          relationships: {
            roles: { data: [] },
            branch: { data: { type: 'branches', id: '2' } },
            branches: { data: [{ type: 'branches', id: '2' }, { type: 'branches', id: '3' }] },
          },
        },
      },
    })

    const user = await usersService.createUser({
      name: 'Ana',
      email: 'ana@example.com',
      status: 'active',
      password: 'Secreta123!',
      passwordConfirmation: 'Secreta123!',
      roleIds: [],
      branchId: '2',
      branchIds: ['2', '3'],
    })

    const payload = vi.mocked(axiosClient.post).mock.calls[0][1] as { data: { relationships: Record<string, unknown> } }
    expect(payload.data.relationships.branch).toEqual({ data: { type: 'branches', id: '2' } })
    expect(payload.data.relationships.branches).toEqual({
      data: [{ type: 'branches', id: '2' }, { type: 'branches', id: '3' }],
    })
    expect(user.branchId).toBe('2')
    expect(user.branchIds).toEqual(['2', '3'])
  })

  it('sin sucursal en el formulario no toca las relaciones de sucursal', async () => {
    vi.mocked(axiosClient.patch).mockResolvedValue({
      data: { data: { id: '9', type: 'users', attributes: { name: 'Ana' }, relationships: { roles: { data: [] } } } },
    })

    await usersService.updateUser('9', { name: 'Ana', email: 'ana@example.com', status: 'active', roleIds: [] })

    const payload = vi.mocked(axiosClient.patch).mock.calls[0][1] as { data: { relationships: Record<string, unknown> } }
    expect(payload.data.relationships).not.toHaveProperty('branch')
    expect(payload.data.relationships).not.toHaveProperty('branches')
  })

  it('branchId null limpia la principal (el backend asigna la Matriz al crear)', async () => {
    vi.mocked(axiosClient.patch).mockResolvedValue({
      data: { data: { id: '9', type: 'users', attributes: { name: 'Ana' }, relationships: { roles: { data: [] } } } },
    })

    await usersService.updateUser('9', {
      name: 'Ana',
      email: 'ana@example.com',
      status: 'active',
      roleIds: [],
      branchId: null,
      branchIds: [],
    })

    const payload = vi.mocked(axiosClient.patch).mock.calls[0][1] as { data: { relationships: Record<string, unknown> } }
    expect(payload.data.relationships.branch).toEqual({ data: null })
    expect(payload.data.relationships.branches).toEqual({ data: [] })
  })
})
