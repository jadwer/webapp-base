/**
 * invoice-series contra InvoiceSeriesRequest: atributos camelCase y
 * companySetting como relacion; initialize-defaults responde objetos planos.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axiosClient from '../../lib/axiosClient'
import { invoiceSeriesService } from '../../services/invoiceSeriesService'

vi.mock('../../lib/axiosClient')

const resource = {
  type: 'invoice-series',
  id: '4',
  attributes: { code: 'FAC', name: 'Facturas', cfdiType: 'I', currentFolio: 10, isDefault: true },
}

describe('invoiceSeriesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('create manda llaves camelCase y la relacion companySetting', async () => {
    vi.mocked(axiosClient.post).mockResolvedValue({ data: { data: resource } })

    await invoiceSeriesService.create({
      code: 'FAC',
      name: 'Facturas',
      cfdiType: 'I',
      folioPadding: 6,
      isDefault: true,
      companySettingId: '3',
    })

    expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/invoice-series', {
      data: {
        type: 'invoice-series',
        attributes: { code: 'FAC', name: 'Facturas', cfdiType: 'I', folioPadding: 6, isDefault: true },
        relationships: { companySetting: { data: { type: 'company-settings', id: '3' } } },
      },
    })
  })

  it('update manda llaves camelCase', async () => {
    vi.mocked(axiosClient.patch).mockResolvedValue({ data: { data: resource } })

    await invoiceSeriesService.update('4', { name: 'Facturas web', resetYearly: true, description: undefined })

    expect(axiosClient.patch).toHaveBeenCalledWith('/api/v1/invoice-series/4', {
      data: { type: 'invoice-series', id: '4', attributes: { name: 'Facturas web', resetYearly: true } },
    })
  })

  it('getById lee atributos camelCase', async () => {
    vi.mocked(axiosClient.get).mockResolvedValue({ data: { data: resource } })

    const series = await invoiceSeriesService.getById('4')

    expect(series).toMatchObject({ id: '4', code: 'FAC', cfdiType: 'I', currentFolio: 10, isDefault: true })
  })

  it('initializeDefaults acepta los objetos planos snake_case del endpoint propio', async () => {
    vi.mocked(axiosClient.post).mockResolvedValue({
      data: {
        message: 'Series inicializadas correctamente',
        data: [{ id: 1, code: 'FAC', name: 'Facturas', cfdi_type: 'I', is_default: true }],
      },
    })

    const result = await invoiceSeriesService.initializeDefaults('3')

    expect(axiosClient.post).toHaveBeenCalledWith('/api/v1/invoice-series/initialize-defaults', {
      company_setting_id: '3',
    })
    expect(result.series[0]).toMatchObject({ id: '1', code: 'FAC', cfdiType: 'I', isDefault: true })
  })
})
