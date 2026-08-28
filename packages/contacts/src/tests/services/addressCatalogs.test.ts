/**
 * Tests del service de catalogos de domicilio SAT (lookup por CP y cascada).
 * Regla verificada: el catalogo asiste, no bloquea (404/422 -> null, jamas throw).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const getMock = vi.fn()

vi.mock('@lwm/auth', () => ({
  axiosClient: {
    get: (...args: unknown[]) => getMock(...args),
  },
}))

import { addressCatalogsService } from '../../services/addressCatalogs'

describe('addressCatalogsService', () => {
  beforeEach(() => {
    getMock.mockReset()
  })

  it('lookupPostalCode devuelve estado, municipio y colonias', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        data: {
          codigoPostal: '06600',
          estadoClave: 'CMX',
          estado: 'Ciudad de México',
          municipioClave: '015',
          municipio: 'Cuauhtémoc',
          colonias: [{ clave: '0930', nombre: 'Juárez' }],
        },
      },
    })

    const info = await addressCatalogsService.lookupPostalCode('06600')

    expect(getMock).toHaveBeenCalledWith('/api/v1/sat/address/postal-codes/06600')
    expect(info?.estado).toBe('Ciudad de México')
    expect(info?.municipio).toBe('Cuauhtémoc')
    expect(info?.colonias).toHaveLength(1)
  })

  it('lookupPostalCode devuelve null en 404 (CP fuera de catalogo, captura manual)', async () => {
    getMock.mockRejectedValueOnce({ response: { status: 404 } })

    const info = await addressCatalogsService.lookupPostalCode('00000')

    expect(info).toBeNull()
  })

  it('lookupPostalCode devuelve null en 422 (CP mal formado)', async () => {
    getMock.mockRejectedValueOnce({ response: { status: 422 } })

    expect(await addressCatalogsService.lookupPostalCode('ABC')).toBeNull()
  })

  it('lookupPostalCode propaga errores que NO son 404/422 (red, 500)', async () => {
    getMock.mockRejectedValueOnce({ response: { status: 500 } })

    await expect(addressCatalogsService.lookupPostalCode('06600')).rejects.toBeTruthy()
  })

  it('getEstados y getMunicipios usan los endpoints de cascada', async () => {
    getMock.mockResolvedValueOnce({ data: { data: [{ clave: 'NLE', nombre: 'Nuevo León' }] } })
    const estados = await addressCatalogsService.getEstados()
    expect(getMock).toHaveBeenCalledWith('/api/v1/sat/address/estados')
    expect(estados[0].clave).toBe('NLE')

    getMock.mockResolvedValueOnce({ data: { data: [{ clave: '039', nombre: 'Monterrey' }] } })
    const municipios = await addressCatalogsService.getMunicipios('NLE')
    expect(getMock).toHaveBeenCalledWith('/api/v1/sat/address/estados/NLE/municipios')
    expect(municipios[0].nombre).toBe('Monterrey')
  })
})
