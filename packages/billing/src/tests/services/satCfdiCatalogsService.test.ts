/**
 * Billing Module - Catalogos SAT del formulario CFDI (regla 7: fuente = backend)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axiosClient from '../../lib/axiosClient'
import {
  satCfdiCatalogsService,
  FALLBACK_USOS_CFDI,
  FALLBACK_FORMAS_PAGO,
} from '../../services/satCfdiCatalogsService'

vi.mock('../../lib/axiosClient')

const mockedAxios = vi.mocked(axiosClient, true)

describe('satCfdiCatalogsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lee uso CFDI y regimen fiscal del endpoint de catalogos de contactos', async () => {
    const payload = {
      regimenes_fiscales: [{ code: '601', label: 'General de Ley Personas Morales' }],
      usos_cfdi: [{ code: 'G03', label: 'Gastos en general' }],
      classifications: [],
    }
    mockedAxios.get.mockResolvedValue({ data: { data: payload } })

    const result = await satCfdiCatalogsService.getContactCatalogs()

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/contact-catalogs')
    expect(result.usos_cfdi).toEqual(payload.usos_cfdi)
  })

  it('lee forma de pago del catalogo SAT y la normaliza a code/label', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { data: [{ clave: '03', descripcion: 'Transferencia electrónica de fondos' }] },
    })

    const result = await satCfdiCatalogsService.getFormasPago()

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/sat/forma-pago')
    expect(result).toEqual([{ code: '03', label: 'Transferencia electrónica de fondos' }])
  })

  it('el respaldo estatico no ofrece P01 (no existe en CFDI 4.0)', () => {
    expect(FALLBACK_USOS_CFDI.map(o => o.code)).not.toContain('P01')
    expect(FALLBACK_FORMAS_PAGO.every(o => o.code.length === 2)).toBe(true)
  })
})
