/**
 * Sucursales: servicio JSON:API (nucleo en @lwm/auth).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axiosClient from '../../lib/axiosClient'
import { branchesService } from '../../branches/branchesService'

vi.mock('../../lib/axiosClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const branch = (id: string, name: string, isMain = false) => ({
  id,
  type: 'branches',
  attributes: { name, code: name.slice(0, 3).toUpperCase(), city: null, isActive: true, isMain },
})

describe('branchesService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lista con la principal primero y luego por nombre', async () => {
    vi.mocked(axiosClient.get).mockResolvedValue({
      data: { data: [branch('2', 'Toluca'), branch('3', 'Querétaro'), branch('1', 'Matriz', true)] },
    })

    const result = await branchesService.getAll()

    expect(axiosClient.get).toHaveBeenCalledWith('/api/v1/branches', { params: { sort: 'name', 'page[size]': 100 } })
    expect(result.map((b) => b.name)).toEqual(['Matriz', 'Querétaro', 'Toluca'])
    expect(result[0].isMain).toBe(true)
  })

  it('crea con clave en mayusculas y vacios como null', async () => {
    vi.mocked(axiosClient.post).mockResolvedValue({ data: { data: branch('4', 'Toluca') } })

    await branchesService.create({
      name: ' Sucursal Toluca ',
      code: 'tol',
      address: '',
      city: 'Toluca',
      state: '',
      postalCode: '',
      phone: '',
      email: '',
      isActive: true,
      isMain: false,
    })

    expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/branches', {
      data: {
        type: 'branches',
        attributes: {
          name: 'Sucursal Toluca',
          code: 'TOL',
          address: null,
          city: 'Toluca',
          state: null,
          postalCode: null,
          phone: null,
          email: null,
          isActive: true,
          isMain: false,
        },
      },
    })
  })
})
