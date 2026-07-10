import { describe, it, expect, vi, beforeEach } from 'vitest'
import { axiosClient as axios } from '@lwm/auth'
import { satCatalogsService } from '../../services/satCatalogsService'

vi.mock('@lwm/auth', async () => {
  const actual = await vi.importActual<typeof import('@lwm/auth')>('@lwm/auth')
  return {
    ...actual,
    axiosClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  }
})

describe('satCatalogsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchClaveProdServ', () => {
    it('queries the endpoint with filter[search] and page[size]', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: { data: [{ clave: '10101500', descripcion: 'Animales vivos' }] }
      })

      const result = await satCatalogsService.searchClaveProdServ('animal')

      expect(axios.get).toHaveBeenCalledWith('/api/v1/sat/clave-prod-serv', {
        params: { 'filter[search]': 'animal', 'page[size]': 20 }
      })
      expect(result).toEqual([{ clave: '10101500', descripcion: 'Animales vivos' }])
    })

    it('does not call the API when the term is shorter than 2 characters', async () => {
      const result = await satCatalogsService.searchClaveProdServ('a')

      expect(axios.get).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it('trims the term before checking the minimum length', async () => {
      const result = await satCatalogsService.searchClaveProdServ('  a ')

      expect(axios.get).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it('returns an empty array when the response has no data', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: {} })

      const result = await satCatalogsService.searchClaveProdServ('animal')

      expect(result).toEqual([])
    })
  })

  describe('searchClaveUnidad', () => {
    it('queries the endpoint with filter[search] only (no pagination)', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: { data: [{ clave: 'H87', nombre: 'Pieza' }] }
      })

      const result = await satCatalogsService.searchClaveUnidad('pieza')

      expect(axios.get).toHaveBeenCalledWith('/api/v1/sat/clave-unidad', {
        params: { 'filter[search]': 'pieza' }
      })
      expect(result).toEqual([{ clave: 'H87', nombre: 'Pieza' }])
    })

    it('does not call the API when the term is shorter than 2 characters', async () => {
      const result = await satCatalogsService.searchClaveUnidad('')

      expect(axios.get).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })
  })
})
